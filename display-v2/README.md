# 齐鲁文脉展示前端

Vue 3 / Vite。使用 `npm ci`、`npm run dev` 开发，`npm run test:unit` 验证行为，`npm run build` 生成静态站点。

## AI 对照阅读

`/reading` 从两篇已发布作品出发，按意象、视角、情绪或语言比较；生成线索中的 `[A:行号]`、`[B:行号]` 返回实际原文。原文、来源和 AI 解读分别展示。个人选句及判断保存在当前浏览器，按作品对隔离，可导出 Markdown 札记。

`/reading?preview=inkwash` 是明确标注的设计样本，使用本地作品和静态导读，不请求公开 API 或模型。样本的作品、关联与解读均不表示已经本平台审核。正式页无已发布作品时保持空态，由用户主动打开样本。

可选 URL 参数为 `poem`、`compare`、`spot`、`region`、站内 `returnTo`。服务端 `GET /api/public/ai/status` 只报告是否配置；`POST /api/public/poems/compare` 只接收两个作品 ID、方向、模式与个人判断，服务端读取并校验原文。比较结果不自动发布或写入作品表。

构建变量 `VITE_BACKEND_URL` 指向现有后端。实时生成需要在后端配置 `LLM_API_KEY`、`LLM_BASE_URL` 和 `LLM_MODEL`；未配置时原文、选句及笔记仍可使用。不得将密钥放进 Vite 变量。

配图及生成记录位于 `public/media/inkwash/reading/`，原始设计图仅保留在本地忽略的 `output/ai-reading/2026-10-11/`。部署版本及访问范围见主仓库 `docs/deployment-state.json`。
