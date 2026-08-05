// 内容包入口：按风格解析文案。纯函数，无 Vue 依赖，便于后端 ?style= 接管。
// scope: 'cities'（后续可扩展 'spots' | 'poets'）
import { cities as realCities } from './real/cities'
import { cities as inkwashCities } from './inkwash/cities'

const _tables = {
  cities: { real: realCities, inkwash: inkwashCities },
}

/**
 * 按风格解析文案。
 * @param {string} scope 内容域，如 'cities'
 * @param {string} key 城市/实体名
 * @param {'real'|'inkwash'} theme
 * @returns {object|null} 该风格文案；风格缺则回退 real，real 亦缺则 null
 */
export const resolveContent = (scope, key, theme) => {
  const scopeMap = _tables[scope]
  if (!scopeMap) return null
  const table = scopeMap[theme] || scopeMap.real
  return table[key] || scopeMap.real[key] || null
}
