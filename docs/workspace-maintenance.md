# 工作区整理记录（2026-10-10）

## 基线与恢复

最新应用修改位于主目录 `auto/improve-20260814` 的未提交工作区，原基线 `d46cf7c`。之前线上部署基于另一个工作树的 `c01773f`，两者不可混作同一版本。

整理前已在项目外保存二进制 patch、已修改与未跟踪文件快照、基线 SHA、原清理审计。恢复归档：`/Users/a1/develop/vibecoding/sjg-workspace-archive/20261010-205816`。这些本地恢复材料不提交 Git，勿上传数据库配置或其他凭据。

## 已清理与保留

- 复核代码引用后移除 8 个死代码文件：PoemAnalysisEnhanced、RiverCityRail、CityHero、ShowcasePoetCard、FeaturedSpotCard、FeaturedPoemCard、CityQuickCard、cityHeroMedia；一并移除仅测试 cityHeroMedia 的测试。
- 孤立 `.venv`、与解压内容逐文件校验一致的 `else/sc-datav-main.zip` 和 `.DS_Store` 已移入上述恢复归档；空的 `promo-film/assets` 移除。
- 四个应用、运行时媒体、素材生成器、V31–V34、学习任务脚本、当前宣传片/v2 源码及配音母版纳入版本管理。
- `.workbuddy` 记忆、历史设计记录、评测 CLI、评测批处理和文化 seed 生成器均保留；这些脚本有测试或文档引用。
- `output`、`db-export`、外部采集资料、宣传片成片与渲染中间产物保留本地。历史 `promo-film/original-repair` 按用户选择保留本地，不纳入主干；其旧时间轴测试目前依赖已被覆盖的生成缓存，未重渲染旧交付稿。
- `.codex`、`.venv`、`.local`、生产环境配置和历史修复工程显式忽略，防止误提交本地配置与产物。
- `AGENTS.md` 是唯一完整项目指导；`CLAUDE.md` 引用它。新计划文档中的数据库口令示例改为环境变量，旧 Access Key 标识已脱敏。

## 合并前修正

- AI 赏析自动发布保留用户确认的新规则；首次有效生成、已发布记录重生成、历史待审记录重生成均有测试。其他实体与学习任务继续人工审核，fallback 不落库。
- 前端测试注入 window 事件边界，覆盖真实 SFC setup，避免测试环境缺少 window 的误失败。
- 九城景点的预览 ID 与生产 ID 不一致导致空详情页，已补齐显式预览样本与统一查找，并验证九张卡片在真实页面逻辑中不调用生产 API。
- 已完成的 Railway/Sites 端口、CORS/API 地址、Docker 构建及 Spring 容器回归测试纳入主干。旧部署适配另保存在 `codex/railway-deployment` 的 `7e5b0fd` 提交中。

## 维护方式

主目录完成整理后默认检出 `master`。新工作使用专题分支；开始前读取当前 Git 状态，提交前同时检查修改文件与未跟踪的新源码、素材和迁移。运行 `JAVA_HOME=/opt/homebrew/opt/openjdk@21 npm run verify:all` 并核验暂存差异，检查通过后合入并普通 push 更新 master；禁止用强推或清空工作区替代合并。

Sites 使用独立源码库，Railway 由本地上传部署，当前主干更新不会自动发布新版。线上版本与资源 ID 以 `docs/deployment-state.json` 为准。

## 验证记录

`npm run verify:all` 全部通过：展示端 153 项测试、后端 139 项测试、仓库级 AI/学习/后台/迁移/台账/CI 契约检查均通过，三个前端构建成功；当前宣传片和素材脚本共 42 个 JS/Python 文件语法检查通过。暂存差异的空白检查通过。日志保存在本地 `/tmp/sjg-cleanup-final.log`，不提交构建产物。

应用与素材、工作区清理、部署适配分别提交；最终主干版本以 `git log master` 为准。
