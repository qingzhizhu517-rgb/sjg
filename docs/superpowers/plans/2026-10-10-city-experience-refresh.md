# City Experience Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 用新济南主画与可点击的一主三辅体验区替换用户圈出的旧图和重复圆形缩略图，并发布展示站。

**Architecture:** RegionSpots 保留原景观请求、审核过滤与预览逻辑。独立 CityExperiences 组件负责响应式布局，纯配置函数构造当前城市的体验与目的地；只为济南添加五张生成图。

**Tech Stack:** Vue 3、Vue Router、CSS Grid、Node test runner、内置 imagegen、WebP、Sites。

---

### Task 1: 配图（主代理负责）
- [x] 使用五次内置 imagegen 独立生成：`jinan-portrait-v1`（2:3，暖纸水墨湖岸）、`jinan-springs-v1`（3:2，泉水柳岸）、`jinan-scholars-v1`（方形，书案卷轴）、`jinan-poetry-v1`（方形，荷叶书页）、`jinan-oldtown-v1`（方形，泉城街巷）。后面三个保留透明背景。
- [x] 逐张检查主体、无意外文字、边缘和风格；生成文件复制到 `.local/generated/city-experiences/`，最终版本化 WebP 保存 `display-v2/public/media/inkwash/city-experiences/`。
- [x] 用 sips/ffmpeg 只缩放和编码，主画宽度 >=1024、体验横幅 >=1024、小景 >=512；五张网页资源合计 <1MB，记录 SHA256、尺寸、提示词、生成方式与用途到同目录 `manifest.json` 和 README。

### Task 2: 页面与导航（实现代理负责）
**Files:** `display-v2/src/views/RegionSpots.vue`、`src/components/CityExperiences.vue`、`src/config/cityExperiences.js`、名士列表的必要 region 筛选；`tests/cityExperiences.test.js`。
- [x] 先写目的地测试：济南新资产各不相同、诗词保留 `region=济南`、名士与文化导航使用已存在且确实过滤本城的页面；其他城市不复用济南图；预览 query 保留。运行 `node --test tests/cityExperiences.test.js` 确认缺失行为失败。
- [x] 导出 `cityExperiences(region, cityImage)` 生成一主三辅配置。明确名称、介绍、asset 与 router target。实现 CityExperiences，用 props 传入条目；一张左侧主画、右侧三行不同小景/图标，移动端单列。使用 RouterLink 与 `atlasLink` 保留预览。
- [x] 济南侧栏 `cityImage` 切换新 portrait，并通过独立图注说明“AI生成 · 济南山水意象”；不把署名写入图。为本页景观标题加 city-spots 锚点，主卡以原生 anchor 定位（不改全局 routeScroll），明确主体验在无景观数据时的引导文案。
- [x] EmptyState 添加城市页专属 class，用 scoped deep 选择器将上下 padding 收至24px、装饰适度缩小。旧四列圆形体验样式删除。focus-visible 明确；hover 仅 transform/opacity；reduced-motion 停用。
- [x] 运行 `npm run test:unit` 与 `npm run build`，修复行为回归；提交只纳入自己负责的代码与测试。

### Task 3: 验证与发布（主代理负责）
- [x] 规格审查与代码质量审查分别执行；在现有工作区预览检查济南、泰安、空态、错误态、真实链接、1440/390px和键盘焦点，保留验证截图。无已登录线上浏览器时通过受支持的站点专属 HTTP 访问验证最新HTML与资源。
- [ ] 合入 master，main 与 auto/improve 分支保持可快进。推送前 `git diff --check`、测试和构建必须通过。
- [ ] Sites 原项目 `appgprj_6aca26e375b081919acfa874a379028d` 用 source helper 先打开、再同步已提交的源码，保留 manifest、生产公开环境变量与访问范围。官方构建打包后以精确源码 SHA 发布 owner-private。
- [ ] 核对最终部署 succeeded 与线上新图片；写入 deployment-state、deployment-railway，记录主站更新而其他服务代码基线不变。清理临时预览进程，交付网站链接、图片与提示词清单。
