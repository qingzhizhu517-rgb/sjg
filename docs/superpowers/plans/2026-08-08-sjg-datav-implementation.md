# SJG DataV 数据大屏实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建基于 React + Three.js 的山东省文化数据可视化大屏，参考 sc-datav 项目风格

**Architecture:** 独立 React 项目，使用 Three.js 渲染 3D 地图，ECharts 展示图表，SWR 缓存 API 数据，通过悬浮按钮与 SJG 集成

**Tech Stack:** React 19, TypeScript, Vite 8, Three.js, @react-three/fiber, @react-three/drei, ECharts 6, GSAP 3, Zustand 5, styled-components 6, SWR

---

## 文件结构总览

```
sjg-datav/
├── src/
│   ├── assets/
│   │   └── shandong.json              # 山东省 GeoJSON 数据
│   ├── components/
│   │   ├── Chart.tsx                   # ECharts 封装组件
│   │   ├── NumberAnimation.tsx         # 数字动画组件
│   │   └── AutoFit.tsx                 # 自适应布局组件
│   ├── pages/
│   │   └── DataV/
│   │       ├── index.tsx               # 大屏主页面入口
│   │       ├── map/
│   │       │   ├── index.tsx           # 地图容器
│   │       │   ├── Scene.tsx           # 3D 场景
│   │       │   ├── ShandongMap.tsx     # 山东省 3D 地图
│   │       │   ├── ScatterPoints.tsx   # 散点标记
│   │       │   └── Lights.tsx          # 光照设置
│   │       ├── panel/
│   │       │   ├── index.tsx           # 面板容器
│   │       │   ├── Header.tsx          # 顶部标题栏
│   │       │   ├── LeftPanel.tsx       # 左侧面板
│   │       │   └── RightPanel.tsx      # 右侧面板
│   │       └── stores/
│   │           └── index.ts            # Zustand store
│   ├── api/
│   │   └── index.ts                    # API 接口封装
│   ├── hooks/
│   │   └── useAutoFit.ts               # 自适应 Hook
│   ├── styles/
│   │   └── global.css                  # 全局样式
│   ├── App.tsx                         # 应用入口
│   └── main.tsx                        # 主入口
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Task 1: 项目初始化与技术栈配置

**Files:**
- Create: `sjg-datav/package.json`
- Create: `sjg-datav/vite.config.ts`
- Create: `sjg-datav/tsconfig.json`
- Create: `sjg-datav/tsconfig.app.json`
- Create: `sjg-datav/tsconfig.node.json`
- Create: `sjg-datav/index.html`
- Create: `sjg-datav/src/main.tsx`
- Create: `sjg-datav/src/App.tsx`
- Create: `sjg-datav/src/styles/global.css`

- [ ] **Step 1: 创建项目目录和 package.json**

```bash
mkdir -p sjg-datav/src/{assets,components,pages/DataV/{map,panel,stores},api,hooks,styles}
mkdir -p sjg-datav/public
```

```json
// sjg-datav/package.json
{
  "name": "sjg-datav",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@react-three/drei": "^10.7.6",
    "@react-three/fiber": "^9.4.2",
    "autofit.js": "^3.2.8",
    "echarts": "^6.0.0",
    "gsap": "^3.13.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "styled-components": "^6.1.19",
    "swr": "^2.9.0",
    "three": "^0.183.2",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@types/react": "^19.1.16",
    "@types/react-dom": "^19.1.9",
    "@types/three": "^0.181.0",
    "@vitejs/plugin-react": "^6.0.0",
    "typescript": "~5.9.3",
    "vite": "^8.0.0"
  }
}
```

- [ ] **Step 2: 创建 Vite 配置**

```typescript
// sjg-datav/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

- [ ] **Step 3: 创建 TypeScript 配置**

```json
// sjg-datav/tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

```json
// sjg-datav/tsconfig.app.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

```json
// sjg-datav/tsconfig.node.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: 创建 HTML 入口**

```html
<!-- sjg-datav/index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>齐鲁文化数据大屏</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: 创建全局样式**

```css
/* sjg-datav/src/styles/global.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #1a1a2e;
  color: #ffffff;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.8);
}
```

- [ ] **Step 6: 创建应用入口文件**

```tsx
// sjg-datav/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

```tsx
// sjg-datav/src/App.tsx
import DataV from './pages/DataV'

function App() {
  return <DataV />
}

export default App
```

- [ ] **Step 7: 安装依赖并验证**

```bash
cd sjg-datav
npm install
npm run dev
```

Expected: 开发服务器启动在 http://localhost:5180

- [ ] **Step 8: 提交代码**

```bash
git add sjg-datav/
git commit -m "feat(datav): 初始化项目结构和技术栈配置"
```

---

## Task 2: 获取并配置 GeoJSON 数据

**Files:**
- Create: `sjg-datav/src/assets/shandong.json`

- [ ] **Step 1: 下载山东省 GeoJSON 数据**

```bash
curl -o sjg-datav/src/assets/shandong.json "https://geo.datav.aliyun.com/areas_v3/bound/370000_full.json"
```

- [ ] **Step 2: 验证 GeoJSON 文件**

```bash
# 检查文件是否存在且有效
cat sjg-datav/src/assets/shandong.json | head -20
```

Expected: 看到 GeoJSON 格式的山东省地图数据

- [ ] **Step 3: 创建类型定义**

```typescript
// sjg-datav/src/types/geojson.d.ts
export interface GeoJSONFeature {
  type: 'Feature'
  properties: {
    adcode: number
    name: string
    center: [number, number]
    centroid: [number, number]
    childrenNum: number
    level: string
    parent: { adcode: number }
    subFeatureIndex: number
    acroutes: number[]
  }
  geometry: {
    type: 'MultiPolygon'
    coordinates: number[][][][]
  }
}

export interface GeoJSONData {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}
```

- [ ] **Step 4: 提交代码**

```bash
git add sjg-datav/src/assets/shandong.json sjg-datav/src/types/
git commit -m "feat(datav): 添加山东省 GeoJSON 地图数据"
```

---

## Task 3: 创建 Zustand 状态管理

**Files:**
- Create: `sjg-datav/src/pages/DataV/stores/index.ts`

- [ ] **Step 1: 创建 Zustand store**

```typescript
// sjg-datav/src/pages/DataV/stores/index.ts
import { create } from 'zustand'

interface DataVStore {
  // 数据状态
  poets: any[]
  poems: any[]
  spots: any[]
  dynasties: any[]

  // 加载状态
  loading: {
    poets: boolean
    poems: boolean
    spots: boolean
    dynasties: boolean
  }

  // 操作
  setPoets: (poets: any[]) => void
  setPoems: (poems: any[]) => void
  setSpots: (spots: any[]) => void
  setDynasties: (dynasties: any[]) => void
  setLoading: (key: keyof DataVStore['loading'], value: boolean) => void
}

export const useDataVStore = create<DataVStore>((set) => ({
  // 初始状态
  poets: [],
  poems: [],
  spots: [],
  dynasties: [],

  loading: {
    poets: false,
    poems: false,
    spots: false,
    dynasties: false
  },

  // 操作
  setPoets: (poets) => set({ poets }),
  setPoems: (poems) => set({ poems }),
  setSpots: (spots) => set({ spots }),
  setDynasties: (dynasties) => set({ dynasties }),
  setLoading: (key, value) => set((state) => ({
    loading: { ...state.loading, [key]: value }
  }))
}))
```

- [ ] **Step 2: 提交代码**

```bash
git add sjg-datav/src/pages/DataV/stores/
git commit -m "feat(datav): 创建 Zustand 状态管理 store"
```

---

## Task 4: 创建 API 接口封装

**Files:**
- Create: `sjg-datav/src/api/index.ts`

- [ ] **Step 1: 创建 API 接口封装**

```typescript
// sjg-datav/src/api/index.ts
import useSWR from 'swr'

const BASE_URL = '/api/public'

// 通用 fetcher
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()
  if (data.code !== 200) {
    throw new Error(data.message || '请求失败')
  }
  return data.data
}

// API 接口
export const api = {
  // 获取诗人列表
  getPoets: () => fetcher(`${BASE_URL}/poets`),

  // 获取诗词列表
  getPoems: () => fetcher(`${BASE_URL}/poems`),

  // 获取景点列表
  getSpots: () => fetcher(`${BASE_URL}/spots`),

  // 获取事件列表
  getEvents: () => fetcher(`${BASE_URL}/events`),

  // 获取朝代列表
  getDynasties: () => fetcher(`${BASE_URL}/dynasties`)
}

// SWR Hooks
export function usePoets() {
  const { data, error, isLoading } = useSWR('poets', api.getPoets)
  return {
    poets: data || [],
    isLoading,
    error
  }
}

export function usePoems() {
  const { data, error, isLoading } = useSWR('poems', api.getPoems)
  return {
    poems: data || [],
    isLoading,
    error
  }
}

export function useSpots() {
  const { data, error, isLoading } = useSWR('spots', api.getSpots)
  return {
    spots: data || [],
    isLoading,
    error
  }
}

export function useDynasties() {
  const { data, error, isLoading } = useSWR('dynasties', api.getDynasties)
  return {
    dynasties: data || [],
    isLoading,
    error
  }
}
```

- [ ] **Step 2: 提交代码**

```bash
git add sjg-datav/src/api/
git commit -m "feat(datav): 创建 API 接口封装和 SWR Hooks"
```

---

## Task 5: 创建自适应布局组件

**Files:**
- Create: `sjg-datav/src/hooks/useAutoFit.ts`
- Create: `sjg-datav/src/components/AutoFit.tsx`

- [ ] **Step 1: 创建自适应 Hook**

```typescript
// sjg-datav/src/hooks/useAutoFit.ts
import { useEffect, useRef } from 'react'
import autofit from 'autofit.js'

export function useAutoFit(designWidth = 1920, designHeight = 1080) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      autofit.init({
        dw: designWidth,
        dh: designHeight,
        el: ref.current,
        resize: true
      })
    }

    return () => {
      autofit.off()
    }
  }, [designWidth, designHeight])

  return ref
}
```

- [ ] **Step 2: 创建自适应布局组件**

```tsx
// sjg-datav/src/components/AutoFit.tsx
import { ReactNode } from 'react'
import styled from 'styled-components'
import { useAutoFit } from '../hooks/useAutoFit'

const Wrapper = styled.div`
  width: 1920px;
  height: 1080px;
  transform-origin: left top;
`

interface AutoFitProps {
  children: ReactNode
  designWidth?: number
  designHeight?: number
}

export default function AutoFit({
  children,
  designWidth = 1920,
  designHeight = 1080
}: AutoFitProps) {
  const ref = useAutoFit(designWidth, designHeight)

  return (
    <div
      ref={ref}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <Wrapper>
        {children}
      </Wrapper>
    </div>
  )
}
```

- [ ] **Step 3: 提交代码**

```bash
git add sjg-datav/src/hooks/ sjg-datav/src/components/AutoFit.tsx
git commit -m "feat(datav): 创建自适应布局组件"
```

---

## Task 6: 创建 ECharts 封装组件

**Files:**
- Create: `sjg-datav/src/components/Chart.tsx`

- [ ] **Step 1: 创建 Chart 组件**

```tsx
// sjg-datav/src/components/Chart.tsx
import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { BarChart, PieChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必要的组件
echarts.use([
  BarChart,
  PieChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer
])

interface ChartProps {
  option: echarts.EChartsOption
  style?: React.CSSProperties
  className?: string
}

export default function Chart({ option, style, className }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      // 初始化图表
      chartInstanceRef.current = echarts.init(chartRef.current)

      // 设置配置项
      chartInstanceRef.current.setOption(option)

      // 响应式调整
      const handleResize = () => {
        chartInstanceRef.current?.resize()
      }

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chartInstanceRef.current?.dispose()
      }
    }
  }, [option])

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '100%', ...style }}
      className={className}
    />
  )
}
```

- [ ] **Step 2: 提交代码**

```bash
git add sjg-datav/src/components/Chart.tsx
git commit -m "feat(datav): 创建 ECharts 封装组件"
```

---

## Task 7: 创建数字动画组件

**Files:**
- Create: `sjg-datav/src/components/NumberAnimation.tsx`

- [ ] **Step 1: 创建数字动画组件**

```tsx
// sjg-datav/src/components/NumberAnimation.tsx
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import gsap from 'gsap'

const NumberWrapper = styled.div`
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

interface NumberAnimationProps {
  endValue: number
  duration?: number
  suffix?: string
  prefix?: string
  style?: React.CSSProperties
}

export default function NumberAnimation({
  endValue,
  duration = 2,
  suffix = '',
  prefix = '',
  style
}: NumberAnimationProps) {
  const numberRef = useRef<HTMLSpanElement>(null)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const obj = { value: 0 }

    gsap.to(obj, {
      value: endValue,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        setDisplayValue(Math.round(obj.value))
      }
    })

    return () => {
      gsap.killTweensOf(obj)
    }
  }, [endValue, duration])

  return (
    <NumberWrapper style={style}>
      {prefix}
      <span ref={numberRef}>{displayValue}</span>
      {suffix}
    </NumberWrapper>
  )
}
```

- [ ] **Step 2: 提交代码**

```bash
git add sjg-datav/src/components/NumberAnimation.tsx
git commit -m "feat(datav): 创建数字动画组件"
```

---

## Task 8: 创建 3D 地图组件

**Files:**
- Create: `sjg-datav/src/pages/DataV/map/Lights.tsx`
- Create: `sjg-datav/src/pages/DataV/map/ShandongMap.tsx`
- Create: `sjg-datav/src/pages/DataV/map/ScatterPoints.tsx`
- Create: `sjg-datav/src/pages/DataV/map/Scene.tsx`
- Create: `sjg-datav/src/pages/DataV/map/index.tsx`

- [ ] **Step 1: 创建光照组件**

```tsx
// sjg-datav/src/pages/DataV/map/Lights.tsx
export default function Lights() {
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.4} />

      {/* 主光源 */}
      <directionalLight
        position={[100, 100, 50]}
        intensity={0.8}
        castShadow
      />

      {/* 补光 */}
      <directionalLight
        position={[-100, 50, -50]}
        intensity={0.3}
      />

      {/* 点光源 */}
      <pointLight
        position={[0, 100, 0]}
        intensity={0.5}
        distance={500}
      />
    </>
  )
}
```

- [ ] **Step 2: 创建山东省 3D 地图组件**

```tsx
// sjg-datav/src/pages/DataV/map/ShandongMap.tsx
import { useMemo } from 'react'
import * as THREE from 'three'
import { GeoJSONData } from '../../../types/geojson'
import shandongData from '../../../assets/shandong.json'

export default function ShandongMap() {
  const geometries = useMemo(() => {
    const data = shandongData as GeoJSONData
    const shapes: THREE.Shape[] = []

    data.features.forEach((feature) => {
      feature.geometry.coordinates.forEach((polygon) => {
        polygon.forEach((ring) => {
          const shape = new THREE.Shape()
          ring.forEach((coord, index) => {
            // 将经纬度转换为 3D 坐标
            const x = (coord[0] - 117) * 10
            const y = (coord[1] - 36) * 10

            if (index === 0) {
              shape.moveTo(x, y)
            } else {
              shape.lineTo(x, y)
            }
          })
          shapes.push(shape)
        })
      })
    })

    return shapes
  }, [])

  return (
    <group>
      {geometries.map((shape, index) => {
        const extrudeSettings = {
          depth: 2,
          bevelEnabled: true,
          bevelThickness: 0.5,
          bevelSize: 0.3,
          bevelSegments: 3
        }

        return (
          <mesh key={index} position={[0, 0, 0]} castShadow receiveShadow>
            <extrudeGeometry args={[shape, extrudeSettings]} />
            <meshStandardMaterial
              color="#16213e"
              metalness={0.3}
              roughness={0.7}
              emissive="#0f3460"
              emissiveIntensity={0.2}
            />
          </mesh>
        )
      })}
    </group>
  )
}
```

- [ ] **Step 3: 创建散点标记组件**

```tsx
// sjg-datav/src/pages/DataV/map/ScatterPoints.tsx
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useSpots } from '../../../api'

export default function ScatterPoints() {
  const { spots, isLoading } = useSpots()
  const [hoveredSpot, setHoveredSpot] = useState<any>(null)

  if (isLoading || !spots.length) {
    return null
  }

  return (
    <group>
      {spots.map((spot: any) => {
        // 将经纬度转换为 3D 坐标
        const x = (parseFloat(spot.longitude) - 117) * 10
        const y = (parseFloat(spot.latitude) - 36) * 10
        const z = 3

        return (
          <group key={spot.id} position={[x, y, z]}>
            {/* 散点 */}
            <mesh
              onPointerOver={() => setHoveredSpot(spot)}
              onPointerOut={() => setHoveredSpot(null)}
            >
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshStandardMaterial
                color="#4facfe"
                emissive="#00f2fe"
                emissiveIntensity={0.5}
              />
            </mesh>

            {/* 悬浮提示 */}
            {hoveredSpot?.id === spot.id && (
              <Html distanceFactor={10}>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  border: '1px solid #4facfe'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {spot.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#ccc' }}>
                    {spot.region}
                  </div>
                </div>
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}
```

- [ ] **Step 4: 创建 3D 场景组件**

```tsx
// sjg-datav/src/pages/DataV/map/Scene.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import Lights from './Lights'
import ShandongMap from './ShandongMap'
import ScatterPoints from './ScatterPoints'

export default function Scene() {
  return (
    <Canvas
      flat
      shadows
      camera={{ position: [0, 0, 50], fov: 50, far: 1000, near: 0.1 }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#1a1a2e']} />

      <Lights />

      <ShandongMap />
      <ScatterPoints />

      <ContactShadows
        opacity={0.5}
        scale={100}
        blur={2}
        resolution={256}
        color="#000000"
      />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        zoomSpeed={0.5}
        minDistance={20}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  )
}
```

- [ ] **Step 5: 创建地图容器组件**

```tsx
// sjg-datav/src/pages/DataV/map/index.tsx
import styled from 'styled-components'
import Scene from './Scene'

const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`

export default function Map() {
  return (
    <MapWrapper>
      <Scene />
    </MapWrapper>
  )
}
```

- [ ] **Step 6: 提交代码**

```bash
git add sjg-datav/src/pages/DataV/map/
git commit -m "feat(datav): 创建 3D 地图组件（山东省轮廓 + 散点标记）"
```

---

## Task 9: 创建面板组件

**Files:**
- Create: `sjg-datav/src/pages/DataV/panel/Header.tsx`
- Create: `sjg-datav/src/pages/DataV/panel/LeftPanel.tsx`
- Create: `sjg-datav/src/pages/DataV/panel/RightPanel.tsx`
- Create: `sjg-datav/src/pages/DataV/panel/index.tsx`

- [ ] **Step 1: 创建 Header 组件**

```tsx
// sjg-datav/src/pages/DataV/panel/Header.tsx
import { useEffect, useState } from 'react'
import styled from 'styled-components'

const HeaderWrapper = styled.div`
  height: 80px;
  background: linear-gradient(180deg, rgba(26, 26, 46, 0.9) 0%, rgba(26, 26, 46, 0) 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.3);
`

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const TimeDisplay = styled.div`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
`

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <HeaderWrapper>
      <Title>齐鲁文化数据大屏</Title>
      <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
    </HeaderWrapper>
  )
}
```

- [ ] **Step 2: 创建左侧面板组件**

```tsx
// sjg-datav/src/pages/DataV/panel/LeftPanel.tsx
import styled from 'styled-components'
import Chart from '../../../components/Chart'
import { usePoets, usePoems } from '../../../api'

const PanelWrapper = styled.div`
  width: 400px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
`

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  padding: 16px;
  backdrop-filter: blur(10px);
  flex: 1;
`

const CardTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12px;
  padding-left: 12px;
  border-left: 4px solid #667eea;
`

export default function LeftPanel() {
  const { poets, isLoading: poetsLoading } = usePoets()
  const { poems, isLoading: poemsLoading } = usePoems()

  // 诗人排行榜数据（按诗词数量排序）
  const poetRankData = poets
    .map((poet: any) => {
      const poemCount = poems.filter(
        (poem: any) => poem.poetId === poet.id
      ).length
      return { name: poet.name, value: poemCount }
    })
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 10)

  const poetRankOption = {
    grid: {
      top: 10,
      bottom: 10,
      left: '15%',
      right: '15%'
    },
    xAxis: { show: false },
    yAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontSize: 12,
        color: '#fff'
      },
      data: poetRankData.map((item: any) => item.name),
      type: 'category',
      inverse: true
    },
    series: [
      {
        type: 'bar',
        data: poetRankData.map((item: any) => item.value),
        barWidth: 8,
        itemStyle: {
          borderRadius: 4,
          color: {
            type: 'linear',
            x: 1,
            y: 0,
            x2: 0,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' }
            ]
          }
        },
        showBackground: true,
        backgroundStyle: {
          borderRadius: 4,
          color: 'rgba(255, 255, 255, 0.1)'
        },
        label: {
          show: true,
          position: 'right',
          color: '#fff',
          fontSize: 12
        }
      }
    ],
    animationDuration: 1500,
    animationEasing: 'cubicOut'
  }

  return (
    <PanelWrapper>
      <Card>
        <CardTitle>诗人排行榜</CardTitle>
        {poetsLoading ? (
          <div style={{ color: '#fff', textAlign: 'center' }}>加载中...</div>
        ) : (
          <Chart option={poetRankOption} style={{ height: '300px' }} />
        )}
      </Card>

      <Card>
        <CardTitle>诗词精选</CardTitle>
        <div style={{
          height: '200px',
          overflow: 'hidden',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px',
          lineHeight: '1.8'
        }}>
          {poemsLoading ? (
            <div style={{ textAlign: 'center' }}>加载中...</div>
          ) : (
            poems.slice(0, 5).map((poem: any, index: number) => (
              <div key={poem.id} style={{ marginBottom: '12px' }}>
                <div style={{ color: '#667eea', fontWeight: 'bold' }}>
                  {poem.title}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                  {poem.content?.substring(0, 50)}...
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </PanelWrapper>
  )
}
```

- [ ] **Step 3: 创建右侧面板组件**

```tsx
// sjg-datav/src/pages/DataV/panel/RightPanel.tsx
import styled from 'styled-components'
import Chart from '../../../components/Chart'
import NumberAnimation from '../../../components/NumberAnimation'
import { usePoets, usePoems, useSpots, useDynasties } from '../../../api'

const PanelWrapper = styled.div`
  width: 400px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
`

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  padding: 16px;
  backdrop-filter: blur(10px);
`

const CardTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12px;
  padding-left: 12px;
  border-left: 4px solid #667eea;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`

const StatItem = styled.div`
  text-align: center;
  padding: 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
`

const StatLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8px;
`

export default function RightPanel() {
  const { poets } = usePoets()
  const { poems } = usePoems()
  const { spots } = useSpots()
  const { dynasties } = useDynasties()

  // 朝代分布数据
  const dynastyData = dynasties.map((dynasty: any) => {
    const poetCount = poets.filter(
      (poet: any) => poet.dynastyId === dynasty.id
    ).length
    return { name: dynasty.name, value: poetCount }
  }).filter((item: any) => item.value > 0)

  const dynastyPieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 位诗人 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: {
        color: '#fff',
        fontSize: 12
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#1a1a2e',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: dynastyData,
        color: ['#667eea', '#764ba2', '#4facfe', '#00f2fe', '#f093fb', '#f5576c']
      }
    ],
    animationDuration: 2000,
    animationEasing: 'cubicOut'
  }

  return (
    <PanelWrapper>
      <Card>
        <CardTitle>数据概览</CardTitle>
        <StatsGrid>
          <StatItem>
            <NumberAnimation endValue={poets.length} suffix=" 位" />
            <StatLabel>诗人总数</StatLabel>
          </StatItem>
          <StatItem>
            <NumberAnimation endValue={poems.length} suffix=" 首" />
            <StatLabel>诗词总数</StatLabel>
          </StatItem>
          <StatItem>
            <NumberAnimation endValue={spots.length} suffix=" 个" />
            <StatLabel>景点总数</StatLabel>
          </StatItem>
        </StatsGrid>
      </Card>

      <Card style={{ flex: 1 }}>
        <CardTitle>朝代分布</CardTitle>
        <Chart option={dynastyPieOption} style={{ height: '300px' }} />
      </Card>
    </PanelWrapper>
  )
}
```

- [ ] **Step 4: 创建面板容器组件**

```tsx
// sjg-datav/src/pages/DataV/panel/index.tsx
import styled from 'styled-components'
import Header from './Header'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'

const PanelWrapper = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  pointer-events: none;
`

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  pointer-events: auto;
`

export default function Panel() {
  return (
    <PanelWrapper>
      <Header />
      <ContentWrapper>
        <LeftPanel />
        <div style={{ flex: 1 }} />
        <RightPanel />
      </ContentWrapper>
    </PanelWrapper>
  )
}
```

- [ ] **Step 5: 提交代码**

```bash
git add sjg-datav/src/pages/DataV/panel/
git commit -m "feat(datav): 创建面板组件（Header + 左侧面板 + 右侧面板）"
```

---

## Task 10: 创建大屏主页面

**Files:**
- Create: `sjg-datav/src/pages/DataV/index.tsx`

- [ ] **Step 1: 创建大屏主页面**

```tsx
// sjg-datav/src/pages/DataV/index.tsx
import styled from 'styled-components'
import AutoFit from '../../components/AutoFit'
import Map from './map'
import Panel from './panel'

const DataVWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #1a1a2e;
  overflow: hidden;
`

export default function DataV() {
  return (
    <AutoFit>
      <DataVWrapper>
        {/* 3D 地图 */}
        <Map />

        {/* 面板覆盖层 */}
        <Panel />
      </DataVWrapper>
    </AutoFit>
  )
}
```

- [ ] **Step 2: 提交代码**

```bash
git add sjg-datav/src/pages/DataV/index.tsx
git commit -m "feat(datav): 创建大屏主页面入口"
```

---

## Task 11: 创建 SJG 悬浮按钮集成

**Files:**
- Modify: `display-v2/src/views/MapView.vue` (或对应的地图页面)

- [ ] **Step 1: 定位地图页面文件**

```bash
# 查找地图页面文件
find display-v2/src -name "*.vue" | xargs grep -l "map\|Map" | head -5
```

- [ ] **Step 2: 添加悬浮按钮**

在地图页面的 `<template>` 中添加：

```vue
<!-- 数据大屏悬浮按钮 -->
<a
  href="http://localhost:5180"
  target="_blank"
  class="datav-float-button"
  title="打开数据大屏"
>
  📊
</a>
```

在 `<style>` 中添加：

```css
.datav-float-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 1000;
}

.datav-float-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}
```

- [ ] **Step 3: 提交代码**

```bash
git add display-v2/src/views/MapView.vue
git commit -m "feat(datav): 添加数据大屏悬浮按钮入口"
```

---

## Task 12: 测试与优化

**Files:**
- Modify: `sjg-datav/vite.config.ts` (如需要)

- [ ] **Step 1: 启动后端服务**

```bash
cd backend
./mvnw spring-boot:run
```

- [ ] **Step 2: 启动 DataV 开发服务器**

```bash
cd sjg-datav
npm run dev
```

- [ ] **Step 3: 浏览器访问测试**

打开 http://localhost:5180，验证：
- [ ] 3D 地图正常显示
- [ ] 散点标记正常显示
- [ ] 面板布局正常
- [ ] 数字动画正常
- [ ] API 数据正常加载

- [ ] **Step 4: 测试悬浮按钮**

打开 http://localhost:5175，验证：
- [ ] 悬浮按钮显示在右下角
- [ ] 点击后新标签页打开数据大屏

- [ ] **Step 5: 性能优化（如需要）**

如果出现性能问题，可以：
1. 减少 GeoJSON 精度
2. 优化 Three.js 渲染
3. 使用 React.memo 优化组件

- [ ] **Step 6: 最终提交**

```bash
git add .
git commit -m "feat(datav): SJG DataV 数据大屏 MVP 完成"
```

---

## 完成检查清单

- [ ] 3D 地图正常渲染
- [ ] 散点标记正常显示
- [ ] 数字动画正常播放
- [ ] 图表正常显示
- [ ] API 数据正常加载
- [ ] 悬浮按钮正常工作
- [ ] 自适应布局正常
- [ ] 科技暗色风格正常

---

**计划完成时间**：2026-08-08
**下一步**：执行实现计划
