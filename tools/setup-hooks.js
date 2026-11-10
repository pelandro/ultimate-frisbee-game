#!/usr/bin/env node
/* Attiva i ganci Git del progetto (.githooks): parte da solo con «npm install». Sono la rete di sicurezza che vale anche fuori da Claude Code. */
const {execFileSync}=require('child_process'),fs=require('fs'),path=require('path');
try{
  execFileSync('git',['rev-parse','--is-inside-work-tree'],{stdio:'ignore'});
  execFileSync('git',['config','core.hooksPath','.githooks']);
  for(const f of fs.readdirSync(path.join(__dirname,'..','.githooks')))try{fs.chmodSync(path.join(__dirname,'..','.githooks',f),0o755);}catch(e){}
  console.log('Ganci Git attivati (.githooks).');
}catch(e){/* non e' un repository Git (per esempio un archivio scaricato): niente da fare */}
