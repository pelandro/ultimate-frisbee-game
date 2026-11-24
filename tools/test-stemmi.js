#!/usr/bin/env node
/* Contratto della stessa identita' in HTML/canvas, incluse seconde formazioni e salvataggi preesistenti. */
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),vm=require('vm');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const rows=JSON.parse(read('docs/squadre-sigle.json')),ctx={globalAlpha:.8,fillStyle:'',calls:[],save(){this.saved=this.globalAlpha;},restore(){this.globalAlpha=this.saved;},fillRect(...r){this.calls.push(r);}};
const literal=(p,n)=>{const s=read(p).split('const '+n+'=')[1].split(';')[0];return new Function('return ('+s+')')();};
const it=literal('src/30-js/30-carriera/01-salvataggio-squadre.js','SERIES_RAW'),eu=literal('src/30-js/37-leghe/00-dati-club.js','LN_CL'),us=literal('src/30-js/35-usa/01-club-usa.js','US_RAW'),norm=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(),count={};
for(const ns of Object.values(it))for(const n of ns)count[norm(n)]=(count[norm(n)]||0)+1;
const names=[];for(const [sr,ns] of Object.entries(it))for(const n of ns)names.push(n.trim()+(count[norm(n)]>1?' ('+sr+')':''));
const women=new Function('const LN_CL={};'+read('src/30-js/37-leghe/00-dati-women.js').split('LN_PL.IW=')[0]+'return LN_CL.IW;')();
const usWomen=literal('src/30-js/35-usa/00-dati-women.js','UW_CLUBS');
for(const [n] of women.concat(usWomen))names.push(n);
for(const ns of Object.values(eu))for(const [n] of ns)names.push(n);for(const [n] of us)names.push(n);
assert.deepEqual(rows.map(r=>r.name).sort(),names.sort(),'il censimento delle sigle deve coprire i club reali di tutte le categorie');
const box={ctx};vm.createContext(box);
vm.runInContext(read('src/30-js/20-ui/02a-stemmi-dati.js')+read('src/30-js/20-ui/02b-identita-club.js')+'\nthis.api={clubKey,clubAbbr,clubIcon,clubSVG,clubCrest,clubDraw,CLUB_MARK,CLUB_ART};',box);
const a=box.api;let n=0;
assert.equal(rows.length,319);const seen={};
for(const r of rows){
 assert.equal(a.clubAbbr(r.name),r.abbr);assert.match(r.abbr,/^[A-Z0-9]{2,4}$/);
 assert.equal(a.CLUB_MARK[a.clubKey(r.name)]||null,r.mark,r.name);
 const set=seen[r.country]||(seen[r.country]=new Set());assert(!set.has(r.abbr),`${r.country}: doppia sigla ${r.abbr}`);set.add(r.abbr);
 const art=a.clubIcon(r.name);assert.equal(art.r.length,art.p.length);assert.match(a.clubCrest(r.name,22),/class="crest crest-art"/);assert(!/linear-gradient|<img/.test(a.clubCrest(r.name,22)));n++;
}
for(const [id,art] of Object.entries(a.CLUB_ART)){
 assert(art.n>=16&&art.n<=64);for(const col of art.p)assert.match(col,/^#[a-f0-9]{6}$/i);
 for(const runs of art.r){assert.equal(runs.length%3,0);for(let i=0;i<runs.length;i+=3){let [x,y,w]=runs.slice(i,i+3);assert(x>=0&&y>=0&&w>0&&x+w<=art.n&&y<art.n,`${id}: corsa fuori griglia`);}}
}
assert.equal(a.CLUB_MARK[a.clubKey('BFD La Fotta Offence')],'la-fotta');assert.equal(a.CLUB_MARK[a.clubKey('BFD La Fotta Defense')],'la-fotta');assert.notEqual(a.CLUB_MARK[a.clubKey('BFD Redbulls')],'la-fotta');
assert.strictEqual(a.clubIcon('CUS Padova Barbastreji'),a.clubIcon('CUS Padova Barbados'));assert.notStrictEqual(a.clubIcon('CUS Padova Barbastreji'),a.clubIcon('CUS BERGAMO'));
assert.equal(a.clubAbbr('CUS Padova Barbastreji'),'BAR');assert.equal(a.clubAbbr('CUS Padova Barbados'),'BBD');assert.equal(a.clubAbbr('CUS Padova Barbafighto'),'BFT');assert.equal(a.clubAbbr('  FRÜHSPORT 02  '),'F02');assert.equal(a.clubAbbr('Gentle Rockets'),'RKT');assert.equal(a.clubAbbr('Jetset Zeppelins'),'ZEP');
assert.match(a.clubCrest('<svg onload="x">',24),/aria-label="&lt;svg onload=&quot;x&quot;&gt;"/);
assert.equal(a.clubAbbr('CUS Padova Tane Malefiche'),'TAM');assert.equal(a.clubAbbr('AUT FireFlies'),'FFL');
assert.strictEqual(a.clubIcon('CUS Padova Tane Malefiche'),a.clubIcon('CUS Padova Barbastreji'));
assert.strictEqual(a.clubIcon('BFD Cheetahs'),a.clubIcon('BFD Redbulls'));
assert.notStrictEqual(a.clubIcon('BFD Shout'),a.clubIcon('BFD Cheetahs'));
assert.notDeepEqual(a.clubIcon('Tequila Boom Boom'),a.clubIcon('Tequila Junior'));
for(const n of ['Tequila Boom Boom','Tequila Junior'])assert(a.clubIcon(n).p.includes('#111217'),n+': manca il nero della bomba');
for(const [n] of women.filter(([,tier])=>tier==='A'))assert(a.CLUB_ART[a.CLUB_MARK[a.clubKey(n)]],n+': manca lo stemma di Serie A');
const uwFallback=new Set(['Komodos','Takedown','Magma','Omega Continuum','River Monsters']);
for(const [n] of usWomen)assert.equal(Boolean(a.CLUB_ART[a.CLUB_MARK[a.clubKey(n)]]),!uwFallback.has(n),n);
assert.equal(a.clubAbbr('constructor'),'CON');assert.match(a.clubCrest('constructor',22),/<svg/);
a.clubDraw(50,60,45,'BFD La Fotta Offence',.3);assert(ctx.calls.length>0);assert.equal(ctx.globalAlpha,.8);
for(const r of ctx.calls){assert(r.every(Number.isInteger),'coordinate canvas intere');assert(r[2]>0&&r[3]>0);assert(r[0]>=27&&r[0]+r[2]<=73&&r[1]>=37&&r[1]+r[3]<=83);}
ctx.calls=[];a.clubDraw(0,0,5,'Clapham Ultimate',1);assert(ctx.calls.length>0);assert.equal(a.clubAbbr('La mia squadra nuova'),'MSN');
console.log(`Stemmi e sigle: ${n} squadre, ${Object.keys(a.CLUB_ART).length} griglie; HTML/canvas, alias, categorie minori e vecchi nomi: ok.`);
