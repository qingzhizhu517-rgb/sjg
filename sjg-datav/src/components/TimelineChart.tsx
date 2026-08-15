import styled from 'styled-components'
import Chart from './Chart'

/**
 * 时间线/序列折线图
 * 说明: worktree 原版全量 import 'echarts' 并自行 init/resize/dispose,
 * 与项目既有的 Chart 封装(echarts/core 按需注册)重复; 改写为 Chart 的
 * 轻量配置组件, 保持 props 契约不变({ time, value, label? }[])。
 */

interface TimelineData {
  time: string
  value: number
  label?: string
}

interface TimelineChartProps {
  data: TimelineData[]
  title?: string
  width?: number
  height?: number
}

const Empty = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
`

export default function TimelineChart({ data, title = '时间轴', width = 600, height = 300 }: TimelineChartProps) {
  if (!data.length) {
    return <Empty style={{ width, height }}>暂无时间线数据</Empty>
  }
  const option = {
    title: {
      text: title,
      left: 'center',
      textStyle: { color: '#fff', fontSize: 14 }
    },
    tooltip: { trigger: 'axis', formatter: '{b}: {c}' },
    grid: { top: 40, bottom: 40, left: 40, right: 20 },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.time),
      axisLabel: { color: 'rgba(255,255,255,0.7)', rotate: 0, fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: 'rgba(255,255,255,0.7)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    series: [
      {
        data: data.map((item) => item.value),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: '#667eea', width: 2 },
        itemStyle: { color: '#667eea' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
            ]
          }
        }
      }
    ]
  }

  return <Chart option={option} style={{ width, height }} />
}