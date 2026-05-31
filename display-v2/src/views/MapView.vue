<template>
  <div class="map-view" :class="{ 'anime-layout': isAnime }" @mousemove="handleMouseMove" @mouseleave="resetParallax">
    <!-- 双主题布局容器 -->

    <!-- WRITE-UP 3D REAL THEME -->
    <div class="real-3d-container" v-if="isReal">
      <div class="hud-panel left-hud animate-slide-in">
        <div class="hud-header">
          <span class="hud-badge">DH SYSTEM</span>
          <h2 class="hud-title">三维地理文脉舱</h2>
        </div>
        <div class="hud-body">
          <p class="hud-desc">数字人文视域下黄河流域（山东段）文学景观时空交互。拖拽鼠标旋转视角，双击节点飞往对应城市。</p>
          <div class="hud-stats">
            <div class="stat-item">
              <span class="stat-num">10</span>
              <span class="stat-lbl">核心景点</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">6</span>
              <span class="stat-lbl">文人大家</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">8</span>
              <span class="stat-lbl">传世名篇</span>
            </div>
          </div>
          <div class="hud-tips">
            <span class="tip-txt">说明：单击发光节点可快速预览城市文学名胜，双击进入城市专栏。</span>
          </div>
        </div>
      </div>

      <!-- WebGL Three.js Canvas -->
      <div class="canvas-3d-wrap" style="position: relative;">
        <canvas ref="canvas3d" class="webgl-canvas"></canvas>
        
        <!-- Floating City Labels HTML Overlay -->
        <div class="labels-overlay-3d">
          <div
            v-for="label in cityLabels"
            :key="label.name"
            v-show="label.visible"
            class="city-3d-label"
            :style="{ left: `${label.x}px`, top: `${label.y}px` }"
            @click="clickLabel(label.name)"
          >
            <div class="label-dot" :style="{ backgroundColor: label.colorHex }"></div>
            <div class="label-line"></div>
            <div class="label-box">
              <span class="label-text">{{ label.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating HUD Details Card -->
      <transition name="fade">
        <div class="hud-detail-card card" v-if="selectedCity">
          <div class="detail-card-header">
            <h3 class="city-title-real">{{ selectedCity }}</h3>
            <button class="close-card-btn" @click="selectedCity = null">×</button>
          </div>
          <p class="city-desc-real">{{ getCityData(selectedCity).desc }}</p>
          <div class="card-footer-action">
            <button class="action-btn-primary" @click="$router.push(`/regions/${selectedCity}`)">
              探索该市文学景观 →
            </button>
          </div>
        </div>
      </transition>
    </div>

    <!-- ANIME WATER-INK THEME (鼠标视差画轴地图) -->
    <div class="anime-ink-container animate-fade-in" v-else>
      <div class="ink-layout-wrap">
        <!-- Left calligraphic panel -->
        <aside class="ink-left-panel">
          <div class="calligraphy-header">
            <div class="seal-red">天下大观</div>
            <h1 class="calligraphy-title">山东揽胜<br>黄河入海</h1>
          </div>
          <p class="ink-intro-para">
            黄河自菏泽入境，经梁山、东平，过济南，北折德州，蜿蜒东营归海。千百年来，诗圣杜甫、诗仙李白同游于此，易安居士、稼轩豪杰吟唱不断。
          </p>
          <div class="ink-categories">
            <div class="category-stamp">五岳独尊</div>
            <div class="category-stamp">泉城名胜</div>
            <div class="category-stamp">运河古都</div>
            <div class="category-stamp">黄河湿地</div>
          </div>
        </aside>

        <!-- Right Parallax Scroll Map -->
        <div class="scroll-outer-frame">
          <div class="scroll-wooden-rod left-rod"></div>
          <div class="scroll-middle-paper" ref="scrollPaper">
            <!-- Background Layer: Ink mountains (visualized as stylized css gradients/canvas) -->
            <div class="parallax-layer bg-mountains" :style="getParallaxStyle(0.2)"></div>

            <!-- Midground Layer: Yellow River flowing curve path -->
            <div class="parallax-layer river-flow-layer" :style="getParallaxStyle(0.5)">
              <svg class="ink-river-svg" viewBox="0 0 1000 600">
                <path
                  d="M100,520 Q200,420 300,480 T500,320 T700,260 T900,100"
                  fill="none"
                  stroke="rgba(142, 53, 46, 0.4)"
                  stroke-width="8"
                  stroke-dasharray="10 8"
                  class="svg-river-dash"
                />
              </svg>
            </div>

            <!-- Foreground Layer: City Stamps -->
            <div class="parallax-layer stamps-layer" :style="getParallaxStyle(1.0)">
              <div
                v-for="city in cities"
                :key="city"
                class="city-ink-stamp-box"
                :style="getCityStampPos(city)"
                @click="$router.push(`/regions/${city}`)"
              >
                <div class="stamp-seal-red">
                  <span class="seal-char">{{ city[0] }}</span>
                  <span class="seal-char">{{ city[1] }}</span>
                </div>
                <span class="stamp-lbl-vertical">{{ city }}</span>
              </div>
            </div>
          </div>
          <div class="scroll-wooden-rod right-rod"></div>
        </div>
      </div>
    </div>

    <!-- AI Chatbot Box (Global Sidebar) -->
    <AiChatBox />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { mockCities } from '../config/mockDetailData'
import AiChatBox from '../components/AiChatBox.vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const router = useRouter()
const { isReal, isAnime } = useTheme()

const cityLabels = ref([])

const clickLabel = (cityName) => {
  selectedCity.value = cityName
  const targetPin = cityObjects.find(c => c.name === cityName)
  if (targetPin) {
    const startPos = camera.position.clone()
    const endPos = new THREE.Vector3(targetPin.position.x, targetPin.position.y + 3.5, targetPin.position.z + 5.0)
    
    let t = 0
    const animateCamera = () => {
      t += 0.05
      if (t <= 1.0) {
        camera.position.lerpVectors(startPos, endPos, t)
        controls.target.lerpVectors(controls.target.clone(), targetPin.position, t)
        requestAnimationFrame(animateCamera)
      }
    }
    animateCamera()
  }
}

// Mouse parallax coordinate tracking
const mouseX = ref(0)
const mouseY = ref(0)

const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  mouseX.value = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
  mouseY.value = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
}

const resetParallax = () => {
  mouseX.value = 0
  mouseY.value = 0
}

const getParallaxStyle = (factor) => {
  const x = mouseX.value * 25 * factor
  const y = mouseY.value * 20 * factor
  return {
    transform: `translate3d(${x}px, ${y}px, 0)`
  }
}

// Cities list and coords for water-ink custom placement
const cities = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '滨州', '淄博', '东营']

const getCityData = (cityName) => {
  return mockCities[cityName] || { desc: '齐鲁重镇，文脉千秋。' }
}

const getCityStampPos = (city) => {
  const coords = {
    '菏泽': { left: '12%', top: '78%' },
    '济宁': { left: '26%', top: '72%' },
    '泰安': { left: '42%', top: '60%' },
    '聊城': { left: '24%', top: '48%' },
    '济南': { left: '46%', top: '46%' },
    '德州': { left: '32%', top: '24%' },
    '淄博': { left: '62%', top: '48%' },
    '滨州': { left: '64%', top: '26%' },
    '东营': { left: '80%', top: '22%' }
  }
  return coords[city] || { left: '50%', top: '50%' }
}

// ==========================================
// Three.js 3D WebGL Map implementation
// ==========================================
const canvas3d = ref(null)
const selectedCity = ref(null)
let scene, camera, renderer, controls, animationFrameId
const cityObjects = []

// 3D coordinates for Shandong cities relative to [0, 0] plane
const projectGeo = (lon, lat) => {
  const x = (lon - 117.0) * 3.9
  const z = -(lat - 36.4) * 3.0
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

// Geographical coordinates (Lon, Lat) of core cities
const cityGeoCoords = [
  { name: '菏泽', lon: 115.43, lat: 35.24, color: 0xc23a2b },
  { name: '济宁', lon: 116.59, lat: 35.41, color: 0xe69138 },
  { name: '泰安', lon: 117.09, lat: 36.26, color: 0xd4af37 },
  { name: '聊城', lon: 115.97, lat: 36.45, color: 0x8e352e },
  { name: '济南', lon: 116.99, lat: 36.67, color: 0x3d85c6 },
  { name: '德州', lon: 116.36, lat: 37.45, color: 0x674ea7 },
  { name: '淄博', lon: 118.05, lat: 36.78, color: 0x6aa84f },
  { name: '滨州', lon: 118.02, lat: 37.37, color: 0x5b8c85 },
  { name: '东营', lon: 118.67, lat: 37.43, color: 0x008080 }
]

const city3dCoords = cityGeoCoords.map(city => {
  const { x, z } = projectGeo(city.lon, city.lat)
  return {
    name: city.name,
    x,
    z,
    color: city.color
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

// Terrain height calculator based on geographic features of Shandong
const getTerrainHeight = (x, z) => {
  const vx = x
  const vy = -z
  
  let isSea = false
  if (vx > 3.0 && vy > 2.5) {
    isSea = true // Bohai Bay
  } else if (vx > 6.0 && vy < -2.0) {
    isSea = true // Yellow Sea
  }
  
  if (isSea) return -0.4
  
  let height = 0
  
  // 1. Natural terrain undulating waves (fBm noise simulation)
  let noise = Math.sin(vx * 0.25) * Math.cos(vy * 0.25) * 0.3
  noise += Math.sin(vx * 0.6 + 1.2) * Math.cos(vy * 0.7 - 0.5) * 0.1
  noise += Math.sin(vx * 1.5) * Math.cos(vy * 1.3) * 0.03
  height += noise
  
  // 2. Mountains (Mount Tai, Yimeng Range, Jiaodong Hills)
  // Mount Tai around (-0.5, 1.2) -> vy: -1.2
  const distToTai = Math.sqrt(Math.pow(vx - (-0.5), 2) + Math.pow(vy - (-1.2), 2))
  if (distToTai < 3.5) {
    height += 1.8 * Math.pow(1.0 - distToTai / 3.5, 2)
  }
  
  // Yimeng Range around (2.0, -2.5)
  const distToYimeng = Math.sqrt(Math.pow(vx - 2.0, 2) + Math.pow(vy - (-2.5), 2))
  if (distToYimeng < 4.0) {
    height += 1.3 * Math.pow(1.0 - distToYimeng / 4.0, 2)
  }
  
  // Jiaodong Hills around (7.5, -0.5)
  const distToJiaodong = Math.sqrt(Math.pow(vx - 7.5, 2) + Math.pow(vy - (-0.5), 2))
  if (distToJiaodong < 3.0) {
    height += 0.6 * Math.pow(1.0 - distToJiaodong / 3.0, 2)
  }
  
  // 3. Plain flattening (Heze, Liaocheng, Dezhou)
  if (vx < -3.5) {
    const plainFade = Math.max(0, (vx + 8) / 4.5)
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

// Complete Yellow River 3D path line (sitting inside the carved valley)
const riverPoints = river2dPoints.map(p => new THREE.Vector3(p.x, getTerrainHeight(p.x, p.z) + 0.04, p.z))

const initThree = (geojson) => {
  if (!canvas3d.value) return
  
  const width = canvas3d.value.parentElement.clientWidth
  const height = canvas3d.value.parentElement.clientHeight
  
  // 1. Create Scene & Camera
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xfbf8f3) // Parchment paper color for real mode
  
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(0, 15, 15) // Top down orthographic-style angle
  
  // 2. Renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvas3d.value, antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  
  // 3. Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxPolarAngle = Math.PI / 2.2 // Do not look underneath
  controls.minDistance = 5
  controls.maxDistance = 35
  
  // 4. Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)
  
  const dirLight = new THREE.DirectionalLight(0xfffdf6, 1.2)
  dirLight.position.set(5, 18, 5)
  dirLight.castShadow = true
  scene.add(dirLight)
  
  const pointLight = new THREE.PointLight(0xb8860b, 1.0, 20)
  pointLight.position.set(0, 5, 0)
  scene.add(pointLight)

  if (geojson) {
    // 5. Build Extruded Shandong Administrative Map shapes (区分出城市板块分布，呈现山东省轮廓)
    const extrudeSettings = {
      depth: 0.35,
      bevelEnabled: false
    }

    geojson.features.forEach(feature => {
      const cityName = feature.properties.name.replace('市', '')
      
      // Determine mineral color for this city plate
      const getCityColorVal = (name) => {
        const mineralColors = [
          '#dfd7c2', // 纸米黄
          '#cfcbbd', // 苍黄
          '#c8c3b0', // 青灰
          '#c2bba8', // 素微黄
          '#d0c9a7', // 淡竹青
          '#bca88b', // 赭土色
          '#b1bfa1'  // 谷绿
        ]
        let sum = 0
        for (let i = 0; i < name.length; i++) {
          sum += name.charCodeAt(i)
        }
        return new THREE.Color(mineralColors[sum % mineralColors.length])
      }
      
      const cityColor = getCityColorVal(cityName)
      
      // Create city 2D shape boundaries
      const shapes = []
      if (feature.geometry.type === 'Polygon') {
        shapes.push(createCityShape(feature.geometry.coordinates[0]))
      } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(poly => {
          shapes.push(createCityShape(poly[0]))
        })
      }
      
      if (shapes.length > 0) {
        const cityGeometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings)
        
        // Deform top surface of the city plate to follow the mountain/valley height-map
        const pos = cityGeometry.attributes.position
        for (let i = 0; i < pos.count; i++) {
          const lx = pos.getX(i)
          const ly = pos.getY(i)
          const lz = pos.getZ(i) // local Z represents the extrusion depth
          
          const wx = lx
          const wz = -ly
          
          const terrainH = getTerrainHeight(wx, wz)
          
          if (lz > 0.15) {
            pos.setZ(i, terrainH) // Top face follows terrain
          } else {
            pos.setZ(i, -0.3)      // Bottom face is flat
          }
        }
        cityGeometry.computeVertexNormals()
        
        const cityMaterial = new THREE.MeshStandardMaterial({
          color: cityColor,
          roughness: 0.85,
          metalness: 0.05,
          flatShading: true
        })
        const cityMesh = new THREE.Mesh(cityGeometry, cityMaterial)
        cityMesh.rotation.x = -Math.PI / 2
        cityMesh.receiveShadow = true
        cityMesh.castShadow = true
        scene.add(cityMesh)
        
        // Draw elegant dark-ink outline borders around the top surface of the city plate
        const drawRing = (coords) => {
          const points = []
          coords.forEach(c => {
            const { x, z } = projectGeo(c[0], c[1])
            const y = getTerrainHeight(x, z) + 0.012
            points.push(new THREE.Vector3(x, y, z))
          })
          const borderGeom = new THREE.BufferGeometry().setFromPoints(points)
          const borderMat = new THREE.LineBasicMaterial({
            color: 0x4a3f35, // Deep charcoal ink
            linewidth: 1.5,
            transparent: true,
            opacity: 0.55
          })
          const borderLine = new THREE.Line(borderGeom, borderMat)
          scene.add(borderLine)
        }
        
        if (feature.geometry.type === 'Polygon') {
          drawRing(feature.geometry.coordinates[0])
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach(poly => {
            drawRing(poly[0])
          })
        }
      }
    })
    
    // Add adjacent sea area representation (Bohai Sea & Yellow Sea)
    const seaGeometry = new THREE.PlaneGeometry(42, 30)
    const seaMaterial = new THREE.MeshStandardMaterial({
      color: 0xabbca7, // Soft jade-water green-grey
      roughness: 0.35,
      metalness: 0.15,
      flatShading: true
    })
    const seaMesh = new THREE.Mesh(seaGeometry, seaMaterial)
    seaMesh.rotation.x = -Math.PI / 2
    seaMesh.position.y = -0.32
    seaMesh.receiveShadow = true
    scene.add(seaMesh)
    
  } else {
    // Fallback: Rectangular terrain plane if GeoJSON is not loaded
    const mapGeometry = new THREE.PlaneGeometry(22, 14, 40, 40)
    const posAttribute = mapGeometry.attributes.position
    for (let i = 0; i < posAttribute.count; i++) {
      const vx = posAttribute.getX(i)
      const vy = posAttribute.getY(i)
      let z = Math.sin(vx * 0.2) * Math.cos(vy * 0.2) * 0.8
      const distToTai = Math.sqrt(Math.pow(vx - 0, 2) + Math.pow(vy - (-1), 2))
      if (distToTai < 3) {
        z += (3 - distToTai) * 0.6
      }
      posAttribute.setZ(i, z)
    }
    mapGeometry.computeVertexNormals()
    
    const mapMaterial = new THREE.MeshStandardMaterial({
      color: 0xede6da,
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
  const riverMat = new THREE.MeshBasicMaterial({
    color: 0xc27b38, // Golden river glowing color
    transparent: true,
    opacity: 0.85
  })
  const riverMesh = new THREE.Mesh(riverGeom, riverMat)
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
  
  // 7. Render City Nodes (glowing 3D pins on terrain surface)
  city3dCoords.forEach(city => {
    // Pin group
    const pinGroup = new THREE.Group()
    const terrainHeight = getTerrainHeight(city.x, city.z)
    pinGroup.position.set(city.x, terrainHeight, city.z)
    pinGroup.name = city.name
    
    // Glowing sphere
    const sphereGeom = new THREE.SphereGeometry(0.24, 16, 16)
    const sphereMat = new THREE.MeshStandardMaterial({
      color: city.color,
      emissive: city.color,
      emissiveIntensity: 0.6,
      roughness: 0.2
    })
    const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat)
    sphereMesh.position.y = 0.4
    sphereMesh.castShadow = true
    pinGroup.add(sphereMesh)
    
    // Little stand pole
    const cylGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8)
    const cylMat = new THREE.MeshBasicMaterial({ color: 0x4b382a })
    const cylMesh = new THREE.Mesh(cylGeom, cylMat)
    cylMesh.position.y = 0.2
    pinGroup.add(cylMesh)
    
    // Bottom ripple ring
    const ringGeom = new THREE.RingGeometry(0.1, 0.4, 32)
    const ringMat = new THREE.MeshBasicMaterial({
      color: city.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    })
    const ringMesh = new THREE.Mesh(ringGeom, ringMat)
    ringMesh.rotation.x = -Math.PI / 2
    ringMesh.position.y = 0.02
    pinGroup.add(ringMesh)
    
    scene.add(pinGroup)
    cityObjects.push(pinGroup)
  })
  
  // 8. Raycasting for mouse interactions
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  let clickTime = 0
  
  const onPointerDown = (event) => {
    // Track click timing for double-click detection
    const now = Date.now()
    const isDoubleClick = now - clickTime < 300
    clickTime = now
    
    // Calculate click coords
    const rect = renderer.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    raycaster.setFromCamera(mouse, camera)
    
    // Check intersections
    const intersects = raycaster.intersectObjects(scene.children, true)
    
    // Find if we clicked a city group
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
    
    if (clickedCity) {
      selectedCity.value = clickedCity
      
      // Fly to node animation
      const targetPin = cityObjects.find(c => c.name === clickedCity)
      if (targetPin) {
        // Double click goes directly to page
        if (isDoubleClick) {
          router.push(`/regions/${clickedCity}`)
        } else {
          // Camera flies smoothly closer
          const startPos = camera.position.clone()
          const endPos = new THREE.Vector3(targetPin.position.x, targetPin.position.y + 3.5, targetPin.position.z + 5.0)
          
          let t = 0
          const animateCamera = () => {
            t += 0.05
            if (t <= 1.0) {
              camera.position.lerpVectors(startPos, endPos, t)
              controls.target.lerpVectors(controls.target.clone(), targetPin.position, t)
              requestAnimationFrame(animateCamera)
            }
          }
          animateCamera()
        }
      }
    }
  }
  
  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  
  // 9. Animation Loop
  let clock = new THREE.Clock()
  
  const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    
    // Pulse the river dots along the path
    const positions = riverPointsObj.geometry.attributes.position.array
    for (let i = 0; i < dotCount; i++) {
      // Speed up flow
      dotOffsets[i] = (dotOffsets[i] + 0.001) % 1.0
      const pt = riverCurve.getPointAt(dotOffsets[i])
      positions[i * 3] = pt.x
      positions[i * 3 + 1] = pt.y + 0.05
      positions[i * 3 + 2] = pt.z
    }
    riverPointsObj.geometry.attributes.position.needsUpdate = true
    
    // Animate city rings and nodes (slow rotations/pulsing)
    cityObjects.forEach((pin, index) => {
      // Little vertical hover bounce
      const sphere = pin.children[0]
      sphere.position.y = 0.4 + Math.sin(elapsedTime * 2 + index) * 0.06
      
      // Expand bottom ripple rings
      const ring = pin.children[2]
      const scaleVal = 1.0 + (elapsedTime + index * 0.5) % 1.5
      ring.scale.set(scaleVal, scaleVal, 1)
      ring.material.opacity = 0.5 * (1.0 - (scaleVal - 1.0) / 1.5)
    })
    
    // Update labels projection
    if (camera && canvas3d.value) {
      const width = canvas3d.value.clientWidth
      const height = canvas3d.value.clientHeight
      
      const newLabels = city3dCoords.map(city => {
        const targetPin = cityObjects.find(c => c.name === city.name)
        const terrainY = targetPin ? targetPin.position.y : 0
        const sphereLocalY = targetPin ? targetPin.children[0].position.y : 0.4
        
        const tempV = new THREE.Vector3(city.x, terrainY + sphereLocalY + 0.35, city.z)
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
  
  // Clean up listener
  onBeforeUnmount(() => {
    if (renderer && renderer.domElement) {
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
    }
  })
}

// Window resizing
const handleResize = () => {
  if (isReal.value && renderer && camera && canvas3d.value) {
    const width = canvas3d.value.parentElement.clientWidth
    const height = canvas3d.value.parentElement.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }
}

watch(isReal, (newVal) => {
  if (newVal) {
    setTimeout(async () => {
      try {
        const response = await fetch('/shandong.json')
        const shandongGeojson = await response.json()
        initThree(shandongGeojson)
      } catch (e) {
        console.error('Error loading shandong.json:', e)
        initThree(null)
      }
      window.addEventListener('resize', handleResize)
    }, 150)
  } else {
    window.removeEventListener('resize', handleResize)
    cancelAnimationFrame(animationFrameId)
    if (chartInstance) chartInstance.dispose()
  }
})

onMounted(() => {
  if (isReal.value) {
    setTimeout(async () => {
      try {
        const response = await fetch('/shandong.json')
        const shandongGeojson = await response.json()
        initThree(shandongGeojson)
      } catch (e) {
        console.error('Error loading shandong.json, falling back to mock terrain:', e)
        initThree(null)
      }
      window.addEventListener('resize', handleResize)
    }, 150)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(animationFrameId)
})
</script>

<style scoped>
.map-view {
  width: 100vw;
  height: calc(100vh - var(--nav-height));
  position: relative;
  overflow: hidden;
}

/* REAL MODE HUD GRAPHICS */
.real-3d-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #fbf8f3;
}

.canvas-3d-wrap {
  width: 100%;
  height: 100%;
}

.webgl-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* HUD Panel */
.hud-panel {
  position: absolute;
  top: 32px;
  left: 32px;
  width: 320px;
  background: rgba(253, 250, 245, 0.85);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 24px;
  z-index: 10;
  box-shadow: 0 10px 30px rgba(61, 43, 31, 0.06);
  backdrop-filter: blur(16px);
  text-align: left;
}

.hud-header {
  border-bottom: 2px solid var(--accent);
  padding-bottom: 12px;
  margin-bottom: 16px;
}

.hud-badge {
  font-size: 9px;
  font-weight: 800;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 2px 6px;
  border-radius: 2px;
  letter-spacing: 1px;
}

.hud-title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 2px;
  margin: 8px 0 0 0;
}

.hud-desc {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 20px 0;
}

.hud-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  padding: 12px 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-num {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 900;
  color: var(--accent);
}

.stat-lbl {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 700;
  margin-top: 2px;
}

.hud-tips {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  border-top: 1px dashed var(--border-light);
  padding-top: 16px;
}

.tip-icon {
  font-size: 16px;
}

.tip-txt {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Floating Click Details Card */
.hud-detail-card {
  position: absolute;
  bottom: 40px;
  left: 32px;
  width: 320px;
  background: rgba(253, 250, 245, 0.9);
  border: 1px solid var(--accent);
  padding: 20px;
  z-index: 10;
  box-shadow: 0 12px 36px rgba(142, 53, 46, 0.12);
  backdrop-filter: blur(16px);
  text-align: left;
}

.detail-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed var(--border-light);
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.city-title-real {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 1px;
  margin: 0;
}

.close-card-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-muted);
  transition: color 0.2s;
}

.close-card-btn:hover {
  color: var(--accent);
}

.city-desc-real {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.card-footer-action {
  display: flex;
}

.action-btn-primary {
  width: 100%;
  padding: 8px 16px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  letter-spacing: 1px;
  transition: all 0.2s;
}

.action-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(142, 53, 46, 0.25);
}

/* ==========================================
   ANIME WATER-INK PARALLAX SCROLL THEME
   ========================================== */
.anime-ink-container {
  width: 100%;
  height: 100%;
  background: #f4efe4; /* Traditional ink wash paper base */
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ink-layout-wrap {
  width: 100%;
  max-width: 1300px;
  height: 100%;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 40px;
  align-items: center;
}

/* Left panel calligraphy */
.ink-left-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  text-align: left;
}

.calligraphy-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.seal-red {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: #8e352e;
  padding: 6px 4px;
  border-radius: 2px;
  letter-spacing: 2px;
  box-shadow: 2px 2px 4px rgba(142, 53, 46, 0.2);
}

.calligraphy-title {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 6px;
  line-height: 1.2;
  margin: 0;
}

.ink-intro-para {
  font-family: var(--font-heading);
  font-size: 14px;
  line-height: 1.9;
  color: var(--text-secondary);
  text-indent: 2em;
  text-align: justify;
}

.ink-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-stamp {
  font-size: 12px;
  font-weight: 700;
  border: 1px solid rgba(142, 53, 46, 0.4);
  color: #8e352e;
  padding: 4px 12px;
  border-radius: 2px;
  background: rgba(142, 53, 46, 0.03);
}

/* Right Scroll Frame */
.scroll-outer-frame {
  height: 520px;
  display: flex;
  align-items: center;
  position: relative;
}

.scroll-wooden-rod {
  width: 14px;
  height: 540px;
  background: linear-gradient(to bottom, #3d240e, #73451d, #3d240e);
  border-radius: 7px;
  box-shadow: 4px 0 10px rgba(0,0,0,0.25);
  z-index: 5;
}

.scroll-wooden-rod::before,
.scroll-wooden-rod::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 22px;
  height: 16px;
  background: linear-gradient(90deg, #d4af37, #aa7c11, #d4af37);
  border-radius: 2px;
}

.scroll-wooden-rod::before { top: -10px; }
.scroll-wooden-rod::after { bottom: -10px; }

.left-rod { margin-right: -4px; }
.right-rod { margin-left: -4px; }

.scroll-middle-paper {
  flex: 1;
  height: 480px;
  background: #fbf8f2;
  border-top: 1px solid rgba(142, 53, 46, 0.12);
  border-bottom: 1px solid rgba(142, 53, 46, 0.12);
  box-shadow: inset 0 0 40px rgba(115, 69, 29, 0.06), 0 10px 30px rgba(0,0,0,0.15);
  position: relative;
  overflow: hidden;
}

/* Parallax Layer core */
.parallax-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transition: transform 0.1s ease-out;
}

/* Background water-ink mountains */
.bg-mountains {
  background-image: url('/images/inkwash-map.png');
  background-size: cover;
  background-position: center;
  opacity: 0.82;
  filter: contrast(0.95) sepia(0.12);
  z-index: 1;
}

/* Yellow River flowing SVG */
.river-flow-layer {
  z-index: 2;
}

.ink-river-svg {
  width: 100%;
  height: 100%;
}

.svg-river-dash {
  stroke-dasharray: 20;
  animation: riverFlowAnimation 16s linear infinite;
}

@keyframes riverFlowAnimation {
  to {
    stroke-dashoffset: -400;
  }
}

/* Foreground city stamps */
.stamps-layer {
  z-index: 3;
  pointer-events: auto;
}

.city-ink-stamp-box {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.city-ink-stamp-box:hover {
  transform: translate(-50%, -55%) scale(1.08);
}

/* 朱红泥印章 */
.stamp-seal-red {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #8e352e;
  border-radius: 2px;
  color: #fff;
  font-family: var(--font-display);
  font-size: 11px;
  line-height: 1.1;
  font-weight: 900;
  box-shadow: 2px 2px 6px rgba(142, 53, 46, 0.35);
  border: 1px dashed rgba(255, 255, 255, 0.3);
  padding: 2px;
}

.stamp-lbl-vertical {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: bold;
  color: var(--text-primary);
  letter-spacing: 2px;
  margin-top: 6px;
  background: rgba(251, 248, 242, 0.85);
  padding: 4px 2px;
  border-radius: 2px;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.8s ease both;
}

.animate-slide-in {
  animation: slideIn 0.6s ease both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .ink-layout-wrap {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .scroll-outer-frame {
    height: 380px;
  }
  .scroll-wooden-rod {
    height: 400px;
  }
  .scroll-middle-paper {
    height: 350px;
  }
  .hud-panel {
    width: 280px;
    left: 20px;
    top: 20px;
  }
}

/* Floating Labels Overlay */
.labels-overlay-3d {
  position: absolute;
  inset: 0;
  pointer-events: none; /* Let clicks pass through to Three.js canvas */
  z-index: 5;
}

.city-3d-label {
  position: absolute;
  transform: translate(-50%, -100%);
  pointer-events: auto; /* Enable hover and clicks on label box */
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
}

.label-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1.5px solid #fff;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
}

.label-line {
  width: 1px;
  height: 14px;
  background: linear-gradient(to bottom, var(--accent), transparent);
}

.label-box {
  background: rgba(61, 43, 31, 0.82); /* Deep warm brown matches theme */
  border: 1px solid var(--accent-light);
  padding: 4px 10px;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.city-3d-label:hover .label-box {
  background: var(--accent);
  border-color: #fff;
  transform: scale(1.08) translateY(-2px);
  box-shadow: 0 6px 16px rgba(142, 53, 46, 0.3);
}

.label-text {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
  line-height: 1;
}
</style>
