import * as THREE from 'three'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js'
import { RIVER_COORDINATES } from './river.js'
// 3D coordinates for Shandong cities relative to [0, 0] plane
// Correct aspect ratio: longitude scale = latitude scale * cos(mean_latitude)
// For Shandong (mean latitude ~36.4° N), cos(36.4°) ≈ 0.805
// If latitude scale is 3.8, longitude scale should be 3.8 * 0.805 ≈ 3.06.
const projectGeo = (lon, lat) => {
  const x = (lon - 117.0) * 3.06
  const z = -(lat - 36.4) * 3.8
  return { x, z }
}

// Geographical coordinates (Lon, Lat) of core cities (accurate administrative centers)
const cityGeoCoords = [
  { name: '菏泽', lon: 115.48, lat: 35.23, color: 0xc23a2b, river: true },
  { name: '济宁', lon: 116.59, lat: 35.38, color: 0xe69138 },
  { name: '泰安', lon: 117.08, lat: 36.2, color: 0xd4af37 },
  { name: '聊城', lon: 115.97, lat: 36.45, color: 0x8e352e, river: true },
  { name: '济南', lon: 117.0, lat: 36.67, color: 0x3d85c6, river: true },
  { name: '德州', lon: 116.29, lat: 37.43, color: 0x674ea7, river: true },
  { name: '淄博', lon: 118.0, lat: 36.81, color: 0x6aa84f, river: true },
  { name: '滨州', lon: 118.02, lat: 37.37, color: 0x5b8c85, river: true },
  { name: '东营', lon: 118.49, lat: 37.46, color: 0x008080, river: true },
]

const city3dCoords = cityGeoCoords.map((city) => {
  const { x, z } = projectGeo(city.lon, city.lat)
  return {
    name: city.name,
    x,
    z,
    color: city.color,
    river: !!city.river,
  }
})

// Preserve sourced nodes; shared by terrain carving, ribbon and particles.
const guidePoints = RIVER_COORDINATES.map(([lon, lat]) => {
  const { x, z } = projectGeo(lon, lat)
  return new THREE.Vector3(x, 0, z)
})

// Artistic mountain masses anchored near named ranges; not measured elevation.
const mountainCenters = [
  { ...projectGeo(117.09, 36.26), radius: 2.35, height: 3.3 },
  { ...projectGeo(117.88, 35.53), radius: 3.4, height: 2.9 },
  { ...projectGeo(120.8, 37.05), radius: 3.6, height: 2.5 },
]
const noise = new ImprovedNoise()
const getTerrainHeight = (x, z) => {
  let height = 0.23 + 0.035 * noise.noise(x * 0.7, z * 0.7, 9)
  const warp = noise.noise(x * 0.8, z * 0.8, 4)
  // Broad connected ridges; small erosion detail must not turn every triangle into a peak.
  const ridge = 1 - Math.abs(noise.noise(x * 0.95 + warp * 0.45, z * 0.7, 7))
  const erosion = noise.noise(x * 3.8, z * 3.8, 13) * 0.055
  for (const center of mountainCenters) {
    const dx = x - center.x,
      dz = z - center.z
    const d = Math.hypot(dx, dz * 1.2) / center.radius
    if (d < 1) height += center.height * Math.pow(1 - d * d, 2) * (0.58 + 0.42 * ridge * ridge + erosion)
  }
  // Small illustrative urban basins keep settlements at the foot of the ranges.
  for (const city of city3dCoords) {
    const d = Math.hypot(x - city.x, z - city.z) / 0.62
    if (d < 1) height = THREE.MathUtils.lerp(height, 0.28, (1 - d * d) ** 2 * 0.9)
  }
  const river = riverDistance(x, z)
  if (river < 0.7) height = THREE.MathUtils.lerp(0.16, height, Math.min(1, river / 0.7))
  return height
}

export { projectGeo, city3dCoords, guidePoints, getTerrainHeight }
export function riverDistance(x, z) {
  let result = Infinity
  for (let i = 1; i < guidePoints.length; i++) {
    const a = guidePoints[i - 1],
      b = guidePoints[i],
      dx = b.x - a.x,
      dz = b.z - a.z
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1)))
    result = Math.min(result, (x - a.x - t * dx) ** 2 + (z - a.z - t * dz) ** 2)
  }
  return Math.sqrt(result)
}
