import { computed, ref } from 'vue'
import { NINE_CITIES } from '../config/nineCities.js'
import { createTour } from '../three/sandbox/tour.js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  layoutLabels,
  createFlight,
  createGesture,
  createHistory,
  createTerrain,
  emptyDraft,
  validateDraft,
} from '../three/sandbox/core.js'
import { getTerrainHeight, riverDistance, city3dCoords, guidePoints } from '../three/sandbox/geography.js'
import { buildWorld, releaseTree } from '../three/sandbox/scene.js'
import { createEditor } from '../three/sandbox/editor.js'
import { createRenderPipeline } from '../three/sandbox/renderPipeline.js'
import { draftStorage } from '../three/sandbox/storage.js'

export function useThreeSandbox() {
  const canvas3d = ref(null),
    selectedCity = ref(null),
    cityLabels = ref([]),
    errorMsg = ref(null),
    notice = ref('')
  const ready = ref(false),
    loading = ref(false),
    status = ref('idle'),
    mode = ref('explore'),
    weather = ref('clear'),
    quality = ref('medium')
  const tourController = createTour(NINE_CITIES)
  const tour = ref(tourController.snapshot())
  const motion = ref(true),
    touchInteraction = ref(false),
    selectedObject = ref(null),
    canUndo = ref(false),
    canRedo = ref(false)
  const objectAsset = ref('pavilion'),
    brush = ref({ type: 'raise', radius: 1, strength: 0.15 })
  let scene,
    camera,
    renderer,
    pipeline,
    controls,
    world,
    editor,
    light,
    frame = 0,
    generation = 0,
    abort,
    callbacks = {}
  let observers = [],
    listeners = [],
    visible = true,
    contextLost = false,
    previousTime = 0,
    elapsed = 0,
    weatherMix = 0,
    rainMix = 0,
    lastLabelTime = 0
  const flight = createFlight(),
    targetFlight = createFlight(),
    gesture = createGesture(),
    history = createHistory(emptyDraft())
  const terrain = createTerrain({ base: getTerrainHeight, riverDistance }),
    raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2()
  const reducedQuery =
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
  const reducedMotion = ref(!!reducedQuery?.matches)
  const tourCanPlay = computed(() => motion.value && !reducedMotion.value)
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  if (coarse) quality.value = 'low'
  motion.value = !reducedQuery?.matches
  const listen = (element, type, handler, options) => {
    element.addEventListener(type, handler, options)
    listeners.push(() => element.removeEventListener(type, handler, options))
  }
  const stopFlight = () => {
    flight.cancel()
    targetFlight.cancel()
  }
  const actualMotion = () => tourCanPlay.value
  function updateHistory() {
    canUndo.value = history.canUndo
    canRedo.value = history.canRedo
  }
  function commit(value) {
    history.commit(validateDraft(value))
    if (renderer) renderer.shadowMap.needsUpdate = true
    updateHistory()
  }
  function syncDraft() {
    weather.value = history.value.weather
    editor?.sync()
    updateHistory()
  }
  function setMode(value) {
    if (!['explore', 'guided', 'object', 'terrain'].includes(value)) return
    editor?.cancel()
    stopTour()
    mode.value = value
    if (controls) controls.enabled = value === 'explore' || value === 'guided'
    if (coarse && (value === 'object' || value === 'terrain')) setTouchInteraction(true)
  }
  function setWeather(value) {
    if (!['clear', 'fog', 'rain'].includes(value)) return
    weather.value = value
    commit({ ...history.value, weather: value })
    editor?.sync()
    if (!actualMotion()) {
      weatherMix = value === 'clear' ? 0 : 1
      rainMix = value === 'rain' ? 1 : 0
    }
  }
  function setQuality(value) {
    if (!['low', 'medium', 'high'].includes(value)) return
    quality.value = value
    if (renderer) {
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, value === 'low' ? 1 : value === 'medium' ? 1.5 : 2),
      )
      pipeline?.setQuality(value)
      resize()
      renderer.shadowMap.enabled = value !== 'low'
      renderer.shadowMap.needsUpdate = true
      if (light) {
        light.shadow.mapSize.setScalar(value === 'high' ? 2048 : 1024)
        light.shadow.map?.dispose()
        light.shadow.map = null
      }
    }
  }
  function setMotion(value) {
    motion.value = !!value
    if (!actualMotion()) {
      pauseTour()
      stopFlight()
    }
  }
  function setTouchInteraction(value) {
    touchInteraction.value = !!value
    if (controls) {
      controls.touches.ONE = value ? THREE.TOUCH.ROTATE : null
      renderer.domElement.style.touchAction = coarse && !value ? 'pan-y' : 'none'
    }
  }
  function startFlight(position, target, duration = 1.15) {
    if (!camera || !controls) return
    stopFlight()
    if (!actualMotion()) {
      camera.position.fromArray(position)
      controls.target.fromArray(target)
      controls.update()
      return
    }
    flight.start(camera.position.toArray(), position, duration)
    targetFlight.start(controls.target.toArray(), target, duration)
  }
  function stopTour() {
    tour.value = tourController.stop()
    stopFlight()
  }
  function pauseTour() {
    tour.value = tourController.pause()
    stopFlight()
  }
  function visitTourStop() {
    const pin = world?.pins.find((p) => p.name === tour.value.city)
    if (!pin) return
    const p = pin.position
    const zOffset = pin.name === '泰安' || pin.name === '济南' ? -6.2 : 6.2
    startFlight([p.x + 2.2, p.y + 5.6, p.z + zOffset], [p.x, p.y + 0.4, p.z], 2.4)
    projectLabels()
  }
  function startTour() {
    if (!ready.value) return
    setMode('explore')
    selectedCity.value = null
    callbacks.onClearCity?.()
    notice.value = ''
    tour.value = tourController.start(actualMotion())
    visitTourStop()
  }
  function toggleTour() {
    if (tour.value.status === 'idle' || tour.value.status === 'complete') return startTour()
    if (tour.value.status === 'playing') return pauseTour()
    if (!actualMotion()) return
    tour.value = tourController.resume()
    visitTourStop()
  }
  function moveTour(delta) {
    if (tour.value.status === 'idle') return
    tour.value = tourController.move(delta)
    visitTourStop()
  }
  function setView(value) {
    const presets = {
      overview: [
        [5, 14, 17],
        [5, 0.4, 0],
      ],
      jitai: [
        [4.2, 6.4, -7.4],
        [0.3, 0.9, 0.2],
      ],
      top: [
        [1, 25, 0.05],
        [1, 0, 0],
      ],
      river: [
        [6, 7, 9],
        [-1, 0, 0],
      ],
    }
    if (presets[value]) {
      stopTour()
      if (mode.value === 'guided') setMode('explore')
      startFlight(...presets[value])
    }
  }
  function zoom(delta) {
    if (!camera || !controls || !Number.isFinite(delta)) return
    stopTour()
    if (mode.value === 'guided') setMode('explore')
    const offset = camera.position.clone().sub(controls.target)
    offset.setLength(
      THREE.MathUtils.clamp(offset.length() * (1 + delta), controls.minDistance, controls.maxDistance),
    )
    camera.position.copy(controls.target).add(offset)
    controls.update()
  }
  function flyToCity(name) {
    stopTour()
    if (mode.value === 'guided') setMode('explore')
    const pin = world?.pins.find((p) => p.name === name)
    if (pin) startFlight([pin.position.x, pin.position.y + 3.8, pin.position.z + 5.2], pin.position.toArray())
  }
  function selectCity(name) {
    selectedCity.value = name
    callbacks.onPickCity?.(name)
    flyToCity(name)
  }
  function setGuidedProgress(progress) {
    if (mode.value !== 'guided' || !camera || !controls || !actualMotion()) return
    stopFlight()
    const i = Math.min(
      guidePoints.length - 1,
      Math.floor(THREE.MathUtils.clamp(progress, 0, 1) * (guidePoints.length - 1)),
    )
    const p = guidePoints[i]
    camera.position.set(p.x + 2, 8, p.z + 8)
    controls.target.set(p.x, terrain.sample(p.x, p.z), p.z)
  }
  function resize() {
    if (!renderer || !camera || !canvas3d.value?.parentElement) return
    const { clientWidth: w, clientHeight: h } = canvas3d.value.parentElement
    if (!w || !h) return
    renderer.setSize(w, h, false)
    pipeline?.resize(w, h, renderer.getPixelRatio())
    camera.aspect = w / h
    camera.fov = THREE.MathUtils.radToDeg(
      2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(43 / 2)) / Math.min(1, camera.aspect / 1.65)),
    )
    camera.updateProjectionMatrix()
  }
  function hitTest(event) {
    const rect = canvas3d.value.getBoundingClientRect()
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1,
    )
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(
      [world.land, ...world.pins, editor.objects, ...world.occluders],
      true,
    )
    const ground = hits.find((h) => h.object === world.land)
    let city = null
    for (const hit of hits.slice(0, 1)) {
      let object = hit.object
      while (object && object !== scene) {
        if (object.userData.city) {
          city = object.userData.city
          break
        }
        object = object.parent
      }
      if (city) break
    }
    return { hits, point: ground?.point, city }
  }
  function bindPointers() {
    const canvas = renderer.domElement
    const active = new Set()
    let multi = false
    let lastMove = 0
    listen(canvas, 'pointerdown', (e) => {
      stopTour()
      if (e.button !== 0) return
      notice.value = ''
      if (mode.value === 'guided') setMode('explore')
      active.add(e.pointerId)
      if (active.size > 1) {
        multi = true
        editor.cancel()
      }
      gesture.down(e.pointerId, e.clientX, e.clientY)
      if (active.size === 1) {
        const hit = hitTest(e)
        if (!coarse || touchInteraction.value) editor.down(hit.point, hit.hits, mode.value)
      }
      if (!coarse || touchInteraction.value) canvas.setPointerCapture(e.pointerId)
    })
    listen(canvas, 'pointermove', (e) => {
      gesture.move(e.pointerId, e.clientX, e.clientY)
      if (multi || e.timeStamp - lastMove < 16) return
      lastMove = e.timeStamp
      const hit = hitTest(e)
      if (!coarse || touchInteraction.value) editor.move(hit.point, mode.value)
      canvas.style.cursor = hit.city ? 'pointer' : mode.value === 'terrain' ? 'crosshair' : ''
    })
    listen(canvas, 'pointerup', (e) => {
      const hit = hitTest(e),
        click = gesture.up(e.pointerId, e.clientX, e.clientY, hit.city, e.timeStamp)
      active.delete(e.pointerId)
      if (!multi) {
        if (!coarse || touchInteraction.value) editor.up(hit.point, mode.value, !!click)
        if (click && (mode.value === 'explore' || mode.value === 'guided')) {
          if (hit.city) {
            selectCity(hit.city)
            if (click === 'double' && !coarse) callbacks.onDoublePickCity?.(hit.city)
          } else {
            selectedCity.value = null
            callbacks.onClearCity?.()
          }
        }
      }
      if (!active.size) multi = false
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId)
    })
    listen(canvas, 'pointercancel', () => {
      active.clear()
      multi = false
      gesture.cancel()
      editor.cancel()
    })
    listen(controls, 'start', () => {
      stopTour()
      if (mode.value === 'guided') setMode('explore')
    })
  }
  function projectLabels() {
    if (!camera || !canvas3d.value) return
    const w = canvas3d.value.clientWidth,
      h = canvas3d.value.clientHeight
    const labels = world.pins.map((pin) => {
      const p = pin.position
        .clone()
        .add(new THREE.Vector3(0, 0.1, 0))
        .project(camera)
      return {
        name: pin.name,
        x: (p.x * 0.5 + 0.5) * w,
        y: (-0.5 * p.y + 0.5) * h,
        visible: p.z >= -1 && p.z <= 1 && Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1,
        colorHex: '#aa8746',
      }
    })
    cityLabels.value = layoutLabels(labels, tour.value.city || selectedCity.value, w, h)
  }
  function tick(now) {
    frame = 0
    if (!renderer || !visible || document.hidden || contextLost) return
    const dt = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 0
    previousTime = now
    if (actualMotion()) elapsed += dt
    const nextStop = tourController.step(dt)
    if (nextStop) {
      tour.value = nextStop
      if (nextStop.status === 'playing') visitTourStop()
    }
    const p = flight.step(dt),
      t = targetFlight.step(dt)
    if (p) camera.position.fromArray(p)
    if (t) controls.target.fromArray(t)
    const fogTarget = weather.value === 'clear' ? 0 : 1,
      rainTarget = weather.value === 'rain' ? 1 : 0,
      factor = actualMotion() ? 1 - Math.exp(-dt * 2) : 1
    weatherMix += (fogTarget - weatherMix) * factor
    rainMix += (rainTarget - rainMix) * factor
    scene.fog.density = 0.009 + weatherMix * 0.035
    scene.background.set('#15232b').lerp(new THREE.Color('#455358'), weatherMix)
    light.intensity = 3.0 - weatherMix * 1.3
    editor.tick(dt)
    world.animate(elapsed, dt, actualMotion(), tour.value.city || selectedCity.value, rainMix, quality.value)
    controls.update()
    const old = controls.target.clone()
    controls.target.x = THREE.MathUtils.clamp(controls.target.x, -10, 14)
    controls.target.z = THREE.MathUtils.clamp(controls.target.z, -10, 10)
    controls.target.y = THREE.MathUtils.clamp(controls.target.y, -0.2, 3)
    camera.position.add(controls.target.clone().sub(old))
    if (now - lastLabelTime > 50) {
      projectLabels()
      lastLabelTime = now
    }
    renderer.info.reset()
    pipeline.render()
    frame = requestAnimationFrame(tick)
  }
  function resume() {
    previousTime = 0
    if (!frame && renderer && visible && !document.hidden && !contextLost) frame = requestAnimationFrame(tick)
  }
  function suspend() {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    previousTime = 0
    pauseTour()
  }
  function cleanup() {
    suspend()
    stopTour()
    listeners.forEach((remove) => remove())
    listeners = []
    observers.forEach((o) => o.disconnect())
    observers = []
    controls?.dispose()
    pipeline?.dispose()
    pipeline = null
    if (scene) releaseTree(scene)
    light?.shadow?.map?.dispose()
    renderer?.renderLists.dispose()
    renderer?.dispose()
    scene = camera = renderer = controls = world = editor = light = null
    gesture.cancel()
    cityLabels.value = []
  }
  async function init(opts = {}) {
    const run = ++generation
    abort?.abort()
    cleanup()
    abort = new AbortController()
    callbacks = opts
    ready.value = false
    loading.value = true
    status.value = 'loading'
    errorMsg.value = null
    try {
      if (!canvas3d.value) throw new Error('沙盘画布尚未挂载')
      const response = await fetch('/shandong.json', { signal: abort.signal })
      if (!response.ok) throw new Error('地图资料加载失败')
      const geojson = await response.json()
      if (run !== generation) return false
      if (!Array.isArray(geojson.features) || !geojson.features.length) throw new Error('地图资料格式无效')
      scene = new THREE.Scene()
      scene.background = new THREE.Color('#15232b')
      scene.fog = new THREE.FogExp2('#263740', 0.008)
      camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100)
      camera.position.set(5, 14, 17)
      renderer = new THREE.WebGLRenderer({ canvas: canvas3d.value, antialias: true, alpha: false })
      renderer.info.autoReset = false
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.shadowMap.autoUpdate = false
      renderer.shadowMap.needsUpdate = true
      scene.add(new THREE.HemisphereLight('#d5e6f1', '#57452f', 1.5))
      light = new THREE.DirectionalLight('#ffddb1', 2.4)
      light.position.set(-6, 16, 8)
      light.castShadow = true
      Object.assign(light.shadow.camera, { left: -18, right: 18, top: 16, bottom: -16, near: 0.1, far: 50 })
      light.shadow.bias = -0.0004
      light.shadow.normalBias = 0.035
      scene.add(light)
      controls = new OrbitControls(camera, renderer.domElement)
      controls.target.set(5, 0.4, 0)
      controls.enableDamping = true
      controls.zoomToCursor = true
      controls.dampingFactor = 0.07
      controls.minDistance = 3
      controls.maxDistance = 38
      controls.maxPolarAngle = Math.PI / 2.15
      controls.update()
      world = buildWorld(scene, geojson, terrain)
      editor = createEditor({
        scene,
        terrain,
        world,
        history,
        selectedObject,
        brush,
        objectAsset,
        commit,
        invalidate: () => {
          renderer.shadowMap.needsUpdate = true
        },
        notify: (message) => {
          notice.value = message
        },
      })
      pipeline = createRenderPipeline(renderer, scene, camera)
      setQuality(quality.value)
      setTouchInteraction(touchInteraction.value)
      setMode(mode.value)
      resize()
      bindPointers()
      listen(document, 'visibilitychange', () => (document.hidden ? suspend() : resume()))
      listen(renderer.domElement, 'webglcontextlost', (e) => {
        e.preventDefault()
        contextLost = true
        ready.value = false
        status.value = 'context-lost'
        errorMsg.value = '图形上下文已中断，正在等待恢复'
        suspend()
      })
      listen(renderer.domElement, 'webglcontextrestored', () => {
        contextLost = false
        void init(callbacks)
      })
      if (reducedQuery)
        listen(reducedQuery, 'change', () => {
          reducedMotion.value = reducedQuery.matches
          if (reducedQuery.matches) {
            pauseTour()
            elapsed = 0
          }
        })
      const ro = new ResizeObserver(resize)
      ro.observe(canvas3d.value.parentElement)
      observers.push(ro)
      if (typeof IntersectionObserver !== 'undefined') {
        const io = new IntersectionObserver((entries) => {
          visible = entries[0].isIntersecting
          visible ? resume() : suspend()
        })
        io.observe(canvas3d.value)
        observers.push(io)
      }
      visible = true
      contextLost = false
      ready.value = true
      loading.value = false
      status.value = 'ready'
      projectLabels()
      resume()
      return true
    } catch (error) {
      if (run !== generation) return false
      cleanup()
      loading.value = false
      status.value = 'error'
      errorMsg.value = error.name === 'AbortError' ? '加载已取消' : error.message
      return false
    }
  }
  function dispose() {
    generation++
    abort?.abort()
    cleanup()
    ready.value = false
    loading.value = false
    status.value = 'disposed'
  }
  function setBrush(value) {
    const next = { ...brush.value, ...value }
    if (
      !['raise', 'lower', 'smooth', 'flatten'].includes(next.type) ||
      !Number.isFinite(next.radius) ||
      !Number.isFinite(next.strength)
    )
      return
    brush.value = {
      type: next.type,
      radius: THREE.MathUtils.clamp(next.radius, 0.4, 3),
      strength: THREE.MathUtils.clamp(next.strength, 0.02, 0.5),
    }
  }
  function importDraft(value) {
    if (typeof value === 'string' && value.length > 2000000) throw new Error('草稿文件超过 2 MB')
    const next = validateDraft(value)
    if (world && next.objects.some((o) => !world.contains(o.x, o.z) || riverDistance(o.x, o.z) <= 0.55))
      throw new Error('草稿物件位于地图外或河道内')
    const previousHeights = terrain.edits
    terrain.restore(next.heights)
    terrain.restore(previousHeights)
    commit(next)
    syncDraft()
  }
  return {
    canvas3d,
    tour,
    tourCanPlay,
    toggleTour,
    pauseTour,
    stopTour,
    moveTour,
    selectedCity,
    cityLabels,
    errorMsg,
    notice,
    ready,
    loading,
    status,
    mode,
    weather,
    quality,
    motion,
    touchInteraction,
    selectedObject,
    canUndo,
    canRedo,
    objectAsset,
    brush,
    init,
    dispose,
    flyToCity,
    selectCity,
    setMode,
    setWeather,
    setQuality,
    setMotion,
    setTouchInteraction,
    setView,
    zoom,
    setGuidedProgress,
    setBrush,
    setTheme: (value) => (value ? init(callbacks) : dispose()),
    getCamera: () => camera,
    getControls: () => controls,
    getRenderStats: () =>
      renderer ? { ...renderer.info.render, ...renderer.info.memory, dpr: renderer.getPixelRatio() } : null,
    getScene: () => scene,
    setObjectAsset: (value) => {
      if (['pavilion', 'tree', 'rock'].includes(value)) {
        objectAsset.value = value
        selectedObject.value = null
      }
    },
    updateSelected: (patch) => editor?.update(patch),
    deleteSelected: () => editor?.remove(),
    undo: () => {
      if (history.undo()) syncDraft()
    },
    redo: () => {
      if (history.redo()) syncDraft()
    },
    resetDraft: () => {
      commit(emptyDraft())
      selectedObject.value = null
      syncDraft()
    },
    saveDraft: () => draftStorage('put', validateDraft(history.value)),
    loadDraft: async () => {
      const value = await draftStorage('get')
      if (!value) throw new Error('本机尚无沙盘草稿')
      importDraft(value)
    },
    exportDraft: () => JSON.stringify(history.value, null, 2),
    importDraft,
  }
}
