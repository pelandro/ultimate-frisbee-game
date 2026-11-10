#!/usr/bin/env node
/* Pull request da riga di comando, in modo che funzioni ovunque giri Claude Code: sul computer e nelle sessioni cloud
   (dove i comandi «gh pr ...» non sono disponibili e si usa l'API REST di GitHub attraverso «gh api»).
   Uso:
     node tools/pr.js apri "Titolo" [--corpo file.md]   apre (o ritrova) la pull request del ramo attuale verso main
     node tools/pr.js elenco                              pull request aperte
     node tools/pr.js stato <numero>                      si puo' unire? esito della verifica
     node tools/pr.js attendi <numero>                    aspetta la fine della verifica (fino a 12 minuti)
     node tools/pr.js unisci <numero>                     unione automatica quando la verifica e' verde; se non e' disponibile, unisce subito solo se e' gia' verde */
const {execFileSync}=require('child_process'),fs=require('fs');
const run=(cmd,args,input)=>execFileSync(cmd,args,{encoding:'utf8',input,stdio:['pipe','pipe','pipe'],maxBuffer:32*1024*1024});
const fail=m=>{console.error(m);process.exit(1);};
const url=(()=>{try{return run('git',['remote','get-url','origin']).trim();}catch(e){fail('Nessun repository remoto (origin).');}})();
const m=url.match(/[:\/]([^\/:]+)\/([^\/]+?)(?:\.git)?\/?$/);if(!m)fail('Non riconosco proprietario e nome del repository in: '+url);
const OWNER=m[1],R=`repos/${m[1]}/${m[2]}`;
function api(method,path,body){
  const a=['api','-X',method,path];if(body)a.push('--input','-');
  try{const out=run('gh',a,body?JSON.stringify(body):undefined);return out.trim()?JSON.parse(out):null;}
  catch(e){const t=((e.stdout||'')+' '+(e.stderr||'')).trim();const err=new Error(t||e.message);try{err.gh=JSON.parse((e.stdout||'').trim().split('\n')[0]);}catch(_){}throw err;}
}
const branch=()=>run('git',['symbolic-ref','--short','HEAD']).trim();
function checks(sha){   // esito della verifica su quel commit: 'verde', 'rossa', 'in corso' oppure 'assente'
  const cr=(api('GET',`${R}/commits/${sha}/check-runs`)||{}).check_runs||[];
  if(!cr.length)return {state:'assente',list:[]};
  const list=cr.map(c=>`${c.name}: ${c.status==='completed'?c.conclusion:'in corso'}`);
  if(cr.some(c=>c.status!=='completed'))return {state:'in corso',list};
  return {state:cr.every(c=>['success','neutral','skipped'].includes(c.conclusion))?'verde':'rossa',list};
}
const [cmd,...rest]=process.argv.slice(2);
try{
  if(cmd==='apri'){
    const b=branch();if(b==='main')fail('Sei su main: la pull request si apre da un ramo di lavoro.');
    const title=rest.find(x=>!x.startsWith('--'))||b,ci=rest.indexOf('--corpo'),body=ci>=0&&rest[ci+1]?fs.readFileSync(rest[ci+1],'utf8'):'';
    const open=api('GET',`${R}/pulls?state=open&head=${OWNER}:${encodeURIComponent(b)}`)||[];
    const pr=open[0]||api('POST',`${R}/pulls`,{title,head:b,base:'main',body});
    console.log(`${open[0]?'Pull request già aperta':'Pull request aperta'}: #${pr.number} ${pr.html_url}`);
  }else if(cmd==='elenco'){
    const l=api('GET',`${R}/pulls?state=open&per_page=50`)||[];
    if(!l.length)console.log('Nessuna pull request aperta.');
    for(const p of l)console.log(`#${p.number} ${p.title} — ramo ${p.head.ref}, di ${p.user.login}, ${p.created_at.slice(0,10)} ${p.html_url}`);
  }else if(cmd==='stato'||cmd==='attendi'||cmd==='unisci'){
    const n=+rest[0];if(!n)fail('Indica il numero della pull request.');
    let pr=api('GET',`${R}/pulls/${n}`),ck=checks(pr.head.sha);
    if(cmd==='attendi'){
      const t0=Date.now();
      while((ck.state==='in corso'||ck.state==='assente')&&Date.now()-t0<12*60*1000){execFileSync(process.execPath,['-e','setTimeout(()=>{},15000)']);pr=api('GET',`${R}/pulls/${n}`);ck=checks(pr.head.sha);}
    }
    if(cmd!=='unisci'){
      console.log(`#${n} ${pr.title} — ${pr.state}${pr.merged?' (unita)':''} · ramo ${pr.head.ref} · conflitti con main: ${pr.mergeable===false?'SÌ':(pr.mergeable===null?'in calcolo':'no')} · verifica: ${ck.state}`);
      for(const x of ck.list)console.log('   '+x);
      process.exit(ck.state==='rossa'?2:0);
    }
    if(pr.merged){console.log(`#${n} è già stata unita.`);process.exit(0);}
    // 1) sul computer: unione automatica di GitHub; 2) nelle sessioni cloud: la via dedicata; 3) altrimenti unisce subito, ma solo se la verifica è già verde
    let done='';
    try{run('gh',['pr','merge',String(n),'--auto','--squash','--delete-branch']);done='Unione automatica attivata: entra in main quando la verifica è verde.';}catch(e){}
    if(!done){try{api('PUT',`${R}/pulls/${n}/ccr/auto_merge`,{merge_method:'squash'});done='Unione automatica attivata: entra in main quando la verifica è verde.';}catch(e){}}
    if(!done){
      if(pr.mergeable===false)fail(`#${n} è in conflitto con main: sincronizza il ramo (/sincronizza) e riprova.`);
      if(ck.state!=='verde'){console.log(`Unione automatica non disponibile su questo repository e verifica ${ck.state}: riprova con «node tools/pr.js attendi ${n}» e poi «node tools/pr.js unisci ${n}».`);process.exit(3);}
      api('PUT',`${R}/pulls/${n}/merge`,{merge_method:'squash',commit_title:`${pr.title} (#${n})`});
      try{api('DELETE',`${R}/git/refs/heads/${pr.head.ref}`);}catch(e){}
      done=`#${n} unita in main (verifica verde).`;
    }
    console.log(done);
  }else fail('Uso: node tools/pr.js apri "Titolo" [--corpo file] | elenco | stato <n> | attendi <n> | unisci <n>');
}catch(e){fail('GitHub ha risposto con un errore: '+e.message.slice(0,400));}
