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
