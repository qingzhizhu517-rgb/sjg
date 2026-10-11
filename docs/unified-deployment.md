# Railway + Sites 统一部署

统一公开配置为 `ops/release.json`，统一操作入口为根目录 `npm run release -- <阶段>`。保留已有 Railway 项目、数据库、后端与三个 Sites 的身份、域名和 owner-private 访问范围。四个应用仍独立构建，不迁移到单机，也不把数据库数据并入源码。

## 依赖和启动顺序

| 次序 | 服务 | 前置条件 | 完成条件 |
| --- | --- | --- | --- |
| 1 | Railway MySQL | 已有持久化卷、可信业务库、备份与隔离恢复 | 数据库可连接、TLS身份校验可用 |
| 2 | Railway backend | 同版本备份确认、MySQL就绪 | pre-deploy V35/V36成功，health为UP，公开版本SHA匹配 |
| 3 | Sites sjg-datav | 新后端通过检查 | 原生部署succeeded、版本标记匹配 |
| 4 | Sites admin-frontend | 新后端通过检查 | 原生部署succeeded、版本标记匹配 |
| 5 | Sites display-v2 | 新后端和大屏已发布 | 原生部署succeeded、主站的大屏链接指向统一配置 |

MySQL与后端的依赖由真实连接、迁移锁及pre-deploy门禁落实；前端是静态产物，发布工具检查上游，而非启动开发服务器。多平台更新不是原子事务，失败时保留旧前端、停止后续发布并按journal恢复。

## 配置边界

- `ops/release.json` 只保存平台ID、HTTPS域名、依赖和公开素材origin；三前端的VITE变量与后端CORS都由它派生。素材origin默认空，使用仓库内已验证素材。
- 平台内保留 `JWT_SECRET`、数据库和OSS凭据；不进入前端、仓库、日志、命令行参数或发布包。LLM仍按已有配置运行，缺key时保留不可用/fallback行为。
- 后端prod要求数据库URL含 `sslMode=VERIFY_IDENTITY`。自签CA使用 `MYSQL_CA_PEM_BASE64`（只有公开证书），启动时合并到Java标准HTTPS信任根；数据库私钥保留在MySQL持久化卷。证书须含实际 `.railway.internal` 主机名SAN，续期时先部署新证书、再同步CA并重发后端。
- 认证和上传配额仍是单副本内存态；统一发布不默认扩容，也不引入未配置的Redis。
- 独立Sites源码内携带shared副本，并将 `file:../shared` 改为 `file:./shared`，使其远端独立构建可复现；主仓库维持原依赖路径。

## 发布步骤

1. 合并已验证代码到master，确定完整40位SHA。Java17、Node24、Docker、OSV-Scanner2.4.0环境执行 `npm run verify:all`。GitHub的 `Verified unified release bundle` 工作流也执行同一门禁，读取同一配置并生成该SHA的源码/构建产物；上传artifact不等于发布。
2. 在仓库根目录设置 `SJG_RELEASE_REVISION=<已验证完整SHA>`，运行 `npm run release -- plan`、`npm run release -- prepare`。输出位于忽略的 `.local/releases/<SHA>/`，保留不可变源码快照、发布journal与前端打包结果。后续文档提交不会改变这个发布SHA。
3. 对实际数据库备份并核对SHA-256，恢复到隔离库。运行 `npm run release -- backup`，经隐藏stdin提供 `{artifact,sha256,completed_at,target_database,counts}` 回执。禁止把schema.sql导入生产或用初始化脚本覆盖非空库。备份由私有运维环境执行；临时维护服务仅用于受控发布，完成后应停用/删除。
4. 首次切换prod前确认MySQL TLS/CA已就绪、后端连接URL和凭据正确。运行 `npm run release -- backend`，工具先通过原生IaC导入当前项目（variables unmanaged），只覆盖后端健康/pre-deploy字段并检查plan无其他变更；然后只更新统一CORS、版本、备份确认、prod、全文开关与Swagger禁用等公开配置，然后上传该快照的backend。
5. Railway执行 `ReleaseMigrationRunner`：持MySQL命名锁，只应用V35/V36，验证已应用脚本校验和；不导入快照、不重放历史素材迁移、不改内容审核状态。失败则停止部署。MySQL DDL会隐式提交，修复后重试幂等脚本，不假称事务回滚。pre-deploy超时180秒。
6. 等Railway状态SUCCESS，运行 `npm run release -- backend-check`。它同时校验 `/actuator/health` 和 `/api/public/deployment` 的SHA；旧健康实例不会通过新版本门禁。首次上线新会话格式后旧JWT需重新登录。
7. 按大屏→后台→主站发布。设置 `SITES_WORKFLOW_HELPER` 为当前安装Sites插件的 `scripts/site-workflow.mjs` 绝对路径。运行 `npm run release -- sites <工程名>`，通过隐藏stdin传入 `{credential:<该项目的短期源仓库凭据>}`。工具用官方helper打开源码，保留旧源码副本、写入公开配置和版本标记、npm ci/build、提交推送并打包，输出精确project_id/commit_sha/archive。
8. 用Sites原生 `save_version_and_deploy_private` 发布输出的源码与归档（先确认仍为owner-private）。非终态继续查询相应部署ID；成功后运行 `npm run release -- record <工程名>`，隐藏stdin传入成功回执。推送凭据短期有效，过期只刷新同一项目的凭据，不能新建替代站点或强推。
9. 运行 `npm run release -- verify`，隐藏stdin传入 `{siteTokens:{<projectId>:<已有owner-scoped校验token>}}`。校验三个 `/deployment-info.json`、同SHA后端、三个CORS来源与匿名后台401。不能通过读取私有站点登录页推断业务页面验收。
10. 将无密钥的部署ID、站点源SHA、仓库SHA和验证时间更新到 `docs/deployment-state.json`；保留本地私有备份与journal。平台原生发布凭据由Sites插件处理，不在GitHub工作流里伪造Sites上传接口。

常用状态入口：`npm run release -- plan`、`.local/releases/<SHA>/release.json`、Railway部署页、Sites的deployment_id。重试必须保持同一SHA及已保存version_id，避免重复创建版本。发布完成后可提交验收文档，应用版本仍以这些HTTP标记为准。

## 回滚与注意事项

后端失败时不发布前端。前端任一失败时停止后续阶段，恢复其上一已保存版本，或从当前journal继续；主站最后发布，减少大屏链接先于目标更新。回滚应用到上一已验证后端镜像和Sites版本，使用对应公开配置；V35/V36为新增列/索引，保留数据库前向迁移，不执行破坏性down脚本。

证书更新与数据库启动参数变更可能需要短暂数据库重启，先备份并验证恢复，再操作；确认连接池能重连。MySQL `secure_file_priv` 如需调整，限定为持久化卷内权限700的独立 `/var/lib/mysql/sjg-tls` 目录，禁止设为空或开放整个数据目录；仅可信管理员具FILE权限。临时维护令牌应独立、短期、仅经HTTPS/平台变量传递；备份端点不能成为长期公开服务。

本轮没有把Sites私有范围改为公开，也没有自动启用付费订阅、LLM、OSS上传或组织监控。定时异地备份、告警送达和完整浏览器业务验收依然需要各自运行证据。

平台依据：[Railway pre-deploy](https://docs.railway.com/deployments/pre-deploy-command)、[配置即代码](https://docs.railway.com/config-as-code)、[MySQL运行时TLS配置](https://dev.mysql.com/doc/refman/8.4/en/using-encrypted-connections.html)。Sites发布遵循安装插件的官方helper与原生工具。

发布journal使用文件写锁、原子替换与快照校验，过期写入会失败，不能覆盖另一服务回执；按顺序运行阶段，重试时重新读取journal。原生IaC是有效配置依据，`backend/railway.json` 作为版本内的部署规范由工具映射至IaC，不依赖CLI隐式发现配置文件。当前Railway旧Config-as-Code兼容窗口至2026-12-01，发布工具已使用原生IaC同步有效设置。
