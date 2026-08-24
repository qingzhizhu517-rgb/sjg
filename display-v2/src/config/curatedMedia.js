const portrait = {
  aspectRatio: '3 / 4',
  objectFit: 'contain',
  objectPosition: 'center center',
  kind: 'portrait',
}
const landscape = {
  aspectRatio: '16 / 9',
  objectFit: 'contain',
  objectPosition: 'center center',
  kind: 'landscape',
}
const square = {
  aspectRatio: '1 / 1',
  objectFit: 'cover',
  objectPosition: 'center center',
  kind: 'square',
}

export const CURATED_MEDIA = {
  cao_cao_anime: portrait,
  gu_yanwu_anime: portrait,
  han_yu_anime: portrait,
  li_panlong_anime: portrait,
  li_qingzhao_anime: portrait,
  pu_songling_anime: portrait,
  su_shi_anime: portrait,
  wang_shizhen_anime: portrait,
  wen_tianxiang_anime: portrait,
  xin_qiji_anime: portrait,
  baotu_spring_anime: landscape,
  confucius_temple_anime: landscape,
  daming_lake_anime: landscape,
  mount_tai_anime: {
    ...portrait,
    objectPosition: 'center top',
    kind: 'portrait-scene',
  },
  thousand_buddha_mountain_anime: landscape,
  bengrou_rice: square,
  caozhou_dough_art: square,
  confucius_ceremony: landscape,
  lu_brocade_weaving: square,
  peony_festival: landscape,
}

const basename = (url) => {
  if (!url || typeof url !== 'string') return ''
  const clean = url.split('?')[0].split('#')[0]
  return clean.slice(clean.lastIndexOf('/') + 1).replace(/\.(?:jpe?g|png|webp)$/i, '')
}

export function getCuratedPresentation(url) {
  return CURATED_MEDIA[basename(url)] || {
    aspectRatio: '4 / 3',
    objectFit: 'cover',
    objectPosition: 'center center',
    kind: 'default',
  }
}
