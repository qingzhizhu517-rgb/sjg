// Generates one audio file per narration line with macOS `say`, then measures it.
// Per-line files (instead of one long take) let the shot timeline follow the voice.
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LINES, VOICE, RATE } from '../src/narration.js'

const run = promisify(execFile)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, '.build/narration')
const rawDir = resolve(root, '.build/narration/raw')
mkdirSync(rawDir, { recursive: true })

const force = process.argv.includes('--force')

async function ffprobeDuration(file) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file,
  ])
  return Number(stdout.trim())
}

const results = []
for (const line of LINES) {
  const aiff = resolve(rawDir, `${line.id}.aiff`)
  const wav = resolve(outDir, `${line.id}.wav`)

  if (force || !existsSync(aiff)) {
    await run('say', ['-v', VOICE, '-r', String(RATE), '-o', aiff, line.text])
  }
  // 48 kHz stereo, loudness-normalised, 250 ms tail so cuts do not clip the last syllable.
  await run('ffmpeg', [
    '-v', 'error', '-y', '-i', aiff,
    '-af', `highpass=f=70,loudnorm=I=-18:TP=-2:LRA=11,apad=pad_dur=0.25`,
    '-ar', '48000', '-ac', '2', wav,
  ])
  const duration = await ffprobeDuration(wav)
  results.push({ ...line, file: wav, duration: Number(duration.toFixed(3)) })
  console.log(`${line.id.padEnd(9)} ${duration.toFixed(2)}s  ${line.text}`)
}

const total = results.reduce((a, b) => a + b.duration, 0)
const manifest = { voice: VOICE, rate: RATE, generatedAt: new Date().toISOString(), total: Number(total.toFixed(3)), lines: results }
writeFileSync(resolve(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`\ntotal speech: ${total.toFixed(2)}s across ${results.length} lines`)
