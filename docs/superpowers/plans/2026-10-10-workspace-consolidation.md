# Workspace consolidation implementation plan

> **For agentic workers:** Use superpowers:executing-plans to execute this plan inline. The user has requested cleanup and a current master; keep original user changes recoverable and verify before merging.

**Goal:** 把 auto/improve-20260814 的最新工作区与已完成部署适配整理成提交，同步 master，并清理已确认冗余。

**Architecture:** 保留四个应用、宣传片源码、运行时素材、原始交付资料与数据库备份。AGENTS.md 是共享指导来源，CLAUDE.md 仅引用它。主项目默认检出 master，专题分支保留历史提交。

**Tech Stack:** Git、Vue/Vite、React/TypeScript、Spring Boot/Maven、Node 内置测试、Python。

## Task 1: Establish recovery and baseline

- [x] 在项目外备份主工作区和部署工作区的已修改/未跟踪文件、二进制 diff、基线 SHA 与审计报告。
- [x] 用 rg 复核审计列出的组件引用；只被自身测试调用的 cityHeroMedia 连同测试一起清理。
- [x] 运行 `JAVA_HOME=/opt/homebrew/opt/openjdk@21 npm run verify:all`，记录前端两项 window 模拟失败。
- [x] 运行 `mvn -B -ntp -f backend/pom.xml -Dtest=PoemAnalysisServiceTest test`，确认两项旧审核策略断言失败。
- [x] 用户明确选择 AI 赏析生成后自动发布；合并前只读审查已完成。

## Task 2: Reconcile latest behavior and cleanup

- [x] 修正测试的 window 事件边界；保留真实浏览器代码与事件生命周期。
- [x] 为九城预览详情先加失败用例，再补齐显式本地样本与统一查找；绝不把样本当成 API 降级。
- [x] 更新首次生成、重新生成与旧待审记录的自动发布测试及治理文档。
- [x] 清理 PoemAnalysisEnhanced、RiverCityRail、CityHero、ShowcasePoetCard、FeaturedSpotCard、FeaturedPoemCard、CityQuickCard、cityHeroMedia 和配套测试。
- [x] 将 AGENTS.md 作为指导单一来源；CLAUDE.md 保留入口，引用 AGENTS.md。
- [x] 把孤立 .venv、确认重复的压缩包与系统垃圾移至恢复归档；保留 output、db-export、宣传片中间产物与其他交付材料。
- [x] 检查新文件凭据；脱敏文档中的口令与账号标识。本地配置和生成物保持忽略。
- [x] 纳入宣传片源码/配音母版、生成器、学习任务录入脚本、当前素材与 V31–V34；评测 CLI 与文化 seed 生成器均有现用引用，保留。

## Task 3: Validate and integrate

- [x] 保存本轮 Railway/Sites 部署适配到 codex 命名分支，保留旧线上版本记录。
- [x] 在主项目合入 API 地址、Dockerfile、端口配置和 Spring 上下文回归测试；保留新版页面与后端 LLM 配置。
- [x] 执行 `JAVA_HOME=/opt/homebrew/opt/openjdk@21 npm run verify:all`，全部通过后提交应用、清理与部署改动。
- [x] 检查当前宣传片 JS/Python 语法；历史 original-repair 的 timeline 测试发现旧生成时间轴已被覆盖，按用户选择保留本地，不纳入主干；不调用生成 API 或写数据库。
- [x] 复核最终 diff 与暂存文件；记录测试、归档位置与未进行的云端新版发布。
- [x] 刷新远端，快进 master；普通 push 同步 auto/improve-20260814 与 master，禁止强推。
- [x] 比较本地/远端 SHA 与最终 git status，主目录检出 master；原有 worktree 与专题分支保留。
