import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { buildWorld, releaseTree } from '../src/three/sandbox/scene.js'
import { projectGeo } from '../src/three/sandbox/geography.js'
const square = [
  [117, 36],
  [118, 36],
  [118, 37],
  [117, 37],
  [117, 36],
]
const hole = [
  [117.4, 36.4],
  [117.6, 36.4],
  [117.6, 36.6],
  [117.4, 36.6],
  [117.4, 36.4],
]
test('terrain preserves exact boundary vertices and holes while sampling interior heights', () => {
  const scene = new THREE.Scene()
  const world = buildWorld(
    scene,
    { features: [{ geometry: { type: 'Polygon', coordinates: [square, hole] } }] },
    { sample: (x, z) => Math.sin(x) + Math.cos(z) },
  )
  const corner = projectGeo(117, 36),
    insideHole = projectGeo(117.5, 36.5)
  const p = world.land.geometry.attributes.position
  assert.ok(
    Array.from({ length: p.count }, (_, i) => i).some(
      (i) => Math.abs(p.getX(i) - corner.x) < 1e-5 && Math.abs(p.getZ(i) - corner.z) < 1e-5,
    ),
    'preserve coastline corners exactly',
  )
  assert.equal(world.contains(insideHole.x, insideHole.z), false, 'hole is not editable land')
  assert.ok(p.count > 20, 'interior is tessellated')
  releaseTree(scene)
})

test('releaseTree releases instance-specific GPU buffers as well as shared geometry', () => {
  const group = new THREE.Group()
  const instanced = new THREE.InstancedMesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial(), 2)
  group.add(instanced)
  let disposed = false
  instanced.addEventListener('dispose', () => {
    disposed = true
  })
  releaseTree(group)
  assert.equal(disposed, true)
})
