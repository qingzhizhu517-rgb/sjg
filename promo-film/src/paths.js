// Asset locations. The film borrows display-v2/public directly so every frame uses
// artwork that actually ships with the site.
import { resolve } from 'node:path'

export const SITE_DIR = resolve(import.meta.dirname, '../../display-v2/public')
export const BUILD_DIR = resolve(import.meta.dirname, '../../.build')

const f = (p) => `file://${SITE_DIR}/${p.replace(/^\//, '')}`

export const MEDIA = {
  heroOpen: f('media/inkwash/hero-open.mp4'),
  heroOpenPoster: f('media/inkwash/hero-open-poster.jpg'),
  heroScroll: f('media/inkwash/hero-scroll.png'),
  heroMap: f('media/real/hero-map.mp4'),
  inkwashMap: f('images/inkwash-map.png'),
  riverLandscape: f('media/inkwash/atlas/river-landscape-v2.webp'),
  riverLandscapeOld: f('media/inkwash/atlas/river-landscape.webp'),
  mountainVignette: f('media/inkwash/atlas/mountain-vignette.webp'),
  heroTitle: f('media/inkwash/atlas/hero-title.webp'),
  taianLandscape: f('media/inkwash/atlas/taian-landscape.webp'),
  damingLake: f('media/inkwash/atlas/daming-lake.webp'),
  dufuPortrait: f('media/inkwash/atlas/dufu-portrait.webp'),
  scrollMapBase: f('media/inkwash/timeline/scroll-map-base.webp'),
  boatRower: f('media/inkwash/timeline/boat-rower.webp'),
  sceneTang: f('media/inkwash/timeline/scene-tang.webp'),
  sceneSong: f('media/inkwash/timeline/scene-song.webp'),
  sceneQing: f('media/inkwash/timeline/scene-qing.webp'),
}

export const IMAGES = {
  // nine representative sights, one per riverside city (real entries from nineSights.js)
  hezePeony: f('images/spots/caozhou_peony_anime.jpg'),
  jiningKongmiao: f('images/spots/confucius_temple_anime.jpg'),
  taishan: f('images/spots/mount_tai_anime.jpg'),
  liaocheng: f('images/spots/guangyue_tower_anime.jpg'),
  daming: f('images/spots/daming_lake_anime.jpg'),
  baotu: f('images/spots/baotu_spring_anime.jpg'),
  dezhou: f('images/spots/sulu_tomb_anime.jpg'),
  zibo: f('images/spots/mata_lake_anime.jpg'),
  binzhou: f('images/spots/thousand_buddha_mountain_anime.webp'),
  dongying: f('images/spots/yellow_river_estuary_anime.jpg'),
  weishan: f('images/spots/wei_manor_anime.jpg'),
  pu: f('images/spots/pu_manor_anime.jpg'),
  // poets
  liQingzhao: f('images/poets/li_qingzhao_anime.webp'),
  duFu: f('images/poets/du_fu.jpg'),
  suShi: f('images/poets/su_shi_anime.webp'),
  liBai: f('images/poets/li_bai.jpg'),
  xinQiji: f('images/poets/xin_qiji_anime.webp'),
  puSongling: f('images/poets/pu_songling_anime.webp'),
  wangShizhen: f('images/poets/wang_shizhen_anime.webp'),
  caoCao: f('images/poets/cao_cao_anime.webp'),
  kongzi: f('images/poets/kongzi_anime.webp'),
  // culture
  peonyFestival: f('images/cultural/peony_festival.webp'),
  confuciusCeremony: f('images/cultural/confucius_ceremony.webp'),
  luBrocade: f('images/cultural/lu_brocade_weaving.webp'),
  bengrouRice: f('images/cultural/bengrou_rice.webp'),
  doughArt: f('images/cultural/caozhou_dough_art.webp'),
}

export const ATLAS = {
  base: f('media/inkwash/atlas'),
  spot: (slug) => f(`media/inkwash/atlas/spot-${slug}.webp`),
}

export const UI = {
  captureDir: resolve(BUILD_DIR, 'capture'),
}
