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
          
          <!-- Immersive HUD label control action -->
          <div class="hud-actions">
            <button class="action-btn-toggle" @click="showLabels = !showLabels" :title="showLabels ? '隐藏标签' : '显示标签'">
              <svg v-if="showLabels" class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <span>{{ showLabels ? '隐藏地区标签' : '显示地区标签' }}</span>
            </button>
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
        <div class="labels-overlay-3d" v-show="showLabels">
          <div
            v-for="label in cityLabels"
            :key="label.name"
            v-show="label.visible"
            class="city-3d-label"
            :class="[isReal ? 'label-theme-real' : 'label-theme-inkwash']"
            :style="{ left: `${label.x}px`, top: `${label.y}px` }"
            @click="clickLabel(label.name)"
          >
            <!-- Chinese Heritage Plaque Card -->
            <div class="label-plaque-card">
              <div class="decor-corner corner-tl"></div>
              <div class="decor-corner corner-tr"></div>
              <div class="decor-corner corner-bl"></div>
              <div class="decor-corner corner-br"></div>
              
              <div class="plaque-content">
                <span class="plaque-name">{{ label.name }}</span>
                <span class="plaque-divider"></span>
                <span class="plaque-tag">{{ getCityData(label.name).tag }}</span>
              </div>
            </div>
            
            <!-- Elegant Gradient Connecting Line -->
            <div class="label-connector-line"></div>
            
            <!-- Glowing Interactive Ripple Pin -->
            <div class="label-glow-pin">
              <span class="ring-pulse pulse-1" :style="{ borderColor: label.colorHex }"></span>
              <span class="ring-pulse pulse-2" :style="{ borderColor: label.colorHex }"></span>
              <div class="pin-dot" :style="{ backgroundColor: label.colorHex }"></div>
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
const showLabels = ref(true)

const clickLabel = (cityName) => {
  selectedCity.value = cityName
  const targetPin = cityObjects.find(c => c.name === cityName)
  if (targetPin) {
    const startPos = camera.position.clone()
    const endPos = new THREE.Vector3(targetPin.position.x, targetPin.position.y + 3.5, targetPin.position.z + 5.0)
    const startTarget = controls.target.clone()
    const endTarget = targetPin.position.clone()
    
    let t = 0
    const animateCamera = () => {
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
let pointerDownRef = null

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

// 3D coordinates for Shandong cities relative to [0, 0] plane
// Correct aspect ratio calculation: longitude scale = latitude scale * cos(mean_latitude)
// For Shandong (mean latitude ~36.4° N), cos(36.4°) ≈ 0.805
// If latitude scale is 3.8, longitude scale should be 3.8 * 0.805 ≈ 3.06. This prevents horizontal stretching.
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
  { name: '菏泽', lon: 115.48, lat: 35.23, color: 0xc23a2b },
  { name: '济宁', lon: 116.59, lat: 35.38, color: 0xe69138 },
  { name: '泰安', lon: 117.08, lat: 36.20, color: 0xd4af37 },
  { name: '聊城', lon: 115.97, lat: 36.45, color: 0x8e352e },
  { name: '济南', lon: 117.00, lat: 36.67, color: 0x3d85c6 },
  { name: '德州', lon: 116.29, lat: 37.43, color: 0x674ea7 },
  { name: '淄博', lon: 118.00, lat: 36.81, color: 0x6aa84f },
  { name: '滨州', lon: 118.02, lat: 37.37, color: 0x5b8c85 },
  { name: '东营', lon: 118.49, lat: 37.46, color: 0x008080 }
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
  // Mount Tai
  const dxTai = vx - centerTai.x
  const dyTai = vy - (-centerTai.z)
  const distToTai = Math.sqrt(dxTai * dxTai + dyTai * dyTai)
  if (distToTai < 3.5) {
    height += 1.8 * Math.pow(1.0 - distToTai / 3.5, 2)
  }
  
  // Yimeng Range
  const dxYimeng = vx - centerYimeng.x
  const dyYimeng = vy - (-centerYimeng.z)
  const distToYimeng = Math.sqrt(dxYimeng * dxYimeng + dyYimeng * dyYimeng)
  if (distToYimeng < 4.0) {
    height += 1.3 * Math.pow(1.0 - distToYimeng / 4.0, 2)
  }
  
  // Jiaodong Hills
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

// Hypsometric tinting color mapper based on realistic terrain features (actual geography)
const getGeographyColor = (h) => {
  const color = new THREE.Color()
  if (h < -0.1) {
    // Valley / lowlands: lush river basin green
    color.setHSL(0.24, 0.22, 0.45 + (h + 0.3) * 0.2)
  } else if (h < 0.3) {
    // Plains: fertile green/yellowish green
    const t = (h - (-0.1)) / 0.4
    color.lerpColors(new THREE.Color('#94af76'), new THREE.Color('#b5c48f'), t)
  } else if (h < 0.8) {
    // Hills: warm ochre/olive
    const t = (h - 0.3) / 0.5
    color.lerpColors(new THREE.Color('#b5c48f'), new THREE.Color('#caba7d'), t)
  } else {
    // Mountains: rugged rock brown to snow cap white
    const t = Math.min(1.0, (h - 0.8) / 1.0)
    color.lerpColors(new THREE.Color('#9e7a59'), new THREE.Color('#e0dcd3'), t)
  }
  return color
}

// Complete Yellow River 3D path line (sitting inside the carved valley)
const riverPoints = river2dPoints.map(p => new THREE.Vector3(p.x, getTerrainHeight(p.x, p.z) + 0.04, p.z))

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
      
      // Create city 2D shape boundaries (filter out small islands/isolated points under 45 vertices)
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
        
        // Deform top surface of the city plate to follow the mountain/valley height-map and set vertex colors
        const pos = cityGeometry.attributes.position
        const colors = new Float32Array(pos.count * 3)
        for (let i = 0; i < pos.count; i++) {
          const lx = pos.getX(i)
          const ly = pos.getY(i)
          const lz = pos.getZ(i) // local Z represents the extrusion depth
          
          const wx = lx
          const wz = -ly
          
          const terrainH = getTerrainHeight(wx, wz)
          
          let vertexColor
          if (lz > 0.15) {
            pos.setZ(i, terrainH) // Top face follows terrain
            vertexColor = getGeographyColor(terrainH)
          } else {
            pos.setZ(i, -0.6)      // Bottom face is flat
            vertexColor = new THREE.Color('#4a3e3d') // Foundation rock color (dark basalt/slate)
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
  
  // 7. Render City Nodes (holographic glowing markers)
  city3dCoords.forEach(city => {
    const pinGroup = new THREE.Group()
    const terrainHeight = getTerrainHeight(city.x, city.z)
    pinGroup.position.set(city.x, terrainHeight, city.z)
    pinGroup.name = city.name
    
    // 1) Volumetric light beam
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
    
    // 2) Floating spinning crystal octahedron (diamond)
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
    
    // 3) Holographic outer ring (ticks)
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
    
    // 4) Holographic inner ring (compass pointer)
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
    
    // 5) Expanding pulse ring
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
          const startTarget = controls.target.clone()
          const endTarget = targetPin.position.clone()
          
          let t = 0
          const animateCamera = () => {
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
      }
    }
  }
  
  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  pointerDownRef = onPointerDown
  
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
    
    // Animate holographic city markers (rotation, hover, pulsing)
    cityObjects.forEach((pin, index) => {
      const diamond = pin.children[1]
      const outerRing = pin.children[2]
      const innerRing = pin.children[3]
      const ripple = pin.children[4]
      
      // 1) Spin and float the diamond
      if (diamond) {
        diamond.position.y = 1.25 + Math.sin(elapsedTime * 1.8 + index) * 0.08
        diamond.rotation.y = elapsedTime * 1.6 + index
        diamond.rotation.x = elapsedTime * 0.4
      }
      
      // 2) Rotate base compass rings in opposite directions
      if (outerRing) {
        outerRing.rotation.z = elapsedTime * 0.6
      }
      if (innerRing) {
        innerRing.rotation.z = -elapsedTime * 1.1
      }
      
      // 3) Expand and fade the bottom ripple ring
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
  
  // Listener cleanup handled globally by cleanupThree
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
    cleanupThree()
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
  cleanupThree()
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

.hud-actions {
  margin-bottom: 20px;
}

.action-btn-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(184, 134, 11, 0.08);
  border: 1px solid rgba(184, 134, 11, 0.25);
  border-radius: var(--radius-sm);
  color: var(--accent-dark);
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.action-btn-toggle:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(184, 134, 11, 0.15);
}

.action-icon {
  width: 16px;
  height: 16px;
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
  animation: labelFadeIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes labelFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -85%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -100%) scale(1);
  }
}

/* Plaque Card styling */
.label-plaque-card {
  position: relative;
  padding: 6px 14px;
  min-width: 120px;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Theme specific colors */
.label-theme-real .label-plaque-card {
  background: rgba(253, 250, 245, 0.94);
  border: 1px solid var(--accent-light);
}

.label-theme-inkwash .label-plaque-card {
  background: rgba(26, 26, 26, 0.92);
  border: 1px solid var(--accent);
}

/* Hover effects */
.city-3d-label:hover .label-plaque-card {
  transform: translateY(-5px) scale(1.06);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

.label-theme-real:hover .label-plaque-card {
  border-color: var(--accent);
  background: #ffffff;
}

.label-theme-inkwash:hover .label-plaque-card {
  border-color: #ffffff;
  background: #111111;
}

/* Decorative Chinese Plaque Corners */
.decor-corner {
  position: absolute;
  width: 6px;
  height: 6px;
  border: 1.5px solid transparent;
  pointer-events: none;
}

.label-theme-real .decor-corner {
  border-color: var(--accent-light);
}

.label-theme-inkwash .decor-corner {
  border-color: var(--accent);
}

/* TL, TR, BL, BR corners */
.corner-tl { top: 3px; left: 3px; border-right: 0; border-bottom: 0; }
.corner-tr { top: 3px; right: 3px; border-left: 0; border-bottom: 0; }
.corner-bl { bottom: 3px; left: 3px; border-right: 0; border-top: 0; }
.corner-br { bottom: 3px; right: 3px; border-left: 0; border-top: 0; }

.city-3d-label:hover .decor-corner {
  border-color: currentColor;
}

.label-theme-real:hover .decor-corner {
  border-color: var(--accent);
}

.label-theme-inkwash:hover .decor-corner {
  border-color: #ffffff;
}

/* Plaque Content */
.plaque-content {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.plaque-name {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1px;
}

.label-theme-real .plaque-name {
  color: var(--text-primary);
}

.label-theme-inkwash .plaque-name {
  color: #ffffff;
}

.plaque-divider {
  width: 1px;
  height: 12px;
  background: var(--border);
}

.label-theme-inkwash .plaque-divider {
  background: rgba(255, 255, 255, 0.2);
}

.plaque-tag {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
  letter-spacing: 0.5px;
}

.label-theme-real .plaque-tag {
  color: var(--accent-dark);
  background: rgba(184, 134, 11, 0.12);
}

.label-theme-inkwash .plaque-tag {
  color: #e85d4f;
  background: rgba(194, 58, 43, 0.15);
}

/* Connecting Line */
.label-connector-line {
  width: 1.5px;
  height: 24px;
  background: linear-gradient(to bottom, var(--accent-light), transparent);
  transition: all 0.3s ease;
}

.label-theme-inkwash .label-connector-line {
  background: linear-gradient(to bottom, var(--accent), transparent);
}

.city-3d-label:hover .label-connector-line {
  height: 30px;
  background: linear-gradient(to bottom, var(--accent), transparent);
}

.label-theme-inkwash:hover .label-connector-line {
  background: linear-gradient(to bottom, #ffffff, transparent);
}

/* Glow Pin Base */
.label-glow-pin {
  position: relative;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pin-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
  z-index: 2;
  transition: transform 0.3s ease;
}

.city-3d-label:hover .pin-dot {
  transform: scale(1.3);
}

/* Breathing Rings */
.ring-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 1.5px solid;
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  z-index: 1;
}

.pulse-1 {
  animation: pulseAnimation 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
}

.pulse-2 {
  animation: pulseAnimation 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
  animation-delay: 1s;
}

@keyframes pulseAnimation {
  0% {
    transform: scale(0.4);
    opacity: 0;
  }
  25% {
    opacity: 0.8;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}
</style>
