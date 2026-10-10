import {W,H,C,FONT,clamp,ease,smooth,phase,lerp,issues,text,lines,line,round,dot,path,seal,backdrop,footer,label} from './draw.js'

const canvas=document.querySelector('#film'),g=canvas.getContext('2d',{alpha:false})
const [plan,map,captures]=await Promise.all(['plan.json','data/map.json','capture-smooth/manifest.json'].map(p=>fetch(p).then(r=>{if(!r.ok)throw Error(p);return r.json()})))
if(captures.status!=='complete')throw Error('30fps capture is incomplete')
await document.fonts.ready
const errors=[],cache=new Map()
window.addEventListener('error',e=>errors.push(e.message))
window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)))
async function shot(id,local,scene){
 const clip=captures.clips[id]
 // Preserve every recorded action; spend the remaining time holding its end state.
 const time=clamp(local-.55,0,clip.duration-1/clip.fps)
 const idx=Math.min(clip.frames.length-1,Math.floor((time+1e-7)*clip.fps)),url='capture-smooth/'+clip.frames[idx]
 if(cache.has(url))return cache.get(url)
 const im=new Image();im.src=url;await im.decode();cache.set(url,im)
 if(cache.size>6)cache.delete(cache.keys().next().value)
 return im
}
function head(n,kicker,title,sub,t,{x=106,y=184,size=62}={}){
 label(g,n,kicker,x,y)
 const a=ease(t/.7),dy=(1-a)*12
 lines(g,title,x,y+116+dy,size,{font:FONT.serif,weight:600,alpha:a,leading:size*1.45})
 if(sub)lines(g,sub,x,y+116+title.length*size*1.45+38,27,{color:C.muted,leading:44,alpha:ease((t-.25)/.7)})
}
function screen(im,{x,y,w,h,sx=0,sy=0,sw=1440,sh=900,alpha=1}){
 round(g,x,y,w,h,8,{fill:C.white,shadow:true,alpha})
 const pixelRatio=im.naturalWidth/1440
 g.save();g.globalAlpha*=alpha;g.beginPath();g.roundRect(x,y,w,h,8);g.clip();g.drawImage(im,sx*pixelRatio,sy*pixelRatio,sw*pixelRatio,sh*pixelRatio,x,y,w,h);g.restore()
 // Native webpage capture is only cropped and uniformly scaled.
 g.save();g.strokeStyle=C.line;g.lineWidth=1.2;g.beginPath();g.roundRect(x,y,w,h,8);g.stroke();g.restore()
}
function caption(s,x,y){text(g,s,x,y,24,{color:C.muted})}
function marker(x,y,n,title,t){
 const a=ease(t/.55);dot(g,x,y,24,C.ink,a);text(g,n,x,y+8,23,{font:FONT.latin,color:C.white,align:'center',alpha:a});text(g,title,x+43,y+10,32,{alpha:a})
}
function opening(t){
 const a=ease(t/1.2)
 text(g,'从一首诗出发',110,228,29,{color:C.red,alpha:a})
 text(g,'岱宗夫如何',110,400,112,{font:FONT.serif,weight:600,alpha:a})
 text(g,'齐鲁青未了',110,564,112,{font:FONT.serif,weight:600,alpha:ease((t-.8)/1.1)})
 line(g,116,618,940,618,{color:C.red,width:3,progress:ease((t-1.5)/1.5)})
 text(g,'杜甫  ·  《望岳》',116,686,30,{color:C.muted,alpha:ease((t-2)/.7)})
 text(g,'文字，通向山河。',116,834,40,{alpha:ease((t-3)/1)})
 // A geometric page, not a substitute landscape illustration.
 const ox=1290,oy=290
 for(let i=0;i<5;i++){
  const x=ox+i*35,y=oy+i*28,aa=ease((t-i*.14)/1)
  line(g,x,y,x,y+335,{color:i===4?C.red:C.line,width:i===4?3:2,progress:aa})
  line(g,x,y+335,x+250,y+335,{color:i===4?C.red:C.line,width:i===4?3:2,progress:aa})
 }
 text(g,'诗',1494,506,105,{font:FONT.serif,align:'center',alpha:ease((t-1.6)/1)})
 dot(g,1640,737,7,C.red,ease((t-2)/1))
 line(g,1640,737,1745,820,{color:C.red,progress:ease((t-2.2)/1.6)})
 text(g,'山河',1722,865,28,{color:C.muted,alpha:ease((t-3.2)/1)})
}

// Equirectangular projection corrected for the region's mean latitude.
const bbox=[114.65,34.25,122.95,38.55],cos=Math.cos(36.4*Math.PI/180)
const mapArea={x:575,y:181,w:1244,h:650}
const scale=Math.min(mapArea.w/((bbox[2]-bbox[0])*cos),mapArea.h/(bbox[3]-bbox[1]))
function project([lon,lat]){return [mapArea.x+(lon-bbox[0])*cos*scale,mapArea.y+(bbox[3]-lat)*scale]}
const riverPoints=map.river.features[0].geometry.coordinates.map(project)
const boundary=document.createElement('canvas');boundary.width=W;boundary.height=H
const bg=boundary.getContext('2d')
for(const f of map.province.features){
 bg.beginPath();const polygons=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates]
 for(const polygon of polygons)for(const ring of polygon)ring.forEach((p,i)=>{const [x,y]=project(p);i?bg.lineTo(x,y):bg.moveTo(x,y)})
 bg.fillStyle=f.properties.isYellowRiverCity?'#D6E0D1':'#E9ECE3';bg.fill('evenodd');bg.strokeStyle='#ABB9A8';bg.lineWidth=1.25;bg.stroke()
}
const offsets={菏泽:[-3,39],济宁:[30,44],泰安:[29,40],聊城:[-79,23],济南:[-61,-26],德州:[-32,-25],淄博:[47,38],滨州:[-61,-26],东营:[41,-4]}
function geography(t){
 head(1,'沿河 · 识城',['一条黄河','九座城市'],['沿着水的方向','展开齐鲁文脉'],t,{size:58})
 text(g,'山东沿黄九市',110,690,30,{color:C.red})
 lines(g,['菏泽 · 济宁 · 泰安','聊城 · 济南 · 德州','淄博 · 滨州 · 东营'],110,745,27,{color:C.muted,leading:47})
 g.save();g.globalAlpha=ease(t/.7);g.drawImage(boundary,0,0);g.restore()
 path(g,riverPoints,{color:C.white,width:9,alpha:ease(t/.5)})
 path(g,riverPoints,{color:C.red,width:4.5,progress:phase(t,.5,4.2)})
 map.cities.forEach((city,i)=>{
  const [x,y]=project([city.lon,city.lat]),[dx,dy]=offsets[city.name],a=ease((t-.8-i*.19)/.6)
  dot(g,x,y,7,C.white,a);dot(g,x,y,4,C.ink,a)
  line(g,x,y,x+dx*.68,y+dy*.65,{color:C.muted,width:1.1,alpha:a})
  text(g,city.name,x+dx,y+dy,27,{alpha:a,align:dx<-40?'right':'left',weight:600})
 })
 const end=riverPoints.at(-1),a=ease((t-4)/.8)
 line(g,end[0],end[1],end[0]+97,end[1]-66,{color:C.red,width:1.5,alpha:a})
 text(g,'黄河三角洲',end[0]+111,end[1]-61,27,{color:C.red,alpha:a})
 dot(g,1610,818,5,C.ink);text(g,'城市中心',1630,827,24,{color:C.muted})
 line(g,1380,818,1420,818,{color:C.red,width:4});text(g,'黄河',1436,827,24,{color:C.muted})
 text(g,map.display.footnote,1820,882,24,{align:'right',color:C.muted})
}
async function searchScene(t,s){
 head(2,'检索 · 找诗',['从一句诗','找到原文'],['输入「望岳」','看见作品的入口'],t,{size:58})
 marker(130,706,'1',t<3.5?'输入关键词':'找到《望岳》',t-.6)
 caption('实际界面 · 诗词检索',566,186)
 const im=await shot('search',t,s),p=smooth(phase(t,5.9,7.2))
 const sw=lerp(1300,1000,p),sh=sw*670/1255
 screen(im,{x:566,y:211,w:1255,h:670,sx:lerp(72,75,p),sy:lerp(196,218,p),sw,sh})
}
async function detailScene(t,s){
 head(3,'阅读 · 原文',['会当凌绝顶','一览众山小'],['《望岳》  /  杜甫','先读原文，再看注解'],t,{size:57})
 line(g,111,654,462,654,{color:C.red,progress:ease((t-.5)/1.2)})
 marker(132,748,'2',t<5.7?'读完整首诗':'展开注解',t-.7)
 caption('实际界面 · 原文与注解',620,184)
 const im=await shot('detail',t,s),p=smooth(phase(t,1.75,3.25))
 // Follow the recorded scroll so the poem remains in the reading area.
 const sw=1100,sh=sw*678/1180
 screen(im,{x:620,y:210,w:1180,h:678,sx:170,sy:lerp(265,192,p),sw,sh})
}
function connection(t){
 label(g,4,'关系 · 从诗到人、到地')
 text(g,'一首诗，有了坐标。',106,324,70,{font:FONT.serif,weight:600,alpha:ease(t/.7)})
 const yy=622,xx=[345,945,1545],aa=[ease((t-.3)/.7),ease((t-1.2)/.7),ease((t-2.1)/.7)]
 line(g,xx[0],yy,xx[2],yy,{color:C.line,width:2})
 line(g,xx[0],yy,xx[1],yy,{color:C.red,width:3,progress:ease((t-1)/1)})
 line(g,xx[1],yy,xx[2],yy,{color:C.red,width:3,progress:ease((t-2)/1)})
 const entries=[['诗','望岳','岱宗夫如何'],['人','杜甫','唐代诗人'],['地','泰山','诗中所望之山']]
 entries.forEach(([k,v,d],i)=>{
  dot(g,xx[i],yy,13,C.paper);dot(g,xx[i],yy,6,C.red,aa[i]);text(g,k,xx[i],481,28,{align:'center',color:C.muted,alpha:aa[i]});text(g,v,xx[i],569,76,{font:FONT.serif,align:'center',weight:600,alpha:aa[i]});text(g,d,xx[i],714,31,{align:'center',color:C.muted,alpha:aa[i]})
 })
 caption('内容关系示意',1570,868)
}
async function poetScene(t,s){
 head(5,'人物 · 继续阅读',['由一首诗','走近一个人'],['杜甫','生平与作品，接着读'],t,{size:58})
 marker(130,730,'3',t<4.5?'走近诗人':'继续读作品',t-.7)
 caption('实际界面 · 杜甫',650,184)
 const im=await shot('poet',t,s),p=smooth(phase(t,5.9,7.8)),sw=lerp(760,370,p),h=lerp(660,420,p)
 screen(im,{x:650,y:lerp(211,331,p),w:1160,h,sx:lerp(630,833,p),sy:lerp(169,483,p),sw,sh:sw*h/1160})
}
async function learnScene(t,s){
 head(6,'研学 · 提出问题',['把阅读','变成问题'],null,t,{size:58})
 const labels=['读证据','作比较','写思考']
 labels.forEach((v,i)=>marker(130,563+i*108,String(i+1),v,t-.5-i*.7))
 caption('实际界面 · 研学入口',575,184)
 const im=await shot('learn',t,s),p=smooth(phase(t,1.9,4.1))
 screen(im,{x:575,y:211,w:1235,h:667,sx:178,sy:lerp(230,146,p),sw:1085,sh:1085*667/1235})
}
function journey(t){
 label(g,7,'探索 · 自己的线索')
 text(g,'阅读，不止于这一页。',106,330,76,{font:FONT.serif,weight:600,alpha:ease(t/.8)})
 const pts=[[236,654],[714,561],[1192,682],[1670,547]],names=['诗词','人物','地点','研学'],details=['找到一首诗','走近一位诗人','认识一处山河','提出自己的问题']
 path(g,pts,{color:C.line,width:2});path(g,pts,{color:C.red,width:3,progress:ease((t-.4)/3.7)})
 pts.forEach(([x,y],i)=>{const a=ease((t-.5-i*.75)/.7);dot(g,x,y,16,C.paper);dot(g,x,y,7,C.red,a);text(g,names[i],x,y-61,54,{font:FONT.serif,align:'center',weight:600,alpha:a});text(g,details[i],x,y+83,29,{align:'center',color:C.muted,alpha:a})})
}
function closing(t){
 const a=ease(t/.9)
 seal(g,929,203,'齐鲁',62)
 text(g,'山河有迹',960,430,106,{align:'center',font:FONT.serif,weight:600,alpha:a})
 text(g,'文脉有声',960,578,106,{align:'center',font:FONT.serif,weight:600,alpha:ease((t-.4)/.9)})
 line(g,708,643,1212,643,{color:C.red,width:3,progress:ease((t-.9)/1.5)})
 text(g,'让诗与山河，重新相遇。',960,738,43,{align:'center',alpha:ease((t-1.5)/1)})
 text(g,'齐鲁文脉  ·  诗词与文化探索',960,831,29,{align:'center',color:C.muted,alpha:ease((t-2)/1)})
}
const renderers={opening,map:geography,search:searchScene,detail:detailScene,connection,poet:poetScene,learn:learnScene,journey,closing}
async function frame(time){
 time=clamp(time,0,plan.total-1/plan.fps)
 const index=plan.scenes.findLastIndex(s=>s.start<=time),scene=plan.scenes[index],t=time-scene.start
 backdrop(g);await renderers[scene.id](t,scene);footer(g,scene,time,plan,index)
 return {id:scene.id,index,time}
}
window.__film={plan,total:plan.total,frame,issues,errors,captureMode:'real-interaction-sequence'}
await frame(0)
document.querySelector('#status').textContent='ready'
if(new URLSearchParams(location.search).has('play')){
 const started=performance.now();let busy=false
 setInterval(async()=>{if(busy)return;busy=true;try{await frame(((performance.now()-started)/1000)%plan.total)}finally{busy=false}},1000/30)
}
