import * as THREE from 'three'
import { TessellateModifier } from 'three/examples/jsm/modifiers/TessellateModifier.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { projectGeo, city3dCoords, guidePoints } from './geography.js'
import { boundarySegments, createLandMaterial, buildLandscape } from './landscape.js'
import { buildDioramaStage } from './dioramaStage.js'
export function releaseTree(root) {
  const geometries = new Set(),
    materials = new Set(),
    textures = new Set()
  root.traverse((o) => {
    if (o.isInstancedMesh) o.dispose()
    if (o.geometry) geometries.add(o.geometry)
    for (const m of Array.isArray(o.material) ? o.material : [o.material])
      if (m) {
        materials.add(m)
        for (const v of Object.values(m)) if (v?.isTexture) textures.add(v)
      }
  })
  textures.forEach((t) => t.dispose())
  materials.forEach((m) => m.dispose())
  geometries.forEach((g) => g.dispose())
}
const material = (color, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.83, metalness: 0.05, ...extra })
function mesh(geometry, mat, parent, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, mat)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  parent.add(m)
  return m
}
export function makeAsset(asset) {
  const group = new THREE.Group()
  if (asset === 'tree') {
    mesh(new THREE.CylinderGeometry(0.07, 0.12, 0.8, 8), material('#74634c'), group, 0, 0.4)
    mesh(new THREE.IcosahedronGeometry(0.5, 1), material('#416e59'), group, 0, 1.05)
    mesh(new THREE.IcosahedronGeometry(0.35, 1), material('#769880'), group, 0.25, 1.4)
  } else if (asset === 'rock') {
    const stone = mesh(new THREE.DodecahedronGeometry(0.45, 0), material('#839088'), group, 0, 0.24)
    stone.scale.set(1.4, 0.7, 1)
    stone.rotation.set(0.2, 0.3, 0.1)
  } else {
    const wood = material('#775a43'),
      roof = material('#365e5a')
    mesh(new THREE.BoxGeometry(1.1, 0.12, 1.1), material('#c8c1a4'), group, 0, 0.06)
    for (const x of [-0.4, 0.4])
      for (const z of [-0.4, 0.4])
        mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.8, 8), wood, group, x, 0.5, z)
    const top = mesh(new THREE.ConeGeometry(0.88, 0.42, 4), roof, group, 0, 1.06)
    top.rotation.y = Math.PI / 4
    mesh(new THREE.SphereGeometry(0.07, 8, 6), wood, group, 0, 1.3)
  }
  return group
}
function polygonContains(point, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i],
      b = ring[j]
    if (a.z > point.z !== b.z > point.z && point.x < ((b.x - a.x) * (point.z - a.z)) / (b.z - a.z) + a.x)
      inside = !inside
  }
  return inside
}
export function buildWorld(scene, geojson, terrain) {
  // Keep the original polygon edges and holes; refine triangle interiors instead
  // of cutting square cells off a grid (which stair-steps the coast).
  const polygons = geojson.features
    .flatMap((f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates))
    .map((polygon) => polygon.map((ring) => ring.map((p) => projectGeo(...p))))
  const rings = polygons.flat()
  const contains = (x, z) =>
    polygons.some(
      (p) => polygonContains({ x, z }, p[0]) && !p.slice(1).some((hole) => polygonContains({ x, z }, hole)),
    )
  const shapes = polygons.map((polygon) => {
    const shape = new THREE.Shape(polygon[0].map((p) => new THREE.Vector2(p.x, -p.z)))
    shape.holes = polygon
      .slice(1)
      .map((ring) => new THREE.Path(ring.map((p) => new THREE.Vector2(p.x, -p.z))))
    return shape
  })
  const flat = new THREE.ShapeGeometry(shapes)
  const refined = new TessellateModifier(0.14, 12).modify(flat)
  refined.deleteAttribute('normal')
  refined.deleteAttribute('uv')
  const geometry = mergeVertices(refined, 0.00001)
  flat.dispose()
  refined.dispose()
  geometry.rotateX(-Math.PI / 2)
  geometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3),
  )
  const surfaceUV = []
  const positions = geometry.attributes.position
  for (let i = 0; i < positions.count; i++)
    surfaceUV.push((positions.getX(i) + 12) / 30, (positions.getZ(i) + 12) / 24)
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(surfaceUV, 2))
  const land = mesh(geometry, createLandMaterial(), scene)
  land.name = 'terrain'
  const coast = boundarySegments(
    rings.filter(
      (r) =>
        Math.abs(
          r.reduce((sum, p, i) => {
            const q = r[(i + 1) % r.length]
            return sum + p.x * q.z - q.x * p.z
          }, 0),
        ) > 0.04,
    ),
  )
  const outlines = new THREE.Group()
  scene.add(outlines)
  const internal = new THREE.BufferGeometry().setFromPoints(
    rings
      .flatMap((r) => r.slice(1).flatMap((p, i) => [r[i], p]))
      .map((p) => new THREE.Vector3(p.x, terrain.sample(p.x, p.z) + 0.014, p.z)),
  )
  outlines.add(
    new THREE.LineSegments(
      internal,
      new THREE.LineBasicMaterial({ color: '#c2b383', transparent: true, opacity: 0.15 }),
    ),
  )
  const goldLines = []
  for (const [width, opacity, color] of [
    [0.018, 1, '#ffdc8e'],
    [0.048, 0.25, '#ffb938'],
  ]) {
    const coords = []
    for (const [a, b] of coast) {
      const len = Math.hypot(b.x - a.x, b.z - a.z) || 1
      const dx = (-(b.z - a.z) / len) * width,
        dz = ((b.x - a.x) / len) * width
      for (const p of [
        { x: a.x - dx, z: a.z - dz },
        { x: b.x - dx, z: b.z - dz },
        { x: a.x + dx, z: a.z + dz },
        { x: a.x + dx, z: a.z + dz },
        { x: b.x - dx, z: b.z - dz },
        { x: b.x + dx, z: b.z + dz },
      ])
        coords.push(p.x, terrain.sample(p.x, p.z) + 0.04, p.z)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3))
    const band = new THREE.Mesh(
      g,
      new THREE.MeshBasicMaterial({
        color,
        transparent: opacity < 1,
        opacity,
        side: THREE.DoubleSide,
        depthWrite: opacity === 1,
      }),
    )
    if (opacity === 1) band.material.color.multiplyScalar(3.5)
    band.name = 'gold-province-boundary'
    scene.add(band)
    goldLines.push(band)
  }
  const sidePositions = []
  for (const [a, b] of coast)
    sidePositions.push(
      a.x,
      0,
      a.z,
      a.x,
      -0.68,
      a.z,
      b.x,
      0,
      b.z,
      b.x,
      0,
      b.z,
      a.x,
      -0.68,
      a.z,
      b.x,
      -0.68,
      b.z,
    )
  const sideGeometry = new THREE.BufferGeometry()
  sideGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sidePositions, 3))
  const sides = mesh(sideGeometry, material('#806446', { side: THREE.DoubleSide, roughness: 0.95 }), scene)
  sides.name = 'land-cutaway'
  const pins = []
  for (const city of city3dCoords) {
    const pin = new THREE.Group()
    pin.name = city.name
    pin.userData.city = city.name
    pin.position.set(city.x, terrain.sample(city.x, city.z), city.z)
    mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 8), material('#ac8d56'), pin, 0, 0.33)
    const jewel = mesh(
      new THREE.OctahedronGeometry(0.13),
      material('#d6b46b', { emissive: '#594421', emissiveIntensity: 0.15 }),
      pin,
      0,
      0.8,
    )
    jewel.name = 'jewel'
    const halo = mesh(
      new THREE.RingGeometry(0.19, 0.24, 36),
      new THREE.MeshBasicMaterial({
        color: '#b89555',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
      }),
      pin,
      0,
      0.04,
    )
    halo.rotation.x = -Math.PI / 2
    halo.name = 'halo'
    const ripple = mesh(
      new THREE.RingGeometry(0.25, 0.28, 36),
      new THREE.MeshBasicMaterial({
        color: '#e4c78a',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      }),
      pin,
      0,
      0.03,
    )
    ripple.rotation.x = -Math.PI / 2
    ripple.name = 'ripple'
    pin.traverse((object) => {
      object.castShadow = false
    })
    scene.add(pin)
    pins.push(pin)
  }
  const riverPositions = [],
    uv = [],
    riverIndices = []
  guidePoints.forEach((p, i) => {
    const before = guidePoints[Math.max(0, i - 1)],
      after = guidePoints[Math.min(guidePoints.length - 1, i + 1)],
      dx = after.x - before.x,
      dz = after.z - before.z,
      len = Math.hypot(dx, dz) || 1
    for (const side of [-1, 1]) {
      const x = p.x - (dz / len) * 0.17 * side,
        z = p.z + (dx / len) * 0.17 * side
      riverPositions.push(x, terrain.sample(x, z) + 0.055, z)
      uv.push(side === -1 ? 0 : 1, (i / guidePoints.length) * 20)
    }
    if (i < guidePoints.length - 1) {
      const a = i * 2
      riverIndices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
    }
  })
  const rg = new THREE.BufferGeometry()
  rg.setAttribute('position', new THREE.Float32BufferAttribute(riverPositions, 3))
  rg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  rg.setIndex(riverIndices)
  rg.computeVertexNormals()
  const river = mesh(
    rg,
    material('#14a9d2', {
      roughness: 0.24,
      metalness: 0.2,
      emissive: '#087aa5',
      emissiveIntensity: 0.28,
      side: THREE.DoubleSide,
    }),
    scene,
  )
  river.name = 'yellow-river'
  river.castShadow = false
  const riverEdges = new THREE.Group()
  for (const side of [-1, 1]) {
    const points = []
    guidePoints.forEach((p, i) => {
      const before = guidePoints[Math.max(0, i - 1)],
        after = guidePoints[Math.min(guidePoints.length - 1, i + 1)]
      const dx = after.x - before.x,
        dz = after.z - before.z,
        len = Math.hypot(dx, dz) || 1
      const x = p.x - (dz / len) * 0.18 * side,
        z = p.z + (dx / len) * 0.18 * side
      points.push(new THREE.Vector3(x, terrain.sample(x, z) + 0.08, z))
    })
    riverEdges.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: '#ffe3a1' }),
      ),
    )
  }
  scene.add(riverEdges)
  const stage = buildDioramaStage(scene, { polygons, contains, sample: terrain.sample })
  const landscape = buildLandscape(scene, { contains, sample: terrain.sample })
  const dotsGeometry = new THREE.BufferGeometry()
  dotsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(60 * 3), 3))
  const dots = new THREE.Points(
    dotsGeometry,
    new THREE.PointsMaterial({ color: '#f6e8b1', size: 0.045, transparent: true, opacity: 0.7 }),
  )
  scene.add(dots)
  const rainGeometry = new THREE.BufferGeometry(),
    rainPositions = new Float32Array(600 * 3)
  for (let i = 0; i < 600; i++) {
    rainPositions[i * 3] = Math.random() * 28 - 14
    rainPositions[i * 3 + 1] = Math.random() * 12
    rainPositions[i * 3 + 2] = Math.random() * 28 - 14
  }
  rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3))
  const rain = new THREE.Points(
    rainGeometry,
    new THREE.PointsMaterial({ color: '#b5cbd0', size: 0.035, transparent: true, opacity: 0 }),
  )
  scene.add(rain)
  function refresh(region) {
    const affected = (x, z) =>
      !region ||
      (Math.abs(x - region.x) < region.radius + 0.65 && Math.abs(z - region.z) < region.radius + 0.65)
    const p = geometry.attributes.position
    for (let i = 0; i < p.count; i++) {
      if (affected(p.getX(i), p.getZ(i))) p.setY(i, terrain.sample(p.getX(i), p.getZ(i)))
    }
    p.needsUpdate = true
    geometry.computeVertexNormals()
    geometry.computeBoundingSphere()
    outlines.children.forEach((line) => {
      const lp = line.geometry.attributes.position
      for (let i = 0; i < lp.count; i++)
        if (affected(lp.getX(i), lp.getZ(i))) lp.setY(i, terrain.sample(lp.getX(i), lp.getZ(i)) + 0.025)
      lp.needsUpdate = true
    })
    const sp = sideGeometry.attributes.position
    for (let i = 0; i < sp.count; i++)
      if ((i % 6 === 0 || i % 6 === 2 || i % 6 === 3) && affected(sp.getX(i), sp.getZ(i)))
        sp.setY(i, terrain.sample(sp.getX(i), sp.getZ(i)))
    sp.needsUpdate = true
    sideGeometry.computeVertexNormals()
    sideGeometry.computeBoundingSphere()
    pins.forEach((pin) => (pin.position.y = terrain.sample(pin.position.x, pin.position.z)))
    for (const band of goldLines) {
      const bp = band.geometry.attributes.position
      for (let i = 0; i < bp.count; i++)
        if (affected(bp.getX(i), bp.getZ(i))) bp.setY(i, terrain.sample(bp.getX(i), bp.getZ(i)) + 0.04)
      bp.needsUpdate = true
      band.geometry.computeBoundingSphere()
    }
    const waterPositions = rg.attributes.position
    for (let i = 0; i < waterPositions.count; i++)
      waterPositions.setY(i, terrain.sample(waterPositions.getX(i), waterPositions.getZ(i)) + 0.055)
    waterPositions.needsUpdate = true
    rg.computeBoundingSphere()
    riverEdges.children.forEach((line) => {
      const points = line.geometry.attributes.position
      for (let i = 0; i < points.count; i++)
        points.setY(i, terrain.sample(points.getX(i), points.getZ(i)) + 0.08)
      points.needsUpdate = true
      line.geometry.computeBoundingSphere()
    })
    landscape.refresh(region)
  }
  function animate(time, dt, motion, selected, rainAmount, quality = 'medium') {
    stage.animate(time, motion)
    dotsGeometry.setDrawRange(0, quality === 'low' ? 20 : 60)
    rainGeometry.setDrawRange(0, quality === 'low' ? 120 : quality === 'medium' ? 300 : 600)
    pins.forEach((p, i) => {
      const jewel = p.getObjectByName('jewel'),
        halo = p.getObjectByName('halo'),
        ripple = p.getObjectByName('ripple')
      jewel.rotation.y = motion ? time * 0.5 + i : 0
      halo.material.opacity = p.name === selected ? 1 : 0.45
      halo.scale.setScalar(p.name === selected ? 1.4 : 1)
      const s = motion ? 1 + ((time * 0.5 + i * 0.2) % 1) : 1
      ripple.scale.set(s, s, 1)
      ripple.material.opacity = motion ? (2 - s) * 0.3 : 0.15
    })
    dots.visible = motion
    const p = dotsGeometry.attributes.position
    for (let i = 0; i < p.count; i++) {
      const a = ((i / p.count + (motion ? time * 0.025 : 0)) % 1) * (guidePoints.length - 1),
        j = Math.floor(a),
        v = guidePoints[j].clone().lerp(guidePoints[Math.min(j + 1, guidePoints.length - 1)], a - j)
      p.setXYZ(i, v.x, terrain.sample(v.x, v.z) + 0.095, v.z)
    }
    p.needsUpdate = true
    rain.visible = rainAmount > 0.01
    rain.material.opacity = rainAmount * 0.5
    if (motion) {
      const rp = rainGeometry.attributes.position
      for (let i = 0; i < rp.count; i++) rp.setY(i, (rp.getY(i) - dt * 8 + 12) % 12)
      rp.needsUpdate = true
    }
  }
  refresh()
  return { land, pins, refresh, animate, contains, occluders: [sides, landscape.group] }
}
