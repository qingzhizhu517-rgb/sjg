import {spawn} from 'node:child_process'
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {once} from 'node:events'
import {launchChrome,sleep} from '../tools/cdp.mjs'
const dir=dirname(fileURLToPath(import.meta.url)),repo=resolve(dir,'../..'),quality=resolve(dir,'quality')
mkdirSync(quality,{recursive:true});mkdirSync(resolve(dir,'.build'),{recursive:true})
const plan=JSON.parse(readFileSync(resolve(dir,'plan.json'),'utf8'))
const sceneFlag=process.argv.indexOf('--scene'),sceneId=sceneFlag<0?null:process.argv[sceneFlag+1]
const selected=sceneId?plan.scenes.find(s=>s.id===sceneId):null
if(sceneId&&!selected)throw Error('Unknown scene '+sceneId)
const stills=process.argv.includes('--stills'),port=5201
const server=spawn(process.execPath,[resolve(dir,'../tools/serve.mjs')],{cwd:repo,env:{...process.env,SJG_FILM_PORT:String(port)},stdio:['ignore','pipe','pipe']})
let chrome,encoder,encoded=false
const diagnostics={startedAt:new Date().toISOString(),mode:stills?'stills':'full',scope:sceneId||'all',frames:0,errors:[]}
try{
 for(let i=0;i<80;i++){try{const r=await fetch(`http://127.0.0.1:${port}/promo-film/v2/index.html`);if(r.ok)break}catch{}await sleep(100)}
 chrome=await launchChrome({port:9352,width:1920,height:1080,extraArgs:['--use-angle=swiftshader']})
 const page=await chrome.newPage(`http://127.0.0.1:${port}/promo-film/v2/index.html`)
 await page.send('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false})
 for(let i=0;i<150;i++){
  const r=await page.send('Runtime.evaluate',{expression:'Boolean(window.__film && document.querySelector("#status").textContent === "ready")',returnByValue:true})
  if(r.result.value)break
  if(i===149)throw Error('Film boot timed out')
  await sleep(100)
 }
 const evalJs=async expression=>{const r=await page.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value}
 async function jpeg(t){const data=await evalJs(`(async()=>{await __film.frame(${t});return document.querySelector('#film').toDataURL('image/jpeg',.95).split(',')[1]})()`);if(typeof data!=='string'||data.length<2000)throw Error('Empty frame '+t);return Buffer.from(data,'base64')}
 if(stills){
  const samples=[]
  for(const s of selected?[selected]:plan.scenes)for(const offset of [.2,Math.min(3,s.duration/2),s.duration-.5])samples.push({id:s.id,t:s.start+offset})
  for(const sample of samples){const file=`${sample.t.toFixed(2).padStart(6,'0')}-${sample.id}.jpg`;writeFileSync(resolve(quality,file),await jpeg(sample.t));diagnostics.frames++;console.log('still',file)}
  writeFileSync(resolve(quality,'stills.json'),JSON.stringify(samples,null,2))
 }else{
  const count=Math.round((selected?selected.duration:plan.total)*plan.fps),out=resolve(dir,'.build/'+(sceneId?sceneId+'-silent.mp4':'silent.mp4'))
  encoder=spawn('ffmpeg',['-hide_banner','-loglevel','warning','-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(plan.fps),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-r',String(plan.fps),'-movflags','+faststart',out],{stdio:['pipe','ignore','pipe']})
  let err='';encoder.stderr.on('data',d=>{err+=d.toString()});encoder.stdin.on('error',e=>diagnostics.errors.push(e.message))
  const finished=once(encoder,'close')
  for(let i=0;i<count;i++){
   const buf=await jpeg((selected?selected.start:0)+i/plan.fps);if(!encoder.stdin.write(buf))await once(encoder.stdin,'drain')
   diagnostics.frames++
   if(i%150===0)console.log(`render ${i}/${count} (${(100*i/count).toFixed(1)}%)`)
  }
  encoder.stdin.end();const [code]=await finished;if(code!==0)throw Error('FFmpeg failed: '+err);encoded=true;diagnostics.output=out
 }
 const state=await evalJs('({issues:__film.issues,errors:__film.errors})')
 diagnostics.layoutIssues=state.issues;diagnostics.errors.push(...state.errors);diagnostics.finishedAt=new Date().toISOString()
 writeFileSync(resolve(quality,(sceneId?sceneId+'-':'')+(stills?'stills-validation.json':'render-validation.json')),JSON.stringify(diagnostics,null,2))
 console.log(JSON.stringify(diagnostics))
 if(diagnostics.errors.length||diagnostics.layoutIssues.length)process.exitCode=1
}catch(e){console.error(e);process.exitCode=1}finally{if(encoder&&!encoded)encoder.kill('SIGTERM');if(chrome)await chrome.close();server.kill('SIGTERM')}
