const jinanArt = (name) => `/media/inkwash/city-experiences/jinan-${name}-v1.webp`

// 体验是浏览入口，不代表已审核的景点或文化记录。
export function cityExperiences(region, cityImage) {
  const city = String(region || '').replace(/市$/, '')
  const jinan = city === '济南'
  const taian = city === '泰安'
  return {
    primary: {
      title: jinan ? '泉畔漫游' : taian ? '泰山日出' : '山水漫游',
      text: jinan ? '沿泉而行，从清流与柳影间读一城山水。' : taian ? '循山道登临，读日出云海与岱宗风光。' : `沿山水徐行，阅览${city}的自然景观与人文遗迹。`,
      image: jinan ? jinanArt('springs') : taian ? '/media/inkwash/atlas/spot-yuhuangding.webp' : cityImage,
      imageAlt: jinan ? '济南泉水、垂柳与湖亭的水墨意象' : `${city}山水意象插画`,
      href: '#city-spots',
      action: '阅览经典景点',
    },
    secondary: [
      { title: jinan ? '名士寻踪' : `${city}名士`, text: '读生平，寻一城文脉。', to: `/poets?region=${city}`, image: jinan ? jinanArt('scholars') : null, glyph: 'heritage' },
      { title: jinan ? '湖山诗词' : taian ? '石刻诗意' : '诗词选读', text: taian ? '从诗文中读岱宗与山石。' : '循诗句，慢赏山河风物。', to: `/poems?region=${city}`, image: jinan ? jinanArt('poetry') : null, glyph: 'inscription' },
      { title: jinan ? '老城风物' : taian ? '泰山风味' : '市井风物', text: taian ? '阅览乡土饮食与戏曲。' : '走近街巷间的文化记忆。', to: taian ? `/food-opera?region=${city}` : `/cities/${city}`, image: jinan ? jinanArt('oldtown') : null, glyph: taian ? 'food' : 'temple' },
    ],
    imageCredit: jinan ? 'AI生成 · 济南山水意象' : '',
  }
}
