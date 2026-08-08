import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { BarChart, PieChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必要的组件
echarts.use([
  BarChart,
  PieChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer
])

interface ChartProps {
  option: echarts.EChartsOption
  style?: React.CSSProperties
  className?: string
}

export default function Chart({ option, style, className }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      // 初始化图表
      chartInstanceRef.current = echarts.init(chartRef.current)

      // 设置配置项
      chartInstanceRef.current.setOption(option)

      // 响应式调整
      const handleResize = () => {
        chartInstanceRef.current?.resize()
      }

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chartInstanceRef.current?.dispose()
      }
    }
  }, [option])

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '100%', ...style }}
      className={className}
    />
  )
}
