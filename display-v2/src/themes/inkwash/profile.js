// inkwash 风格主题档案：水墨写意风（朱砂 + 长卷优先）。
// CSS tokens 见 styles/inkwash.css；此处仅声明 JS 侧偏好。
export const profile = {
  id: 'inkwash',
  name: '水墨',
  label: '水墨写意',
  fonts: {
    heading: "'LXGW WenKai', 'Noto Serif SC', serif",
    body: "'LXGW WenKai', 'Songti SC', serif",
    display: "'LXGW WenKai', serif",
  },
  motion: {
    hero: 'scroll',             // 首页 hero：水墨长卷
    mapStyle: 'scroll',          // 地图交互：横向卷轴 + 印章热点
    transition: 'ink',          // 风格切换转场：墨晕 clip-path 扩散
    duration: 700,
    reducedMotion: 'static',
  },
  media: {
    heroMode: 'image-first',    // hero 优先长卷图
    imageField: 'imageAnimeUrl',
  },
  components: {
    MapHero: null,
    PoetListLayout: null,
    PoemDetailLayout: null,
    TimelineLayout: null,
    PoetDetailLayout: null,
  },
}
