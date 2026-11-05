import {fresh,validate,act,backup,parseBackup} from './core.js';
const NAME='mooslicht-web-v1';let connection;
export function openDB(){if(connection)return Promise.resolve(connection);return new Promise((resolve,reject)=>{const request=indexedDB.open(NAME,1);request.onupgradeneeded=()=>request.result.createObjectStore('state');request.onsuccess=()=>{connection=request.result;connection.onversionchange=()=>{connection.close();connection=null};resolve(connection)};request.onerror=()=>reject(Error('Dein Browser hat den lokalen Speicher nicht geöffnet. Bitte nutze Safari ohne privaten Modus.'));request.onblocked=()=>reject(Error('Bitte schließe andere geöffnete Mooslicht-Fenster und versuche es erneut.'))})}
export async function rawState(){const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction('state').objectStore('state').get('main');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
export async function load(){const raw=await rawState();return raw===undefined?fresh():validate(raw)}
// The action executes inside a single IndexedDB read/write transaction. Tabs serialize at the database, not at the UI.
export async function transact(action,{replace}={}) {
 const db=await openDB();return new Promise((resolve,reject)=>{
  const tx=db.transaction('state','readwrite'),store=tx.objectStore('state'),get=store.get('main');let result,error;
  get.onsuccess=()=>{try{const previous=get.result;let current=previous===undefined?fresh():structuredClone(previous);
   // Explicit reset is also the recovery path for malformed data. No automatic data replacement.
   if(action.type!=='reset')validate(current);
   if(replace){result={state:validate(structuredClone(replace)),message:'Deine Sicherung ist wiederhergestellt.'}}else result=act(current,action);
   result.state.revision=(Number.isSafeInteger(previous?.revision)?previous.revision:0)+1;validate(result.state);store.put(result.state,'main');
  }catch(e){error=e;tx.abort()}};
  tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(error||Error('Der Spielstand konnte nicht gespeichert werden. Bitte sichere deine Daten und prüfe den freien Speicher.'));tx.onerror=()=>{};
 })
}
export async function restore(raw){return transact({type:'restore'},{replace:parseBackup(raw)})}
export {backup};
