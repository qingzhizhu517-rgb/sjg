// GLSL ES 3.0 fragment shader for the film's "wet ink" pass.
// Input is a flat composited art board (Canvas2D); this pass adds everything that
// makes it read as ink on paper rather than a screenshot: domain-warped water,
// a flowing river band, fibre erosion, wet edges, paper grain and a film grade.
export const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

export const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uBoard;   // composited art
uniform sampler2D uPaper;   // paper fibre (grayscale-ish, near white)
uniform vec2  uRes;
uniform float uTime;        // seconds since film start
uniform float uFlow;        // river flow strength
uniform float uRiverY;      // river band centre, canvas space (0 = top, 1 = bottom)
uniform float uRiverW;      // river band half-width
uniform float uRiverTilt;   // band slope
uniform float uWarp;        // global liquid warp
uniform float uInk;         // ink erosion (white blowout through fibres)
uniform float uWet;         // dark wet edges around marks
uniform float uBloomAmt;    // radial ink bloom, 0 off
uniform vec2  uBloomAt;     // canvas space, y up
uniform float uBloomR;
uniform float uBloomDark;   // 1 = ink spreading dark, 0 = pale wash
uniform float uGrain;
uniform float uVignette;
uniform float uAbr;         // chromatic aberration, in px
uniform vec3  uTint;
uniform float uTintAmt;
uniform float uLift;        // paper bloom in shadows
uniform float uBleach;      // overall fade to paper
uniform float uLetterbox;   // 0..1 height of bars
uniform float uShake;       // handheld micro-motion amount
uniform float uWipe;        // 0 = untouched, 1 = fully bleached to paper
uniform float uWipeSeed;    // decorrelates the wipe pattern between cuts

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1, 0)), u.x),
             mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * vnoise(p); p = m * p; a *= 0.5; }
  return v;
}

// Canvas-space coordinate: matches top-left origin of the 2D art board when read
// as (cs.x, 1.0 - cs.y). All scene-authored uniforms use this space.
vec2 toCanvas(vec2 v) { return vec2(v.x, 1.0 - v.y); }

vec3 sampleBoard(vec2 uv) {
  vec2 px = 1.0 / uRes;
  if (uAbr <= 0.0) return texture(uBoard, uv).rgb;
  vec2 d = px * uAbr;
  return vec3(
    texture(uBoard, uv + d).r,
    texture(uBoard, uv).g,
    texture(uBoard, uv - d).b
  );
}

void main() {
  vec2 uv = vUv;
  vec2 cs = toCanvas(vUv);

  // handheld drift: low-frequency sway, like a camera on a monopod
  cs += uShake * vec2(
    sin(uTime * 0.63 + cs.y * 2.4),
    cos(uTime * 0.51 + cs.x * 2.1)
  ) * 0.0016;
  uv = vec2(cs.x, 1.0 - cs.y);

  // liquid warp: everything breathes as if seen through moving water
  if (uWarp > 0.0) {
    float n = fbm(cs * 3.1 + vec2(uTime * 0.055, -uTime * 0.038));
    float n2 = fbm(cs * 6.7 - vec2(uTime * 0.031, uTime * 0.044) + n);
    cs += (vec2(n, n2) - 0.5) * uWarp;
    uv = vec2(cs.x, 1.0 - cs.y);
  }

  vec3 col = sampleBoard(clamp(uv, vec2(0.001), vec2(0.999)));

  // ---- flowing river band -------------------------------------------------
  if (uFlow > 0.0) {
    float centre = uRiverY + uRiverTilt * (cs.x - 0.5);
    float wob = 0.035 * sin(cs.x * 5.3 + uTime * 0.42)
              + 0.020 * sin(cs.x * 11.7 - uTime * 0.71);
    float band = exp(-pow(abs(cs.y - centre - wob) / max(uRiverW, 0.001), 2.0) * 1.6);

    // streaked current: strongly anisotropic noise scrolling downstream
    float cur = fbm(vec2((cs.x + uTime * 0.10) * 2.1, (cs.y - centre) * 46.0));
    float cur2 = fbm(vec2((cs.x - uTime * 0.06) * 4.6, (cs.y - centre) * 96.0));
    float sheen = smoothstep(0.55, 0.95, cur * 0.65 + cur2 * 0.35);

    col += band * uFlow * (0.16 * sheen + 0.05 * cur);
    col -= band * uFlow * 0.07 * (1.0 - sheen);
    // a hot highlight line where the current catches light
    col += band * uFlow * 0.22 * pow(sheen, 3.0);
  }

  // ---- ink bloom (a drop spreading) --------------------------------------
  if (uBloomAmt > 0.0) {
    float aspect = uRes.x / uRes.y;
    float d = distance(cs * vec2(aspect, 1.0), uBloomAt * vec2(aspect, 1.0));
    float edge = fbm(cs * 9.0 + uTime * 0.12) * 0.55 + fbm(cs * 22.0) * 0.25;
    float r = uBloomR * (0.55 + edge);
    float m = 1.0 - smoothstep(r * 0.72, r, d);
    if (uBloomDark > 0.5) {
      col = mix(col, col * 0.18 - 0.02, m * uBloomAmt * 0.92);
    } else {
      col = mix(col, col + 0.30 * m, uBloomAmt * 0.6);
    }
    // wet ring at the leading edge
    float ring = smoothstep(r * 0.7, r * 0.94, d) * (1.0 - smoothstep(r * 0.94, r * 1.12, d));
    col -= ring * uBloomAmt * 0.10 * uBloomDark;
  }

  // ---- fibre erosion + wet edges -----------------------------------------
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  if (uInk > 0.0) {
    float fib = fbm(cs * vec2(180.0, 46.0) + uTime * 0.02);
    float ero = smoothstep(0.42, 0.86, fib);
    col = mix(col, mix(col, vec3(1.0, 0.985, 0.95), ero), uInk * 0.5);
  }
  if (uWet > 0.0) {
    vec2 px = 1.0 / uRes;
    float l = dot(texture(uBoard, uv - vec2(px.x * 3.0, 0)).rgb, vec3(0.299, 0.587, 0.114));
    float r = dot(texture(uBoard, uv + vec2(px.x * 3.0, 0)).rgb, vec3(0.299, 0.587, 0.114));
    float t = dot(texture(uBoard, uv - vec2(0, px.y * 3.0)).rgb, vec3(0.299, 0.587, 0.114));
    float b = dot(texture(uBoard, uv + vec2(0, px.y * 3.0)).rgb, vec3(0.299, 0.587, 0.114));
    float edge = abs(l - r) + abs(t - b);
    col -= smoothstep(0.02, 0.30, edge) * uWet * (1.0 - lum) * 0.35;
  }

  // ---- paper ---------------------------------------------------------------
  vec3 paper = texture(uPaper, cs * vec2(uRes.x / 1024.0, uRes.y / 1024.0)).rgb;
  paper += (hash21(cs * uRes + uTime) - 0.5) * uGrain * 0.06;
  float soft = smoothstep(0.02, 0.65, lum);
  col = mix(col * paper * 1.02, col, soft * 0.82);

  // ---- grade ---------------------------------------------------------------
  col = mix(col, uTint * (0.35 + lum * 0.9), uTintAmt);
  col = mix(col, vec3(1.0, 0.988, 0.962), uLift * (1.0 - smoothstep(0.0, 0.42, lum)));
  col = mix(col, vec3(0.968, 0.953, 0.922), uBleach);

  float v = smoothstep(1.22, 0.35, length((cs - 0.5) * vec2(1.06, 1.0)) * 1.32);
  col *= mix(1.0, v, uVignette);
  col += (hash21(cs * uRes * 1.7 + fract(uTime) * 91.7) - 0.5) * uGrain * 0.045;

  // ---- section transition: paper bleeds across the frame -------------------
  // A ragged fbm edge eats the picture into paper and releases it again, so cuts
  // between sections read as ink soaking through the sheet rather than a hard cut.
  if (uWipe > 0.001) {
    float n = fbm(cs * 5.5 + vec2(uWipeSeed * 37.0, uWipeSeed * 19.0)) * 1.15;
    float m = smoothstep(uWipe - 0.22, uWipe + 0.10, n);
    col = mix(vec3(0.968, 0.953, 0.922), col, m);
  }

  if (uLetterbox > 0.0) {
    float bar = uLetterbox;
    if (cs.y < bar || cs.y > 1.0 - bar) col = vec3(0.045, 0.043, 0.047);
  }

  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
