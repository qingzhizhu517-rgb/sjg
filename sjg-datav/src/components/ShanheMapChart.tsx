import { useEffect, useRef, useMemo } from 'react'
import styled from 'styled-components'
import * as echarts from 'echarts/core'
import { MapChart, EffectScatterChart, ScatterChart, LinesChart } from 'echarts/charts'
import { GeoComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import shandongData from '../assets/shandong.json'

echarts.use([MapChart, EffectScatterChart, ScatterChart, LinesChart, GeoComponent, TooltipComponent, CanvasRenderer])
;(echarts as any).registerMap('shandong', shandongData)

// 九城坐标(近似城址)与黄河流向: 菏泽入境 → 东营归海
const NINE_CITIES: Array<{ name: string; lon: number; lat: number }> = [
  { name: '菏泽', lon: 115.48, lat: 35.23 },
  { name: '济宁', lon: 116.59, lat: 35.41 },
  { name: '泰安', lon: 117.09, lat: 36.2 },
  { name: '聊城', lon: 115.98, lat: 36.46 },
  { name: '济南', lon: 117.12, lat: 36.65 },
  { name: '德州', lon: 116.36, lat: 37.44 },
  { name: '淄博', lon: 118.05, lat: 36.81 },
  { name: '滨州', lon: 117.97, lat: 37.38 },
  { name: '东营', lon: 118.67, lat: 37.43 },
]

interface ShanheMapProps {
  cities: Array<{ name: string; count: number }>
  spots: Array<{ name: string; longitude?: number | null; latitude?: number | null; region?: string }>
}

const MapShell = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

/* 卷轴四角印章式装饰 */
const CornerMarks = styled.div`
  position: absolute;
  inset: 10px;
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
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 14px;
  pointer-events: none;
  white-space: nowrap;
`

const TitleSeal = styled.span`
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--dv-vermilion);
  color: #f5efe3;
  font-weight: 700;
  font-size: 18px;
  transform: rotate(-3deg);
`

const TitleText = styled.span`
  font-size: 17px;
  letter-spacing: 6px;
  color: var(--dv-ink);
`

export default function ShanheMapChart({ cities, spots }: ShanheMapProps) {
  const shellRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  const spotPts = useMemo(
    () =>
      spots
        .filter((s) => typeof s.longitude === 'number' && typeof s.latitude === 'number')
        .map((s) => [s.longitude, s.latitude, s.name] as [number, number, string]),
    [spots],
  )

  const cityPts = useMemo(() => {
    const countMap = new Map(cities.map((c) => [c.name, c.count]))
    return NINE_CITIES.map((c) => ({
      ...c,
      count: countMap.get(c.name) || 0,
    }))
  }, [cities])

  useEffect(() => {
    const el = chartRef.current
    if (!el) return
    const chart = echarts.init(el)

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(19,23,30,0.92)',
        borderColor: 'rgba(201,162,39,0.4)',
        textStyle: { color: '#ece4d0', fontSize: 12 },
      },
      geo: {
        map: 'shandong',
        roam: false,
        layoutCenter: ['50%', '53%'],
        layoutSize: '96%',
        itemStyle: {
          areaColor: 'rgba(31,37,47,0.92)',
          borderColor: 'rgba(201,162,39,0.32)',
          borderWidth: 1,
          shadowColor: 'rgba(201,162,39,0.18)',
          shadowBlur: 12,
        },
        emphasis: { disabled: true },
        select: { disabled: true },
      },
      series: [
        // 黄河主线: 九城连成金线, 流光自西向东(菏泽→东营)
        {
          type: 'lines',
          coordinateSystem: 'geo',
          zlevel: 2,
          polyline: false,
          effect: {
            show: true,
            period: 5,
            trailLength: 0.32,
            symbol: 'arrow',
            symbolSize: 5,
            color: '#e5c96b',
          },
          lineStyle: {
            color: 'rgba(201,162,39,0.75)',
            width: 1.6,
            type: 'dashed',
            curveness: 0.18,
          },
          data: [{ coords: NINE_CITIES.map((c) => [c.lon, c.lat]) }],
        },
        // 全域景点: 淡青墨点
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 1,
          symbolSize: 2.6,
          itemStyle: { color: 'rgba(127,154,160,0.55)' },
          emphasis: { disabled: true },
          data: spotPts.map(([lon, lat]) => [lon, lat]),
          tooltip: { show: false },
        },
        // 九城节点: 金印, 大小随景观数; 东营(河口)朱砂
        {
          type: 'effectScatter',
          coordinateSystem: 'geo',
          zlevel: 3,
          rippleEffect: { brushType: 'stroke', scale: 3.2, period: 4 },
          label: {
            show: true,
            position: 'right',
            formatter: (p: any) => {
              const c = cityPts.find((x) => x.name === p.name)
              return `{a|${p.name}}\n{b|${c ? c.count : 0} 处景观}`
            },
            rich: {
              a: { color: '#ece4d0', fontSize: 13, fontWeight: 700, lineHeight: 18 },
              b: { color: '#b7ad92', fontSize: 10, lineHeight: 14 },
            },
          },
          data: cityPts.map((c) => ({
            name: c.name,
            value: [c.lon, c.lat, Math.max(6, Math.min(26, 8 + c.count * 0.8))],
            itemStyle: {
              color: c.name === '东营' ? '#c23a2b' : '#c9a227',
              shadowColor: 'rgba(201,162,39,0.5)',
              shadowBlur: 10,
            },
          })),
        },
      ],
    }

    chart.setOption(option)
    const ro = new ResizeObserver(() => chart.resize())
    ro.observe(el)

    return () => {
      ro.disconnect()
      chart.dispose()
    }
  }, [cityPts, spotPts])

  return (
    <MapShell ref={shellRef}>
      <TitleBand>
        <TitleSeal>图</TitleSeal>
        <TitleText>山河图志 · 沿黄九城文学景观</TitleText>
      </TitleBand>
      <CornerMarks />
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </MapShell>
  )
}