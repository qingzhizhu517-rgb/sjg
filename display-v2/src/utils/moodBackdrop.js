// 挑选详情页意境背景图：按优先级取首个有效 URL。
// 主题化占位印章是 data: SVG，铺底无意义，视为无图。
export const pickMoodBackdrop = (...candidates) => {
  for (const url of candidates) {
    if (url && typeof url === 'string' && !url.startsWith('data:')) return url
  }
  return null
}
