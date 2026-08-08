import styled from 'styled-components'
import Chart from '../../../components/Chart'
import { usePoets, usePoems } from '../../../api'

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
  flex: 1;
`

const CardTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12px;
  padding-left: 12px;
  border-left: 4px solid #667eea;
`

export default function LeftPanel() {
  const { poets, isLoading: poetsLoading } = usePoets()
  const { poems, isLoading: poemsLoading } = usePoems()

  // 诗人排行榜数据（按诗词数量排序）
  const poetRankData = poets
    .map((poet: any) => {
      const poemCount = poems.filter(
        (poem: any) => poem.poetId === poet.id
      ).length
      return { name: poet.name, value: poemCount }
    })
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 10)

  const poetRankOption = {
    grid: {
      top: 10,
      bottom: 10,
      left: '15%',
      right: '15%'
    },
    xAxis: { show: false },
    yAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontSize: 12,
        color: '#fff'
      },
      data: poetRankData.map((item: any) => item.name),
      type: 'category',
      inverse: true
    },
    series: [
      {
        type: 'bar',
        data: poetRankData.map((item: any) => item.value),
        barWidth: 8,
        itemStyle: {
          borderRadius: 4,
          color: {
            type: 'linear',
            x: 1,
            y: 0,
            x2: 0,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' }
            ]
          }
        },
        showBackground: true,
        backgroundStyle: {
          borderRadius: 4,
          color: 'rgba(255, 255, 255, 0.1)'
        },
        label: {
          show: true,
          position: 'right',
          color: '#fff',
          fontSize: 12
        }
      }
    ],
    animationDuration: 1500,
    animationEasing: 'cubicOut' as const
  }

  return (
    <PanelWrapper>
      <Card>
        <CardTitle>诗人排行榜</CardTitle>
        {poetsLoading ? (
          <div style={{ color: '#fff', textAlign: 'center' }}>加载中...</div>
        ) : (
          <Chart option={poetRankOption} style={{ height: '300px' }} />
        )}
      </Card>

      <Card>
        <CardTitle>诗词精选</CardTitle>
        <div style={{
          height: '200px',
          overflow: 'hidden',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px',
          lineHeight: '1.8'
        }}>
          {poemsLoading ? (
            <div style={{ textAlign: 'center' }}>加载中...</div>
          ) : (
            poems.slice(0, 5).map((poem: any) => (
              <div key={poem.id} style={{ marginBottom: '12px' }}>
                <div style={{ color: '#667eea', fontWeight: 'bold' }}>
                  {poem.title}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                  {poem.content?.substring(0, 50)}...
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </PanelWrapper>
  )
}
