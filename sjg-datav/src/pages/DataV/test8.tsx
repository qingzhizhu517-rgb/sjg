import { useMemo } from 'react'
import styled from 'styled-components'
import AutoFit from '../../components/AutoFit'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { GeoJSONData } from '../../types/geojson'
import shandongData from '../../assets/shandong.json'

const DataVWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #1a1a2e;
  overflow: hidden;
`

function ShandongMap() {
  const geometries = useMemo(() => {
    const data = shandongData as GeoJSONData
    const shapes: THREE.Shape[] = []

    data.features.forEach((feature) => {
      feature.geometry.coordinates.forEach((polygon) => {
        polygon.forEach((ring) => {
          const shape = new THREE.Shape()
          ring.forEach((coord, index) => {
            // 将经纬度转换为 3D 坐标
            const x = (coord[0] - 118.767528) * 12
            const y = (coord[1] - 36.3896425) * 12

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
          bevelThickness: 0.2,
          bevelSize: 0.15,
          bevelSegments: 2,
        }

        return (
          <mesh key={index} position={[0, 0, 0]}>
            <extrudeGeometry args={[shape, extrudeSettings]} />
            <meshStandardMaterial
              color="#2d5aa0"
              emissive="#5b9bd5"
              emissiveIntensity={0.4}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export default function Test8() {
  return (
    <AutoFit>
      <DataVWrapper>
        <Canvas
          camera={{ position: [0, 10, 45], fov: 45 }}
          style={{ width: '100%', height: '100%' }}
        >
          <color attach="background" args={['#1a1a2e']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[50, 80, 60]} intensity={1} />
          <directionalLight position={[-50, 30, -30]} intensity={0.4} />
          <ShandongMap />
          <OrbitControls />
        </Canvas>
      </DataVWrapper>
    </AutoFit>
  )
}
