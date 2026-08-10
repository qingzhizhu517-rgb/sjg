import styled from 'styled-components'
import AutoFit from '../../components/AutoFit'
import Panel from './panel'

const DataVWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #1a1a2e;
  overflow: hidden;
`

export default function Test3() {
  return (
    <AutoFit>
      <DataVWrapper>
        <Panel />
      </DataVWrapper>
    </AutoFit>
  )
}
