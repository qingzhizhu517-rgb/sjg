import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { projectGeo, riverDistance } from './geography.js'

// Authored miniature silhouettes, not reconstructions of named historic buildings.
// Merge each material into one mesh per site; no per-tile or per-column draw calls.
export function buildLandmarks(parent, { contains, sample }) {
  const sites = []
  const stone = new THREE.MeshStandardMaterial({ color: '#b9ac8e', roughness: 0.95 })
  const wall = new THREE.MeshStandardMaterial({ color: '#b8a079', roughness: 0.9 })
  const roof = new THREE.MeshStandardMaterial({ color: '#72452f', roughness: 0.85 })
  const wood = new THREE.MeshStandardMaterial({ color: '#68392a', roughness: 0.9 })
  function site(name, anchor, make) {
    if (!contains(anchor.x, anchor.z) || riverDistance(anchor.x, anchor.z) < 0.45) return
    const group = new THREE.Group()
    group.name = name
    group.scale.setScalar(0.7)
    group.userData.illustrative = true
    const parts = new Map()
    const add = (geometry, material, x, y, z) => {
      geometry.translate(x, y, z)
      const key = parts.get(material) || []
      key.push(geometry)
      parts.set(material, key)
    }
    const box = (w, h, d, material, x, y, z) => add(new THREE.BoxGeometry(w, h, d), material, x, y, z)
    function eaves(w, d, y, x, z) {
      // Three stepped hip roofs produce a broad ridge and raised, overhanging eaves.
      for (let i = 0; i < 3; i++) {
        const g = new THREE.CylinderGeometry(0.48 - i * 0.12, 0.7 - i * 0.12, 0.035, 4)
        g.rotateY(Math.PI / 4)
        g.scale(w, 1, d)
        add(g, roof, x, y + i * 0.03, z)
      }
      box(w * 0.42, 0.018, 0.025, roof, x, y + 0.095, z)
    }
    function hall(x, z, w = 0.3, d = 0.18) {
      box(w + 0.05, 0.035, d + 0.05, stone, x, 0.035, z)
      box(w * 0.85, 0.09, d * 0.75, wall, x, 0.095, z)
      for (const side of [-1, 1])
        for (const column of [-0.4, 0, 0.4])
          box(0.012, 0.1, 0.012, wood, x + column * w, 0.105, z + side * d * 0.42)
      eaves(w * 1.15, d * 1.3, 0.16, x, z)
    }
    make({ box, eaves, hall })
    for (const [material, geometries] of parts) {
      const merged = mergeGeometries(geometries)
      geometries.forEach((g) => g.dispose())
      const mesh = new THREE.Mesh(merged, material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      group.add(mesh)
    }
    const foundation = new THREE.Mesh(new THREE.BoxGeometry(0.68, 1, 0.54), stone)
    foundation.name = 'terrain-fitted-foundation'
    foundation.receiveShadow = true
    foundation.castShadow = true
    group.add(foundation)
    parent.add(group)
    sites.push({ group, anchor, foundation })
  }
  const summit = projectGeo(117.1, 36.26)
  // Choose a visible crest within this illustrative massif, not a surveyed summit point.
  let crest = { ...summit },
    best = -Infinity
  for (let x = summit.x - 0.7; x <= summit.x + 0.7; x += 0.14)
    for (let z = summit.z - 0.7; z <= summit.z + 0.7; z += 0.14) {
      const footprint = [-0.21, 0, 0.21].flatMap((dx) =>
        [-0.175, 0, 0.175].map((dz) => sample(x + dx, z + dz)),
      )
      const score = sample(x, z) - 2 * (Math.max(...footprint) - Math.min(...footprint))
      if (contains(x, z) && riverDistance(x, z) > 0.6 && score > best) {
        best = score
        crest = { x, z }
      }
    }
  site('illustrative-summit-courtyard', crest, ({ box, hall }) => {
    box(0.68, 0.1, 0.54, stone, 0, -0.025, 0)
    box(0.57, 0.012, 0.43, wall, 0, 0.035, 0)
    hall(0, -0.14, 0.34, 0.19)
    hall(-0.23, 0.06, 0.16, 0.22)
    hall(0.23, 0.06, 0.16, 0.22)
    for (let i = 0; i < 8; i++) box(0.18, 0.028, 0.035, stone, 0, 0.02 - i * 0.025, 0.27 + i * 0.033)
  })
  const garden = projectGeo(117.0, 36.67)
  garden.x += 0.9
  garden.z -= 0.4
  site('illustrative-city-pavilion', garden, ({ box, hall, eaves }) => {
    box(0.48, 0.06, 0.4, stone, 0, 0, 0)
    hall(0.13, 0.07, 0.17, 0.13)
    for (let i = 0; i < 5; i++) {
      const width = 0.17 - i * 0.018
      box(width * 0.7, 0.095, width * 0.7, wall, -0.12, 0.08 + i * 0.105, -0.07)
      eaves(width * 1.4, width * 1.4, 0.13 + i * 0.105, -0.12, -0.07)
    }
  })
  function refresh(region) {
    for (const { group, anchor, foundation } of sites) {
      if (region && Math.hypot(anchor.x - region.x, anchor.z - region.z) > region.radius + 1) continue
      // Embed foundations in the highest footprint corner so structures never sink into edited slopes.
      const heights = [-0.21, 0, 0.21].flatMap((dx) =>
        [-0.175, 0, 0.175].map((dz) => sample(anchor.x + dx, anchor.z + dz)),
      )
      const floor = Math.max(...heights)
      const depth = Math.max(0.08, (floor - Math.min(...heights)) / 0.7 + 0.06)
      foundation.scale.y = depth
      foundation.position.y = -depth / 2 + 0.025
      group.position.set(anchor.x, floor, anchor.z)
    }
  }
  refresh()
  // Dispose materials that were not used when a site lies outside the current map.
  for (const material of [stone, wall, roof, wood]) {
    let used = false
    for (const { group } of sites)
      group.traverse((o) => {
        if (o.material === material) used = true
      })
    if (!used) material.dispose()
  }
  return {
    refresh,
    occupies: (x, z) =>
      sites.some(({ anchor }) => Math.abs(x - anchor.x) < 0.45 && Math.abs(z - anchor.z) < 0.55),
  }
}
