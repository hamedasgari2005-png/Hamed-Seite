const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const engine=process.env.MOOSLICHT_BROWSER==='webkit'?'webkit':'chromium';
const base=process.env.MOOSLICHT_URL||'http://127.0.0.1:8080/';
const output=path.join(__dirname,'../test-results');fs.mkdirSync(output,{recursive:true});
const profiles=[['small',320,568,16],['iphone-se',375,667,16],['iphone',390,844,16],['iphone-max',430,932,16],['galaxy',360,780,16],['galaxy-plus',412,915,16],['landscape',844,390,16],['tablet',768,1024,16],['desktop',1440,1000,16],['large-text',360,780,24],['largest-text',320,568,32]];
async function layout(page,label){
 await page.locator('main').waitFor();
 const issues=await page.evaluate(()=>{
  const issues=[],root=document.querySelector('dialog[open]')||document.querySelector('main');
  const limit=root.tagName==='DIALOG'?root.getBoundingClientRect():{left:0,right:innerWidth};
  if(document.documentElement.scrollWidth>innerWidth+1)issues.push('page overflow '+document.documentElement.scrollWidth+'/'+innerWidth);
  for(const el of root.querySelectorAll('button,input:not([type=hidden]),select,textarea,h1,h2,h3,.task-title,.help,.pill')){
   const r=el.getBoundingClientRect();if(!r.width||!r.height||el.closest('[hidden],.hidden'))continue;
   if(!el.closest('.shop-categories')&&(r.left<limit.left-2||r.right>limit.right+2))issues.push(el.tagName+' outside '+el.textContent.slice(0,45));
   if(el.scrollWidth>el.clientWidth+3&&!['SELECT','TEXTAREA','INPUT'].includes(el.tagName))issues.push(el.tagName+' content clipped '+el.textContent.slice(0,45));
  }
  for(const image of root.querySelectorAll('.item-art .pet')){const r=image.getBoundingClientRect(),box=image.parentElement.getBoundingClientRect();if(r.bottom>box.bottom+1||r.top<box.top-1)issues.push('pet preview outside item');}
  for(const row of root.querySelectorAll('.row,.topbar,.dialog-head,.section-head,.task-toggle')){
   const children=[...row.children].map(el=>({el,r:el.getBoundingClientRect()})).filter(({r})=>r.width&&r.height);
   for(let i=0;i<children.length;i++)for(let j=i+1;j<children.length;j++){const a=children[i].r,b=children[j].r;if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2)issues.push('overlap '+row.className);}
  }
  const modal=document.querySelector('dialog[open]');if(modal){const r=modal.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight+1)issues.push('dialog outside viewport');}
  return [...new Set(issues)];
 });assert.deepEqual(issues,[],label);
}
(async()=>{
 const browser=await(engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{executablePath:webkit.executablePath()}:{executablePath:fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,args:['--no-sandbox']});let failed=0;
 for(const [name,width,height,font]of profiles){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<850,hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(base);await page.getByRole('button',{name:'Unser Zuhause öffnen'}).waitFor();await page.evaluate(font=>document.documentElement.style.fontSize=font+'px',font);await layout(page,name+' onboarding');
   await page.getByRole('button',{name:'Unser Zuhause öffnen'}).click();await page.getByRole('heading',{name:'Dein Tag',exact:true}).waitFor();
   await page.evaluate(async()=>{const {transact}=await import('./storage.js');await transact({type:'profile',profile:{userName:'Alexandra Maximiliane Sonnenschein',petName:'Prinzessin Rosalie Kuschelbär'}});await transact({type:'task-save',task:{title:'Ein sehr langer Aufgabentitel '+ 'Selbstfürsorge'.repeat(7),category:'connection',rule:'daily',weekdays:[1],startsOn:(await import('./core.js')).day(),priority:2,time:'18:30',reminder:true,paused:false,archived:false}})});
   await page.reload();await page.evaluate(font=>document.documentElement.style.fontSize=font+'px',font);
   for(const tab of ['Zuhause','Reisen','Für mich','Atelier','Rückblick','Einstellungen']){
    await page.getByRole('button',{name:tab,exact:true}).click();await layout(page,name+' '+tab);
    if(['galaxy','iphone','landscape'].includes(name))await page.screenshot({path:path.join(output,engine+'-'+name+'-'+tab+'.png'),fullPage:true});
   }
   await page.getByRole('button',{name:'Zuhause',exact:true}).click();
   for(const [opener,expected]of [['Einen kleinen Schritt hinzufügen','Was möchtest du tun?'],['Gestalten','Name deines Begleiters'],['So geht’s',null]]){
    await page.getByRole('button',{name:opener,exact:true}).click();await layout(page,name+' dialog '+opener);
    if(expected){const field=page.getByRole('textbox',{name:expected,exact:false});await field.focus();await field.fill('Ein neuer Name');}
    await page.getByRole('button',{name:'Schließen',exact:true}).click();
   }
   await page.getByRole('button',{name:'Für mich',exact:true}).click();await page.getByRole('button',{name:'Meine Stimmung festhalten',exact:false}).click();await layout(page,name+' mood');await page.getByRole('button',{name:'Schließen',exact:true}).click();
   await page.getByRole('button',{name:/Ruhig atmen/}).click();await layout(page,name+' breathing');await page.getByRole('button',{name:'Schließen',exact:true}).click();
   await page.getByRole('button',{name:'Atelier',exact:true}).click();await page.getByRole('button',{name:'Deko',exact:true}).click();assert.equal(await page.locator('.item-card').count(),4);await layout(page,name+' filtered shop');
   if(name==='iphone'||name==='galaxy'){
    for(const theme of ['rose','moss','lavender','sky'])for(const appearance of ['light','dark']){
     await page.evaluate(async profile=>{const {transact}=await import('./storage.js');await transact({type:'profile',profile})},{theme,appearance});await page.reload();await layout(page,name+' '+theme+' '+appearance);
    }
    await page.getByRole('button',{name:'Zuhause',exact:true}).click();await page.getByRole('button',{name:'Einen kleinen Schritt hinzufügen'}).click();await page.setViewportSize({width,height:340});await page.getByRole('textbox',{name:'Was möchtest du tun?'}).focus();await layout(page,name+' reduced keyboard viewport');const save=page.getByRole('button',{name:'Schritt speichern'});await save.scrollIntoViewIfNeeded();assert.ok(await save.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}),'Speichern durch Tastatur-Ansicht verdeckt');await page.getByRole('button',{name:'Schließen',exact:true}).click();await page.setViewportSize({width,height});
   }
   assert.deepEqual(errors,[]);console.log('PASS '+engine+' '+name);
  }catch(error){failed++;console.error('FAIL '+engine+' '+name+' '+error.message);await page.screenshot({path:path.join(output,engine+'-layout-failure-'+name+'.png'),fullPage:true}).catch(()=>{});}finally{await context.close()}
 }
 await browser.close();console.log(`${profiles.length-failed}/${profiles.length} Geräte-/Schriftprofile bestanden`);process.exitCode=failed?1:0;
})().catch(e=>{console.error(e);process.exitCode=1});
