// 九城国画与叙事配置（沿黄河流向自西向东：入境 → 入海）
// 供 RegionSpots（城市宣传页）与 RiverCityRail（首页沿河分布）共用
import imgHeze from '../assets/illustrations/01-city-heze.png'
import imgJining from '../assets/illustrations/02-city-jining.png'
import imgTaian from '../assets/illustrations/03-city-taian.png'
import imgLiaocheng from '../assets/illustrations/04-city-liaocheng.png'
import imgJinan from '../assets/illustrations/05-city-jinan.png'
import imgDezhou from '../assets/illustrations/06-city-dezhou.png'
import imgZibo from '../assets/illustrations/07-city-zibo.png'
import imgBinzhou from '../assets/illustrations/08-city-binzhou.png'
import imgDongying from '../assets/illustrations/09-city-dongying.png'

export const CITY_RIVER_ORDER = [
  '菏泽', '济宁', '泰安', '聊城', '济南', '德州', '淄博', '滨州', '东营',
]

export const CITY_ILLUSTRATIONS = {
  菏泽: {
    img: imgHeze,
    reach: '上游 · 入境',
    reachEn: 'UPSTREAM',
    quote: '唯有牡丹真国色，花开时节动京城。',
    quoteBy: '唐 · 刘禹锡《赏牡丹》',
  },
  济宁: {
    img: imgJining,
    reach: '上游 · 孔孟之乡',
    reachEn: 'UPSTREAM',
    quote: '登东山而小鲁，登泰山而小天下。',
    quoteBy: '《孟子 · 尽心上》',
  },
  泰安: {
    img: imgTaian,
    reach: '上游 · 五岳独尊',
    reachEn: 'UPSTREAM',
    quote: '会当凌绝顶，一览众山小。',
    quoteBy: '唐 · 杜甫《望岳》',
  },
  聊城: {
    img: imgLiaocheng,
    reach: '中游 · 运河古都',
    reachEn: 'MIDSTREAM',
    quote: '漕船东来千万艘，江北水城夜未央。',
    quoteBy: '运河谣 · 聊城',
  },
  济南: {
    img: imgJinan,
    reach: '中游 · 泉城',
    reachEn: 'MIDSTREAM',
    quote: '海右此亭古，济南名士多。',
    quoteBy: '唐 · 杜甫《陪李北海宴历下亭》',
  },
  德州: {
    img: imgDezhou,
    reach: '中游 · 九达天衢',
    reachEn: 'MIDSTREAM',
    quote: '运河水长流，德州古码头。',
    quoteBy: '运河谣 · 德州',
  },
  淄博: {
    img: imgZibo,
    reach: '下游 · 齐国故都',
    reachEn: 'DOWNSTREAM',
    quote: '泱泱齐风，悠悠千载。',
    quoteBy: '齐风 · 淄博',
  },
  滨州: {
    img: imgBinzhou,
    reach: '下游 · 黄河湿地',
    reachEn: 'DOWNSTREAM',
    quote: '黄河滩上芦花白，渤海湾边雁阵长。',
    quoteBy: '湿地谣 · 滨州',
  },
  东营: {
    img: imgDongying,
    reach: '入海 · 河海交汇',
    reachEn: 'ESTUARY',
    quote: '黄河之水天上来，奔流到海不复回。',
    quoteBy: '唐 · 李白《将进酒》',
  },
}

// 河段顺序索引（菏泽 0 → 东营 8），用于"沿河而下·下一站"导航
export const cityRiverIndex = (name) => CITY_RIVER_ORDER.indexOf(name)

export const nextCityOf = (name) => {
  const i = cityRiverIndex(name)
  return i >= 0 && i < CITY_RIVER_ORDER.length - 1 ? CITY_RIVER_ORDER[i + 1] : null
}

export const cityIllustration = (name) =>
  CITY_ILLUSTRATIONS[name] || {
    img: imgJinan,
    reach: '黄河流域',
    reachEn: 'YELLOW RIVER',
    quote: '黄河九曲，齐鲁揽胜。',
    quoteBy: '山河图志',
  }
