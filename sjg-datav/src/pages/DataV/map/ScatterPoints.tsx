import { useState } from 'react'
import { Html } from '@react-three/drei'
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
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    border: '1px solid #4facfe',
                  }}
                >
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
