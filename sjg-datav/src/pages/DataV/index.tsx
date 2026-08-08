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
