import styled from 'styled-components'
import Chart from '../../../components/Chart'
import NumberAnimation from '../../../components/NumberAnimation'
import SentimentCloud from '../../../components/SentimentCloud'
import { usePoets, usePoems, useSpots } from '../../../api'

const PanelWrapper = styled.div`
  width: 400px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
`

const Card = styled.div`
  position: relative;
  background: var(--dv-panel);
  border: 1px solid var(--dv-line);
  padding: 18px;
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  min-height: 0;
`

const CardCorner = styled.i`
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: var(--dv-gold);
  border-style: solid;
  pointer-events: none;
  &.tl { top: -1px; left: -1px; border-width: 1.5px 0 0 1.5px; }
  &.br { bottom: -1px; right: -1px; border-width: 0 1.5px 1.5px 0; }
`

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
`

const TitleSeal = styled.span`
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--dv-vermilion);
  color: #f5efe3;
  font-size: 13px;
  font-weight: 700;
  transform: rotate(-3deg);
  flex-shrink: 0;
`

const TitleText = styled.span`
  font-size: 16px;
  letter-spacing: 4px;
  color: var(--dv-ink);
`

/* ============ 数据概览 ============ */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`

const StatItem = styled.div`
  text-align: center;
  padding: 14px 6px;
  border: 1px solid var(--dv-line);
  background: rgba(201, 162, 39, 0.04);
`

const StatLabel = styled.div`
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--dv-ink-3);
  margin-top: 6px;
`

const StatValue = styled.span`
  font-size: 24px;
  color: var(--dv-gold-light);
  font-variant-numeric: tabular-nums;
`

const StatSuffix = styled.span`
  font-size: 12px;
  color: var(--dv-ink-2);
  margin-left: 2px;
`

/* ============ 传世诗人榜 ============ */
const PoetList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
`

const PoetRow = styled.div`
  display: grid;
  grid-template-columns: 20px 1fr auto;
  align-items: center;
  gap: 10px;
`

const PoetRank = styled.span<{ $top: boolean }>`
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  background: ${(p) => (p.$top ? 'var(--dv-vermilion)' : 'rgba(201,162,39,0.12)')};
  color: ${(p) => (p.$top ? '#f5efe3' : 'var(--dv-gold)')};
`

const PoetName = styled.span`
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--dv-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const PoetBar = styled.span<{ $ratio: number }>`
  display: inline-block;
  height: 4px;
  width: ${(p) => Math.max(8, p.$ratio * 100)}%;
  background: linear-gradient(90deg, rgba(201, 162, 39, 0.4), var(--dv-gold-light));
`

const PoetCount = styled.span`
  font-size: 12px;
  color: var(--dv-ink-2);
  font-variant-numeric: tabular-nums;
`

const DARK_PALETTE = ['#c9a227', '#ece4d0', '#7f9aa0', '#b98a6a', '#8f8a7a', '#c23a2b', '#a89f8f', '#6f928e']

export default function RightPanel() {
  const { poets } = usePoets()
  const { poems } = usePoems()
  const { spots } = useSpots()

  // 传世诗人榜: 按诗篇数
  const poetRank = poets
    .map((poet: any) => ({
      name: poet.name,
      value: poems.filter((p: any) => p.poetId === poet.id).length,
    }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 8)
  const maxRank = Math.max(1, ...poetRank.map((p: any) => p.value))

  // 朝代分布
  const dynastyNames: Record<number, string> = {
    1: '先秦', 2: '秦汉', 3: '魏晋', 4: '隋唐', 5: '宋', 9: '金', 6: '元', 7: '明', 8: '清',
  }
  const dynastyMap = new Map<string, number>()
  poets.forEach((poet: any) => {
    const name = dynastyNames[poet.dynastyId] || '其他'
    dynastyMap.set(name, (dynastyMap.get(name) || 0) + 1)
  })
  const dynastyOrder = ['先秦', '秦汉', '魏晋', '隋唐', '宋', '金', '元', '明', '清']
  const dynastyData = dynastyOrder
    .filter((n) => dynastyMap.has(n))
    .map((n) => ({ name: n, value: dynastyMap.get(n)! }))

  const dynastyPieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 位诗人 ({d}%)',
      backgroundColor: 'rgba(19,23,30,0.92)',
      borderColor: 'rgba(201,162,39,0.4)',
      textStyle: { color: '#ece4d0' },
    },
    legend: {
      orient: 'vertical',
      right: '2%',
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#b7ad92', fontSize: 11 },
    },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderColor: '#0f1216', borderWidth: 2 },
        label: { show: false },
        labelLine: { show: false },
        data: dynastyData,
        color: DARK_PALETTE,
      },
    ],
    animationDuration: 1400,
    animationEasing: 'cubicOut' as const,
  }

  // 情感词云
  const sentimentMap = new Map<string, number>()
  poems.forEach((poem: any) => {
    let tags: unknown = poem.sentimentTags
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags)
      } catch {
        tags = []
      }
    }
    ;(Array.isArray(tags) ? tags : []).forEach((tag: unknown) => {
      if (typeof tag === 'string' && tag) sentimentMap.set(tag, (sentimentMap.get(tag) || 0) + 1)
    })
  })
  const sentimentData = Array.from(sentimentMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 20)

  return (
    <PanelWrapper>
      <Card>
        <CardCorner className="tl" />
        <CardCorner className="br" />
        <CardTitle>
          <TitleSeal>览</TitleSeal>
          <TitleText>数据概览</TitleText>
        </CardTitle>
        <StatsGrid>
          <StatItem>
            <StatValue>
              <NumberAnimation endValue={spots.length} />
              <StatSuffix>处</StatSuffix>
            </StatValue>
            <StatLabel>文学景观</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>
              <NumberAnimation endValue={poets.length} />
              <StatSuffix>位</StatSuffix>
            </StatValue>
            <StatLabel>文人大家</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>
              <NumberAnimation endValue={poems.length} />
              <StatSuffix>首</StatSuffix>
            </StatValue>
            <StatLabel>传世诗篇</StatLabel>
          </StatItem>
        </StatsGrid>
      </Card>

      <Card>
        <CardCorner className="tl" />
        <CardCorner className="br" />
        <CardTitle>
          <TitleSeal>名</TitleSeal>
          <TitleText>传世诗人榜</TitleText>
        </CardTitle>
        <PoetList>
          {poetRank.map((p: any, i: number) => (
            <PoetRow key={p.name}>
              <PoetRank $top={i < 3}>{i + 1}</PoetRank>
              <div>
                <PoetName>{p.name}</PoetName>
                <PoetBar $ratio={p.value / maxRank} />
              </div>
              <PoetCount>{p.value} 首</PoetCount>
            </PoetRow>
          ))}
        </PoetList>
      </Card>

      <Card>
        <CardCorner className="tl" />
        <CardCorner className="br" />
        <CardTitle>
          <TitleSeal>朝</TitleSeal>
          <TitleText>诗人朝代分布</TitleText>
        </CardTitle>
        <Chart option={dynastyPieOption} style={{ height: '190px' }} />
      </Card>

      <Card>
        <CardCorner className="tl" />
        <CardCorner className="br" />
        <CardTitle>
          <TitleSeal>情</TitleSeal>
          <TitleText>诗情词意</TitleText>
        </CardTitle>
        <SentimentCloud data={sentimentData} />
      </Card>
    </PanelWrapper>
  )
}
