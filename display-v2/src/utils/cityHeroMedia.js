// 解析城市页 Hero 媒体。
// 优先 manifest 城市实景媒体（`city-{slug}`，视频优先），缺素材回退国画插画。
// 返回 { type:'video'|'image', url, poster, kind:'media'|'illustration' } 或 null。
//
// 2026-08-20 主题收敛：删除 isReal 参数。原先 inkwash 恒用插画、real 才查 manifest，
// 现统一为「有实景素材就用，没有就用插画」。
// 注意 public/media/real/cities/ 目录当前不存在，所以实际恒走插画分支。
export const resolveCityHeroMedia = ({ slug, resolveAsset, illustration }) => {
  const media = slug ? resolveAsset(`city-${slug}`) : null
  if (media) return { ...media, kind: 'media' }
  return illustration ? { type: 'image', url: illustration, poster: null, kind: 'illustration' } : null
}
