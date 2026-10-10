// Two-stage renderer: scenes draw flat onto a Canvas2D "art board", then a single
// GL pass treats the board as wet ink on paper (warp, flow, erosion, grain, grade).
// The board is what gets uploaded as a texture, so scene code stays plain Canvas2D.
import { FRAG, VERT } from './shaders.js'
import { getPaper } from './gfx.js'

export const DEFAULTS = {
  flow: 0, riverY: 0.62, riverW: 0.18, riverTilt: -0.02,
  warp: 0.0016, ink: 0, wet: 0, bloomAmt: 0, bloomAt: [0.5, 0.5], bloomR: 0.28, bloomDark: 1,
  grain: 0.5, vignette: 0.62, abr: 0,
  tint: [1, 1, 1], tintAmt: 0, lift: 0, bleach: 0,
  letterbox: 0.075, shake: 0, wipe: 0, wipeSeed: 0,
}

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(`shader compile failed:\n${gl.getShaderInfoLog(s)}`)
  }
  return s
}

export function createRenderer(canvas) {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    preserveDrawingBuffer: true,
    premultipliedAlpha: false,
    powerPreference: 'high-performance',
  })
  if (!gl) throw new Error('WebGL2 unavailable')

  const prog = gl.createProgram()
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(`program link failed: ${gl.getProgramInfoLog(prog)}`)
  }
  gl.useProgram(prog)

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  const vbo = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const uniforms = {}
  for (const name of ['uBoard', 'uPaper', 'uRes', 'uTime', 'uFlow', 'uRiverY', 'uRiverW', 'uRiverTilt',
    'uWarp', 'uInk', 'uWet', 'uBloomAmt', 'uBloomAt', 'uBloomR', 'uBloomDark', 'uGrain',
    'uVignette', 'uAbr', 'uTint', 'uTintAmt', 'uLift', 'uBleach', 'uLetterbox', 'uShake',
    'uWipe', 'uWipeSeed']) {
    uniforms[name] = gl.getUniformLocation(prog, name)
  }

  function makeTex(unit) {
    const t = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    return t
  }

  const boardTex = makeTex(0)
  const paperTex = makeTex(1)

  // The 2D board is y-down; flipping on upload makes v=0 the bottom row, so the
  // shader's `cs` space (y from the top) lines up with Canvas2D scene code.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

  // paper texture is uploaded once
  const paper = getPaper()
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, paperTex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, paper)
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, boardTex)
  gl.uniform1i(uniforms.uBoard, 0)
  gl.uniform1i(uniforms.uPaper, 1)

  let W = canvas.width
  let H = canvas.height

  function render(board, opts, t) {
    const o = { ...DEFAULTS, ...opts }
    if (canvas.width !== W || canvas.height !== H) { W = canvas.width; H = canvas.height }
    gl.viewport(0, 0, W, H)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, boardTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, board)

    gl.uniform2f(uniforms.uRes, W, H)
    gl.uniform1f(uniforms.uTime, t)
    gl.uniform1f(uniforms.uFlow, o.flow)
    gl.uniform1f(uniforms.uRiverY, o.riverY)
    gl.uniform1f(uniforms.uRiverW, o.riverW)
    gl.uniform1f(uniforms.uRiverTilt, o.riverTilt)
    gl.uniform1f(uniforms.uWarp, o.warp)
    gl.uniform1f(uniforms.uInk, o.ink)
    gl.uniform1f(uniforms.uWet, o.wet)
    gl.uniform1f(uniforms.uBloomAmt, o.bloomAmt)
    // canvas space (y from the top), same as the scene code and the shader's `cs`
    gl.uniform2f(uniforms.uBloomAt, o.bloomAt[0], o.bloomAt[1])
    gl.uniform1f(uniforms.uBloomR, o.bloomR)
    gl.uniform1f(uniforms.uBloomDark, o.bloomDark)
    gl.uniform1f(uniforms.uGrain, o.grain)
    gl.uniform1f(uniforms.uVignette, o.vignette)
    gl.uniform1f(uniforms.uAbr, o.abr)
    gl.uniform3f(uniforms.uTint, o.tint[0], o.tint[1], o.tint[2])
    gl.uniform1f(uniforms.uTintAmt, o.tintAmt)
    gl.uniform1f(uniforms.uLift, o.lift)
    gl.uniform1f(uniforms.uBleach, o.bleach)
    gl.uniform1f(uniforms.uLetterbox, o.letterbox)
    gl.uniform1f(uniforms.uShake, o.shake)
    gl.uniform1f(uniforms.uWipe, o.wipe)
    gl.uniform1f(uniforms.uWipeSeed, o.wipeSeed)

    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.finish()
  }

  return { gl, render, canvas, width: () => W, height: () => H }
}
