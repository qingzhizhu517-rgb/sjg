# P2 #4: 诗词页 AI 赏析卡

> 路线图 `2026-07-19-display-v2-next-phase-roadmap.md` 的 #4「诗词页 AI 分析」。
> 范围: PoemDetail 页内嵌结构化 AI 赏析卡(逐句解读 + 情感 + 创作背景 + 字词注解), 预生成 + 缓存, 与全局 AI小文分工(页内赏析 vs 全局问答)。
> 分支: `feat/map-frame-layout`(承接 #1/#2/#3 提交)。

## 1. 现状(已探明)

- **PoemDetail.vue**: 展诗 + `sentimentTags` + 注解 + 创作背景 + 视频/音频, 无 AI 赏析。
- **AI 后端**: `PublicChatController` + `ChatService` + `LlmClient`(DeepSeek + RAG + SSE), 可复用。
- **数据库**: `poem` 表有 `content`/`annotation`/`background`/`sentiment_tags`, 无赏析缓存表。
- **全局 AI小文**: `AiChatBox.vue`(DeepSeek+RAG+SSE), 页内赏析与其分工不冲突。

## 2. 目标(路线图 #4 验收: 进诗词页有结构化赏析卡; 首次生成后走缓存; 与小文不冲突)

1. **页内 AI 赏析卡**: 结构化输出 逐句解读 + 情感 + 创作背景 + 字词注解。
2. **预生成 + 缓存**: 进页时检查缓存, 无则调 LLM 生成并缓存, 有则直接展示。
3. **与全局小文分工**: 页内赏析 = 结构化展示; 全局小文 = 自由问答。不互斥。

## 3. 方案

### 3.1 数据库 — `poem_analysis` 缓存表

```sql
CREATE TABLE IF NOT EXISTS poem_analysis (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  poem_id BIGINT NOT NULL UNIQUE,
  analysis JSON NOT NULL COMMENT '结构化赏析: {lines:[{line,解读}], sentiment, background, annotations}',
  model VARCHAR(64) COMMENT '生成模型',
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  version INT DEFAULT 1 COMMENT '赏析版本, 用于失效',
  FOREIGN KEY (poem_id) REFERENCES poem(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3.2 后端 — `PoemAnalysisService` + `PublicPoemAnalysisController`

- `PoemAnalysisService`:
  - `getOrGenerate(poemId)`: 查缓存 → 有且 version 匹配 → 返回; 无 → 调 LLM 生成 → 存缓存 → 返回。
  - `generate(poem)`: 拼专门 prompt(逐句解读 + 情感 + 创作背景 + 字词注解), 调 `LlmClient.streamChat()`, 解析 JSON 结果。
- `PublicPoemAnalysisController`: `GET /api/public/poems/{id}/analysis` 返回赏析 JSON。

### 3.3 前端 — `PoemAnalysis.vue` 组件

- 在 PoemDetail.vue 中 `<div class="detail-section">` 后插入 `<PoemAnalysis :poem-id="poem.id" />`。
- 组件: 进页 → `fetch('/api/public/poems/{id}/analysis')` → 展示结构化赏析。
- 加载态 / 错误态 / 空态。

## 4. 任务分解

- **T1** `poem_analysis` 表迁移(V5), 手动 pymysql 应用。
- **T2** `PoemAnalysis` entity + mapper。
- **T3** `PoemAnalysisService`(缓存逻辑 + LLM 调用)。
- **T4** `PublicPoemAnalysisController`(`GET /api/public/poems/{id}/analysis`)。
- **T5** 后端重启 + curl 验证(无缓存时生成, 有缓存时返回)。
- **T6** `PoemAnalysis.vue` 组件(加载/展示/错误态)。
- **T7** PoemDetail.vue 集成 `<PoemAnalysis :poem-id="poem.id" />`。
- **T8** 前端验证(`npm run dev` 进诗词页看赏析卡), 提交(2 commit: 后端 + 前端)。

## 5. 待定/决策

- **缓存失效策略**: 诗内容变更才刷(本版 poem 内容不变, 简单 version=1 即可)。
- **赏析卡是否含"追问小文"入口**: 本轮先不含, 留双轨余地(后期可加"向小文提问"按钮)。
- **LLM prompt 设计**: 需专门 prompt 要求结构化 JSON 输出(逐句/情感/背景/字词), 非自由文本。

## 6. 风险

- **LLM 输出格式不稳**: DeepSeek 可能返回非标 JSON → 需 fallback 解析(try-catch + 默认展示)。
- **生成耗时**: 首次进页可能 3-5s → 加 loading 态 + "赏析生成中..."提示。
- **缓存表膨胀**: 195 首诗全缓存 JSON, 量小无压力。

## 7. 不在范围

- 全局 AI小文(已有, 不动)。
- 诗词视频/音频补全(长线素材工作)。
- "追问小文"入口(后期可选)。
