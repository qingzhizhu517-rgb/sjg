import {launchChrome,sleep} from '../tools/cdp.mjs'
import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
const root=dirname(fileURLToPath(import.meta.url)),out=resolve(root,'capture-smooth'),fps=30
mkdirSync(out,{recursive:true})
const manifestPath=resolve(out,'manifest.json'),manifest=existsSync(manifestPath)?JSON.parse(readFileSync(manifestPath,'utf8')):{clips:{},status:'capturing',notes:['逐帧设置真实页面滚动位置后截图，按30fps重建演示。不是实时录屏，也不使用插帧算法。','静止阅读状态复用同一截图；滚动期间每一帧单独采集。','保留实际网页文字和图片，没有改DOM样式、伪造光标或改写内容。']}
const only=process.argv[2]
const config={
 search:{route:'/poems',selector:'#poem-keyword',duration:8,dpr:1,scroll:[4.8,5.9,154]},
 detail:{route:'/poems/36',selector:'.manuscript',duration:8,dpr:1,scroll:[1.2,2.7,180]},
 poet:{route:'/poets/1',selector:'.pd-folio',duration:8,dpr:2,scroll:[1.5,4,450]},
 learn:{route:'/learn',selector:'#task-code',duration:7,dpr:1,scroll:[1.5,3.5,220]},
}
const smooth=n=>{n=Math.min(1,Math.max(0,n));return n*n*(3-2*n)}
for(const [id,c] of Object.entries(config)){
 if(only&&id!==only)continue
 if(!only&&manifest.clips[id]?.status==='complete'){console.log('reuse',id);continue}
 let chrome
 try{
  chrome=await launchChrome({port:9353,width:1440,height:900,extraArgs:['--use-angle=swiftshader']})
  const page=chrome.client
  await page.send('Page.enable');await page.send('Runtime.enable')
  await page.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:c.dpr,mobile:false})
  async function ev(expression){const r=await page.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value}
  async function until(expression){for(let i=0;i<160;i++){if(await ev(expression))return;await sleep(100)}throw Error('Wait failed: '+expression)}
  async function click(selector){const p=await ev(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);await page.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p})}
  await page.send('Page.navigate',{url:'http://127.0.0.1:5175'+c.route})
  await until(`location.pathname===${JSON.stringify(c.route)} && !!document.querySelector(${JSON.stringify(c.selector)})`)
  await ev('document.fonts.ready.then(()=>true)')
  await ev('Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight).map(i=>i.decode().catch(()=>{}))).then(()=>true)')
  if(id==='search')await until(`document.querySelector('[role=status]')?.textContent.includes('100 篇')`)
  await sleep(800)
  const frames=[],positions=[],events=[],startedAt=new Date().toISOString()
  let prevScroll=-1,lastFile=null,captured=0
  for(let i=0;i<c.duration*fps;i++){
   const t=i/fps,y=Math.round(c.scroll[2]*smooth((t-c.scroll[0])/(c.scroll[1]-c.scroll[0])))
   let changed=i===0||y!==prevScroll
   if(id==='search'){
    if(i===30){await click('#poem-keyword');await page.send('Input.insertText',{text:'望'});changed=true;events.push({frame:i,action:'input 望'})}
    if(i===54){await page.send('Input.insertText',{text:'岳'});changed=true;events.push({frame:i,action:'input 岳'})}
    if(i===84){await click('form[role=search] button[type=submit]');await until(`document.querySelector('[role=status]')?.textContent.includes('1 篇') && document.querySelectorAll('.poem-card').length===1`);await sleep(250);changed=true;events.push({frame:i,action:'search result'})}
   }
   if(id==='detail'&&(i===108||i===153)){await click('.manuscript__annotation summary');await sleep(200);changed=true;events.push({frame:i,action:'toggle annotation'})}
   if(id==='poet'&&i===153){await click('.pd-all-works');await sleep(200);changed=true;events.push({frame:i,action:'expand works'})}
   if(id==='learn'&&i===132){await click('#task-code');changed=true;events.push({frame:i,action:'focus task input'})}
   if(changed){
    // Wait for the browser compositor to display this exact position before capture.
    const actual=await ev(`(async()=>{window.scrollTo({left:0,top:${y},behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return window.scrollY})()`)
    if(Math.abs(actual-y)>1)throw Error(`Scroll mismatch ${id} frame ${i}: ${actual} != ${y}`)
    let timer;const result=await Promise.race([page.send('Page.captureScreenshot',{format:'jpeg',quality:97,captureBeyondViewport:false}),new Promise((_,rej)=>{timer=setTimeout(()=>rej(Error(`Screenshot timeout ${id} ${i}`)),25000)})]).finally(()=>clearTimeout(timer))
    lastFile=`${id}-${String(i).padStart(4,'0')}.jpg`;writeFileSync(resolve(out,lastFile),Buffer.from(result.data,'base64'));captured++
    positions.push({frame:i,time:t,scrollY:actual,file:lastFile})
   }
   frames.push(lastFile);prevScroll=y
   if(i%30===0)console.log(id,i+'/'+(c.duration*fps),'captured',captured)
  }
  manifest.clips[id]={status:'complete',fps,duration:c.duration,frames,capturedFrames:captured,positions,events,scroll:c.scroll,cssViewport:{width:1440,height:900},imageSize:{width:1440*c.dpr,height:900*c.dpr},deviceScaleFactor:c.dpr,startedAt,finishedAt:new Date().toISOString(),url:'http://127.0.0.1:5175'+c.route}
  manifest.status=Object.keys(config).every(id=>manifest.clips[id]?.status==='complete')?'complete':'capturing'
  writeFileSync(manifestPath,JSON.stringify(manifest,null,2));console.log('complete',id,frames.length,captured)
 }finally{if(chrome)await chrome.close()}
}
