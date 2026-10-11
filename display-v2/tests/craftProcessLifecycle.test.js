import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import * as vue from 'vue'
import * as processUtils from '../src/utils/craftProcess.js'
import { Object3D, MeshStandardMaterial } from 'three'

const source = await readFile(new URL('../src/composables/useCraftProcess.js', import.meta.url), 'utf8')
const body = source.replace(/import[\s\S]*?from [^\n]+\n/g, '').replace('export function', 'function')
function fixture(reduced = false) {
  const tracks = []
  const gsap = { timeline: () => {
    const track = { killed: false, calls: [], to(target, properties) { this.calls.push({ target, properties }); return this }, fromTo(target, from, properties) { this.calls.push({ target, from, properties }); return this }, call() { return this }, kill() { this.killed = true } }
    tracks.push(track); return track
  } }
  const useCraftProcess = new Function('ref', 'computed', 'gsap', ...Object.keys(processUtils), 'window', `${body}; return useCraftProcess`)(vue.ref, vue.computed, gsap, ...Object.values(processUtils), { matchMedia: () => ({ matches: reduced }) })
  const obj = new Object3D(); obj.material = new MeshStandardMaterial({ opacity: .75 }); obj.scale.set(2, 3, 4)
  let camera
  const scene = { getObject: () => obj, setVisible: () => {}, setFreeRoam: () => {}, applyCameraPose: p => { camera = p } }
  const config = { steps: [{ visible: ['piece'], animations: [{ target: 'piece', fadeIn: true }], camera: { pos: [0, 0, 3], target: [0, 0, 0] } }, { visible: ['piece'], animations: [{ target: 'piece', moveX: 1 }] }] }
  const createInstance = (instanceObj) => {
    const instance = useCraftProcess(config, { ...scene, getObject: () => instanceObj })
    instance.setPartNames(['piece'])
    return instance
  }
  const api = useCraftProcess(config, scene)
  api.setPartNames(['piece'])
  return { api, obj, tracks, createInstance, camera: () => camera }
}

test('位姿基准隔离到实例，释放另一实例不改变原始比例', () => {
  const a = fixture(), bObj = new Object3D()
  bObj.material = new MeshStandardMaterial(); bObj.scale.set(5, 6, 7)
  const b = a.createInstance(bObj)
  a.api.enter(0); b.enter(0); b.dispose()
  a.obj.scale.set(8, 8, 8); a.api.enter(1)
  assert.deepEqual(a.obj.scale.toArray(), [2, 3, 4])
  a.api.dispose()
})
test('快速切步取消所有前序动画，淡入改变材质透明度而不是整体缩放', () => {
  const f = fixture()
  f.api.enter(0)
  assert.ok(f.tracks.some(t => t.calls.some(c => c.target === f.obj.material && c.properties.opacity === .75)))
  const old = [...f.tracks]
  f.api.enter(1)
  assert.ok(old.every(t => t.killed))
  f.api.dispose()
  assert.ok(f.tracks.every(t => t.killed))
})
test('减少动态直接呈现终态，相机也取消过渡', () => {
  const f = fixture(true)
  f.api.enter(0)
  assert.equal(f.tracks.length, 0)
  assert.equal(f.obj.material.opacity, .75)
  assert.equal(f.camera().duration, 0)
  f.api.dispose()
})
