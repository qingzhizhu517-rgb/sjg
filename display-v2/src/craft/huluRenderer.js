import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { createGourdGeometry, createGourdStemGeometry, createGourdInteriorGeometry } from './gourdGeometry.js'
import { createGourdTextures } from './gourdTextures.js'
import { createWorkshopState, getMotifPaths } from '../utils/huluWorkshop.js'

export function fitGourdCamera({ minY, maxY }) {
  return { targetY: (minY + maxY) / 2,
    radius: Math.max(6.35, (maxY - minY) / (2 * Math.tan(35 * Math.PI / 360) * .84) + .2),
    phi: Math.PI / 2 - .055 }
}

export function resolveHuluPresentation({ work, mode = 'observe', step = 0,
  beforeAfter = false, guideVisible } = {}) {
  const paths = getMotifPaths(work || createWorkshopState())
  const showGuide = guideVisible ?? (mode === 'observe' ? step === 2
    : mode === 'make' && (step === 1 || step === 2))
  let strokes = work?.strokes || []
  if (mode === 'observe') {
    strokes = step >= 3 ? paths.map((points) => ({ kind: 'carve', depth: 2, pigment: 'ink', points })) : []
    if (step >= 4) {
      strokes = [...strokes, ...paths.map((points) => ({ kind: 'coat', depth: 2, pigment: work?.pigment || 'ink', points })),
        ...paths.map((points) => ({ kind: 'wipe', depth: 2, pigment: work?.pigment || 'ink', points }))]
    }
  }
  return { green: mode === 'observe' && step === 0 && !beforeAfter,
    guideVisible: !beforeAfter && !!showGuide, guidePaths: paths, strokes: beforeAfter ? [] : strokes }
}

function disposeObject(object) {
  object.traverse((child) => {
    child.geometry?.dispose()
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    for (const material of materials) material?.dispose()
  })
}

function makeContactTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建接触阴影')
  const gradient = ctx.createRadialGradient(64, 64, 2, 64, 64, 63)
  gradient.addColorStop(0, 'rgba(49,34,20,0.36)')
  gradient.addColorStop(0.25, 'rgba(49,34,20,0.17)')
  gradient.addColorStop(0.75, 'rgba(49,34,20,0.035)')
  gradient.addColorStop(1, 'rgba(49,34,20,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export async function createHuluRenderer(canvas, { onStroke, onInspect, onError } = {}) {
  if (!canvas?.getContext) throw new Error('缺少葫芦舞台画布')
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  const quality = coarse || (canvas.getBoundingClientRect().width > 0 && canvas.getBoundingClientRect().width < 620)
    ? 'mobile' : 'desktop'
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality === 'desktop', alpha: false,
    powerPreference: 'high-performance', preserveDrawingBuffer: false })
  const initializationCleanup = []
  try {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'mobile' ? 1.5 : 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  const scene = new THREE.Scene()
  initializationCleanup.push(() => disposeObject(scene))
  scene.background = new THREE.Color('#eee8dc')
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40)
  const target = new THREE.Vector3(0, 0.1, 0)
  const orbit = new THREE.Spherical(6.35, Math.PI / 2 - 0.055, 0)
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  const model = new THREE.Group()
  // Lathe u=.5 faces -Z; rotate it so the default motif faces the +Z camera.
  model.rotation.y = Math.PI
  scene.add(model)
  let state = { work: createWorkshopState(), mode: 'observe', step: 0, tool: 'rotate',
    sideLight: false, beforeAfter: false, guideVisible: undefined }
  let appearance = resolveHuluPresentation(state)
  let textures
  let body
  let stem
  let interior
  let cord
  let currentShape
  let defaultView = { targetY: .1, radius: 6.35, phi: Math.PI / 2 - .055 }
  let disposed = false
  let manualPaused = false
  let inView = true
  let raf = 0
  let dirty = false
  let draft = null
  let blockedGesture = false
  let frameCount = 0
  let lastFrameMs = 0
  let maxFrameMs = 0
  let textureKey = ''
  initializationCleanup.push(() => {
    disposed = true
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  })
  const pointers = new Map()
  const listeners = []
  const originalTouchAction = canvas.style.touchAction
  canvas.style.touchAction = 'none'
  initializationCleanup.push(() => {
    for (const remove of listeners) remove()
    canvas.style.touchAction = originalTouchAction
    textures?.dispose()
  })

  // The PMREM is a soft studio reflection, with direct lights preserving body volume.
  const room = new RoomEnvironment()
  const pmrem = new THREE.PMREMGenerator(renderer)
  let environment
  try {
    environment = pmrem.fromScene(room, 0.04)
    initializationCleanup.push(() => environment.dispose())
    scene.environment = environment.texture
    scene.environmentIntensity = 0.42
  } finally {
    room.dispose()
    pmrem.dispose()
  }
  const ambient = new THREE.HemisphereLight('#ffefd6', '#857862', 0.62)
  scene.add(ambient)
  const key = new THREE.DirectionalLight('#fff1dc', 3.05)
  key.position.set(-3.5, 5.5, 4)
  key.castShadow = true
  key.shadow.mapSize.setScalar(quality === 'mobile' ? 1024 : 2048)
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3.5, bottom: -3.5, near: 0.5, far: 15 })
  key.shadow.normalBias = 0.035
  key.shadow.bias = -0.0002
  key.shadow.radius = 4
  initializationCleanup.push(() => key.shadow.map?.dispose())
  key.target.position.set(0, -0.1, 0)
  scene.add(key, key.target)
  const fill = new THREE.DirectionalLight('#d8e3e6', 0.65)
  fill.position.set(3, 1, 4)
  scene.add(fill)
  const rim = new THREE.DirectionalLight('#fff4df', 1.45)
  rim.position.set(2, 3, -3)
  scene.add(rim)
  const lateral = new THREE.DirectionalLight('#ffe8c8', 0)
  lateral.position.set(-4, 0.5, 0.7)
  scene.add(lateral)

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: '#e3dbca', roughness: 0.95, metalness: 0 }))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -1.447
  ground.receiveShadow = true
  scene.add(ground)
  const contactTexture = makeContactTexture()
  initializationCleanup.push(() => contactTexture.dispose())
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 2.7),
    new THREE.MeshBasicMaterial({ map: contactTexture, transparent: true, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -1 }))
  contact.rotation.x = -Math.PI / 2
  contact.position.y = -1.443
  scene.add(contact)
  const scar = new THREE.Mesh(new THREE.CircleGeometry(0.072, 32),
    new THREE.MeshStandardMaterial({ color: '#674b2d', roughness: 0.96, metalness: 0, side: THREE.DoubleSide }))
  scar.rotation.x = Math.PI / 2
  scar.position.y = -1.431
  scar.name = 'base'
  model.add(scar)

  const cursor = new THREE.Group()
  const blade = new THREE.Mesh(new THREE.ConeGeometry(0.013, 0.13, 5),
    new THREE.MeshStandardMaterial({ color: '#949a97', metalness: 0.82, roughness: 0.34 }))
  blade.rotation.z = Math.PI
  blade.position.y = 0.065
  cursor.add(blade)
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.18, 12),
    new THREE.MeshStandardMaterial({ color: '#64482f', roughness: 0.84, metalness: 0 }))
  handle.position.y = 0.22
  cursor.add(handle)
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(.024, .024, .027, 12),
    new THREE.MeshStandardMaterial({ color: '#9b927e', metalness: .7, roughness: .4 }))
  collar.position.y = .124
  cursor.add(collar)
  cursor.visible = false
  scene.add(cursor)

  // 低矮陶瓷碟与细绳只作工坊语境，器物轮廓保持为视觉主体。
  const dish = new THREE.Mesh(new THREE.LatheGeometry([
    new THREE.Vector2(0, 0), new THREE.Vector2(.23, 0), new THREE.Vector2(.29, .025),
    new THREE.Vector2(.3, .065), new THREE.Vector2(.28, .068), new THREE.Vector2(.24, .026), new THREE.Vector2(0, .025),
  ], 48), new THREE.MeshStandardMaterial({ color: '#d7cbb5', roughness: .36, metalness: 0 }))
  dish.position.set(1.1, -1.44, .12)
  dish.castShadow = dish.receiveShadow = true
  scene.add(dish)
  const pigment = new THREE.Mesh(new THREE.CircleGeometry(.21, 40),
    new THREE.MeshStandardMaterial({ color: '#30281e', roughness: .6, metalness: 0 }))
  pigment.rotation.x = -Math.PI / 2
  pigment.position.set(1.1, -1.411, .12)
  dish.visible = pigment.visible = false
  scene.add(pigment)

  function cameraFromOrbit() {
    camera.position.setFromSpherical(orbit).add(target)
    camera.lookAt(target)
    camera.updateMatrixWorld()
  }

  function rebuildShape(shape) {
    if (shape === currentShape) return
    for (const mesh of [body, stem, interior, cord]) {
      if (!mesh) continue
      model.remove(mesh)
      disposeObject(mesh)
    }
    textures?.dispose()
    const geometry = createGourdGeometry(shape, quality)
    textures = createGourdTextures(state.work, { quality, ...appearance,
      anisotropy: Math.min(4, renderer.capabilities.getMaxAnisotropy()) })
    body = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: textures.map,
      normalMap: textures.normalMap, normalScale: new THREE.Vector2(1, 1), roughnessMap: textures.roughnessMap,
      roughness: 1, metalness: 0, envMapIntensity: 0.65 }))
    body.name = 'shell'
    body.castShadow = body.receiveShadow = true
    stem = new THREE.Mesh(createGourdStemGeometry(geometry.userData.gourd.maxY, quality),
      new THREE.MeshStandardMaterial({ color: '#615238', roughness: 0.88, metalness: 0 }))
    stem.name = 'stem'
    stem.castShadow = true
    stem.geometry.computeBoundingBox()
    defaultView = fitGourdCamera({ minY: geometry.userData.gourd.minY, maxY: stem.geometry.boundingBox.max.y })
    target.y = defaultView.targetY
    orbit.set(defaultView.radius, defaultView.phi, 0)
    cameraFromOrbit()
    interior = new THREE.Mesh(createGourdInteriorGeometry(shape, quality),
      new THREE.MeshStandardMaterial({ color: '#a17b48', roughness: 1, metalness: 0, side: THREE.BackSide }))
    cord = new THREE.Group()
    const cordMaterial = new THREE.MeshStandardMaterial({ color: '#927148', roughness: .96, metalness: 0 })
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.043, .006, 6, 32), cordMaterial)
    ring.rotation.x = Math.PI / 2
    cord.add(ring)
    for (const sign of [-1, 1]) {
      const loop = new THREE.Mesh(new THREE.TorusGeometry(.017, .004, 6, 20), cordMaterial)
      loop.position.set(sign * .015, .012, -.045)
      loop.rotation.z = sign * .4
      cord.add(loop)
    }
    cord.position.set(.008, geometry.userData.gourd.maxY + .045, 0)
    model.add(body, stem, interior, cord)
    currentShape = shape
    textureKey = ''
    model.updateMatrixWorld(true)
  }

  function canRender() {
    return !disposed && !manualPaused && inView && !document.hidden
  }

  function requestFrame() {
    dirty = true
    if (raf || !canRender()) return
    raf = requestAnimationFrame(renderFrame)
  }

  function flushDraft() {
    if (!draft) return
    for (const segment of draft.segments) {
      if (segment.points.length <= segment.rendered) continue
      textures.preview({ kind: draft.kind, depth: draft.depth, pigment: draft.pigment, points: segment.points }, segment.rendered)
      segment.rendered = segment.points.length
    }
  }

  function renderFrame() {
    raf = 0
    if (!canRender() || !dirty) return
    dirty = false
    const started = performance.now()
    flushDraft()
    renderer.render(scene, camera)
    lastFrameMs = performance.now() - started
    maxFrameMs = Math.max(maxFrameMs, lastFrameMs)
    frameCount += 1
  }

  function syncTextures() {
    const nextKey = JSON.stringify([currentShape, appearance.green, appearance.guideVisible,
      appearance.guidePaths, appearance.strokes])
    if (nextKey === textureKey) return
    textures.update(state.work, appearance)
    textureKey = nextKey
  }

  function clearDraft() {
    if (!draft) return
    draft = null
    textures.update(state.work, appearance)
    cursor.visible = false
    requestFrame()
  }

  function paintingEnabled() {
    return state.mode === 'make' && !state.beforeAfter
      && ((state.step === 2 && state.tool === 'carve')
        || (state.step === 3 && ['coat', 'wipe'].includes(state.tool)))
  }

  function hitAt(event, shellOnly = true) {
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return null
    mouse.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
    raycaster.setFromCamera(mouse, camera)
    return raycaster.intersectObjects(shellOnly ? [body] : [body, stem, scar], false)[0] || null
  }

  function appendPoint(event) {
    if (!draft) return
    const hit = hitAt(event)
    if (!hit?.uv) {
      draft.gap = true
      cursor.visible = false
      return
    }
    const point = { u: hit.uv.x, v: hit.uv.y }
    const segment = draft.segments.at(-1)
    const previous = segment?.points.at(-1)
    if (previous && Math.hypot(point.u - previous.u, point.v - previous.v) < 0.0011 && !draft.gap) return
    const jump = previous && (Math.abs(point.u - previous.u) > 0.5
      || Math.hypot(point.u - previous.u, point.v - previous.v) > 0.12)
    const storedPoints = state.work.strokes.reduce((sum, s) => sum + s.points.length, 0)
    const draftPoints = draft.segments.reduce((sum, s) => sum + s.points.length, 0)
    if (storedPoints + draftPoints >= 8192) return
    if (!segment || draft.gap || jump || segment.points.length >= 256) {
      if (state.work.strokes.length + draft.segments.length >= 128) return
      const points = previous && !draft.gap && !jump ? [{ ...previous }, point] : [point]
      draft.segments.push({ points, rendered: 0 })
    } else segment.points.push(point)
    draft.gap = false
    const normal = hit.face.normal.clone().transformDirection(body.matrixWorld)
    cursor.position.copy(hit.point).addScaledVector(normal, 0.009)
    cursor.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
    cursor.visible = state.tool === 'carve'
    requestFrame()
  }

  function rotate(deltaX, deltaY) {
    if (disposed) return
    orbit.theta -= deltaX * 0.008
    orbit.phi = THREE.MathUtils.clamp(orbit.phi + deltaY * 0.006, Math.PI * 0.25, Math.PI * 0.72)
    cameraFromOrbit()
    requestFrame()
  }

  function zoom(factor) {
    if (disposed || !Number.isFinite(factor) || factor <= 0) return
    orbit.radius = THREE.MathUtils.clamp(orbit.radius / factor, 3.7, 8.6)
    cameraFromOrbit()
    requestFrame()
  }

  function onPointerDown(event) {
    if (disposed || event.button > 0 || !canRender()) return
    event.preventDefault()
    canvas.focus?.({ preventScroll: true })
    const entry = { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY }
    pointers.set(event.pointerId, entry)
    canvas.setPointerCapture?.(event.pointerId)
    if (pointers.size > 1) {
      blockedGesture = true
      clearDraft()
      return
    }
    blockedGesture = false
    if (paintingEnabled() && state.work.strokes.length < 128) {
      draft = { kind: state.tool, depth: state.work.depth, pigment: state.work.pigment, segments: [], gap: false }
      appendPoint(event)
    }
  }

  function onPointerMove(event) {
    const previous = pointers.get(event.pointerId)
    if (!previous) return
    if (pointers.size > 1) {
      const other = [...pointers.entries()].find(([id]) => id !== event.pointerId)?.[1]
      if (other) {
        const oldDistance = Math.hypot(previous.x - other.x, previous.y - other.y)
        const newDistance = Math.hypot(event.clientX - other.x, event.clientY - other.y)
        if (oldDistance > 0 && newDistance > 0) zoom(newDistance / oldDistance)
      }
    } else if (draft && !blockedGesture) {
      const events = event.getCoalescedEvents?.() || []
      for (const sample of events.length ? events : [event]) appendPoint(sample)
    } else rotate(event.clientX - previous.x, event.clientY - previous.y)
    previous.x = event.clientX
    previous.y = event.clientY
  }

  function onPointerUp(event) {
    const pointer = pointers.get(event.pointerId)
    if (!pointer) return
    if (draft && !blockedGesture && pointers.size === 1) {
      appendPoint(event)
      flushDraft()
      const completed = draft
      draft = null
      cursor.visible = false
      for (const segment of completed.segments) {
        if (segment.points.length < 2) continue
        onStroke?.({ kind: completed.kind, depth: completed.depth, pigment: completed.pigment,
          points: segment.points.map((point) => ({ ...point })) })
      }
      // The parent updates the saved work synchronously. Rebuild removes transient overlap.
      textureKey = ''
      syncTextures()
      requestFrame()
    } else if (!blockedGesture && Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY) < 5) {
      const hit = hitAt(event, false)
      if (hit) onInspect?.({ part: hit.object.name, uv: hit.uv ? { u: hit.uv.x, v: hit.uv.y } : null })
    }
    pointers.delete(event.pointerId)
    if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    if (!pointers.size) blockedGesture = false
  }

  function onPointerCancel(event) {
    pointers.delete(event.pointerId)
    clearDraft()
    blockedGesture = pointers.size > 0
    if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
  }

  function listen(targetObject, type, callback, options) {
    targetObject.addEventListener(type, callback, options)
    listeners.push(() => targetObject.removeEventListener(type, callback, options))
  }
  listen(canvas, 'pointerdown', onPointerDown)
  listen(canvas, 'pointermove', onPointerMove)
  listen(canvas, 'pointerup', onPointerUp)
  listen(canvas, 'pointercancel', onPointerCancel)
  listen(canvas, 'lostpointercapture', (event) => {
    if (pointers.has(event.pointerId)) onPointerCancel(event)
  })
  listen(canvas, 'wheel', (event) => { event.preventDefault(); zoom(Math.exp(-event.deltaY * 0.001)) }, { passive: false })
  listen(document, 'visibilitychange', () => {
    if (document.hidden) {
      clearDraft()
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    } else requestFrame()
  })
  listen(canvas, 'webglcontextlost', (event) => {
    event.preventDefault(); manualPaused = true; clearDraft()
    onError?.(new Error('三维绘图上下文已中断，已切换平面预览。'))
  })

  function resize() {
    if (disposed) return
    const rect = canvas.getBoundingClientRect()
    const width = Math.max(1, Math.round(rect.width || canvas.parentElement?.clientWidth || 600))
    const height = Math.max(1, Math.round(rect.height || canvas.parentElement?.clientHeight || 500))
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    requestFrame()
  }
  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null
  initializationCleanup.push(() => resizeObserver?.disconnect())
  resizeObserver?.observe(canvas.parentElement || canvas)
  if (!resizeObserver) listen(window, 'resize', resize)
  const intersectionObserver = typeof IntersectionObserver === 'function' ? new IntersectionObserver((entries) => {
    inView = entries[0]?.isIntersecting ?? true
    if (inView) requestFrame()
    else {
      clearDraft()
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }
  }, { threshold: 0.01 }) : null
  initializationCleanup.push(() => intersectionObserver?.disconnect())
  intersectionObserver?.observe(canvas)

  cameraFromOrbit()
  rebuildShape(state.work.shape)
  syncTextures()
  resize()
  renderer.render(scene, camera)
  frameCount += 1

  return {
    update(next = {}) {
      if (disposed) return
      clearDraft()
      state = { ...state, ...next, work: next.work || state.work }
      appearance = resolveHuluPresentation(state)
      rebuildShape(state.work.shape)
      syncTextures()
      lateral.intensity = state.sideLight ? 3.2 : 0
      dish.visible = pigment.visible = state.mode === 'make' && state.step === 3 || state.mode === 'observe' && state.step === 4
      pigment.material.color.set(state.work.pigment === 'ochre' ? '#70391d' : '#30281e')
      key.intensity = state.sideLight ? 1.3 : 3.05
      fill.intensity = state.sideLight ? 0.28 : 0.65
      canvas.style.cursor = paintingEnabled() ? 'crosshair' : 'grab'
      requestFrame()
    },
    resetView() {
      if (disposed) return
      target.y = defaultView.targetY
      orbit.set(defaultView.radius, defaultView.phi, 0)
      cameraFromOrbit()
      requestFrame()
    },
    rotate, zoom,
    async exportImage() {
      if (disposed) throw new Error('葫芦舞台已释放')
      flushDraft()
      const savedCursor = cursor.visible
      cursor.visible = false
      textures.update(state.work, resolveHuluPresentation({ ...state, mode: 'gallery', beforeAfter: false, guideVisible: false }))
      renderer.render(scene, camera)
      const image = document.createElement('canvas')
      image.width = canvas.width
      image.height = canvas.height
      try {
        const context = image.getContext('2d')
        if (!context) throw new Error('无法导出作品图片')
        // Copy immediately after render; the WebGL drawing buffer is not retained long term.
        context.drawImage(canvas, 0, 0)
      } finally {
        textures.update(state.work, appearance)
        cursor.visible = savedCursor
        requestFrame()
      }
      return new Promise((resolve, reject) => {
        image.toBlob((blob) => {
          image.width = image.height = 1
          if (blob) resolve(blob)
          else reject(new Error('作品图片导出失败'))
        }, 'image/png')
      })
    },
    pause() {
      manualPaused = true
      clearDraft()
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    },
    resume() { if (!disposed) { manualPaused = false; requestFrame() } },
    getStats() {
      return { quality, triangles: renderer.info.render.triangles, frames: frameCount,
        lastFrameMs, maxFrameMs, drawCalls: renderer.info.render.calls,
        geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures,
        pixelRatio: renderer.getPixelRatio(), paused: !canRender(), pendingFrame: !!raf,
        interaction: { tool: state.tool, step: state.step, painting: paintingEnabled(), pointers: pointers.size,
          draftPoints: draft?.segments.reduce((sum, segment) => sum + segment.points.length, 0) || 0 },
        camera: { radius: orbit.radius, theta: orbit.theta, phi: orbit.phi },
        ...textures.getStats() }
    },
    dispose() {
      if (disposed) return
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      draft = null
      for (const id of pointers.keys()) {
        if (canvas.hasPointerCapture?.(id)) canvas.releasePointerCapture(id)
      }
      pointers.clear()
      for (const remove of listeners) remove()
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      canvas.style.touchAction = originalTouchAction
      canvas.style.cursor = ''
      textures.dispose()
      contactTexture.dispose()
      environment.dispose()
      disposeObject(scene)
      scene.clear()
      scene.environment = null
      key.shadow.map?.dispose()
      renderer.renderLists.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
  } catch (error) {
    for (const cleanup of initializationCleanup.reverse()) {
      try { cleanup() } catch { /* Complete the remaining cleanup after a failed initialization. */ }
    }
    renderer.dispose()
    renderer.forceContextLoss()
    throw error
  }
}
