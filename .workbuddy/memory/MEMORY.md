# SJG 项目长期记忆（精编 · 2026-10-10）

> 详版全文已归档 → `.workbuddy/memory/ARCHIVE-2026-10-09-full.md`（OSS 排障全过程、生图逐条配方、沙盘/大屏细节、promo-film 六步、Windows 机陷阱）。本文件只留跨会话必记的结论与陷阱。

## 仓库 / 分支
`origin` = github.com/qingzhizhu517-rgb/sjg.git。远程只有 `master`(默认) / `auto/improve-20260814` / `feat-datav-overhaul` / `cloudflare/workers-autoconfig`，**没有 `main`**。四子项目各自独立 npm，非 monorepo；根 `package.json` 只串 `npm run verify:all`。

## 媒体存储（2026-10-09 实测）
历史数据走阿里云 OSS 外链；新增视觉资产打包进 `display-v2/public/`（本地）。
- OSS bucket `shandong-lit-landscape`（cn-beijing）。唯一上传口 `POST /api/admin/upload` 会 **UUID 改名** → 无法补传库内已引用对象，批量须用 `ossutil` / `oss2` / 匿名 PUT 脚本。
- `mediaBase.js`：**dev 恒走本地 `public/`**，prod 才拼 `VITE_OSS_BUCKET_URL`。`useImage.js` 白名单同时 glob `public/`，都不中给 SVG 印章占位。
- ⚠️ **两套并行对象命名空间**：历史 `spots/泰山-实景-01.webp`（无前缀）vs 新素材 `images/spots/x.webp`（带 `images/`）。别混。
- ⚠️ 凭证**永不贴进对话**，写 `~/.zshrc`。AK 报 `does not belong to you` = 属别的阿里云账号，不是被禁用。
- ✅ 匿名 PUT 已传完 125 个 / 92.1MB（`scripts/placeholder-assets/upload_http.py`）。待办：清 `images/_anon_probe.txt`、桶权限收回「公共读」。

## 素材缺口与生图
- 修复排序：① 景点主图 404 → **破图**（★★★★★）→ ② 字段全空 → 印章占位（★★★★）→ ③ 次要图 404（★★）。
- 配方已固化：`scripts/placeholder-assets/prompt_templates.py` + `docs/design/2026-10-09-asset-prompt-spec.md`。要点：图生图 + `input_fidelity: medium` + 题款逐字写死；**题款取本人诗作原句，绝不杜撰**；规格 诗人 1086×1448 / 景点 1536×1024 / 文化 1024²；服饰按朝代。
- ⚠️ 生图**必须串行**（并行撞秒级文件名）；裁切用 `scale=W:H:force_original_aspect_ratio=increase,crop=W:H`。
- 进度：V31→V34 已落地，剩清代 39 位 + 文化 57 条。
- ⚠️ 死代码 `homepage/CityHero.vue` + `utils/cityHeroMedia.js` 全仓无调用点 → 别再为它生图。

## 3D 沙盘 / 数据大屏
详见归档。必记：沙盘地形是非索引顶点 → 必须用解析法线 `terrainNormalAt`，绕序写反会「只见深色底板且无报错」，贴地用 `terrainGroundY`；逻辑一律抽纯 `.js` 再 `node:test`。大屏卡片必须显式 `flex: N 1 0`；地图 `size` 相对容器**短边** → 用 `min(boxW, boxH*GEO_ASPECT)`，`aspectScale=0.805`；**改配色只改 `styles/global.css` 的 `:root` token**。

## 本机环境（macOS）
- PATH 被 shim 污染 → 一律绝对路径（`/usr/bin/head`、`/usr/sbin/lsof`、`/usr/bin/nc`…）；⚠️ BSD grep **不支持 `\b` 词边界**（会静默零匹配、把「全部文件」误判成死代码），做引用排查要用 Grep 工具或去掉 `\b`。
- ⚠️ WorkBuddy 注入 `SERVER__PORT/HOST` 会被 Spring 吃成 `server.port` → 启后端前 **`unset SERVER__PORT SERVER__HOST`** + 显式 `--server.port=8080`。
- 有效库 **`sjg01`**（`sjg` 是近乎空的旧库）；导出必须加 `--default-character-set=utf8mb4`。**无 Flyway**，迁移靠 `scripts/apply_migration.py`（需系统 `/usr/bin/python3` 的 pymysql），已到 **V34**。
- 访问 OSS 必须 `--noproxy '*'`（走代理 TLS 失败返 000）。
- 视觉类改动**必须实测截图**（`~/.local/bin/ego-browser`；本机无 playwright 包）。

## 后端 AI / 内容治理
- 必需环境变量：`LLM_API_KEY`、`JWT_SECRET`(≥32B)、`SPRING_DATASOURCE_PASSWORD`。管理端默认 `admin` / `123456`。
- ⚠️ `LlmClient` 必须显式发 `thinking:{type:disabled}`，**去掉会让赏析/AI 创作全线失败**；`max-tokens` 默认 3072（赏析 JSON 实测约 1800，1024 必截断）。
- 实体发布前须 ≥1 条来源关联，否则 409；**例外：AI 赏析生成即 `published`** → RAG 检索**必须过滤 published**。

## 验证习惯
`mvn test` 全绿 ≠ 能启动（装配错误只在 `spring-boot:run` 暴露），改 service 构造器后必须真起一次。纯逻辑测试抓不到渲染层错误（绕序、悬空、右栏塌陷都是截图才发现的）。
