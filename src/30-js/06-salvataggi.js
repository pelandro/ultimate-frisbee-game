/* Un solo setItem conferma insieme i dati di una stessa operazione.
   Le chiavi delle vecchie versioni restano leggibili finché ciascun dato
   non viene scritto nel nuovo contenitore. null rappresenta una rimozione. */
const SAVE_STORE_KEY='ultimate-salvataggi-v1';
const saveStore=(()=>{
  let lastRaw,lastEntries;
  function read(){
    const raw=localStorage.getItem(SAVE_STORE_KEY);
    if(raw===lastRaw&&lastEntries)return lastEntries;
    const entries=raw===null?{}:JSON.parse(raw);
    if(!entries||typeof entries!=='object'||Array.isArray(entries))
      throw new Error('Contenitore dei salvataggi non valido');
    lastRaw=raw;lastEntries=entries;
    return entries;
  }
  function getItem(key){
    const entries=read();
    if(!Object.hasOwn(entries,key))return localStorage.getItem(key);
    const value=entries[key];
    return value&&typeof value==='object'?entries[value.slot]??null:value;
  }
  function commit(entries){
    const next={...read(),...entries},raw=JSON.stringify(next);
    localStorage.setItem(SAVE_STORE_KEY,raw);
    lastRaw=raw;lastEntries=next;
  }
  return {
    getItem,commit,
    setItem:(key,value)=>commit({[key]:value}),
    removeItem:key=>commit({[key]:null})
  };
})();
