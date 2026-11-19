const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/30-js/06-salvataggi.js'),'utf8');
const key='ultimate-salvataggi-v1',legacy='ultimate-prototipo-v2',slot='ultimate-carriera-1';
const entries=new Map([[legacy,'vecchia carriera'],[slot,'vecchio slot'],['ultimate-ut','vecchie carte']]);
let writes=0,fail=false;
const localStorage={
  getItem:k=>entries.get(k)??null,
  setItem(k,v){writes++;if(fail)throw new Error('QuotaExceededError');entries.set(k,v);}
};
const open=()=>vm.runInNewContext(source+'\nsaveStore',{localStorage});
const saves=open();
assert.equal(saves.getItem(legacy),'vecchia carriera');
assert.equal(saves.getItem('ultimate-ut'),'vecchie carte');
const transaction={[legacy]:{slot},[slot]:'nuova carriera',[slot+'-bak']:'vecchia carriera','ultimate-ut':'nuove carte'};
fail=true;
assert.throws(()=>saves.commit(transaction),/QuotaExceededError/);
assert.equal(entries.has(key),false);
assert.equal(saves.getItem(legacy),'vecchia carriera');
fail=false;writes=0;
saves.commit(transaction);
assert.equal(writes,1);
const reload=open();
assert.equal(reload.getItem(legacy),'nuova carriera');
assert.equal(reload.getItem(slot+'-bak'),'vecchia carriera');
assert.equal(reload.getItem('ultimate-ut'),'nuove carte');
const confirmed=entries.get(key);
fail=true;
assert.throws(()=>reload.commit({[slot]:'interrotto','ultimate-ut':'altre carte'}));
assert.equal(entries.get(key),confirmed);
assert.equal(reload.getItem(legacy),'nuova carriera');
fail=false;
reload.removeItem('ultimate-ut');
assert.equal(saves.getItem('ultimate-ut'),null);
assert.equal(entries.get('ultimate-ut'),'vecchie carte');
console.log('Salvataggi: migrazione, commit unico, quota, nuova scheda e rimozione verificati.');
