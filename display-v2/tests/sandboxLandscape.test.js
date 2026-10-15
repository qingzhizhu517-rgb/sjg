import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { boundarySegments, buildLandscape } from '../src/three/sandbox/landscape.js'
const ring = (x) => [
  { x, z: 0 },
  { x: x + 1, z: 0 },
  { x: x + 1, z: 1 },
  { x, z: 1 },
  { x, z: 0 },
]
test('province outline removes shared prefecture edges but retains coast', () => {
  const segments = boundarySegments([ring(0), ring(1)])
  assert.equal(segments.length, 6)
  assert.ok(!segments.some(([a, b]) => a.x === 1 && b.x === 1))
})
test('landscape instances stay on land, refresh heights and use a bounded number of draw objects', () => {
  const scene = new THREE.Scene()
  let height = 0.2
  const landscape = buildLandscape(scene, {
    contains: (x, z) => Math.abs(x) < 3 && Math.abs(z) < 3,
    sample: () => height,
  })
  const instances = []
  scene.traverse((o) => {
    if (o.isInstancedMesh) instances.push(o)
  })
  assert.ok(instances.length > 0 && instances.length < 10)
  const footprints = landscape.group.children.filter((child) => child.isGroup)
  const mat = new THREE.Matrix4(),
    pos = new THREE.Vector3()
  for (const mesh of instances)
    for (let i = 0; i < mesh.count; i++) {
      mesh.getMatrixAt(i, mat)
      pos.setFromMatrixPosition(mat)
      assert.ok(Math.abs(pos.x) < 3 && Math.abs(pos.z) < 3)
      for (const site of footprints)
        assert.ok(
          Math.abs(pos.x - site.position.x) >= 0.45 || Math.abs(pos.z - site.position.z) >= 0.55,
          `${mesh.name} must not intersect the authored architecture footprint`,
        )
    }
  height = 1
  landscape.refresh()
  for (const mesh of instances)
    if (mesh.count) {
      mesh.getMatrixAt(0, mat)
      pos.setFromMatrixPosition(mat)
      assert.ok(pos.y >= 1)
    }
})
