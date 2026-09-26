# automation-1786635559319 执行记录

## 2026-08-14（夜间自驱动优化 · 一轮一任务）

**选定任务（优先级① 优化提示词/AI 相关文件）**：强化 AI 小文 system prompt + RAG 占位符兜底。

**改动文件**
- `backend/src/main/resources/application.yml`：重写 `llm.system-prompt`（更清晰的以信为本/不虚构、引用标注、善用前端上下文、温和边界原则），保留 `{rag_context}` 占位符。
- `backend/src/main/java/com/sjg/service/ChatService.java`：抽取 `buildSystemPrompt` 方法，新增缺失 `{rag_context}` 占位符时的兜底追加 + 告警（避免 RAG 静默失效）；补 slf4j 日志。
- `backend/src/test/java/com/sjg/service/ChatServicePromptTest.java`（新增）：覆盖占位符替换 / 空资料回退 / 缺失占位符兜底。

**验证**
- 后端 `mvn -o test`：**15/15 通过**（原 12 + 新 3），离线可跑。
- `application.yml` 经 PyYAML 解析通过，且确认 `{rag_context}` 占位符仍在（RAG 契约安全）。

**分支 / 提交**：`auto/improve-20260814` @ `19bb23c`，未 push、未 force；用户既有未跟踪文件未触碰。

**遗留风险**
- 新 prompt 的"效果更好"属主观改进，未做线上 A/B；如线上回答风格需回退，直接还原 `application.yml` 该段即可。
- `ChatService` 限流 `rateMap` 仍是无清理的内存 Map（已知技术债，本次未动），长期运行建议后续换 Caffeine/Redis。

**如何保留**：`git checkout master && git merge auto/improve-20260814`（仅 3 个文件，冲突概率低）。
