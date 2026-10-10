// Final assembly: narration placed at plan times → voice bus (EQ + room) →
// score ducked under the voice → loudness-normalised master → mux with frames.
import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const build = resolve(root, '.build')
const plan = JSON.parse(readFileSync(resolve(build, 'plan.json'), 'utf8'))
const frames = resolve(build, 'frames')
const out = resolve(root, process.argv[2] || 'dist/山河有迹·文脉有声.mp4')

const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' })

// 1) voice track
const inputs = []
const chains = []
plan.narration.forEach((n, i) => {
  inputs.push('-i', n.file)
  const ms = Math.round(n.start * 1000)
  chains.push(`[${i}:a]adelay=${ms}|${ms}[v${i}]`)
})
const mixIn = plan.narration.map((_, i) => `[v${i}]`).join('')
const voiceGraph = [
  ...chains,
  `${mixIn}amix=inputs=${plan.narration.length}:normalize=0,` +
  // warm, close narrator: trim rumble, a little body, tame sibilance, small room
  'highpass=f=85,equalizer=f=180:t=q:w=1.1:g=2.5,equalizer=f=3200:t=q:w=1.4:g=1.5,' +
  'equalizer=f=7500:t=q:w=2:g=-3,acompressor=threshold=-20dB:ratio=3:attack=8:release=180,' +
  `aecho=0.8:0.55:42|71:0.22|0.14,apad=whole_dur=${plan.total}[voice]`,
].join(';')
ff([...inputs, '-filter_complex', voiceGraph, '-map', '[voice]', '-ar', '48000', '-ac', '2', resolve(build, 'voice.wav')])

// 2) master: duck the score under the voice
ff([
  '-i', resolve(build, 'score.wav'), '-i', resolve(build, 'voice.wav'),
  '-filter_complex',
  '[1:a]asplit=2[vk][vm];' +
  '[0:a][vk]sidechaincompress=threshold=0.04:ratio=5:attack=40:release=650:makeup=1[duck];' +
  // score sits high on purpose: the bed should be felt under the narration, and the
  // sidechain above already pulls it down whenever the voice speaks
  '[duck]volume=1.35[bed];' +
  `[bed][vm]amix=inputs=2:normalize=0,atrim=0:${plan.total},loudnorm=I=-16:TP=-1.5:LRA=11[m]`,
  '-map', '[m]', '-ar', '48000', resolve(build, 'master-pre.wav'),
])
// single-pass loudnorm lands ~4 LU low on this material; a second pass hits -16
ff(['-i', resolve(build, 'master-pre.wav'), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', resolve(build, 'master.wav')])

// 3) picture + sound
if (!existsSync(frames) || !readdirSync(frames).some((f) => f.endsWith('.jpg'))) {
  console.log('no frames yet — audio mixed to .build/master.wav')
  process.exit(0)
}
execFileSync('mkdir', ['-p', dirname(out)])
ff([
  '-framerate', String(plan.fps), '-i', resolve(frames, 'f%05d.jpg'),
  '-i', resolve(build, 'master.wav'),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  '-tune', 'film', '-movflags', '+faststart',
  '-c:a', 'aac', '-b:a', '256k', '-shortest', out,
])
const web = out.replace(/\.mp4$/, '-web.mp4')
ff(['-i', out, '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-maxrate', '12M', '-bufsize', '24M',
  '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', web])
console.log(`→ ${out}\n→ ${web}`)
