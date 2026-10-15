import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js'
import { city3dCoords, riverDistance } from './geography.js'
import { buildLandmarks } from './landmarks.js'

// The terrain and settlements are a deterministic miniature, not surveyed land use.
export function boundarySegments(rings) {
  const edges = new Map()
  const key = (p) => `${p.x.toFixed(5)},${p.z.toFixed(5)}`
  for (const ring of rings)
    for (let i = 1; i < ring.length; i++) {
      const a = ring[i - 1],
        b = ring[i]
      const id = [key(a), key(b)].sort().join('|')
      const edge = edges.get(id)
      if (edge) edge.count++
      else edges.set(id, { count: 1, segment: [a, b] })
    }
  return [...edges.values()].filter((edge) => edge.count === 1).map((edge) => edge.segment)
}
function randomSource(seed = 941) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
}
export function createLandMaterial() {
  const size = 2048,
    data = new Uint8Array(size * size * 4)
  const palette = [
    [106, 119, 64],
    [143, 140, 83],
    [104, 118, 70],
    [155, 148, 100],
    [123, 132, 77],
    [90, 108, 62],
    [132, 133, 82],
  ]
  const rand = randomSource()
  // Unequal fields with quiet dirt lanes; avoid a uniform checkerboard at overview scale.
  for (let y = 0; y < size;) {
    const height = 12 + Math.floor(rand() * 23)
    for (let x = 0; x < size;) {
      const width = 15 + Math.floor(rand() * 46)
      const c = palette[Math.floor(rand() * palette.length)]
      const direction = rand() > 0.5
      for (let py = y; py < Math.min(size, y + height); py++)
        for (let px = x; px < Math.min(size, x + width); px++) {
          const lane = px === x || py === y
          const rows = (direction ? px : py) % 4 === 0 ? -5 : 0
          const detail = (rand() - 0.5) * 9 + rows
          const i = (py * size + px) * 4
          for (let k = 0; k < 3; k++) data[i + k] = lane ? c[k] * 0.88 : c[k] + detail
          data[i + 3] = 255
        }
      x += width
    }
    y += height
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.generateMipmaps = true
  texture.anisotropy = 4
  texture.needsUpdate = true
  const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92, side: THREE.DoubleSide })
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLandscape;\nvarying float vSlope;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvLandscape = position;\nvSlope = 1.0 - abs(normal.y);',
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vLandscape;
        varying float vSlope;
        float landscapeNoise(vec3 p) {
          vec3 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          vec3 k = vec3(1.0, 57.0, 113.0);
          float n = dot(i, k);
          vec4 a = fract(sin(n + vec4(0.0,1.0,57.0,58.0)) * 43758.5453);
          vec4 b = fract(sin(n + vec4(113.0,114.0,170.0,171.0)) * 43758.5453);
          return mix(mix(mix(a.x,a.y,f.x),mix(a.z,a.w,f.x),f.y),
                     mix(mix(b.x,b.y,f.x),mix(b.z,b.w,f.x),f.y),f.z);
        }
      `,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float grain = landscapeNoise(vLandscape * 8.0) * 0.7 + landscapeNoise(vLandscape * 27.0) * 0.3;
        float mountain = smoothstep(0.4, 0.9, vLandscape.y);
        vec3 forest = mix(vec3(0.055,0.095,0.022), vec3(0.13,0.19,0.045),grain);
        vec3 rock = mix(vec3(0.24,0.23,0.19),vec3(0.46,0.44,0.37),grain);
        float strata = 0.92 + 0.08 * sin(vLandscape.y * 28.0 + vLandscape.x * 7.0);
        diffuseColor.rgb = mix(diffuseColor.rgb, forest, mountain * 0.88);
        diffuseColor.rgb = mix(diffuseColor.rgb, rock * strata, smoothstep(0.42,0.78,vSlope + (grain - 0.5) * 0.2) * mountain);
      `,
      )
  }
  mat.customProgramCacheKey = () => 'sandbox-landscape-v2'
  return mat
}

export function buildLandscape(scene, { contains, sample }) {
  const random = randomSource(731)
  const group = new THREE.Group()
  group.name = 'illustrative-landscape'
  scene.add(group)
  const landmarks = buildLandmarks(group, { contains, sample })
  const trees = [],
    pines = [],
    buildings = [],
    roofs = [],
    roads = [],
    rocks = []
  const noise = new ImprovedNoise()
  const slopeAt = (x, z) =>
    Math.hypot(sample(x + 0.08, z) - sample(x - 0.08, z), sample(x, z + 0.08) - sample(x, z - 0.08)) / 0.16
  // Scatter on a jittered lattice: reproducible, bounded, and never in the river.
  for (let z = -7.8; z < 7; z += 0.13)
    for (let x = -6.8; x < 18; x += 0.13) {
      const px = x + random() * 0.12,
        pz = z + random() * 0.12
      if (!contains(px, pz) || landmarks.occupies(px, pz) || riverDistance(px, pz) < 0.24) continue
      const h = sample(px, pz),
        chance = random()
      const grove = noise.noise(px * 1.7, pz * 1.7, 23)
      const slope = slopeAt(px, pz)
      if (((h > 0.55 && chance < 0.82 + grove * 0.55) || chance > 0.99) && slope < 3.2) {
        const point = { x: px, z: pz, scale: 0.055 + random() * 0.065, rotation: random() * 6.28 }
        ;(h > 1.5 && chance < 0.3 ? pines : trees).push(point)
      }
      if (h > 0.85 && slope > 1.8 && chance > 0.94)
        rocks.push({ x: px, z: pz, scale: 0.055 + random() * 0.07, rotation: random() * 6.28 })
    }
  for (const city of city3dCoords)
    for (let iz = -6; iz <= 6; iz++)
      for (let ix = -6; ix <= 6; ix++) {
        if (ix * ix + iz * iz > 38) continue
        const x = city.x + ix * 0.16,
          z = city.z + iz * 0.16
        if (
          !contains(x, z) ||
          landmarks.occupies(x, z) ||
          riverDistance(x, z) < 0.26 ||
          sample(x, z) > 0.85 ||
          slopeAt(x, z) > 0.55
        )
          continue
        if (ix % 3 === 0 || iz % 3 === 0) {
          roads.push({ x, z, scale: 0.16, rotation: ix % 3 === 0 ? 0 : Math.PI / 2 })
          continue
        }
        if (random() > 0.86) continue
        const central = Math.max(0, 1 - Math.hypot(ix, iz) / 7)
        const tower = central > 0.35 && random() > 0.6
        const point = {
          x,
          z,
          scale: 0.065 + random() * 0.025,
          height: tower ? 0.18 + random() * 0.42 * central : 0.035 + random() * 0.075,
          rotation: 0,
          tint: tower ? '#b4bec0' : '#dacaaa',
        }
        buildings.push(point)
        if (!tower) roofs.push(point)
      }
  const batches = []
  const temp = new THREE.Object3D(),
    color = new THREE.Color()
  function batch(name, geometry, mat, points, transform) {
    const mesh = new THREE.InstancedMesh(geometry, mat, points.length)
    mesh.name = name
    mesh.receiveShadow = true
    // Small details use material shading instead of thousands of shadow casters.
    mesh.castShadow = false
    points.forEach((p, i) => {
      const variation = 0.72 + random() * 0.4
      color.set(p.tint || '#ffffff').multiplyScalar(variation)
      mesh.setColorAt(i, color)
    })
    group.add(mesh)
    batches.push({ mesh, points, transform })
  }
  const crown = new THREE.IcosahedronGeometry(1, 0)
  crown.scale(1, 0.85, 0.9)
  crown.translate(-0.22, 0.85, 0)
  const crownTop = new THREE.IcosahedronGeometry(0.72, 0)
  crownTop.translate(0.3, 1.3, 0.12)
  const canopy = mergeGeometries([crown, crownTop])
  crown.dispose()
  crownTop.dispose()
  batch(
    'forest-canopy',
    canopy,
    new THREE.MeshStandardMaterial({ color: '#405725', roughness: 1 }),
    trees,
    (p) => [p.scale, p.scale, p.scale],
  )
  const pine = new THREE.ConeGeometry(0.75, 2.4, 5)
  pine.translate(0, 1.2, 0)
  batch(
    'forest-pines',
    pine,
    new THREE.MeshStandardMaterial({ color: '#314b29', roughness: 1 }),
    pines,
    (p) => [p.scale, p.scale, p.scale],
  )
  const road = new THREE.BoxGeometry(1, 0.012, 0.22)
  batch(
    'settlement-lanes',
    road,
    new THREE.MeshStandardMaterial({ color: '#a99b7e', roughness: 1 }),
    roads,
    (p) => [p.scale, 1, p.scale],
  )
  const rock = new THREE.DodecahedronGeometry(1, 0)
  rock.translate(0, 0.5, 0)
  batch(
    'mountain-rocks',
    rock,
    new THREE.MeshStandardMaterial({ color: '#a59a7d', roughness: 1, flatShading: true }),
    rocks,
    (p) => [p.scale, p.scale * 0.9, p.scale * 0.7],
  )
  const house = new THREE.BoxGeometry(1, 1, 1)
  house.translate(0, 0.5, 0)
  batch(
    'city-buildings',
    house,
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85 }),
    buildings,
    (p) => [p.scale, p.height, p.scale * 1.3],
  )
  const roofGeometry = new THREE.ConeGeometry(0.85, 0.5, 4)
  roofGeometry.rotateY(Math.PI / 4)
  roofGeometry.translate(0, 0.25, 0)
  batch(
    'city-roofs',
    roofGeometry,
    new THREE.MeshStandardMaterial({ color: '#685951', roughness: 0.9 }),
    roofs,
    (p) => [p.scale, p.scale, p.scale * 1.3],
  )
  function refresh(region) {
    landmarks.refresh(region)
    for (const { mesh, points, transform } of batches) {
      points.forEach((p, i) => {
        if (
          region &&
          (Math.abs(p.x - region.x) > region.radius + 0.65 || Math.abs(p.z - region.z) > region.radius + 0.65)
        )
          return
        temp.position.set(p.x, sample(p.x, p.z) + (mesh.name === 'city-roofs' ? p.height : 0), p.z)
        temp.rotation.set(0, p.rotation, 0)
        temp.scale.fromArray(transform(p))
        temp.updateMatrix()
        mesh.setMatrixAt(i, temp.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingBox()
      mesh.computeBoundingSphere()
    }
  }
  refresh()
  return { refresh, group }
}
