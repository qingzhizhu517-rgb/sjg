import { mockPoets, mockSpots, mockCities } from './mockDetailData'

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
    avatarUrl: '/images/poets/zhao_mengfu.jpg',
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
    imageUrl: '/images/spots/baotu_real.jpg',
    imageAnimeUrl: '/images/spots/baotu_anime.jpg',
    region: '济南',
    description: '趵突泉位列济南七十二名泉之首，被誉为“天下第一泉”。三股泉水腾空喷涌，雪涛四溅，声震大明湖，自古是文人大家流连忘返的胜地。'
  },
  {
    id: 2,
    name: '大明湖',
    address: '山东省济南市历下区大明湖路271号',
    imageUrl: '/images/spots/daming_real.jpg',
    imageAnimeUrl: '/images/spots/daming_anime.jpg',
    region: '济南',
    description: '大明湖由济南市区众泉汇流而成，素有“一城山色半城湖”的美誉。湖畔历下亭、铁公祠等古迹林立，见证了李白、杜甫、李清照等文人的诗情画意。'
  },
  {
    id: 3,
    name: '泰山',
    address: '山东省泰安市泰山区红门路',
    imageUrl: '/images/spots/taishan_real.jpg',
    imageAnimeUrl: '/images/spots/taishan_anime.jpg',
    region: '泰安',
    description: '泰山为五岳之首，是世界文化与自然双重遗产。自秦汉起历代帝王在此封禅，文人大家在此登临写下千古绝唱，被视为中华民族精神的象征。'
  },
  {
    id: 4,
    name: '岱庙',
    address: '山东省泰安市泰山区东岳大街',
    imageUrl: '/images/spots/daimiao_real.jpg',
    imageAnimeUrl: '/images/spots/daimiao_anime.jpg',
    region: '泰安',
    description: '岱庙是泰山封禅祭祀的场所，与故宫、孔庙并称中国三大古建筑群。庙内碑碣林立，完好保存着历代帝王祭祀泰山的珍贵碑刻与文物。'
  },
  {
    id: 5,
    name: '曲阜三孔',
    address: '山东省济宁市曲阜市静轩东路',
    imageUrl: '/images/spots/sankong_real.jpg',
    imageAnimeUrl: '/images/spots/sankong_anime.jpg',
    region: '济宁',
    description: '曲阜孔庙、孔府、孔林统称“三孔”，是祭祀孔子、儒家文化的朝圣之地，具有极其厚重的儒学传统与学术殿堂意义。'
  },
  {
    id: 6,
    name: '黄河入海口',
    address: '山东省东营市垦利区黄河口镇',
    imageUrl: '/images/spots/huanghe_real.jpg',
    imageAnimeUrl: '/images/spots/huanghe_anime.jpg',
    region: '东营',
    description: '万里黄河由此奔腾入海，呈现出“黄蓝交汇”的壮丽奇观。这里拥有中国最完整、最年轻的湿地生态系统，是野趣盎然的文学采风圣地。'
  },
  {
    id: 7,
    name: '光岳楼',
    address: '山东省聊城市东昌府区古城中心',
    imageUrl: '/images/spots/guangyue_real.jpg',
    imageAnimeUrl: '/images/spots/guangyue_anime.jpg',
    region: '聊城',
    description: '光岳楼建于明代，是京杭大运河畔的地标性木构高楼，乾隆帝曾多次登临，是古代漕运繁华与运河文脉的杰出见证。'
  },
  {
    id: 8,
    name: '蒲松龄纪念馆',
    address: '山东省淄博市淄川区洪山镇蒲家庄',
    imageUrl: '/images/spots/liaozhai_real.jpg',
    imageAnimeUrl: '/images/spots/liaozhai_anime.jpg',
    region: '淄博',
    description: '蒲松龄故居原址，聊斋文化的发源地。蒲松龄曾在此设茶采风，整理民间奇闻，用毕生心血写就文言小说巅峰《聊斋志异》。'
  },
  {
    id: 9,
    name: '苏禄王墓',
    address: '山东省德州市德城区北陵路',
    imageUrl: '/images/spots/sulu_real.jpg',
    imageAnimeUrl: '/images/spots/sulu_anime.jpg',
    region: '德州',
    description: '古苏禄国东王访华病逝于德州后，永乐大帝以藩王礼厚葬于此，是中国境内唯一的外国君王陵墓，见证海上丝路交往。'
  },
  {
    id: 10,
    name: '魏氏庄园',
    address: '山东省滨州市惠民县魏集镇',
    imageUrl: '/images/spots/weishi_real.jpg',
    imageAnimeUrl: '/images/spots/weishi_anime.jpg',
    region: '滨州',
    description: '建于清末的城堡式庄园，将北方传统四合院建筑与军事城堡防御体系紧密结合，是黄河下游豪强世家的独特民居范例。'
  },
  {
    id: 11,
    name: '曹州牡丹园',
    address: '山东省菏泽市牡丹区人民路',
    imageUrl: '/images/spots/mudan_real.jpg',
    imageAnimeUrl: '/images/spots/mudan_anime.jpg',
    region: '菏泽',
    description: '菏泽是著名的“中国牡丹之都”，曹州牡丹园面积宏大，栽培历史悠久，谷雨时节万紫千红，李白等文人都曾留下赏花名篇。'
  }
]

export const mockPoemsList = [
  {
    id: 1,
    title: '望岳',
    content: '岱宗夫如何？齐鲁青未了。\n造化钟神秀，阴阳割昏晓。\n\n荡胸生曾云，决眦入归鸟。\n会当凌绝顶，一览众山小。',
    poetId: 2,
    dynastyId: 4,
    spotId: 3,
    annotation: '1. 岱宗：泰山的别称。五岳之首，故尊为宗。\n2. 青未了：青绿的颜色无边无际，望不到头。\n3. 造化：指大自然。钟：汇聚。\n4. 曾云：层云。曾，通“层”。\n5. 决眦：眼角几乎裂开，形容极力睁大眼睛远望。眦，眼角。\n6. 会当：终当，一定要。',
    background: '这首诗是杜甫青年时代的作品。开元二十四年（736年），二十五岁的杜甫赴东都洛阳应进士试落第，随后他放下包袱，开始了长达数年的齐鲁游历。《望岳》即作于此次壮游泰山期间，全诗气骨峥嵘，写出了泰山的雄浑巍峨，更寄托了诗人年轻时博大的胸襟与高远的抱负。',
    audioUrl: '',
    videoUrl: '',
    sentimentTags: '豪放,壮志,自然,开阔'
  },
  {
    id: 2,
    title: '陪李北海宴历下亭',
    content: '东藩驻皂盖，北渚起朱楼。\n常接双飞鹭，忽同万里舟。\n\n水木檐前近，风云阁上浮。\n海右此亭古，济南名士多。\n\n恭敬怀熙熙，徘徊意悠悠。',
    poetId: 2,
    dynastyId: 4,
    spotId: 2,
    annotation: '1. 李北海：即李邕，曾任北海太守，世称李北海，是盛唐著名的文学家、书法家。\n2. 历下亭：位于济南大明湖中，是当时文人雅聚的名胜。\n3. 海右：指山东地区（古人以西为右，山东在黄海之西）。\n4. 名士：有名望的读书人。',
    background: '天宝四载（745年），杜甫在齐鲁交游期间，与当时的书法大家、北海太守李邕（李北海）在大明湖历下亭聚会。席间还有高适等名士相伴。杜甫在宴席上欣然命笔，写下了这首陪宴诗，其中“海右此亭古，济南名士多”成为千百年来济南城市文化最耀眼的注脚。',
    audioUrl: '',
    videoUrl: '',
    sentimentTags: '雅致,畅怀,历史,社交'
  },
  {
    id: 3,
    title: '如梦令·常记溪亭日暮',
    content: '常记溪亭日暮，沉醉不知归路。\n兴尽晚回舟，误入藕花深处。\n\n争渡，争渡，惊起一滩鸥鹭。',
    poetId: 3,
    dynastyId: 5,
    spotId: 2,
    annotation: '1. 溪亭：济南名胜亭阁，当时靠近水域湖畔。\n2. 沉醉：醉心于美景，也指喝醉了酒。\n3. 藕花：荷花。\n4. 争渡：奋力把船划出去。',
    background: '这首词是李清照早期的代表作，写的是她少女时代在故乡齐州历城（今济南）游玩大明湖溪亭的欢快经历。词作格调活泼恬淡，音律流畅，通过“误入藕花”、“惊起鸥鹭”等动作，勾勒出一幅充满青春朝气与大自然和谐共处的优美画卷。',
    audioUrl: '',
    videoUrl: '',
    sentimentTags: '婉约,闲适,青春,自然'
  },
  {
    id: 4,
    title: '将进酒',
    content: '君不见黄河之水天上来，奔流到海不复还。\n君不见高堂明镜悲白发，朝如青丝暮成雪。\n\n人生得意须尽欢，莫使金樽空对月。\n天生我材必有用，千金散尽还复来。\n\n烹羊宰牛且为乐，会须一饮三百杯。\n岑夫子，丹丘生，将进酒，杯莫停。',
    poetId: 1,
    dynastyId: 4,
    spotId: 6,
    annotation: '1. 将进酒：劝酒歌，乐府旧题。\n2. 高堂：房屋的正室，这里指父母或长辈，亦指照镜子时看到的镜中自己。\n3. 岑夫子：岑勋。丹丘生：元丹丘。二人皆为李白挚友。\n4. 天生我材必有用：比喻豪迈坚定的自我价值信念。',
    background: '唐天宝十一载（752年），李白被赐金放还已有数年，他在齐鲁、梁宋之间漫游。此时，他与好友岑勋、元丹丘相聚于嵩山。诗人面对大好山河，回想起长安岁月与漂泊身世，悲愤与豪情交织，在狂饮大醉中写下了这首气势磅礴、情感如黄河奔腾般的千古杰作。',
    audioUrl: '',
    videoUrl: '',
    sentimentTags: '豪放,悲怆,自负,狂放'
  },
  {
    id: 5,
    title: '趵突泉',
    content: '泺水发源天下无，平地涌出白玉壶。\n谷源水涌喷雪涛，波澜声震大明湖。\n\n时来泉上濯尘土，冰雪满怀清兴孤。\n云雾蒸腾润原野，历下胜景冠九区。',
    poetId: 5,
    dynastyId: 6,
    spotId: 1,
    annotation: '1. 泺水：趵突泉古称“泺”。\n2. 白玉壶：比喻泉水清冽洁白，如同玉壶中涌出。\n3. 濯尘土：洗涤凡尘的污垢，意指超凡脱俗。',
    background: '元至元二十九年（1292年），赵孟頫出任同知济南路总管府事。在济南任职的三年期间，他深深沉醉于泉城的山水。他不仅画下了不朽的《鹊华秋色图》，还多次游历趵突泉，写下了这首著名的赞美诗，将泉水喷涌比作白玉壶、雪涛，成为歌咏趵突泉的代表作。',
    audioUrl: '',
    videoUrl: '',
    sentimentTags: '清雅,赞美,淡泊,豁达'
  },
  {
    id: 6,
    title: '永遇乐·京口北固亭怀古',
    content: '千古江山，英雄无觅，孙仲谋处。\n舞榭歌台，风流总被，雨打风吹去。\n\n斜阳草树，寻常巷陌，人道寄奴曾住。\n想当年，金戈铁马，气吞万里如虎。',
    poetId: 4,
    dynastyId: 5,
    spotId: 2,
    annotation: '1. 觅：寻找。\n2. 孙仲谋：三国时期吴国大帝孙权。\n3. 寄奴：南朝宋武帝刘裕小名。\n4. 金戈铁马：精良的兵器与战马，形容军队强盛。',
    background: '宋开禧元年（1205年），赋闲已久的辛弃疾被起用为知镇江府。此时韩侂胄正急于北伐，以图建功。辛弃疾登临京口北固亭，登高远眺，怀古伤今。他极目北望中原失地，写下了这首慷慨悲凉的词作，抒发了英雄无用武之地的无限悲愤与强烈的家国志向。',
    audioUrl: '',
    videoUrl: '',
    sentimentTags: '豪放,悲壮,怀古,忧国'
  }
]

export const mockTimeline = [
  {
    dynasty: { id: 4, name: '唐代', startYear: 618, endYear: 907 },
    events: [
      { id: 1, title: '盛唐交游', year: 744, significance: '李白与杜甫在洛阳结识，随后同游齐鲁大地，同拜李北海，留下了中国文学史上最深厚的李杜友谊。' },
      { id: 2, title: '安史之乱爆发', year: 755, significance: '大唐帝国由盛转衰的转折点，杜甫经历战乱流离，写下“三吏三别”，文学风骨走向写实忧国。' }
    ],
    poets: [
      { id: 1, name: '李白' },
      { id: 2, name: '杜甫' }
    ],
    poems: [
      { id: 1, title: '望岳' },
      { id: 2, title: '陪李北海宴历下亭' },
      { id: 4, title: '将进酒' }
    ]
  },
  {
    dynasty: { id: 5, name: '宋代', startYear: 960, endYear: 1279 },
    events: [
      { id: 3, title: '靖康之变与南渡', year: 1127, significance: '金兵南下，北宋灭亡。李清照等文人流亡江南，后期词作风格由活泼闺情转向家国沧桑。' },
      { id: 4, title: '稼轩南下归宋', year: 1162, significance: '辛弃疾率骑义军突袭敌营，生擒叛徒后归宋。南宋朝廷偏安江南，辛弃疾主张抗金受阻，退隐作词。' }
    ],
    poets: [
      { id: 3, name: '李清照' },
      { id: 4, name: '辛弃疾' }
    ],
    poems: [
      { id: 3, title: '如梦令·常记溪亭日暮' },
      { id: 6, title: '永遇乐·京口北固亭怀古' }
    ]
  },
  {
    dynasty: { id: 6, name: '元代', startYear: 1271, endYear: 1368 },
    events: [
      { id: 5, title: '赵孟頫总管济南', year: 1292, significance: '赵孟頫出任济南总管，游历大明湖与趵突泉，描摹鹊华二山，留下了传世画作《鹊华秋色图》。' }
    ],
    poets: [
      { id: 5, name: '赵孟頫' }
    ],
    poems: [
      { id: 5, title: '趵突泉' }
    ]
  },
  {
    dynasty: { id: 8, name: '清代', startYear: 1644, endYear: 1912 },
    events: [
      { id: 6, title: '聊斋志异成书', year: 1680, significance: '蒲松龄在故乡淄川挑灯执笔，创作完成了文言短篇小说集《聊斋志异》，揭露封建科举与官场黑暗。' }
    ],
    poets: [
      { id: 6, name: '蒲松龄' }
    ],
    poems: []
  }
]

// Centralized query mock API route helper for offline development
export const getFallbackData = (url, params = {}) => {
  const cleanUrl = url.replace(/^\/api\/public/, '').replace(/^\/api/, '')
  
  // 1. /timeline
  if (cleanUrl === '/timeline') {
    return mockTimeline
  }
  
  // 2. /poets
  if (cleanUrl === '/poets') {
    return {
      total: mockPoetsList.length,
      records: mockPoetsList
    }
  }
  
  // 3. /poets/:id
  const poetMatch = cleanUrl.match(/^\/poets\/(\d+)$/)
  if (poetMatch) {
    const id = parseInt(poetMatch[1])
    const poet = mockPoetsList.find(p => p.id === id)
    if (poet) {
      const dynastyMapping = {
        4: { id: 4, name: '唐代', startYear: 618, endYear: 907 },
        5: { id: 5, name: '宋代', startYear: 960, endYear: 1279 },
        6: { id: 6, name: '元代', startYear: 1271, endYear: 1368 },
        8: { id: 8, name: '清代', startYear: 1644, endYear: 1912 }
      }
      return {
        poet,
        dynasty: dynastyMapping[poet.dynastyId] || { name: '古代' },
        poems: mockPoemsList.filter(p => p.poetId === id)
      }
    }
  }
  
  // 4. /spots
  if (cleanUrl === '/spots') {
    const region = params.region
    let records = mockSpotsList
    if (region) {
      records = mockSpotsList.filter(s => s.region === region)
    }
    return {
      total: records.length,
      records
    }
  }
  
  // 5. /spots/:id
  const spotMatch = cleanUrl.match(/^\/spots\/(\d+)$/)
  if (spotMatch) {
    const id = parseInt(spotMatch[1])
    const spot = mockSpotsList.find(s => s.id === id)
    if (spot) {
      return {
        spot,
        poems: mockPoemsList.filter(p => p.spotId === id)
      }
    }
  }
  
  // 6. /poems
  if (cleanUrl === '/poems') {
    return {
      total: mockPoemsList.length,
      records: mockPoemsList
    }
  }
  
  // 7. /poems/:id
  const poemMatch = cleanUrl.match(/^\/poems\/(\d+)$/)
  if (poemMatch) {
    const id = parseInt(poemMatch[1])
    const poem = mockPoemsList.find(p => p.id === id)
    if (poem) {
      const poet = mockPoetsList.find(p => p.id === poem.poetId)
      const spot = mockSpotsList.find(s => s.id === poem.spotId)
      const dynastyMapping = {
        4: { id: 4, name: '唐代' },
        5: { id: 5, name: '宋代' },
        6: { id: 6, name: '元代' },
        8: { id: 8, name: '清代' }
      }
      return {
        poem,
        poet,
        dynasty: dynastyMapping[poem.dynastyId] || { name: '古代' },
        spot
      }
    }
  }
  
  return null
}
