import { findReadingReference } from './readingState.js'
import { normalizeSourceEntries, safeSourceUrl } from './source.js'

const plain = value => String(value || '').replace(/\r\n?/g, '\n')
const oneLine = value => plain(value).replace(/\n/g, ' ')
export function buildReadingExportMarkdown({ materials = [], selected = [], answer = '', origin = '', preview = false, includeAi = false, ai = {} }) {
  let base = ''
  try { const url = new URL(origin); if (['http:', 'https:'].includes(url.protocol)) base = url.origin } catch { /* relative links remain usable */ }
  const lines = ['# 我的对照阅读', '', preview ? '> 设计预览样本：作品与关联用于展示版式，未经本平台审核。' : '> 原文与来源以公开材料记录为准；个人判断由阅读者填写。', '']
  for (const material of materials.filter(Boolean)) {
    const link = `${base}/poems/${material.id}${preview ? '?preview=inkwash' : ''}`
    lines.push(`## 材料 ${material.label} · ${oneLine(material.title)}`, '', [material.author, material.dynasty].filter(Boolean).map(oneLine).join(' · '), '', `材料链接：${link}`, '', ...(material.lines || []).map(line => `${line.number}. ${plain(line.text)}`), '')
    const sources = normalizeSourceEntries(material.sources)
    if (!sources.length) lines.push(`材料 ${material.label}：来源未登记${preview ? '（样本未提供来源）' : ''}。`, '')
    else {
      lines.push('### 来源资料', '')
      for (const source of sources) {
        lines.push(`- ${oneLine(source.title || '来源资料')}${source.authorOrg ? ` · ${oneLine(source.authorOrg)}` : ''}${source.locator ? ` · ${oneLine(source.locator)}` : ''}`)
        for (const field of ['citation', 'quote', 'note']) if (source[field]) lines.push(`  ${oneLine(source[field])}`)
        if (safeSourceUrl(source.url)) lines.push(`  ${source.url}`)
      }
      lines.push('')
    }
  }
  lines.push('## 我选的证据', '')
  const valid = selected.map(item => findReadingReference(item.label, item.number, materials)).filter(Boolean)
  lines.push(...(valid.length ? valid.map(item => `- [${item.label}:${item.number}] ${plain(item.text)}`) : ['尚未选句。']), '', '## 我的判断', '', plain(answer) || '尚未填写。', '')
  if (includeAi && ai.text) {
    const status = ai.status === 'complete' ? '已完成' : '未完成'
    lines.push(`## ${preview ? '导读示例 · 非实时AI' : 'AI解读 · 需自行核对原文'}`, '', `生成状态：${status}（${oneLine(ai.status || 'idle')}）`, `用途：${ai.mode === 'feedback' ? '检查我的依据' : '比较线索'}`, '', plain(ai.text), '')
  }
  return lines.join('\n')
}
