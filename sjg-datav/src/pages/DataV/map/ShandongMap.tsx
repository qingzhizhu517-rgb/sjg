import { useMemo } from 'react'
import * as THREE from 'three'
import type { GeoJSONData } from '../../../types/geojson'
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
          bevelSegments: 3,
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
