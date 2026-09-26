# AI 评估集说明

`ai-evaluation-set.json` 是离线回归集，不要求连接真实模型。每题声明预期命中实体类型、必须引用的来源、禁止出现的事实和是否允许明确回答“暂未收录”。

建议每次修改系统提示、检索器或模型后运行以下检查：

1. 证据命中率：回答引用的实体类型是否覆盖 `expectedEntityTypes`。
2. 引用覆盖率：回答是否引用 `mustCiteSourceIds` 中至少一个来源。
3. 无依据断言率：当前按题目声明的 `forbiddenClaims` 做可重复的规则代理；未标注的其他精确事实仍需人工复核，不能仅凭该指标判定全部事实正确。
4. 上下文命中率：`context` 类问题是否明确回应当前页面实体。
5. 工程指标：平均响应时间、错误率、无证据问题比例和用户反馈率。

第一阶段只做结构化样本与规则校验；模型质量阈值建议为证据命中率不低于 90%，无依据断言率低于 10%，再决定是否扩大模型或增加向量检索。评估集固定为 54 题，覆盖 `poet`、`poem`、`spot`、`city`、`cultural_item`、`event`、`relation`、`no_data`、`context` 九类问题（当前各 6 题），并要求 `context` 题声明页面类型；若上下文带有实体 ID，评估器会优先检查返回证据是否命中同类型实体，避免把数字 ID 当成回答文本匹配。

## 2026-09-07 展示端走查记录

本轮复用本地展示端 `http://127.0.0.1:5175/crafts` 检查旗舰工坊页面，分别使用桌面和移动视口：

| 视口 | 结果 | 证据 |
| --- | --- | --- |
| 1440×900 | 通过 | 首屏标题、3D/降级舞台、步骤控制和工艺简介可见；`documentElement.scrollWidth=1432`，无横向溢出 |
| 390×844 | 通过 | 标题、舞台、步骤导航和解说文案可见；`scrollWidth=382`，无横向溢出；步骤名称按移动端规则收缩为图标 |

本次记录覆盖首屏布局和响应式溢出检查；真实学习任务、管理端任务运营、AI 指标页以及真实内容/模型链路仍需阶段 0 的数据库和 LLM 配置后继续走查。

补充错误态走查：管理端登录页在 1440×900 和 390×844 下均无横向溢出；公开学习任务 `/learn/missing-task` 在桌面和移动视口均显示“任务不存在或尚未发布”，移动视口无横向溢出。由于当前没有可用管理员凭据和已发布任务，登录后的治理工作台、任务复制/发布/下架和 AI 指标页不作完成验收。

## 运行真实回归

真实回归默认关闭。准备好后端服务和 LLM 配置后，在仓库根目录执行：

```bash
SJG_AI_EVAL_ENABLED=true \
LLM_API_KEY='只在当前 shell 注入，不写入仓库' \
SJG_AI_EVAL_BASE_URL='http://localhost:8080' \
LLM_BASE_URL='按实际 provider 填写' \
LLM_MODEL='按实际模型填写' \
scripts/run-ai-eval.sh
```

脚本会逐题调用 `/api/public/chat`，解析 `evidence`、`delta`、`error` 事件，并将完整结果写入 `.local/ai-eval/<UTC 时间>.json`。该目录已加入 `.gitignore`。未设置 `SJG_AI_EVAL_ENABLED=true` 时只输出跳过提示；启用后若缺少 `LLM_API_KEY`、`LLM_BASE_URL` 或 `LLM_MODEL` 中任一项，退出码为 2 且不会发送请求。错误提示只列缺失变量名，不回显配置值。

可用环境变量：

- `SJG_AI_EVAL_BASE_URL`：后端地址，默认 `http://localhost:8080`。
- `SJG_AI_EVAL_FIXTURE`：评估集路径，默认 `docs/ai-evaluation-set.json`。
- `SJG_AI_EVAL_OUTPUT`：结果文件路径，默认 `.local/ai-eval/<UTC 时间>.json`。
- `SJG_AI_EVAL_SOURCE_MAP`：可选的本地 JSON 映射文件，将评估集中的来源编号映射到真实数据库来源 ID，例如 `{ "1": 31 }`。

结果中的 `summary` 是聚合指标（含 `errorRate`），`results` 保存每题的回答、证据数量、命中的实体键（`evidenceEntities`）、实际来源 ID（`citedSourceIds`）、覆盖的必引来源（`matchedSourceIds`）、触发的禁止断言、上下文命中、错误和耗时。`source_document` 命中由证据项上的有效 `sourceIds` 推导，避免把来源链误判为无证据。评估脚本只把请求发给本地后端，不读取或记录完整 API key。评估集加载时要求恰好 54 题；即使 HTTP 返回 200，只要 SSE 为空、Content-Type 不正确、缺少有效 `delta`/`done`，或含 `error` 事件（包括纯文本错误），该题也会计入失败。失败请求保留在质量指标分母中，且 `noErrors` 门槛必须通过，避免部分请求失败时虚高质量结果。

每份报告还包含 `metadata`：模型标识、Git commit、评估集 SHA-256、来源映射 SHA-256、数据库快照标识和运行人。可通过 `--model`、`--commit`、`--db-snapshot`、`--operator` 或对应环境变量显式提供；未提供的字段记录为 `null`（运行人默认使用当前 shell 用户），不应填入猜测值。

CLI 的 `--limit` 仅用于受控试跑；只要评估题数少于评估集总数，进程就以失败状态退出，局部指标不能作为 54 题质量门验收。
