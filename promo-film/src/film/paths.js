// Browser-side asset manifest. URLs are served by tools/serve.mjs from the repo
// root, so the film borrows display-v2/public directly — every frame uses artwork
// that actually ships with the site. (src/paths.js is the node-side twin.)
const PUB = '/display-v2/public'
const u = (p) => `${PUB}/${p}`

export const MEDIA = {
  heroOpenPoster: u('media/inkwash/hero-open-poster.jpg'),
  heroScroll: u('media/inkwash/hero-scroll.png'),
  inkwashMap: u('images/inkwash-map.png'),
  riverLandscape: u('media/inkwash/atlas/river-landscape-v2.webp'),
  riverLandscapeOld: u('media/inkwash/atlas/river-landscape.webp'),
  mountainVignette: u('media/inkwash/atlas/mountain-vignette.webp'),
  heroTitle: u('media/inkwash/atlas/hero-title.webp'),
  taianLandscape: u('media/inkwash/atlas/taian-landscape.webp'),
  damingLake: u('media/inkwash/atlas/daming-lake.webp'),
  dufuPortrait: u('media/inkwash/atlas/dufu-portrait.webp'),
  scrollMapBase: u('media/inkwash/timeline/scroll-map-base.webp'),
  boatRower: u('media/inkwash/timeline/boat-rower.webp'),
  sceneTang: u('media/inkwash/timeline/scene-tang.webp'),
  sceneSong: u('media/inkwash/timeline/scene-song.webp'),
  sceneQing: u('media/inkwash/timeline/scene-qing.webp'),
}

// 九城胜迹：display-v2 首页「九城胜迹」那套青绿山水插画，一城一张（含滨州 · 无棣碣石山）。
// 文件名与 display-v2/src/config/nineSights.js 的 slug 一一对应，风格统一、无标题字，
// 比 images/spots/*_anime.jpg 更适合放进片子的纸本调性里。
export const SIGHTS = {
  sightHeze: u('media/inkwash/sights/heze-peony.webp'),
  sightJining: u('media/inkwash/sights/jining-confucius.webp'),
  sightTaian: u('media/inkwash/sights/taian-taishan.webp'),
  sightLiaocheng: u('media/inkwash/sights/liaocheng-donge.webp'),
  sightJinan: u('media/inkwash/sights/jinan-daming.webp'),
  sightDezhou: u('media/inkwash/sights/dezhou-weihe.webp'),
  sightZibo: u('media/inkwash/sights/zibo-matahu.webp'),
  sightBinzhou: u('media/inkwash/sights/binzhou-jieshi.webp'),
  sightDongying: u('media/inkwash/sights/dongying-dongjin.webp'),
}

export const IMAGES = {
  hezePeony: u('images/spots/caozhou_peony_anime.jpg'),
  jiningKongmiao: u('images/spots/confucius_temple_anime.jpg'),
  taishan: u('images/spots/mount_tai_anime.jpg'),
  liaocheng: u('images/spots/guangyue_tower_anime.jpg'),
  daming: u('images/spots/daming_lake_anime.jpg'),
  baotu: u('images/spots/baotu_spring_anime.jpg'),
  dezhou: u('images/spots/sulu_tomb_anime.jpg'),
  zibo: u('images/spots/mata_lake_anime.jpg'),
  dongying: u('images/spots/yellow_river_estuary_anime.jpg'),
  liQingzhao: u('images/poets/li_qingzhao_anime.webp'),
  duFu: u('images/poets/du_fu.jpg'),
  suShi: u('images/poets/su_shi_anime.webp'),
  peonyFestival: u('images/cultural/peony_festival.webp'),
  confuciusCeremony: u('images/cultural/confucius_ceremony.webp'),
}
