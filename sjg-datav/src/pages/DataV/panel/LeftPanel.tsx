import { useMemo } from 'react'
import styled from 'styled-components'
import Chart from '../../../components/Chart'
import { EmptyState, PanelCard, SkeletonBlock } from '../../../components/PanelKit'
import SentimentCloud from '../../../components/SentimentCloud'
import {
  ANIM,
  T,
  alpha,
  axisLabelBase,
  barBackgroundStyle,
  goldGradient,
  gridBase,
  tooltipBase,
} from '../../../theme/chartTheme'
import type { DashboardView } from '../../../hooks/useDashboardData'

const Column = styled.div`
  width: 340px;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const CultureGrid = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 8px;
`

const CultureTile = styled.div<{ $highlight?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: 1px solid ${(p) => (p.$highlight ? alpha(T.gold, 0.45) : 'var(--dv-line)')};
  background: ${(p) => (p.$highlight ? alpha(T.gold, 0.09) : alpha(T.gold, 0.03))};
`

const CultureSeal = styled.span`
  font-family: var(--dv-serif);
  font-size: 19px;
  color: var(--dv-gold);
  line-height: 1.1;
`

const CultureName = styled.span`
  font-size: 11px;
  letter-spacing: 1.5px;
  color: var(--dv-ink-2);
`

const CultureCount = styled.span`
  font-family: var(--dv-num);
  font-size: 16px;
  color: var(--dv-ink);
  font-variant-numeric: tabular-nums;
`

const CULTURE_META: Array<{ key: string; name: string; seal: string }> = [
  { key: 'festival', name: '民俗节庆', seal: '节' },
  { key: 'craft', name: '非遗工艺', seal: '艺' },
  { key: 'literature', name: '民间文学', seal: '文' },
  { key: 'food_opera', name: '饮食戏曲', seal: '味' },
]

interface LeftPanelProps {
  view: DashboardView
  selectedRegion: string | null
  onSelectRegion: (region: string | null) => void
  loading: boolean
}

export default function LeftPanel({ view, selectedRegion, onSelectRegion, loading }: LeftPanelProps) {
  const { cities } = view
  const maxCount = Math.max(1, ...cities.map((c) => c.count))

  const cityOption = useMemo(
    () => ({
      grid: { ...gridBase, left: 4, right: 30, top: 2, bottom: 2 },
      tooltip: {
        ...tooltipBase,
        trigger: 'item',
        formatter: (p: { dataIndex: number }) => {
          const c = cities[p.dataIndex]
          return `${c.name} · ${c.count} 处景观<br/><span style="opacity:.6">点击只看该城</span>`
        },
      },
      xAxis: { type: 'value', show: false, max: maxCount * 1.08 },
      yAxis: {
        type: 'category',
        inverse: true,
        data: cities.map((c) => c.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          ...axisLabelBase,
          fontSize: 12,
          margin: 10,
          formatter: (value: string) => `{${value === selectedRegion ? 'on' : 'off'}|${value}}`,
          rich: {
            on: { color: T.vermilion, fontSize: 12 },
            off: { color: T.ink2, fontSize: 12 },
          },
        },
      },
      series: [
        {
          type: 'bar',
          barWidth: 8,
          showBackground: true,
          backgroundStyle: barBackgroundStyle,
          data: cities.map((c) => ({
            value: c.count,
            itemStyle: {
              color: c.name === selectedRegion ? T.vermilion : goldGradient(),
            },
          })),
          label: {
            show: true,
            position: 'right',
            fontSize: 12,
            color: T.ink,
            formatter: '{c}',
          },
          emphasis: { itemStyle: { color: T.goldLight } },
        },
      ],
      animationDuration: ANIM.duration,
      animationEasing: ANIM.easing,
    }),
    [cities, maxCount, selectedRegion],
  )

  const handleCityClick = (p: { dataIndex?: number }) => {
    if (p.dataIndex == null) return
    const name = cities[p.dataIndex]?.name
    if (!name) return
    onSelectRegion(name === selectedRegion ? null : name)
  }

  return (
    <Column>
      <PanelCard seal="城" title="九城景观分布" note={loading ? '' : `共 ${view.totals.spots} 处`}>
        {loading ? (
          <SkeletonBlock rows={6} height={14} />
        ) : (
          <Chart option={cityOption} onEvents={{ click: handleCityClick }} />
        )}
      </PanelCard>

      <PanelCard seal="脉" title="五脉文华" note="已发布条目">
        {loading ? (
          <SkeletonBlock rows={4} height={22} />
        ) : (
          <CultureGrid>
            {CULTURE_META.map((m) => (
              <CultureTile key={m.key} $highlight={(view.culture[m.key] ?? 0) > 0}>
                <CultureSeal>{m.seal}</CultureSeal>
                <CultureName>{m.name}</CultureName>
                <CultureCount>{view.culture[m.key] ?? '—'}</CultureCount>
              </CultureTile>
            ))}
            <CultureTile>
              <CultureSeal>诗</CultureSeal>
              <CultureName>古诗词</CultureName>
              <CultureCount>{view.totals.poems}</CultureCount>
            </CultureTile>
          </CultureGrid>
        )}
      </PanelCard>

      <PanelCard seal="情" title="诗情词意" note={loading ? '' : `${view.sentiment.length} 个标签`}>
        {loading ? (
          <SkeletonBlock rows={4} height={16} />
        ) : view.sentiment.length === 0 ? (
          <EmptyState message="当前筛选范围内没有情感标签" />
        ) : (
          <SentimentCloud data={view.sentiment} />
        )}
      </PanelCard>
    </Column>
  )
}
