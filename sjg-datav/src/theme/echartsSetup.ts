import * as echarts from 'echarts/core'
import { BarChart, EffectScatterChart, LinesChart, PieChart, ScatterChart } from 'echarts/charts'
import { GeoComponent, GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import shandongData from '../assets/shandong.json'

/**
 * ECharts 按需注册的唯一入口。
 * 原先每个组件各自 `echarts.use([...])`，容易出现「A 组件用了 B 组件注册的图表类型」
 * 这种隐式依赖。集中一处，加类型只改这里。
 */
echarts.use([
  BarChart,
  PieChart,
  ScatterChart,
  EffectScatterChart,
  LinesChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  GeoComponent,
  CanvasRenderer,
])

const SHANDONG_FEATURES = (shandongData as { features: Array<{ geometry: { coordinates: unknown } }> })
  .features

echarts.registerMap('shandong', shandongData as never)

export { SHANDONG_FEATURES }
export default echarts
