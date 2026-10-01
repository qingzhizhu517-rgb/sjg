import styled from 'styled-components'
import { PALETTE, alpha } from '../theme/chartTheme'

/**
 * 情感标签云（零依赖版）。
 * 原版依赖 echarts-wordcloud 插件，与 ECharts 6 的按需注册约定不兼容，
 * 故用 flex 排版实现：保留词频可视化的意图，无运行时额外依赖。
 *
 * 尺寸语义改为「撑满父容器」——原先默认 width=400/height=300，
 * 而卡片内可用宽度只有约 324px，导致右侧与底部被裁。
 */

interface SentimentCloudProps {
  data: Array<{ name: string; value: number }>
}

const CloudContainer = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  gap: 4px 14px;
  overflow: hidden;
`

const CloudTag = styled.span<{ $size: number; $color: string; $opacity: number }>`
  font-family: var(--dv-serif);
  font-size: ${(p) => p.$size}px;
  line-height: 1.25;
  font-weight: 400;
  color: ${(p) => p.$color};
  opacity: ${(p) => p.$opacity};
  letter-spacing: 1px;
  white-space: nowrap;
  cursor: default;
  transition: opacity 0.2s ease, transform 0.2s ease;
  &:hover {
    opacity: 1;
    transform: scale(1.08);
  }
`

const MoreTag = styled.span`
  font-size: 11px;
  color: var(--dv-ink-3);
  letter-spacing: 1px;
  align-self: flex-end;
`

/** 字号区间：卡片内高约 190px，11–24px 是既不挤爆又能体现词频的区间 */
const MIN_SIZE = 11
const MAX_SIZE = 24

export default function SentimentCloud({ data }: SentimentCloudProps) {
  if (!data.length) {
    return (
      <CloudContainer>
        <MoreTag>当前筛选下暂无情感标签</MoreTag>
      </CloudContainer>
    )
  }

  const max = Math.max(...data.map((d) => d.value), 1)
  const tags = data.map((d, i) => ({
    ...d,
    size: Math.round(MIN_SIZE + (d.value / max) * (MAX_SIZE - MIN_SIZE)),
    color: PALETTE[i % PALETTE.length],
    opacity: 0.6 + (d.value / max) * 0.4,
  }))

  return (
    <CloudContainer>
      {tags.map((t) => (
        <CloudTag
          key={t.name}
          $size={t.size}
          $color={t.color}
          $opacity={t.opacity}
          title={`${t.name} · ${t.value} 次`}
          style={t.size >= MAX_SIZE - 2 ? { textShadow: `0 0 14px ${alpha(t.color, 0.35)}` } : undefined}
        >
          {t.name}
        </CloudTag>
      ))}
    </CloudContainer>
  )
}
