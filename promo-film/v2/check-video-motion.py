"""Check actual encoded motion, excluding captions and decorative animation."""
from pathlib import Path
import json, subprocess
import numpy as np

root=Path(__file__).resolve().parent
plan=json.loads((root/'plan.json').read_text())
starts={s['id']:s['start'] for s in plan['scenes']}
intervals={'search':(4.95,5.85),'detail':(1.5,2.4),'poet':(2,3.5),'learn':(1.9,3.1)}
filenames={'before':'山河有迹·文脉有声-清晰叙事版.mp4','after':'山河有迹·文脉有声-滚动修复版.mp4'}
report={}
for version,name in filenames.items():
 rows=[]
 for scene,(a,b) in intervals.items():
  first=round((starts[scene]+.55+a)*30);last=round((starts[scene]+.55+b)*30)
  filt=f'trim=start_frame={first}:end_frame={last},setpts=PTS-STARTPTS,crop=1000:500:700:300,scale=500:250,format=gray'
  raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(root.parent/'dist'/name),'-vf',filt,'-an','-fps_mode','passthrough','-f','rawvideo','-pix_fmt','gray','pipe:1'])
  frames=np.frombuffer(raw,dtype=np.uint8).reshape(-1,250,500).astype(np.float32)
  assert len(frames)==last-first, (scene,len(frames),last-first)
  d=np.abs(np.diff(frames,axis=0)).mean(axis=(1,2))
  # Encoder noise on held frames stays below 0.1 gray levels on this fixed crop.
  moving=float((d>.1).mean())
  rows.append({'scene':scene,'frames':len(frames),'changedFraction':moving,'minimumDifference':float(d.min()),'medianDifference':float(np.median(d)),'passed':moving>=.85})
 report[version]=rows
report['passed']=all(r['passed'] for r in report['after'])
(root/'quality/encoded-motion.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
if not report['passed']:raise SystemExit(1)
