// Nine riverside cities, upstream → downstream. Verses are real lines from the
// platform's own data (config/nineSights.js), each bound to a poem id in sjg01.
export const CITIES = [
  { name: '菏泽', pinyin: 'HEZE', tag: '牡丹甲天下', sight: '曹州牡丹', verse: '一见曹南三百种，从今不数洛花红。', poet: '王曰高', dynasty: '清', art: 'peony' },
  { name: '济宁', pinyin: 'JINING', tag: '孔子故里', sight: '曲阜孔庙', verse: '千年礼乐归东鲁，万古衣冠拜素王。', poet: '戴璟', dynasty: '明', art: 'kongmiao' },
  { name: '泰安', pinyin: 'TAIAN', tag: '五岳之首', sight: '泰山', verse: '会当凌绝顶，一览众山小。', poet: '杜甫', dynasty: '唐', art: 'taishan' },
  { name: '聊城', pinyin: 'LIAOCHENG', tag: '鱼山·阿井', sight: '东阿', verse: '阿胶煮灵泉，鱼山郁嵯峨。', poet: '杨维桢', dynasty: '元', art: 'guangyue' },
  { name: '济南', pinyin: 'JINAN', tag: '泉城明湖', sight: '大明湖', verse: '海右此亭古，济南名士多。', poet: '杜甫', dynasty: '唐', art: 'daming' },
  { name: '德州', pinyin: 'DEZHOU', tag: '运河古道', sight: '卫运河', verse: '河流曲曲转，十里还相唤。', poet: '王世贞', dynasty: '明', art: 'dezhou' },
  { name: '淄博', pinyin: 'ZIBO', tag: '齐北水乡', sight: '马踏湖', verse: '锦湖水色胜湘湖，雉尾莼羹玉不如。', poet: '王士禛', dynasty: '清', art: 'zibo' },
  { name: '滨州', pinyin: 'BINZHOU', tag: '东临碣石', sight: '无棣碣石山', verse: '东临碣石，以观沧海。', poet: '曹操', dynasty: '汉', art: 'binzhou' },
  { name: '东营', pinyin: 'DONGYING', tag: '黄河入海', sight: '东津渡', verse: '济流千曲赴东津，万壑朝宗汇海滨。', poet: '刘学渤', dynasty: '清', art: 'dongying' },
]

// Platform totals, counted straight from sjg01 (2026-10-02).
export const STATS = [
  { value: 129, unit: '位', label: '诗人', en: 'poets' },
  { value: 203, unit: '首', label: '诗词', en: 'poems' },
  { value: 71, unit: '处', label: '胜迹', en: 'sites' },
  { value: 63, unit: '项', label: '风物', en: 'cultural entries' },
]
