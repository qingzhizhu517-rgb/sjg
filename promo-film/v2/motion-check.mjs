import {readFileSync,existsSync,writeFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {createHash} from 'node:crypto'
const file=resolve(process.argv[2]||'promo-film/v2/capture/manifest.json'),root=dirname(file)
const manifest=JSON.parse(readFileSync(file,'utf8')),only=process.argv[3]
const intervals={search:[4.95,5.85],detail:[1.5,2.4],poet:[2,3.5],learn:[1.9,3.1]},results=[]
for(const [id,[start,end]] of Object.entries(intervals)){
 if(only&&only!==id)continue
 const c=manifest.clips[id];if(!c){results.push({id,passed:false,error:'missing clip'});continue}
 const hashes=new Map();let previous=null,changed=0,total=0
 for(let f=Math.ceil(start*30);f<=Math.floor(end*30);f++){
  const name=c.frames[Math.min(c.frames.length-1,Math.floor((f/30+1e-7)*c.fps))],path=resolve(root,name)
  if(!existsSync(path))throw Error('Missing '+path)
  if(!hashes.has(name))hashes.set(name,createHash('sha256').update(readFileSync(path)).digest('hex'))
  const hash=hashes.get(name);if(previous!==null){total++;if(hash!==previous)changed++}previous=hash
 }
 const changedFraction=changed/total
 results.push({id,sourceFps:c.fps,changed,total,changedFraction,passed:c.fps>=30&&changedFraction>=.85})
}
const report={passed:results.every(r=>r.passed),manifest:file,criteria:'滚动中段按30fps采样，至少85%的相邻帧应为不同采集图像。静止阅读停顿不纳入该检查。',results}
console.log(JSON.stringify(report,null,2))
if(process.env.MOTION_REPORT)writeFileSync(process.env.MOTION_REPORT,JSON.stringify(report,null,2))
if(!report.passed)process.exitCode=1
