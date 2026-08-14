// real 风格主题档案：现代实景风（金沙暖底 + 视频优先）。
// CSS tokens 见 styles/variables.css 的 .theme-real 块；此处仅声明 JS 侧偏好，
// 供布局组件映射、动效编排、媒体选择消费。profile 不持有可变状态。
export const profile = {
  id: 'real',
  name: '实景',
  label: '现代实景',
  // 字体家族（外部字体已移除, 系统字体栈: 隶书/楷体/宋体 Windows 与 macOS 均内置）
  fonts: {
    heading: "'Ma Shan Zheng', 'LiSu', 'STLiti', 'Noto Serif SC', serif",
    body: "'Outfit', 'Noto Serif SC', 'Microsoft YaHei', 'SimSun', Georgia, serif",
    display: "'Ma Shan Zheng', 'LiSu', 'STLiti', serif",
  },
  // 动效预设（P1-6 转场 / P3 滚动叙事消费）
  motion: {
    hero: 'video',              // 首页 hero：视频背景
    mapStyle: 'sandbox',        // 地图交互：Three.js 沙盘
    transition: 'sweep',        // 风格切换转场：金色光扫 + 亮度缓入
    duration: 600,              // 转场时长 ms
    reducedMotion: 'static',    // prefers-reduced-motion 降级为静态图
  },
  // 媒体偏好（resolveAsset 消费）
  media: {
    heroMode: 'video-first',    // hero 优先视频，poster 兜底
    imageField: 'imageUrl',     // 实体首选字段（adapter 仍按主题挑双字段）
  },
  // 布局组件映射（P1-5 SandboxHero / P4 双布局落地时填入，先占位 null）
  components: {
    MapHero: null,
    PoetListLayout: null,
    PoemDetailLayout: null,
    TimelineLayout: null,
    PoetDetailLayout: null,
  },
}
