# SJG 数据库问题修复 —— AI 任务提示词

> 本文件由数据库备份 `sjg_20260813214743xlghi.sql`（MySQL 8.4.9，`sjg` 库全量 dump，UTF-8）分析整理而来。
> 共 9 张表：`dynasty`(9) / `event`(3) / `poem`(195) / `poem_analysis`(2) / `poem_event`(9) / `poet`(126) / `poet_relation`(13) / `scenic_spot`(70) / `user`(1)。
>
> 项目背景（SJG 齐鲁文化数字人文平台）：
> - 后端 `backend/`：Spring Boot 3.2.5 + Java 17 + MyBatis-Plus + MySQL（远程 47.104.207.58:3306/sjg）
> - 前端 `display-v2/`（Vue3 + Vite，主力展示）、`admin-frontend/`（管理端）、`sjg-datav/`（数据大屏）
> - 统一返回 `Result<T>`；公开 API 走 `/api/public/**`，管理写操作需 `admin` 角色
> - AI 对话「AI小文」由 `LlmClient` + `ChatService`（RAG + 限流）实现，配置在 `application.yml` 的 `llm.*`
> - 双主题 real/inkwash：实体有 `imageUrl`/`imageAnimeUrl`、`avatarUrl`/`avatarAnimeUrl` 双字段，媒体走阿里云 OSS（bucket `shandong-lit-landscape`）
>
> 使用方式：每个「任务」为独立提示词，可单独或合并发给 AI 执行。执行前建议先通读「前置约束」与「验收标准」。

---

## 前置约束（所有任务通用）

1. 只改代码/配置或产出 SQL migration，**不要**直接篡改线上生产库数据；新增数据一律写成 SQL migration 文件放入 `backend/src/main/resources/db/migration/`（命名沿用 `v5_`、`v6_` 前缀）。
2. 涉及媒体（图片/视频/音频）生成时，先报告积分/成本消耗并征得确认，参考 `.workbuddy/skills/sjg-media-assets/SKILL.md` 的 ffmpeg 后处理流程。
3. 保持 `Result<T>` 返回格式、`map-underscore-to-camel-case`、公开/管理端鉴权边界不变。
4. 每个任务完成后给出：改动文件清单、新增 migration 文件名、验证方式、以及「改动前 vs 改动后」的数据量对比。

---

## 任务 1：修复 AI 诗词赏析（`poem_analysis`）从未成功生成的问题

### 问题描述
`poem_analysis` 表只有 2 条记录，且均为生成失败的兜底数据：

```json
{
  "raw": "生成失败: java.lang.RuntimeException: AI 服务未配置（缺少 LLM_API_KEY / LLM_BASE_URL）",
  "lines": [], "sentiment": "暂无分析", "background": "暂无背景", "annotations": []
}
```

`model` 字段为 `fallback`。结论：服务器上 LLM 密钥/BaseURL 从未正确配置，导致 195 首诗中仅 2 首尝试过赏析且全部失败，「诗词赏析」模块线上实际为空。

### 解决目标
1. 定位并修复 `application.yml` 中 `llm.*`（`LLM_API_KEY` / `LLM_BASE_URL` / model）的配置缺失问题，使 `LlmClient` 能正常调用 DeepSeek（OpenAI 兼容格式）。
2. 将已有 2 条 `fallback` 脏数据清理/标记失效。
3. 提供批量重跑赏析的机制：为 195 首诗按需生成 `poem_analysis`（注意 `version` 字段用于失效旧版本，`PoemAnalysisService` 应支持重跑时 `version+1` 而非重复插入）。

### 具体要求
- 检查 `backend/src/main/resources/application.yml` 与 `application-*.yml`，确认 `llm.api-key`、`llm.base-url`、`llm.model`、`llm.temperature`、`llm.timeout` 是否被环境变量正确注入；说明生产环境密钥应如何通过环境变量/密钥管理注入（不要明文提交密钥）。
- 检查 `LlmClient` 的报错路径：为什么缺配置时抛「AI 服务未配置」而不是在启动时告警；建议增加启动时配置校验或明确的降级开关。
- 设计一个可执行的「赏析批量生成」入口（如 admin 接口或一次性 Job），支持：指定诗 ID 范围、跳过已成功的、并发/限流控制、失败重试。
- 输出一条 migration：将现有 2 条 `fallback` 记录的 `version` 置为失效或直接删除（说明选择哪种并给出理由）。

### 验收标准
- 指定 LLM 配置后，任意一首诗可成功生成结构化赏析并写入 `poem_analysis`，`model` 字段为真实模型名（非 `fallback`）。
- 195 首诗均可通过批量入口生成，失败不阻塞整体，失败记录可重试。
- 不再产生「生成失败: AI 服务未配置」的兜底数据。

---

## 任务 2：补齐 47 位「空壳」诗人的生平资料

### 问题描述
`poet` 表 126 位诗人中，**47 位（37%）**只有 `id / name / dynasty_id`，其余字段（`birth_year`、`death_year`、`birthplace`、`biography`、`avatar_url`、`avatar_anime_url`、`style`）全为 `NULL`。

空壳诗人清单（id / 姓名 / 朝代）：
```
4 晏璧(明)  10 刘藻(清)  26 徐文通(明)  29 李化龙(明)  30 李中行(明)
39 胡广(明)  42 高出(明)  43 秦松龄(清)  45 卢见曾(清)  46 田致(清)
49 许朝(清)  50 李浃(清)  53 许景衡(宋)  55 杨巍(明)  57 杨玉润(明)
58 王象春(明)  60 张衍(清)  61 沈廷芳(清)  62 严文典(清)  63 张衍重(清)
64 沈世铨(清)  66 陈凤梧(明)  69 戴璟(明)  76 李如圭(明)  77 龚勉(明)
79 徐金铭(清)  80 殷云宵(明)  87 陈其猷(明)  88 石星(明)  89 李先芳(明)
90 杨应标(清)  91 范通(清)  97 唐之淳(明)  98 侯祁(明)  99 陈良谟(清)
100 张锷(清)  101 李洞(唐)  106 萧楚材(唐)  110 何应瑞(明)  111 王曰高(清)
112 刘大绅(清)  119 吴铠(明)  124 章忠(明)  125 刘学渤(清)  126 张本大(清)
127 汤朝槭(清)  128 狄培(清)
```

### 解决目标
为这 47 位诗人补齐：`birth_year`、`death_year`、`birthplace`、`biography`、`style`（头像 `avatar_url` 属任务 3 媒体生成范畴，此处只需保证文案字段完整）。

### 具体要求
- 以「与齐鲁/山东段黄河文学景观相关」为口径，逐位核实并撰写简介（生卒年、籍贯、字号、文学地位、与山东的关联、代表作），风格与现有非空诗人条目一致（参考现有 126 行中的 `biography` 文风）。
- `birth_year`/`death_year` 不确定时留 `NULL`，不要编造精确年份；`style` 用 2–4 字概括（如「现实主义（沉郁顿挫）」）。
- 产出为一条 `v6_poet_fill_profile.sql` migration：用 `UPDATE poet SET ... WHERE id = N` 逐条补齐，并附数据来源备注（可写在 SQL 注释或单独 `docs` 说明）。
- 若某诗人确实查无生平，明确标注并说明处理策略（保留空壳 / 删除 / 标记待补）。

### 验收标准
- 47 位诗人中，除明确标注「查无生平」者外，`biography` 均非空且符合事实。
- migration 在空库 schema 上可重复执行且幂等。

---

## 任务 3：补齐水墨（inkwash / anime）风格媒体素材

### 问题描述
- `scenic_spot` 表：70 个景点中，`image_anime_url` **32 个为 NULL**、21 个含 `_anime` 后缀（真水墨图）、**17 个直接复制了实景图**（如大明湖、趵突泉、千佛山、华不注山、鹊山的 `image_anime_url` 与 `image_url` 完全相同）。实际水墨素材完成度约 30%。
- `poet` 表：`avatar_anime_url` 基本全为 NULL。

### 解决目标
1. 盘点缺失清单：哪些景点/诗人缺 `anime` 素材（生成 CSV/JSON 清单）。
2. 为缺失项生成水墨风格素材，走既定流程（`.workbuddy/skills/sjg-media-assets/SKILL.md`），并上传 OSS，保持与实景图同构的路径（`spots/{名称}_anime.jpg`、`poets/{名称}_anime.jpg`）。
3. 产出 migration：更新 `scenic_spot.image_anime_url` 与 `poet.avatar_anime_url` 为正确的 OSS 地址，替换掉「复制实景图」的占位数据。

### 具体要求
- 先生成「缺 anime 素材清单」，列明：表名、id、名称、当前 `image_anime_url` 状态（NULL / 实景占位 / 已有真 anime）。
- 生成前告知积分消耗与数量，确认后再批量生成；注意已知坑（output_dir 不可靠、默认水印、视频体积），按 SKILL.md 做 ffmpeg 裁水印/压缩/导 poster。
- 不要把「复制实景图」当作已完成的水墨素材，需真正生成水墨风格图。

### 验收标准
- `scenic_spot.image_anime_url` 与 `image_url` 不再出现「完全相同且无 `_anime` 后缀」的占位情况。
- `scenic_spot` 缺 anime 项数量降到 0（或明确列出仍缺项及原因）。
- 前端 inkwash 主题下不再回退到实景图（至少对已补项）。

---

## 任务 4：补全稀疏的关系/关联数据（`poet_relation`、`poem_event`）

### 问题描述
- `poet_relation` 仅 13 条，全部 `source='seed'`；Phase2 的 `derived` 派生关系尚未生成。存在 id 空洞（1–12 后直接跳到 25，说明曾删除 12 条）；第 25 条描述带「金元之际(待考, 或删)」待定标记。
- `poem_event` 仅 9 条：195 首诗中仅 9 首关联事件，且只涉及 event 1（李杜齐鲁相会）、event 2（赵孟頫济南）；event 3（蒲松龄柳泉）无任何诗词关联。

### 解决目标
1. 处理 `poet_relation` 待定条目（确认或删除「金元之际(待考, 或删)」）。
2. 设计并生成 `derived` 派生关系（如「同朝代同区域诗人」交游关系），写入 `poet_relation`（`source='derived'`）。
3. 补齐 `poem_event`：为 3 个事件（尤其是 event 3 蒲松龄柳泉）关联相应的诗词，使每个事件都有诗词支撑。

### 具体要求
- 说明 `derived` 派生关系的生成规则与去重策略（避免与 `seed` 重复、避免自环、遵循 `poet_a_id < poet_b_id` 保序约定）。
- 核对 event 3（蒲松龄柳泉，dynasty 8 / 清）对应的《聊斋志异》或相关诗词，从现有 `poem` 表中找到或新增关联。
- 产出 migration：新增/修正 `poet_relation` 与 `poem_event` 记录；说明对 id 空洞的处理（是否 `ALTER TABLE ... AUTO_INCREMENT` 重置）。

### 验收标准
- 每个 `event` 至少有一条 `poem_event` 关联。
- `poet_relation` 无自环、无重复、`poet_a_id < poet_b_id` 约定成立，`source` 取值合法。
- 待定条目已确认或删除，不再有「(待考, 或删)」文本残留。

---

## 任务 5：归一化 `scenic_spot.region` 行政区划层级

### 问题描述
`scenic_spot.region` 出现行政区划层级混用——地级市与县级市并存：
- 地级市：济南(15)、菏泽(20)、济宁(10)、聊城(7)、德州(5)、泰安(3)、东营(2)、淄博(2)、青岛(1)、滨州(1)
- 县级市/县：曲阜(3)、邹城(1)（两者均属济宁市）

### 解决目标
统一 `region` 到一致层级（建议统一到**地级市**，将「曲阜」「邹城」归入「济宁」；或若前端 `regions/:region` 路由需要县级粒度，则全表统一到县级并补充上级地级市字段）。明确选择一种口径并全表一致。

### 具体要求
- 先确认 `display-v2` 路由 `/regions/:region` 与区域聚合展示的粒度需求，据此决定统一到地级市还是县级。
- 产出 migration 更新 `region`；若需县级→地级市映射，提供完整映射表（曲阜→济宁、邹城→济宁，以及其它县级地名归属）。
- 同步检查 `docs/data_interfaces.md` 中 `region` 字段说明是否需要更新。

### 验收标准
- `scenic_spot.region` 只剩一种行政区划层级，无「地级市 + 县级市」混用。
- 区域聚合/路由展示正确，无孤立的县级 region 导致空页。

---

## 任务 6：修正 `dynasty` 排序与时间轴

### 问题描述
`dynasty` 表中「金」(id=9, 1115–1234) 排在「清」(id=8, 1644–1912) 之后。若前端时间轴按 `id` 排序，金朝会错位到清代之后；且金(1115–1234)与宋(960–1279)、元(1271–1368)时间重叠。

### 解决目标
确认前端时间轴的排序依据（按 `id` 还是按 `start_year`）。若按 `id`，调整「金」的 `id` 顺序或明确排序字段；若按 `start_year`，则无需改数据但需在文档/注释中说明。

### 具体要求
- 检查 `display-v2` 时间轴组件与 `/api/public/**` 中 dynasty 列表的排序实现。
- 给出结论：改数据（调整 id / 增加 `sort_order` 字段）或改代码（按 `start_year` 排序），并落地对应改动。

### 验收标准
- 时间轴按真实历史顺序展示，金(1115) 排在宋之后、元之前，不出现「金排在清后」。

---

## 任务 7：补齐诗词朗诵音频（`poem.audio_url`）

### 问题描述
`poem` 表 195 首诗的 `audio_url` 全部为 NULL（朗诵音频整体缺失），而 `video_url` 基本齐全。

### 解决目标
1. 评估是否确实需要音频：确认前端是否有朗诵播放入口。
2. 若需要，生成 195 首诗朗诵音频，上传 OSS（`audio/{诗名}.mp3` 或同构路径），产出 migration 回填 `audio_url`。

### 具体要求
- 先确认需求与成本（TTS 生成 195 条音频的消耗），征得确认后再执行。
- 音频文件按 OSS 同构路径命名，避免中文文件名编码问题（给出统一命名规则）。

### 验收标准
- `poem.audio_url` 覆盖率达到目标值（如 100%），前端可正常播放。

---

## 附：执行优先级建议

| 优先级 | 任务 | 理由 |
|---|---|---|
| P0 | 任务 1（赏析 LLM 配置） | 功能完全不可用，需尽快修复 |
| P1 | 任务 2（空壳诗人） | 数据完整性，影响展示 |
| P1 | 任务 3（水墨素材） | 双主题体验，量较大 |
| P2 | 任务 4（关系/关联稀疏） | 知识图谱与事件页质量 |
| P2 | 任务 5（region 归一化） | 数据一致性，改动小 |
| P3 | 任务 6（朝代排序） | 小 bug，影响时间轴 |
| P3 | 任务 7（朗诵音频） | 增强项，视需求与成本决定 |

---

## 附2：执行进度（fix/db-data-quality 分支，2026-08-14）

| 任务 | 状态 | 产物 |
|---|---|---|
| 1 赏析 LLM 配置 | [x] 代码侧完成 | `LlmClient`(启动告警+getModel)、`PoemAnalysisService`(fallback 不落库/脏缓存视为未命中/批量任务)、`PoemAnalysisAdminController`(POST /api/admin/poems/analysis/batch)、`V7__poem_analysis_fallback_cleanup.sql`、测试 14→20 全过 |
| 2 空壳诗人 | [x] | `V8__poet_fill_profile.sql`（47/47 全覆盖：A 13 + B 16 + C 17 + 萧楚材；殷云宵→殷云霄 正名） |
| 3 水墨素材 | [~] 盘点完成，生成待成本确认 | `docs/anime-asset-inventory.md`（49 景点占位 + ~125 诗人头像缺 anime） |
| 4 关系/关联 | [x] | `V9__poet_relation_phase2.sql`（删 1 条待定 + 19 seed + 4 derived + event3 诗词 3 条） |
| 5 region 归一化 | [x] | `V10__scenic_spot_region_normalize.sql`（曲阜/邹城→济宁，青岛保留）+ `docs/data_interfaces.md` 说明 |
| 6 朝代排序 | [x] 代码侧 | 后端本已按 startYear 排序；修复 `InkTimeline`/`useBoatJourney` 字符串 id 与数字 id 不匹配导致水墨时间线面板永远为空的 bug |
| 7 朗诵音频 | [~] 待确认 | 前端 `PoemDetail.vue` 已有播放入口，TTS 195 首需成本确认 |

说明：任务 3/7 的媒体生成与任务 1 的生产密钥配置需用户确认后执行。