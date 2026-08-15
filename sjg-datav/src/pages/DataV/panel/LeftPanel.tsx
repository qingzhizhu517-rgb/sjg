import styled from 'styled-components'
import Chart from '../../../components/Chart'
import { useSpots, usePoems, useCulturalCategories } from '../../../api'

/* ============ 面板基础样式(水墨青金) ============ */
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
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`

/* 四角金色折线装饰 */
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

const TitleNote = styled.span`
  margin-left: auto;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--dv-ink-3);
`

/* ============ 文化五类 bento ============ */
const CultureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 74px;
  gap: 10px;
  flex: 1;
  align-content: center;
`

const CultureTile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid var(--dv-line);
  background: rgba(201, 162, 39, 0.04);
`

const CultureSeal = styled.span`
  font-size: 20px;
  color: var(--dv-gold);
  font-weight: 700;
`

const CultureName = styled.span`
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--dv-ink-2);
`

const CultureCount = styled.span`
  font-size: 15px;
  color: var(--dv-ink);
  font-variant-numeric: tabular-nums;
`

const CULTURE_META: Array<{ key: string; name: string; seal: string }> = [
  { key: 'festival', name: '民俗节庆', seal: '节' },
  { key: 'craft', name: '非遗工艺', seal: '艺' },
  { key: 'literature', name: '民间文学', seal: '文' },
  { key: 'food_opera', name: '饮食戏曲', seal: '味' },
]

/* 古诗词单独大格(诗为齐鲁文脉主线) */
export default function LeftPanel() {
  const { spots } = useSpots()
  const { poems } = usePoems()
  const { categories } = useCulturalCategories()

  // 九城景观分布: 按 region 聚合
  const regionOrder = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '淄博', '滨州', '东营']
  const regionCount = new Map<string, number>()
  spots.forEach((s: any) => regionCount.set(s.region, (regionCount.get(s.region) || 0) + 1))
  const cityData = regionOrder.map((name) => ({ name, value: regionCount.get(name) || 0 }))

  const categoryMap = new Map(categories.map((c: any) => [c.category, c.count]))

  const cityBarOption = {
    grid: { top: 6, bottom: 6, left: 8, right: 34 },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category',
      data: cityData.map((d) => d.name).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#b7ad92', fontSize: 12, margin: 12 },
    },
    series: [
      {
        type: 'bar',
        data: cityData.map((d) => d.value).reverse(),
        barWidth: 9,
        showBackground: true,
        backgroundStyle: { color: 'rgba(201,162,39,0.07)' },
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: 'rgba(201,162,39,0.35)' },
              { offset: 1, color: '#e5c96b' },
            ],
          },
        },
        label: {
          show: true,
          position: 'right',
          color: '#ece4d0',
          fontSize: 12,
          formatter: '{c}',
        },
      },
    ],
    animationDuration: 1200,
    animationEasing: 'cubicOut' as const,
  }

  return (
    <PanelWrapper>
      <Card>
        <CardCorner className="tl" />
        <CardCorner className="br" />
        <CardTitle>
          <TitleSeal>城</TitleSeal>
          <TitleText>九城景观分布</TitleText>
          <TitleNote>共 {spots.length} 处</TitleNote>
        </CardTitle>
        <Chart option={cityBarOption} style={{ flex: 1, minHeight: 0 }} />
      </Card>

      <Card>
        <CardCorner className="tl" />
        <CardCorner className="br" />
        <CardTitle>
          <TitleSeal>脉</TitleSeal>
          <TitleText>五脉文华</TitleText>
          <TitleNote>已发布条目</TitleNote>
        </CardTitle>
        <CultureGrid>
          {CULTURE_META.map((m) => (
            <CultureTile key={m.key}>
              <CultureSeal>{m.seal}</CultureSeal>
              <CultureName>{m.name}</CultureName>
              <CultureCount>{categoryMap.get(m.key) ?? '—'}</CultureCount>
            </CultureTile>
          ))}
          <CultureTile style={{ gridColumn: 'span 2' }}>
            <CultureSeal>诗</CultureSeal>
            <CultureName>古诗词</CultureName>
            <CultureCount>{poems.length} 首</CultureCount>
          </CultureTile>
        </CultureGrid>
      </Card>
    </PanelWrapper>
  )
}
