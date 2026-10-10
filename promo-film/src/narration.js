// Narration lines for the film. `id` is referenced by shots; `text` is spoken as-is.
// Keep sentences short — they are also the on-screen captions.
export const VOICE = process.env.SJG_VOICE || 'Tingting'
export const RATE = Number(process.env.SJG_RATE || 182)

export const LINES = [
  { id: 'open', text: '黄河，自西而来，过山东，入海。', en: 'The Yellow River comes from the west, crosses Shandong, and meets the sea.' },
  { id: 'river', text: '九曲黄河万里沙——一条大河，用两千年，写下了九座城。', en: 'Nine bends, ten thousand leagues of sand — one river, two thousand years, nine cities.' },
  { id: 'nine', text: '九座城，沿着这条河排开。', en: 'Nine cities, strung along this river.' },
  // 九城：一城一条，画面时长按各自旁白实测自动对齐（plan.js 的 fit）。
  // 文案默认「城名 + 城标」，与画面上的 `tag · sight` 呼应；换配音时只改这里的 text 即可。
  { id: 'city-0', text: '菏泽，牡丹甲天下。', en: 'Heze — where the peony reigns.' },
  { id: 'city-1', text: '济宁，孔子故里。', en: 'Jining — the hometown of Confucius.' },
  { id: 'city-2', text: '泰安，五岳之首。', en: 'Tai’an — first of the five sacred peaks.' },
  { id: 'city-3', text: '聊城，鱼山阿井。', en: 'Liaocheng — Yushan and the Ajing well.' },
  { id: 'city-4', text: '济南，泉城明湖。', en: 'Jinan — city of springs and Daming Lake.' },
  { id: 'city-5', text: '德州，运河古道。', en: 'Dezhou — on the old Grand Canal.' },
  { id: 'city-6', text: '淄博，齐北水乡。', en: 'Zibo — the water country north of Qi.' },
  { id: 'city-7', text: '滨州，东临碣石。', en: 'Binzhou — facing the Jieshi cliffs.' },
  { id: 'city-8', text: '东营，黄河入海。', en: 'Dongying — where the Yellow River meets the sea.' },
  { id: 'bond', text: '城因河而生，诗因人而传。', en: 'Cities rise from the river; poems pass down through people.' },
  // 泉与山：一景一镜、一句一镜（原来两幅画各裁一半并排，画风与密度都在打架）
  { id: 'lake-spring', text: '湖泊是泉的注脚。', en: 'The lake is a footnote to the spring.' },
  { id: 'lake-peak', text: '高山是河的回望。', en: 'The mountain looks back at the river.' },
  { id: 'peak', text: '会当凌绝顶，一览众山小。古人站在河边，写下的从来不只是风景。', en: '“When I reach the summit, all other peaks look small.” What they wrote was never only scenery.' },
  { id: 'gather', text: '我们把这些诗、这些人、这些地方，收回到同一条河边。', en: 'We gathered these poems, these people, these places back to one river.' },
  { id: 'numbers', text: '一百二十九位诗人，两百零三首诗，七十一处胜迹，六十三项风物。', en: '129 poets, 203 poems, 71 sites, 63 cultural entries.' },
  { id: 'source', text: '每一条内容，都经过审核，可以追溯。', en: 'Every entry is reviewed and traceable.' },
  { id: 'ai', text: 'AI 小文给出的不是答案，是通往原文的路。', en: 'AI Xiaowen gives not an answer, but a path back to the original text.' },
  { id: 'teach', text: '从一首诗出发，做一个探究任务，再写回你自己的句子。', en: 'Start from a poem, take on an inquiry task, write back your own line.' },
  { id: 'sign', text: '山河有迹，文脉有声。', en: 'The mountains and rivers bear traces; the literary vein has a voice.' },
]
