import styled from 'styled-components'
import AutoFit from '../../components/AutoFit'
import Chart from '../../components/Chart'

const DataVWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #1a1a2e;
  overflow: hidden;
`

export default function Test6() {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: {
        color: '#fff',
        fontSize: 12
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#1a1a2e',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 35, name: '唐代' },
          { value: 28, name: '宋代' },
          { value: 20, name: '清代' },
          { value: 15, name: '明代' },
          { value: 12, name: '元代' }
        ],
        color: ['#667eea', '#764ba2', '#4facfe', '#00f2fe', '#f093fb']
      }
    ],
    animationDuration: 2000,
    animationEasing: 'cubicOut' as const
  }

  return (
    <AutoFit>
      <DataVWrapper>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1 style={{ color: '#fff', fontSize: '32px', marginBottom: '40px' }}>ECharts 测试</h1>
          <div style={{ width: '600px', height: '400px' }}>
            <Chart option={option} />
          </div>
        </div>
      </DataVWrapper>
    </AutoFit>
  )
}
