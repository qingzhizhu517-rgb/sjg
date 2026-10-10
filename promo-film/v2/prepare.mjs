import {execFileSync} from 'node:child_process'
import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {resolve,dirname} from 'node:path'
export const root=dirname(fileURLToPath(import.meta.url))
const audio=resolve(root,'audio');mkdirSync(audio,{recursive:true})
const scenes=[
 {id:'opening',title:'从一首诗出发',min:7.5,text:'一首诗，能带我们走进怎样的山河？'},
 {id:'map',title:'沿河，认识九城',min:10,text:'沿着黄河，认识山东九城。让城市、诗人与作品，在一幅文化地图中相遇。'},
 {id:'search',title:'循诗，找到原文',min:10,text:'从一句熟悉的诗开始。输入望岳，找到杜甫的作品。'},
 {id:'detail',title:'细读，看见山河',min:10,text:'打开原文，读完整首诗，再展开注解。让每一次探索，都从文本出发。'},
 {id:'connection',title:'诗、人、地，相互连接',min:7,text:'望岳，连着杜甫，也连着泰山。一首诗，让文字与地点有了联系。'},
 {id:'poet',title:'由诗，走近诗人',min:9,text:'走近杜甫，继续阅读他的作品。让一首诗，成为下一次阅读的起点。'},
 {id:'learn',title:'带着问题，继续探索',min:9,text:'进入研学入口。读证据，作比较，写思考，把阅读变成自己的问题。'},
 {id:'journey',title:'让阅读，继续发生',min:6.5,text:'从诗词到人物，从地点到研学，沿着自己的线索，继续探索。'},
 {id:'closing',title:'山河有迹 · 文脉有声',min:7.5,text:'山河有迹，文脉有声。让诗与山河，重新相遇。'},
]
let cursor=0
for(const s of scenes){
 const wav=resolve(audio,s.id+'.wav'),raw=resolve(audio,s.id+'.aiff'),finger=resolve(audio,s.id+'.txt')
 if(!existsSync(wav)||!existsSync(finger)||readFileSync(finger,'utf8')!==s.text){
  execFileSync('say',['-v','Tingting','-r','190','-o',raw,s.text])
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',raw,'-af','highpass=f=80,lowpass=f=13000,loudnorm=I=-18:TP=-2:LRA=8','-ar','48000','-ac','2',wav])
  writeFileSync(finger,s.text)
 }
 s.speech=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',wav],{encoding:'utf8'}).trim())
 s.duration=Math.ceil(Math.max(s.min,s.speech+1.3)*30)/30
 s.start=Math.round(cursor*30)/30;s.voiceStart=s.start+0.55;s.audio='audio/'+s.id+'.wav';cursor+=s.duration
 console.log(s.id,s.start.toFixed(2),s.duration.toFixed(2),s.speech.toFixed(2))
}
const plan={width:1920,height:1080,fps:30,total:Math.round(cursor*30)/30,scenes,voice:'macOS Tingting（合成旁白）',createdAt:new Date().toISOString()}
writeFileSync(resolve(root,'plan.json'),JSON.stringify(plan,null,2))
writeFileSync(resolve(root,'timeline.txt'),scenes.map(s=>`${s.start.toFixed(2)}–${(s.start+s.duration).toFixed(2)}  ${s.title}\n  ${s.text}`).join('\n\n'))
console.log('TOTAL',plan.total)
