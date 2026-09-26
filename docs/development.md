# SJG 开发与交付

## 环境要求

- Node.js 20 或更高版本
- npm 10 或更高版本
- Java 17 或更高版本
- Maven 3.9 或更高版本

后端单元测试和 API 冒烟测试不需要 MySQL、OSS 或真实 LLM。运行应用本身时，再按 `backend/src/main/resources/application.yml` 提供对应环境变量。

## 运行时安全配置

- `TRUSTED_PROXIES`：可信反向代理地址，多个地址用逗号分隔。未配置时，公开 AI 接口只使用服务器看到的连接地址，忽略客户端提交的 `X-Forwarded-For` 和 `X-Real-IP`。
- `LLM_API_KEY`、`LLM_BASE_URL`、`LLM_MODEL`：真实模型调用配置。未配置密钥时，AI 接口返回明确的未配置提示，不会伪造回答。
- `llm.rate-limit.window-seconds`、`llm.rate-limit.max-requests`：AI 入口共享的滑动窗口限流参数；`max-keys` 和 `cleanup-interval-millis` 控制有界内存实现的容量与清理周期。

## 学习任务 JSON

发布任务时，每道题必须绑定来源，并优先使用可表达混合实体的结构：

```json
{
  "prompt": "诗词中的地点想象与景观资料有什么异同？",
  "entityRefs": [
    { "type": "poem", "id": 1 },
    { "type": "scenic_spot", "id": 1 }
  ],
  "sourceIds": [1]
}
```

旧任务可以继续使用单一类型的 `entityType + entityIds`，但发布时实体、来源和审核状态都会重新校验。公开任务只允许 `published` 状态。

发布门槛还包括：`compare` 步骤的每道题必须引用至少两个不同的实体；每个 `sourceIds` 都必须在 `content_source_link` 中与该题引用的至少一个实体建立关联。仅存在于 `source_document`、但没有落到题目实体上的来源，不足以通过发布校验。

任务必须包含非空的 `resources`。每个资源都必须填写已审核实体、`title`、`snippet` 和来源 ID；来源文献不仅要存在，还必须在 `content_source_link` 中关联到该资源实体。资源校验与题目校验共同构成公开任务的可追溯发布门槛。

离线检查器还会逐题确认：题目引用的每个实体和来源，至少能被一个实体匹配且来源有交集的资源覆盖；`spot` 与 `scenic_spot` 作为兼容别名处理。离线通过只说明交付结构完整，真实发布仍需经过数据库实体、来源和审核状态校验。

反思反馈接口 `POST /api/public/learning-tasks/{taskCode}/feedback` 要求提交 `questionId` 和 `answer`。服务端会从已发布任务的 `contentJson` 定位题目，并按题目实体与来源 ID 的交集重建 canonical `resources`；客户端提交的 `question`、`evidence` 字段仅为旧调用方保留，不能覆盖服务端上下文，也不会进入模型提示词。

## 内容治理工作台

管理端登录后访问 `/content-governance`，按“来源文献 → 实体关联 → 审核队列”的顺序运营内容：

- 来源文献：`GET/POST /api/admin/source-documents`，编辑使用 `PUT /api/admin/source-documents/{id}`。
- 实体关联：`POST /api/admin/source-links`，查询使用 `GET /api/admin/source-links/{entityType}/{entityId}`。
- 审核队列：`GET /api/admin/content-reviews`，状态流转使用 `PUT /api/admin/content-reviews/{entityType}/{entityId}`。

关联接口会校验来源和业务实体真实存在，并拒绝相同实体、来源和定位的重复关联。审核状态仍按 `needs_review -> approved -> published -> archived` 顺序推进；没有真实来源和审核依据时，不要把测试种子数据标记为已发布。审核记录进入 `published` 前，实体至少要有一条 `content_source_link`；只有 `approved` 状态并不代表可以公开。

公开诗词、诗人、景点、事件、朝代和时间线接口统一只读取 `content_review.status=published` 的实体；公开详情遇到未发布或缺少审核记录的主实体返回 404，关联诗词和关系图谱节点也会过滤未发布记录。管理端服务仍保留草稿查询与编辑能力。

诗词公开赏析也继承诗词审核状态：未发布或没有审核记录的诗词不会触发赏析生成，也不会返回已有的 AI 赏析缓存。

## 常用命令

在仓库根目录执行：

```bash
npm run verify:all
```

这会依次安装三个前端的锁定依赖，运行展示端单元测试，构建三个前端，运行后端测试，并检查 Git 空白字符错误。任何阶段失败都会立即停止并显示阶段名称。

单独执行时可使用：

```bash
npm run test:unit
npm run test:ai-eval
npm run test:learning-task
npm run test:migrations
npm run check:migrations

# 检查一个任务 JSON 的步骤、实体/来源绑定、资源覆盖和未替换占位文本
node scripts/learning-task-check.mjs path/to/learning-task.json
# 检查当前契约示例（示例文件本身保留模板占位文本）
node scripts/learning-task-check.mjs docs/learning-task-example.json --allow-template
npm run build:display
npm run build:admin
npm run build:datav
npm run test:backend
```

## 后端测试边界

`backend/src/test/java/com/sjg/controller/ApiSmokeTest.java` 使用 MockMvc 验证公开接口的返回包络、参数转发和管理端未认证写操作。测试会替换所有 MyBatis Mapper，不连接业务数据库，也不会访问外部模型。

## 提交前检查

每个阶段的代码、数据库迁移、测试和文档应放在同一个提交边界内。除全量验证外，涉及前端页面的改动还要完成一次桌面和移动端人工走查；涉及公开 API 的改动要确认旧字段和 `{ code, message, data }` 包络仍然兼容。
