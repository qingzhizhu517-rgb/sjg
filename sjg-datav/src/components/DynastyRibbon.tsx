import styled from 'styled-components'
import { EmptyState, SkeletonBlock } from './PanelKit'
import { T, alpha } from '../theme/chartTheme'
import type { DynastyStat } from '../hooks/useDashboardData'

/**
 * 底部通栏：黄河文脉时间轴（先秦 → 清）。
 * 数据来自 /api/public/dynasties + poets/poems/events 的 dynastyId 聚合——
 * 刻意不用 /api/public/timeline，那个接口每个朝代要发 4 次查询且返回全量不分页，
 * 而这三份数据大屏本来就要拉。
 */

const RibbonCard = styled.section`
  position: relative;
  height: 148px;
  flex-shrink: 0;
  display: flex;
  align-items: stretch;
  gap: 22px;
  padding: 14px 20px 16px;
  background: var(--dv-panel);
  border: 1px solid var(--dv-line);
  backdrop-filter: blur(8px);
`

const Corner = styled.i`
  position: absolute;
  width: 13px;
  height: 13px;
  border-color: var(--dv-gold);
  border-style: solid;
  pointer-events: none;
  &.tl {
    top: -1px;
    left: -1px;
    border-width: 1.5px 0 0 1.5px;
  }
  &.br {
    bottom: -1px;
    right: -1px;
    border-width: 0 1.5px 1.5px 0;
  }
`

const RibbonTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-right: 20px;
  border-right: 1px solid var(--dv-line);
  flex-shrink: 0;
`

const RibbonSeal = styled.span`
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--dv-vermilion);
  color: #f5efe3;
  font-family: var(--dv-serif);
  font-size: 15px;
  transform: rotate(-3deg);
`

const RibbonTitleText = styled.span`
  font-family: var(--dv-serif);
  font-size: 13px;
  letter-spacing: 3px;
  color: var(--dv-ink);
  writing-mode: vertical-rl;
`

const RibbonHint = styled.span`
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--dv-ink-3);
  writing-mode: vertical-rl;
`

const Track = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`

const NodeRow = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: flex-end;
  gap: 6px;
`

const Node = styled.button<{ $active: boolean; $dim: boolean }>`
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  padding: 0 2px 4px;
  background: transparent;
  border: none;
  border-bottom: 1px solid transparent;
  cursor: pointer;
  opacity: ${(p) => (p.$dim ? 0.42 : 1)};
  transition: opacity 0.2s ease, background 0.2s ease;
  &:hover {
    opacity: 1;
    background: ${alpha(T.gold, 0.05)};
  }
`

const NodeBar = styled.span<{ $h: number; $active: boolean }>`
  display: block;
  width: 70%;
  max-width: 56px;
  height: ${(p) => p.$h}px;
  background: ${(p) =>
    p.$active
      ? `linear-gradient(180deg, ${T.goldLight}, ${T.vermilion})`
      : `linear-gradient(180deg, ${alpha(T.gold, 0.75)}, ${alpha(T.gold, 0.16)})`};
`

const NodeName = styled.span<{ $active: boolean }>`
  font-family: var(--dv-serif);
  font-size: 14px;
  letter-spacing: 2px;
  color: ${(p) => (p.$active ? 'var(--dv-gold-light)' : 'var(--dv-ink)')};
  white-space: nowrap;
`

const NodeCounts = styled.span`
  font-family: var(--dv-num);
  font-size: 10.5px;
  letter-spacing: 0.5px;
  color: var(--dv-ink-3);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`

const Baseline = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, ${alpha(T.gold, 0.35)}, transparent);
  margin-top: 3px;
`

interface DynastyRibbonProps {
  stats: DynastyStat[]
  selectedId: number | null
  onSelect: (id: number | null) => void
  loading: boolean
}

export default function DynastyRibbon({ stats, selectedId, onSelect, loading }: DynastyRibbonProps) {
  const maxPoems = Math.max(1, ...stats.map((s) => s.poemCount))

  return (
    <RibbonCard>
      <Corner className="tl" />
      <Corner className="br" />
      <RibbonTitle>
        <RibbonSeal>脉</RibbonSeal>
        <RibbonTitleText>黄河文脉</RibbonTitleText>
        <RibbonHint>点朝代可筛选</RibbonHint>
      </RibbonTitle>

      <Track>
        {loading ? (
          <SkeletonBlock rows={3} height={16} />
        ) : stats.length === 0 ? (
          <EmptyState message="暂无朝代数据" />
        ) : (
          <>
            <NodeRow>
              {stats.map((d) => {
                const active = selectedId === d.id
                const hasContent = d.poemCount + d.poetCount + d.eventCount > 0
                return (
                  <Node
                    key={d.id}
                    $active={active}
                    $dim={!hasContent}
                    onClick={() => onSelect(active ? null : d.id)}
                    title={`${d.name}：${d.poetCount} 位诗人 / ${d.poemCount} 首诗 / ${d.eventCount} 则事件`}
                  >
                    <NodeBar
                      $active={active}
                      $h={6 + Math.round((d.poemCount / maxPoems) * 44)}
                    />
                    <NodeName $active={active}>{d.name}</NodeName>
                    <NodeCounts>
                      {d.poemCount}诗 · {d.poetCount}人
                      {d.eventCount > 0 ? ` · ${d.eventCount}事` : ''}
                    </NodeCounts>
                  </Node>
                )
              })}
            </NodeRow>
            <Baseline />
          </>
        )}
      </Track>
    </RibbonCard>
  )
}
