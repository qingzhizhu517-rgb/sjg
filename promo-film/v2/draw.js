export const W=1920,H=1080
export const C={paper:'#F4F1E9',white:'#FFFEFA',ink:'#263D37',muted:'#69766D',line:'#C9CDBF',red:'#A54838',sage:'#AABDAA',pale:'#E4E9DE',water:'#E3EBE6'}
export const FONT={serif:'"Songti SC", "STSong", serif',sans:'"PingFang SC", sans-serif',latin:'"Avenir Next", sans-serif'}
export const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n))
export const ease=n=>1-Math.pow(1-clamp(n),3)
export const smooth=n=>{n=clamp(n);return n*n*(3-2*n)}
export const phase=(t,a,b)=>clamp((t-a)/(b-a))
export const lerp=(a,b,p)=>a+(b-a)*p
export const issues=[]
const seen=new Set()
export function text(g,s,x,y,size=36,{color=C.ink,align='left',font=FONT.sans,weight=400,alpha=1,maxWidth,baseline='alphabetic'}={}){
 if(alpha<=0||!s)return
 g.save();g.globalAlpha*=alpha;g.font=`${weight} ${size}px ${font}`;g.fillStyle=color;g.textAlign=align;g.textBaseline=baseline
 const m=g.measureText(s),w=m.width,l=x-(align==='center'?w/2:align==='right'?w:0)
 if((maxWidth&&w>maxWidth+1)||l<40||l+w>W-40||y>H-35||y-size<25){const key=s+'@'+Math.round(x)+','+Math.round(y);if(!seen.has(key)){seen.add(key);issues.push({text:s,x,y,width:w,size,maxWidth})}}
 g.fillText(s,x,y);g.restore()
}
export function lines(g,ss,x,y,size=36,opts={}){ss.forEach((s,i)=>text(g,s,x,y+i*(opts.leading||size*1.6),size,opts))}
export function line(g,x1,y1,x2,y2,{color=C.line,width=2,progress=1,alpha=1,dash=[]}={}){g.save();g.globalAlpha*=alpha;g.strokeStyle=color;g.lineWidth=width;g.setLineDash(dash);g.beginPath();g.moveTo(x1,y1);g.lineTo(lerp(x1,x2,progress),lerp(y1,y2,progress));g.stroke();g.restore()}
export function round(g,x,y,w,h,r=12,{fill=C.white,stroke=null,alpha=1,shadow=false}={}){g.save();g.globalAlpha*=alpha;if(shadow){g.shadowColor='rgba(40,52,41,.12)';g.shadowBlur=24;g.shadowOffsetY=10}g.fillStyle=fill;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();g.shadowColor='transparent';if(stroke){g.strokeStyle=stroke;g.lineWidth=1.5;g.stroke()}g.restore()}
export function dot(g,x,y,r=5,color=C.red,alpha=1){g.save();g.globalAlpha*=alpha;g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();g.restore()}
export function path(g,pts,{color=C.red,width=3,progress=1,alpha=1}={}){if(!pts.length||progress<=0)return;g.save();g.globalAlpha*=alpha;g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';const lens=[0];for(let i=1;i<pts.length;i++)lens.push(lens[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));const stop=lens.at(-1)*clamp(progress);g.beginPath();g.moveTo(...pts[0]);for(let i=1;i<pts.length;i++){if(lens[i]<=stop)g.lineTo(...pts[i]);else{const q=(stop-lens[i-1])/(lens[i]-lens[i-1]||1);g.lineTo(lerp(pts[i-1][0],pts[i][0],q),lerp(pts[i-1][1],pts[i][1],q));break}}g.stroke();g.restore()}
export function wrap(s,max=29){const out=[];let tmp='';for(const c of s){tmp+=c;if(tmp.length>=max){out.push(tmp);tmp=''}}if(tmp)out.push(tmp);return out}
export function seal(g,x,y,word='齐鲁',size=66){g.save();g.strokeStyle=C.red;g.lineWidth=2;g.strokeRect(x,y,size,size);text(g,word,x+size/2,y+size*.65,size*.35,{color:C.red,font:FONT.serif,weight:600,align:'center'});g.restore()}
export function backdrop(g){g.fillStyle=C.paper;g.fillRect(0,0,W,H);g.fillStyle='rgba(83,107,84,.025)';for(let x=96;x<W;x+=96){g.fillRect(x,132,1,760)}line(g,88,102,1832,102,{width:1});text(g,'SJG  /  齐鲁文脉',88,69,23,{weight:500});}
const subtitles={
 opening:['一首诗，能带我们走进怎样的山河？'],
 map:['沿着黄河，认识山东九城。','让城市、诗人与作品，','在一幅文化地图中相遇。'],
 search:['从一句熟悉的诗开始。','输入望岳，找到杜甫的作品。'],
 detail:['打开原文，读完整首诗，再展开注解。','让每一次探索，都从文本出发。'],
 connection:['望岳，连着杜甫，也连着泰山。','一首诗，让文字与地点有了联系。'],
 poet:['走近杜甫，继续阅读他的作品。','让一首诗，成为下一次阅读的起点。'],
 learn:['进入研学入口。','读证据，作比较，写思考，','把阅读变成自己的问题。'],
 journey:['从诗词到人物，从地点到研学，','沿着自己的线索，继续探索。'],
 closing:['山河有迹，文脉有声。','让诗与山河，重新相遇。'],
}
export function footer(g,scene,t,plan,index){
 text(g,`${String(index+1).padStart(2,'0')} / ${String(plan.scenes.length).padStart(2,'0')}`,1832,69,22,{align:'right',color:C.muted,font:FONT.latin})
 line(g,88,1026,1832,1026,{width:1});line(g,88,1026,1832,1026,{width:3,color:C.red,progress:t/plan.total})
 const local=t-scene.start,subs=subtitles[scene.id],total=subs.reduce((sum,s)=>sum+s.length,0)
 let pos=clamp((local-.4)/scene.speech)*total,sub=subs.at(-1)
 for(const s of subs){if(pos<s.length){sub=s;break}pos-=s.length}
 if(local>.3)text(g,sub,960,967,36,{align:'center',color:C.ink,alpha:Math.min(ease((local-.3)/.5),clamp((scene.duration-local)/.3))})
}
export function label(g,n,title,x=96,y=184){text(g,`0${n}`,x,y,26,{font:FONT.latin,color:C.red,weight:500});line(g,x+58,y-9,x+108,y-9,{color:C.red});text(g,title,x+132,y,28,{color:C.muted})}
