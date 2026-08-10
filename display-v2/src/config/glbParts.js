// GLB 部件命名规范（spec §5 契约）。AI 生成模型必须按此命名 node。

export const HULU_PARTS = [
  'gourd_raw',      // 带皮生葫芦
  'gourd_body',     // 去皮葫芦本体（主件）
  'peel_strips',    // 皮屑条
  'pattern_draft',  // 墨线画稿层
  'carved_layer',   // 雕刻完成层
  'knife_rest',     // 刻刀·静置位
  'knife_action',   // 刻刀·雕刻位
  'painted_layer',  // 上色完成层
  'scene_base',     // 工作台/底座
  'scene_prop_dish',// 环境道具示例（颜料碟）
]

/**
 * 匹配规则：'scene_*' 尾缀通配 = 前缀匹配；其余精确匹配。
 */
export const matchPartName = (pattern, name) =>
  pattern.endsWith('*') ? name.startsWith(pattern.slice(0, -1)) : name === pattern

/**
 * 把含通配的模式列表展开为具体部件名数组（按 allNames 顺序，去重）。
 */
export const expandPatterns = (patterns, allNames) => {
  const out = []
  for (const p of patterns) {
    for (const n of allNames) {
      if (matchPartName(p, n) && !out.includes(n)) out.push(n)
    }
  }
  return out
}
