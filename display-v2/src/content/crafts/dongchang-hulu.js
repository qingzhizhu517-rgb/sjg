// display-v2/src/content/crafts/dongchang-hulu.js
// 东昌葫芦雕刻 · 5 步工序配置（声明式）
// 设计文档：docs/superpowers/specs/2026-08-10-craft-3d-microgame-design.md §4

import { HULU_PARTS } from '../../config/glbParts.js'

/**
 * @type {import('./types').CraftProcessConfig}
 */
export const HULU_PROCESS = {
  slug: 'dongchang-hulu',
  title: '东昌葫芦雕刻',
  subtitle: '聊城 · 国家级非物质文化遗产',
  model: '/media/crafts/dongchang-hulu.glb',
  fallbackImages: [
    '/media/crafts/hulu-fallback-1.svg',
    '/media/crafts/hulu-fallback-2.svg',
    '/media/crafts/hulu-fallback-3.svg',
    '/media/crafts/hulu-fallback-4.svg',
    '/media/crafts/hulu-fallback-5.svg',
  ],
  allParts: HULU_PARTS,

  /** 自由把玩模式部件知识点卡 */
  knowledge: {
    gourd_raw: {
      title: '生葫芦',
      body: '霜降后采摘的聊城本地亚腰葫芦，皮厚质密，形体端正，是雕刻的上佳材料。采摘后需经晾晒处理，待水分蒸发后方可使用。',
    },
    gourd_body: {
      title: '葫芦坯',
      body: '去皮晾晒后的葫芦本体，表面光滑细腻，可直接进行雕刻。亚腰葫芦天然的腰身造型，为创作提供了独特的构图空间。',
    },
    peel_strips: {
      title: '青皮',
      body: '葫芦外层的青绿色表皮，用竹刀轻轻刮除。刮皮需均匀细致，既要露出白瓤，又不能伤及内壁。',
    },
    pattern_draft: {
      title: '墨线画稿',
      body: '用铅笔或墨线在葫芦表面描绘纹样轮廓。常见题材包括花鸟鱼虫、山水人物、吉祥图案等，线条需流畅自然。',
    },
    carved_layer: {
      title: '雕刻纹样',
      body: '以平刀、圆刀、斜口刀等工具，沿墨线进行浮雕或镂空雕刻。刀法讲究"稳、准、轻、快"，深浅有致方显层次。',
    },
    knife_rest: {
      title: '雕刻刀具',
      body: '东昌葫芦雕刻常用的刀具包括平刀（铲平底面）、圆刀（雕刻弧面）、斜口刀（刻画细节）和三角刀（拉线条）。',
    },
    painted_layer: {
      title: '彩绘上色',
      body: '雕刻完成后，以国画颜料或丙烯颜料着色。传统配色以红、绿、黄为主色调，色彩鲜明而不失雅致。',
    },
  },

  /** 5 步工序 */
  steps: [
    {
      key: 'select',
      name: '选料',
      icon: '选',
      desc: '霜降后采摘，取形正、皮厚、无斑者。亚腰葫芦天然的束腰造型，为后续构图提供独特空间。',
      visible: ['gourd_raw', 'scene_*'],
      animations: [
        { target: 'gourd_raw', rotateY: Math.PI * 2, duration: 2 },
      ],
      camera: { pos: [0, 1.2, 3.2], target: [0, 0.6, 0] },
    },
    {
      key: 'peel',
      name: '去皮晾晒',
      icon: '晾',
      desc: '刮去青皮，阴凉通风处晾晒月余。待水分蒸发，葫芦表面光滑如玉，方可进入下一工序。',
      visible: ['gourd_raw', 'gourd_body', 'peel_strips', 'scene_*'],
      animations: [
        { target: 'gourd_raw', fadeOut: true, duration: 0.8 },
        { target: 'peel_strips', moveY: -0.5, duration: 1.5 },
        { target: 'peel_strips', fadeOut: true, duration: 1.5, delay: 0.5 },
        { target: 'gourd_body', fadeIn: true, duration: 1, delay: 0.8 },
      ],
      camera: { pos: [1.5, 1.0, 2.8], target: [0, 0.6, 0] },
    },
    {
      key: 'draft',
      name: '画稿',
      icon: '画',
      desc: '用铅笔或墨线在葫芦表面描绘纹样轮廓。常见题材包括花鸟鱼虫、山水人物、吉祥图案。',
      visible: ['gourd_body', 'pattern_draft', 'scene_*'],
      animations: [
        { target: 'pattern_draft', fadeIn: true, duration: 1.2 },
        { target: 'pattern_draft', rotateY: Math.PI * 2, duration: 2.5, delay: 0.5 },
      ],
      camera: { pos: [0.8, 0.9, 2.5], target: [0, 0.6, 0] },
    },
    {
      key: 'carve',
      name: '雕刻',
      icon: '刻',
      desc: '以平刀、圆刀、斜口刀沿墨线雕刻。刀法讲究"稳、准、轻、快"，深浅有致方显层次。',
      visible: ['gourd_body', 'carved_layer', 'knife_rest', 'knife_action', 'scene_*'],
      animations: [
        { target: 'pattern_draft', fadeOut: true, duration: 0.5 },
        { target: 'carved_layer', fadeIn: true, duration: 1, delay: 0.3 },
        { target: 'knife_action', moveX: 0.15, duration: 0.4, delay: 0.8 },
        { target: 'knife_action', moveX: -0.15, duration: 0.4, delay: 1.2 },
        { target: 'knife_action', moveX: 0.1, duration: 0.3, delay: 1.6 },
      ],
      camera: { pos: [1.2, 0.8, 2.2], target: [0, 0.6, 0] },
    },
    {
      key: 'paint',
      name: '上色成品',
      icon: '彩',
      desc: '以国画颜料或丙烯颜料着色。传统配色以红、绿、黄为主色调，色彩鲜明而不失雅致。',
      visible: ['gourd_body', 'painted_layer', 'knife_rest', 'scene_*'],
      animations: [
        { target: 'knife_action', fadeOut: true, duration: 0.5 },
        { target: 'carved_layer', fadeOut: true, duration: 0.5 },
        { target: 'painted_layer', fadeIn: true, duration: 1.5, delay: 0.3 },
        { target: 'gourd_body', rotateY: Math.PI * 2, duration: 3, delay: 0.5 },
      ],
      camera: { pos: [0, 1.4, 3.0], target: [0, 0.6, 0] },
    },
  ],
}
