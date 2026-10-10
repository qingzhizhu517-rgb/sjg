import {spawnSync} from 'node:child_process'
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
const dir=dirname(fileURLToPath(import.meta.url)),build=resolve(dir,'.build'),quality=resolve(dir,'quality'),dist=resolve(dir,'../dist')
const plan=JSON.parse(readFileSync(resolve(dir,'plan.json'),'utf8')),duration=plan.total
for(const p of [build,quality,dist])mkdirSync(p,{recursive:true})
function ff(args){const r=spawnSync('ffmpeg',['-hide_banner','-y',...args],{encoding:'utf8',maxBuffer:8e6});if(r.status!==0)throw Error(r.stderr);return r.stderr}
const args=plan.scenes.flatMap(s=>['-i',resolve(dir,s.audio)])
const voiceFilters=plan.scenes.map((s,i)=>`[${i}:a]adelay=${Math.round(s.voiceStart*1000)}:all=1[v${i}]`)
voiceFilters.push(plan.scenes.map((_,i)=>`[v${i}]`).join('')+`amix=inputs=${plan.scenes.length}:normalize=0,apad,atrim=0:${duration}[voice]`)
const voice=resolve(build,'voice.wav')
ff([...args,'-filter_complex',voiceFilters.join(';'),'-map','[voice]','-ar','48000','-ac','2',voice])
const mix=resolve(build,'mix.wav')
const filter=`[0:a]asplit=2[v][duck];[1:a]atrim=0:${duration},asetpts=PTS-STARTPTS,volume=0.17,afade=t=in:st=0:d=1.6,afade=t=out:st=${duration-3}:d=3[m];[m][duck]sidechaincompress=threshold=0.012:ratio=4:attack=30:release=350:makeup=1[bed];[v][bed]amix=inputs=2:normalize=0,alimiter=limit=0.89:level=false,atrim=0:${duration}[out]`
ff(['-i',voice,'-i',resolve(dir,'../.build/score.wav'),'-filter_complex',filter,'-map','[out]','-ar','48000','-ac','2',mix])
const measured=ff(['-i',mix,'-af','loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json','-f','null','-'])
const match=measured.match(/\{\s*"input_i"[\s\S]*?\}/);if(!match)throw Error('No loudness measurement')
const m=JSON.parse(match[0]);writeFileSync(resolve(quality,'mix-measurement.json'),JSON.stringify(m,null,2))
const loudness=`loudnorm=I=-16:TP=-1.5:LRA=9:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true:print_format=json`
const out=resolve(dist,'山河有迹·文脉有声-滚动修复版.mp4')
const log=ff(['-i',resolve(build,'silent.mp4'),'-i',mix,'-map','0:v:0','-map','1:a:0','-c:v','copy','-af',loudness,'-c:a','aac','-b:a','256k','-ar','48000','-t',String(duration),'-movflags','+faststart',out])
writeFileSync(resolve(quality,'mix-log.txt'),log)
console.log(out)
