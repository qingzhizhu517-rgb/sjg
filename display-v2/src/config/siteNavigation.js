export const siteSections = [
  { id: 'landscape', label: '山河探索', note: '循河而行，走入九城', path: '/regions/泰安', prefixes: ['/regions', '/spots', '/river-sandbox'], links: [{ label: '城市山水', path: '/regions/泰安' }, { label: '黄河地图', path: '/river-sandbox' }] },
  { id: 'literary', label: '诗文名士', note: '从一首诗，读一方山水', path: '/poems', prefixes: ['/poems', '/poets', '/timeline'], links: [{ label: '诗词检索', path: '/poems' }, { label: '齐鲁名士', path: '/poets' }, { label: '文脉长河', path: '/timeline' }] },
  { id: 'culture', label: '齐鲁文化', note: '岁时、百工与人间烟火', path: '/culture', prefixes: ['/culture', '/cities', '/festivals', '/crafts', '/literature', '/food-opera'], links: [{ label: '文化总览', path: '/culture' }, { label: '民俗节庆', path: '/festivals' }, { label: '非遗工艺', path: '/crafts' }, { label: '民间文学', path: '/literature' }, { label: '饮食戏曲', path: '/food-opera' }] },
  { id: 'learning', label: '研学创作', note: '带着问题读，带着感受写', path: '/learn', prefixes: ['/learn', '/compose'], links: [{ label: '探究任务', path: '/learn' }, { label: '诗词创作', path: '/compose' }] },
]
export const sectionForPath = (path) => siteSections.find((section) => section.prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) || null
export const isSectionLinkActive = (path, link) => {
  if (link.path === '/regions/泰安') return /^\/(regions|spots)(\/|$)/.test(path)
  return path === link.path || (link.path !== '/culture' && path.startsWith(`${link.path}/`))
}

// Only internal, relative destinations may be used by detail-page return links.
export const safeReturnPath = (value, fallback) => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !/[\\\u0000-\u001f]/.test(value) ? value : fallback
