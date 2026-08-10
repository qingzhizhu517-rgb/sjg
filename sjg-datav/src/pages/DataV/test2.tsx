import styled from 'styled-components'
import AutoFit from '../../components/AutoFit'

const DataVWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #1a1a2e;
  overflow: hidden;
`

export default function Test2() {
  return (
    <AutoFit>
      <DataVWrapper>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '32px'
        }}>
          <div>
            <h1>齐鲁文化数据大屏</h1>
            <p>AutoFit 组件测试</p>
          </div>
        </div>
      </DataVWrapper>
    </AutoFit>
  )
}
