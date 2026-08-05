import { ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// ==========================================
// Three.js 3D WebGL 沙盘引擎（从 MapView 抽出，P1-5）
// 引擎与编排通过 4 个 ref（canvas3d/selectedCity/cityLabels/errorMsg）
// + 2 个回调（onPickCity/onDoublePickCity）+ 4 个方法（init/dispose/flyToCity/setTheme）通信。
// ==========================================

// 3D coordinates for Shandong cities relative to [0, 0] plane
// Correct aspect ratio: longitude scale = latitude scale * cos(mean_latitude)
// For Shandong (mean latitude ~36.4° N), cos(36.4°) ≈ 0.805
// If latitude scale is 3.8, longitude scale should be 3.8 * 0.805 ≈ 3.06.
const projectGeo = (lon, lat) => {
  const x = (lon - 117.0) * 3.06
  const z = -(lat - 36.4) * 3.8
  return { x, z }
}

const createCityShape = (coordinates) => {
  const shape = new THREE.Shape()
  coordinates.forEach((coord, index) => {
    const { x, z } = projectGeo(coord[0], coord[1])
    if (index === 0) {
      shape.moveTo(x, -z)
    } else {
      shape.lineTo(x, -z)
    }
  })
  return shape
}

// Geographical coordinates (Lon, Lat) of core cities (accurate administrative centers)
const cityGeoCoords = [
  { name: '菏泽', lon: 115.48, lat: 35.23, color: 0xc23a2b, river: true },
  { name: '济宁', lon: 116.59, lat: 35.38, color: 0xe69138 },
  { name: '泰安', lon: 117.08, lat: 36.20, color: 0xd4af37 },
  { name: '聊城', lon: 115.97, lat: 36.45, color: 0x8e352e, river: true },
  { name: '济南', lon: 117.00, lat: 36.67, color: 0x3d85c6, river: true },
  { name: '德州', lon: 116.29, lat: 37.43, color: 0x674ea7, river: true },
  { name: '淄博', lon: 118.00, lat: 36.81, color: 0x6aa84f, river: true },
  { name: '滨州', lon: 118.02, lat: 37.37, color: 0x5b8c85, river: true },
  { name: '东营', lon: 118.49, lat: 37.46, color: 0x008080, river: true }
]

const city3dCoords = cityGeoCoords.map(city => {
  const { x, z } = projectGeo(city.lon, city.lat)
  return {
    name: city.name,
    x,
    z,
    color: city.color,
    river: !!city.river
  }
})

// Yellow River geographical coordinate points
const riverGeoPoints = [
  { lon: 114.80, lat: 35.00 },
  { lon: 115.43, lat: 35.24 }, // 菏泽
  { lon: 115.97, lat: 36.45 }, // 聊城
  { lon: 116.50, lat: 36.55 }, // 德州/Jinan border
  { lon: 116.99, lat: 36.67 }, // 济南
  { lon: 118.05, lat: 36.78 }, // 淄博
  { lon: 118.02, lat: 37.37 }, // 滨州
  { lon: 118.67, lat: 37.43 }, // 东营
  { lon: 119.20, lat: 37.80 }  // 渤海口
]

const river2dPoints = riverGeoPoints.map(p => {
  const { x, z } = projectGeo(p.lon, p.lat)
  return { x, z }
})

// Curve guide points for carving the terrain valley (preventing circular dependencies)
const guidePoints = new THREE.CatmullRomCurve3(
  river2dPoints.map(p => new THREE.Vector3(p.x, 0, p.z))
).getPoints(100)

// Geographically accurate mountain centers
const centerTai = projectGeo(117.09, 36.26)      // Mount Tai
const centerYimeng = projectGeo(117.88, 35.53)   // Yimeng Range
const centerJiaodong = projectGeo(121.39, 37.18) // Jiaodong Hills

// Terrain height calculator based on geographic features of Shandong
const getTerrainHeight = (x, z) => {
  const vx = x
  const vy = -z

  // Bohai Bay & Yellow Sea bounds calculated based on coordinates
  let isSea = false
  if (vx > 4.5 && vy > 2.0) {
    isSea = true // Bohai Bay
  } else if (vx > 7.0 && vy < -1.5) {
    isSea = true // Yellow Sea
  }

  if (isSea) return 0.05

  let height = 0

  // 1. Natural terrain undulating waves (fBm noise simulation)
  let noise = Math.sin(vx * 0.25) * Math.cos(vy * 0.25) * 0.3
  noise += Math.sin(vx * 0.6 + 1.2) * Math.cos(vy * 0.7 - 0.5) * 0.1
  noise += Math.sin(vx * 1.5) * Math.cos(vy * 1.3) * 0.03
  height += noise

  // 2. Mountains (Mount Tai, Yimeng Range, Jiaodong Hills using projected centers)
  const dxTai = vx - centerTai.x
  const dyTai = vy - (-centerTai.z)
  const distToTai = Math.sqrt(dxTai * dxTai + dyTai * dyTai)
  if (distToTai < 3.5) {
    height += 1.8 * Math.pow(1.0 - distToTai / 3.5, 2)
  }

  const dxYimeng = vx - centerYimeng.x
  const dyYimeng = vy - (-centerYimeng.z)
  const distToYimeng = Math.sqrt(dxYimeng * dxYimeng + dyYimeng * dyYimeng)
  if (distToYimeng < 4.0) {
    height += 1.3 * Math.pow(1.0 - distToYimeng / 4.0, 2)
  }

  const dxJiaodong = vx - centerJiaodong.x
  const dyJiaodong = vy - (-centerJiaodong.z)
  const distToJiaodong = Math.sqrt(dxJiaodong * dxJiaodong + dyJiaodong * dyJiaodong)
  if (distToJiaodong < 3.0) {
    height += 0.6 * Math.pow(1.0 - distToJiaodong / 3.0, 2)
  }

  // 3. Plain flattening (Heze, Liaocheng, Dezhou)
  if (vx < -2.5) {
    const plainFade = Math.max(0, (vx + 6.8) / 4.3)
    height *= plainFade
  }

  // 4. Yellow River Valley Carving
  let minDist = 999
  guidePoints.forEach(pt => {
    const dx = vx - pt.x
    const dy = vy + pt.z
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < minDist) {
      minDist = dist
    }
  })

  if (minDist < 0.8) {
    const valleyDepth = 0.38 * (1.0 - minDist / 0.8)
    height -= valleyDepth
  }

  return height
}

// Hypsometric tinting color mapper based on realistic terrain features
const getGeographyColor = (h) => {
  const color = new THREE.Color()
  if (h < -0.1) {
    color.setHSL(0.24, 0.22, 0.45 + (h + 0.3) * 0.2)
  } else if (h < 0.3) {
    const t = (h - (-0.1)) / 0.4
    color.lerpColors(new THREE.Color('#94af76'), new THREE.Color('#b5c48f'), t)
  } else if (h < 0.8) {
    const t = (h - 0.3) / 0.5
    color.lerpColors(new THREE.Color('#b5c48f'), new THREE.Color('#caba7d'), t)
  } else {
    const t = Math.min(1.0, (h - 0.8) / 1.0)
    color.lerpColors(new THREE.Color('#9e7a59'), new THREE.Color('#e0dcd3'), t)
  }
  return color
}

// Complete Yellow River 3D path line (sitting inside the carved valley)
const riverPoints = river2dPoints.map(p => new THREE.Vector3(p.x, getTerrainHeight(p.x, p.z) + 0.04, p.z))

export function useThreeSandbox() {
  // ===== 暴露的响应式状态（template 绑定 / 编排读写） =====
  const canvas3d = ref(null)
  const selectedCity = ref(null)
  const cityLabels = ref([])
  const errorMsg = ref(null)

  // ===== 引擎内部状态（不暴露） =====
  let scene, camera, renderer, controls, animationFrameId
  const cityObjects = []
  let pointerDownRef = null
  let pointerMoveRef = null
  let canvasResizeObserver = null
  let cachedGeojson = null
  let geojsonLoading = null
  let callbacks = {}
  let initTimerId = null

  // Clean up existing Three.js scene, renderer, and animation loop to prevent leaks
  const cleanupThree = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    if (renderer) {
      if (renderer.domElement && pointerDownRef) {
        renderer.domElement.removeEventListener('pointerdown', pointerDownRef)
        pointerDownRef = null
      }
      if (renderer.domElement && pointerMoveRef) {
        renderer.domElement.removeEventListener('pointermove', pointerMoveRef)
        pointerMoveRef = null
      }
      renderer.dispose()
      renderer = null
    }

    if (scene) {
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose()
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })
      scene = null
    }

    if (controls) {
      controls.dispose()
      controls = null
    }

    cityObjects.length = 0
  }

  // 相机飞往指定城市（clickLabel 标签点击 + onPointerDown 单击共用，消除重复）
  const flyToCity = (cityName) => {
    const targetPin = cityObjects.find(c => c.name === cityName)
    if (!targetPin || !camera || !controls) return
    const startPos = camera.position.clone()
    const endPos = new THREE.Vector3(targetPin.position.x, targetPin.position.y + 3.5, targetPin.position.z + 5.0)
    const startTarget = controls.target.clone()
    const endTarget = targetPin.position.clone()
    let t = 0
    const animateCamera = () => {
      // dispose 后 camera/controls 置 null，停止动画避免操作已释放资源
      if (!camera || !controls) return
      t += 0.05
      if (t <= 1.0) {
        camera.position.lerpVectors(startPos, endPos, t)
        controls.target.lerpVectors(startTarget, endTarget, t)
        controls.update()
        requestAnimationFrame(animateCamera)
      } else {
        camera.position.copy(endPos)
        controls.target.copy(endTarget)
        controls.update()
      }
    }
    animateCamera()
  }

  const initThree = (geojson) => {
    if (!canvas3d.value) return

    cleanupThree()

    const width = canvas3d.value.parentElement.clientWidth
    const height = canvas3d.value.parentElement.clientHeight

    // 1. Create Scene & Camera
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xfbf8f3) // Parchment paper color for real mode

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 15, 15) // Top down orthographic-style angle

    // 2. Renderer with soft shadow optimization
    renderer = new THREE.WebGLRenderer({ canvas: canvas3d.value, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // 3. Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2.2 // Do not look underneath
    controls.minDistance = 5
    controls.maxDistance = 35

    // 4. Lights & Geographically calibrated shadows
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xfffdf6, 1.2)
    dirLight.position.set(5, 18, 5)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 2048
    dirLight.shadow.mapSize.height = 2048
    dirLight.shadow.camera.near = 0.5
    dirLight.shadow.camera.far = 40
    const d = 15
    dirLight.shadow.camera.left = -d
    dirLight.shadow.camera.right = d
    dirLight.shadow.camera.top = d
    dirLight.shadow.camera.bottom = -d
    dirLight.shadow.bias = -0.0005
    scene.add(dirLight)

    const pointLight = new THREE.PointLight(0xb8860b, 1.0, 20)
    pointLight.position.set(0, 5, 0)
    scene.add(pointLight)

    if (geojson) {
      // 5. Build Extruded Shandong Administrative Map shapes
      const extrudeSettings = {
        depth: 0.35,
        bevelEnabled: false
      }

      geojson.features.forEach(feature => {
        const cityName = feature.properties.name.replace('市', '')

        const getCityColorVal = (name) => {
          const mineralColors = [
            '#dfd7c2', '#cfcbbd', '#c8c3b0', '#c2bba8', '#d0c9a7', '#bca88b', '#b1bfa1'
          ]
          let sum = 0
          for (let i = 0; i < name.length; i++) {
            sum += name.charCodeAt(i)
          }
          return new THREE.Color(mineralColors[sum % mineralColors.length])
        }

        const cityColor = getCityColorVal(cityName)

        const shapes = []
        if (feature.geometry.type === 'Polygon') {
          const coords = feature.geometry.coordinates[0]
          if (coords.length >= 45) {
            shapes.push(createCityShape(coords))
          }
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach(poly => {
            const coords = poly[0]
            if (coords.length >= 45) {
              shapes.push(createCityShape(coords))
            }
          })
        }

        if (shapes.length > 0) {
          const cityGeometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings)

          const pos = cityGeometry.attributes.position
          const colors = new Float32Array(pos.count * 3)
          for (let i = 0; i < pos.count; i++) {
            const lx = pos.getX(i)
            const ly = pos.getY(i)
            const lz = pos.getZ(i)

            const wx = lx
            const wz = -ly

            const terrainH = getTerrainHeight(wx, wz)

            let vertexColor
            if (lz > 0.15) {
              pos.setZ(i, terrainH)
              vertexColor = getGeographyColor(terrainH)
            } else {
              pos.setZ(i, -0.6)
              vertexColor = new THREE.Color('#4a3e3d')
            }

            colors[i * 3] = vertexColor.r
            colors[i * 3 + 1] = vertexColor.g
            colors[i * 3 + 2] = vertexColor.b
          }
          cityGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
          cityGeometry.computeVertexNormals()

          const cityMaterial = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.8,
            metalness: 0.05,
            flatShading: true
          })
          const cityMesh = new THREE.Mesh(cityGeometry, cityMaterial)
          cityMesh.rotation.x = -Math.PI / 2
          cityMesh.receiveShadow = true
          cityMesh.castShadow = true
          scene.add(cityMesh)

          const drawRing = (coords) => {
            const points = []
            coords.forEach(c => {
              const { x, z } = projectGeo(c[0], c[1])
              const y = getTerrainHeight(x, z) + 0.012
              points.push(new THREE.Vector3(x, y, z))
            })
            const borderGeom = new THREE.BufferGeometry().setFromPoints(points)
            const borderMat = new THREE.LineBasicMaterial({
              color: 0x4a3f35,
              linewidth: 1.5,
              transparent: true,
              opacity: 0.55
            })
            const borderLine = new THREE.Line(borderGeom, borderMat)
            scene.add(borderLine)
          }

          if (feature.geometry.type === 'Polygon') {
            const coords = feature.geometry.coordinates[0]
            if (coords.length >= 45) {
              drawRing(coords)
            }
          } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach(poly => {
              const coords = poly[0]
              if (coords.length >= 45) {
                drawRing(coords)
              }
            })
          }
        }
      })

      const seaGeometry = new THREE.PlaneGeometry(42, 30)
      const seaMaterial = new THREE.MeshStandardMaterial({
        color: 0xabbca7,
        roughness: 0.35,
        metalness: 0.15,
        flatShading: true
      })
      const seaMesh = new THREE.Mesh(seaGeometry, seaMaterial)
      seaMesh.rotation.x = -Math.PI / 2
      seaMesh.position.y = -0.4
      seaMesh.receiveShadow = true
      scene.add(seaMesh)

    } else {
      // Fallback: Rectangular terrain plane if GeoJSON is not loaded
      const mapGeometry = new THREE.PlaneGeometry(22, 14, 40, 40)
      const posAttribute = mapGeometry.attributes.position
      const colors = new Float32Array(posAttribute.count * 3)
      for (let i = 0; i < posAttribute.count; i++) {
        const vx = posAttribute.getX(i)
        const vy = posAttribute.getY(i)
        let z = Math.sin(vx * 0.2) * Math.cos(vy * 0.2) * 0.8
        const distToTai = Math.sqrt(Math.pow(vx - 0, 2) + Math.pow(vy - (-1), 2))
        if (distToTai < 3) {
          z += (3 - distToTai) * 0.6
        }
        posAttribute.setZ(i, z)

        const vertexColor = getGeographyColor(z)
        colors[i * 3] = vertexColor.r
        colors[i * 3 + 1] = vertexColor.g
        colors[i * 3 + 2] = vertexColor.b
      }
      mapGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      mapGeometry.computeVertexNormals()

      const mapMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.8,
        metalness: 0.1,
        flatShading: true,
        wireframe: false
      })

      const terrainMesh = new THREE.Mesh(mapGeometry, mapMaterial)
      terrainMesh.rotation.x = -Math.PI / 2
      terrainMesh.receiveShadow = true
      scene.add(terrainMesh)
    }

    // 6. Glowing Yellow River path representation
    const riverCurve = new THREE.CatmullRomCurve3(riverPoints)
    const riverGeom = new THREE.TubeGeometry(riverCurve, 64, 0.15, 8, false)
    const lowPerfRiver = (navigator.hardwareConcurrency ?? 4) <= 4 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let riverMat
    if (lowPerfRiver) {
      riverMat = new THREE.MeshBasicMaterial({ color: 0xc27b38, transparent: true, opacity: 0.85 })
    } else {
      riverMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(0xc27b38) },
          uHighlight: { value: new THREE.Color(0xffe896) },
          uFlowSpeed: { value: 0.6 }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          varying vec2 vUv;
          uniform float uTime;
          uniform vec3 uColor;
          uniform vec3 uHighlight;
          uniform float uFlowSpeed;
          void main() {
            float b = 0.6 + 0.4 * sin(vUv.x * 18.0 - uTime * uFlowSpeed * 6.0);
            b += smoothstep(0.7, 1.0, vUv.x) * 0.25;
            vec3 col = mix(uColor, uHighlight, clamp(b, 0.0, 1.0));
            float alpha = 0.7 + 0.25 * b;
            gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
          }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    }
    const riverMesh = new THREE.Mesh(riverGeom, riverMat)
    riverMesh.name = 'yellow-river'
    scene.add(riverMesh)

    // Flowing river dots (Particle pipeline along the river)
    const dotCount = 80
    const dotGeometry = new THREE.BufferGeometry()
    const dotPositions = new Float32Array(dotCount * 3)
    const dotOffsets = []

    for (let i = 0; i < dotCount; i++) {
      dotOffsets.push(Math.random())
      const pt = riverCurve.getPointAt(dotOffsets[i])
      dotPositions[i * 3] = pt.x
      dotPositions[i * 3 + 1] = pt.y + 0.05
      dotPositions[i * 3 + 2] = pt.z
    }

    dotGeometry.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3))
    const dotMaterial = new THREE.PointsMaterial({
      color: 0xffe896,
      size: 0.16,
      transparent: true,
      opacity: 0.95
    })
    const riverPointsObj = new THREE.Points(dotGeometry, dotMaterial)
    scene.add(riverPointsObj)

    // 7. Render City Nodes (holographic glowing markers)
    city3dCoords.forEach(city => {
      const pinGroup = new THREE.Group()
      const terrainHeight = getTerrainHeight(city.x, city.z)
      pinGroup.position.set(city.x, terrainHeight, city.z)
      pinGroup.name = city.name

      const beamGeom = new THREE.CylinderGeometry(0.04, 0.06, 1.2, 12, 1, true)
      const beamMat = new THREE.MeshBasicMaterial({
        color: city.color,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
      const beamMesh = new THREE.Mesh(beamGeom, beamMat)
      beamMesh.position.y = 0.6
      pinGroup.add(beamMesh)

      const octaGeom = new THREE.OctahedronGeometry(0.18, 0)
      const octaMat = new THREE.MeshStandardMaterial({
        color: city.color,
        emissive: city.color,
        emissiveIntensity: 0.7,
        roughness: 0.15,
        metalness: 0.9,
        flatShading: true
      })
      const octaMesh = new THREE.Mesh(octaGeom, octaMat)
      octaMesh.position.y = 1.3
      octaMesh.castShadow = true
      pinGroup.add(octaMesh)

      const ringGeom = new THREE.RingGeometry(0.2, 0.26, 32)
      const ringMat = new THREE.MeshBasicMaterial({
        color: city.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      })
      const ringMesh = new THREE.Mesh(ringGeom, ringMat)
      ringMesh.rotation.x = -Math.PI / 2
      ringMesh.position.y = 0.01
      pinGroup.add(ringMesh)

      if (city.river) {
        const riverRingGeom = new THREE.RingGeometry(0.30, 0.33, 48)
        const riverRingMat = new THREE.MeshBasicMaterial({
          color: 0xffe896,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.55,
          blending: THREE.AdditiveBlending
        })
        const riverRingMesh = new THREE.Mesh(riverRingGeom, riverRingMat)
        riverRingMesh.rotation.x = -Math.PI / 2
        riverRingMesh.position.y = 0.02
        pinGroup.add(riverRingMesh)
      }

      const innerRingGeom = new THREE.RingGeometry(0.08, 0.13, 4, 1)
      const innerRingMat = new THREE.MeshBasicMaterial({
        color: city.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      })
      const innerRingMesh = new THREE.Mesh(innerRingGeom, innerRingMat)
      innerRingMesh.rotation.x = -Math.PI / 2
      innerRingMesh.position.y = 0.015
      pinGroup.add(innerRingMesh)

      const rippleGeom = new THREE.RingGeometry(0.1, 0.5, 32)
      const rippleMat = new THREE.MeshBasicMaterial({
        color: city.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      })
      const rippleMesh = new THREE.Mesh(rippleGeom, rippleMat)
      rippleMesh.rotation.x = -Math.PI / 2
      rippleMesh.position.y = 0.005
      pinGroup.add(rippleMesh)

      scene.add(pinGroup)
      cityObjects.push(pinGroup)
    })

    // 8. Raycasting for mouse interactions
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let clickTime = 0

    const onPointerDown = (event) => {
      const now = Date.now()
      const isDoubleClick = now - clickTime < 300
      clickTime = now

      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)

      const intersects = raycaster.intersectObjects(scene.children, true)

      let clickedCity = null
      for (let hit of intersects) {
        let p = hit.object
        while (p && p !== scene) {
          if (p.parent === scene && city3dCoords.some(c => c.name === p.name)) {
            clickedCity = p.name
            break
          }
          p = p.parent
        }
        if (clickedCity) break
      }

      // 未点中城市时, 检查是否点中黄河 -> 飞往距命中点最近的沿河城
      if (!clickedCity) {
        const riverHit = intersects.find(hit => {
          let p = hit.object
          while (p) {
            if (p.name === 'yellow-river') return true
            p = p.parent
          }
          return false
        })
        if (riverHit) {
          const hp = riverHit.point
          let nearest = null
          let minDist = Infinity
          city3dCoords.forEach(c => {
            if (!c.river) return
            const dx = c.x - hp.x
            const dz = c.z - hp.z
            const d = Math.sqrt(dx * dx + dz * dz)
            if (d < minDist) { minDist = d; nearest = c }
          })
          if (nearest) clickedCity = nearest.name
        }
      }

      if (clickedCity) {
        // 编排负责 openCity（单/双击都触发）
        callbacks.onPickCity?.(clickedCity)

        if (isDoubleClick) {
          // 双击直接跳路由（编排负责）
          callbacks.onDoublePickCity?.(clickedCity)
        } else {
          // 单击：相机飞行（引擎内部）
          flyToCity(clickedCity)
        }
      }
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    pointerDownRef = onPointerDown

    // Hover cursor: pointer when over river or city pin
    const onPointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(scene.children, true)
      let hovering = false
      for (let hit of hits) {
        let p = hit.object
        while (p && p !== scene) {
          if ((p.parent === scene && city3dCoords.some(c => c.name === p.name)) || p.name === 'yellow-river') {
            hovering = true
            break
          }
          p = p.parent
        }
        if (hovering) break
      }
      renderer.domElement.style.cursor = hovering ? 'pointer' : ''
    }
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    pointerMoveRef = onPointerMove

    // 9. Animation Loop
    let clock = new THREE.Clock()

    const tick = () => {
      const elapsedTime = clock.getElapsedTime()

      if (riverMat.uniforms && riverMat.uniforms.uTime) {
        riverMat.uniforms.uTime.value = elapsedTime
      }

      const positions = riverPointsObj.geometry.attributes.position.array
      for (let i = 0; i < dotCount; i++) {
        dotOffsets[i] = (dotOffsets[i] + 0.001) % 1.0
        const pt = riverCurve.getPointAt(dotOffsets[i])
        positions[i * 3] = pt.x
        positions[i * 3 + 1] = pt.y + 0.05
        positions[i * 3 + 2] = pt.z
      }
      riverPointsObj.geometry.attributes.position.needsUpdate = true

      cityObjects.forEach((pin, index) => {
        const diamond = pin.children[1]
        const outerRing = pin.children[2]
        const innerRing = pin.children[3]
        const ripple = pin.children[4]

        if (diamond) {
          diamond.position.y = 1.25 + Math.sin(elapsedTime * 1.8 + index) * 0.08
          diamond.rotation.y = elapsedTime * 1.6 + index
          diamond.rotation.x = elapsedTime * 0.4
        }
        if (outerRing) {
          outerRing.rotation.z = elapsedTime * 0.6
        }
        if (innerRing) {
          innerRing.rotation.z = -elapsedTime * 1.1
        }
        if (ripple) {
          const scaleVal = 1.0 + (elapsedTime + index * 0.5) % 1.5
          ripple.scale.set(scaleVal, scaleVal, 1)
          ripple.material.opacity = 0.45 * (1.0 - (scaleVal - 1.0) / 1.5)
        }
      })

      // Update labels projection
      if (camera && canvas3d.value) {
        const width = canvas3d.value.clientWidth
        const height = canvas3d.value.clientHeight

        const newLabels = city3dCoords.map(city => {
          const targetPin = cityObjects.find(c => c.name === city.name)
          const terrainY = targetPin ? targetPin.position.y : 0
          const sphereLocalY = targetPin && targetPin.children[1] ? targetPin.children[1].position.y : 1.3

          const tempV = new THREE.Vector3(city.x, terrainY + sphereLocalY + 0.3, city.z)
          tempV.project(camera)

          const visible = tempV.z <= 1

          const x = (tempV.x * 0.5 + 0.5) * width
          const y = (tempV.y * -0.5 + 0.5) * height

          const colorHex = '#' + city.color.toString(16).padStart(6, '0')

          return {
            name: city.name,
            x,
            y,
            visible,
            colorHex
          }
        })
        cityLabels.value = newLabels
      }

      controls.update()
      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(tick)
    }

    tick()
  }

  // Window resizing（renderer/camera 存在即 real 模式，替代原 isReal.value 检查）
  const handleResize = () => {
    if (renderer && camera && canvas3d.value) {
      const width = canvas3d.value.parentElement.clientWidth
      const height = canvas3d.value.parentElement.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
  }

  // 沙盘容器尺寸跟随（grid 列宽过渡/侧栏展开时，canvas 平滑 resize 不拉伸）
  const observeCanvasResize = () => {
    if (canvasResizeObserver || !canvas3d.value?.parentElement) return
    canvasResizeObserver = new ResizeObserver(() => handleResize())
    canvasResizeObserver.observe(canvas3d.value.parentElement)
  }
  const disconnectCanvasResize = () => {
    if (canvasResizeObserver) {
      canvasResizeObserver.disconnect()
      canvasResizeObserver = null
    }
  }

  // Cache GeoJSON to avoid redundant fetch on theme switch
  const loadGeojson = async () => {
    if (cachedGeojson !== null) return cachedGeojson
    if (geojsonLoading) return geojsonLoading
    geojsonLoading = (async () => {
      try {
        const response = await fetch('/shandong.json')
        if (!response.ok) { cachedGeojson = null; return null }
        const parsed = await response.json()
        // 仅缓存合法 GeoJSON（含 features）；畸形响应置 null 触发回退/重试
        cachedGeojson = parsed && parsed.features ? parsed : null
        return cachedGeojson
      } catch (e) {
        console.error('Error loading shandong.json:', e)
        cachedGeojson = null
        return null
      } finally {
        geojsonLoading = null
      }
    })()
    return geojsonLoading
  }

  // Shared initialization - called by both init and theme-switch setTheme
  const startThree = async () => {
    const geojson = await loadGeojson()
    initThree(geojson)
    window.addEventListener('resize', handleResize)
    observeCanvasResize()
  }

  const startThreeSafe = async () => {
    try {
      await startThree()
    } catch (err) {
      console.error('加载三维地图失败:', err)
      errorMsg.value = '加载三维地图失败，请稍后重试'
    }
  }

  /**
   * 注入回调并（若 canvas 已挂载）启动引擎。
   * inkwash 时仅注入回调（canvas 未渲染），切 real 时 setTheme 复用，避免点击失效。
   * @param {Object} opts
   * @param {(cityName: string) => void} [opts.onPickCity]
   * @param {(cityName: string) => void} [opts.onDoublePickCity]
   */
  const init = (opts = {}) => {
    callbacks.onPickCity = opts.onPickCity
    callbacks.onDoublePickCity = opts.onDoublePickCity
    // 预热 GeoJSON 缓存：inkwash 首次加载时 canvas 未挂载不启动渲染，
    // 但提前 fetch+parse，避免首次切 real 时 fetch 阻塞转场遮罩导致露白。
    void loadGeojson()
    if (canvas3d.value) {
      if (initTimerId) clearTimeout(initTimerId)
      initTimerId = setTimeout(() => { startThreeSafe() }, 150)
    }
  }

  /** 销毁引擎（onBeforeUnmount / 切到 inkwash 时调用） */
  const dispose = () => {
    if (initTimerId) { clearTimeout(initTimerId); initTimerId = null }
    window.removeEventListener('resize', handleResize)
    disconnectCanvasResize()
    cleanupThree()
  }

  /**
   * 主题切换（封装原 watch(isReal) 逻辑）。
   * @param {boolean} isReal - 是否为 real 主题
   */
  const setTheme = (isReal) => {
    if (initTimerId) { clearTimeout(initTimerId); initTimerId = null }
    if (isReal) {
      errorMsg.value = null
      initTimerId = setTimeout(() => { startThreeSafe() }, 150)
    } else {
      dispose()
    }
  }

  return {
    canvas3d,
    selectedCity,
    cityLabels,
    errorMsg,
    init,
    dispose,
    flyToCity,
    setTheme,
  }
}
