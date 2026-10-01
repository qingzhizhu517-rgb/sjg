import { useMemo } from 'react'
import styled from 'styled-components'
import Chart from '../../../components/Chart'
import NumberAnimation from '../../../components/NumberAnimation'
import { EmptyState, PanelCard, SkeletonBlock } from '../../../components/PanelKit'
import { ANIM, PALETTE, T, alpha, tooltipBase } from '../../../theme/chartTheme'
import type { DashboardView } from '../../../hooks/useDashboardData'

const Column = styled.div`
  width: 340px;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

/* ============ 数据概览 2×2 ============ */
const StatsGrid = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 8px;
`

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid var(--dv-line);
  background: ${alpha(T.gold, 0.04)};
`

const StatLabel = styled.span`
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--dv-ink-3);
`

const StatUnit = styled.span`
  font-size: 11px;
  color: var(--dv-ink-2);
  margin-left: 2px;
`

/* ============ 传世诗人榜 ============ */
const PoetList = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2px;
`

const PoetRow = styled.div`
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
`

const PoetRank = styled.span<{ $top: boolean }>`
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--dv-num);
  font-size: 11px;
  background: ${(p) => (p.$top ? 'var(--dv-vermilion)' : alpha(T.gold, 0.12))};
  color: ${(p) => (p.$top ? '#f5efe3' : 'var(--dv-gold)')};
`

const PoetCell = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
`

const PoetName = styled.span`
  font-family: var(--dv-serif);
  font-size: 13px;
  letter-spacing: 1.5px;
  color: var(--dv-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const PoetBarTrack = styled.span`
  display: block;
  height: 3px;
  background: ${alpha(T.gold, 0.1)};
`

const PoetBar = styled.span<{ $ratio: number }>`
  display: block;
  height: 100%;
  width: ${(p) => Math.max(4, p.$ratio * 100)}%;
  background: linear-gradient(90deg, ${alpha(T.gold, 0.35)}, var(--dv-gold-light));
`

const PoetCount = styled.span`
  font-family: var(--dv-num);
  font-size: 11px;
  color: var(--dv-ink-2);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`

interface RightPanelProps {
  view: DashboardView
  selectedDynastyId: number | null
  onSelectDynasty: (id: number | null) => void
  loading: boolean
}

export default function RightPanel({
  view,
  selectedDynastyId,
  onSelectDynasty,
  loading,
}: RightPanelProps) {
  const { poetRank, dynastyStats, totals } = view
  const maxRank = Math.max(1, ...poetRank.map((p) => p.value))

  const donutData = useMemo(
    () =>
      dynastyStats
        .filter((d) => d.poetCount > 0)
        .map((d) => ({ id: d.id, name: d.name, value: d.poetCount })),
    [dynastyStats],
  )

  const donutOption = useMemo(
    () => ({
      tooltip: {
        ...tooltipBase,
        trigger: 'item',
        formatter: '{b} · {c} 位诗人（{d}%）<br/><span style="opacity:.6">点击只看该朝代</span>',
      },
      legend: {
        orient: 'vertical',
        right: 0,
        top: 'center',
        itemWidth: 9,
        itemHeight: 9,
        itemGap: 6,
        textStyle: { color: T.ink2, fontSize: 11 },
      },
      series: [
        {
          type: 'pie',
          radius: ['46%', '70%'],
          center: ['34%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: { borderColor: T.bg, borderWidth: 2 },
          label: { show: false },
          labelLine: { show: false },
          data: donutData.map((d) => ({
            ...d,
            itemStyle: {
              color: PALETTE[donutData.indexOf(d) % PALETTE.length],
              opacity: selectedDynastyId == null || selectedDynastyId === d.id ? 1 : 0.28,
            },
          })),
        },
      ],
      animationDuration: ANIM.duration,
      animationEasing: ANIM.easing,
    }),
    [donutData, selectedDynastyId],
  )

  const handleDynastyClick = (p: { dataIndex?: number }) => {
    if (p.dataIndex == null) return
    const id = donutData[p.dataIndex]?.id
    if (id == null) return
    onSelectDynasty(id === selectedDynastyId ? null : id)
  }

  return (
    <Column>
      <PanelCard seal="览" title="数据概览" note={loading ? '' : '当前筛选范围'}>
        {loading ? (
          <SkeletonBlock rows={4} height={22} />
        ) : (
          <StatsGrid>
            <StatItem>
              <NumberAnimation endValue={totals.spots} />
              <StatLabel>
                文学景观<StatUnit>处</StatUnit>
              </StatLabel>
            </StatItem>
            <StatItem>
              <NumberAnimation endValue={totals.poets} />
              <StatLabel>
                文人大家<StatUnit>位</StatUnit>
              </StatLabel>
            </StatItem>
            <StatItem>
              <NumberAnimation endValue={totals.poems} />
              <StatLabel>
                传世诗篇<StatUnit>首</StatUnit>
              </StatLabel>
            </StatItem>
            <StatItem>
              <NumberAnimation endValue={totals.events} />
              <StatLabel>
                历史事件<StatUnit>则</StatUnit>
              </StatLabel>
            </StatItem>
          </StatsGrid>
        )}
      </PanelCard>

      <PanelCard seal="名" title="传世诗人榜" note={loading ? '' : `前 ${poetRank.length} 位`}>
        {loading ? (
          <SkeletonBlock rows={6} height={14} />
        ) : poetRank.length === 0 ? (
          <EmptyState message="当前筛选范围内没有诗作记录" />
        ) : (
          <PoetList>
            {poetRank.map((p, i) => (
              <PoetRow key={p.id}>
                <PoetRank $top={i < 3}>{i + 1}</PoetRank>
                <PoetCell>
                  <PoetName>{p.name}</PoetName>
                  <PoetBarTrack>
                    <PoetBar $ratio={p.value / maxRank} />
                  </PoetBarTrack>
                </PoetCell>
                <PoetCount>{p.value} 首</PoetCount>
              </PoetRow>
            ))}
          </PoetList>
        )}
      </PanelCard>

      <PanelCard seal="朝" title="诗人朝代分布" note={loading ? '' : `${donutData.length} 个朝代`}>
        {loading ? (
          <SkeletonBlock rows={4} height={18} />
        ) : donutData.length === 0 ? (
          <EmptyState message="当前筛选范围内没有诗人数据" />
        ) : (
          <Chart option={donutOption} onEvents={{ click: handleDynastyClick }} />
        )}
      </PanelCard>
    </Column>
  )
}
