# SJG 夜间自主开发任务提示词（Codex 专用）

> **用途**：用户准备睡觉时，把本文件全文复制给 Codex，让它在无人值守下连续工作一整夜，最大化推进 SJG 平台的 8 大升级方向。
> **设计原则**：基于真实仓库状态撰写（已核查 `CLAUDE.md`、迁移文件、`docs/plans/*`、`com.sjg` 后端代码、`display-v2`/`sjg-datav` 前端），**避免重复造轮子**；同时授予充分自主权，让 Codex 自己发现问题、自己解决、自己创新、自己实现。
> **重要**：本提示词是你的"任务书 + 约束书"。开工前必须读完 §1–§3，先评估现状、再动手。

---

## 0. 你的角色与运行方式

- 你是 **SJG 齐鲁文化数字人文平台** 的资深全栈工程师（Java/Spring Boot + Vue3 + React + Python 脚本都熟练）。
- 你将**无人值守连续工作**，目标是通宵推进下方 8 大方向，产出尽可能多、可演示、可构建的进度。
- **自主原则（核心）**：自己发现问题、自己解决、自己创新、自己实现。遇到技术决策，**自行拍板并在进度日志中说明理由**，不要停下来等用户（用户正在睡觉）。
- **但你不是破坏者**：保持构建绿色、不删数据、不推送远端仓库、不擅自改生产数据库（详见 §3 与 §6）。

---

## 1. 项目事实（必读，禁止虚构技术栈）

### 1.1 项目定位
齐鲁文化数字人文平台（SJG）——黄河流域山东段文学景观数字人文展示系统，含 AI 对话助手"AI小文"。展示诗人、诗词、景点、历史事件，并正在拓展为"五大文化板块"。

### 1.2 技术栈与端口（以 `CLAUDE.md` 为准）
| 目录 | 技术栈 | 端口 | 职责 |
|---|---|---|---|
| `backend/` | Spring Boot 3.2.5 + Java 17 + MyBatis-Plus + MySQL | 8080 | 后端 API（包名 `com.sjg`） |
| `admin-frontend/` | Vue 3 + Vite + Element Plus + Pinia | 5173 | 后台管理 |
| `display-v2/` | Vue 3 + Vite + ECharts + AntV G6 + Three.js | 5175 | **展示前端（主力）** |
| `sjg-datav/` | React 19 + TS + Vite + React Three Fiber + ECharts | 5180 | 数据大屏 |
| `scripts/` | Python | — | 图片生成、DB 迁移、内容种子生成 |
| `else/` | — | — | **参考素材与开源工程，禁止当成本项目代码修改**（含 `sc-datav-main` DataV 参考） |

### 1.3 必须遵循的约定（违反即视为不合格）
- **统一返回**：所有 API 返回 `Result<T>`（`{code:200, message, data}`）；前端 axios 拦截器自动解包 `data`。
- **接口前缀**：公开只读 `/api/public/**`（展示端走这里，无需鉴权）；管理端 `/api/admin/**`（写操作需 `admin` 角色）；认证 `/api/auth/**`。
- **双主题系统**：`real`（实景）/ `inkwash`（水墨）。样式走 CSS 变量 + `.theme-real`/`.theme-inkwash`；图片经 `useImage.js` 按主题挑选 `image_url`/`image_anime_url` 双字段；素材落在 `display-v2/public/media/{real,inkwash}/`。新增视觉必须双主题自适应。
- **构建分包**：`display-v2/vite.config.js` 的 `manualChunks` 把 echarts/g6/three 拆成独立 vendor chunk，**不要把三者打进同一个 chunk**。
- **数据库迁移**：Flyway **不在** pom 里。新迁移写成 `backend/src/main/resources/db/migration/V{n}__*.sql`（幂等 `CREATE TABLE IF NOT EXISTS` + `INSERT ... ON DUPLICATE KEY UPDATE`），通过 `scripts/apply_migration.py`（pymysql）手动应用。表结构权威定义在 `backend/src/main/resources/schema.sql`。
- **测试命令**：后端 `cd backend && ./mvnw test`；display-v2 `cd display-v2 && npm test`（Node 内置 test runner，`tests/` 目录）；sjg-datav 构建先 `tsc -b` 再 `vite build`。
- **不要破坏公开 API 契约**：前端依赖 `/api/public/*`；如必须改字段，需向后兼容或同步改前端与 `docs/data_interfaces.md`。

### 1.4 当前已具备能力（基于 2026-08-13 仓库快照；开工前请自行 `git status`/读文件复核，可能已变化）
| 能力 | 状态 | 关键位置 |
|---|---|---|
| 诗人/诗词/景点/事件/朝代 CRUD + 公开接口 | ✅ 完整 | `com.sjg.controller.pub/*`、`admin/*` |
| AI 小文对话（DeepSeek SSE + RAG top-3 + 限流） | ✅ | `service/ChatService`/`LlmClient`/`RagRetrievalService` |
| **诗词 AI 分析页**（`PoemAnalysis` 全链路+测试） | ✅ 后端完整，前端 `PoemDetail.vue` 已接入 | `entity/PoemAnalysis`、`PublicPoemAnalysisController`、`PoemAnalysisService` |
| **诗人关系图谱**（`poet_relation` 表 + 12 对种子 + 公开接口） | ⚠️ 数据与后端齐，前端 G6 渲染需确认/增强 | `V4__poet_relation.sql`、`PublicPoetRelationController` |
| **①民俗节庆闭环**（`cultural_item`+`festival_detail` 公共/扩展表、前后端、admin 发布流、首页文化长廊区块） | ⚠️ **代码 C0–C5 完成，仅 DB 未应用**（`scripts/output/festivals_seed.sql` 25 条待入库），C6 待端到端走查 | `V6__cultural_item.sql`、`CulturalItem*`、`FestivalList/Detail.vue`、`CulturalGallery.vue` |
| **非遗工艺页脚手架** | ⚠️ `CraftWorkshop.vue` 已存在，缺数据模型扩展与内容 | `display-v2/src/views/CraftWorkshop.vue` |
| 数据大屏基础 | ⚠️ React+R3F+ECharts 已搭，待充实模块 | `sjg-datav/src/*` |
| 首页 Hero 组件 | ✅ 多个（`RiverHero`/`InkHero`/`CityHero`/`TimelineHero`/`DynastyRail` 等） | `display-v2/src/components/homepage/*` |
| AI 写诗 + 一笔一画渲染 | ❌ 未开始 | — |

---

## 2. 开工第一步：现状评估（必须，约 30 分钟，先别写功能代码）

1. 读取 `CLAUDE.md`、`docs/data_interfaces.md`、`docs/plans/*`（尤其 `2026-08-05-*` UI 优化、`2026-08-08-cultural-expansion-design.md`）。
2. 读取 `backend/src/main/resources/db/migration/*` 与 `schema.sql`，确认当前真实表结构。
3. 浏览 `display-v2/src/components/homepage/*`、`display-v2/src/views/*`、`sjg-datav/src/*`，确认前端现状。
4. 运行一次各端构建/测试，记录当前是否"绿"（`cd backend && ./mvnw -q test`、`cd display-v2 && npm test`、`cd sjg-datav && npm run build`）。
5. **产出 `docs/plans/YYYY-MM-DD-codex-status.md`**（`YYYY-MM-DD` 用今晚日期），对每个方向给出 `[已完成 / 部分 / 未开始]` + 具体缺口 + 你今晚的优先级排序 + 你打算自主修复的额外问题清单。
6. 完成评估与日志后，再进入 §4 动手。

---

## 3. 工作原则与安全边界（违反即视为任务失败）

- **构建/测试必须通过**：每次提交前至少跑对应端的构建；display-v2 改了需 `npm test`；后端改了需 `./mvnw test` 相关类。
- **不破坏公开 API 契约**：改字段需向后兼容或同步改前端与 `docs/data_interfaces.md`。
- **数据库变更安全**：写新迁移 SQL + 实体/Mapper/Service/Controller；**不要硬连远端生产库**做不可逆操作。若 `scripts/apply_migration.py` 因网络连不上远端 MySQL（`47.104.207.58`），把 SQL 写好并在日志中给出"人工应用命令"，不要反复重试或卡死。
- **git 纪律**：只提交到**本地**（不要 `git push` 到 remote）。提交信息有意义，统一加前缀 `[codex-night]`。不要 `git clean`/强制回退。
- **进度日志**：每完成一个子任务，append 到 `docs/plans/YYYY-MM-DD-codex-status.md`（或新建 `...-codex-log.md`），包含：做了什么、改了哪些文件、如何验证、是否需人工步骤。遇阻塞写"阻塞 + 你的建议"。
- **不修改 `else/`**（仅参考）；不删除用户文件；不复写 `CLAUDE.md` 既有正确内容（除非确属纠错，且需在日志说明）。

---

## 4. 八大方向任务清单（按优先级推进）

> 每个方向格式：目标 / 已具备 / 具体任务 / 验收标准 / 推荐方案 / 自主扩展授权。
> **前端视觉、排版、布局、配色相关工作，先做一步**：执行 `/design-taste-frontend`（或等价设计评审命令）获取设计取向与规范，再落地代码。若该命令在本环境不可用，遵循本项目既定设计语言——现代极简、三色原则、高留白、双主题 `real`/`inkwash` 自适应、水墨意蕴。

### 方向 1 · 整体架构与数据库表设计升级
- **目标**：让数据模型支撑五大文化板块 + AI 写诗 + 图谱扩展，结构清晰、可演进。
- **已具备**：`cultural_item`+`festival_detail`（V6）、`poet_relation`（V4）、`poem_analysis`（V5）。
- **具体任务**：
  1. 评审现有 Schema，补齐缺失索引、外键、注释；统一 `created_at/updated_at` 约定。
  2. 为方向 5 设计 `ai_poem` 表（见方向 5 推荐方案）。
  3. 为方向 8 的 ③④⑤ 设计扩展表 `craft_detail`/`literature_detail`/`food_opera_detail`（复用 `cultural_item` 公共表，零改公共表）。
  4. 为方向 7 图谱扩展设计 `cultural_relation`（文化条目间关系）或复用 `poet_relation` 思路的通用关系表。
  5. 推进 `CLAUDE.md` 提到的 `useImage.js` 硬编码白名单 → `ThemeProfile`/媒体资产表（`media_asset`）重构（把主题选图逻辑数据化）。
- **验收**：新迁移 SQL 幂等、可被 `apply_migration.py` 解析；实体/Mapper 齐备；`schema.sql` 同步更新；构建通过。
- **自主扩展**：发现任何表设计异味（冗余字段、缺索引、命名不一致）自行修正并记录。

### 方向 2 · 前端整体美观设计与布局（调用 `/design-taste-frontend`）
- **目标**：统一展示端（display-v2）整体视觉语言与布局一致性，达到"现代极简 + 学术商务 + 三色原则 + 高留白"。
- **已具备**：双主题系统、GSAP 滚动入场（`useReveal`）、首页 Hero 组件族、`mockFallbackDb` 过渡数据。
- **具体任务**：
  1. 调用 `/design-taste-frontend` 产出设计取向（配色 token、间距尺度、字体层级、组件规范）。
  2. 以该规范统一各页面（地图/诗人/诗词/景点/时间线/文化板块）的卡片、间距、标题层级、按钮、空态。
  3. 收敛"临时感"：把 `mockFallbackDb` 等过渡产物逐步用真实接口替换（或明确标注为降级）。
  4. 统一响应式断点，确保移动端可读。
- **验收**：视觉一致性提升；双主题切换无错位；构建通过；在日志附关键页面清单与改动点。
- **自主扩展**：可顺手补充缺的 `SkeletonBlock`/`ErrorState`/`EmptyState` 统一组件。

### 方向 3 · 首页黄河意境（不重写，选优并升华）
- **目标**：让首页第一屏更能传达"黄河"的意境（雄浑、奔流、水墨、文脉）。
- **已具备**：`homepage/` 下已有 `RiverHero`、`InkHero`、`CityHero`、`TimelineHero`、`DynastyRail`、`StatTicker` 等。
- **具体任务**：
  1. 定位真实首页路由与渲染组件（`display-v2/src/router/index.js`：`/` 当前重定向到 `/map`，需确认 Hero 挂载位置）。
  2. **在现有 Hero 中选一个最能体现黄河意境的（首推 `RiverHero` / `InkHero`）作为首页主视觉**，不要整体重写。
  3. 在不破坏结构前提下，增量升华：例如用 Three.js 加一层水墨/河水流动 shader 背景、GSAP 强化"奔流"动效、叠加黄河诗句书法标题。
  4. 确保 `real`/`inkwash` 双主题下都成立。
- **验收**：首页主视觉明确传达黄河意境；未引入重写导致的回归；性能可接受（shader 不卡顿、不破坏 `manualChunks`）。
- **自主扩展**：若发现某 Hero 组件有可复用的"黄河意象"资产，可沉淀为共享组件。

### 方向 4 · 诗词 AI 分析页（深化）
- **目标**：让 `/poems/:id` 的 AI 分析成为亮点——不止"赏析文本"，而是结构化、可交互、有文化深度。
- **已具备**：`PoemAnalysis` 实体/服务/公开接口/测试齐全；`PoemDetail.vue` 已接入分析卡。
- **具体任务**：
  1. 评审现有 `PoemAnalysisService` 的 prompt 与输出结构（JSON：`lines[]`/`sentiment`/`background`/`annotations`），提升赏析质量（意象、用典、手法、情感层次、与黄河/齐鲁地缘关联）。
  2. 前端把分析结果做成可交互模块：逐句解读展开、情感标签可视化、创作背景时间线锚点、相关诗人/景点联动。
  3. 增加"缓存失效/重生成"机制（利用 `poem_analysis.version` 字段）。
  4. 补端到端测试与边界（空内容、超长诗、敏感词）。
- **验收**：分析页信息密度与可读性明显提升；相关单测通过；构建通过。

### 方向 5 · AI 写诗 + 一笔一画渲染模块（新增，重点创新）
- **目标**：用户选定主题（如"黄河""清明""泰山"）→ AI 先生成一首诗 → 前端像有人执笔，**一笔一画把诗写出来**（汉字书写动画）。
- **推荐架构（落地性强，优先此方案）**：
  - **后端**：新增 `ai_poem` 表与 `AiPoemService`：
    ```sql
    CREATE TABLE IF NOT EXISTS ai_poem (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      theme VARCHAR(100) NOT NULL COMMENT '生成主题',
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL COMMENT '诗正文(含标点/换行)',
      author_alias VARCHAR(50) COMMENT 'AI 署名(如"AI小文")',
      model VARCHAR(64),
      prompt TEXT COMMENT '生成用 prompt(可复现)',
      status VARCHAR(20) DEFAULT 'generated',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 写诗作品';
    ```
  - `AiPoemService` 复用 `LlmClient`（DeepSeek SSE）先生成诗（**"AI 分析提前给好诗"=后端预生成并落库**），提供 `POST /api/public/ai-poem/generate?theme=黄河` 与 `GET /api/public/ai-poem/{id}`。
  - **前端（渲染核心）**：用开源库 **HanziWriter**（MIT，内置汉字笔顺数据，支持 stroke-by-stroke 动画）封装 Vue 组件 `AiPoemWriter.vue`：逐字取 `content`，依次用 HanziWriter 写出每个字，组成整首诗；配毛笔笔触/宣纸背景、书写音效（可选）、写完后淡入落款。Three.js/Canvas 仅作背景氛围。
  - **要点**：不要自己造汉字笔顺数据，直接集成 HanziWriter（或等价方案 `hanzi-write`）。标点/换行做暂停与分行处理。
- **验收**：能生成诗并以书写动画呈现；接口返回结构化诗；双主题适配；构建通过；附一段"如何触发"的说明到日志。
- **自主扩展**：可加"主题画廊""分享图导出""与 AI小文联动赏析刚写的诗"。

### 方向 6 · 现代数字化可视面板（参考开源，强化 sjg-datav）
- **目标**：把 `sjg-datav`（React19+R3F+ECharts）做成真正的"现代数字可视化大屏"，参考 `else/sc-datav-main`（DataV 风格）与现代 dashboard 美学。
- **已具备**：React19+TS+Vite+R3F+ECharts 基础工程；display-v2 有悬浮入口进大屏。
- **具体任务**：
  1. 调研 `else/sc-datav-main` 的布局/组件思路（**只读参考，不改它**），提炼可借鉴的卡片、边框、动效、配色。
  2. 设计大屏模块：沿黄九市文化热力、诗人关系力导向、诗词情感分布、节庆/节气时间轴、实时统计（诗人/诗词/文化条目计数）、黄河三维飘带（R3F）。
  3. 数据来自 `backend` 公开接口；缺接口则提建议并在 `docs/data_interfaces.md` 增补。
  4. 保证 `tsc -b` + `vite build` 通过，性能流畅（懒加载重模块、控制 draw call）。
- **验收**：大屏可运行、模块充实、视觉现代；构建通过；附模块清单。

### 方向 7 · 关系图谱优化升级（AntV G6）
- **目标**：把诗人关系图谱做成可探索、好看、好用的知识图谱。
- **已具备**：`poet_relation` 表 + 12 对种子 + `PublicPoetRelationController`；display-v2 用 AntV G6。
- **具体任务**：
  1. 确认前端 G6 渲染现状（若无独立图谱页，新增 `GraphView` 或嵌入诗人页）。
  2. 优化：力导向/gForce 布局、按朝代/地域聚簇着色、边类型区分（师承/交游/并称/亲属 不同颜色与线型）、图例、搜索定位、点击节点跳诗人详情、hover 高亮邻域。
  3. 数据扩面：在方向 1 的关系表基础上，支持诗人↔景点、诗人↔文化条目关联入图（按需）。
  4. 性能：节点多时虚拟化简/分簇加载；不破坏 `manualChunks`（g6 独立 chunk）。
- **验收**：图谱可交互、信息清晰、与主题协调；构建通过；附交互说明。

### 方向 8 · 业务拓展：五大文化板块（顺序 ①→②→③→④→⑤）
- **顺序**：①民俗节庆 → ②古诗词（已有，纳入聚合） → ③非遗工艺 → ④民间文学 → ⑤饮食戏曲。
- **已具备**：①民俗节庆 C0–C5 代码完成，`scripts/output/festivals_seed.sql`（25 条）**待入库**；`cultural_item` 公共表已支持五类（`festival`/`craft`/`literature`/`food_opera` 及古诗词聚合）。`CraftWorkshop.vue` 脚手架存在。
- **具体任务（按序）**：
  1. **①收尾**：尝试用 `scripts/apply_migration.py` 应用 V6 与 `festivals_seed.sql`；若远端不可达，写清手动命令并继续前端走查（C6）。确保首页「文化长廊」聚合展示正常。
  2. **③非遗工艺**：新增 `craft_detail` 扩展表（工艺类别/传承人/工序/代表作）；复刻民俗节庆的"建表→AI 生成种子(`scripts/generate_*.py` 同模式)→admin 校对发布→前台 `CraftWorkshop.vue` 填充"闭环。
  3. **④民间文学**：新增 `literature_detail`（体裁/流传地/主人公）；同模式闭环 + 新页面/路由。
  4. **⑤饮食戏曲**：新增 `food_opera_detail`（剧种/菜系/代表剧目）；同模式闭环 + 新页面/路由。
  5. 全程确保五大板块在首页/导航聚合可达；公开接口只查 `published`。
- **验收**：①端到端可演示；③④⑤各有建表+种子+页面+发布流；构建通过；进度日志记录每类完成度。
- **自主扩展**：可顺手为每类生成双主题图（real/inkwash）占位与 SEO 元信息。

---

## 5. 自主找活干（额外授权清单）

除 §4 外，你**被授权**在过程中主动发现并修复以下问题（发现即做，做就记日志）：
- 构建告警、unused 依赖、死代码、console 噪音。
- 把 `mockFallbackDb` 等过渡数据替换为真实接口或明确降级标注。
- `useImage.js` 硬编码白名单 → `ThemeProfile`/媒体资产表 重构（方向 1 已列）。
- 补充缺失单测（尤其 service 层与前端 `tests/`）。
- 性能：路由懒加载、`manualChunks` 纪律、图片懒加载、大列表虚拟滚动。
- 无障碍（alt/aria/对比度）、SEO 元信息、404/空态统一。
- 文档：更新 `docs/data_interfaces.md`、`CLAUDE.md`（仅纠错）、`README`（若有）。
- 任何你认为是"明显该做"的体验/质量改进——大胆做，但写清理由。

---

## 6. 完成定义（Definition of Done）

一个方向/子任务算"完成"，当且仅当：
1. 对应端 **构建通过**；相关 **单测通过**（如改动触及）。
2. 新增功能有**可演示的页面或接口**。
3. 数据库变更已写成**幂等迁移 SQL**；若 DB 已应用请注明，若未应用请给**手动应用命令**。
4. **进度日志**已追加（做了什么/改了哪些文件/如何验证/是否需人工步骤）。
5. 已 **git 提交到本地**（前缀 `[codex-night]`），**未推送远端**。
6. 公开 API 契约未被破坏（或已同步前端与文档）。

---

## 7. 给 Codex 的启动指令（复制本提示词后，第一句话用这个）

> 请先完整阅读本任务书的 §1–§3，按 §2 完成现状评估并写入 `docs/plans/YYYY-MM-DD-codex-status.md`（用今晚日期），然后严格按 §4 优先级推进——**从方向 8 的 ①民俗节庆收尾（应用 V6 与 festivals_seed.sql、端到端走查）开始**，依次推进 ③→④→⑤、方向 5（AI 写诗+一笔一画）、方向 7（图谱）、方向 4（分析页深化）、方向 3（首页黄河意境）、方向 2（整体美观 /design-taste-frontend）、方向 1（架构与表设计收口）。过程中遵守 §3 安全边界、主动执行 §5 的自主优化，每完成一项追加日志并本地提交（前缀 `[codex-night]`）。不需要等我确认，自主往前推，最大化通宵产出。开始。

---

*本提示词由用户在睡前委托生成，目标是让 Codex 在无人值守下连续自主工作。所有"已具备"状态基于 2026-08-13 仓库快照，Codex 开工前应自行复核最新状态。*
