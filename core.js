import {items, stories, destinations} from './data.js';
import {worlds,daylights,weathers} from './scenery.js';
const validWorld=p=>[['world',worlds],['daylight',daylights],['weather',weathers]].every(([key,values])=>p[key]===undefined||Object.hasOwn(values,p[key]));
export const kinds={bear:'Bär',fox:'Fuchs',rabbit:'Hase',spirit:'Waldgeist'};
export const themes={rose:'Rosenzauber',moss:'Mooslicht',lavender:'Lavendeltraum',sky:'Wolkenblau'};
export const colors={pink:'Rosa',honey:'Honig',cream:'Vanille',mint:'Minze',lavender:'Flieder',cocoa:'Kakao'};
export const categories={care:'Für mich',movement:'Bewegung',home:'Zuhause',connection:'Verbundenheit',growth:'Entwicklung'};
export const slots={head:'Kopf',neck:'Accessoire',outfit:'Kleidung',wall:'Wand',floor:'Teppich',bed:'Kissen',plant:'Pflanze',lamp:'Licht',ornament:'Dekoration'};
export const rules={once:'Einmalig',daily:'Täglich',weekly:'Wöchentlich',weekdays:'An Wochentagen'};
export const day=(time=Date.now())=>{let d=new Date(time);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export const dateOf=k=>{if(typeof k!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(k))return null;let d=new Date(k+'T12:00:00');return !isNaN(d)&&day(d)===k?d:null};
export const shift=(key,n)=>{let d=dateOf(key);d.setDate(d.getDate()+n);return day(d)};
export const level=s=>Math.floor(s.xp/100)+1;
export const stage=s=>level(s)>=12?'Erwachsen':level(s)>=5?'Heranwachsend':'Jungtier';
export const uid=()=>crypto.randomUUID();
const need=(ok,msg)=>{if(!ok)throw Error(msg)};
const text=(v,max=140)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
const enumIs=(e,v)=>Object.hasOwn(e,v);
export function fresh(now=Date.now()) {return {version:1,revision:0,createdAt:now,profile:{userName:'',petName:'Momo',kind:'bear',color:'pink',pattern:'heart',theme:'rose',appearance:'system',onboarded:false},xp:0,coins:0,energy:0,tasks:[],occurrences:[],ledger:[],adventures:[],owned:[],equipped:{},moods:[],journals:[],sessions:[],goals:[],lastDay:null}}
export const due=(t,k)=>!t.archived&&!t.paused&&k>=t.startsOn&&(t.rule==='daily'||(t.rule==='once'?k===t.startsOn:t.weekdays.includes(dateOf(k).getDay())));
export function materialize(s,now=Date.now()) {
 if(!s.profile.onboarded)return;
 const today=day(now);let k=s.lastDay||day(s.createdAt);if(k>today)k=today;
 const ids=new Set(s.occurrences.map(o=>o.id));
 for(;k<=today;k=shift(k,1))for(const t of s.tasks)if(due(t,k)) {
  const id=t.id+':'+k;if(!ids.has(id)){s.occurrences.push({id,taskID:t.id,day:k,title:t.title,category:t.category,priority:t.priority,time:t.time,done:false});ids.add(id)}
 }
 s.lastDay=s.lastDay&&s.lastDay>today?s.lastDay:today;
}
export function grant(s,id,xp,coins,energy,now,label) {
 if(s.ledger.some(e=>e.id===id))return false;
 energy=Math.min(60-s.energy,energy);s.xp+=xp;s.coins+=coins;s.energy+=energy;
 s.ledger.push({id,date:now,xp,coins,energy,label});return true;
}
const activity=(s,kind,now)=>grant(s,`activity:${kind}:${day(now)}`,5,3,5,now,'Zeit für mich');
export function act(s,a,now=Date.now()) {
 materialize(s,now);let message='Gespeichert';
 switch(a.type) {
 case 'profile': {
  const p={...s.profile,...a.profile};need(text(p.petName,30),'Bitte gib einen Namen mit 1–30 Zeichen ein.');need(typeof p.userName==='string'&&p.userName.length<=40,'Dein Name darf höchstens 40 Zeichen haben.');
  need(enumIs(kinds,p.kind)&&enumIs(colors,p.color)&&enumIs(themes,p.theme)&&['plain','heart','freckles'].includes(p.pattern)&&['system','light','dark'].includes(p.appearance),'Diese Gestaltung ist ungültig.');
  need(validWorld(p),'Bitte wähle eine gültige Umgebung, Tageszeit und Atmosphäre.');s.profile={...p,onboarded:s.profile.onboarded};message='Dein Zuhause hat einen neuen Look.';break;
 }
 case 'onboard': {
  if(s.profile.onboarded)break;act(s,{type:'profile',profile:a.profile},now);s.profile.onboarded=true;s.createdAt=now;
  for(const item of items.filter(i=>i.price===0)){s.owned.push(item.id);s.equipped[item.slot]=item.id}
  for(const title of ['Ein Glas Wasser trinken','Einen Moment durchatmen','Etwas Freundliches für mich tun'])act(s,{type:'task-save',task:{id:uid(),title,category:'care',rule:'daily',weekdays:[1],startsOn:day(now),priority:1,time:'',reminder:false,paused:false,archived:false}},now);
  materialize(s,now);message='Willkommen in eurem kleinen Zuhause.';break;
 }
 case 'task-save': {
  let t=structuredClone(a.task);need(text(t.title),'Dein Aufgabentitel braucht 1–140 Zeichen.');t.title=t.title.trim();need(enumIs(categories,t.category)&&enumIs(rules,t.rule)&&dateOf(t.startsOn),'Bitte prüfe Kategorie, Datum und Wiederholung.');
  need(integer(t.priority,0,2)&&Array.isArray(t.weekdays)&&t.weekdays.every(d=>integer(d,0,6)),'Die Planung ist ungültig.');
  need(!['weekly','weekdays'].includes(t.rule)||(t.weekdays.length>0&&(t.rule!=='weekly'||t.weekdays.length===1)),'Wähle die passenden Wochentage.');
  need(t.time===''||/^([01]\d|2[0-3]):[0-5]\d$/.test(t.time),'Die Uhrzeit ist ungültig.');
  t.id=t.id||uid();t.paused=!!t.paused;t.archived=!!t.archived;t.reminder=!!t.reminder&&!!t.time;
  let i=s.tasks.findIndex(x=>x.id===t.id);if(i<0)s.tasks.push(t);else s.tasks[i]=t;
  const rewards=new Set(s.ledger.map(e=>e.id));s.occurrences=s.occurrences.filter(o=>!(o.taskID===t.id&&o.day===day(now)&&!o.done&&!rewards.has('task:'+o.id)));
  materialize(s,now);message='Dein kleiner Schritt ist gespeichert.';break;
 }
 case 'task-toggle': {
  let o=s.occurrences.find(o=>o.id===a.id);need(o&&o.day<=day(now),'Diese Aufgabe ist noch nicht fällig.');o.done=!o.done;
  message=o.done?'Ein kleiner Schritt für dich.':'Abschluss rückgängig gemacht.';
  if(o.done&&o.day===day(now)&&grant(s,'task:'+o.id,10,5,10,now,'Aufgabe erledigt'))message='+10 XP · +5 Münzen · neue Energie';break;
 }
 case 'buy': {
  const i=items.find(i=>i.id===a.id);need(i,'Gegenstand nicht gefunden.');need(!s.owned.includes(i.id),'Der Gegenstand gehört dir bereits.');need(level(s)>=i.level,`Ab Level ${i.level} verfügbar.`);need(s.coins>=i.price,'Dafür fehlen noch ein paar Münzen.');
  s.coins-=i.price;s.owned.push(i.id);s.ledger.push({id:'purchase:'+i.id,date:now,xp:0,coins:-i.price,energy:0,label:i.name});message='Ein neues Lieblingsstück gehört dir.';break;
 }
 case 'equip': {const i=items.find(i=>i.id===a.id);need(i&&s.owned.includes(i.id),'Dieser Gegenstand gehört dir noch nicht.');s.equipped[i.slot]=i.id;message='So gemütlich!';break}
 case 'unequip':need(['head','neck','outfit'].includes(a.slot),'Dieser Platz lässt sich nicht leeren.');delete s.equipped[a.slot];break;
 case 'travel-start': {
  need(!s.adventures.some(t=>!t.claimed),'Dein Begleiter ist noch unterwegs.');need(!s.adventures.some(t=>t.day===day(now)),'Morgen wartet eure nächste Reise.');
  const d=destinations.find(d=>d.id===a.destination);need(d&&level(s)>=d.level,'Dieser Ort ist noch nicht freigeschaltet.');need(s.energy>=30,'Für eine Reise brauchst du 30 Energie.');
  let all=stories.filter(t=>t.destination===d.id),pool=all.filter(t=>!s.adventures.some(x=>x.story===t.id));if(!pool.length)pool=all;
  const story=pool[Math.abs(a.random??Math.floor(Math.random()*100000))%pool.length],id=uid();s.energy-=30;
  s.adventures.push({id,day:day(now),destination:d.id,story:story.id,start:now,end:now+(s.adventures.length?1200000:60000),claimed:false,choice:null});
  s.ledger.push({id:'travel:'+id,date:now,xp:0,coins:0,energy:-30,label:'Reise begonnen'});message='Eine kleine Welt wartet auf euch.';break;
 }
 case 'travel-claim': {
  const t=s.adventures.find(t=>t.id===a.id);need(t,'Reise nicht gefunden.');if(t.claimed)break;need(now>=t.end,'Dein Begleiter ist noch unterwegs.');need(integer(a.choice,0,1),'Wähle eine Antwort.');t.choice=a.choice;t.claimed=true;grant(s,'travel-reward:'+t.id,30,20,0,now,'Neue Entdeckung');message='+30 XP · +20 Münzen · eine neue Erinnerung';break;
 }
 case 'mood': {
  need(integer(a.value,1,5)&&Array.isArray(a.emotions)&&a.emotions.every(x=>typeof x==='string'&&x.length<40),'Wähle deine Stimmung.');const m={id:uid(),day:day(now),date:now,value:a.value,emotions:a.emotions};let i=s.moods.findIndex(m=>m.day===day(now));if(i<0)s.moods.push(m);else s.moods[i]=m;activity(s,'mood',now);message='Danke, dass du dir zugehört hast.';break;
 }
 case 'journal-save': {
  const e={...a.entry};need(text(e.text,20000),'Dein Eintrag braucht 1–20.000 Zeichen.');need(['journal','gratitude','reflection'].includes(e.kind),'Wähle eine Eintragsart.');e.text=e.text.trim();let i=s.journals.findIndex(x=>x.id===e.id);
  if(i<0){e.id=uid();e.date=now;e.day=day(now);s.journals.push(e);activity(s,'journal',now)}else{s.journals[i]={...s.journals[i],text:e.text,kind:e.kind,prompt:String(e.prompt||'').slice(0,500)}}message='Deine Gedanken sind sicher gespeichert.';break;
 }
 case 'journal-delete':s.journals=s.journals.filter(e=>e.id!==a.id);message='Eintrag gelöscht.';break;
 case 'session-start':need(['focus','breathing'].includes(a.kind)&&integer(a.seconds,10,3600),'Die Übungsdauer ist ungültig.');need(!s.sessions.some(t=>t.kind===a.kind&&!t.finished),'Beende zuerst deine laufende Übung.');s.sessions.push({id:uid(),kind:a.kind,duration:a.seconds*1000,start:now,end:now+a.seconds*1000,remaining:null,finished:false});break;
 case 'session-pause': {const t=s.sessions.find(t=>t.id===a.id&&!t.finished);need(t,'Übung nicht gefunden.');if(t.remaining===null)t.remaining=Math.max(0,t.end-now);break}
 case 'session-resume': {const t=s.sessions.find(t=>t.id===a.id&&!t.finished);need(t,'Übung nicht gefunden.');if(t.remaining!==null){t.end=now+t.remaining;t.remaining=null}break}
 case 'session-finish': {const t=s.sessions.find(t=>t.id===a.id);need(t,'Übung nicht gefunden.');if(t.finished)break;need((t.remaining??t.end-now)<=0,'Deine Übung läuft noch.');t.finished=true;activity(s,t.kind,now);message='Schön, dass du dir Zeit genommen hast.';break}
 case 'session-cancel':s.sessions=s.sessions.filter(t=>t.id!==a.id);message='Dein Begleiter freut sich auch über eine kurze Pause.';break;
 case 'relax':activity(s,'relaxation',now);message='Ein kleiner Moment zum Durchatmen.';break;
 case 'goal-save': {let g={...a.goal};need(text(g.title,100)&&enumIs(categories,g.category)&&integer(g.target,1,50),'Bitte prüfe Titel, Kategorie und Wochenziel.');let i=s.goals.findIndex(x=>x.id===g.id);g.id=g.id||uid();g.title=g.title.trim();if(i<0)s.goals.push(g);else s.goals[i]=g;break}
 case 'goal-delete':s.goals=s.goals.filter(g=>g.id!==a.id);break;
 case 'refresh':break;
 case 'recover':for(const t of s.sessions)if(t.kind==='breathing'&&!t.finished&&t.remaining===null)t.remaining=t.duration;break;
 case 'reset':return {state:fresh(now),message:'Ein neues Zuhause wartet auf dich.'};
 default:throw Error('Diese Aktion ist nicht bekannt.');
 }
 return {state:s,message};
}
export function validate(s) {
 need(!s?.profile||validWorld(s.profile),'Ungültige Umgebung in der Sicherung.');
 need(s&&s.version===1&&s.profile,'Diese Sicherung ist keine unterstützte Mooslicht-Web-Sicherung.');
 need(integer(s.revision,0,Number.MAX_SAFE_INTEGER)&&Number.isFinite(s.createdAt)&&s.createdAt>0,'Ungültiger Speicherstand.');
 const p=s.profile;need(typeof p.onboarded==='boolean'&&typeof p.userName==='string'&&p.userName.length<=40&&text(p.petName,30)&&enumIs(kinds,p.kind)&&enumIs(colors,p.color)&&enumIs(themes,p.theme)&&['plain','heart','freckles'].includes(p.pattern)&&['system','light','dark'].includes(p.appearance),'Ungültiges Haustierprofil.');
 need(integer(s.xp,0,1e9)&&integer(s.coins,0,1e9)&&integer(s.energy,0,60),'Ungültige Spielwerte.');
 for(const key of ['tasks','occurrences','ledger','adventures','owned','moods','journals','sessions','goals'])need(Array.isArray(s[key])&&s[key].length<=100000,'Unvollständige oder zu große Sicherung.');
 for(const key of ['tasks','occurrences','ledger','adventures','moods','journals','sessions','goals']){const ids=s[key].map(x=>x?.id);need(ids.every(x=>typeof x==='string'&&/^[a-zA-Z0-9:_-]{1,199}$/.test(x))&&new Set(ids).size===ids.length,'Doppelte oder ungültige Einträge.');}
 need(new Set(s.owned).size===s.owned.length&&s.owned.every(id=>items.some(i=>i.id===id)),'Ungültiges Inventar.');
 need(s.equipped&&typeof s.equipped==='object'&&!Array.isArray(s.equipped),'Ungültige Einrichtung.');
 for(const [slot,id] of Object.entries(s.equipped))need(s.owned.includes(id)&&items.some(i=>i.id===id&&i.slot===slot),'Ein Gegenstand ist falsch zugeordnet.');
 for(const t of s.tasks)need(text(t.title)&&dateOf(t.startsOn)&&enumIs(categories,t.category)&&enumIs(rules,t.rule)&&integer(t.priority,0,2)&&Array.isArray(t.weekdays)&&t.weekdays.every(x=>integer(x,0,6))&&(!['weekly','weekdays'].includes(t.rule)||t.weekdays.length>0)&&(t.rule!=='weekly'||t.weekdays.length===1)&&typeof t.time==='string'&&(t.time===''||/^([01]\d|2[0-3]):[0-5]\d$/.test(t.time))&&['paused','archived','reminder'].every(k=>typeof t[k]==='boolean'),'Ungültige Aufgabenplanung.');
 for(const o of s.occurrences)need(s.tasks.some(t=>t.id===o.taskID)&&o.id===o.taskID+':'+o.day&&dateOf(o.day)&&text(o.title)&&enumIs(categories,o.category)&&typeof o.done==='boolean'&&integer(o.priority,0,2)&&typeof o.time==='string','Ungültige Aufgabenhistorie.');
 for(const e of s.ledger)need(Number.isFinite(e.date)&&text(e.label,200)&&[e.xp,e.coins,e.energy].every(Number.isInteger),'Ungültige Buchungen.');
 for(const t of s.adventures)need(dateOf(t.day)&&stories.some(x=>x.id===t.story&&x.destination===t.destination)&&Number.isFinite(t.start)&&Number.isFinite(t.end)&&t.end>=t.start&&typeof t.claimed==='boolean'&&(t.claimed?integer(t.choice,0,1):t.choice===null),'Ungültige Reise.');
 for(const m of s.moods)need(dateOf(m.day)&&Number.isFinite(m.date)&&integer(m.value,1,5)&&Array.isArray(m.emotions)&&m.emotions.every(e=>typeof e==='string'&&e.length<40),'Ungültige Stimmung.');
 need(new Set(s.moods.map(m=>m.day)).size===s.moods.length,'Doppelte Tagesstimmung.');
 for(const e of s.journals)need(dateOf(e.day)&&Number.isFinite(e.date)&&text(e.text,20000)&&typeof e.prompt==='string'&&e.prompt.length<=500&&['journal','gratitude','reflection'].includes(e.kind),'Ungültiger Tagebucheintrag.');
 for(const t of s.sessions)need(['focus','breathing'].includes(t.kind)&&integer(t.duration,10000,3600000)&&Number.isFinite(t.start)&&Number.isFinite(t.end)&&(t.remaining===null||(Number.isFinite(t.remaining)&&t.remaining>=0&&t.remaining<=t.duration))&&typeof t.finished==='boolean','Ungültige Übung.');
 for(const g of s.goals)need(text(g.title,100)&&enumIs(categories,g.category)&&integer(g.target,1,50),'Ungültiges Wochenziel.');
 need(s.lastDay===null||!!dateOf(s.lastDay),'Ungültiges Kalenderdatum.');return s;
}
export function parseBackup(raw) {
 need(typeof raw==='string'&&raw.length<15000000,'Die Sicherung ist zu groß.');let doc;try{doc=JSON.parse(raw)}catch{throw Error('Diese Datei ist keine gültige JSON-Sicherung.')}
 need(doc.format==='mooslicht-web'&&doc.version===1,'Bitte wähle eine Mooslicht-Web-Sicherung.');return validate(doc.state);
}
export const backup=s=>JSON.stringify({format:'mooslicht-web',version:1,exportedAt:new Date().toISOString(),state:s},null,2);
export function weeklyCount(s,g,now=Date.now()){let d=new Date(now);let start=shift(day(d),-((d.getDay()+6)%7));return s.occurrences.filter(o=>o.done&&o.category===g.category&&o.day>=start&&o.day<shift(start,7)).length}
export function achievements(s){return [['first','Ein erster kleiner Schritt',s.ledger.some(e=>e.id.startsWith('task:'))],['ten','Zehn Schritte für dich',s.ledger.filter(e=>e.id.startsWith('task:')).length>=10],['travel','Neugierig auf die Welt',s.adventures.some(t=>t.claimed)],['collector','Ein Zuhause mit Persönlichkeit',s.owned.length>=10],['growing','Gemeinsam gewachsen',level(s)>=5],['moods','Sieben ehrliche Momente',s.moods.length>=7]]}
