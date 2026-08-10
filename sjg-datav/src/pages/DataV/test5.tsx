import styled from 'styled-components'
import AutoFit from '../../components/AutoFit'
import NumberAnimation from '../../components/NumberAnimation'

const DataVWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #1a1a2e;
  overflow: hidden;
`

export default function Test5() {
  return (
    <AutoFit>
      <DataVWrapper>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px'
        }}>
          <h1 style={{ color: '#fff', fontSize: '32px' }}>数字动画测试</h1>
          <div style={{ display: 'flex', gap: '40px' }}>
            <div style={{ textAlign: 'center' }}>
              <NumberAnimation endValue={126} suffix=" 位" />
              <div style={{ color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>诗人总数</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <NumberAnimation endValue={195} suffix=" 首" />
              <div style={{ color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>诗词总数</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <NumberAnimation endValue={70} suffix=" 个" />
              <div style={{ color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>景点总数</div>
            </div>
          </div>
        </div>
      </DataVWrapper>
    </AutoFit>
  )
}
