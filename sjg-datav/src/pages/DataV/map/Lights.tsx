export default function Lights() {
  return (
    <>
      {/* 环境光 - 增强亮度 */}
      <ambientLight intensity={0.6} />

      {/* 主光源 - 从上方照射 */}
      <directionalLight
        position={[50, 80, 60]}
        intensity={1.0}
        castShadow
      />

      {/* 补光 - 从侧面照射 */}
      <directionalLight
        position={[-50, 30, -30]}
        intensity={0.4}
      />

      {/* 点光源 - 在地图上方 */}
      <pointLight
        position={[0, 50, 0]}
        intensity={0.6}
        distance={300}
      />
    </>
  )
}
