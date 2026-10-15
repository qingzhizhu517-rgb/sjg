import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { buildDioramaStage } from '../src/three/sandbox/dioramaStage.js'

const ring = [
  { x: -3, z: -3 },
  { x: 4, z: -3 },
  { x: 4, z: 4 },
  { x: -3, z: 4 },
]
const options = {
  polygons: [[ring]],
  contains: (x, z) => x > -3 && x < 4 && z > -3 && z < 4,
  sample: (x, z) => Math.sin(x) * Math.cos(z),
}

test('diorama geometry is finite, bounded and constructible without a document', () => {
  const scene = new THREE.Scene()
  buildDioramaStage(scene, options)
  const geometries = new Set()
  const materials = new Set()
  scene.traverse((object) => {
    if (!object.isMesh) return
    geometries.add(object.geometry)
    materials.add(object.material)
    const positions = object.geometry.attributes.position.array
    assert.ok([...positions].every(Number.isFinite), object.name)
    object.geometry.computeBoundingBox()
    assert.ok(object.geometry.boundingBox.min.length() < 40, object.name)
  })
  const base = scene.getObjectByName('diorama-plinth')
  assert.equal(base.position.x - base.geometry.parameters.width / 2, -12.5)
  assert.equal(base.position.x + base.geometry.parameters.width / 2, 19.5)
  assert.ok(Math.abs(base.position.y + base.geometry.parameters.height / 2 + 0.85) < 1e-12)
  assert.ok(geometries.size <= 6, 'shared frame geometry keeps resource count bounded')
  assert.ok(materials.size <= 5, 'no per-cell materials')
  assert.equal(scene.getObjectByName('diorama-sea').position.y, -0.7)
})

test('illustrative mainland narrows north of Bohai and widens south of Shandong', () => {
  const scene = new THREE.Scene()
  buildDioramaStage(scene, options)
  const positions = scene.getObjectByName('diorama-context-land').geometry.attributes.position
  let southEdge = -Infinity
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i)
    const z = positions.getZ(i)
    if (z < -4) assert.ok(x < -2, 'northern background leaves Bohai open')
    if (z > 4) southEdge = Math.max(southEdge, x)
  }
  assert.ok(southEdge > 5 && southEdge < 7, 'southern context reaches east while leaving the sea visible')
})

test('sea shore tint follows boundaries and western context stays outside the province', () => {
  const scene = new THREE.Scene()
  buildDioramaStage(scene, options)
  const sea = scene.getObjectByName('diorama-sea')
  const coast = sea.geometry.attributes.coast.array
  assert.ok(Math.max(...coast) > 0.8)
  assert.ok(Math.min(...coast) < 0.01)
  const context = scene.getObjectByName('diorama-context-land')
  assert.equal(context.userData.illustrative, true)
  const positions = context.geometry.attributes.position
  assert.ok(positions.count > 0)
  for (let i = 0; i < positions.count; i++) {
    assert.equal(options.contains(positions.getX(i), positions.getZ(i)), false)
    assert.ok(positions.getY(i) > -0.7)
    assert.ok(positions.getY(i) < 0)
  }
})

test('water animation freezes with motion disabled and retains scene-owned resources', () => {
  const scene = new THREE.Scene()
  const stage = buildDioramaStage(scene, options)
  const sea = scene.getObjectByName('diorama-sea')
  stage.animate(3, true)
  const previous = sea.material.uniforms.time.value
  stage.animate(30, false)
  assert.equal(sea.material.uniforms.time.value, previous)
  stage.animate(31, true)
  assert.equal(sea.material.uniforms.time.value, 31)
  assert.equal(stage.dispose, undefined, 'releaseTree owns disposal')
})
