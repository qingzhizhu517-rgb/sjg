// Explicit, local design specimens. These are never a fallback for a failed API.
// Literary associations and emotion labels here demonstrate layout, not reviewed analysis.
import { NINE_SIGHTS } from './nineSights.js'

const art = (name) => `/media/inkwash/atlas/${name}.webp`

export const isAtlasPreview = (route) => route?.query?.preview === 'inkwash'
export const atlasLink = (path, route) => {
  if (!isAtlasPreview(route)) return path
  const url = new URL(path, 'https://atlas.local')
  return { path: url.pathname, query: { ...Object.fromEntries(url.searchParams), preview: 'inkwash' }, hash: url.hash }
}

export const previewDynasties = [
  { id: 4, name: '唐', startYear: 618, endYear: 907 },
  { id: 5, name: '宋', startYear: 960, endYear: 1279 },
  { id: 6, name: '元', startYear: 1271, endYear: 1368 },
  { id: 7, name: '明', startYear: 1368, endYear: 1644 },
  { id: 8, name: '清', startYear: 1644, endYear: 1912 },
  { id: 10, name: '近现代', startYear: 1912, endYear: null },
]

export const previewPoems = [
  { id: 301, title: '陪李北海宴历下亭', poetId: 2, poetName: '杜甫', dynastyId: 4, spotId: 2,
    content: '东藩驻皂盖，北渚凌清河。\n海右此亭古，济南名士多。\n云山已发兴，玉佩仍当歌。\n修竹不受暑，交流空涌波。',
    sentimentTags: ['豪放', '悠远'], form: '五言古诗·节选', appreciation: '由历下亭的宴集，读见山水风物与齐鲁名士。此处标签仅用于设计预览。' },
  { id: 302, title: '望岳', poetId: 2, poetName: '杜甫', dynastyId: 4, spotId: 101,
    content: '岱宗夫如何？齐鲁青未了。\n造化钟神秀，阴阳割昏晓。\n荡胸生曾云，决眦入归鸟。\n会当凌绝顶，一览众山小。', sentimentTags: ['豪放', '壮阔'], form: '五言古诗' },
  { id: 303, title: '春望', poetId: 2, poetName: '杜甫', dynastyId: 4,
    content: '国破山河在，城春草木深。\n感时花溅泪，恨别鸟惊心。\n烽火连三月，家书抵万金。\n白头搔更短，浑欲不胜簪。', sentimentTags: ['幽思', '思乡'], form: '五言律诗' },
  { id: 304, title: '登高', poetId: 2, poetName: '杜甫', dynastyId: 4,
    content: '风急天高猿啸哀，渚清沙白鸟飞回。\n无边落木萧萧下，不尽长江滚滚来。\n万里悲秋常作客，百年多病独登台。\n艰难苦恨繁霜鬓，潦倒新停浊酒杯。', sentimentTags: ['悲凉', '幽思'], form: '七言律诗' },
  { id: 305, title: '茅屋为秋风所破歌', poetId: 2, poetName: '杜甫', dynastyId: 4,
    content: '安得广厦千万间，大庇天下寒士俱欢颜！\n风雨不动安如山。', sentimentTags: ['豪放'], form: '古体诗·节选' },
  { id: 306, title: '如梦令·常记溪亭日暮', poetId: 3, poetName: '李清照', dynastyId: 5, spotId: 2,
    content: '常记溪亭日暮，沉醉不知归路。\n兴尽晚回舟，误入藕花深处。\n争渡，争渡，惊起一滩鸥鹭。', sentimentTags: ['婉约', '悠远'], form: '词' },
  { id: 307, title: '秋柳·其一', poetId: 4, poetName: '王士禛', dynastyId: 8, spotId: 2,
    content: '秋来何处最销魂，残照西风白下门。\n他日差池春燕影，只今憔悴晚烟痕。', sentimentTags: ['幽思', '怀古'], form: '七言律诗·节选' },
  { id: 308, title: '济南的冬天', poetId: 5, poetName: '老舍', dynastyId: 10, spotId: 2,
    content: '那水呢，不但不结冰，倒反在绿萍上冒着点热气。\n水藻真绿，把终年贮蓄的绿色全拿出来了。', sentimentTags: ['淡泊', '清新'], form: '散文·节选', appreciation: '济南水景文字选段，仅作版式样本；并非大明湖专篇。' },
  { id: 309, title: '如梦令·昨夜雨疏风骤', poetId: 3, poetName: '李清照', dynastyId: 5, spotId: 2,
    content: '昨夜雨疏风骤，浓睡不消残酒。\n试问卷帘人，却道海棠依旧。\n知否，知否？应是绿肥红瘦。', sentimentTags: ['婉约', '幽思'], form: '词' },
]

export const previewPoet = {
  id: 2, name: '杜甫', dynastyId: 4, dynastyName: '唐', birthYear: 712, deathYear: 770,
  birthplace: '河南巩县', zi: '子美', hao: '少陵野老', style: '沉郁顿挫，忧国忧民',
  biography: '杜甫，字子美，自号少陵野老，唐代伟大的现实主义诗人，与李白合称“李杜”。\n他一生忧国忧民，诗风沉郁顿挫，被后世尊为“诗圣”。\n杜甫的诗真实映照了唐代由盛转衰的历史面貌，被誉为“诗史”。',
  avatarUrl: art('dufu-portrait'), avatarAnimeUrl: art('dufu-portrait'),
  poems: previewPoems.filter((poem) => poem.poetId === 2),
}

export const previewPoets = [
  previewPoet,
  { id: 3, name: '李清照', dynastyId: 5, dynastyName: '宋', birthYear: 1084, deathYear: 1155, birthplace: '济南章丘', biography: '宋代词人，号易安居士，词作清丽婉约。', avatarUrl: art('poet-liqingzhao'), avatarAnimeUrl: art('poet-liqingzhao') },
  { id: 4, name: '王士禛', dynastyId: 8, dynastyName: '清', birthYear: 1634, deathYear: 1711, birthplace: '山东新城', biography: '清代诗人，号渔洋山人，以神韵说论诗。', avatarUrl: art('poet-wangshizhen'), avatarAnimeUrl: art('poet-wangshizhen') },
  { id: 5, name: '老舍', dynastyId: 10, dynastyName: '近现代', birthYear: 1899, deathYear: 1966, birthplace: '北京', biography: '现代作家，以温厚而生动的笔触描绘济南的山水与四季。', avatarUrl: art('poet-laoshe'), avatarAnimeUrl: art('poet-laoshe') },
].map((poet) => ({ ...poet, poems: previewPoems.filter((poem) => poem.poetId === poet.id) }))

export const previewCity = {
  name: '泰安', englishName: 'TAIAN CITY', subtitle: '五岳之首 · 天下泰安',
  description: '泰安位于山东省中部，因泰山而得名。这里山川壮丽，人文荟萃，山岳风光与绵延千年的文化记忆相映成趣。',
  location: '山东省中部，泰山脚下', history: '泰山文化的重要承载地', climate: '温带季风气候，四季分明', season: '春秋两季（3—5月、9—11月）',
}

export const previewSpots = [
  { name: '泰山风景区', slug: 'taishan', tag: '五岳之首', description: '巍巍岱宗，雄奇壮丽。山川、云海与石刻，展开齐鲁大地的一幅长卷。', history: '泰山承载着悠久的山岳崇拜与诗文传统。', travelTips: '登山观日出，寻访摩崖石刻。' },
  { name: '岱庙', slug: 'daimiao', tag: '天下第一庙', description: '古柏掩映，殿宇巍然。由一座庙宇，走近泰山的历史与礼制文化。', history: '历代修缮扩建，留存古建与碑刻。', travelTips: '漫步古建筑群，品读碑刻与壁画。' },
  { name: '红门宫', slug: 'hongmen', tag: '泰山第一行宫', description: '山门藏于苍松之间，石阶从这里向山间延伸，是寻访泰山的起点。', history: '红门一带汇集登山古道与传统建筑。', travelTips: '由红门步入山道，感受拾级而上的意趣。' },
  { name: '中天门', slug: 'zhongtianmen', tag: '登天门户', description: '半山云起，双峰夹峙。登临中天门，可俯瞰山城，仰望连绵峰峦。', history: '泰山登山中路的重要节点。', travelTips: '在半山驻足远眺，按体力规划登顶路线。' },
  { name: '南天门', slug: 'nantianmen', tag: '天门锁钥', description: '城楼凌云，横跨山口。穿过天门，山间云海与天街风光豁然展开。', history: '位于十八盘尽头，历代题咏众多。', travelTips: '观云海，游天街，体验高山气象。' },
  { name: '玉皇顶', slug: 'yuhuangding', tag: '泰山之巅', description: '群峰拱卫，视野开阔。极顶之上，日出、云海与苍岩相映成景。', history: '泰山主峰上的重要文化景观。', travelTips: '赏日出云海，寻访岱顶石刻。' },
].map((spot, i) => ({ ...spot, id: 101 + i, region: '泰安', imageUrl: art(`spot-${spot.slug}`), imageAnimeUrl: art(`spot-${spot.slug}`), poemCount: i === 0 ? 1 : 0, poems: i === 0 ? previewPoems.filter((poem) => poem.id === 302) : [] }))

export const previewSpot = {
  id: 2, name: '大明湖', region: '济南', longitude: 117.022, latitude: 36.675,
  description: '大明湖，位于山东省济南市历下区，湖水澄澈，众泉汇流。湖畔楼阁亭台，垂柳依依，自古为文人墨客吟咏之地，留下无数动人诗篇。',
  imageUrl: art('daming-lake'), imageAnimeUrl: art('daming-lake'),
  poems: previewPoems.filter((poem) => poem.spotId === 2),
}

// Homepage specimens use the same IDs as their links, without fetching production content.
const previewNineSights = NINE_SIGHTS.map((sight) => ({
  id: sight.spotId, name: sight.name, region: sight.city, description: sight.description,
  imageUrl: `/media/inkwash/sights/${sight.slug}.webp`,
  imageAnimeUrl: `/media/inkwash/sights/${sight.slug}.webp`,
  poems: [],
}))

export const findPreviewSpot = (id) =>
  [previewSpot, ...previewSpots, ...previewNineSights].find((entry) => String(entry.id) === String(id)) || null
