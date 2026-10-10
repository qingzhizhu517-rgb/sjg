// Original score, synthesised from scratch (no samples, no third-party audio):
//   - drone: two detuned low sines + slow-breathing fifth
//   - water: brown noise through a moving lowpass, swells with the river shots
//   - qin:   Karplus–Strong plucks on a Chinese pentatonic (宫商角徵羽, D gong)
//   - hits:  pitched low "drum" on act and section changes
// Output: .build/score.wav, 48 kHz stereo, exactly plan.total seconds.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const plan = JSON.parse(readFileSync(resolve(root, '.build/plan.json'), 'utf8'))
const SR = 48000
const N = Math.ceil((plan.total + 0.5) * SR)
const L = new Float32Array(N)
const R = new Float32Array(N)

let seed = 20261002
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)

const shot = (id) => plan.scenes.find((s) => s.id === id)
const startOf = (id) => shot(id).start
const endOf = (id) => shot(id).start + shot(id).duration

// D pentatonic, low to high (Hz)
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12)
const PENTA = [50, 52, 54, 57, 59, 62, 64, 66, 69, 71, 74, 76, 78, 81].map(midi)

// ---- envelope helpers -------------------------------------------------------
const smooth = (x) => x * x * (3 - 2 * x)
function curve(points) {
  // piecewise-linear automation, smoothed
  return (t) => {
    if (t <= points[0][0]) return points[0][1]
    for (let i = 1; i < points.length; i++) {
      if (t <= points[i][0]) {
        const [t0, v0] = points[i - 1]
        const [t1, v1] = points[i]
        return v0 + (v1 - v0) * smooth((t - t0) / (t1 - t0))
      }
    }
    return points[points.length - 1][1]
  }
}

const T = plan.total
const actII = startOf('peak')
const ui = startOf('ui-poems')
const gather = startOf('gather')
const closing = startOf('closing')

// ---- drone: six layers, each breathing on its own slow cycle ----------------
// Two detuned sines read as "cold and sparse". Stacking sub + octave + fifth with
// unrelated LFO periods (0.037–0.113 Hz) gives a bed that never quite repeats and
// sits still rather than pulsing underneath everything.
const droneAmp = curve([
  [0, 0], [1.0, 0.0], [4.0, 0.15], [startOf('city-0'), 0.17], [endOf('city-8'), 0.20],
  [actII, 0.17], [ui, 0.13], [gather, 0.17], [closing, 0.20], [T - 2.5, 0.12], [T, 0],
])
{
  const layers = [
    { m: 26, det: 1, gain: 0.30, lfo: 0.037, ph: 0.0 },      // D1 — sub
    { m: 38, det: 1, gain: 0.46, lfo: 0.053, ph: 1.1 },      // D2
    { m: 38, det: 1.0031, gain: 0.42, lfo: 0.061, ph: 2.3 }, // D2 detuned
    { m: 45, det: 1, gain: 0.28, lfo: 0.083, ph: 0.7 },      // A2
    { m: 50, det: 1.0022, gain: 0.20, lfo: 0.097, ph: 3.1 }, // D3
    { m: 53, det: 1, gain: 0.11, lfo: 0.113, ph: 1.9 },      // F3
  ]
  const ph = layers.map(() => 0)
  for (let i = 0; i < N; i++) {
    const t = i / SR
    const a = droneAmp(t)
    let v = 0
    for (let k = 0; k < layers.length; k++) {
      const ly = layers[k]
      ph[k] += (2 * Math.PI * midi(ly.m) * ly.det) / SR
      const breathe = 0.5 + 0.5 * Math.sin(2 * Math.PI * ly.lfo * t + ly.ph)
      v += ly.gain * breathe * Math.sin(ph[k])
    }
    L[i] += v * a * 0.94
    R[i] += v * a
  }
}

// ---- pad: a slow harmonic bed ------------------------------------------------
// One triad at a time, crossfading over 6 s, so the harmony turns over roughly
// twice a minute instead of on every cut — this is what turns the bed from a
// drone into something you sink into.
const XFADE = 6.0
const PROG = [
  { at: 0, notes: [50, 53, 57] },                  // Dm
  { at: startOf('city-0'), notes: [46, 50, 53] },  // Bb
  { at: startOf('bond'), notes: [41, 45, 48] },    // F
  { at: startOf('peak'), notes: [48, 52, 55] },    // C
  { at: startOf('gather'), notes: [45, 48, 52] },  // Am
  { at: startOf('numbers'), notes: [41, 45, 48] }, // F
  { at: startOf('closing'), notes: [50, 53, 57] }, // Dm
]
PROG.forEach((c, k) => {
  const nxt = PROG[k + 1]
  c.weight = (t) => {
    const rise = Math.min(1, Math.max(0, (t - c.at) / XFADE))
    const fall = nxt
      ? Math.min(1, Math.max(0, (nxt.at - t) / XFADE))
      : Math.min(1, Math.max(0, (T + 0.5 - t) / 3.0))
    return smooth(rise) * smooth(fall)
  }
})
const padAmp = curve([
  [0, 0], [1.5, 0.0], [5.0, 0.10], [startOf('city-0'), 0.12], [endOf('city-8'), 0.15],
  [actII, 0.13], [ui, 0.10], [gather, 0.14], [startOf('numbers'), 0.15],
  [startOf('closing'), 0.17], [T - 3.0, 0.10], [T, 0],
])
{
  const notes = [...new Set(PROG.flatMap((c) => c.notes))]
  const idx = new Map(notes.map((m, k) => [m, k]))
  const freq = notes.map(midi)
  const wts = new Float32Array(notes.length)
  // Float64 phase accumulators: in Float32 the increment (~0.024 rad/sample) falls
  // below the representable step once the phase passes ~131k rad, and the voice
  // then freezes into a DC offset.
  const ph = new Float64Array(notes.length)
  for (let k = 0; k < notes.length; k++) ph[k] = rnd() * Math.PI * 2
  for (let i = 0; i < N; i++) {
    const t = i / SR
    const a = padAmp(t)
    if (a <= 0.0005) continue
    wts.fill(0)
    for (const c of PROG) {
      const cw = c.weight(t)
      if (cw <= 0.0005) continue
      for (const m of c.notes) wts[idx.get(m)] += cw
    }
    let v = 0
    for (let k = 0; k < notes.length; k++) {
      const w = wts[k]
      if (w <= 0.0005) continue
      ph[k] += (2 * Math.PI * freq[k]) / SR
      const p = ph[k]
      // three detuned partials per voice — a soft choral bloom rather than a sine
      v += w * (Math.sin(p) + 0.40 * Math.sin(p * 1.0037) + 0.16 * Math.sin(p * 2.0011 + 1.3))
    }
    L[i] += v * a * 0.052 * 0.94
    R[i] += v * a * 0.052
  }
}

// ---- water ------------------------------------------------------------------
const waterAmp = curve([
  [0, 0], [startOf('title'), 0.02], [startOf('riverHold'), 0.09], [endOf('riverHold'), 0.07],
  [startOf('nineCard'), 0.04], [startOf('city-0'), 0.05], [endOf('city-8'), 0.08],
  [startOf('bond'), 0.06], [actII, 0.03], [ui, 0.015], [gather, 0.05], [startOf('numbers'), 0.02],
  [closing, 0.07], [T, 0],
])
{
  let bl = 0, br = 0, lpL = 0, lpR = 0
  for (let i = 0; i < N; i++) {
    const t = i / SR
    bl = (bl + 0.02 * (rnd() * 2 - 1)) / 1.02
    br = (br + 0.02 * (rnd() * 2 - 1)) / 1.02
    // cutoff MUST stay positive. A negative one flips this one-pole into positive
    // feedback and the whole track diverges to Infinity within a second of the
    // moment the two LFOs line up on their troughs (t≈13.3 s in this film) — after
    // which the peak normaliser divides by Infinity and the score comes out silent.
    const cutoff = Math.max(0.004, 0.035 + 0.025 * Math.sin(t * 0.37) + 0.015 * Math.sin(t * 1.3))
    lpL += cutoff * (bl - lpL)
    lpR += cutoff * (br - lpR)
    const a = waterAmp(t) * 9
    L[i] += lpL * a
    R[i] += lpR * a
  }
}

// ---- qin plucks (Karplus–Strong) -------------------------------------------
// With the drone and pad now carrying the bed, the qin is an accent points on the
// structure rather than the main voice — hence the global PLUCK_GAIN.
const PLUCK_GAIN = 0.60
function pluck(t0, freq, amp = 0.3, pan = 0, decay = 0.996, bright = 0.5) {
  const start = Math.floor(t0 * SR)
  const period = Math.max(2, Math.round(SR / freq))
  const buf = new Float32Array(period)
  for (let i = 0; i < period; i++) buf[i] = (rnd() * 2 - 1) * (0.6 + 0.4 * bright)
  let idx = 0
  const len = Math.min(N - start, Math.floor(SR * 4.5))
  const gl = Math.cos((pan + 1) * Math.PI / 4)
  const gr = Math.sin((pan + 1) * Math.PI / 4)
  // a slight pitch bend down on attack, like a qin slide (吟猱)
  for (let n = 0; n < len; n++) {
    const a = buf[idx]
    const b = buf[(idx + 1) % period]
    buf[idx] = decay * (bright * a + (1 - bright) * 0.5 * (a + b))
    const env = n < 96 ? n / 96 : 1
    const v = a * amp * PLUCK_GAIN * env
    L[start + n] += v * gl
    R[start + n] += v * gr
    idx = (idx + 1) % period
  }
}

// motif: 宫 角 徵 … 羽 — a falling-rising river phrase
const MOTIF = [7, 9, 8, 5, 6, 4]
function phrase(t0, { step = 0.62, transpose = 0, amp = 0.26, pan = -0.2 } = {}) {
  MOTIF.forEach((deg, k) => {
    const d = Math.min(PENTA.length - 1, Math.max(0, deg + transpose))
    pluck(t0 + k * step + (rnd() - 0.5) * 0.04, PENTA[d], amp * (k === 0 ? 1.1 : 1), pan + (k % 2 ? 0.25 : -0.25), 0.9965, 0.45)
  })
}

// opening: one struck note on the seal, then the motif with the title
pluck(startOf('black') + 0.95, PENTA[5], 0.34, 0, 0.9975, 0.4)
pluck(startOf('black') + 0.98, PENTA[0], 0.18, 0, 0.998, 0.3)
phrase(startOf('title') + 0.4, { step: 0.7 })
phrase(startOf('riverHold') + 0.6, { step: 0.82, transpose: -2, amp: 0.2 })

// nine cities: one note per city, stepping up the scale downstream
for (let i = 0; i < 9; i++) {
  const s = shot(`city-${i}`)
  pluck(s.start + 0.02, PENTA[3 + i] || PENTA[PENTA.length - 1], 0.27, (i % 2 ? 0.35 : -0.35), 0.9962, 0.55)
  if (i % 3 === 2) pluck(s.start + 0.02, PENTA[Math.max(0, i - 2)], 0.14, 0, 0.997, 0.35)
}
// held beats: a chord on the three accents (city-2 泰山 / city-4 大明湖 / city-8 入海)
for (const [id, base] of [['city-2', 2], ['city-4', 4], ['city-8', 1]]) {
  const t0 = startOf(id)
  ;[base, base + 2, base + 4].forEach((d, k) => pluck(t0 + k * 0.05, PENTA[d], 0.22, -0.3 + k * 0.3, 0.9975, 0.4))
}
phrase(startOf('bond') + 0.2, { step: 0.5, transpose: 1, amp: 0.2 })
phrase(startOf('peak') + 0.3, { step: 0.9, transpose: 2, amp: 0.22 })

// UI section: one note per page — sparser than before, the pad carries this stretch
for (const id of ['ui-poems', 'ui-poet', 'ui-timeline', 'ui-culture', 'ui-datav']) {
  const t0 = startOf(id)
  pluck(t0 + 0.05, PENTA[7 + Math.floor(rnd() * 4)], 0.15, rnd() * 1.2 - 0.6, 0.9958, 0.6)
}
phrase(startOf('gather') + 0.4, { step: 0.55, amp: 0.22 })
// numbers: one pluck per figure as it counts in
;[0.16, 0.25, 0.34, 0.43].forEach((f, k) => pluck(startOf('numbers') + shot('numbers').duration * f, PENTA[6 + k], 0.18, -0.4 + k * 0.27, 0.996, 0.5))
for (const id of ['ui-source', 'ui-ai', 'ui-learn']) pluck(startOf(id) + 0.05, PENTA[8], 0.15, 0, 0.996, 0.55)
// closing: the motif once more, slow, resolving on the tonic
phrase(startOf('closing') + 0.3, { step: 0.95, transpose: -1, amp: 0.24 })
pluck(T - 1.6, PENTA[0], 0.22, 0, 0.9985, 0.3)
pluck(T - 1.6, PENTA[5], 0.16, 0, 0.9985, 0.3)

// ---- low hits -----------------------------------------------------------------
function hit(t0, amp = 0.5, f0 = 62) {
  const start = Math.floor(t0 * SR)
  const len = Math.min(N - start, Math.floor(SR * 2.2))
  let ph = 0
  for (let n = 0; n < len; n++) {
    const tt = n / SR
    const f = f0 * (1 + 1.4 * Math.exp(-tt * 18))
    ph += (2 * Math.PI * f) / SR
    const env = Math.exp(-tt * 2.6) * (n < 60 ? n / 60 : 1)
    const v = amp * env * Math.sin(ph) + amp * 0.25 * env * Math.exp(-tt * 30) * (rnd() * 2 - 1)
    L[start + n] += v
    R[start + n] += v
  }
}
hit(startOf('black') + 0.95, 0.42)
hit(startOf('city-0'), 0.36)
hit(startOf('city-2'), 0.4, 55)
hit(startOf('peak'), 0.38, 58)
hit(startOf('gather'), 0.34)
hit(startOf('closing'), 0.46, 52)

// ---- stereo room (Schroeder combs) -------------------------------------------
// Six combs out to ~90 ms with g≈0.85 give an RT60 of roughly 4–6 s, so a pluck
// hangs in the room instead of stopping dead. Each comb is DC-normalised (×(1−g));
// without that the longer tail just piles up gain and turns to mud.
function reverb(ch, mix, delays) {
  const out = new Float32Array(ch.length)
  for (const [d, g] of delays) {
    const D = Math.floor(d * SR)
    const norm = 1 - g
    const comb = new Float32Array(ch.length)
    for (let i = 0; i < ch.length; i++) {
      comb[i] = ch[i] * norm + (i >= D ? comb[i - D] * g : 0)
      out[i] += comb[i] / delays.length
    }
  }
  for (let i = 0; i < ch.length; i++) ch[i] = ch[i] * (1 - mix) + out[i] * mix
}
reverb(L, 0.46, [[0.0311, 0.862], [0.0377, 0.851], [0.0439, 0.868], [0.0523, 0.844], [0.0671, 0.856], [0.0891, 0.849]])
reverb(R, 0.46, [[0.0319, 0.862], [0.0367, 0.851], [0.0451, 0.868], [0.0511, 0.844], [0.0689, 0.856], [0.0877, 0.849]])

// ---- master: fades, normalise, soft clip --------------------------------------
let peak = 0
for (let i = 0; i < N; i++) {
  const t = i / SR
  const fade = Math.min(1, t / 0.6) * Math.min(1, Math.max(0, (T + 0.3 - t) / 2.4))
  L[i] *= fade
  R[i] *= fade
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]))
}
// Guard rather than silence: a diverging feedback path makes the peak non-finite,
// and `0.88 / NaN` would quietly normalise the whole score to nothing.
if (!Number.isFinite(peak) || peak <= 0) {
  console.warn('  ! score peak is not finite — a feedback path is diverging; fix it, do not ship')
}
const gain = 0.88 / (peak || 1)
const pcm = Buffer.alloc(44 + N * 4)
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + N * 4, 4); pcm.write('WAVE', 8)
pcm.write('fmt ', 12); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22)
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34)
pcm.write('data', 36); pcm.writeUInt32LE(N * 4, 40)
for (let i = 0; i < N; i++) {
  const l = Math.tanh(L[i] * gain * 1.2) / Math.tanh(1.2)
  const r = Math.tanh(R[i] * gain * 1.2) / Math.tanh(1.2)
  pcm.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(l * 32000))), 44 + i * 4)
  pcm.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(r * 32000))), 46 + i * 4)
}
writeFileSync(resolve(root, '.build/score.wav'), pcm)
console.log(`score.wav · ${(N / SR).toFixed(2)}s · peak gain ${gain.toFixed(2)}`)
