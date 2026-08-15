import styled from 'styled-components'

/**
 * 情感标签云（零依赖版）
 * 说明: worktree 原版使用 ECharts wordCloud 系列, 但该系列需要额外的
 * echarts-wordcloud 插件(项目未安装, 且与 ECharts 6 的按需注册约定不兼容),
 * 故改写为 styled-components 标签云: 保留词频可视化意图, 无运行时依赖。
 * 颜色取自固定的莫兰迪柔和色板(非随机), 视觉稳定。
 */

interface SentimentCloudProps {
  data: Array<{ name: string; value: number }>
  width?: number
  height?: number
}

const CLOUD_COLORS = [
  '#a89fd1', '#8fb0a5', '#c9a96e', '#b98a8a', '#7f9cb3',
  '#b0915a', '#6f928e', '#9384ab', '#c4a265', '#b06f6f',
]

const CloudContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  align-content: center;
  gap: 10px 14px;
  overflow: hidden;
`

const CloudTag = styled.span<{ $size: number; $color: string; $opacity: number }>`
  font-size: ${(p) => p.$size}px;
  font-weight: 700;
  color: ${(p) => p.$color};
  opacity: ${(p) => p.$opacity};
  letter-spacing: 2px;
  cursor: default;
  transition: transform 0.2s ease, opacity 0.2s ease;
  &:hover {
    transform: scale(1.15);
    opacity: 1;
    text-shadow: 0 0 12px rgba(255, 255, 255, 0.35);
  }
`

export default function SentimentCloud({ data, width = 400, height = 300 }: SentimentCloudProps) {
  if (!data.length) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
        暂无情感标签数据
      </div>
    )
  }
  // 词频归一化 → 字号(14~34) 与透明度(0.55~1)
  const max = Math.max(...data.map((d) => d.value), 1)
  const tags = data.map((d, i) => ({
    ...d,
    size: 14 + Math.round((d.value / max) * 20),
    color: CLOUD_COLORS[i % CLOUD_COLORS.length],
    opacity: 0.55 + (d.value / max) * 0.45,
  }))

  return (
    <CloudContainer style={{ width, height }}>
      {tags.map((t) => (
        <CloudTag key={t.name} $size={t.size} $color={t.color} $opacity={t.opacity}>
          {t.name}
        </CloudTag>
      ))}
    </CloudContainer>
  )
}