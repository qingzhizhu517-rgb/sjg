import {spawnSync} from 'node:child_process'
import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
const dir=dirname(fileURLToPath(import.meta.url)),quality=resolve(dir,'quality'),video=resolve(dir,'../dist/山河有迹·文脉有声-滚动修复版.mp4')
const plan=JSON.parse(readFileSync(resolve(dir,'plan.json'),'utf8'))
function run(cmd,args){const r=spawnSync(cmd,args,{encoding:'utf8',maxBuffer:12e6});if(r.status!==0)throw Error(`${cmd} failed\n${r.stderr}`);return r}
const probe=JSON.parse(run('ffprobe',['-v','error','-show_entries','format=duration,size:stream=codec_type,codec_name,width,height,avg_frame_rate,nb_frames,sample_rate,channels','-of','json',video]).stdout)
const v=probe.streams.find(s=>s.codec_type==='video'),a=probe.streams.find(s=>s.codec_type==='audio')
const assertions={dimensions:v.width===1920&&v.height===1080,frameRate:v.avg_frame_rate==='30/1',frames:Number(v.nb_frames)===Math.round(plan.total*30),duration:Math.abs(Number(probe.format.duration)-plan.total)<.04,codecs:v.codec_name==='h264'&&a.codec_name==='aac',audio:a.sample_rate==='48000'&&a.channels===2}
const decoded=run('ffmpeg',['-hide_banner','-v','error','-i',video,'-f','null','-']);assertions.fullDecode=decoded.stderr.trim()===''
const stats=run('ffmpeg',['-hide_banner','-i',video,'-af','loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json','-vf','blackdetect=d=0.04:pix_th=0.05:pic_th=0.98','-f','null','-']).stderr
const loudness=JSON.parse(stats.match(/\{\s*"input_i"[\s\S]*?\}/)[0]);assertions.loudness=Math.abs(Number(loudness.input_i)+16)<1;assertions.truePeak=Number(loudness.input_tp)<=-1;assertions.noBlackFrames=!stats.includes('black_start:')
const rendered=JSON.parse(readFileSync(resolve(quality,'render-validation.json'),'utf8'));assertions.noRenderErrors=rendered.errors.length===0;assertions.noLayoutOverflow=rendered.layoutIssues.length===0
for(const s of plan.scenes){const report=resolve(quality,s.id+'-render-validation.json');if(existsSync(report)){const patch=JSON.parse(readFileSync(report,'utf8'));assertions['patch_'+s.id]=patch.errors.length===0&&patch.layoutIssues.length===0&&patch.frames===Math.round(s.duration*plan.fps)}}
for(const s of plan.scenes)assertions['voiceFits_'+s.id]=s.voiceStart+s.speech<=s.start+s.duration
const framesDir=resolve(quality,'seconds');mkdirSync(framesDir,{recursive:true})
run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',video,'-vf','fps=1,scale=640:360','-q:v','2',resolve(framesDir,'%03d.jpg')])
const edges=resolve(quality,'boundaries');mkdirSync(edges,{recursive:true})
for(let i=1;i<plan.scenes.length;i++){
 const time=plan.scenes[i].start
 for(const [tag,offset] of [['before',-1/30],['cut',0],['after',.5]])run('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(time+offset),'-i',video,'-frames:v','1','-vf','scale=640:360','-q:v','2',resolve(edges,`${String(i).padStart(2,'0')}-${tag}.jpg`)])
}
const result={passed:Object.values(assertions).every(Boolean),assertions,probe,loudness,checkedAt:new Date().toISOString(),note:'技术检查不替代对配音自然度和画面审美的判断。逐秒帧和场景边界另外人工检查。'}
writeFileSync(resolve(quality,'final-validation.json'),JSON.stringify(result,null,2));writeFileSync(resolve(quality,'audio-blackdetect-log.txt'),stats)
console.log(JSON.stringify(result,null,2));if(!result.passed)process.exitCode=1
