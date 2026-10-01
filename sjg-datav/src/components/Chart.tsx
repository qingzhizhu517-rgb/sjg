import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import '../theme/echartsSetup'
import type { EChartsCoreOption } from 'echarts/core'

export type ChartEventHandler = (params: {
  name?: string
  dataIndex?: number
  value?: unknown
  /** 原始数据项，用于携带自定义字段（如 dynastyId） */
  data?: unknown
}) => void

interface ChartProps {
  option: EChartsCoreOption
  style?: React.CSSProperties
  className?: string
  /** 图表事件 → 交互（如条形点击筛选城市） */
  onEvents?: Record<string, ChartEventHandler>
}

/**
 * ECharts 薄封装。
 *
 * 两个刻意的改动：
 * 1. 实例只初始化一次，option 变化走 setOption。原实现把 option 放进 init 的依赖里，
 *    而父组件每次渲染都新建 option 对象 → 每次数据到达都 dispose + init，入场动画反复重放。
 * 2. 尺寸监听改用 ResizeObserver。原实现挂在 window.resize 上，
 *    容器自身尺寸变化（左右栏收窄、AutoFit 缩放）时图表不会跟随。
 *    调用方仍需自己 useMemo 稳定 option，否则效果等同原实现。
 */
export default function Chart({ option, style, className, onEvents }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const handlersRef = useRef(onEvents)
  handlersRef.current = onEvents

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chart = echarts.init(el)
    chartRef.current = chart

    const eventNames = ['click', 'mouseover', 'mouseout'] as const
    const bound = eventNames.map((name) => {
      const handler = (params: unknown) => handlersRef.current?.[name]?.(params as never)
      chart.on(name, handler)
      return [name, handler] as const
    })

    const ro = new ResizeObserver(() => chart.resize())
    ro.observe(el)

    return () => {
      ro.disconnect()
      bound.forEach(([name, handler]) => chart.off(name, handler))
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true })
  }, [option])

  return <div ref={containerRef} style={{ width: '100%', height: '100%', ...style }} className={className} />
}
