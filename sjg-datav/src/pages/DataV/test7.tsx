import styled from 'styled-components'
import AutoFit from '../../components/AutoFit'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

const DataVWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #1a1a2e;
  overflow: hidden;
`

function SimpleBox() {
  return (
    <mesh>
      <boxGeometry args={[10, 10, 2]} />
      <meshStandardMaterial color="#2d5aa0" emissive="#5b9bd5" emissiveIntensity={0.5} />
    </mesh>
  )
}

export default function Test7() {
  return (
    <AutoFit>
      <DataVWrapper>
        <Canvas
          camera={{ position: [0, 0, 30], fov: 45 }}
          style={{ width: '100%', height: '100%' }}
        >
          <color attach="background" args={['#1a1a2e']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <SimpleBox />
          <OrbitControls />
        </Canvas>
      </DataVWrapper>
    </AutoFit>
  )
}
