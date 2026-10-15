import * as THREE from 'three'
import { makeAsset, releaseTree } from './scene.js'
import { riverDistance } from './geography.js'
export function createEditor({
  scene,
  terrain,
  world,
  history,
  selectedObject,
  brush,
  objectAsset,
  commit,
  invalidate = () => {},
  notify = () => {},
}) {
  const group = new THREE.Group()
  scene.add(group)
  const cursor = new THREE.Mesh(
    new THREE.RingGeometry(0.97, 1, 48),
    new THREE.MeshBasicMaterial({
      color: '#f8d78b',
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
      opacity: 0.8,
    }),
  )
  cursor.rotation.x = -Math.PI / 2
  cursor.visible = false
  cursor.renderOrder = 10
  scene.add(cursor)
  let dragging = null,
    painting = false,
    changed = false,
    flattenHeight = 0,
    local = history.value
  let brushPoint = null,
    brushElapsed = 0
  const valid = (p) => p && world.contains(p.x, p.z) && riverDistance(p.x, p.z) > 0.55
  function sync() {
    local = history.value
    terrain.restore(local.heights)
    world.refresh()
    invalidate()
    releaseTree(group)
    group.clear()
    local.objects.forEach((o) => {
      const item = makeAsset(o.asset)
      item.userData.objectId = o.id
      group.add(item)
      apply(item, o)
    })
    selectedObject.value = local.objects.find((o) => o.id === selectedObject.value?.id) || null
  }
  function apply(item, o) {
    item.position.set(o.x, terrain.sample(o.x, o.z), o.z)
    item.rotation.y = (o.rotation * Math.PI) / 180
    item.scale.setScalar(o.scale)
  }
  function objectFromHits(hits) {
    for (const hit of hits.slice(0, 1)) {
      let o = hit.object
      while (o && o !== scene) {
        if (o.userData.objectId) return local.objects.find((x) => x.id === o.userData.objectId)
        o = o.parent
      }
    }
    return null
  }
  function down(point, hits, mode) {
    changed = false
    if (mode === 'object') {
      const o = objectFromHits(hits)
      selectedObject.value = o || null
      if (o) dragging = o.id
    } else if (mode === 'terrain' && point) {
      painting = true
      flattenHeight = terrain.sample(point.x, point.z)
      brushPoint = point.clone()
    }
  }
  function paint(p, dt) {
    if (!valid(p)) return
    terrain.paint({
      ...brush.value,
      strength: brush.value.strength * dt * 6,
      x: p.x,
      z: p.z,
      target: flattenHeight,
    })
    local.heights = terrain.edits
    world.refresh({ x: p.x, z: p.z, radius: brush.value.radius })
    group.children.forEach((m) => {
      m.position.y = terrain.sample(m.position.x, m.position.z)
    })
    invalidate()
    changed = true
  }
  function move(point, mode) {
    cursor.visible = mode === 'terrain' && !!point
    if (point) {
      cursor.position.set(point.x, terrain.sample(point.x, point.z) + 0.07, point.z)
      cursor.scale.setScalar(brush.value.radius)
    }
    if (painting) brushPoint = point?.clone() || null
    if (dragging && valid(point)) {
      const o = local.objects.find((o) => o.id === dragging)
      o.x = point.x
      o.z = point.z
      apply(
        group.children.find((m) => m.userData.objectId === dragging),
        o,
      )
      selectedObject.value = { ...o }
      invalidate()
      changed = true
    }
  }
  function up(point, mode, isClick) {
    if (dragging || painting) {
      if (changed) commit({ ...local, heights: terrain.edits })
      dragging = null
      painting = false
      brushPoint = null
      return
    }
    if (mode === 'object' && isClick && !valid(point)) {
      notify('请选择陆地位置，并避开受保护河岸')
      return
    }
    if (mode === 'object' && isClick && valid(point)) {
      if (local.objects.length >= 500) {
        notify('示意物件最多 500 个，请先移除部分物件')
        return
      }
      const o = {
        id: crypto.randomUUID(),
        asset: objectAsset.value,
        x: point.x,
        z: point.z,
        rotation: 0,
        scale: 1,
      }
      local.objects.push(o)
      selectedObject.value = o
      commit(local)
      sync()
    }
  }
  function cancel() {
    dragging = null
    painting = false
    brushPoint = null
    cursor.visible = false
    sync()
  }
  function update(patch) {
    if (!selectedObject.value) return
    const o = local.objects.find((o) => o.id === selectedObject.value.id)
    const candidate = { ...o, ...patch, id: o.id, asset: o.asset }
    if (!valid(candidate)) throw new Error('物件须位于陆地，避开河道')
    commit({ ...local, objects: local.objects.map((item) => (item.id === o.id ? candidate : item)) })
    sync()
  }
  function remove() {
    if (!selectedObject.value) return
    commit({ ...local, objects: local.objects.filter((o) => o.id !== selectedObject.value.id) })
    selectedObject.value = null
    sync()
  }
  function tick(dt) {
    if (!painting || !brushPoint) {
      brushElapsed = 0
      return
    }
    brushElapsed += dt
    if (brushElapsed >= 0.05) {
      paint(brushPoint, brushElapsed)
      brushElapsed = 0
    }
  }
  sync()
  return { sync, down, move, up, cancel, update, remove, tick, objects: group }
}
