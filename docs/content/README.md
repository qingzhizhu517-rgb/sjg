# 首批“一城一课”内容交付模板

本目录只存放真实内容运营的交付模板和最终记录。模板不能直接作为公开任务发布，也不能用测试种子数据填充后冒充真实来源。

## 使用顺序

1. 先确认 [阶段 0 环境清单](../goal-environment-checklist.md) 已通过，记录数据库快照和模型元数据。
2. 复制 `first-learning-task.template.md` 为 `first-learning-task.md`，选择济南或泰安，填写 3 首诗、3 个地点、1 条时间线和审核记录。
3. 复制 `first-task-source-ledger.template.csv` 为 `first-task-source-ledger.csv`，一行对应一条可核验来源；不要把 AI 生成文本登记为事实来源。
4. 通过管理端创建来源、实体来源关联和审核记录，再编写任务 JSON。
5. 对任务 JSON 运行 `node scripts/learning-task-check.mjs <path>`，通过离线检查后，再用发布 API 做真实实体、来源和审核状态校验。
6. 对最终来源台账运行 `node scripts/content-ledger-check.mjs <ledger.csv> --task <task.json> --require-first-task-scope`，确认来源元数据齐全且任务引用的实体没有漏登记。
7. 任务实际发布后，补充匿名成果导出路径、公开任务代码、覆盖率和发布人信息。

## 最低交付门槛

- 每道题都绑定真实实体和来源 ID。
- 每个 `resources` 材料都能回溯到实体和来源关联。
- `compare` 题至少引用两个实体和两个不同来源。
- 来源包含作者或机构、年份、标识、URL 或馆藏信息、定位信息和版权说明。
- 审核状态、审核人和发布日期来自真实管理端记录，不手工猜测。
- 未完成数据库存在性与审核校验前，不得将模板中的 ID 写入公开任务。

## 台账离线检查

`content-ledger-check.mjs` 只读取 CSV 和可选的任务 JSON，不连接数据库。默认正式检查会拒绝占位文本和非 `published` 审核状态，并可用 `--require-first-task-scope` 检查 3 首诗、3 个地点和 1 条时间线的范围。它不能替代管理端对实体、来源和审核记录的真实校验。
