import { useImage } from './useImage'

/**
 * themeAdapter：后端实体 -> 按当前主题投影为单一视图模型。
 * 组件消费投影后的 image / avatar 字段，不再自行挑 imageUrl/imageAnimeUrl。
 *
 * 适配范围：FeaturedPoetCard / FeaturedSpotCard（props 直接持有原始实体）。
 * useCityEnrichment 已把单字段挑成单值，其消费组件需 enrichment 保留字段后方可迁移（后续推广）。
 */

const adaptEntity = (entity, realField, outField, kind) => {
  if (!entity) return entity
  const { resolveImage } = useImage()
  return { ...entity, [outField]: resolveImage(entity[realField], kind) }
}

/** 景点 -> image（占位印章首字"景"） */
export const adaptSpot = (spot) => adaptEntity(spot, 'imageUrl', 'image', '景')

/** 诗人 -> avatar（占位首字"文"） */
export const adaptPoet = (poet) => adaptEntity(poet, 'avatarUrl', 'avatar', '文')

/** 诗词 -> image（占位首字"文"） */
export const adaptPoem = (poem) => adaptEntity(poem, 'imageUrl', 'image', '文')
