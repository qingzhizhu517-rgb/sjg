# 项目长期记忆 · SJG（齐鲁文化数字人文平台）

分支：`feat-3d-sandbox-realism`（3D 沙盘）、`feat-datav-overhaul`（数据大屏）、`master`。

## 一、媒体存储架构（2026-10-09 实测）

**结论：混合存储 = 历史数据走阿里云 OSS 外链 + 新增视觉资产打包进前端 `public/`（本地）。**

- 后端 OSS 配置 `backend/src/main/resources/application.yml:28-32`：
  `endpoint=oss-cn-beijing.aliyuncs.com`、`bucket=shandong-lit-landscape`、AK/SK 读 `OSS_ACCESS_KEY_ID/SECRET` 环境变量。
  公网前缀 `https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/`。SDK：`aliyun-sdk-oss:3.17.4`（pom.xml:60）。
- 上传入口只有一个、**单文件**：`POST /api/admin/upload`（`directory` 默认 `images`）→ `OssService.upload()`
  （`OssService.java:66-108`）。白名单 content-type + 扩展名（图/视频/音频/xlsx/xls）；写 `x-oss-object-acl: public-read`。
  ⚠️ objectName = `directory + "/" + UUID + ext` → **UUID 重命名，丢失原文件名**，因此它**不能**用来补传
  库里已引用的 `spots/原名_实景_01.jpg` 之类对象（必须用 ossutil / oss2 脚本）。
- 前端拆分逻辑 `display-v2/src/utils/mediaBase.js`：**dev 恒用本地 `public/`（返回 `''`），prod 才拼 `VITE_OSS_BUCKET_URL`**。
  `display-v2/.env` 里有该变量。`useImage.js`：`http(s)://` 直通、`/` 开头查构建期 `import.meta.glob` 白名单，都不中给 SVG 印章占位。
  音频/视频**不做改写**（`PoemDetail.vue` 直接绑 `poem.videoUrl`）。
- **DB 现状（`db-export/sjg01_20260929_210011/sjg01_full.sql` 实计数）**：
  OSS 引用 **313 处 / 209 个唯一对象**（spots 160、poets 26、video 20、events 3）；
  本地 `/images/...` 引用 **23 处 / 23 个唯一路径**（spots 10、poets 8、cultural 5）。
  实测存活：OSS 侧 **162 存在 / 47 缺失**（集中在 `spots/`，含大量 `_anime.jpg`）；
  本地 23 条**磁盘全在、OSS 侧 23/23 全 404**（从未上传）。
- `poem.audio_url` 203/203 全空、`cultural_item.image_url` 63/63 全空；**OSS 内没有 `audio/` 目录**。
- 本地打包资产 `display-v2/public/` 共 131MB：`images/` 87MB、`media/` 35MB（另有 2 个本地 mp4：`media/real/hero-map.mp4`、`media/inkwash/hero-open.mp4`）。
  `admin-frontend/public`、`sjg-datav/public` 无媒体目录。
- **批量导入**：无媒体批量上传功能。存在的 4 个 Excel 导入接口（`/admin/{spots,poets,poems,events}/import`，
  POI 解析 6 列纯文本）**不含媒体列**。批量传 OSS 只能用 ossutil / OSS 控制台目录上传 / `oss2` 脚本
  （本机 `oss2 2.19.1` 已装；`ossutil` 未装）。单文件上限由 `spring.servlet.multipart.max-file-size=200MB` 决定。
- 待办 **P2-M9**（`docs/plans/2026-08-05-display-v2-ui-optimization-tasks.md:58`）：全部终稿素材上传 OSS + 路径切换验证，未完成。
  素材缺口盘点见 `docs/anime-asset-inventory.md`（`output/media-gaps.md` 只存在于旧 Windows 机，本机无）。

### 1.1 印章占位补图管线（2026-10-09 建立）

**缺口实查（`sjg01`，判据 = NULL/''/'[]'）**：poet 头像两字段全空 **102/129**、cultural_item 配图 **58/63**、
scenic_spot 2/71、poem 视频 168/203、音频 203/203。
计划与全量对照表：`docs/plans/2026-10-09-placeholder-asset-generation-plan.md`（附录 A/B 共 160 条）。
命名映射：`output/2026-10-09-placeholder-fill/{poet,cultural}-plan.json`。

- 复用脚本在 `scripts/placeholder-assets/`：
  `process.py`（裁底部 8% 水印 → **cover 缩放居中裁切** → `cwebp -q 82`）、
  `upload_oss.py`（按**原路径**批量上传 + `public-read` + HEAD 回执）、
  `gen_migration.py`（由计划 JSON 生成回填 SQL）。
- ⚠️ 缩放必须用 `scale=W:H:force_original_aspect_ratio=increase,crop=W:H`。用 `scale=W:-2` 会在
  正方形目标上失败（源裁水印后高度不足 → `Invalid too big size`）。
- 命名：诗人 `images/poets/{pinyin_snake}_anime.webp`（1086×1448）；文化 `images/cultural/{slug}.webp`（1024² 或 1536×1024，**不带 `_anime`**，
  但 `buildLocalImageCandidates()` 在水墨主题下会自动追加 `_anime` 候选，两种命名都能命中）。
- 诗人画像风格基线参照 `public/images/poets/pu_songling_anime.webp`：半身、灰袍、右侧竖排题名＋朱印、淡墨点染；
  文化配图参照 `public/images/cultural/bengrou_rice.webp`：**暖调纪实摄影**（非水墨）。
- ⛔ **OSS 双故障（2026-10-09 实测，先①后②否则白忙）**：
  ① **桶级「阻止公共访问」已生效** → 匿名读一律 `403 AccessDenied because of bucket acl`（EC `0003-00000001`），
     桶根返 `0003-00000002`。**今早 10:50 还是 200，12:11 已全 403**（阿里云对存量公共读桶默认开启）。
     ⚠️ 开启后**不存在的对象也返 403**（不再是 404）→ **「逐条 HEAD 探存活」的审计方法全体失效**，须等关闭后再用。
     控制台「读写权限=公共读」与「访问=文件不可以被公共访问」并列时，**后者才实际生效**。
     → 修复：OSS 控制台 → Bucket → 「权限管理」→「阻止公共访问」→ **关闭**。
  ② **AK 被禁用** → `403 InvalidAccessKeyId / disabled`（EC `0002-00000903`）。
     → 修复：RAM 控制台 →「身份管理 → 用户」→ 启用该 AK；找不到就新建用户 + 授权。
  · 密钥建议写 `~/.zshrc`（与 `JWT_SECRET`/`LLM_API_KEY` 同法），**不要贴在对话里**。
  · 备选：OSS 控制台「上传文件夹」直接拖 `public/images/{poets,spots,cultural}/`，
    **前缀必须保持 `images/...`**（对象键与本地相对路径同构）；仍需先关闭阻止公共访问。
  · 排查文档 `docs/oss-access-troubleshooting.md`；dev 无影响，**prod 会全站图片 403**。
  · 另注：桶「版本控制」已开通 → 覆写会留历史版本并持续计费。
  · ⚠️ **新素材对象键带 `images/` 前缀**（`images/spots/x.webp`），与历史 OSS 对象
    （`spots/泰山-实景-01.webp`，**无** `images/` 前缀）是**两套并行命名空间**，别混。
  · 待传清单：`output/2026-10-09-placeholder-fill/upload-manifest-all.json`（125 个 / 92.1MB：
    poets 64 · spots 41 · cultural 11 · sights 9）。
  · ✅ **2026-10-09 12:32 复测：故障 ① 已解决**（匿名读存在对象 200 / 不存在对象 404），
    审计方法恢复可用；此前判缺的 45 个对象复核后**仍缺 45 个**。
  · ✅ **2026-10-09 12:38 素材上传完成**：用户把桶放开为「公共读写」→ 用**匿名 PUT** 上传成功
    （**不需要 AK**！实测匿名 PUT 200 / GET 200 / DELETE 403）。
    `scripts/placeholder-assets/upload_http.py` 可复用；**125/125 成功，92.1MB，101s**，
    独立 HEAD 复核 125/125 = 200。**待办：清理残留 `images/_anon_probe.txt` + 桶权限收回「公共读」。**
  · ⚠️ 用户给的第二个 AK 报 `AccessDenied — The bucket you access does not belong to you.`
    → **该 AK 属于另一个阿里云账号**，不是"禁用"。正确做法是**在能看到该桶的控制台里**建 AK。
  · ⚠️ 凭证安全：**切勿让用户把 AccessKey Secret / 控制台登录密码贴进对话**（会留在记录里）。
- ⚠️ **生图必须串行**：并行会撞秒级文件名且 `output_dir` 不可靠。
- B0 样张已落地：`images/poets/wang_zhi_huan_anime.webp`、`images/cultural/wei_fang_feng_zheng_zhi_zuo_ji_yi.webp`
  + `V31__placeholder_asset_backfill.sql`（2 条 UPDATE）。

### 1.2 素材缺口严重度分级（2026-10-09 逐条 HEAD 实测，**排序一律按这个来**）

| 形态 | 用户看到 | 数量 | 严重度 |
|---|---|---|---|
| ① **主图 404** | **破图**（裂图空白），最丑 | 景点 **14** | ★★★★★ |
| ② 字段全空 | 印章占位（设计过的降级） | 诗人 101、文化 57、景点 2 | ★★★☆ |
| ③ 次要图 404 | 首屏正常，翻图才遇到 | 景点 23 | ★★ |

- 分级脚本思路：媒体字段 → `parseFirstUrl` 取首值 → `imageAnimeUrl` 优先、`imageUrl` 兜底 → HEAD 实测。
  结果存 `output/2026-10-09-placeholder-fill/gap-severity.json`。
- **景点图统一 1536×1024 青绿山水写意**，风格基线 = `public/images/spots/baotu_spring_anime.webp`；
  文化配图 = 暖调纪实摄影（基线 `public/images/cultural/bengrou_rice.webp`）；
  诗人画像 = 水墨半身带竖排题名＋朱印（基线 `pu_songling_anime.webp`）。
- ⚠️ **能 0 积分修的绝不生图**：`nineSights.js` 里 `spotId: 64 东津渡` / `spotId: 71 碣石山` 的九城插画已存在
  （`/media/inkwash/sights/{dongying-dongjin,binzhou-jieshi}.webp`）→ 直接改 DB 指向即可。
  `useImage.js` 的白名单同时 glob `/public/media/**`，所以 `media/` 下的插画**也能被 DB 字段直接引用**。
- 游客已生成但**不建议用**：`poet` 的 `poem` 关联数最多只有 4，排不出「知名度」→ 诗人按**朝代文学史权重**排序（隋唐宋元魏晋优先）。
- 分配方案与理由：`docs/plans/2026-10-09-credit-allocation.md`；
  批次状态与验收记录：`docs/plans/2026-10-09-placeholder-asset-generation-plan.md`。
- 已完成：B0 样张 2 张（V31）、P1 修破图 14+2 张（V32，16/16 解析通过）。
- **诗人画像配方（已验证，后续批次直接复用）**：模板已固化为
  `scripts/placeholder-assets/prompt_templates.py`（`poet_prompt/spot_prompt/cultural_prompt`），
  规范见 `docs/design/2026-10-09-asset-prompt-spec.md`。要点：
  - **v2 最终配方 = 图生图（`image1` = 已验收成品如 `wang_zhi_huan_anime.webp`）
    + `input_fidelity: medium` + 模板 v2 + 题款文字写死**。
  - ⚠️ **图生图会"抄"参考图**：`fidelity: high` 会连人脸一起抄；只写「两列小字题款」会把参考图的
    题款文字原样搬过来（实测把蒲松龄《聊斋志异》题跋抄到了陆机图上）→ 题款必须逐字写死并加禁止条款。
  - 参考图版式真值：题名**紧贴右上角**、笔画块 x∈[0.89,0.97]、**单字高 ≈ 画高 4.5%**（是"题签"不是"标题"）；
    不写约束时模型会把题名放大 ≈3 倍或掉到画面中部（陆机/王冕/刘禹锡实测）。
  - 服饰按朝代分（魏晋幅巾玄缘 / 隋唐幞头圆领袍 / 宋东坡巾襕衫 / 元交领笠帽）；规格 1086×1448。
  - ⚠️ 画面偏亮偏平 → 补「墨色层次丰富，画面丰满不留大片空白」。
- ⚠️ **不要用像素启发式自动判定水墨画的题名栏**：墨色阈值/连通域/局部密度分离三种方法均被
  背景山石树枝干扰（连参考图自己都判不合格）。`verify_layout.py` 已改为**只对画幅比例设门禁**，
  另提供 `strip` 子命令拼并排对比条供目视。
- 已完成：P2 诗人的 31 位（V33，诗人可解析 28→59）；**P3-a 明代 30 位（V34，诗人 59→89）**。
  - **题款必须取本人诗作原句**（从 `poem.content` 首分句截取 ≤7 字），**绝不杜撰**；
    方孝孺「振衣千仞思悠悠」、戴璟「千年礼乐归东鲁」等。
  - **#104 佚名 不生成肖像**（非具体人物）；#44 康熙/#47 乾隆 属清代，走**帝王配方**；
    #20 浣花 按女性词人处理（身份存疑）。
  - ⚠️ 图生图 + `medium` 使风格高度统一，但**面孔相似度偏高**（锚定图影响）；
    要更强个体差异可降 `input_fidelity` 到 low 或改纯文生图。
- 剩余：清代 39 位 + 文化条目 57 条。
- 联络表验收法：`ffmpeg ... xstack` 拼 4 列网格成一张图，**一次 Read 替代逐张看**，
  输出 `output/2026-10-09-placeholder-fill/contact-sheet-spots.png`。
- ⚠️ **死代码（勿再投入）**：`display-v2/src/components/homepage/CityHero.vue` 与
  `src/utils/cityHeroMedia.js` 的 `resolveCityHeroMedia()` **全仓无任何调用点/import**
  （连文件自己的注释都写着「`media/real/cities/` 目录当前不存在，故恒走插画分支」）。
  → **P2-M5「九城实景 hero 9 张」生成出来视觉收益为 0**，须先接线（代码任务）再补图，已暂缓。
  `CITY_SLUGS`（`config/cityIllustrations.js`）目前只作数据存在。

## 二、3D 沙盘（display-v2）

`composables/useThreeSandbox.js`（引擎）· `utils/sandboxTerrain.js`（纯函数：投影/高度场/分层设色/解析法线/多边形裁切）·
`utils/sandboxBuildings.js`（PRNG + 按城市等级生成建筑）· `tests/sandbox{Terrain,Buildings}.test.js`（34 用例）。

1. `projectGeo` 原点 lon 117.0 / lat 36.4，`LON_SCALE=3.06` / `LAT_SCALE=3.8`，1 单位 ≈ 29km。
   垂直夸张 30–40×（泰山 1532m → 2.2 单位），**坡度必然远陡于现实**，坡上放物先用 `terrainNormalAt` 判坡度。
2. 地形网格是**非索引顶点**，`computeVertexNormals()` 退化成面法线 → 必须用解析法线 `terrainNormalAt`。
3. 绕序固定 `a→c→b / a→d→c`（法线朝 +Y）。写反 → 整片地形被背面剔除，**只看到深色底板且控制台无报错**。已加回归测试。
4. 贴地物体用 `terrainGroundY(x,z,r)`（取中心 + 8 点环最小值），不用 `getTerrainHeight`：0.2 采样网格上山峰解析高程高 0.15+ → 悬空。已加回归测试。
5. 噪声频率上限 ≈ 3.3（波长 ≥ 0.4 单位），否则 0.2 网格走样。
6. 地形构建 ~100ms（法线按格点缓存后；原先每点算 6 次是 405ms）。
7. 山体用「窄主峰 + 宽山裙」两级剖面：单一宽山体会退化成圆锥/针尖，半径过大又把泰安市区抬到半山腰。
8. 拾取收窄为 9 个不渲染的代理圆柱体，射线只测这 9 个；建筑群单个 InstancedMesh（1004 实例，1 draw call），法线 y < 0.5 不建。
9. 沙盘逻辑**一律抽成 `src/utils/` 纯 `.js` 再写 `node:test`**（`.vue` SFC 与 three.js 场景在测试环境跑不了）。

黄河实测走向（19 点）在 `sandboxTerrain.js` 的 `YELLOW_RIVER_GEO`，**大屏画真实河道直接复用**。

## 三、数据大屏（sjg-datav）

- 1920×1080 设计稿，`AutoFit` + `useAutoFit` 走 contain 居中缩放（已实测正确，别动）。
- 顶栏 92 / 三栏 `340 + 1fr + 340` / 底部通栏时间轴 148；左右各三张等高卡。
- **卡片必须显式写 `flex: N 1 0`**：父级是 `height:100%` 的 column flex，不写就被 flex-shrink 压扁（右栏曾把 8 行裁成 5 行）。
- **组件不要写死自身尺寸**（`SentimentCloud` 的 400×300 曾溢出 324px 卡）。
- **地图（最容易踩）**：`echarts/.../geoCreator.js` 里 `size = parsePercent(layoutSize, min(容器宽, 容器高))`，
  百分比相对**短边**、size 是**长边** → `'96%'` 在宽扁容器只吃短边（地图曾只占中央栏四成宽）。
  正确：`fitted = min(boxW, boxH * GEO_ASPECT)`，`GEO_ASPECT` 由 GeoJSON 经纬跨度 × `aspectScale` 现算；
  `aspectScale` 用 **0.805**（cos 36.4° 地理修正），ECharts 默认 0.75。
- 数据源优先用曾零消费的 `/api/public/events`、`/dynasties`、`/poet-relations`；
  **刻意不用 `/timeline`**（每朝代 4 次查询且返回全量不分页）。
- **poets 表没有 region**：城市维度只能走「诗 → `poem.spotId` → `spot.region`」。
- `cultural_item` **有 `region`（NULL = 全域性）但没有朝代字段** → 五脉文华只按城市下钻、不随朝代变，卡片要写明口径
  （「<城市> · 不含朝代」）。
- **九城顺序权威来源是 `/api/public/spots/regions`**（后端上游→下游返回，已修掉原本 9 次 COUNT 的 N+1，改单列 select + 内存分组）；
  前端 `FALLBACK_REGION_ORDER` 仅兜底；加城市只改后端。
- 筛选支持 `?region=济南&dynasty=4` 深链预置。五脉下钻 SWR key = `cultural-categories:<region|all>`。
- 主题 token 在 `src/styles/global.css` 的 `:root`；ECharts 读不到 CSS 变量，由 `src/theme/chartTheme.ts` 模块加载时读取并回落默认值。
  **改配色只改 CSS**。ECharts 按需注册集中在 `src/theme/echartsSetup.ts`。
- 字体：标题 `--dv-serif`（Noto Serif SC 子集，354KB，`public/fonts/dv-serif.woff2`），正文 `--dv-sans`。
  **字重只用 400**（CJK 合成粗体会糊）；子集按「源码 + 后端种子 SQL」抽字，大改文案后重新子集化。
- `Chart.tsx` 只初始化一次、option 变化走 `setOption`、`ResizeObserver` 监听尺寸；
  **父组件仍须 `useMemo` 稳定 option**，否则每次渲染重放动画。
- 三态：`PanelKit.tsx` 的 `SkeletonBlock`/`ErrorState`/`EmptyState` + `useDashboardData().hasData` 区分「加载中」与「真没数据」。
- 死代码（勿再引用）：`pages/DataV/map/*`、`test.tsx`~`test8.tsx`、`components/TimelineChart.tsx`、`pages/DataV/stores/index.ts`、`types/geojson.d.ts`；
  依赖已移除 `three`、`@react-three/fiber`、`@react-three/drei`、`zustand`、`autofit.js`、`gsap`。
  ⚠️ CLAUDE.md 说 `map/` 不存在是**错的**——它曾存在且是死代码，现已删除。

## 四、本机环境限制

### macOS（2026-10-05 实测）
- 常态服务：8080 后端 / 5173 admin / 5175 display-v2 / 5180 datav。**sjg-datav 只能走 `localhost:5180`**（只监听 IPv6 `::1`）。
- ⚠️ **MySQL 在跑时 `lsof -iTCP:3306` 也可能为空**（跨用户看不到）→ 改用 `nc -z -v 127.0.0.1 3306`。
- ⚠️ **沙箱内 `lsof` 看不到任何监听端口**，排查端口必须非沙箱执行。
- ⚠️ `sudo` 被策略禁用；需要 root 只能用 `osascript -e 'do shell script "..." with administrator privileges'`（弹 GUI 密码框，尽量合并成一次）。
- ⚠️ `mysql.server start` 以 root 跑必失败（`run mysqld as root!`），`--user=_mysql` 会被 `mysqld_safe` 静默忽略。
  手动：`sudo -u _mysql nohup /usr/local/mysql/bin/mysqld --datadir=/usr/local/mysql/data --port=3306`。
- ⚠️ **PATH 被 WorkBuddy shim 污染**：`head`/`ps` 常报 `command not found`。**一律用绝对路径**
  （`/usr/bin/head`、`/usr/bin/curl --noproxy '*'`、`/bin/ps`、`/usr/sbin/lsof`、`/bin/ls`、`/usr/bin/nc`、`/usr/bin/grep`）。
  另：zsh 下 `grep --include=*.vue` 会报 `no matches found` → 加引号或用 Grep 工具。
- ⚠️ **WorkBuddy 向 shell 注入 `SERVER__PORT` / `SERVER__HOST`**，被 Spring Boot 宽松绑定吃成 `server.port`（后端跑到 59682）。
  **在 WorkBuddy 内启动后端必须** `unset SERVER__PORT SERVER__HOST` 并显式 `-Dspring-boot.run.arguments="--server.port=8080"`。
- 登录依赖 `JWT_SECRET`（≥32 字节）：为空时 400 报 `key byte array is 0 bits`（「密码正确也登不进」）。已写入 `~/.zshrc`（勿提交）。
- 管理端默认 **`admin` / `123456`**（`schema.sql:110` 注释写的 `admin123` 是错的，bcrypt 实测）。
- `mvn` 在 `/opt/homebrew/bin/mvn`（不在 PATH）；`ffmpeg`/`ffprobe` 只在 `/opt/homebrew/bin`；`say` 在 `/usr/bin/say`。三个前端 `node_modules` 均已装好。

### Windows
- **无法新建 `feat/xxx` 带斜杠分支**（`cannot lock ref`），改用扁平名。
- `git checkout -b` 受限时会**静默切到未出生分支**（退出码 0、无提交），随后 `git status` 全部显示 `A`。
  判别：`git rev-parse HEAD` 报 `Not a valid object name`。恢复：`git symbolic-ref HEAD refs/heads/master`。
- ⚠️ **`git checkout` 可能静默删掉工作区文件**（实测丢过 96 个）。`git restore --source=HEAD --worktree .` 可无损还原。
  **每次切分支后立刻 `git status --short`，见到 `D` 马上 restore。**
- 提交后 git 后台 `geometric-repack` 可能报 `renaming pack ... File exists`，用 `git -c gc.auto=0 -c maintenance.auto=false <cmd>` 规避。
- 8080 未运行时系统代理返回 502；`curl` 用 `localhost` 会命中代理，需 `127.0.0.1` + `--noproxy '*'`；vite 需显式 `--host 127.0.0.1`。
- 出现过 **PATH 被清空**，命令开头显式 `export PATH=...` 可恢复。
- **托管 node 目录版本号会变**（`22.22.2-2` → `-3`），写死路径前先 `ls -d .../node/versions/*/`。

## 五、数据库

- MySQL 客户端在 **`/d/app/mysql/install/bin/mysql.exe`**（不在 PATH）；参数取 `MYSQL_HOST/PORT/USER/PASSWORD`（与后端 `SPRING_DATASOURCE_*` 同库）。
- ⚠️ **macOS 本机 DB 也在跑**（`nc -z 127.0.0.1 3306` 通）：客户端 `/usr/local/mysql/bin/mysql`，
  口令取自 `SPRING_DATASOURCE_PASSWORD`/`DB_PASSWORD`（环境变量已注入），用 `MYSQL_PWD=... mysql -uroot` 直连 `sjg01`。
- ⚠️ **项目未引入 Flyway**，迁移靠 **`scripts/apply_migration.py`** 手动应用（按 `;` 切句）；
  它依赖 `pymysql`——**系统 `/usr/bin/python3` 有，托管 venv 没有**。迁移编号已到 **V31**（V31 = 印章占位回填）。
- ⚠️ MySQL 中 `empty` 不能直接作列别名（语法报错），用 `emptyn` 之类。
- ⚠️ **有效库是 `sjg01`**（`sjg` 是近乎空的旧测试库）。`sjg01`：诗 203 / 诗人 129 / 景点 71 / 文化条目 63。
- ⚠️ 实例数别信 `information_schema.TABLE_ROWS`（InnoDB 估算），要用 `COUNT(*)`。
- ⚠️ **导出中文数据必须加 `--default-character-set=utf8mb4`**：Windows 默认输出 GBK，不加会得到乱码 TSV——
  连 URL 路径都变乱码，进而让远端请求全 404，极易误判成「素材缺失」。判据：读出含 `\uFFFD` 就是编码错了。
- 媒体字段两种形态：**OSS 外链存成 JSON 数组字符串**、**本地资产存 `/images/...`**。`[]` 等同缺失，必须解析后判断。
- 数据质量：素材命名混用下划线与连字符（`X_实景_01.jpg` vs `X-实景-02.jpg`）；个别文件名含乱码残留（`郓州谿xi堂_anime.jpg`）；
  有的 OSS 名字重复扩展名（`东津渡_实景_01.jpeg`、`鄄城-实景-08.jpg.png`）；景点 #70 青岛·崂山三个媒体字段全为 `[]`。
- ⚠️ **访问阿里云 OSS 必须绕过本机代理**（`--noproxy '*'`）：走系统代理 TLS 握手失败（返 `000`），直连正常（`200`）。
  本机 DNS 时而 fake-ip 时而真实 IP，**先探测再下结论**。
- OSS 桶不允许公共列举（`?list-type=2` 返 AccessDenied），无法反查已有对象清单 → 只能逐条 HEAD。
- 本机已装 `oss2 2.19.1`（Python）；`ossutil` 未装。

## 六、后端构建（本机）

`mvn` 不在 PATH、`mvnw` 不存在；用 IDEA 内置 Maven 的 `mvn.cmd`（bash 的 `mvn` 脚本在 Git Bash 会报 `找不到主类 ...Launcher`）：

```bash
export JAVA_HOME="D:\\app\\jdk\\17"
cd backend && "/d/app/idea/IntelliJ IDEA 2026.1.2/plugins/maven/lib/maven3/bin/mvn.cmd" -o test
```

- **必须用 JDK 17，不要 IDEA 的 JBR**：JBR 是 Java 25，Lombok 注解处理不生效，会在**未改动的文件**里报一堆「找不到符号 getXxx()」。
  可用 JDK：`/d/app/jdk/{11,17,21}`。
- `.m2/repository` 已存在，`-o` 离线即可；`mvn test` = 4 个测试类 21 个用例，不需要 DB。

## 七、视觉类改动必须实测截图

纯逻辑测试抓不到渲染层错误（绕序 bug、悬空 bug、右栏塌陷都是截图才发现的）。
本机浏览器验证用 `~/.local/bin/ego-browser`（用户级技能 `ego-browser`）：`ego-browser nodejs <<'EOF' … EOF`，
`taskSpace(id)` 复用同一空间、`page.evaluate()` 取 DOM 指标、`page.screenshot({path})` 存图。
⚠️ 本机**没有** playwright 包（仅 `~/Library/Caches/ms-playwright/chromium-1228` 缓存内核），
也**没有**旧记忆里的 `webgl-headless-screenshot` / `spa-stub-visual-review` 两个技能（2026-10-05 更正）。

`hanzi-writer`（display-v2「赋诗」书写动画）三个坑：
1. 该包**不含笔画数据**（数据在 `hanzi-writer-data`，解包 32MB），必须自备数据源（按需拉 jsDelivr `hanzi-writer-data@2.0.1`）；
   也**没有** `HanziWriter.getCharacterData()` 静态方法。
2. 缓存**必须放普通 `<script>` 块做模块级共享**——写在 `<script setup>` 里是「每组件实例一份」，一首诗 60+ 字就是 60+ 并发请求，
   会被 CDN 限流并降级成印刷体。还要同字去重 + 并发上限。
3. `showOutline: true`（默认）会先亮出整幅浅灰轮廓（像描红）；创建时笔画初始显示比例是「完整」的，
   只有 `animateCharacter` 跑起来才重置到起点。解法：`showOutline: false` + 轮到书写前用 CSS `opacity:0` 遮挡。
   判据：`.char-container svg` 数量 > 0（数据加载成功）、`.hanzi-fallback` 数量为 0（无降级）。

## 八、AI / LLM 与内容治理（2026-10-05 实测）

- 后端 AI 依赖两个环境变量（均在 `~/.zshrc`）：`LLM_API_KEY`（必需）、`JWT_SECRET`（登录必需）。
  `LLM_BASE_URL` / `LLM_MODEL` 有默认值（`api.deepseek.com` / `deepseek-v4-flash`）。另有 `LLM_THINKING`、`LLM_MAX_TOKENS` 可覆盖。
- **DeepSeek V4 默认开启思考模式**，`reasoning_content` 同样计入 `max_tokens`。
  `LlmClient` 已显式发送 `thinking:{type:disabled}`——**去掉这个字段会让赏析/AI 创作再次全部失败**
  （正文空串、`finish_reason=length`）。
- `llm.max-tokens` 默认 **3072**：赏析结构化 JSON 实测约 **1800 tokens**，1024 必被截断成非法 JSON。调高只是上限、不增加成本。
- AI 未配置时不报错：`LlmClient` 打 WARN、`/chat` 返 `event:error`、赏析 500、创作 502。
- **任何实体发布前必须至少 1 条来源关联**（`ContentReviewService:182-187`），否则 409。
  所以「配好 key 但前台 404」通常不是 AI 问题，而是卡在治理流程。
- **例外：AI 赏析（`poem_analysis`）** 在 `PoemAnalysisService.ensureReviewRecord()` 里生成后直接写 `published`，
  不进人工审核、不要求来源关联（2026-10-05 用户决策）——203 首逐条过审不现实，旧逻辑的实际表现是「生成成功、前台永远 404」。
  ⚠️ 相应地 `KnowledgeRetrievalService` 里赏析证据**必须过滤 published**（曾漏掉，未审核的赏析一直在参与 RAG 检索）。
- 赏析 fallback 产物（含 `raw` 字段）**永不落库**。公开端（含 RAG 检索）只读 `published`。

## 九、display-v2 首页/九城配图

- `/map`「九城胜迹」九张配图是**真实青绿山水插画**，落在 `public/media/inkwash/sights/<slug>.webp`（slug 与 `config/nineSights.js` 一一对应）。
  原画/脚本在 `output/imagegen/nine-sights/`，来源说明 `docs/design/2026-10-05-nine-sights-illustrations.md`。
- ⚠️ `src/components/SightArt.vue` **已删除**（原程序化 SVG 水墨小景，占位感强），勿再引用。
  `tests/nineSights.test.js` 现在校验「素材文件存在 + 目录无孤儿」。
- **不给这类插画加 `mix-blend-mode: multiply`**：本组纸底比卡片底色略暖略深，相乘会形成更明显的暗色矩形。
  首页主画用 multiply 是因为其天空近纯白——**结论不能跨素材套用**。
- 生成器成图是**硬边矩形**（不会真按提示词「四边淡出纸底」）；页面底色 `#F5F2EB` 与纸底同色，导 WebP 时**外侧 6% 羽化为透明**即可无缝（11% 会吃掉贴边笔触）。
- 生图工具**并行调用会撞秒级文件名**且传不同 `output_dir` 无效（全落到最后一个目录），一轮曾净丢 2 张，**批量必须串行**；
  认幸存文件要看画面内容，不能靠时间戳。

## 十、promo-film 宣传片

出片六步：`narration.mjs --force` → `src/plan.js` → `tools/capture.mjs` → `scripts/compose-score.mjs` → `scripts/render.mjs` → `scripts/mix.mjs`。
render 只用已落盘的 `.build/capture/*.png`，**不依赖 dev server**；改画面/文案只需 plan→render→mix。

- ⚠️ **Chrome 必须加 `--no-sandbox --disable-gpu-sandbox`**：受限环境里 Chrome 沙箱起不来 → GPU `exit_code=6`
  → `Target.createTarget` **永久挂起**，而 `/json/version` 仍返 200，极易误判成端口占用。**已固化进 `tools/cdp.mjs` 的 `launchChrome` 默认 args**。
- ⚠️ `render.mjs --clean` 会触发 WorkBuddy 删除保护**报错退出**（`node-safe-delete-shim`）——**不要加 `--clean`**；新帧数 ≥ 旧帧数即全覆盖。
- ⚠️ `mix.mjs` 默认输出 `dist/山河有迹·文脉有声.mp4`（**母版，绝不能覆盖**），必须显式传目标文件名。
- **配乐合成器的致命坑**：`compose-score.mjs` 的 water 层 `cutoff = 0.035 + 0.025·sin(0.37t) + 0.015·sin(1.3t)`
  会**变负**（t≈13.3s 两 LFO 同落波谷）→ 单极点低通翻转成正反馈 → 1 秒内发散到 1e38 → Infinity
  → `0.88/peak` 让整条配乐**静音/削顶**。已钳为 `Math.max(0.004, ...)`。
  **教训：代码合成的音频必须验「分段电平 + 是否削顶」，只听整体响度会被 NaN 归一化骗过。**
- pad 的相位累加器要用 `Float64Array`（Float32 在相位 >131k rad 后步长不足，声部会冻结成直流）。
- 分镜时长 = `max(预算, 该镜旁白实测 + 0.15)`（`fit()`）→ **换配音只需改 `narration.js` 的 text + 重跑 `narration.mjs --force` 与 `plan.js`**，画面自动跟随。
- 段落转场按**镜头 id 对**定义（`film/index.js` 的 `TRANSITIONS`），shader 的 `uWipe` 把画面洇成纸色再吐出，改时长后自动跟随。
