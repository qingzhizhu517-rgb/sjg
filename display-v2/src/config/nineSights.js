// 首页「九城胜迹」：沿黄九市各一处代表景点的预设数据（不请求接口）。
// - spotId 对应 scenic_spot.id（sjg01），用于跳转景点详情。
// - verse 必须是 poem 表中真实存在、且关联到该景点的原句，poemId 为出处，禁止拼接或改写。
// - slug 同时是配图文件名：public/media/inkwash/sights/<slug>.webp（青绿山水插画）。
export const NINE_SIGHTS = [
  { city: '菏泽', spotId: 54, name: '曹州牡丹', slug: 'heze-peony', tag: '牡丹甲天下', poemId: 154, verse: '一见曹南三百种，从今不数洛花红。', poem: '曹南牡丹四首・其三', poet: '王曰高', dynasty: '清', description: '曹州自古以牡丹名世，花开时节满城锦绣，诗人誉其胜过洛阳。' },
  { city: '济宁', spotId: 21, name: '曲阜孔庙', slug: 'jining-confucius', tag: '孔子故里', poemId: 93, verse: '今看两楹奠，当与梦时同。', poem: '经邹鲁祭孔子而叹之', poet: '李隆基', dynasty: '唐', description: '始建于鲁哀公十七年，历代扩建，殿庑森然，古桧参天，儒学之源。' },
  { city: '泰安', spotId: 14, name: '泰山', slug: 'taian-taishan', tag: '五岳之首', poemId: 36, verse: '会当凌绝顶，一览众山小。', poem: '望岳', poet: '杜甫', dynasty: '唐', description: '岱宗巍然，历代帝王封禅、文人登临，摩崖石刻遍布山间。' },
  { city: '聊城', spotId: 55, name: '东阿', slug: 'liaocheng-donge', tag: '鱼山·文脉', poemId: 156, verse: '君王不得为天子，半为当时赋洛神。', poem: '东阿王', poet: '李商隐', dynasty: '唐', description: '循曹植文脉走近东阿与鱼山；诗为咏史怀人之作，不作作者到访此地的证据。' },
  { city: '济南', spotId: 1, name: '大明湖', slug: 'jinan-daming', tag: '泉城明湖', poemId: 1, verse: '海右此亭古，济南名士多。', poem: '陪李北海宴历下亭', poet: '杜甫', dynasty: '唐', description: '众泉汇流成湖，杜甫与李邕宴游历下亭，留下「济南名士多」的典故。' },
  { city: '德州', spotId: 17, name: '卫运河', slug: 'dezhou-weihe', tag: '运河古道', poemId: 60, verse: '河流曲曲转，十里还相唤。', poem: '卫河', poet: '王世贞', dynasty: '明', description: '原为黄河故道，后为京杭运河要段，漕船往来，舟子相唤于曲折河湾。' },
  { city: '淄博', spotId: 63, name: '马踏湖', slug: 'zibo-matahu', tag: '齐北水乡', poemId: 178, verse: '锦湖水色胜湘湖，雉尾莼羹玉不如。', poem: '锦秋湖竹枝词・其一', poet: '王士禛', dynasty: '清', description: '古称锦秋湖，依黄河古河道洼地成湖，芦苇连天，盛产莼菜湖鲜。' },
  { city: '滨州', spotId: 71, name: '无棣碣石山', slug: 'binzhou-jieshi', tag: '东临碣石', poemId: 201, verse: '东临碣石，以观沧海。', poem: '观沧海', poet: '曹操', dynasty: '汉', description: '鲁北平原孤丘，古称碣石，为《观沧海》所咏之地的一说（另说在河北昌黎）。' },
  { city: '东营', spotId: 65, name: '黄河大堤', slug: 'dongying-dongjin', tag: '黄河入海', poemId: 204, verse: '九曲黄河万里沙，浪淘风簸自天涯。', poem: '浪淘沙九首·其一', poet: '刘禹锡', dynasty: '唐', description: '沿堤感受大河入海的辽阔；诗按黄河主题关联，不代表作者在东营创作。' },
]
