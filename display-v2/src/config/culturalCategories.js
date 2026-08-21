// 文化板块类别注册表：新增类别只改这里 + 加页面组件。
// CulturalGallery / CityCulture / 五个列表页共用此配置。
export const CULTURAL_CATEGORIES = [
  {
    key: 'festival', name: '民俗节庆', seal: '节', route: '/festivals', ready: true,
    desc: '爆竹声里，灯影桨声；一方节俗，一方人情。',
    tags: ['春节', '元宵', '牡丹盛会'],
  },
  {
    key: 'poem', name: '古诗词', seal: '诗', route: '/poets', ready: true,
    desc: '千古诗篇，咏叹齐鲁山河与人间悲欢。',
    tags: ['唐诗', '宋词', '咏物'],
  },
  {
    key: 'craft', name: '非遗工艺', seal: '艺', route: '/crafts', ready: true,
    desc: '百工之艺，指尖传承，器物之中见匠心。',
    tags: ['东昌葫芦', '剪纸', '年画'],
  },
  {
    key: 'literature', name: '民间文学', seal: '文', route: '/literature', ready: true,
    desc: '闾巷传说，口耳相传，百姓心中的故事。',
    tags: ['传说', '故事', '民间'],
  },
  {
    key: 'food_opera', name: '饮食戏曲', seal: '味', route: '/food-opera', ready: true,
    desc: '舌尖记忆与梨园春秋，品味黄河岸边的生活艺术。',
    tags: ['鲁菜', '吕剧', '快书'],
  },
]

// 类目英文枚举 → 中文名。供列表页 / 详情页共用，避免页面上显示英文 'literature'。
export const CATEGORY_LABELS = CULTURAL_CATEGORIES.reduce((m, c) => {
  m[c.key] = c.name
  return m
}, {})
