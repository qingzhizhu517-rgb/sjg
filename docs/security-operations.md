# 安全运行基线与验收

## 发布与回滚
部署必须绑定一个通过 CI 的提交 SHA；禁止从带未验证改动的目录打包。后端用 Java 17，生产设置 SPRING_PROFILES_ACTIVE=prod、随机 JWT_SECRET（至少32字节）、准确的 CORS_ALLOWED_ORIGINS 和 TRUSTED_PROXIES。TRUSTED_PROXIES 只能填实际直接连接后端的可信代理地址，代理必须覆盖而不是追加客户端可控的来源头。

回滚时在 Railway 选择上一已验证部署重新部署，恢复对应前端构建包；检查 /actuator/health、登录、禁用账号拒绝、内容发布过滤和 AI fallback。数据库迁移由统一发布的受限pre-deploy执行，先备份、仅前向修复；禁止将 schema.sql 导入生产。主干更新不自动等于线上部署。

生产 MySQL 使用 sslMode=VERIFY_IDENTITY 和可验证 CA；如云平台私网无法提供 TLS，应先升级数据库服务或记录隔离网络补偿措施与风险接受，不能把默认关闭 TLS 当完成。LLM 密钥可缺省（保留明确不可用/fallback）；认证密钥缺失必须启动失败。

## 依赖与质量
安装 OSV-Scanner 2.4.0（例如 go install github.com/google/osv-scanner/v2/cmd/osv-scanner@v2.4.0），用 npm run check:security 扫描真实 Maven 传递依赖 SBOM、根工具及三前端共四份 npm 锁文件。网络/API 失败必须重试或修复；扫描失败不能标为零漏洞。每周 Dependabot 更新经 CI 验证后合入。

## 监控与日志
/actuator/health 公开只返回状态；/actuator/metrics 和 /actuator/prometheus 仅 admin 可访问，不开放 env/configprops/heapdump。Prometheus 抓取使用专用管理账号的短期 token，从权限隔离的采集网络访问，设置 Authorization: Bearer，不把 token 提交到配置。记录 HTTP 5xx、Hikari 活跃/最大连接、认证拒绝和失败计数；告警规则在 ops/alerts.yml，需接入实际 Prometheus/告警接收器后执行规则验证。

安全日志记录事件名称与不可逆摘要，不记录原始密码、Bearer、完整 IP、LLM 密钥。日志采集端使用只追加写入、访问控制与保留策略；AI 审计失败不阻塞公开服务，但必须可查日志。

## 备份与恢复
目标 RPO=24 小时、RTO=4 小时（目标值，只有演练后才可声称达标）。每日 UTC 18:00 执行 scripts/backup-db.sh；客户端配置文件必须在仓库外且权限600，凭据使用备份专用只读账号。输出在 .local/backups，gzip + SHA-256，上传 OSS 私有对象。OSS 开启服务端加密、版本管理、生命周期30天；平台层策略须实际配置并记录，仓库文件不能证明线上已开启。

每月在隔离实例执行 scripts/restore-db.sh，只允许 sjg_restore_ 前缀的新库。核对 SHA-256 后恢复，检查关键表计数及发布门禁链路，记录开始/结束时间、备份时间、目标库和删除计划。恢复目标不得使用生产库。近7天备份/恢复演练/告警送达均需运行证据；没有证据保持待验收。

## API 与变更
公开 API 当前冻结 /api/public/** 的 Result {code,message,data} 结构；新增字段向后兼容，移除/改类型需要并行新版本 /api/v2/public/** 与至少90天迁移期。源文档由 OpenAPI 生成，CI 的真实 MVC 与数据库测试验证响应和公开过滤。外部安全审核不属于 ISO 认证；没有组织ISMS审核不能声明 ISO27001 达标。

导出规范：以已审批管理员登录获得短期 token，在环境中设置 SJG_SCHEMA_ADMIN_TOKEN（不要放入命令行参数或文件），运行 node scripts/export-openapi.mjs；SJG_SCHEMA_BASE_URL 默认 localhost:8080。产物不提交，避免旧 schema 被当成当前规范。

发布使用统一 `ops/release.json` 与 `npm run release -- <阶段>`；GitHub `Verified unified release bundle` 只验证选定SHA并准备产物。实际发布按备份→Railway pre-deploy→后端健康/SHA→Sites大屏/后台/主站→HTTP验收执行，步骤、回执和回滚见 [统一部署](unified-deployment.md)。生产environment审批须在平台配置；不能把上传Actions artifact当成线上发布。

全文检索：备份后先应用 V35，再应用 V36。V36 使用 MySQL 内置 ngram parser；核实 ngram_token_size=2，执行 EXPLAIN 确认 type=fulltext 后设置 RAG_FULLTEXT_ENABLED=true。默认false是旧库兼容模式；JSON赏析、关系及单字搜索仍为原有小数据量查询。小数据集性能验证不能替代生产规模压测。

认证和上传配额目前为单实例内存状态，重启清零；多副本部署前必须改为共享存储或由可信网关提供一致的全局限制。流式输出额外保留128字符以拦截跨chunk凭据泄露；该规则不替代独立语义内容审核服务。密码72字节上限来自BCrypt，长Unicode短语可能先达到字节上限；现有密码不会在迁移中被自动改写。
