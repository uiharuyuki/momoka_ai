// Run against the tested build, or the public site after deployment.
// PLAYWRIGHT_MODULE can point to an existing runner; no dependency changes needed.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
const base=process.env.REVIEW_BASE_URL || 'http://127.0.0.1:5186/momoka_ai/'
const out=process.env.REVIEW_ARTIFACTS_DIR
if(!out)throw new Error('Set REVIEW_ARTIFACTS_DIR to an owned artifact directory')
await mkdir(out,{recursive:true})
const b=await chromium.launch({channel:process.env.REVIEW_BROWSER_CHANNEL});const rows=[];const failures=[]
try{
 for(const[width,height]of[[1920,1080],[320,720],[320,568],[390,844],[600,900],[700,400],[720,900],[721,900],[768,600],[768,701],[800,900],[844,390],[999,900],[1000,600],[1000,860],[1001,600],[1001,861],[1100,900],[1440,900]]){
 const p=await b.newPage({viewport:{width,height},reducedMotion:'reduce'})
 const errors=[],posts=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(r.method()==='POST')posts.push(r.url())})
 try{
 await p.goto(base);await p.locator('.momoka-portrait').evaluate(e=>e.decode())
 const geometry=await p.locator('.momoka-portrait').evaluate(e=>{const r=e.getBoundingClientRect(),style=getComputedStyle(e);return{w:r.width,h:r.height,paintedWidth:style.objectFit==='contain'?Math.min(r.width,r.height*e.naturalWidth/e.naturalHeight):r.width,fit:style.objectFit}})
 await p.screenshot({path:`${out}/${width}x${height}-intro.png`,fullPage:true})
 if(width>=721&&width<=1000&&height>520) assert.ok(geometry.paintedWidth+0.01>=Math.min(width*.5,440),`intermediate illustration too small: ${geometry.paintedWidth}px`)
 assert.ok(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),'intro needs page scrolling')
 assert.ok(await p.locator('.character-stage').evaluate(e=>e.getBoundingClientRect().top===0),'header displaces the intro')
 assert.ok(await p.locator('.momoka-portrait').evaluate(e=>e.getBoundingClientRect().bottom>=innerHeight),'gap below intro portrait')
 const topics=p.getByRole('group',{name:'質問の候補'}).getByRole('button')
 assert.equal(await topics.count(),2)
 const starter=topics.first()
 const label=await starter.innerText()
 await starter.click()
 const question=await p.locator('#message-input').inputValue()
 assert.ok(question.length>label.length)
 const other=topics.nth(1)
 await other.click()
 const otherQuestion=await p.locator('#message-input').inputValue()
 assert.notEqual(otherQuestion,question)
 assert.ok(!otherQuestion.includes(question))
 await p.locator('#message-input').fill('こんにちは。')
 await starter.click()
 await starter.click()
 assert.equal(await p.locator('#message-input').inputValue(),'こんにちは。 '+question)
 assert.equal(await p.locator('.message-user').count(),0)
 await p.locator('#message-input').fill('袋に何が入っているの？')
 await p.getByRole('button',{name:'送信',exact:true}).click();await p.locator('.talk-page-conversation').waitFor()
 await p.locator('#message-input').fill('短い画面でも入力できる？');await p.getByRole('button',{name:'送信',exact:true}).click()
 assert.equal(await p.locator('.message-user').count(),2)
 assert.ok(await p.locator('.momoka-portrait').evaluate(e=>e.getBoundingClientRect().bottom>=innerHeight),'gap below conversation portrait')
 const composer=await p.locator('.message-form').boundingBox();const header=await p.locator('.site-header').boundingBox()
 if(width<=720)assert.ok(composer.y>=header.y+header.height-1 && composer.y+composer.height<=height+1,'composer outside the usable viewport')
 await p.screenshot({path:`${out}/${width}x${height}-conversation.png`,fullPage:true})
 await p.getByRole('button',{name:'最初の画面へ'}).click()
 const tabs=[]
 const openMenu=async()=>{const trigger=p.getByRole('button',{name:'メニューを開く'});if(await trigger.isVisible())await trigger.click()}
 for(const tab of ['Profile','Activities','Voice','Goods']){
 await openMenu()
 await p.getByRole('navigation',{name:'メインナビゲーション'}).getByRole('link',{name:tab,exact:true}).click();await p.locator(`main.${tab.toLowerCase()}-page`).waitFor()
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${tab} horizontal overflow`)
 if(tab==='Goods'&&width>=721&&width<=1000) assert.equal(await p.locator('.goods-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),2,'tablet goods cards are squeezed into four columns')
 await p.screenshot({path:`${out}/${width}x${height}-${tab}.png`,fullPage:true});tabs.push(tab)
 }
 await openMenu()
 await p.getByRole('navigation',{name:'メインナビゲーション'}).getByRole('link',{name:'Talk',exact:true}).click();await p.locator('.talk-page-intro').waitFor()
 await p.reload();await p.locator('.momoka-portrait').evaluate(e=>e.decode());assert.equal(await p.locator('.message-user').count(),0)
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
 assert.deepEqual(errors,[]);assert.deepEqual(posts,[])
 rows.push({width,height,geometry,tabs,passed:true})
 }catch(e){failures.push({width,height,error:e.message});rows.push({width,height,passed:false,error:e.message})}finally{await p.close()}
 }
 await writeFile(out+'/results.json',JSON.stringify({rows,failures},null,2));console.log(JSON.stringify({tested:rows.length,failures},null,2));assert.deepEqual(failures,[])
}finally{await b.close()}
