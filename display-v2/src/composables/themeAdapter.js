import { useImage } from './useImage'

/**
 * themeAdapter：后端实体 -> 按当前主题投影为单一视图模型。
 * 组件消费投影后的 image / avatar 字段，不再自行挑 imageUrl/imageAnimeUrl。
 *
 * 适配范围：FeaturedPoetCard / FeaturedSpotCard（props 直接持有原始实体）。
 * useCityEnrichment 返回的图片字段同样经过水墨字段优先级处理。
 */

const adaptEntity = (entity, preferredFields, outField, kind) => {
  if (!entity) return entity
  const { resolveFirstImage, firstMediaValue } = useImage()
  return {
    ...entity,
    [outField]: resolveFirstImage(
      preferredFields.map((field) => firstMediaValue([entity[field]])),
      kind,
    ),
  }
}

/** 景点 -> image（占位印章首字"景"） */
export const adaptSpot = (spot) =>
  adaptEntity(spot, ['imageAnimeUrl', 'imageUrl'], 'image', '景')

/** 诗人 -> avatar（占位首字"文"） */
export const adaptPoet = (poet) =>
  adaptEntity(poet, ['avatarAnimeUrl', 'avatarUrl'], 'avatar', '文')

/** 诗词 -> image（占位首字"文"） */
export const adaptPoem = (poem) =>
  adaptEntity(poem, ['imageAnimeUrl', 'imageUrl'], 'image', '文')
