// Fresh live UI footage, using the project's existing controlled Chrome/CDP pipeline.
// Usage: node promo-film/v2/capture.mjs [--inspect | --poet-hires]
import { launchChrome, sleep } from '../tools/cdp.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const poetHires = process.argv.includes('--poet-hires');
const dpr = poetHires ? Number(process.env.POET_CAPTURE_DPR || 3) : 1;
if(poetHires && ![2,3].includes(dpr)) throw new Error('POET_CAPTURE_DPR must be 2 or 3');
const out = resolve(dirname(fileURLToPath(import.meta.url)), poetHires ? 'capture/poet-hires' : 'capture');
const base = 'http://127.0.0.1:5175';
const width = 1440, height = 900, fps = 10;
await mkdir(out, {recursive:true});
const chrome = await launchChrome({port:9353,width,height,extraArgs:['--use-angle=swiftshader']});
const page = chrome.client;
const manifest = {clips:{},status:'capturing',createdAt:new Date().toISOString(),notes:[
  '全部画面于本次运行从当前真实网站新采集，没有旧截图、伪造数据、虚构光标或修改页面元素。',
  '采集方式为10fps真实交互截图序列；逐帧wall-clock时间记录于timing，影片以固定10fps播放。',
  '使用项目原有受控headless Chrome/CDP工具，临时配置文件禁用浏览器扩展；结束后关闭临时浏览器。',
  '诗作仅演示原文及网站现有注解，不把网站长篇创作背景作为已核实史实呈现。',
  '研学演示真实入口及三步说明，没有虚构已发布任务、创建任务或提交学习成果。',
  '诗作页面下方的AI赏析请求当前报错，本序列视区停留于原文与注解，未录入下方错误区域。',
  '杜甫公开数据中有同名重复作品记录，本序列如实保留，不宣称这9条为9首不同作品。'
]};
async function ev(expression) {
  const {result,exceptionDetails} = await page.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if(exceptionDetails) throw new Error(exceptionDetails.text+': '+(result.description||''));
  return result.value;
}
async function until(expression,timeout=20000) {
  const start=Date.now();
  while(Date.now()-start<timeout) {
    if(await ev(expression).catch(()=>false)) return;
    await sleep(80);
  }
  throw new Error('Timed out: '+expression);
}
async function ready() {
  await until('document.readyState === "complete"');
  await ev('document.fonts.ready.then(()=>true)');
  await ev(`Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top < innerHeight).map(i=>i.decode().catch(()=>{}))).then(()=>true)`);
  await sleep(850);
}
async function navigate(path,selector) {
  await page.send('Page.navigate',{url:base+path});
  await until(`location.pathname === ${JSON.stringify(path)} && !!document.querySelector(${JSON.stringify(selector)})`);
  await ready();
}
async function click(selector) {
  const rect=await ev(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});if(!n)throw Error('Missing click target');const r=n.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  if(rect.y<0||rect.y>height) throw new Error('Click target outside viewport: '+selector);
  await page.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...rect});
  await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...rect});
}
async function scrollTo(y) {await ev(`window.scrollTo({left:0,top:${y},behavior:'instant'})`);}
async function screenshot(file) {
  const {data}=await Promise.race([
    page.send('Page.captureScreenshot',{format:'jpeg',quality:poetHires ? 97 : 92,captureBeyondViewport:false}),
    sleep(8000).then(()=>{throw new Error('Screenshot timed out after 8s');})
  ]);
  await writeFile(resolve(out,file),Buffer.from(data,'base64'));
}
async function state() {
  return await ev(`(()=>{const sels=['input#poem-keyword','form[role=search] button[type=submit]','.poem-card','.manuscript','.manuscript__body','.manuscript__annotation','summary','.detail-section','.pd-heading','.pd-section--bio','.pd-section--works','.pd-all-works','.task-index__form','.task-index__note'];const rects={};for(const s of sels){const n=document.querySelector(s);if(n){const r=n.getBoundingClientRect();rects[s]={x:r.x,y:r.y,width:r.width,height:r.height,text:n.innerText?.slice(0,300)}}}return {url:location.href,title:document.title,text:document.body.innerText.slice(0,5500),viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},scrollY,scrollHeight:document.documentElement.scrollHeight,rects}})()`);
}
async function record(name,label,count,act) {
  const startState=await state();
  if(await ev(`Array.from(document.querySelectorAll('[role=alert],.error-state')).some(n=>{const r=n.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0&&n.innerText.includes('失败')})`)) throw new Error(name+' contains a visible loading error');
  const names=[],timing=[],start=Date.now();
  for(let i=0;i<count;i++) {
    await sleep(Math.max(0,start+i*100-Date.now()));
    await act(i);
    const file=`${name}-${String(i).padStart(4,'0')}.jpg`;
    timing.push({frame:i,atMs:Date.now()-start});
    await screenshot(file);names.push(file);
    if(poetHires && (i+1)%10===0) console.log(JSON.stringify({stage:'hires-progress',frames:i+1,elapsedMs:Date.now()-start}));
  }
  const endState=await state();
  manifest.clips[name]={fps,frames:names,duration:count/fps,label,url:endState.url,
    captureType:'live-interactive-screenshot-sequence',imageSize:{width:width*dpr,height:height*dpr},
    cssViewport:{width,height},deviceScaleFactor:dpr,
    actualElapsedMs:Date.now()-start,timing,startState,endState};
  await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2));
  console.log(JSON.stringify({name,count,playbackDuration:count/fps,actualElapsedMs:Date.now()-start,url:endState.url}));
}
try {
  await page.send('Page.enable');await page.send('Runtime.enable');
  await page.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile:false});
  if(poetHires) {
    manifest.notes = [
      `仅重新采集真实杜甫页；CSS视口1440×900，deviceScaleFactor=${dpr}，截图${width*dpr}×${height*dpr}。`,
      '沿用低分辨率版本相同动作与帧数：第15–40帧滚动至450 CSS像素，第51帧展开相关作品；80帧按10fps播放。',
      '没有修改页面DOM或数据，没有增加虚构光标。原低分辨率素材及主manifest保持不变。',
      '逐帧真实采集时间记录在timing；截图序列按固定10fps播放，不宣称严格等时录屏。',
      '杜甫公开数据有同名重复作品记录，画面如实保留；不宣称这9条为9首不同作品。'
    ];
    await navigate('/poets/1','.pd-folio');
    const initial = await state();
    if(initial.viewport.width!==width || initial.viewport.height!==height || initial.viewport.dpr!==dpr || !initial.text.includes('杜甫')) throw new Error('Unexpected high-resolution page state');
    await writeFile(resolve(out,'inspect.json'),JSON.stringify(initial,null,2));
    console.log(JSON.stringify({stage:'hires-ready',viewport:initial.viewport,url:initial.url,works:initial.rects['.pd-section--works']}));
    await record('poet',`杜甫人物摘要与相关诗作（${dpr}倍分辨率）`,80,async i=>{
      if(i>=15&&i<=40) await scrollTo((i-15)*18);
      if(i===51) await click('.pd-all-works');
    });
    manifest.status='complete';
    manifest.keyframes={poet:{summary:'poet-0000.jpg',works:'poet-0045.jpg',expanded:'poet-0079.jpg'}};
    await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2));
  } else if(process.argv.includes('--inspect')) {
    for(const [name,path,selector] of [['search','/poems','#poem-keyword'],['detail','/poems/36','.manuscript'],['poet','/poets/1','.pd-folio'],['learn','/learn','#task-code']]) {
      await navigate(path,selector);
      if(name==='search') await until(`document.querySelector('[role=status]')?.textContent.includes('100 篇')`);
      const data=await state();
      await writeFile(resolve(out,`${name}-inspect.json`),JSON.stringify(data,null,2));
      await screenshot(`${name}-inspect.jpg`);
      console.log(JSON.stringify({name,...data}));
    }
  } else {
    await navigate('/poems','#poem-keyword');
    await until(`document.querySelector('[role=status]')?.textContent.includes('100 篇')`);
    await record('search','输入《望岳》，检索并展示唯一结果',80,async i=>{
      if(i===10) {await click('#poem-keyword');await page.send('Input.insertText',{text:'望'});}
      if(i===18) await page.send('Input.insertText',{text:'岳'});
      if(i===28) {
        await click('form[role=search] button[type=submit]');
        await until(`document.querySelector('[role=status]')?.textContent.includes('1 篇') && document.querySelectorAll('.poem-card').length===1`);
        await sleep(300);
      }
      if(i>=48&&i<=59) await scrollTo((i-48)*14);
    });
    await navigate('/poems/36','.manuscript');
    await record('detail','细读《望岳》原文，收起并展开现有注解',80,async i=>{
      if(i>=12&&i<=27) await scrollTo((i-12)*12);
      if(i===36) await click('.manuscript__annotation summary');
      if(i===51) await click('.manuscript__annotation summary');
    });
    await navigate('/poets/1','.pd-folio');
    await record('poet','杜甫人物摘要与相关诗作',80,async i=>{
      if(i>=15&&i<=40) await scrollTo((i-15)*18);
      if(i===51) await click('.pd-all-works');
    });
    await navigate('/learn','#task-code');
    await record('learn','研学任务入口：读证据、作比较、写思考',70,async i=>{
      if(i>=15&&i<=35) await scrollTo((i-15)*11);
      if(i===44) await click('#task-code');
    });
    manifest.status='complete';
    await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2));
  }
} finally {await chrome.close();}
