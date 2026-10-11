import { CanvasTexture, DataTexture, RGBAFormat, UnsignedByteType, SRGBColorSpace,
  RepeatWrapping, ClampToEdgeWrapping, LinearFilter } from 'three'

export function splitUvPaths(points = [], maxJump = 0.14) {
  const paths = []
  let current = []
  for (const point of points) {
    if (!point || !Number.isFinite(point.u) || !Number.isFinite(point.v)
      || point.u < 0 || point.u > 1 || point.v < 0 || point.v > 1) {
      if (current.length) paths.push(current)
      current = []
      continue
    }
    const previous = current.at(-1)
    if (previous && (Math.abs(previous.u - point.u) > 0.5
      || Math.hypot(previous.u - point.u, previous.v - point.v) > maxJump)) {
      paths.push(current)
      current = []
    }
    current.push({ u: point.u, v: point.v })
  }
  if (current.length) paths.push(current)
  return paths
}

function makeCanvas(size) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('浏览器无法创建葫芦纹理画布')
  return { canvas, context }
}

function noise(x, y, seed = 0) {
  let n = Math.imul(x + seed * 47, 374761393) + Math.imul(y, 668265263)
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295
}

function field(u, v, frequency, seed) {
  const x = u * frequency
  const y = v * frequency * 0.62
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const sx = (x - ix) ** 2 * (3 - 2 * (x - ix))
  const sy = (y - iy) ** 2 * (3 - 2 * (y - iy))
  const a = noise(ix % frequency, iy, seed)
  const b = noise((ix + 1) % frequency, iy, seed)
  const c = noise(ix % frequency, iy + 1, seed)
  const d = noise((ix + 1) % frequency, iy + 1, seed)
  return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy
}

function strokeBounds(points, radius, size) {
  const xs = points.map((p) => p.u * size)
  const ys = points.map((p) => (1 - p.v) * size)
  const padding = radius * size + 3
  return {
    x: Math.max(0, Math.floor(Math.min(...xs) - padding)),
    y: Math.max(0, Math.floor(Math.min(...ys) - padding)),
    right: Math.min(size, Math.ceil(Math.max(...xs) + padding)),
    bottom: Math.min(size, Math.ceil(Math.max(...ys) + padding)),
  }
}

function drawPaths(context, paths, size, width, color, { dashed = false, composite = 'source-over' } = {}) {
  context.save()
  context.globalCompositeOperation = composite
  context.strokeStyle = context.fillStyle = color
  context.lineWidth = width * size
  context.lineCap = 'round'
  context.lineJoin = 'round'
  if (dashed) context.setLineDash([size * 0.003, size * 0.0025])
  for (const path of paths) {
    if (!path.length) continue
    context.beginPath()
    context.moveTo(path[0].u * size, (1 - path[0].v) * size)
    for (const point of path.slice(1)) context.lineTo(point.u * size, (1 - point.v) * size)
    if (path.length === 1) {
      context.arc(path[0].u * size, (1 - path[0].v) * size, width * size / 2, 0, Math.PI * 2)
      context.fill()
    } else context.stroke()
  }
  context.restore()
}

// Height, pigment and guide layers share UVs. Guide lines never modify height or stain.
// Pointer previews only touch their dirty rectangle; stored work can be replayed exactly.
export function createGourdTextures(work, options = {}) {
  const size = options.size || (options.quality === 'mobile' ? 1024 : 1536)
  const base = makeCanvas(size)
  const color = makeCanvas(size)
  const carve = makeCanvas(size)
  const surface = makeCanvas(size)
  const groove = makeCanvas(size)
  const guide = makeCanvas(size)
  const canvases = [base, color, carve, surface, groove, guide]
  const basePixels = new Uint8ClampedArray(size * size * 4)
  const normalPixels = new Uint8Array(size * size * 4)
  const microPixels = new Uint8Array(size * size * 2)
  const roughnessPixels = new Uint8Array(size * size * 4)
  let isGreen = !!options.green
  let settings = options
  let disposed = false
  let paintCount = 0

  const map = new CanvasTexture(color.canvas)
  map.colorSpace = SRGBColorSpace
  const normalMap = new DataTexture(normalPixels, size, size, RGBAFormat, UnsignedByteType)
  const roughnessMap = new DataTexture(roughnessPixels, size, size, RGBAFormat, UnsignedByteType)
  for (const texture of [map, normalMap, roughnessMap]) {
    texture.wrapS = RepeatWrapping
    texture.wrapT = ClampToEdgeWrapping
    texture.anisotropy = options.anisotropy || 4
    texture.minFilter = texture.magFilter = LinearFilter
    texture.generateMipmaps = false
    texture.flipY = true
  }

  function buildBase() {
    const tone = isGreen ? [116, 139, 67] : [190, 143, 83]
    for (let y = 0; y < size; y += 1) {
      const v = y / size
      for (let x = 0; x < size; x += 1) {
        const u = x / size
        const i = (y * size + x) * 4
        const cloud = field(u, v, 28, 2) - 0.5
        const fine = field(u, v, 120, 5) - 0.5
        const speckle = noise(x, y, 8)
        const spots = fine > 0.23 ? (fine - 0.23) * 46 : 0
        const growth = Math.sin(u * Math.PI * 2 * 42 + field(u, v, 12, 3) * 2) * 1.1
        const variation = cloud * 16 + fine * 7 + growth - spots - (speckle > 0.998 ? 13 : 0)
        basePixels[i] = tone[0] + variation
        basePixels[i + 1] = tone[1] + variation * 0.88
        basePixels[i + 2] = tone[2] + variation * 0.62
        basePixels[i + 3] = 255
        microPixels[(i / 4) * 2] = 128 + Math.round((speckle - 0.5) * 4)
        microPixels[(i / 4) * 2 + 1] = 128 + Math.round((noise(x, y, 9) - 0.5) * 4)
      }
    }
    const pixels = base.context.createImageData(size, size)
    pixels.data.set(basePixels)
    base.context.putImageData(pixels, 0, 0)
  }

  function applyStroke(stroke, points = stroke.points) {
    const paths = splitUvPaths(points)
    if (!paths.length) return null
    const depth = Math.max(1, Math.min(3, Number(stroke.depth) || 1))
    const radius = stroke.kind === 'carve' ? 0.0012 + depth * 0.00035
      : stroke.kind === 'wipe' ? 0.055 : 0.035
    const pigment = stroke.pigment === 'ochre' ? 'rgb(112,57,29)' : 'rgb(46,40,30)'
    if (stroke.kind === 'carve') {
      const shade = Math.round(depth / 3 * 255)
      drawPaths(carve.context, paths, size, radius * 2, `rgb(${shade},${shade},${shade})`, { composite: 'lighten' })
    } else if (stroke.kind === 'coat') {
      drawPaths(surface.context, paths, size, radius * 2, pigment)
      drawPaths(groove.context, paths, size, radius * 2, pigment)
      // Only grooves already carved at the time of coating can retain this pigment.
      groove.context.save()
      groove.context.globalCompositeOperation = 'destination-in'
      groove.context.drawImage(carve.canvas, 0, 0)
      groove.context.restore()
    } else if (stroke.kind === 'wipe') {
      drawPaths(surface.context, paths, size, radius * 2, '#000', { composite: 'destination-out' })
    }
    return strokeBounds(paths.flat(), radius, size)
  }

  function compose(bounds = { x: 0, y: 0, right: size, bottom: size }) {
    if (disposed) return
    const x0 = Math.max(0, bounds.x - 1)
    const y0 = Math.max(0, bounds.y - 1)
    const w = Math.min(size, bounds.right + 1) - x0
    const h = Math.min(size, bounds.bottom + 1) - y0
    if (w <= 0 || h <= 0) return
    const heightPixels = carve.context.getImageData(x0, y0, w, h).data
    const groovePixels = groove.context.getImageData(x0, y0, w, h).data
    const surfacePixels = surface.context.getImageData(x0, y0, w, h).data
    const pixels = color.context.createImageData(w, h)
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const local = (y * w + x) * 4
        const global = ((y0 + y) * size + x0 + x) * 4
        const height = heightPixels[local] / 255
        const stain = groovePixels[local + 3] / 255 * height * 0.76
        const coating = surfacePixels[local + 3] / 255 * 0.31
        for (let channel = 0; channel < 3; channel += 1) {
          const shell = basePixels[global + channel] - height * (channel === 0 ? 21 : 16)
          const stained = shell * (1 - stain) + groovePixels[local + channel] * stain
          pixels.data[local + channel] = stained * (1 - coating) + surfacePixels[local + channel] * coating
        }
        pixels.data[local + 3] = 255
        const left = heightPixels[(y * w + Math.max(0, x - 1)) * 4]
        const right = heightPixels[(y * w + Math.min(w - 1, x + 1)) * 4]
        const up = heightPixels[(Math.max(0, y - 1) * w + x) * 4]
        const down = heightPixels[(Math.min(h - 1, y + 1) * w + x) * 4]
        const nx = (right - left) / 255 * size * 0.0013
          + (microPixels[global / 2] - 128) / 128
        const ny = (up - down) / 255 * size * 0.0013
          + (microPixels[global / 2 + 1] - 128) / 128
        const length = Math.hypot(nx, ny, 1)
        normalPixels[global] = (nx / length * 0.5 + 0.5) * 255
        normalPixels[global + 1] = (ny / length * 0.5 + 0.5) * 255
        normalPixels[global + 2] = (1 / length * 0.5 + 0.5) * 255
        normalPixels[global + 3] = 255
        const roughness = (isGreen ? 181 : 173) + height * 27 + (basePixels[global] - (isGreen ? 116 : 190)) * 0.4
        roughnessPixels[global] = roughnessPixels[global + 1] = roughnessPixels[global + 2] = roughness
        roughnessPixels[global + 3] = 255
      }
    }
    color.context.putImageData(pixels, x0, y0)
    color.context.drawImage(guide.canvas, x0, y0, w, h, x0, y0, w, h)
    map.needsUpdate = normalMap.needsUpdate = roughnessMap.needsUpdate = true
    paintCount += 1
  }

  function update(nextWork, nextOptions = {}) {
    if (disposed) return
    settings = { ...settings, ...nextOptions }
    const nextGreen = !!settings.green
    if (nextGreen !== isGreen) {
      isGreen = nextGreen
      buildBase()
    }
    for (const layer of [carve, surface, groove, guide]) layer.context.clearRect(0, 0, size, size)
    // Transparent background lets the groove layer use height alpha as a retention mask.
    for (const stroke of settings.strokes || nextWork?.strokes || []) applyStroke(stroke)
    if (settings.guideVisible) {
      drawPaths(guide.context, (settings.guidePaths || []).flatMap((p) => splitUvPaths(p)),
        size, 0.00155, 'rgba(62,56,43,0.45)', { dashed: true })
    }
    compose()
  }

  function preview(stroke, from = 0) {
    if (disposed || !stroke?.points?.length) return
    const start = Math.max(0, from - 1)
    const points = stroke.points.slice(start)
    const bounds = applyStroke(stroke, points)
    if (bounds) compose(bounds)
  }

  buildBase()
  update(work)
  return {
    map, normalMap, roughnessMap, size, update, preview,
    getStats: () => ({ size, texturePaints: paintCount }),
    dispose() {
      if (disposed) return
      disposed = true
      for (const texture of [map, normalMap, roughnessMap]) texture.dispose()
      for (const { canvas } of canvases) canvas.width = canvas.height = 1
    },
  }
}
