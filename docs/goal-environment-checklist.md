# Goal 阶段 0：真实环境验收清单

这份清单用于在进入“首批真实一城一课”前确认环境已经具备条件。它只记录环境元数据和检查结果，不记录 API key、完整连接密码或用户隐私。

## 1. 环境记录

| 项目 | 结果 | 记录 |
| --- | --- | --- |
| 检查日期（Asia/Shanghai） | `待填写` |  |
| 数据库地址/端口 | `待填写` | 只记录主机和端口，不记录密码 |
| 数据库名称 | `待填写` | 预期为业务库，不使用测试空库代替 |
| 数据快照时间 | `待填写` | 记录备份或导入时间 |
| 后端地址 | `待填写` | 例如本地受控端口 |
| LLM provider/model | `待填写` | 记录供应商和模型名，不记录密钥 |
| 执行人 | `待填写` |  |

## 2. 数据库检查

先确认客户端和连接信息可用，再执行迁移。密码只通过交互式输入或当前 shell 环境变量注入，不写入脚本、日志和仓库。

迁移脚本还需要当前 Python 环境提供 `PyMySQL`。缺少该依赖时，脚本会在读取 SQL 和连接数据库之前以退出码 `2` 结束，只输出依赖补齐方向，不输出密码或 traceback；这不是数据库连接失败。可先运行不触碰数据库的回归检查：

```bash
python3 scripts/apply_migration_test.py
```

依赖未就绪时，请在已批准的 Python 环境中安装 `PyMySQL`，或改用经批准的 `mysql` 客户端按同一份 SQL 执行；不要为了绕过预检把凭据写入脚本或提交到仓库。

```bash
# macOS 若 mysql 不在 PATH，可使用 MySQL 安装目录中的客户端
MYSQL_CLIENT="$(command -v mysql || printf '%s' /usr/local/mysql/bin/mysql)"
"$MYSQL_CLIENT" --version

DB_HOST=127.0.0.1 \
DB_PORT=3306 \
DB_NAME=sjg01 \
DB_USER=root \
DB_PASSWORD='只在当前 shell 注入' \
python3 scripts/apply_migration.py backend/src/main/resources/db/migration/V27__content_provenance.sql

DB_HOST=127.0.0.1 \
DB_PORT=3306 \
DB_NAME=sjg01 \
DB_USER=root \
DB_PASSWORD='只在当前 shell 注入' \
python3 scripts/apply_migration.py backend/src/main/resources/db/migration/V28__ai_audit.sql

DB_HOST=127.0.0.1 \
DB_PORT=3306 \
DB_NAME=sjg01 \
DB_USER=root \
DB_PASSWORD='只在当前 shell 注入' \
python3 scripts/apply_migration.py backend/src/main/resources/db/migration/V29__learning_tasks.sql

DB_HOST=127.0.0.1 \
DB_PORT=3306 \
DB_NAME=sjg01 \
DB_USER=root \
DB_PASSWORD='只在当前 shell 注入' \
python3 scripts/apply_migration.py backend/src/main/resources/db/migration/V30__poet_relation_provenance.sql
```

2026-09-07 复核：本机 MySQL 服务监听 `127.0.0.1:3306`，客户端位于 `/usr/local/mysql/bin/mysql`；当前未提供可用数据库认证凭据，未执行迁移或任何写操作。仓库文档所指向的外部 SQL 归档在本机不存在。

2026-09-12 候选快照审计（仅隔离兼容性验证，不是阶段 0 签字）：发现 `/Users/a1/Downloads/sjg_20260813214743xlghi.sql.gz`，大小 78,680 bytes，压缩包 SHA-256 为 `9bdf55ba4d3fd83585bb19c158dd63facc66418e4bc05d0f20fbd201f7a58497`，解压内容 SHA-256 为 `6e035ef0b78931b4f54b6dc1002b4a86e0c5d3a4e056bfa8e456ac765126f`；dump header 为 MySQL 8.4.9 / `sjg`，时间约 2026-08-13 21:47:44。文件权限为 0644、含 `user` 表且没有外部 manifest/签名，待确认来源并收紧权限。

同日已在独立临时实例（端口 13306，独立 datadir，未写入现有 3306）导入该快照。快照缺少 `cultural_item`，但 V27、V28、V29、V30 首次及第二次执行均成功；基线计数为 poet 126、poem 195、scenic_spot 70、event 3、poem_analysis 2，最终 `content_review` 无重复，`poet_relation/needs_review` 13 条，`source_document` 和 `content_source_link` 均为 0。该实例只用于验证迁移兼容性，不构成正式业务数据或来源授权。由于本机 Python 未安装 `pymysql`，本次实际执行采用隔离实例的原生 MySQL 客户端；正式环境需补齐脚本依赖或使用经批准的客户端流程。

2026-09-19 只读复核：MySQL 客户端为 `/usr/local/mysql/bin/mysql` 9.0.1，`127.0.0.1:3306` 端口可达；未提供认证时以 `root` 连接返回 `ERROR 1045 (28000)`，未猜测密码、未执行迁移或写操作。当前 Python 仍缺少 `pymysql`；`SPRING_DATASOURCE_*`、`LLM_API_KEY`、`LLM_BASE_URL`、`LLM_MODEL` 和 `SJG_AI_EVAL_ENABLED` 均未注入。阶段 0 仍未通过。

迁移后至少核验：

```sql
SHOW TABLES LIKE 'source_document';
SHOW TABLES LIKE 'content_source_link';
SHOW TABLES LIKE 'content_review';
SHOW TABLES LIKE 'ai_audit_log';
SHOW TABLES LIKE 'learning_task';
SHOW TABLES LIKE 'learning_submission';

SELECT COUNT(*) FROM poet;
SELECT COUNT(*) FROM poem;
SELECT COUNT(*) FROM scenic_spot;
SELECT COUNT(*) FROM event;
SELECT COUNT(*) FROM cultural_item;
SELECT COUNT(*) FROM source_document;
SELECT status, COUNT(*) FROM content_review GROUP BY status;
```

判定规则：

- V27、V28、V29、V30 均成功执行，且重复执行不会破坏数据；V30 只初始化关系审核记录，不创建伪造来源关联。
- 诗、地点、事件、文化条目和来源表可查询；数量为零时不得进入真实任务创建阶段。
- 公开任务所引用的实体必须能通过现有公开查询约束，文化条目必须为 `published`。
- 任何来源缺失或审核状态不明的内容先进入治理补录，不用估计值填充。

## 3. LLM 受控请求

先启动后端，再只对一个明确的页面实体发起请求，确认 SSE 中包含 `evidence`、`delta`、`done` 或 `error` 事件。批量评估前必须记录实际模型和后端地址。

```bash
export SPRING_DATASOURCE_URL='jdbc:mysql://127.0.0.1:3306/sjg01?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true'
export SPRING_DATASOURCE_USERNAME='root'
export SPRING_DATASOURCE_PASSWORD='只在当前 shell 注入'
export LLM_API_KEY='只在当前 shell 注入'
export LLM_BASE_URL='按实际 provider 填写'
export LLM_MODEL='按实际模型填写'
cd backend
mvn spring-boot:run
```

受控请求的验收：

- 有证据的问题返回来源摘要；未收录的问题明确表示资料不足。
- 未发布或无审核记录的实体不会进入公开 AI 证据。
- 日志中不出现 API key、完整 Authorization header 或不必要的个人信息。
- 限流和 AI 审计记录可以查询到本次请求的耗时、模型、错误类型和检索数量。

## 4. 进入下一阶段的签字门

- [ ] 数据库连接和数据快照已记录。
- [ ] V27-V30 已执行并通过关键表检查。
- [ ] 至少存在一组可核验的诗、地点、时间线和来源候选数据。
- [ ] LLM 受控请求成功，SSE 事件和证据链符合预期。
- [ ] 密钥未写入仓库、计划文件或评估结果。

只有以上项目全部勾选后，才开始录入首批真实“一城一课”；否则保持 Goal `active`，继续处理环境或数据治理问题。
