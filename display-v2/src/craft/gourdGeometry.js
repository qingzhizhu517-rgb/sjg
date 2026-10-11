import { LatheGeometry, Vector2, Vector3, TubeGeometry, CatmullRomCurve3 } from 'three'

// Digital shapes informed by natural double-bellied gourds; these are not measured replicas.
const PROFILE = [
  [0, 0], [0.006, 0.12], [0.025, 0.28], [0.085, 0.54],
  [0.16, 0.75], [0.25, 0.85], [0.32, 0.82], [0.40, 0.67],
  [0.48, 0.45], [0.54, 0.28], [0.585, 0.235], [0.63, 0.27],
  [0.69, 0.40], [0.75, 0.52], [0.81, 0.53], [0.875, 0.46],
  [0.93, 0.31], [0.978, 0.105], [0.993, 0.054], [1, 0],
]

const SHAPES = {
  balanced: { height: 2.98, lower: 1, upper: 1, waist: 1 },
  slender: { height: 3.30, lower: 0.88, upper: 0.93, waist: 0.83 },
  full: { height: 2.82, lower: 1.15, upper: 1.08, waist: 1.13 },
}

function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function profileFor(shape) {
  const spec = SHAPES[shape] || SHAPES.balanced
  return PROFILE.map(([v, radius]) => {
    const upperBlend = smoothstep(0.6, 0.74, v)
    const waistBlend = Math.exp(-(((v - 0.585) / 0.085) ** 2))
    const scale = spec.lower * (1 - upperBlend) + spec.upper * upperBlend
    return [v, radius * (scale * (1 - waistBlend) + spec.waist * waistBlend)]
  })
}

// Shape-preserving cubic interpolation keeps the waist tangent continuous without
// Catmull-Rom overshoot turning the stem opening or lower pole inside out.
function slopesFor(knots) {
  const secants = knots.slice(1).map(([x, y], i) => (y - knots[i][1]) / (x - knots[i][0]))
  return knots.map((_, i) => {
    if (i === 0) return secants[0]
    if (i === knots.length - 1) return secants.at(-1)
    const left = secants[i - 1]
    const right = secants[i]
    if (left * right <= 0) return 0
    const h0 = knots[i][0] - knots[i - 1][0]
    const h1 = knots[i + 1][0] - knots[i][0]
    const w0 = 2 * h1 + h0
    const w1 = h1 + 2 * h0
    return (w0 + w1) / (w0 / left + w1 / right)
  })
}

function interpolate(knots, slopes, v) {
  let i = 0
  while (i < knots.length - 2 && v > knots[i + 1][0]) i += 1
  const [x0, r0] = knots[i]
  const [x1, r1] = knots[i + 1]
  const h = x1 - x0
  const t = (v - x0) / h
  return Math.max(0, (2 * t ** 3 - 3 * t ** 2 + 1) * r0
    + (t ** 3 - 2 * t ** 2 + t) * h * slopes[i]
    + (-2 * t ** 3 + 3 * t ** 2) * r1
    + (t ** 3 - t ** 2) * h * slopes[i + 1])
}

export function createGourdGeometry(shape = 'balanced', quality = 'desktop') {
  const safeShape = SHAPES[shape] ? shape : 'balanced'
  const spec = SHAPES[safeShape]
  const radialSegments = quality === 'mobile' ? 128 : 192
  const heightSegments = quality === 'mobile' ? 96 : 144
  const knots = profileFor(safeShape)
  const slopes = slopesFor(knots)
  const minY = -1.43
  const profile = Array.from({ length: heightSegments + 1 }, (_, i) => {
    const v = i / heightSegments
    return { v, radius: interpolate(knots, slopes, v), y: minY + v * spec.height }
  })
  const geometry = new LatheGeometry(profile.map(({ radius, y }) => new Vector2(radius, y)), radialSegments)
  const position = geometry.attributes.position
  const uv = geometry.attributes.uv
  for (let i = 0; i < position.count; i += 1) {
    const phi = uv.getX(i) * Math.PI * 2
    const v = uv.getY(i)
    const asymmetry = 1 + 0.008 * Math.cos(3 * phi + v * 2) * Math.sin(Math.PI * v)
    position.setXYZ(i, position.getX(i) * asymmetry + 0.011 * Math.sin(v * Math.PI * 2),
      position.getY(i), position.getZ(i) * asymmetry)
  }
  geometry.computeVertexNormals()
  const normal = geometry.attributes.normal
  for (let i = 0; i < normal.count; i += 1) {
    const n = new Vector3().fromBufferAttribute(normal, i)
    if (n.lengthSq() < 1e-12) n.set(0, uv.getY(i) < 0.5 ? -1 : 1, 0)
    n.normalize()
    normal.setXYZ(i, n.x, n.y, n.z)
  }
  for (let j = 0; j <= heightSegments; j += 1) {
    const end = radialSegments * (heightSegments + 1) + j
    const n = new Vector3().fromBufferAttribute(normal, j)
      .add(new Vector3().fromBufferAttribute(normal, end)).normalize()
    normal.setXYZ(j, n.x, n.y, n.z)
    normal.setXYZ(end, n.x, n.y, n.z)
  }
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  geometry.userData.gourd = { shape: safeShape, radialSegments, heightSegments, profile,
    minY, maxY: minY + spec.height }
  return geometry
}

export function createGourdStemGeometry(topY = 1.55, quality = 'desktop') {
  const curve = new CatmullRomCurve3([
    new Vector3(0, topY - 0.045, 0), new Vector3(0.015, topY + 0.075, 0),
    new Vector3(0.062, topY + 0.16, -0.01), new Vector3(0.094, topY + 0.21, -0.026),
  ])
  return new TubeGeometry(curve, quality === 'mobile' ? 16 : 28, 0.036, 10, false)
}

// 封闭干坯的内壁具有独立表面；壳厚为数字尺度，未模拟实体切削或透雕。
export function createGourdInteriorGeometry(shape = 'balanced', quality = 'desktop') {
  const shell = createGourdGeometry(shape, 'mobile')
  const { profile, minY, maxY } = shell.userData.gourd
  const thickness = .035
  const points = profile.filter((_, i) => i % 3 === 0).map(p => new Vector2(Math.max(0, p.radius - thickness), minY + thickness + p.v * (maxY - minY - thickness * 2)))
  const geometry = new LatheGeometry(points, quality === 'mobile' ? 48 : 64)
  geometry.userData.shellThickness = thickness
  geometry.computeBoundingBox()
  shell.dispose()
  return geometry
}
