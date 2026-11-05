const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const engine=process.env.MOOSLICHT_BROWSER==='webkit'?'webkit':'chromium';
const base=process.env.MOOSLICHT_URL||'http://127.0.0.1:8080/';
const cases=[];const test=(name,fn)=>cases.push([name,fn]);
const tap=async(page,name)=>page.getByRole('button',{name,exact:true}).tap();
const state=page=>page.evaluate(async()=> (await import('./storage.js')).load());
const start=async page=>{await page.goto(base);await tap(page,'Unser Zuhause öffnen');await page.getByRole('heading',{name:'Dein Tag',exact:true}).waitFor()};
const close=page=>tap(page,'Schließen');
test('Touch-Navigation, Haustier und alle fünf Interaktionen',async({page})=>{
 await start(page);for(const name of ['Reisen','Für mich','Atelier','Rückblick','Einstellungen','Zuhause']){await tap(page,name);assert.ok(await page.locator('main').count())}
 await tap(page,'Mit Momo spielen');for(const [label,action]of [['Streicheln','happy'],['Ein Beerenhäppchen','eat'],['Zusammen spielen','play'],['Schlummern','sleep'],['Eine Runde laufen','walk']]){await tap(page,label);await page.locator('#modal .pet.action-'+action).waitFor()};await close(page);
 await tap(page,'Gestalten');await tap(page,'Hase');await tap(page,'Wolkenblau');await tap(page,'Diesen Look speichern');await page.locator('#modal').waitFor({state:'hidden'});assert.equal((await state(page)).profile.kind,'rabbit');
});
test('Aufgaben per Touch anlegen, speichern, abhaken und bearbeiten',async({page})=>{
 await start(page);await tap(page,'Einen kleinen Schritt hinzufügen');await page.getByRole('textbox',{name:'Was möchtest du tun?'}).tap();await page.getByRole('textbox',{name:'Was möchtest du tun?'}).fill('Touch funktioniert');await tap(page,'Schritt speichern');await page.locator('#modal').waitFor({state:'hidden'});await tap(page,'Touch funktioniert, offen');await page.getByRole('button',{name:'Touch funktioniert, erledigt',exact:true}).waitFor();assert.equal((await state(page)).xp,10);await tap(page,'Touch funktioniert bearbeiten');await page.getByRole('textbox',{name:'Was möchtest du tun?'}).fill('Bearbeitet per Touch');await tap(page,'Schritt speichern');await page.locator('#modal').waitFor({state:'hidden'});assert.ok((await state(page)).tasks.some(t=>t.title==='Bearbeitet per Touch'));
});
test('Meldungen blockieren keine darunterliegenden Schaltflächen',async({page})=>{
 await start(page);await tap(page,'Ein Glas Wasser trinken, offen');await page.locator('#toast.visible').waitFor();assert.equal(await page.locator('#toast').evaluate(el=>getComputedStyle(el).pointerEvents),'none');
 assert.ok(await page.locator('#toast').evaluate(el=>{const r=el.getBoundingClientRect();return !el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}));await tap(page,'Einstellungen');await page.getByRole('heading',{name:'Dein Profil',exact:true}).waitFor();
});
test('Shop, Kauf, Ausrüstung und Reisen reagieren auf Touch',async({page})=>{
 await start(page);await page.evaluate(async()=>{const {load,restore,backup}=await import('./storage.js');const s=await load();s.coins=100;s.energy=60;await restore(backup(s))});await page.reload();await tap(page,'Atelier');await tap(page,'Kopf');await page.getByRole('button',{name:/Rosenschleife.*35 Münzen/}).tap();await tap(page,'Für 35 Münzen kaufen');await tap(page,'Jetzt verwenden');await page.locator('#modal').waitFor({state:'hidden'});assert.equal((await state(page)).equipped.head,'head-1');await tap(page,'Reisen');await page.getByRole('button',{name:'Auf Entdeckungsreise',exact:false}).first().tap();await page.getByText('Dein Begleiter ist unterwegs',{exact:true}).waitFor();assert.equal((await state(page)).energy,30);
});
test('Stimmung, Tagebuch, Fokus und Atemübung per Touch',async({page})=>{
 await start(page);await tap(page,'Für mich');await page.getByRole('button',{name:/Meine Stimmung festhalten/}).tap();await tap(page,'Ganz gut');await tap(page,'Für heute festhalten');await page.locator('#modal').waitFor({state:'hidden'});assert.equal((await state(page)).moods[0].value,4);
 await page.getByRole('button',{name:'Tagebuch',exact:false}).first().tap();await page.getByRole('textbox',{name:'Nur für dich'}).tap();await page.getByRole('textbox',{name:'Nur für dich'}).fill('Mein Touch-Eintrag');await tap(page,'Eintrag speichern');await page.locator('.journal-card').waitFor();assert.equal((await state(page)).journals.length,1);await close(page);
 for(const [label,kind]of [['Ruhig atmen','breathing'],['Eine Sache nach der anderen','focus']]){await page.getByRole('button',{name:new RegExp(label)}).tap();await tap(page,'Meine Zeit beginnt');await page.getByRole('button',{name:'Pause',exact:true}).waitFor();await tap(page,'Pause');await page.getByRole('button',{name:'Fortsetzen',exact:true}).waitFor();assert.ok((await state(page)).sessions.find(t=>t.kind===kind).remaining>0);await tap(page,'Fortsetzen');await tap(page,'Für heute beenden');await close(page)}
});
test('Kein Seitenzoom, Eingaben mindestens 16px und normales Scrollen erlaubt',async({page,context})=>{
 await start(page);const scale=await page.evaluate(()=>visualViewport.scale);await page.touchscreen.tap(180,75);await page.touchscreen.tap(180,75);assert.equal(await page.evaluate(()=>visualViewport.scale),scale);
 assert.ok(await page.evaluate(()=>{
  for(const type of ['gesturestart','gesturechange','gestureend'])if(document.dispatchEvent(new Event(type,{bubbles:true,cancelable:true})))return false;
  for(const type of ['touchstart','touchmove']){const single=new Event(type,{bubbles:true,cancelable:true});Object.defineProperty(single,'touches',{value:[{}]});if(!document.dispatchEvent(single))return false;const multi=new Event(type,{bubbles:true,cancelable:true});Object.defineProperty(multi,'touches',{value:[{},{}]});if(document.dispatchEvent(multi))return false;}
  return getComputedStyle(document.documentElement).touchAction==='pan-x pan-y';
 }));
 if(engine==='chromium'){
  const cdp=await context.newCDPSession(page);
  await page.evaluate(()=>{window.blockedPinchTouches=0;document.addEventListener('touchstart',e=>{if(e.isTrusted&&e.touches.length===2&&e.defaultPrevented)window.blockedPinchTouches++})});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:160,y:200,id:1},{x:200,y:200,id:2}]});
  for(let distance=30;distance<=100;distance+=10){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:180-distance,y:200,id:1},{x:180+distance,y:200,id:2}]});await page.waitForTimeout(25)}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await page.evaluate(()=>visualViewport.scale),scale);assert.ok(await page.evaluate(()=>window.blockedPinchTouches>0),'Echte Zwei-Finger-Ereignisse müssen angekommen sein');
  // Explicit touch points work in headless Chromium; synthesizeScrollGesture
  // can return successfully without dispatching a touch scroll in this runner.
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:600}]});
  for(let y=550;y>=200;y-=50){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:180,y}]});await page.waitForTimeout(25)}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForFunction(()=>scrollY>0);assert.ok(await page.evaluate(()=>scrollY>0),'Ein-Finger-Scrollen bleibt möglich');
 }
 await tap(page,'Einstellungen');const input=page.getByRole('textbox',{name:'Dein Name',exact:true});assert.ok(await input.evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16));await input.tap();assert.equal(await page.evaluate(()=>visualViewport.scale),scale);
});
(async()=>{
 const browser=await(engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{executablePath:webkit.executablePath()}:{executablePath:fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,args:['--no-sandbox']});let failed=0;
 for(const [name,fn]of cases){const context=await browser.newContext({viewport:{width:engine==='webkit'?390:360,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));try{await fn({page,context});assert.deepEqual(errors,[]);console.log('PASS '+engine+' '+name)}catch(e){failed++;console.error('FAIL '+engine+' '+name+'\n'+e.stack)}finally{await context.close()}}
 await browser.close();console.log(`${cases.length-failed}/${cases.length} Touch-Abläufe bestanden`);process.exitCode=failed?1:0;
})().catch(e=>{console.error(e);process.exitCode=1});
