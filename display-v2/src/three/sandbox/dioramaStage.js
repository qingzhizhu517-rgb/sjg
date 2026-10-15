import * as THREE from 'three'

const WIDTH = 32
const DEPTH = 24
const CENTER_X = 3.5
const SEA_Y = -0.7

function distanceToEdges(x, z, edges) {
  let nearest = Infinity
  for (const [a, b] of edges) {
    const dx = b.x - a.x
    const dz = b.z - a.z
    const lengthSquared = dx * dx + dz * dz
    const t = lengthSquared
      ? THREE.MathUtils.clamp(((x - a.x) * dx + (z - a.z) * dz) / lengthSquared, 0, 1)
      : 0
    nearest = Math.min(nearest, (x - a.x - dx * t) ** 2 + (z - a.z - dz * t) ** 2)
  }
  return Math.sqrt(nearest)
}

function makeSeaMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      deepColor: { value: new THREE.Color('#102d42') },
      shoreColor: { value: new THREE.Color('#439b9a') },
    },
    vertexShader: `
      attribute float coast;
      attribute float oceanMask;
      varying float vOcean;
      varying float vCoast;
      varying vec2 vPosition;
      void main() {
        vCoast = coast;
        vOcean = oceanMask;
        vPosition = position.xz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying float vOcean;
      uniform float time;
      uniform vec3 deepColor;
      uniform vec3 shoreColor;
      varying float vCoast;
      varying vec2 vPosition;
      void main() {
        float bend = sin(vPosition.x * 0.41 + vPosition.y * 0.17) * 0.65;
        bend += sin(vPosition.x * 0.93 - vPosition.y * 0.11) * 0.19;
        float longWave = sin(vPosition.y * 2.1 + vPosition.x * 0.19 + bend - time * 0.19);
        float fineWave = sin(vPosition.y * 11.7 + vPosition.x * 0.77 + bend * 3.1 - time * 0.32);
        float fineWave2 = sin(vPosition.y * 19.3 + vPosition.x * 1.13 + bend * 4.7 - time * 0.24);
        vec3 color = mix(deepColor, shoreColor, vCoast * 0.9);
        color *= 1.0 + longWave * 0.025 + fineWave * 0.026 + fineWave2 * 0.012;
        color = mix(vec3(0.045,0.065,0.036),color,vOcean);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  })
}

// Projected z increases southward. This schematic mainland retreats west of
// Bohai in the north and reaches east beneath southern Shandong; it is not a
// surveyed coastline or an additional administrative region.
function contextEasternEdge(z) {
  const southward = THREE.MathUtils.smoothstep(z, -5.8, 5)
  return -3.35 + southward * 9.5 + Math.sin(z * 0.83) * 0.58 + Math.sin(z * 1.81 + 0.6) * 0.22
}

function clipContextTriangle(points) {
  const clipped = []
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    const da = a.x - contextEasternEdge(a.z)
    const db = b.x - contextEasternEdge(b.z)
    if (da <= 0) clipped.push(a)
    if (da < 0 !== db < 0) {
      const t = da / (da - db)
      clipped.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t })
    }
  }
  return clipped
}

function addMesh(group, name, geometry, material, position, scale) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name
  if (position) mesh.position.set(...position)
  if (scale) mesh.scale.set(...scale)
  mesh.receiveShadow = true
  group.add(mesh)
  return mesh
}

function buildSurroundings(group, polygons, contains, sample) {
  const edges = polygons.flatMap((polygon) =>
    polygon.flatMap((ring) => ring.map((point, i) => [point, ring[(i + 1) % ring.length]])),
  )
  const geometry = new THREE.PlaneGeometry(WIDTH - 0.18, DEPTH - 0.18, 116, 96)
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(CENTER_X, 0, 0)
  const positions = geometry.attributes.position
  const coast = new Float32Array(positions.count)
  const context = new Uint8Array(positions.count)
  const oceanMask = new Float32Array(positions.count)
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i)
    const z = positions.getZ(i)
    const inside = contains(x, z)
    coast[i] = Math.exp(-distanceToEdges(x, z, edges) * 1.35)
    context[i] = inside ? 0 : 1
    oceanMask[i] = THREE.MathUtils.smoothstep(x - contextEasternEdge(z), -0.25, 0.35)
  }
  geometry.setAttribute('coast', new THREE.BufferAttribute(coast, 1))
  geometry.setAttribute('oceanMask', new THREE.BufferAttribute(oceanMask, 1))
  const water = addMesh(group, 'diorama-sea', geometry, makeSeaMaterial(), [0, SEA_Y, 0])
  const contextPositions = []
  const contextColors = []
  const dark = new THREE.Color('#293b32')
  const light = new THREE.Color('#435145')
  const color = new THREE.Color()
  const indices = geometry.index.array
  for (let i = 0; i < indices.length; i += 3) {
    const ids = [indices[i], indices[i + 1], indices[i + 2]]
    if (!ids.every((id) => context[id])) continue
    const centerX = ids.reduce((sum, id) => sum + positions.getX(id), 0) / 3
    const centerZ = ids.reduce((sum, id) => sum + positions.getZ(id), 0) / 3
    if (contains(centerX, centerZ)) continue
    const clipped = clipContextTriangle(ids.map((id) => ({ x: positions.getX(id), z: positions.getZ(id) })))
    const triangles = []
    for (let j = 1; j < clipped.length - 1; j++) triangles.push(clipped[0], clipped[j], clipped[j + 1])
    for (const { x, z } of triangles) {
      const height = sample(x, z)
      const ripple = Math.sin(x * 0.7) * Math.cos(z * 0.6)
      const y =
        -0.48 + ripple * 0.06 + THREE.MathUtils.clamp(Number.isFinite(height) ? height : 0, -1, 1) * 0.06
      contextPositions.push(x, y, z)
      // Muted agricultural patches give scale without inventing named locations.
      const field = Math.sin(Math.floor(x * 1.3) * 17 + Math.floor(z * 1.5) * 31)
      color.copy(dark).lerp(light, 0.28 + field * 0.12 + ripple * 0.1)
      contextColors.push(color.r, color.g, color.b)
    }
  }
  const backdrop = new THREE.BufferGeometry()
  backdrop.setAttribute('position', new THREE.Float32BufferAttribute(contextPositions, 3))
  backdrop.setAttribute('color', new THREE.Float32BufferAttribute(contextColors, 3))
  backdrop.computeVertexNormals()
  const land = addMesh(
    group,
    'diorama-context-land',
    backdrop,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.96,
    }),
  )
  land.userData.illustrative = true
  return water
}

/**
 * Adds a schematic tabletop setting. Rings contain projected { x, z } points.
 * All GPU resources belong to the scene and are released by releaseTree(scene).
 */
export function buildDioramaStage(scene, { polygons, contains, sample }) {
  const group = new THREE.Group()
  group.name = 'diorama-stage'
  scene.add(group)
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: '#30251e', roughness: 0.68, metalness: 0.16 })
  const goldMaterial = new THREE.MeshStandardMaterial({ color: '#ad8a4c', roughness: 0.34, metalness: 0.72 })
  const base = addMesh(group, 'diorama-plinth', new THREE.BoxGeometry(WIDTH, 1.1, DEPTH), bodyMaterial, [
    CENTER_X,
    -1.4,
    0,
  ])
  base.castShadow = true
  const railGeometry = new THREE.BoxGeometry(1, 1, 1)
  for (const z of [-DEPTH / 2, DEPTH / 2]) {
    addMesh(
      group,
      'diorama-gold-rim',
      railGeometry,
      goldMaterial,
      [CENTER_X, -0.68, z],
      [WIDTH + 0.12, 0.1, 0.12],
    )
    addMesh(
      group,
      'diorama-gold-inlay',
      railGeometry,
      goldMaterial,
      [CENTER_X, -1.67, z],
      [WIDTH, 0.035, 0.035],
    )
  }
  for (const x of [CENTER_X - WIDTH / 2, CENTER_X + WIDTH / 2]) {
    addMesh(group, 'diorama-gold-rim', railGeometry, goldMaterial, [x, -0.68, 0], [0.12, 0.1, DEPTH])
    addMesh(group, 'diorama-gold-inlay', railGeometry, goldMaterial, [x, -1.67, 0], [0.035, 0.035, DEPTH])
  }
  const water = buildSurroundings(group, polygons, contains, sample)
  return {
    animate(time, motion) {
      if (motion && Number.isFinite(time)) water.material.uniforms.time.value = time
    },
  }
}
