# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**SJG** - 齐鲁文化数字人文平台（黄河流域山东段文学景观）。展示诗人、诗词、景点、历史事件、五类文化条目（节庆/工艺/文学/饮食戏曲）的数字人文系统，含 AI 对话助手「AI小文」与 AI 诗词赏析。

## 项目结构与技术栈

| 目录 | 技术栈 | 端口 | 说明 |
|---|---|---|---|
| `backend/` | Spring Boot 3.2.5 + Java 17 + MyBatis-Plus 3.5.5 + MySQL | 8080 | 后端 API |
| `admin-frontend/` | Vue 3 + Vite + Element Plus + axios | 5173 | 后台管理 |
| `display-v2/` | Vue 3 + Vite + ECharts + AntV G6 v5 + Three.js + GSAP | 5175 | 展示前端（主力） |
| `sjg-datav/` | React 19 + TS + Vite + ECharts + SWR | 5180 | 数据大屏（display-v2 导航栏外链入口） |
| `scripts/` | Python / Node | - | seed SQL 生成、migration 应用及维护脚本 |
| `docs/` | - | - | 接口规范、计划、DB 搭建说明 |
| 工作区外归档 | - | - | 历史素材、旧备份与废弃生成流程，不参与构建 |

四个项目彼此独立，**没有根 package.json、没有 monorepo/workspace**。

## 常用命令

### 后端（backend/）
**没有 Maven wrapper**（`mvnw` 不存在），`mvn` 也可能不在 PATH。可用 IDEA 内置 Maven（`D:\app\idea\IntelliJ IDEA */plugins/maven/lib/maven3/bin/mvn`）或自行安装。命令本体：
```bash
mvn spring-boot:run                      # 启动（需本地 MySQL 已起）
mvn test                                 # 3 个测试类，纯 Mockito/JUnit5，不需要 DB
mvn test -Dtest=PoemAnalysisServiceTest   # 单个测试类
mvn package -DskipTests
```
四个测试类：`PoemAnalysisServiceTest`、`PublicPoemAnalysisControllerTest`（均 `@ExtendWith(MockitoExtension.class)`）、`ChatServicePromptTest`（用 `ReflectionTestUtils` 注入 `systemPrompt`，连 Mockito 都不需要）、`SpotServiceTest`（验证删除景点前会清空诗词外键）。**零个 `@SpringBootTest`**。

### 前端
```bash
cd <project-dir> && npm install
npm run dev / npm run build / npm run preview
```
`sjg-datav` 的 `build` 是 `tsc -b && vite build`（`strict` + `noUnusedLocals` + `noUnusedParameters`，`tsconfig.app.json` 的 `include` 是整个 `src`），**类型错误会阻断构建**，包括 `src/pages/DataV/test.tsx`~`test8.tsx` 那些废弃试验文件。`admin-frontend` 与 `display-v2` 无任何类型/lint 关卡。

### display-v2 测试
用 **Node 内置 test runner**（非 Vitest），当前 7 个测试文件：
```bash
npm test          # node --test --experimental-test-coverage tests/*.test.js
npm run test:unit # 无覆盖率
node --test tests/mediaBase.test.js   # 单文件
```
只能测纯 `.js` 模块，**`.vue` SFC 完全测不了**——这就是 `src/utils/` 下存在 `cityHeroMedia.js`、`moodBackdrop.js`、`routeFeedback.js` 这类 10 行小文件的原因：想被覆盖就把逻辑抽成纯函数。

### 质量关卡
仓库**没有 CI、没有 ESLint/Prettier、没有 Checkstyle**，任何目录都没有 `lint` 脚本。唯一自动关卡是 `sjg-datav` 的 `tsc -b`。改完必须手动跑 `npm run build` / `npm run test:unit` / `mvn test`。

## 后端架构

### 分层与鉴权
- `controller/pub/`（**11 个**）- 公开只读 `/api/public/**`，permitAll。三个展示前端全部走这里；包括 `PublicDynastyController`（`GET /api/public/dynasties`）与 `PublicEventController`（`GET /api/public/events`）。
- `controller/admin/`（9 个）- `/api/admin/**`。**GET 只需任意登录用户（含 `user` 角色），非 GET 才需要 `admin`**（`SecurityConfig.java:49-50`）。`AuthController` 虽在 admin 包下，但路径是 `/api/auth`（register/login permitAll）。
- `service/`（14 个）- 只有 `AiPoemService` 用了 MyBatis-Plus `ServiceImpl`，其余全是手写 mapper 调用。
- `mapper/`（15 个）- **全部是空的 `extends BaseMapper<T>`，没有一行注解 SQL，也没有任何 XML**。所有查询靠 `LambdaQueryWrapper`。`application.yml:17` 的 `mapper-locations: classpath:mapper/*.xml` 指向不存在的目录，是死配置。
- `dto/`（10 个）有 `Result`/`PageResult`/各种 Request；**没有 `vo/` 包**，公开接口大量直接返回手拼的 `Map<String,Object>`（`PublicSpotController:67,97`、`PublicPoemController:63`、`PublicPoetController:72`、`PublicTimelineController:46` 等）。
- `util/`：`JwtUtil`（jjwt 0.12 API）、`PoetCompletenessCalculator`（诗人资料完整度 0-100 评分）。

鉴权细节：authority 是 DB 里的裸 `role` 字符串（JWT filter 直接 `new SimpleGrantedAuthority(user.getRole())`），用 `hasAuthority("admin")` 而**不是** `hasRole`（没有 `ROLE_` 前缀）。JWT filter 每个请求都查一次 `UserMapper`，且**不校验 `user.status`**——账号被禁用后 token 仍有效到过期。401 响应体是硬编码 JSON，不走 `Result`。

### 统一返回与异常
`Result<T>` = `{ code, message, data }`，`error(String)` 默认 code 500。Controller 返回 `ResponseEntity<Result<>>`，HTTP status 与 `Result.code` 是两处独立设置，会漂移。

`GlobalExceptionHandler`（在 `config/` 包下）：`DataIntegrityViolationException` / `SQLIntegrityConstraintViolationException` → 400，靠字符串匹配外键报错里的表名列名给出中文提示；**`RuntimeException` → 400 并原样返回 `e.getMessage()`，这是本项目事实上的业务异常通道**——service 里到处 `throw new RuntimeException("用户名已存在")` 就是靠它把中文透出去，别"修正"成 500。

兜底的 `Exception` handler 已从暴露 `e.getMessage()` 改成固定文案「服务器内部错误，请稍后重试」+ `log.error` 打完整栈；两个 DataIntegrity handler 也有 `log.warn`。别把这个安全处理当 bug 回滚。

`spring-boot-starter-validation` 在 classpath 但**全项目零个 `@Valid`**，校验全是 service 里手写的。

### 前端三处独立实现同一个 Result 解包
- `display-v2/src/api/index.js` - axios 响应拦截器：`code===200` 就 **`return res.data`**，所以 `api.get()` 拿到的是 payload 本体，没有 `.data`。业务错误转 rejected `Error`（带 `.code`）。文件唯一导出是 `export default api`，**没有按域封装的 API 函数**，各组件直接 `api.get('/poets')`。
- 同文件挂了两个额外方法：`api.swrGet()` 返回的是 **`{ data, isStale }`**（与 `api.get` 形状不同，最容易搞错），`api.prefetch()` 是 fire-and-forget。底层是 `src/api/cache.js`（60s TTL + 请求去重 + idle 预取），**cache key 带 theme 后缀**（主题已锁死，故实际恒定）。
- `admin-frontend/src/api/index.js` - 同样解包；请求拦截器注入 `Bearer`；**401 或 403 都会清 token 并跳登录**（所以真正的权限不足会看起来像会话过期）。
- `sjg-datav/src/api/index.ts` - 用原生 `fetch` 手写第三份解包（`:6-20`），附带 `fetchAllPaginated` 分页累加（`maxPages=50` 兜底，`:26-55`）。三份实现无共享模块。工作区已把 `getPoets`/`getPoems`/`getSpots` 从单次 `?size=200` 改成走 `fetchAllPaginated`。

### AI 相关（两条独立的 LLM 通路）
- `LlmClient` 用 JDK 自带 `java.net.http.HttpClient`（刻意不引新依赖）。`streamChat` 是**阻塞式**的（`http.send(...)` 同步，在调用线程上逐行读 SSE）。`llm.api-key` 为空时启动只 WARN 不失败——聊天返回 error 事件、赏析返回 fallback。
- `ChatService`：`SseEmitter` + `newCachedThreadPool`；事件 payload 是 `{"delta":"..."}` / `{"error":"..."}`，**没有命名事件类型（无 `.name(...)`）也没有向客户端发 `[DONE]`**（`[DONE]` 只出现在 `LlmClient` 消费上游 SSE 那一侧），前端靠 emitter 关闭判断结束。system prompt 里 `{rag_context}` 占位符缺失时会 WARN 并把 RAG 追加到末尾（`ChatServicePromptTest` 锁定了这个行为）。
- **限流是内存滑动窗口，且有两份独立拷贝**（`ChatService.rateMap:38`、`AiPoemService.rateMap:27`），各自 60s/10 次，重启清零，key 来自可伪造的 `X-Forwarded-For`。
- **`RagRetrievalService` 是 SQL `LIKE` 关键词检索，不是向量检索**——仓库里没有任何 embedding/向量库。因为没有中文分词器，`extractKeywords`（`:144-156`）的策略是「整串 + 全部 2-gram，最多 8 个」，然后对 `CONCAT(IFNULL(...)) LIKE '%kw%'` 做 OR。这类谓词**用不上索引**，每轮对话都全表扫 poet/poem/scenic_spot。
- `PoemAnalysisService`：以 `poem_analysis` 表为缓存（`poem_id` UNIQUE，查询 `.last("LIMIT 1")`），`CURRENT_VERSION = 2`（`:40`）——**改这个常量等于让全部 ~195 首重新走付费生成**。fallback JSON（含 `raw` 字段）永不落库（`:143-146`），避免缺 key 时污染缓存。

### 前端代理
三个前端的 vite config 都把 `/api` 代理到 `http://localhost:8080`，开发时后端必须同时运行。`admin-frontend` 与 `display-v2` 额外配了 `allowedHosts: ['.cpolar.top', '.cpolar.cn']`（cpolar 隧道）。

### 启动时清代理
`SjgApplication.clearProxySystemProperties()` 在 `SpringApplication.run` **之前**（`:14-15`）清掉 socks/http/https 六个 proxy 系统属性并设 `java.net.useSystemProxies=false`。原因：MySQL 的 `StandardSocketFactory` 会读 `socksProxyHost`，Clash 类工具或 IDE 注入的代理会让 MySQL 和 LLM 连接全挂。真正需要走代理的东西必须在自己的 client 上配，别指望系统属性。

### CORS
CORS 是独立的 `CorsFilter` bean（不是 `http.cors()`）：读 `@Value("${cors.allowed-origins:...}")` 逐个 `addAllowedOrigin`，**外加恒定的 `http://localhost:*` pattern**（`CorsConfig.java:33`），方法收窄到 `GET/POST/PUT/DELETE/OPTIONS`，加了 `setMaxAge(3600)`。`allowCredentials(true)` 保留。所以：配置项对非 localhost 源生效，但任意 localhost 端口在生产环境也仍然放行。

## display-v2 架构

### 路由
`/` 重定向到 `/map`（3D 地图即首页）。其余：`/poets`（`/poets/all` 重定向到 `/poets?view=all`）、`/poets/:id`、`/poems/:id`、`/spots/:id`、`/timeline`、`/culture`、`/festivals`、`/crafts`、`/literature`、`/food-opera`（四类各带 `/:id`）、`/regions/:region`、`/cities/:region`、`/compose`。全部懒加载。

两个坑：**四条文化详情路由共用 `CulturalDetail.vue`**；**`:region` 参数是中文城市名**（`/regions/济南`），所以 URL 实际是百分号编码的，`cityAliases.js` 存在就是为了把出生地字符串归一到规范的九市名（规范列表见 `src/config/nineCities.js`）。

路由过渡逻辑在 `App.vue` 而非 router 里。两处注释是踩坑换来的、**不要改**：
- `App.vue:98` — 绝不加 `mode="out-in"`。它要等旧页 leave 完成才挂新页，详情页返回时若 `transitionend` 丢失就整页空白。
- `App.vue:259-261` — 导航后 800ms/1600ms 两次强制清除残留的 `*-enter-from` class，防止子组件中途换根节点导致页面永久 `opacity:0`。

### 主题系统：已收敛为单一 inkwash
状态层是 `src/composables/useTheme.js`，**零依赖单例**（不用 Pinia），且**已硬编码锁死**：`const THEME = 'inkwash'`（`:17`），`toggle`/`switchTheme` 都是 `noop`（`:43,56-57`），加载时清除 `localStorage('sjg-theme')`（`:20-22`），`isReal` 恒 `false`（`:34`），`isAnime` 恒 `true`（`:35`）。

命名地雷：暴露出来的计算属性叫 **`isAnime`（含义是 inkwash）**，不叫 `isInkwash`；`_anime` 文件后缀、`anime-layout` CSS class 同理，都是早期「动漫风」改名成「水墨」后留下的化石。搜 `isInkwash` 找不到有用的东西。

主题 class 由 `useTheme.js` 模块加载时一次性打在 **`<html>`** 上（`theme-inkwash` + `data-theme="inkwash"`），这样 fixed/teleport 出 `.app-root` 的元素也能吃到 token。

**「一页一貌」治理已执行完毕，且比旧文档记录的走得更远。当前真相：**
- **全站已无双主题分支页面**。`MapView.vue`（965 行）与 `RiverHero.vue`（559 行）**也已是单一版式**——`RiverHero` 连 `useTheme` 都不 import，`MapView` 只用 `theme` 值传给 `resolveContent`。二者残留的 `sn-sticky-real` / `real-3d-container` 只是命名化石，不是条件分支。
- **`RegionSpots.vue` 的双布局已删除**（现 908 行，单一 `real-container`，见文件头 2026-08-20 注释）。旧文档说它「仍有两套完整页面布局」——**已过时**。但 `<style>` 里仍留着 `.spots-split-layout`/`.anime-spot-card` 等已无引用的死 CSS（`:569-837`）。
- `PoemDetail`（根 class `poem-detail--inkwash`）、`PoetDetail`（`pd--inkwash`）、`Timeline`（渲染 `InkTimeline`）都是恒定 inkwash，real 分支及样式已删。
- 列表页 / 文化页 / 图谱统一「日式纸面」（细线 + 印章 + 留白）。

**已从磁盘删除**（旧文档说「保留待删确认」的都已删，改它们不存在的版本没有意义）：`components/timeline/RealTimeline.vue`、`views/FestivalDetail.vue`、`components/ThemeSwitcher.vue`、`components/ThemeTransition.vue`、`styles/inkwash.css`、`styles/real.css`。

仍存活的双轨**基础设施**（不是页面分支，暂勿清理）：`themes/manifest.js` 的 `resolveAsset(key, theme)` 与 `MEDIA_PREF = { real: 'video-first', inkwash: 'image-first' }`（`:53,70`）、`src/content/{real,inkwash}/` 双语文案（经 `resolveContent(scope, key, theme)`，`MapView`/`RegionSpots`/`CityDetailCard` 在用）。

### 样式与 token
`src/styles/`（注意此目录已重构，只剩两个文件）：
- `variables.css`（`main.js:5` 加载）—— **全部 token 都在 `:root`，已不存在 `.theme-inkwash` 覆盖块**（单主题后无需覆盖）。约 13 个派生 token 用 `color-mix(in srgb, var(--accent) …)` 构建（`:38,42-54`），硬依赖 `color-mix()`，无 fallback。
- `theme.css`（`App.vue:130` import）—— **纯装饰性全局规则，按其文件头声明不定义任何 token**：纸纹 `body::before`、`.card` 朱红内环、`.divider` 印章字、`.section-heading` 笔刷下划线、`.hover-lift`、`prefers-reduced-motion` 兜底。
- 写死 `rgba(184,134,11,.08)` 而不用 `var(--accent-soft)` 会无声破坏 token 体系。

### 图片与媒体（三套机制并存）
1. `public/media/{real,inkwash}/` —— **主题化场景资产**，只通过 `src/themes/manifest.js` 的 `import.meta.glob('/public/media/{real,inkwash}/**/*.{mp4,jpg,jpeg,png,webp}')` 自动注册，`resolveAsset(key, theme)` 取用（key 是去扩展名、去 `-poster` 的 base 名），加资产不用改代码。OSS 内保持相同相对路径，靠 `.env` 的 `VITE_OSS_BUCKET_URL` 切换（dev 下 `resolveMediaBase` 恒返回 `''` 即用本地 `public/`）。
2. `public/images/{poets,spots,cultural,solar-terms}/` —— **按实体的图**，路径来自数据库 `imageUrl`/`avatarUrl` 列，由 `useImage.js` 用构建期 glob 白名单校验存在性。
3. `_anime` 文件名后缀 —— 最老的一套主题化机制，正在拆除。

`useImage.js` 现状：白名单是 `import.meta.glob('/public/images/**/*.{jpg,jpeg,png,svg,webp}')`（`:5`）。**`getImageUrl` 里的 `_anime` hack 还在，且会先把 `.png` 无声改写成 `.jpg`**（`:66`），再拼 `_anime.jpg`（`:67-68`）——意味着磁盘上的 `_anime.png` 通过这条路径**永远取不到**，只会静默落到占位印章 SVG，控制台无报错（而工作区新生成的素材恰恰是 `*_anime.png`）。较新的 `resolveImage()`（`:53-59`）不做 `_anime` 推导。两者都在用：
- `getImageUrl` 直接消费方 **4 个**：`RegionSpots.vue:136`、`SpotDetail.vue:159`、`PoetList.vue:393`、`CityDetailCard.vue:87`
- `resolveImage` 消费方 **2 个**：`themeAdapter.js:13`、`PoetDetail.vue:128`

`parseFirstUrl` 负责处理后端那种「JSON 数组字符串」列（`'["https://a.jpg","b.jpg"]'`）。

⚠️ **`imageAnimeUrl`/`avatarAnimeUrl` 移除是半成品，且仍在读的比旧文档列的多**。当前仍读这两个字段的有 **6 处**：`RegionSpots.vue:213`、`SpotDetail.vue:171`、`PoetDetail.vue:143`、`CulturalDetail.vue:97-99`、`FoodOperaList.vue:122-124`、`useCityEnrichment.js:51`（注意此处顺序是 `imageUrl || imageAnimeUrl`，与其他处相反），外加配置串 `themes/inkwash/profile.js:21` 的 `imageField: 'imageAnimeUrl'`。已migrate 的：`themeAdapter.js`（走 `resolveImage(entity[realField])`）、`admin-frontend/PoetList.vue`（已删 `avatarAnimeUrl` 表单项与序列化）。**`display-v2/PoetList.vue` 从来没读过这两个字段**，旧文档把它列进迁移清单是误记。动之前先确认方向。

### 其他 display-v2 要点
- **没有任何路径别名**，`@/components/...` 不解析，全用相对路径。
- `components/homepage/` 名不副实——`ErrorState`、`SkeletonBlock`、`EmptyState` 这三个复用最广的基元就在里面，全站都在用。
- `components/InkPlaceholder.vue`：纯 CSS/SVG 程序化水墨占位图，按 `seed + kind` 哈希出墨渍位置，朱红印章字按 kind 取 `节/诗/艺/文/味/景`。零素材成本，用来替代缺图。
- `src/config/nineCities.js` 导出 `NINE_CITIES`（上游→下游九市），**已被 5 个视图引用**（`CultureGalleryView`、`CityCulture`、`FestivalList`、`LiteratureList`、`FoodOperaList`），不是死代码。
- 重可视化各自只有一个引用方：ECharts 只在 `SpotDetail.vue`（`import * as echarts` 全量包），G6 只在 `PoetList.vue`（`?view=graph` tab），Three.js 在 `MapView.vue`（`useThreeSandbox.js` 沙盘）与 `CraftWorkshop.vue`（`useGlbScene.js` + DRACO）。`vite.config.js:23-32` 的 `manualChunks` 把 echarts/g6/three 拆成独立 vendor chunk（`chunkSizeWarningLimit: 1500` 就是为了压住它们的告警），改可视化模块时别把三者打进同一个 chunk。
- G6 是 v5 API（`import { Graph }`、`node`/`edge` 而非 `defaultNode`、`behaviors` 而非 `modes`、`setSize` 而非 `changeSize`）。**Canvas 渲染读不到 CSS 变量，所以 `graphTheme` 必须写字面量 hex。**
- `AiChatBox.vue` 绕过 axios 直接用 `fetch` + `ReadableStream` 解 SSE（axios 不支持流），输出经 `marked` + `DOMPurify.sanitize`。它挂在 `App.vue` 全局。
- `src/config/mockDetailData.js` 是**在用**的客户端文案补充（按中文景点名索引，补后端没有的 `verticalText`/`history`/`play`），不是网络降级 mock；景点改名就静默失效（`'泰山'` 和 `'泰山风景区'` 两条重复条目就是这么来的）。曾被提到的 `mockFallbackDb.js` **不存在**。
- **`.env` 现有两个自定义变量**（不再是一个）：`VITE_OSS_BUCKET_URL`、`VITE_DATAV_URL`。数据大屏入口已从硬编码改为 `App.vue:213` 的 `import.meta.env.VITE_DATAV_URL || 'http://localhost:5180'`（导航栏外链，不再在 `MapView` 里）。
- `public/media/real/` **存在**（有 `hero-map.mp4` / `hero-map-poster.jpg` / `spots/`），但其下**没有 `cities/` 子目录**，而 `cityIllustrations.js` 和 `resolveCityHeroMedia` 都在找它——所以"城市 hero 视频不显示"是缺目录，不是代码 bug。

## sjg-datav 要点
- 无 router，`App.tsx` 只渲染 `<DataV />`。
- **舞台缩放/信箱适配**：`src/hooks/useAutoFit.ts` + `src/components/AutoFit.tsx`，设计稿 **1920×1080**。用 `ResizeObserver` 量**外层容器的 `clientWidth/Height`**（`:19-21`，刻意不用 `window.innerWidth`，避免 iframe/滚动条误差），`scale = min(w/1920, h/1080)` 即 contain + 居中，永不裁切。这修的是 1699×828 之类窗口下"只显示一半"的问题。舞台内部可以放心写死 px。
- **zustand store 是死代码**：`src/pages/DataV/stores/index.ts` 定义了 `useDataVStore` 但无人 import（zustand 依赖仅为它存在）。真实状态是 SWR 缓存 + 局部 `useState`。SWR key 是裸字符串（`'poets'`/`'poems'`/`'spots'`/`'dynasties'`/`'timeline'`/`'cultural-categories'`），所以多个面板各自调 `usePoets()` 会共享同一请求。
- 主题 token 在 `src/styles/global.css:8-20` 的 `:root`（`--dv-gold #c9a227`、`--dv-gold-light #e5c96b`、`--dv-vermilion #c23a2b`、`--dv-ink #ece4d0`、`--dv-teal #7f9aa0` 等水墨青金）。ECharts option 读不到 CSS 变量，`RightPanel.DARK_PALETTE`（`:148`，8 色）、`SentimentCloud.CLOUD_COLORS`（`:17-20`，10 色）是硬编码副本，`ShanheMapChart` 则是散落的内联 hex（`:126,156,191,192,199`），改色要多处一起改。`NumberAnimation.tsx` 还残留旧的 AI 紫渐变。
- **死代码更正**：`src/pages/DataV/map/*` 目录**不存在**（旧文档记录有误）。地图是 `src/components/ShanheMapChart.tsx`，**正在使用**。真正的死代码是 `src/pages/DataV/test.tsx`~`test8.tsx`（8 个）与 `src/components/TimelineChart.tsx`，零引用但**仍被 `tsc -b` 检查**，会阻断构建。
- **无任何 mock 降级**：后端挂了 SWR 报错、hook 返回 `[]`，面板静默显示 0/`—`。

## admin-frontend 要点
- 路由守卫纯 localStorage 驱动（`token`/`username`/`role`），`/users` 带 `meta.requireAdmin`。**这只是装饰**，真实权限靠后端 `/api/admin/**` 的 JWT+role 校验。注册自助（`/api/auth/register`）后进 `pending`，需 admin 在 `UserList` 审批。
- Pinia 已装且 `main.js:12` 的 `app.use(createPinia())` 已跑，但**零个 `defineStore`、没有 `stores/` 目录**，认证状态是 `Layout.vue:82-83` 里裸读 localStorage 的 `computed()`（不响应 storage 变化）。别以为已经接好了。
- CRUD 靠三个组合组件而非 composables（本项目**零个 composable、无 `composables/` 目录**）：`DataTable.vue`（自管分页/搜索，调**作为 prop 传入**的 `fetchFn`——不是 `inject()`，期望 `{records, total}`，`defineExpose({fetch})` 供父组件刷新）、`FormDialog.vue`、`ImportDialog.vue`（xlsx 导入）。
- **图片上传到 OSS**：`MultiImageUpload.vue` 的 `v-model` 是 **`string[]`**（`modelValue: Array`），`VideoUpload.vue` 的 `v-model` 是 **JSON 字符串**（emit 前 `JSON.stringify`）——互换会静默损坏数据。两者都 `POST /api/admin/upload`（FormData 带 `file` + `directory`），`OssService` 回 `{url}`。directory 是按实体的约定字符串：`poets`/`spots`/`spots/anime`/`spots/videos`/`events`。
- **DB 里 `avatarUrl`/`imageUrl`/`imageAnimeUrl`/`videoUrl` 存的是 JSON 数组字符串**，所以 `getFirstImage()`/`parseImageUrls()` 被复制了 **3 份**（`PoetList.vue:77,98`、`EventList.vue:65,86`、`SpotList.vue:84,110`，`PoemList`/`CulturalList` 里没有）+ `VideoUpload` 里第四个变体。修解析 bug 要改多处，尚未抽公共工具。
- 五个列表页 `CulturalList`/`EventList`/`PoemList`/`PoetList`/`SpotList` 的 `handleDelete` 都有完整 `ElMessageBox.confirm` 二次确认（含 try/catch 吞掉取消）。`PoetList` 已删掉 `avatarAnimeUrl`/`avatarAnimeUrlArray` 表单项与序列化，label 为「头像」。
- 朝代选项来自 `GET /api/public/timeline` 映射 `t.dynasty`（`PoetList:176-177`、`EventList:161`、`PoemList:140`）——**即便新的 `PublicDynastyController` 已加，admin 端仍未改用 `/api/public/dynasties`**。
- Element Plus 图标全局注册在 `main.js`，模板里直接用 `<el-icon><User /></el-icon>` 无需 import。
- `traditional.css`（647 行）全局引入（`main.js:5`）并 `@import` Google Fonts，离线/墙内会回落 KaiTi/SimSun。它的 token（`--color-zhu #C23B22`、`--color-jin #B8860B`、`--color-mo #2C2A2E`）与 sjg-datav 的 `--dv-*`、display-v2 的主题 token 是**三套互不相干的设计系统**，没有共享包。

## 数据库与 Migration
- 本地 MySQL 8.0.46：`127.0.0.1:3306`，Windows 服务名 `MySQL80`，user `root`。主力库 **`sjg01`**（生产数据完整副本）；`sjg` 为小型测试库。完整搭建/恢复步骤与预期行数校验表见 `docs/local_db_setup.md`，数据库口令只允许通过环境变量提供。
- ⚠️ **库名有三种说法**：`application.yml:7` 默认 `sjg01`，`schema.sql:1-2` 创建并 `USE sjg`，脚本默认使用 `DB_NAME=sjg01`，均可由环境变量覆盖。
- 旧远程实例已弃用；`scripts/apply_migration.py` 默认连接本机 `127.0.0.1:3306`，并使用环境变量 `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME` 覆盖，不再携带远程地址或默认口令。
- **Flyway 不是依赖**。`db/migration/` 是 Flyway 命名风格但没人自动应用，全靠 `python scripts/apply_migration.py <file>` 手动跑（env: `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME`）。该脚本结尾的 "verify" 块（`:47-57`）硬编码查 `poet_relation`，对非 V4 的 migration 是无意义噪音。
- 现有 `V2`–`V4`、`V6`–`V10`、`V12`–`V24`。**缺口是 V1 / V5 / V11**：V1 相当于 `schema.sql`；**V5（`poem_analysis` 建表）和 v4 在 `display-v2/migrations/` 下**，小写 `v4_poet_relation.sql` / `v5_poem_analysis.sql`；V12–V16 是从某 worktree 的 V7–V11 重编号来的。
- **`V24__imagegen_asset_backfill.sql`**：把 OSS 上新生成的素材回填到空字段，三段共 33 行（21 条 `scenic_spot.image_url`、9 条 `poet.avatar_url`、3 条 `event.image_url`），每条 `WHERE name = '...' AND (field IS NULL OR field = '')` 保证幂等。
- 所有 migration 都在文件头注明幂等策略且**必须幂等**。MySQL 8 没有 `ADD COLUMN IF NOT EXISTS`，所以 V12 之后的标准做法是查 `information_schema.COLUMNS/STATISTICS` + `SET @ddl := IF(...)` + `PREPARE/EXECUTE/DEALLOCATE PREPARE`（照抄 V12–V16）。文化条目 seed（V18–V21）的幂等靠「按 `(category,title)` DELETE 再 INSERT」+ 详情表 `ON DELETE CASCADE`。
- `schema.sql` / `schema_utf8.sql` **不幂等**（裸 `CREATE TABLE`），只含 7 张基础表，且种了默认 admin 账号。`poem_analysis`/`poet_relation`/`cultural_item` 及四张详情表都不在里面——要到当前 schema 得 `schema.sql` + `display-v2/migrations/` + V2..V25。`_utf8` 变体是为 Windows/MySQL 字符集问题准备的。
- V12 给多张表加了 `deleted` 列，但**全项目零个 `@TableLogic`**，删除全是物理删除，服务层手写级联。查询也不过滤 `deleted = 0`——一旦有人开始写这个列，数据就会诡异地"复活"。
- ORM 用 MyBatis-Plus，`map-underscore-to-camel-case: true`（`application.yml:19`）。分页依赖 `MyBatisPlusConfig:14` 的 `PaginationInnerInterceptor`，**移掉这个 bean 会让所有 `selectPage` 静默返回全量数据**。

### 后端删除与查询行为（勿当 bug 回滚）
- `SpotService.delete` **原先只是 `deleteById`（零级联）**，现改为先把引用该景点的 `poem.spot_id` 置空再删景点，并加了 `@Transactional`（新注入 `PoemMapper`）。
- `PoetService.delete` 原先只删诗+删诗人，现补上删 `poet_relation`（poetA/poetB 两侧，新注入 `PoetRelationMapper`），三步级联。
- `PublicSpotController.list` 修掉了 N+1：从每个景点一次 `selectCount` 改为单次 `selectList ... IN(spotIds)` + stream 分组。

## scripts/
- `apply_migration.py` —— 见上。
- `gen_cultural_migration.mjs` —— 当前在用的文化 seed 生成器（Node，零依赖，JSON → 幂等 DELETE+INSERT SQL）：`node scripts/gen_cultural_migration.mjs <input.json> festival V18`，产物落 `scripts/output/`（本地生成目录，已忽略），然后**首字母大写复制**到 `backend/src/main/resources/db/migration/`（`v18__festival_seed.sql` → `V18__festival_seed.sql`，两处内容逐字节相同）。
- 旧的 Python seed 生成器、图片批处理脚本和素材库存已移出仓库并保存在工作区外归档；当前仓库只保留可复现的 Node seed 生成器、migration 应用脚本和已落盘的运行时素材。

## 素材生成（有真金白银成本）
`.workbuddy/skills/sjg-media-assets/SKILL.md` 是规范来源。**生成前必须先向用户报价并确认**（约 50-100 积分/5 秒视频、5-10 积分/图）。四个必做后处理，每个都是踩过的坑：
1. `output_dir` 参数不可靠（曾经落错目录、real/inkwash 互换）—— 生成后立刻移动到 `display-v2/public/media/{real,inkwash}/` 并核对。
2. ImageGen 输出底部约 8% 有「AI生成 WORKBUDDY」水印 —— `ffmpeg -vf "crop=iw:trunc(ih*0.92/2)*2:0:0"` 裁掉（横图 1536×1024 → 1216×764）。
3. VideoGen 5s/1080p 约 20MB 太大 —— `-c:v libx264 -crf 28 -preset slow -an -movflags +faststart` 压到 ≤3MB。
4. 用 `ffmpeg -ss <中点> -frames:v 1 -q:v 4` 导 poster 帧。

性能预算（用户已确认）：LCP < 2.5s，单页媒体增量 < 3MB。素材回填一律走 V23+ 幂等 migration，不直改库。

历史生成素材及其使用状态说明已随工作区外归档保存；运行时使用的图片已分别落在 `display-v2/public/images/` 与 `display-v2/public/media/`。已知遗留：`image_anime_url` 历史数据仍需按当前字段迁移策略处理；id71（无棣碣石山）仍无实景图。

## 文档
- `docs/data_interfaces.md` —— 接口与实体字段规范。**已部分过时**：只覆盖最初 5 个实体和 4 组公开接口，`cultural`/`dynasties`/`events`/`ai-poem`/`chat`/`poet-relations` 都没写。
- `docs/plans/2026-08-20-display-v2-visual-overhaul.md` —— 当前最新的执行规格（非提案，条条带 file:line 证据）。三项前置决策已确认：收敛单一 inkwash 主题（删 real）、文化走廊用零成本程序化视觉（AI 生成另行报价）、sjg-datav 只加导航入口不合并工程。结构是 Phase 0（token 层 + 主题收敛，必须先做）→ 批次 A/B/C/D（导航+hero+datav 入口 / 诗人诗词详情 / 文化走廊 / 时间轴长卷）→ Phase E 验收。它实际接管了 `2026-08-15-theme-strategy.md` 的方向。
- `docs/plans/2026-08-05-display-v2-ui-optimization-tasks.md` —— 文件自称**进度唯一源**（`:5`）。标记约定 `[x]` 完成 ｜ `[ ]` 未完成 ｜ `[~]` 进行中 ｜ `⏸` 阻塞/后期。仍开放：P2-M5~M9（批量素材/OSS，全部 `⏸`）、B-1~B-3（后端 `?style=` 参数、`/api/public/theme-assets`、admin 双风格上传，全部 `⏸`）。⚠️ **B-1~B-3 都是为双风格服务的，主题已收敛单一 inkwash，这三项事实上已作废，但该文件尚未更新**。
- `docs/plans/2026-08-15-{theme-strategy,beautify-plan,media-visual-plan,nine-cities-display-proposal}.md` —— theme-strategy 已执行完毕（且被 08-20 规格接管），其余三个仍是待执行提案。
- `docs/plans/2026-08-14-codex-*.md` 是历史自动运行日志，**其 V7–V11 编号与仓库实际不符**（对应仓库的 V12–V16），只当技术债清单看。
- `docs/superpowers/{plans,specs}/` —— 历史设计文档，按日期命名。
- `.workbuddy/memory/` —— 按日期的工作记忆；`.workbuddy/artifacts/` 有三份审计报告（backend 审计列了 83 个问题，其中多个文件正在被改）。

## 其他注意事项
- 历史 `else/`、生成库存、旧生成器和过时 SQL dump 已从仓库移除，并在工作区外保留可恢复归档；其中历史配置文档可能含敏感凭证，禁止回显或重新提交。
- `output/`、`display-v2/output/`、`scripts/imagegen/` 与本地备份文件已加入 `.gitignore`，运行时素材必须落在 `display-v2/public/`。
- 数据库快照已移至工作区外归档（2026-08-13 生产全量，9 张表）；导入说明见 `docs/local_db_setup.md`。
- 后端有若干性能已知项：`PublicSpotController.regions()`（`:110,113`）硬编码九市（上游→下游 `菏泽 济宁 泰安 聊城 济南 德州 淄博 滨州 东营`）并为每市发一次 `list(1,1,...).getTotal()` 即 COUNT（9 查询/请求，加城市要改这个数组，V10 就是为了让 `scenic_spot.region` 对齐这个列表）；`PublicTimelineController` 每朝代 4 次查询且返回全量不分页。
- `PublicPoemController:22` 与 `PublicPoemAnalysisController:27` **共用 `/api/public/poems` 基路径**，靠子路由区分（前者 `/` 与 `/{id}`，后者 `/{id}/analysis`）。往其中一个加路由前先看另一个，否则可能启动时 ambiguous mapping 失败。
- `PoemService.list`（`:57-77`）的 region 过滤有非直观语义：命中「景点在该区域的诗」**或**「无景点且诗人出生地 LIKE 该区域」，两者都空时注入 `id = -1` 强制返回空集。V22 的 seed 数据必须遵循同一规则。
- 工作区已按功能拆分提交；后续排查请以当前 `git status` 和提交内容为准，**别拿旧提交的状态推断当前代码**。
- **display-v2 白屏排查顺序**（已实测各成因的区别特征）：
  - **完全纯白、连顶部导航都没有、控制台只有一条 504 `Outdated Optimize Dep` 或红色 `net::ERR_ABORTED`** → Vite 预构建依赖缓存陈旧（`node_modules/.vite/deps` 的 `browserHash` 与页面请求的 `?v=` 不匹配）。这类失败**不会**触发 `main.js` 里的 DEV 红条（红条依赖 Vue 已挂载），所以看起来"什么报错都没有"。解法：停掉 dev server → `rm -rf node_modules/.vite` → 重启。改 `vite.config.js`、切分支、装卸依赖后高发。
  - **顶部导航在、下面整块空白** → 路由组件动态 import 失败（dev 下是 `Failed to fetch dynamically imported module`，生产下是 `assets/MapView-*.js` 404，通常因为 `index.html` 与 assets 不同批次部署）。
  - **一行英文 `Blocked request. This host is not allowed`** → Vite host 校验，往 `server.allowedHosts` 加域名。
  - **页面结构在、只是没数据/图** → 后端或 OSS 问题，不是白屏。后端全挂时首页仍能渲染（文案与配图是前端内置的），只有 console 里几条 `[API] 网络连接失败`。
  - 反例澄清：`file://` 直接双击 `dist/index.html` 必然纯白（构建产物用绝对路径 `/assets/...`，且 module 脚本受 CORS 限制），这不是 bug。
