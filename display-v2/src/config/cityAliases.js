// 沿黄九城 -> 地名别名词典
// 用于在城市卡片中，把诗人的 birthplace（自由文本，如「济南路历城县（今山东济南历城区）」）
// 模糊匹配到所属城市，从而统计「该市名士」。
//
// 说明：
// - 别名按地理/历史地名收录（古称、下辖区县、别称），含「今山东XX」括注也能命中。
// - 曲阜/邹城虽在 DB 中是独立 region，按地缘归入济宁做诗人匹配；景点数仍按 DB region 取。
// - 匹配为「birthplace 包含任一别名」子串匹配，大小写不敏感。
export const cityAliases = {
  菏泽: ['菏泽', '曹州', '鄄城', '东明', '巨野', '单县'],
  济宁: ['济宁', '曲阜', '邹城', '兖州', '嘉祥', '汶上', '泗水'],
  泰安: ['泰安', '奉符', '泰山', '肥城', '新泰', '东平'],
  聊城: ['聊城', '东昌', '临清', '冠县', '莘县'],
  济南: ['济南', '历城', '齐州', '章丘', '长清', '济阳'],
  德州: ['德州', '陵县', '平原', '乐陵', '宁津', '庆云'],
  滨州: ['滨州', '渤海', '博兴', '惠民', '邹平', '无棣'],
  淄博: ['淄博', '淄川', '益都', '新城', '桓台', '博山', '临淄'],
  东营: ['东营', '利津', '垦利', '广饶']
}

// 反查：别名 -> 城市（构建一次，供匹配使用）
export const aliasToCity = (() => {
  const m = {}
  Object.entries(cityAliases).forEach(([city, aliases]) => {
    aliases.forEach((alias) => {
      // 别名长度 >= 2 的才入反查，避免单字误命中
      if (alias && alias.length >= 2) m[alias] = city
    })
  })
  return m
})()

/**
 * 给定诗人 birthplace 文本，返回所属沿黄城市；不属于九城则返回 null。
 * 用别名集做子串匹配，规避 birthplace 格式不统一（古地名/括注）的问题。
 */
export function matchCityByBirthplace(birthplace) {
  if (!birthplace || typeof birthplace !== 'string') return null
  const text = birthplace
  // 城市名本身（2 字）优先直接命中
  for (const city of Object.keys(cityAliases)) {
    if (text.includes(city)) return city
  }
  // 再按别名命中（别名已 >= 2 字）
  for (const [alias, city] of Object.entries(aliasToCity)) {
    if (text.includes(alias)) return city
  }
  return null
}
