import styled from 'styled-components'
import Chart from '../../../components/Chart'
import NumberAnimation from '../../../components/NumberAnimation'
import { usePoets, usePoems, useSpots } from '../../../api'

const PanelWrapper = styled.div`
  width: 400px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
`

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  padding: 16px;
  backdrop-filter: blur(10px);
`

const CardTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12px;
  padding-left: 12px;
  border-left: 4px solid #667eea;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`

const StatItem = styled.div`
  text-align: center;
  padding: 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
`

const StatLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8px;
`

export default function RightPanel() {
  const { poets } = usePoets()
  const { poems } = usePoems()
  const { spots } = useSpots()

  // 朝代分布数据 - 按 dynastyId 分组
  const dynastyMap = new Map<number, number>()
  poets.forEach((poet: any) => {
    const count = dynastyMap.get(poet.dynastyId) || 0
    dynastyMap.set(poet.dynastyId, count + 1)
  })

  // 朝代名称映射
  const dynastyNames: Record<number, string> = {
    1: '先秦', 2: '秦汉', 3: '魏晋南北朝', 4: '唐代',
    5: '宋代', 6: '元代', 7: '明代', 8: '清代', 9: '近现代'
  }

  const dynastyData = Array.from(dynastyMap.entries())
    .map(([id, count]) => ({
      name: dynastyNames[id] || `朝代${id}`,
      value: count
    }))
    .sort((a, b) => b.value - a.value)

  const dynastyPieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 位诗人 ({d}%)'
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
        data: dynastyData,
        color: ['#667eea', '#764ba2', '#4facfe', '#00f2fe', '#f093fb', '#f5576c']
      }
    ],
    animationDuration: 2000,
    animationEasing: 'cubicOut' as const
  }

  return (
    <PanelWrapper>
      <Card>
        <CardTitle>数据概览</CardTitle>
        <StatsGrid>
          <StatItem>
            <NumberAnimation endValue={poets.length} suffix=" 位" />
            <StatLabel>诗人总数</StatLabel>
          </StatItem>
          <StatItem>
            <NumberAnimation endValue={poems.length} suffix=" 首" />
            <StatLabel>诗词总数</StatLabel>
          </StatItem>
          <StatItem>
            <NumberAnimation endValue={spots.length} suffix=" 个" />
            <StatLabel>景点总数</StatLabel>
          </StatItem>
        </StatsGrid>
      </Card>

      <Card style={{ flex: 1 }}>
        <CardTitle>朝代分布</CardTitle>
        <Chart option={dynastyPieOption} style={{ height: '300px' }} />
      </Card>
    </PanelWrapper>
  )
}
