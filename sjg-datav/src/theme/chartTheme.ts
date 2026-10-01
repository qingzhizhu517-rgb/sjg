/**
 * ECharts 主题：色值与通用样式的唯一真源。
 *
 * ECharts 的 option 读不到 CSS 变量（Canvas 渲染，不走样式层），
 * 所以这里在模块加载时从 `:root` 抓一次真实 token；抓不到再回落内置默认值。
 * 改配色请改 `src/styles/global.css`，图表会自动跟随。
 */

export interface DvTokens {
  bg: string
  panel: string
  ink: string
  ink2: string
  ink3: string
  gold: string
  goldLight: string
  vermilion: string
  teal: string
  line: string
}

const CSS_KEYS: Record<keyof DvTokens, string> = {
  bg: '--dv-bg',
  panel: '--dv-panel',
  ink: '--dv-ink',
  ink2: '--dv-ink-2',
  ink3: '--dv-ink-3',
  gold: '--dv-gold',
  goldLight: '--dv-gold-light',
  vermilion: '--dv-vermilion',
  teal: '--dv-teal',
  line: '--dv-line',
}

const FALLBACK: DvTokens = {
  bg: '#0f1216',
  panel: 'rgba(19, 23, 30, 0.78)',
  ink: '#ece4d0',
  ink2: '#b7ad92',
  ink3: '#7d7660',
  gold: '#c9a227',
  goldLight: '#e5c96b',
  vermilion: '#c23a2b',
  teal: '#7f9aa0',
  line: 'rgba(201, 162, 39, 0.25)',
}

function readTokens(): DvTokens {
  if (typeof window === 'undefined' || !document.documentElement) return { ...FALLBACK }
  const cs = getComputedStyle(document.documentElement)
  const out = { ...FALLBACK }
  ;(Object.keys(CSS_KEYS) as Array<keyof DvTokens>).forEach((key) => {
    const value = cs.getPropertyValue(CSS_KEYS[key]).trim()
    if (value) out[key] = value
  })
  return out
}

export const T: DvTokens = readTokens()

/**
 * 样式落地后再同步一次。
 * dev 环境下 CSS 由 JS 注入，模块求值顺序不保证先于本模块，
 * main.tsx 在 import global.css 之后显式调用一次即可。
 */
export function syncThemeTokens(): void {
  Object.assign(T, readTokens())
}

/**
 * 序列色板（金 → 墨 → 青 → 赭，低饱和）。
 * 用于饼图、多序列折线、词云——原先在三处各写了一份副本，现已收敛到这里。
 */
export const PALETTE: string[] = [
  T.gold,
  T.ink,
  T.teal,
  '#b98a6a',
  '#8f8a7a',
  T.vermilion,
  '#a89f8f',
  '#6f928e',
  T.goldLight,
  '#9aa3a0',
]

/** 把 #rrggbb 或已有的 rgb/rgba 字符串转成指定透明度 */
export function alpha(color: string, a: number): string {
  const hex = color.trim()
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (m) {
    const [r, g, b] = [m[1], m[2], m[3]].map((x) => parseInt(x, 16))
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }
  const rgb = /^rgba?\(\s*([^)]+)\)$/i.exec(hex)
  if (rgb) {
    const parts = rgb[1].split(',').map((s) => s.trim())
    return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${a})`
  }
  return hex
}

/** 深色底上的通用 tooltip */
export const tooltipBase = {
  backgroundColor: 'rgba(19,23,30,0.94)',
  borderColor: alpha(T.gold, 0.4),
  borderWidth: 1,
  textStyle: { color: T.ink, fontSize: 12 },
  extraCssText: 'backdrop-filter: blur(6px);',
} as const

/** 坐标轴文字 */
export const axisLabelBase = {
  color: T.ink2,
  fontSize: 12,
} as const

/** 数值轴 / 网格线 */
export const splitLineBase = {
  show: true,
  lineStyle: { color: alpha(T.gold, 0.08), type: 'dashed' as const },
}

/** 通用网格内边距 */
export const gridBase = {
  top: 8,
  left: 8,
  right: 8,
  bottom: 8,
  containLabel: false,
}

/** 条形底衬 */
export const barBackgroundStyle = {
  color: alpha(T.gold, 0.07),
} as const

/** 金色横向渐变（条形 / 进度条） */
export function goldGradient(x2 = 1) {
  return {
    type: 'linear' as const,
    x: 0,
    y: 0,
    x2,
    y2: 0,
    colorStops: [
      { offset: 0, color: alpha(T.gold, 0.35) },
      { offset: 1, color: T.goldLight },
    ],
  }
}

/** 动画节奏统一（避免各处 1200 / 1400 / 默认 1000 混杂） */
export const ANIM = { duration: 1100, easing: 'cubicOut' as const }
