# AI Evidence Reading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or executing-plans to implement task-by-task. Steps use checkbox syntax.

**Goal:** 让用户在独立原文对照工作区选择两篇已发布诗词、获取有行引用的AI比较线索，并保留自己的证据与判断。

**Architecture:** 独立比较服务使用既有LLM、限流、审计和公开资料；Vue读取两篇详情并通过SSE接收可信材料与解读，原文/来源/笔记始终可读。入口沿用atlasLink与safeReturnPath，预览样本零网络。

**Tech Stack:** Java17/SpringBoot、Vue3、现有Node/JUnit测试、SSE、内置image_gen、WebP、Sites/Railway。

## Task 1：后端比较与配置状态（后端实现代理）

Files: 新增 dto/PoemComparisonRequest.java、service/PoemComparisonService.java、controller/pub/PublicPoemComparisonController.java、PublicAiStatusController.java；对应controller/service测试。除必要审计复用外不修改现有聊天服务。

- [ ] 先写拒绝非法/重复/未发布ID、完整双原文、同一来源可比较、status不暴露配置的失败测试。
- [ ] 实现严格请求白名单、published检查、完整材料与行号、可信来源、compare/feedback两种提示，复用LLM/RateLimitService/AiAuditService及ClientIpResolver。
- [ ] 实现规范SSE evidence/delta/error/done、配置/限流错误、审计完成；比较结果不落业务内容表。
- [ ] 跑定向测试与mvn test；使用真实Spring容器验证新增类构造注入；自审并提交自己文件。

契约测试示例：
```java
assertEquals(List.of("A","B"), materials.stream().map(Material::label).toList());
verify(llm, never()).streamChat(anyList(), any(), any()); // 任一材料未发布
```

接口固定为spec中的poemIds/focus/mode/answer，前端不得改成客户端原文请求。

## Task 2：视觉素材（主代理）

- [ ] 独立生成横向UI效果图与无字山水书卷横幅；保存原PNG到忽略的output、运行时WebP到public/media/inkwash/reading。
- [ ] 检查可读性、无模型/服务已可用的误导、横幅无文字；cwebp压缩，记录manifest和提示词。

## Task 3：独立阅读工作区（前端实现代理）

Files: 新增 views/ReadingWorkspace.vue、components/reading/ReadingMaterial.vue、ReadingInsights.vue；utils/readingState.js、readingStream.js、readingExport.js及 tests/reading*.test.js。原有全局入口文件由主代理维护，不抢文件。

- [ ] 先写URL/行号/导出/SSE中断/请求取消/样本零网络的行为失败测试；参考现有componentSetup helper。
- [ ] 实现分页选材与两篇详情读取，请求版本号保护；规范行号与服务端一致，来源去重仍保留归属。
- [ ] 实现三种可读身份：原文、来源、AI解读；四方向切换、compare/feedback主动生成、停止/重试、有效引用定位，所有Markdown消毒。
- [ ] 实现按材料对保存草稿/证据清单与Markdown导出；存储拒绝和损坏可见处理；切换材料取消生成并恢复对应笔记。
- [ ] 预览仅使用已有atlasPreview诗词和明确标注的静态导读，禁用模型请求；正式空态提供用户主动样本入口，不静默回填。
- [ ] 桌面双列原文与解读区域、手机纵向，焦点可见/减少动画/按钮44px；顶部用生成横幅细幅展示。
- [ ] 定向与display全量测试、build、自审并提交拥有文件。

SSE测试输入：
```js
const frames = 'event: evidence\ndata: {"materials":[]}\n\nevent: delta\ndata: {"delta":"山水"}\n\nevent: done\ndata: {"done":true}\n\n'
// 分块含中文半字节；未见done的EOF为interrupted，不是done。
```

## Task 4：入口、小文状态与整体验收（主代理）

Files: router/index.js、config/siteNavigation.js、App.vue、AiChatBox.vue、PoemList.vue、PoemDetail.vue、SpotDetail.vue、LearningTaskIndex.vue、CityExperiences.vue的必要入口及对应测试。

- [ ] 加reading路由与研学导航，入口带poem/compare/spot/region/returnTo，全部atlasLink保留preview。不要改变既有绑定任务反馈接口。
- [ ] 阅读页不挂悬浮助手；小文欢迎语不宣称已接入模型，首次展开读取status，预览禁用真实AI。修复首delta提前开放发送与Result反馈失败误报的窄边界。
- [ ] 分别执行规格审查与质量审查，修复后复审；跑verify:all与diff检查。
- [ ] 浏览器在1440/390检查完整样本、真实空态、选句/笔记/引用定位/导出/停止及导航；保留截图。
- [ ] 合入master并同步auto/improve，发布已有Railway后端和Sites展示站；核对配置status、未公开材料拒绝、线上资源与provenance。
- [ ] 记录实际模型未配置/未做真实质量评测等限制，更新部署与验收记录、清理预览进程，交付入口和配图清单。
