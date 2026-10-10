#!/usr/bin/env node
/**
 * 首个「一城一课」素材录入脚本（济南）
 *
 * 作用：按「来源登记 → 实体关联 → 建任务」的顺序，把 docs/content/first-learning-task.md
 *      里定好的材料写入后台。幂等，可重复运行。
 *
 * 用法：
 *   node scripts/setup-first-learning-task.mjs           # 预演：只打印将要写入的内容，不落库
 *   node scripts/setup-first-learning-task.mjs --apply   # 实际写入
 *
 * 环境变量（均有默认值）：
 *   API_BASE      后端地址，默认 http://127.0.0.1:8080
 *   ADMIN_USER    默认 admin
 *   ADMIN_PASS    默认 123456
 */

const API_BASE = process.env.API_BASE || 'http://127.0.0.1:8080'
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || '123456'
const APPLY = process.argv.includes('--apply')

const TASK = {
  taskCode: 'jinan-springs-poets-01',
  title: '泉城济南：诗里的泉水与名士',
  city: '济南',
  goal: '从杜甫、曾巩、晏璧三首诗中提取可核实的信息，比较不同时代对同一条泉水的书写，并用自己的话解释「济南名士多」',
  background: '济南以泉水闻名，历代文人留下了大量题咏。同一处趵突泉、同一座历下亭，唐宋明清各有写法。本任务以三首诗和一处泉景为材料，练习「先找证据、再做比较、最后表达」的探究路径。',
}

// 来源登记（identifier / publicationYear / url 请按可查证版本自行补齐后再正式发布）
const SOURCES = [
  {
    key: 'quantangshi',
    sourceType: 'book',
    title: '全唐诗',
    authorOrg: '彭定求 等编（清）',
    publicationYear: 1960,
    identifier: '',
    url: '',
    citation: '彭定求等编. 全唐诗[M]. 北京: 中华书局, 1960.',
    copyrightNote: '古籍，公有领域',
  },
  {
    key: 'yuanfengleigao',
    sourceType: 'book',
    title: '元丰类稿',
    authorOrg: '曾巩（宋）',
    publicationYear: null,
    identifier: '',
    url: '',
    citation: '曾巩. 元丰类稿[M].（请补充实际使用的版本与出版社）',
    copyrightNote: '古籍，公有领域',
  },
  {
    key: 'qishierquanshi',
    sourceType: 'book',
    title: '济南七十二泉诗',
    authorOrg: '晏璧（明）',
    publicationYear: null,
    identifier: '',
    url: '',
    citation: '晏璧. 济南七十二泉诗[M].（请补充收录该诗的版本）',
    copyrightNote: '古籍，公有领域',
  },
  {
    key: 'baotuquan',
    sourceType: 'official_site',
    title: '天下第一泉风景区 · 趵突泉',
    authorOrg: '济南天下第一泉风景区',
    publicationYear: null,
    identifier: '',
    url: '', // 待补填官网真实地址
    citation: '济南天下第一泉风景区. 趵突泉[EB/OL].（请补充官网地址）',
    copyrightNote: '景区官网内容，仅作事实核对引用',
    // 该来源的官网地址与原文摘录必须由人工从官网补全，脚本默认跳过，避免把占位文本写进库。
    incomplete: true,
  },
]

// 实体关联（sourceKey 在上面的来源登记完成后换成真实 ID）
const LINKS = [
  { sourceKey: 'quantangshi', entityType: 'poem', entityId: 1, locator: '卷216（待核实）', quote: '海右此亭古，济南名士多', note: '该诗句的直接出处，支撑「济南名士多」一说' },
  { sourceKey: 'yuanfengleigao', entityType: 'poem', entityId: 3, locator: '卷七（待核实）', quote: '一派遥从玉水分，暗来都洒历山尘', note: '支撑曾巩笔下趵突泉的水源与民生之用' },
  { sourceKey: 'qishierquanshi', entityType: 'poem', entityId: 4, locator: '待核实', quote: '济南七十泉流乳，趵突独称第一泉', note: '支撑「趵突泉为泉群之首」的说法' },
  { sourceKey: 'baotuquan', entityType: 'scenic_spot', entityId: 2, locator: '趵突泉景区介绍', quote: '（请从官网复制原文一句）', note: '支撑趵突泉的泉群地位与泉水特征' },
]

function buildContentJson(sourceIds) {
  return JSON.stringify({
    version: 1,
    resources: [
      {
        id: 'poem-dufu-lixiating', entityType: 'poem', entityId: 1,
        title: '陪李北海宴历下亭',
        snippet: '杜甫在济南历下亭的宴集之作，留下「海右此亭古，济南名士多」，是「济南名士多」一说的源头。',
        sourceIds: [sourceIds.quantangshi], path: '/poems/1',
      },
      {
        id: 'poem-zenggong-baotuquan', entityType: 'poem', entityId: 3,
        title: '趵突泉·曾巩',
        snippet: '曾巩知齐州时所作，写趵突泉从玉水分来、润泽历山，落脚在泉水与农耕茶饮的民生之用。',
        sourceIds: [sourceIds.yuanfengleigao], path: '/poems/3',
      },
      {
        id: 'poem-yanbi-baotuquan', entityType: 'poem', entityId: 4,
        title: '趵突泉·晏璧',
        snippet: '晏璧咏济南七十二名泉之作，以「趵突独称第一泉」为趵突泉定下泉群之首的位置。',
        sourceIds: [sourceIds.qishierquanshi], path: '/poems/4',
      },
      {
        id: 'spot-baotuquan', entityType: 'scenic_spot', entityId: 2,
        title: '趵突泉',
        snippet: '济南七十二名泉之首，泉水常年涌出、水温稳定，是济南「泉城」称号最直接的依据。',
        sourceIds: [sourceIds.baotuquan], path: '/spots/2',
      },
    ],
    steps: [
      {
        type: 'evidence', title: '证据阅读',
        prompt: '先从材料中找出可以核实的事实：谁在什么地方、什么场合写下了这些句子。',
        questions: [{
          id: 'q-evidence-1', type: 'fact',
          prompt: '杜甫在历下亭写下「海右此亭古，济南名士多」。依据这份材料，这句话是在什么场合写下的，它说的「名士」指的是什么？',
          entityRefs: [{ type: 'poem', id: 1 }],
          sourceIds: [sourceIds.quantangshi],
        }],
      },
      {
        type: 'compare', title: '比较分析',
        prompt: '把两份材料放在一起比较：同一条泉水，不同时代的人分别看到了什么。',
        questions: [{
          id: 'q-compare-1', type: 'compare',
          prompt: '同样是写趵突泉，宋代曾巩与明代晏璧关注的重点有什么不同？请分别引用两份来源中的句子，再写出你的比较。',
          hint: '注意曾巩写到了泉水的实际用途，晏璧则给了它一个排名。',
          entityRefs: [{ type: 'poem', id: 3 }, { type: 'poem', id: 4 }],
          sourceIds: [sourceIds.yuanfengleigao, sourceIds.qishierquanshi],
        }],
      },
      {
        type: 'reflection', title: '反思表达',
        prompt: '用证据支持你自己的判断：把诗、泉水和人联系起来。',
        questions: [{
          id: 'q-reflection-1', type: 'reflection',
          prompt: '结合趵突泉的水与历下亭的名士，你如何理解「济南名士多」这句话？请至少引用一条材料中的原句作为依据。',
          entityRefs: [{ type: 'poem', id: 1 }, { type: 'scenic_spot', id: 2 }],
          sourceIds: [sourceIds.quantangshi, sourceIds.baotuquan],
        }],
      },
    ],
  }, null, 2)
}

let token = ''

async function call(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { throw new Error(`${method} ${path} 返回非 JSON（HTTP ${res.status}）：${text.slice(0, 200)}`) }
  if (json.code !== 200) throw new Error(`${method} ${path} 失败：${json.message || JSON.stringify(json)}`)
  return json.data
}

async function login() {
  const data = await call('POST', '/api/auth/login', { username: ADMIN_USER, password: ADMIN_PASS })
  token = data.token
  console.log(`已登录：${data.username}（${data.role}）`)
}

async function ensureSource(source) {
  const existing = await call('GET', `/api/admin/source-documents?page=1&size=100&keyword=${encodeURIComponent(source.title)}`)
  const hit = (existing?.records || []).find(r => r.title === source.title)
  if (hit) {
    console.log(`  来源已存在，复用 id=${hit.id}  ${source.title}`)
    return hit.id
  }
  if (!APPLY) {
    console.log(`  [预演] 将新建来源：${source.title}`)
    return null
  }
  const created = await call('POST', '/api/admin/source-documents', {
    sourceType: source.sourceType, title: source.title, authorOrg: source.authorOrg,
    publicationYear: source.publicationYear, identifier: source.identifier,
    url: source.url, citation: source.citation, copyrightNote: source.copyrightNote,
  })
  const id = created?.id ?? created
  console.log(`  已新建来源 id=${id}  ${source.title}`)
  return typeof id === 'object' ? id.id : id
}

async function ensureLink(link, sourceId) {
  const existing = await call('GET', `/api/admin/source-links/${link.entityType}/${link.entityId}`)
  if ((existing || []).some(r => Number(r.sourceId) === Number(sourceId))) {
    console.log(`  关联已存在：${link.entityType} ${link.entityId} ← 来源 ${sourceId}`)
    return
  }
  if (!APPLY) {
    console.log(`  [预演] 将新建关联：${link.entityType} ${link.entityId} ← 来源 ${sourceId}`)
    return
  }
  await call('POST', '/api/admin/source-links', {
    entityType: link.entityType, entityId: link.entityId, sourceDocumentId: sourceId,
    locator: link.locator, quote: link.quote, note: link.note,
  })
  console.log(`  已新建关联：${link.entityType} ${link.entityId} ← 来源 ${sourceId}`)
}

async function ensureTask(contentJson) {
  const existing = await call('GET', `/api/admin/learning-tasks?page=1&size=100&keyword=${encodeURIComponent(TASK.taskCode)}`)
  const hit = (existing?.records || []).find(r => r.taskCode === TASK.taskCode)
  if (hit) {
    console.log(`  任务已存在，跳过创建：${TASK.taskCode}（id=${hit.id}, status=${hit.status}）`)
    return hit
  }
  if (!APPLY) {
    console.log(`  [预演] 将新建任务：${TASK.taskCode}`)
    return null
  }
  const created = await call('POST', '/api/admin/learning-tasks', { ...TASK, contentJson, status: 'draft' })
  console.log(`  已新建任务 id=${created?.id}  ${TASK.taskCode}（草稿）`)
  return created
}

async function main() {
  console.log(`模式：${APPLY ? '实际写入' : '预演（加 --apply 才真正写库）'}`)
  console.log(`后端：${API_BASE}\n`)
  await login()

  console.log('\n[1/3] 登记来源')
  const sourceIds = {}
  for (const source of SOURCES) {
    if (source.incomplete) {
      console.log(`  跳过（信息不完整，请从官网补全后手工录入）：${source.title}`)
      continue
    }
    sourceIds[source.key] = await ensureSource(source)
  }
  if (!APPLY) {
    console.log('  （预演模式下来源 ID 未知，后续步骤以真实 ID 为准）')
    return
  }

  console.log('\n[2/3] 建立实体关联')
  for (const link of LINKS) {
    if (!sourceIds[link.sourceKey]) {
      console.log(`  跳过（其来源未录入）：${link.entityType} ${link.entityId}`)
      continue
    }
    await ensureLink(link, sourceIds[link.sourceKey])
  }

  console.log('\n[3/3] 创建探究任务（草稿）')
  const task = await ensureTask(buildContentJson(sourceIds))
  if (task) {
    console.log(`\n完成。下一步：在后台「探究任务」里点「发布」，或执行`)
    console.log(`  curl -X PUT ${API_BASE}/api/admin/learning-tasks/${task.id}/status -H "Authorization: Bearer <token>" -H 'Content-Type: application/json' -d '{"status":"published"}'`)
    console.log(`发布后访问：http://localhost:5175/learn/${TASK.taskCode}`)
  }
}

main().catch(err => {
  console.error(`\n执行失败：${err.message}`)
  process.exitCode = 1
})
