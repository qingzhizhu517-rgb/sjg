// display-v2/src/composables/useGlbScene.js
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { gsap } from 'gsap'

/**
 * 通用 GLB 场景：renderer/scene/camera/灯光/加载/拾取/相机机位。
 * 不懂"工序"——工序逻辑在 useCraftProcess。
 *
 * 用法：
 *   const scene = useGlbScene()
 *   await scene.init(canvasEl)
 *   const { partNames } = await scene.load('/media/crafts/x.glb')  // 或 THREE.Group
 *   scene.setVisible(['gourd_body', 'scene_base'])
 *   scene.applyCameraPose({ pos: [0,1,3], target: [0,0.5,0] })
 *   scene.onPartClick((name, point) => ...)
 *   scene.dispose()
 */
export function useGlbScene() {
  let renderer = null
  let scene = null
  let camera = null
  let controls = null
  let root = null            // 当前模型根
  let rafId = null
  let raycaster = null
  let clickCb = null
  let hoverCb = null
  let onProgress = null
  let downPos = null
  const originalMaterials = new Map()  // mesh.uuid -> material（toon 还原用）

  const init = async (canvas) => {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 1.2, 3.2)

    // 默认暖色射灯（real 风格；inkwash 平光由 useToonTheme 调整）
    scene.add(new THREE.AmbientLight(0xfff5e6, 0.5))
    const key = new THREE.DirectionalLight(0xffe8c0, 1.4)
    key.position.set(3, 5, 4)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xc0d4ff, 0.5)
    rim.position.set(-3, 2, -3)
    scene.add(rim)

    controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.enabled = false          // 默认锁交互，末步自由把玩才解锁
    controls.target.set(0, 0.6, 0)

    raycaster = new THREE.Raycaster()

    const resize = () => {
      const w = canvas.clientWidth || 1
      const h = canvas.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)
    init._resize = resize

    canvas.addEventListener('pointermove', _handlePointer)
    canvas.addEventListener('pointerdown', _handleDown)
    canvas.addEventListener('pointerup', _handleClick)

    const tick = () => {
      controls.update()
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }
    tick()
  }

  /** source: GLB url 字符串，或直接给 THREE.Group（占位模型） */
  const load = (source) =>
    new Promise((resolve, reject) => {
      const onLoaded = (obj) => {
        if (root) scene.remove(root)
        root = obj
        scene.add(root)
        root.traverse((m) => {
          if (m.isMesh) originalMaterials.set(m.uuid, m.material)
        })
        resolve({ partNames: _collectNames(root) })
      }
      if (typeof source !== 'string') { onLoaded(source); return }
      const draco = new DRACOLoader()
      draco.setDecoderPath('/draco/gltf/')
      const loader = new GLTFLoader()
      loader.setDRACOLoader(draco)
      loader.load(
        source,
        (gltf) => onLoaded(gltf.scene),
        (ev) => { if (onProgress && ev.total) onProgress(ev.loaded / ev.total) },
        (err) => reject(err),
      )
    })

  const _collectNames = (obj) => {
    const names = []
    obj.traverse((n) => { if (n.name) names.push(n.name) })
    return names
  }

  const getObject = (name) => root?.getObjectByName(name) || null

  /** 精确名集合显隐：在集合内 visible=true，其余部件 false（scene 灯光等不受影响） */
  const setVisible = (names) => {
    if (!root) return
    const set = names instanceof Set ? names : new Set(names)
    root.traverse((n) => {
      if (n.name && !n.isScene) n.visible = set.has(n.name)
    })
  }

  /** 相机机位 tween（GSAP）。pose = { pos: [x,y,z], target: [x,y,z], duration? } */
  const applyCameraPose = (pose) => {
    if (!camera || !pose) return
    const d = pose.duration ?? 1.2
    gsap.to(camera.position, { x: pose.pos[0], y: pose.pos[1], z: pose.pos[2], duration: d, ease: 'power2.inOut', overwrite: 'auto' })
    gsap.to(controls.target, { x: pose.target[0], y: pose.target[1], z: pose.target[2], duration: d, ease: 'power2.inOut', overwrite: 'auto' })
  }

  const _pick = (ev) => {
    if (!root || !camera) return null
    const rect = ev.currentTarget.getBoundingClientRect()
    const ndc = new THREE.Vector2(
      ((ev.clientX - rect.left) / rect.width) * 2 - 1,
      -((ev.clientY - rect.top) / rect.height) * 2 + 1,
    )
    raycaster.setFromCamera(ndc, camera)
    const hits = raycaster.intersectObjects(root.children, true)
    const hit = hits.find((h) => h.object.visible && _named(h.object))
    return hit ? { name: _named(hit.object), point: hit.point } : null
  }

  /** 向上找最近的有名祖先（纹样层可能挂在本体下） */
  const _named = (obj) => {
    let o = obj
    while (o && !o.name) o = o.parent
    return o?.name || null
  }

  const _handlePointer = (ev) => {
    if (!hoverCb) return
    const hit = _pick(ev)
    hoverCb(hit ? hit.name : null, ev)
  }

  const _handleDown = (ev) => {
    downPos = { x: ev.clientX, y: ev.clientY }
  }

  const _handleClick = (ev) => {
    if (!clickCb || !downPos) return
    const dx = ev.clientX - downPos.x, dy = ev.clientY - downPos.y
    downPos = null
    if (dx * dx + dy * dy > 36) return
    const hit = _pick(ev)
    if (hit) clickCb(hit.name, hit.point)
  }

  const onPartClick = (cb) => { clickCb = cb }
  const onPartHover = (cb) => { hoverCb = cb }
  const setOnProgress = (cb) => { onProgress = cb }

  /** 自由把玩开关（末步解锁 OrbitControls） */
  const setFreeRoam = (on) => { if (controls) controls.enabled = !!on }

  const pause = () => { if (rafId) { cancelAnimationFrame(rafId); rafId = null } }
  const resume = () => { if (!rafId && renderer) { const tick = () => { controls.update(); renderer.render(scene, camera); rafId = requestAnimationFrame(tick) }; tick() } }

  const getScene = () => scene
  const getRoot = () => root
  const getOriginalMaterials = () => originalMaterials

  const dispose = () => {
    pause()
    window.removeEventListener('resize', init._resize)
    const canvas = renderer?.domElement
    canvas?.removeEventListener('pointermove', _handlePointer)
    canvas?.removeEventListener('pointerdown', _handleDown)
    canvas?.removeEventListener('pointerup', _handleClick)
    controls?.dispose()
    root?.traverse((m) => { if (m.isMesh) { m.geometry?.dispose(); [].concat(m.material).forEach((mt) => mt?.dispose?.()) } })
    renderer?.dispose()
    renderer = scene = camera = controls = root = raycaster = null
    clickCb = hoverCb = onProgress = null
    originalMaterials.clear()
  }

  return {
    init, load, getObject, setVisible, applyCameraPose,
    onPartClick, onPartHover, setOnProgress, setFreeRoam,
    pause, resume, dispose,
    getScene, getRoot, getOriginalMaterials,
  }
}

/** 低端机 / WebGL 不可用判定（降级静态图用） */
export const canUseWebGL = () => {
  try {
    const c = document.createElement('canvas')
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) return false
    const cores = navigator.hardwareConcurrency || 4
    const mem = navigator.deviceMemory || 4
    return cores >= 4 && mem >= 4
  } catch {
    return false
  }
}
