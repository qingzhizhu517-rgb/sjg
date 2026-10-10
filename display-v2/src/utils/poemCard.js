// Draw a local, shareable poem card without network requests or screenshots.
export function wrapPoemText(text, measure, maxWidth) {
  return String(text || '').split('\n').flatMap(paragraph => {
    const rows = []
    let row = ''
    for (const char of paragraph.trim()) {
      if (row && measure(row + char) > maxWidth) { rows.push(row); row = '' }
      row += char
    }
    rows.push(row)
    return rows
  })
}

export function createPoemCard(poem, documentRef = document) {
  const canvas = documentRef.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('当前浏览器暂不支持图片导出，可使用分享或复制诗词。')
  const font = '"Noto Serif SC", "Songti SC", serif'
  ctx.font = `44px ${font}`
  const rows = wrapPoemText(poem.lines.join('\n'), text => ctx.measureText(text).width, 940)
  ctx.font = `64px ${font}`
  const titleRows = wrapPoemText(poem.title || '无题', text => ctx.measureText(text).width, 940)
  const contentTop = 240 + titleRows.length * 88
  canvas.width = 1200
  canvas.height = Math.max(1500, contentTop + rows.length * 84 + 260)
  if (canvas.height > 16000) throw new Error('诗词过长，暂不支持导出为单张图片，可使用分享或复制。')
  ctx.fillStyle = '#f5f0e5'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#cbbda7'
  ctx.lineWidth = 2
  ctx.strokeRect(52, 52, 1096, canvas.height - 104)
  // Original, restrained ink mountain silhouettes along the lower margin.
  for (let layer = 0; layer < 3; layer++) {
    ctx.beginPath()
    ctx.moveTo(53, canvas.height - 53)
    for (let x = 53; x < 1148; x += 24) {
      const rise = 40 + Math.sin(x / (100 + layer * 28) + layer) * 32 + Math.sin(x / 43 + layer) * 10
      ctx.lineTo(x, canvas.height - 80 - rise - layer * 17)
    }
    ctx.lineTo(1147, canvas.height - 53)
    ctx.closePath()
    ctx.fillStyle = ['#69806d12', '#69806d16', '#69806d1a'][layer]
    ctx.fill()
  }
  ctx.textAlign = 'center'
  ctx.fillStyle = '#776c5b'
  ctx.font = `24px ${font}`
  ctx.fillText('齐 鲁 文 脉  ·  诗 笺', 600, 135)
  ctx.fillStyle = '#393c31'
  ctx.font = `64px ${font}`
  titleRows.forEach((row, i) => ctx.fillText(row, 600, 235 + i * 88))
  ctx.font = `44px ${font}`
  rows.forEach((row, i) => ctx.fillText(row, 600, contentTop + i * 84))
  ctx.fillStyle = '#a25543'
  ctx.font = `24px ${font}`
  ctx.fillText('AI 诗词创作 · ' + [poem.style, poem.wordCount].filter(Boolean).join(' · '), 600, canvas.height - 170)
  return canvas
}
