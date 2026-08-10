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
      camera={{ position: [0, 10, 45], fov: 45, far: 1000, near: 0.1 }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#1a1a2e']} />

      <Lights />

      <ShandongMap />
      <ScatterPoints />

      <ContactShadows
        opacity={0.3}
        scale={80}
        blur={2}
        resolution={256}
        color="#000000"
      />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        zoomSpeed={0.5}
        minDistance={15}
        maxDistance={80}
        maxPolarAngle={Math.PI / 2.5}
      />
    </Canvas>
  )
}
