// display-v2/src/content/crafts/dongchang-hulu.js
// 东昌葫芦雕刻 · 5 步工序配置（声明式）
// 五段教学章节是产品编排；工艺依据见 HULU_SOURCES，不代表传统工序的唯一划分。

import { HULU_PARTS } from '../../config/glbParts.js'

export const HULU_SOURCES = [
  { sourceId: 'E02', title: '葫芦雕刻（东昌葫芦雕刻）', authorOrg: '中国非物质文化遗产网 · 中国非物质文化遗产数字博物馆', url: 'https://www.ihchina.cn/project_details/14147.html', locator: '国家级非遗项目记录：2008 年第二批，Ⅶ-61', note: '官方名录依据；支持项目身份、堂邑地域与运河文化背景。' },
  { sourceId: 'E03', title: '国家级代表性传承人：李玉成', authorOrg: '中国非物质文化遗产网', url: 'https://www.ihchina.cn/ccr_detail/2927.html', locator: '第五批代表性传承人记录，05-2673', note: '官方传承人档案；支持刀刻、针雕、彩绘和烙画等不同技法的区分。' },
  { sourceId: 'E05', title: '东昌葫芦雕刻', authorOrg: '央广网', publicationYear: 2013, url: 'https://country.cnr.cn/xtxq/201312/t20131226_514502938.shtml', locator: '于凤刚采访及选料、雕刻、着色的工艺说明', note: '具名工艺采访；支持亚腰造型、自然土黄色外表及敷色后擦去浮色、凹槽留色。报道描述具体实践，不视作所有流派的强制规范。' },
  { sourceId: 'V01', title: '山东手造｜东昌葫芦雕刻：以刀为笔绘“福禄”', authorOrg: '人民周刊网（来源：人民视频）', publicationYear: 2025, url: 'https://www.peopleweekly.cn/html/2025/shipin_0106/236182.html', locator: '2025-01-06 视频报道', note: '东昌葫芦雕刻的匠人影像与传承实践；用于形态、细线与手工动作观察，不把单个作品视为统一样式。' },
  { sourceId: 'V02', title: '农广天地：葫芦上的艺术', authorOrg: '央视网', publicationYear: 2015, url: 'https://tv.cctv.com/2015/03/27/VIDE1427460485447669.shtml', locator: '2015-03-27 节目，探访东昌府区', note: '央视专题实录；帮助区分针刻、烙画、彩绘、镂雕。该历史节目不替代当前非遗名录。' },
]

// 原站视频链接；不缓存、搬运或随构建分发视频文件。新增工艺可复用同一资料结构。
export const HULU_VIDEOS = [
  { title: '以刀为笔绘“福禄”', source: '人民周刊网 · 人民视频', date: '2025-01-06', url: HULU_SOURCES[3].url,
    mediaUrl: 'https://flv4mp4.people.com.cn/videofile7/pvmsvideo/2025/1/6/RenMinShiPinBianJiZu-JiaoDian_91974679c85754f6c68f9d70d48dadaa_ms_c.mp4',
    note: '观察东昌葫芦上的细线、纹样与匠人实践。网页体验使用原创数字纹样，未复刻报道中的作品。' },
  { title: '《农广天地》葫芦上的艺术', source: '央视网', date: '2015-03-27', url: HULU_SOURCES[4].url,
    note: '节目走进东昌府区，介绍多种葫芦艺术形式。央视播放器在来源原页观看。' },
]

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
      body: '东昌葫芦雕刻与聊城东昌府区堂邑镇的生活和运河商贸有关。亚腰葫芦上小下大、中央束腰；挑选皮质适合雕刻、形体协调的材料，再因形构图。',
    },
    gourd_body: {
      title: '葫芦坯',
      body: '去皮处理后的外壳呈自然土黄色，腹部与束腰形成不同的构图空间。本工坊的匀称、长腰和丰腹是三种数字形制选项，保留天然器物的细微不对称。',
    },
    peel_strips: {
      title: '青皮',
      body: '去除外层青皮后仍保留可雕刻的外壳，不是把内部白瓤露出来。干燥处理的实际时间取决于材料与条件；页面的快速切换只是教学演示。',
    },
    pattern_draft: {
      title: '墨线画稿',
      body: '用铅笔或墨线在葫芦表面描绘纹样轮廓。常见题材包括花鸟鱼虫、山水人物、吉祥图案等，线条需流畅自然。',
    },
    carved_layer: {
      title: '雕刻纹样',
      body: '沿构图刻出线条与层次。本体验先学习表面刻线与凹槽留色；浅、中、深为数字工具档位，不对应固定毫米数，也不代表专业技艺鉴定。镂雕另需真实孔洞与内壁。',
    },
    knife_rest: {
      title: '雕刻刀具',
      body: '央广工艺采访介绍了刻刀的形制及不同刀具的使用。刀刻与针雕各有特点；本工坊以虚拟刻刀描线练习，木柄和金属刃口采用不同材质表现。',
    },
    painted_layer: {
      title: '敷色与擦色',
      body: '央广采访记录了雕刻后敷色、擦净浮色、让凹槽留色以显纹的做法。墨色和赭色是本体验的视觉选项，并非东昌葫芦雕刻统一的传统色谱；彩绘和烙画是另有特色的技法。',
    },
  },

  /** 5 步工序 */
  steps: [
    {
      key: 'select',
      name: '选料',
      icon: '选',
      desc: '观察上小下大、中央束腰的亚腰造型，挑选皮质与形体适合雕刻的材料，思考因形构图。',
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
      desc: '去除青皮、处理干燥后，保留自然土黄色外壳。此处的快速变化为教学演示，不代表真实加工时长。',
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
      desc: '沿参考线描刻，感受深浅与线条的关系。本体验以动态表面刻槽表现阴刻，不把黑色贴图称作真实透雕。',
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
      name: '着色与成品',
      icon: '色',
      desc: '把色料敷入刻槽，再擦去外表浮色，让纹样清晰显现。近看、转动并在侧光下检查刻线。',
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
