import { mockPoets, mockSpots } from './mockDetailData'

// Fallback database for client-side offline mock mode
export const mockPoetsList = [
  {
    id: 1,
    name: '李白',
    dynastyId: 4,
    birthYear: 701,
    deathYear: 762,
    birthplace: '陇西成纪 (今甘肃秦安)',
    avatarUrl: '/images/poets/li_bai.jpg',
    avatarAnimeUrl: '/images/poets/li_bai_anime.jpg',
    biography: mockPoets['李白'].impact,
    style: '浪漫主义 / 豪放飘逸'
  },
  {
    id: 2,
    name: '杜甫',
    dynastyId: 4,
    birthYear: 712,
    deathYear: 770,
    birthplace: '河南巩县 (今河南巩义)',
    avatarUrl: '/images/poets/du_fu.jpg',
    avatarAnimeUrl: '/images/poets/du_fu_anime.jpg',
    biography: mockPoets['杜甫'].impact,
    style: '现实主义 / 沉郁顿挫'
  },
  {
    id: 3,
    name: '李清照',
    dynastyId: 5,
    birthYear: 1084,
    deathYear: 1155,
    birthplace: '齐州历城 (今山东济南)',
    avatarUrl: '/images/poets/li_qingzhao.jpg',
    avatarAnimeUrl: '/images/poets/li_qingzhao_anime.jpg',
    biography: mockPoets['李清照'].impact,
    style: '婉约派 / 易安体'
  },
  {
    id: 4,
    name: '辛弃疾',
    dynastyId: 5,
    birthYear: 1140,
    deathYear: 1207,
    birthplace: '历城 (今山东济南)',
    avatarUrl: '/images/poets/xin_qiji.jpg',
    avatarAnimeUrl: '/images/poets/xin_qiji_anime.jpg',
    biography: mockPoets['辛弃疾'].impact,
    style: '豪放派 / 慷慨悲壮'
  },
  {
    id: 5,
    name: '赵孟頫',
    dynastyId: 6,
    birthYear: 1254,
    deathYear: 1322,
    birthplace: '浙江吴兴 (今浙江湖州)',
    avatarUrl: '/images/poets/zhao_mengfu_anime.jpg',
    avatarAnimeUrl: '/images/poets/zhao_mengfu_anime.jpg',
    biography: mockPoets['赵孟頫'].impact,
    style: '文人画开山祖师 / 楷书四大家'
  },
  {
    id: 6,
    name: '蒲松龄',
    dynastyId: 8,
    birthYear: 1640,
    deathYear: 1715,
    birthplace: '山东淄川 (今山东淄博)',
    avatarUrl: '/images/poets/pu_songling.jpg',
    avatarAnimeUrl: '/images/poets/pu_songling_anime.jpg',
    biography: mockPoets['蒲松龄'].impact,
    style: '奇幻聊斋 / 孤愤讽刺'
  }
]

export const mockSpotsList = [
  {
    id: 1,
    name: '趵突泉',
    address: '山东省济南市历下区趵突泉南路1号',
    imageUrl: '/images/spots/baotu_spring.jpg',
    imageAnimeUrl: '/images/spots/baotu_spring_anime.jpg',
    region: '济南',
    description: '趵突泉位列济南七十二名泉之首，被誉为“天下第一泉”。三股泉水腾空喷涌，雪涛四溅，声震大明湖，自古是文人大家流连忘返的胜地。'
  },
  {
    id: 2,
    name: '大明湖',
    address: '山东省济南市历下区大明湖路271号',
    imageUrl: '/images/spots/daming_lake.jpg',
    imageAnimeUrl: '/images/spots/daming_lake_anime.jpg',
    region: '济南',
    description: '大明湖由济南市区众泉汇流而成，素有“一城山色半城湖”的美誉。湖畔历下亭、铁公祠等古迹林立，见证了李白、杜甫、李清照等文人的诗情画意。'
  },
  {
    id: 3,
    name: '泰山',
    address: '山东省泰安市泰山区红门路',
    imageUrl: '/images/spots/mount_tai.jpg',
    imageAnimeUrl: '/images/spots/mount_tai_anime.jpg',
    region: '泰安',
    description: '泰山为五岳之首，是世界文化与自然双重遗产。自秦汉起历代帝王在此封禅，文人大家在此登临写下千古绝唱，被视为中华民族精神的象征。'
  },
  {
    id: 4,
    name: '岱庙',
    address: '山东省泰安市泰山区东岳大街',
    imageUrl: '/images/spots/mount_tai.jpg',
    imageAnimeUrl: '/images/spots/mount_tai_anime.jpg',
    region: '泰安',
    description: '岱庙是泰山封禅祭祀的场所，与故宫、孔庙并称中国三大古建筑群。庙内碑碣林立，完好保存着历代帝王祭祀泰山的珍贵碑刻与文物。'
  },
  {
    id: 5,
    name: '曲阜三孔',
    address: '山东省济宁市曲阜市静轩东路',
    imageUrl: '/images/spots/three_confucius_anime.jpg',
    imageAnimeUrl: '/images/spots/three_confucius_anime.jpg',
    region: '济宁',
    description: '曲阜孔庙、孔府、孔林统称“三孔”，是祭祀孔子、儒家文化的朝圣之地，具有极其厚重的儒学传统与学术殿堂意义。'
  },
  {
    id: 6,
    name: '黄河入海口',
    address: '山东省东营市垦利区黄河口镇',
    imageUrl: '/images/spots/yellow_river_estuary_anime.jpg',
    imageAnimeUrl: '/images/spots/yellow_river_estuary_anime.jpg',
    region: '东营',
    description: '万里黄河由此奔腾入海，呈现出“黄蓝交汇”的壮丽奇观。这里拥有中国最完整、最年轻的湿地生态系统，是野趣盎然的文学采风圣地。'
  },
  {
    id: 7,
    name: '光岳楼',
    address: '山东省聊城市东昌府区古城中心',
    imageUrl: '/images/spots/guangyue_tower_anime.jpg',
    imageAnimeUrl: '/images/spots/guangyue_tower_anime.jpg',
    region: '聊城',
    description: '光岳楼建于明代，是京杭大运河畔的地标性木构高楼，乾隆帝曾多次登临，是古代漕运繁华与运河文脉的杰出见证。'
  },
  {
    id: 8,
    name: '蒲松龄纪念馆',
    address: '山东省淄博市淄川区洪山镇蒲家庄',
    imageUrl: '/images/spots/mount_tai.jpg',
    imageAnimeUrl: '/images/spots/mount_tai_anime.jpg',
    region: '淄博',
    description: '蒲松龄故居原址，聊斋文化的发源地。蒲松龄曾在此设茶采风，整理民间奇闻，用毕生心血写就文言小说巅峰《聊斋志异》。'
  },
  {
    id: 9,
    name: '苏禄王墓',
    address: '山东省德州市德城区北陵路',
    imageUrl: '/images/spots/sulu_tomb_anime.jpg',
    imageAnimeUrl: '/images/spots/sulu_tomb_anime.jpg',
    region: '德州',
    description: '古苏禄国东王访华病逝于德州后，永乐大帝以藩王礼厚葬于此，是中国境内唯一的外国君王陵墓，见证海上丝路交往。'
  },
  {
    id: 10,
    name: '魏氏庄园',
    address: '山东省滨州市惠民县魏集镇',
    imageUrl: '/images/spots/wei_manor_anime.jpg',
    imageAnimeUrl: '/images/spots/wei_manor_anime.jpg',
    region: '滨州',
    description: '建于清末的城堡式庄园，将北方传统四合院建筑与军事城堡防御体系紧密结合，是黄河下游豪强世家的独特民居范例。'
  },
  {
    id: 11,
    name: '曹州牡丹园',
    address: '山东省菏泽市牡丹区人民路',
    imageUrl: '/images/spots/peony_garden_anime.jpg',
    imageAnimeUrl: '/images/spots/peony_garden_anime.jpg',
    region: '菏泽',
    description: '菏泽是著名的“中国牡丹之都”，曹州牡丹园面积宏大，栽培历史悠久，谷雨时节万紫千红，李白等文人都曾留下赏花名篇。'
  }
]
