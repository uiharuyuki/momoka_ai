// Run against the tested build, or the public site after deployment.
// PLAYWRIGHT_MODULE can point to an existing runner; no dependency changes needed.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
const base=process.env.REVIEW_BASE_URL || 'http://127.0.0.1:5186/momoka_ai/'
const out=process.env.REVIEW_ARTIFACTS_DIR
if(!out)throw new Error('Set REVIEW_ARTIFACTS_DIR to an owned artifact directory')
await mkdir(out,{recursive:true})
const b=await chromium.launch();const rows=[];const failures=[]
try{
 for(const[width,height]of[[320,568],[390,844],[600,900],[700,400],[720,900],[721,900],[768,600],[768,701],[800,900],[844,390],[999,900],[1000,600],[1000,860],[1001,600],[1001,861],[1100,900],[1440,900]]){
 const p=await b.newPage({viewport:{width,height},reducedMotion:'reduce'})
 const errors=[],posts=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(r.method()==='POST')posts.push(r.url())})
 try{
 await p.goto(base);await p.locator('.momoka-portrait').evaluate(e=>e.decode())
 const geometry=await p.locator('.momoka-portrait').evaluate(e=>{const r=e.getBoundingClientRect(),style=getComputedStyle(e);return{w:r.width,h:r.height,paintedWidth:style.objectFit==='contain'?Math.min(r.width,r.height*e.naturalWidth/e.naturalHeight):r.width,fit:style.objectFit}})
 await p.screenshot({path:`${out}/${width}x${height}-intro.png`,fullPage:true})
 if(width>=721&&width<=1000) assert.ok(geometry.paintedWidth>=Math.min(width*.5,440),`intermediate illustration too small: ${geometry.paintedWidth}px`)
 if(width>=721&&width<=1000&&height<=860) assert.ok(geometry.h>=420,'short window crops the hero down to the face')
 const starter=p.getByRole('button',{name:'自己紹介して',exact:true});await starter.click();await p.locator('.talk-page-conversation').waitFor()
 await p.getByLabel('メッセージ',{exact:true}).fill('短い画面でも入力できる？');await p.getByRole('button',{name:'送信',exact:true}).click()
 assert.equal(await p.locator('.message-user').count(),2)
 const composer=await p.locator('.message-form').boundingBox();const nav=await p.locator('.site-header nav').boundingBox()
 if(width<=720)assert.ok(composer.y+composer.height<=nav.y+1,'composer covered by bottom navigation')
 await p.screenshot({path:`${out}/${width}x${height}-conversation.png`,fullPage:true})
 await p.getByRole('button',{name:'最初の画面へ'}).click()
 const tabs=[]
 for(const tab of ['Profile','Activities','Voice','Goods']){
 await p.getByRole('navigation',{name:'メインナビゲーション'}).getByRole('link',{name:tab,exact:true}).click();await p.locator(`main.${tab.toLowerCase()}-page`).waitFor()
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${tab} horizontal overflow`)
 if(tab==='Goods'&&width>=721&&width<=1000) assert.equal(await p.locator('.goods-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),2,'tablet goods cards are squeezed into four columns')
 await p.screenshot({path:`${out}/${width}x${height}-${tab}.png`,fullPage:true});tabs.push(tab)
 }
 await p.getByRole('navigation',{name:'メインナビゲーション'}).getByRole('link',{name:'Talk',exact:true}).click();await p.locator('.talk-page-intro').waitFor()
 await p.reload();await p.locator('.momoka-portrait').evaluate(e=>e.decode());assert.equal(await p.locator('.message-user').count(),0)
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
 assert.deepEqual(errors,[]);assert.deepEqual(posts,[])
 rows.push({width,height,geometry,tabs,passed:true})
 }catch(e){failures.push({width,height,error:e.message});rows.push({width,height,passed:false,error:e.message})}finally{await p.close()}
 }
 await writeFile(out+'/results.json',JSON.stringify({rows,failures},null,2));console.log(JSON.stringify({tested:rows.length,failures},null,2));assert.deepEqual(failures,[])
}finally{await b.close()}
