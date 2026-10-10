import {spawnSync} from 'node:child_process'
import {readFileSync,copyFileSync,renameSync,writeFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
const dir=dirname(fileURLToPath(import.meta.url)),plan=JSON.parse(readFileSync(resolve(dir,'plan.json'),'utf8')),id=process.argv[2]
const s=plan.scenes.find(s=>s.id===id);if(!s)throw Error('Pass an existing scene id')
const silent=resolve(dir,'.build/silent.mp4'),backup=resolve(dir,`.build/silent-before-${id}.mp4`),patch=resolve(dir,`.build/${id}-silent.mp4`),out=resolve(dir,`.build/silent-patched.mp4`)
const first=Math.round(s.start*plan.fps),last=first+Math.round(s.duration*plan.fps)
if(first===0||last===Math.round(plan.total*plan.fps))throw Error('End scenes should use a full render')
copyFileSync(silent,backup)
const filters=`[0:v]split=2[a][b];[a]trim=end_frame=${first},setpts=PTS-STARTPTS[a0];[1:v]setpts=PTS-STARTPTS[m];[b]trim=start_frame=${last},setpts=PTS-STARTPTS[b0];[a0][m][b0]concat=n=3:v=1:a=0[v]`
const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',backup,'-i',patch,'-filter_complex',filters,'-map','[v]','-an','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-r',String(plan.fps),'-movflags','+faststart',out],{encoding:'utf8',maxBuffer:3e6})
if(r.status!==0)throw Error(r.stderr)
const check=spawnSync('ffprobe',['-v','error','-show_entries','stream=nb_frames','-of','json',out],{encoding:'utf8'})
if(Number(JSON.parse(check.stdout).streams[0].nb_frames)!==Math.round(plan.total*plan.fps))throw Error('Replacement changed total frame count')
renameSync(out,silent)
writeFileSync(resolve(dir,`quality/${id}-replacement.json`),JSON.stringify({scene:id,startFrame:first,endFrameExclusive:last,verifiedFrames:Math.round(plan.total*plan.fps),backup,patch,changedAt:new Date().toISOString()},null,2))
console.log(`Replaced ${id}: frames ${first}–${last-1}`)
