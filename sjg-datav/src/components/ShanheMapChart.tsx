import { useMemo } from 'react'
import styled from 'styled-components'
import Chart from './Chart'
import { EmptyState, SkeletonBlock } from './PanelKit'
import { SHANDONG_FEATURES } from '../theme/echartsSetup'
import { NINE_CITIES, YELLOW_RIVER_GEO } from '../config/yellowRiver'
import { ANIM, T, alpha, tooltipBase } from '../theme/chartTheme'
import { useElementSize } from '../hooks/useElementSize'
import type { DashboardFilter, DashboardView } from '../hooks/useDashboardData'

/* ============================================================
   地理比例与布局
   ============================================================ */

/** ECharts 默认 aspectScale = 0.75；这里用 cos(36.4°) 得到更接近真实的横纵比 */
const ASPECT_SCALE = 0.805

/** 顶部标题带占用高度（px），地图在这个高度之下才开始排布 */
const TITLE_BAND = 64
const SIDE_PAD = 14

interface Bounds {
  lonMin: number
  lonMax: number
  latMin: number
  latMax: number
}

/** 从 GeoJSON 现算经纬跨度，避免硬编码——数据换了布局自动跟随 */
const BOUNDS: Bounds = (() => {
  let lonMin = Infinity
  let lonMax = -Infinity
  let latMin = Infinity
  let latMax = -Infinity
  const walk = (node: unknown): void => {
    if (!Array.isArray(node)) return
    if (typeof node[0] === 'number') {
      const [lon, lat] = node as [number, number]
      if (lon < lonMin) lonMin = lon
      if (lon > lonMax) lonMax = lon
      if (lat < latMin) latMin = lat
      if (lat > latMax) latMax = lat
      return
    }
    node.forEach(walk)
  }
  SHANDONG_FEATURES.forEach((f) => walk(f.geometry.coordinates))
  return { lonMin, lonMax, latMin, latMax }
})()

/**
 * 地图在 geo 视图里的宽高比（aspect > 1 表示长边是宽）。
 * ECharts 的 layoutSize 语义（见 echarts/lib/coord/geo/geoCreator.js）：
 *   size = parsePercent(layoutSize, min(容器宽, 容器高))
 *   aspect > 1 → viewRect.width = size，高按 aspect 折算
 * **百分比是相对短边的**，所以在宽扁容器里写 '96%' 会只吃到短边，
 * 白白浪费掉横向空间——这正是原先地图只占中央栏约四成宽的根因。
 * 现在改为「按长边显式计算绝对像素」。
 */
const GEO_ASPECT = ((BOUNDS.lonMax - BOUNDS.lonMin) / (BOUNDS.latMax - BOUNDS.latMin)) * ASPECT_SCALE

/* ============================================================
   样式
   ============================================================ */

const Shell = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

const CornerMarks = styled.div`
  position: absolute;
  inset: 8px;
  pointer-events: none;
  z-index: 2;
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    border-color: var(--dv-gold);
    border-style: solid;
  }
  &::before {
    top: 0;
    left: 0;
    border-width: 1.5px 0 0 1.5px;
  }
  &::after {
    bottom: 0;
    right: 0;
    border-width: 0 1.5px 1.5px 0;
  }
`

const TitleBand = styled.div`
  position: absolute;
  top: 16px;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  pointer-events: none;
  white-space: nowrap;
`

const TitleSeal = styled.span`
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--dv-vermilion);
  color: #f5efe3;
  font-family: var(--dv-serif);
  font-size: 17px;
  transform: rotate(-3deg);
`

const TitleText = styled.span`
  font-family: var(--dv-serif);
  font-size: 17px;
  letter-spacing: 5px;
  color: var(--dv-ink);
`

const TitleNote = styled.span`
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--dv-ink-3);
`

const Legend = styled.div`
  position: absolute;
  left: 22px;
  bottom: 16px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--dv-ink-3);
  pointer-events: none;
`

const LegendRow = styled.span`
  display: flex;
  align-items: center;
  gap: 7px;
`

const Swatch = styled.i<{ $color: string; $w: number; $h: number; $round?: boolean }>`
  display: inline-block;
  width: ${(p) => p.$w}px;
  height: ${(p) => p.$h}px;
  background: ${(p) => p.$color};
  border-radius: ${(p) => (p.$round ? '50%' : '0')};
`

const StateFill = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

/* ============================================================
   组件
   ============================================================ */

interface ShanheMapChartProps {
  view: DashboardView
  filter: DashboardFilter
  onSelectRegion: (region: string | null) => void
}

const sizeOfCount = (count: number) => Math.max(8, Math.min(26, 8 + count * 0.7))

export default function ShanheMapChart({ view, filter, onSelectRegion }: ShanheMapChartProps) {
  const [shellRef, size] = useElementSize<HTMLDivElement>()

  const option = useMemo(() => {
    const boxW = Math.max(0, size.width - SIDE_PAD * 2)
    const boxH = Math.max(0, size.height - TITLE_BAND - 18)
    if (boxW < 40 || boxH < 40) return null

    // 按长边显式求 fit，再换算 layoutSize（ECharts 里 size 即长边）
    const fitted = Math.min(boxW, boxH * GEO_ASPECT)
    const centerY = TITLE_BAND + boxH / 2

    const countMap = new Map(view.cities.map((c) => [c.name, c.count]))
    const cityPts = NINE_CITIES.map((c) => ({
      ...c,
      count: countMap.get(c.name) ?? 0,
    }))

    const isHighlighted = (name: string, count: number) =>
      filter.region != null ? name === filter.region : count > 0

    const active = cityPts.filter((c) => isHighlighted(c.name, c.count))
    const dimmed = cityPts.filter((c) => !isHighlighted(c.name, c.count))

    const spotDimmed = filter.region != null

    return {
      backgroundColor: 'transparent',
      tooltip: { ...tooltipBase, trigger: 'item' },
      geo: {
        map: 'shandong',
        roam: false,
        silent: true,
        aspectScale: ASPECT_SCALE,
        layoutCenter: ['50%', `${(centerY / size.height) * 100}%`],
        layoutSize: fitted,
        itemStyle: {
          areaColor: 'rgba(35,43,55,0.95)',
          borderColor: alpha(T.gold, 0.42),
          borderWidth: 1,
          shadowColor: alpha(T.gold, 0.2),
          shadowBlur: 18,
        },
        emphasis: { disabled: true },
        select: { disabled: true },
      },
      series: [
        // 1. 河道底衬：给黄河一点体量，避免细线在深底上断裂
        {
          type: 'lines',
          coordinateSystem: 'geo',
          polyline: true,
          silent: true,
          zlevel: 1,
          lineStyle: { color: alpha(T.gold, 0.13), width: 10, opacity: 0.9, cap: 'round' },
          data: [{ coords: YELLOW_RIVER_GEO }],
        },
        // 2. 河道主线 + 自西向东的流光（真实走向，非九城直连）
        {
          type: 'lines',
          coordinateSystem: 'geo',
          polyline: true,
          silent: true,
          zlevel: 2,
          effect: {
            show: true,
            period: 7,
            trailLength: 0.22,
            symbol: 'circle',
            symbolSize: 4.5,
            color: T.goldLight,
          },
          lineStyle: { color: alpha(T.gold, 0.8), width: 2, opacity: 0.85, cap: 'round' },
          data: [{ coords: YELLOW_RIVER_GEO }],
        },
        // 3. 全域景观散点
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 3,
          silent: true,
          symbolSize: 3,
          itemStyle: { color: alpha(T.teal, spotDimmed ? 0.24 : 0.5) },
          data: view.mapSpots.map((s) => [s.lon, s.lat]),
        },
        // 4. 未被选中的城市：静态暗点，保留空间参照
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 4,
          silent: true,
          data: dimmed.map((c) => ({
            name: c.name,
            value: [c.lon, c.lat],
            symbolSize: sizeOfCount(c.count) * 0.8,
            itemStyle: {
              color: alpha(T.gold, 0.28),
              borderColor: alpha(T.gold, 0.5),
              borderWidth: 1,
            },
          })),
        },
        // 5. 选中的城市：呼吸点 + 标签，可点击切换筛选
        {
          type: 'effectScatter',
          coordinateSystem: 'geo',
          zlevel: 5,
          rippleEffect: { brushType: 'stroke', scale: 3.2, period: 4.5 },
          label: {
            show: true,
            position: 'right',
            distance: 7,
            formatter: (p: { name: string; data: { count: number } }) =>
              `{a|${p.name}}\n{b|${p.data.count} 处}`,
            rich: {
              a: { color: T.ink, fontSize: 13, lineHeight: 18, fontFamily: 'var(--dv-serif)' },
              b: { color: T.ink3, fontSize: 10, lineHeight: 14 },
            },
          },
          emphasis: { scale: 1.35 },
          data: active.map((c) => ({
            name: c.name,
            value: [c.lon, c.lat],
            count: c.count,
            symbolSize: sizeOfCount(c.count),
            itemStyle: {
              color: c.name === filter.region ? T.goldLight : c.estuary ? T.vermilion : T.gold,
              shadowColor: alpha(T.gold, 0.55),
              shadowBlur: 12,
            },
          })),
        },
      ],
      animationDuration: ANIM.duration,
      animationEasing: ANIM.easing,
    }
  }, [size.width, size.height, view.cities, view.mapSpots, filter.region])

  const handleClick = (p: { name?: string }) => {
    if (!p.name) return
    onSelectRegion(p.name === filter.region ? null : p.name)
  }

  return (
    <Shell ref={shellRef}>
      <TitleBand>
        <TitleSeal>图</TitleSeal>
        <TitleText>山河图志 · 沿黄九城文学景观</TitleText>
        <TitleNote>
          {filter.region ? `已选 ${filter.region} · 再点一次取消` : '点击城市节点可筛选全屏'}
        </TitleNote>
      </TitleBand>
      <CornerMarks />
      <Legend>
        <LegendRow>
          <Swatch $w={16} $h={2.5} $color={alpha(T.gold, 0.8)} />
          黄河故道（自西向东）
        </LegendRow>
        <LegendRow>
          <Swatch $w={8} $h={8} $round $color={T.gold} />
          沿黄九城 · 点越大景观越多
        </LegendRow>
        <LegendRow>
          <Swatch $w={8} $h={8} $round $color={T.vermilion} />
          东营 · 黄河入海口
        </LegendRow>
      </Legend>

      {option == null ? (
        <StateFill>
          <SkeletonBlock rows={4} height={20} />
        </StateFill>
      ) : view.mapSpots.length === 0 && view.cities.every((c) => c.count === 0) ? (
        <StateFill>
          <EmptyState message="当前筛选范围内没有带坐标的景观数据" />
        </StateFill>
      ) : (
        <Chart option={option} onEvents={{ click: handleClick }} />
      )}
    </Shell>
  )
}
