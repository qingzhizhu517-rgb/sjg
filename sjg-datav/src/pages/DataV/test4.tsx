import styled from 'styled-components'
import AutoFit from '../../components/AutoFit'
import Header from './panel/Header'

const DataVWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #1a1a2e;
  overflow: hidden;
`

export default function Test4() {
  return (
    <AutoFit>
      <DataVWrapper>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Header />
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '24px'
          }}>
            测试 Header 组件
          </div>
        </div>
      </DataVWrapper>
    </AutoFit>
  )
}
