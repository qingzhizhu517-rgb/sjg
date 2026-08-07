// 解析城市页 Hero 媒体。
// real：优先 manifest 城市实景媒体（`city-{slug}`，视频优先），缺素材回退国画插画；
// inkwash：恒用国画插画（卷轴展开动画由组件层处理）。
// 返回 { type:'video'|'image', url, poster, kind:'media'|'illustration' } 或 null。
export const resolveCityHeroMedia = ({ isReal, slug, resolveAsset, illustration }) => {
  if (!isReal) {
    return illustration ? { type: 'image', url: illustration, poster: null, kind: 'illustration' } : null
  }
  const media = slug ? resolveAsset(`city-${slug}`) : null
  if (media) return { ...media, kind: 'media' }
  return illustration ? { type: 'image', url: illustration, poster: null, kind: 'illustration' } : null
}
