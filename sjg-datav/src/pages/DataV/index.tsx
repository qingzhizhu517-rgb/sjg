import styled from 'styled-components'
import AutoFit from '../../components/AutoFit'
import GradientWaves from '../../components/GradientWaves'
import Panel from './panel'

const DataVWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: var(--dv-bg);
  overflow: hidden;
`

/* 背景氛围层: 深墨夜空 + 暗金浪, 静谧低存在感 */
const WavesLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
`

/* 面板与地图提升到背景层之上 */
const ContentLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
`

export default function DataV() {
  return (
    <AutoFit>
      <DataVWrapper>
        <WavesLayer>
          <GradientWaves
            horizonColor="#0f1216"
            waveColor="#8a6d2f"
            crestColor="#c9a227"
            speed={0.38}
            amplitude={1.4}
            waveScale={0.5}
            waveRatio={1.15}
            swell={20}
            turbulence={15}
            tilt={1.05}
            zoom={1.15}
            height={3.2}
            fogDepth={30}
            detail="low"
            brightness={0.62}
            opacity={0.4}
            mouseInteraction
            parallaxStrength={0.3}
            grain
            grainIntensity={0.04}
          />
        </WavesLayer>

        <ContentLayer>
          <Panel />
        </ContentLayer>
      </DataVWrapper>
    </AutoFit>
  )
}
