import { useImage } from './useImage'

/**
 * themeAdapter：后端实体双字段 -> 按当前主题投影为单一视图模型。
 * 组件消费投影后的 image / avatar 字段，不再自行挑 imageUrl/imageAnimeUrl，
 * 也不在组件层碰 _anime 字符串 hack（hack 仍保留在 useImage 内作 DB 缺字段兜底）。
 *
 * 适配范围：本批迁移 FeaturedPoetCard / FeaturedSpotCard（props 直接持有原始双字段实体）。
 * useCityEnrichment 已把双字段挑成单值，其消费组件需 enrichment 保留双字段后方可迁移（后续推广）。
 */

const adaptEntity = (entity, realField, animeField, outField, kind) => {
  if (!entity) return entity
  const { resolveImage } = useImage()
  return { ...entity, [outField]: resolveImage(entity[realField], entity[animeField], kind) }
}

/** 景点 -> image（占位印章首字"景"） */
export const adaptSpot = (spot) => adaptEntity(spot, 'imageUrl', 'imageAnimeUrl', 'image', '景')

/** 诗人 -> avatar（占位首字"文"） */
export const adaptPoet = (poet) => adaptEntity(poet, 'avatarUrl', 'avatarAnimeUrl', 'avatar', '文')

/** 诗词 -> image（占位首字"文"） */
export const adaptPoem = (poem) => adaptEntity(poem, 'imageUrl', 'imageAnimeUrl', 'image', '文')
