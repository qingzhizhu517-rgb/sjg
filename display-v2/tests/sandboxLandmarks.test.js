import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { buildLandmarks } from '../src/three/sandbox/landmarks.js'
import { releaseTree } from '../src/three/sandbox/scene.js'

test('illustrative architecture batches materials and follows edits without rebuilding geometry', () => {
  const scene = new THREE.Scene()
  let height = 0.3
  const landmarks = buildLandmarks(scene, { contains: () => true, sample: () => height })
  assert.equal(scene.children.length, 2)
  const geometries = new Set()
  scene.traverse((object) => {
    if (!object.isMesh) return
    geometries.add(object.geometry)
    assert.ok(Array.from(object.geometry.attributes.position.array).every(Number.isFinite))
  })
  assert.ok(geometries.size <= 10, 'bound new draw calls across both sites')
  const site = scene.children[0]
  const previous = scene.children[1].position.y
  height = 1.2
  landmarks.refresh({ x: site.position.x, z: site.position.z, radius: 0.01 })
  assert.equal(site.position.y, height)
  assert.equal(scene.children[1].position.y, previous, 'unaffected sites remain unchanged')
  landmarks.refresh()
  assert.equal(scene.children[1].position.y, height)
  let disposals = 0
  geometries.forEach((geometry) => geometry.addEventListener('dispose', () => disposals++))
  releaseTree(scene)
  assert.equal(disposals, geometries.size)
})

test('landmark silhouettes are omitted when the map excludes their anchors', () => {
  const scene = new THREE.Scene()
  const landmarks = buildLandmarks(scene, { contains: () => false, sample: () => 0.3 })
  landmarks.refresh()
  assert.equal(scene.children.length, 0)
})
