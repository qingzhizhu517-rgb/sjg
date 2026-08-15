import styled from 'styled-components'
import AutoFit from '../../components/AutoFit'
import GradientWaves from '../../components/GradientWaves'
import Map from './map'
import Panel from './panel'

const DataVWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #1a1a2e;
  overflow: hidden;
`

/* 背景氛围层: 深蓝夜空 + 黄河金浪(项目定制配色), 衬在 3D 地图与面板之下 */
const WavesLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
`

/* 地图与面板提升到背景层之上 */
const ContentLayer = styled.div`
  position: relative;
  z-index: 1;
`

export default function DataV() {
  return (
    <AutoFit>
      <DataVWrapper>
        {/* 背景氛围: 黄河金浪 */}
        <WavesLayer>
          <GradientWaves
            horizonColor="#1a1a2e"
            waveColor="#c9a227"
            crestColor="#f0d98c"
            speed={0.5}
            amplitude={1.6}
            waveScale={0.5}
            waveRatio={1.15}
            swell={22}
            turbulence={16}
            tilt={1.05}
            zoom={1.15}
            height={3.2}
            fogDepth={26}
            detail="low"
            brightness={0.72}
            opacity={0.5}
            mouseInteraction
            parallaxStrength={0.35}
            grain
            grainIntensity={0.04}
          />
        </WavesLayer>

        <ContentLayer>
          {/* 3D 地图 */}
          <Map />

          {/* 面板覆盖层 */}
          <Panel />
        </ContentLayer>
      </DataVWrapper>
    </AutoFit>
  )
}
