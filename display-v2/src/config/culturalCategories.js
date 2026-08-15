// 文化板块类别注册表：新增类别只改这里 + 加页面组件（见 docs/plans/2026-08-15-nine-cities-display-proposal.md）
export const CULTURAL_CATEGORIES = [
  { key: 'festival',   name: '民俗节庆', seal: '节', route: '/festivals',  ready: true  },
  { key: 'poem',       name: '古诗词',   seal: '诗', route: '/poets',     ready: true  }, // 复用现有诗词域
  { key: 'craft',      name: '非遗工艺', seal: '艺', route: '/crafts',     ready: true  },
  { key: 'literature', name: '民间文学', seal: '文', route: '/literature', ready: true  },
  { key: 'food_opera', name: '饮食戏曲', seal: '味', route: '/food-opera', ready: true  },
]
