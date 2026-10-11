# ISO 差距整改实施与验收台账

日期：2026-10-11。对应 [原评估报告](2026-10-11-iso-standards-compliance-assessment.md)，按 P0 → P1 → P2 实施。工作区为 `codex/iso-remediation`，基线提交 `6f12508`；仓库代码已合并部署，更新结果见 [统一发布验收](2026-10-12-unified-release-results.md)。本台账下面保留初次仓库验收时的状态，线上更新以发布验收记录为准。

本台账区分仓库内已验证的实现与生产环境待验收条件。完整 `npm run verify:all` 于本日通过；结果不能替代线上运行证据或组织级 ISO 认证。

## 逐项结果

| 编号 | 仓库内实施结果 | 验证证据 | 剩余条件 |
| --- | --- | --- | --- |
| P0-1 依赖治理 | Spring Boot 4.1.1、MyBatis-Plus 3.5.17、Jackson 3/Boot4 迁移；修复 npm 与 Maven 传递依赖漏洞；Dependabot、安全披露、真实 SBOM + OSV + npm audit 门禁 | `backend/pom.xml`、`scripts/security-scan.sh`、`.github/workflows/ci.yml`；四份 npm audit 为0，OSV 无已知漏洞报告；完整 Spring 启动与三前端构建通过 | 扫描结果是当次数据库快照；依赖更新继续经 CI 审核。未触发远端 Actions |
| P0-2 认证限流 | 登录/注册按 IP 与规范化账户双维度5次/分钟；第6次429，Retry-After；可信代理链从右向左解析；活动桶不因新键被逐出；摘要安全日志与指标 | `AuthAttemptService`、`AuthThrottleMvcTest`、`AuthServiceSecurityTest`、`ClientIpResolverTest`、`InMemoryRateLimitServiceTest` | 单实例内存态、重启清零；多副本须共享存储或统一网关。生产 TRUSTED_PROXIES 尚需按实际拓扑配置 |
| P1-3 密码规则 | 注册/改密/重置统一至少15字符、常见弱口令及重复口令拦截、BCrypt 72字节上限；管理端提示同步；修正种子账号注释 | `PasswordPolicy`、`AuthServiceSecurityTest`，真实重置链路 | 小型本地黑名单不等于完整泄露口令库；存量密码未自动改写，初始管理员须受控设置强密码 |
| P1-4 JWT 生命周期 | 密钥与有效期启动校验；默认1小时；HMAC 绑定当前身份、密码哈希、角色、状态和凭据版本；改密/重置/禁用再启用使旧 token 失效 | `JwtCredentialBindingTest`、`PlatformSecurityIT`，HTTP 401 实测；V35 重复执行成功 | **部署前必须应用 V35**；旧版 token 需重新登录；生产密钥轮换仍需执行 |
| P1-5 生产加固 | info 日志；Swagger/指标 admin 鉴权，prod 默认禁 Swagger；精确 HTTPS CORS、禁 cookie credentials；prod 强制数据库 VERIFY_IDENTITY 与凭据 | `ProductionConfigurationGuard` 与配置测试；真实 HTTP 文档访问401/admin200 | 生产数据库 TLS/CA、CORS、prod profile 未在本轮部署验证；不把配置文件当作 TLS 已开启 |
| P1-6 可观测性 | Actuator health、Micrometer/Prometheus、认证计数；5xx/连接池/认证失败告警规则；Railway healthcheck 改为独立健康端点 | `/actuator/health` 公开不含组件细节；Prometheus匿名401、admin200，真实集成通过 | Prometheus、告警接收器、集中只追加日志尚未接入；AI错误指标/告警仍需结合审计数据完善 |
| P1-7 备份恢复 | 私有 MySQL 配置权限校验、锁、单事务 dump、gzip/SHA-256、OSS private 上传；恢复校验摘要，仅新建 `sjg_restore_*`；cron 示例与保留策略 | `scripts/backup-db.sh`、`scripts/restore-db.sh`，shell语法与拒绝危险目标检查 | **尚未执行真实备份上传和恢复演练**。RPO24h/RTO4h 为目标；近7天备份、月度演练、OSS加密/版本/30天生命周期须提供运行证据 |
| P1-8 集成测试 | Java17 + Testcontainers MySQL8.4 + 完整 SpringBootTest + 嵌入式 Tomcat；认证、发布过滤、监控/文档权限、迁移和性能链路 | `PlatformSecurityIT` 的5条测试全部通过，无跳过；Docker缺失会失败 | 小数据测试不等于真实数据/付费模型验收；原有 AI 自动发布和 fallback 不落库规则保留 |
| P2-9 共享逻辑 | 独立 `@sjg/shared` 本地包复用 Result 和媒体数组解析；三工程保持独立安装；保留图片数组/视频JSON字符串契约 | `scripts/shared-contract.test.mjs`、管理端契约、三前端 npm ci/build | 发布/打包须包含 shared 目录，不能只拷贝单工程源码安装 |
| P2-10 静态工具 | ESLint 安全/正确性与复杂度规则、共享文件 Prettier、Java Checkstyle/PMD/SpotBugs；修复忽略异常与输出泄露 | `npm run lint`、`check:format`、`./mvnw -Pquality verify` 全过 | 这是初始规则集；不是全仓格式化或完整 ISO5055 规则覆盖 |
| P2-11 度量门禁 | 重复率≤3%；JS复杂度≤60、Java方法60/类300；display-v2已加载源码行覆盖率≥60% | jscpd 0.1223%；250测试通过，源码行覆盖率69.25%；Java静态门禁通过 | 覆盖率针对执行到的源码，不代表全部 SFC/DOM/Canvas；阈值是当前基线，后续可收紧 |
| P2-12 上传边界 | 禁SVG；扩展名/MIME/文件头三重校验；拒绝危险目录；每账号每天50次/1GiB及200MiB单文件配额；内部失败固定文案 | `UploadSecurityTest`，含无INI解析器的真实 OSS SDK 构造 | 上传配额内存态；文件头不等于完整文件解码或恶意软件扫描；真实OSS上传未执行 |
| P2-13 异常隔离 | 已知 Auth/User 业务错误用 BusinessException 返回400；意外运行时错误500固定文案+日志；429/校验400分开 | `ExceptionBoundaryTest`、真实 MVC 请求及现有业务回归 | 未来新增业务错误应使用专用类型，不能恢复任意异常信息透传 |
| P2-14 API 契约 | 固定现有 Result 和公开路径；破坏性变更并行v2/90天迁移规则；管理员 OpenAPI 实测可生成，新增导出工具；旧接口文档标明历史说明 | `ApiSmokeTest`、`PlatformSecurityIT`、共享解包契约；导出工具通过本地受控响应验证 | 尚无逐版本 OpenAPI schema 差异门禁；生产规范导出需已审批管理员且短期开启文档 |
| P2-15 查询/性能 | timeline 按实体合批；V36五类 ngram 全文索引，参数化 MATCH；Hikari预算；SpotDetail改按需ECharts；新增小数据HTTP性能门禁 | `TimelineBatchTest`、`FullTextSearchTest`、真实 EXPLAIN type=fulltext；200请求/并发5，p95健康13.73ms、诗词11.99ms，门槛1s | **V36尚未应用实际业务库**，RAG全文开关默认false兼容；迁移和EXPLAIN后再开启。单字/关系/JSON仍走原查询；没有生产规模压测或全站LCP结论 |
| P2-16 构建/发布 | Maven Wrapper3.9.16、Node基线、隔离MySQL compose、选定完整SHA的手动发布工作流，三前端产物与可选Railway发布；回滚说明 | Wrapper执行完整门禁，compose与YAML检查 | GitHub生产环境审批/公开变量/部署凭据尚需配置；工作流未触发；前端Sites仍需现有发布流程 |
| P2-17 文档一致性 | 更新 AGENTS、接口文档、报告更正、执行计划、安全运行手册与本台账 | 与实现/命令/当前权限核对，空白检查 | 原报告评级为整改前基线，不自动重新计算认证或百分比 |

另外落实客户端聊天历史角色/长度边界与所有 LLM 通路的跨chunk凭据泄露过滤、异常文案收敛；这不构成独立语义内容审核。四页面 axe 检查均为0个 serious/critical，修复实际发现的文字对比度；未声称全站无障碍完成。

## 实际验收

统一入口：在仓库根目录以 Java17、Node24、Docker和OSV-Scanner2.4.0执行 `npm run verify:all`。本次完整执行退出0，后端于2026-10-11 20:15（上海时间）结束，随后四页面无障碍和空白检查通过。后续新增文档、导出脚本和发布变量补跑对应lint/格式/语法/受控导出检查。

- 后端188个单元/MVC测试 + 5个真实MySQL集成测试，无失败、无错误、无跳过。
- display-v2 250个测试，已加载源码行覆盖率69.25%；三前端构建通过，datav严格TS检查通过。
- 根工具及三前端 npm audit 为0；实际Maven传递依赖SBOM经OSV扫描无已知漏洞报告，无扫描豁免。
- ESLint、选定共享文件Prettier、jscpd、Checkstyle、PMD、SpotBugs均通过。
- 四页面：display `/map?preview=inkwash`、`/poets?preview=inkwash`、admin `/login`、datav `/`，axe严重/致命问题为0。展示页面使用明确设计样本，其他页面无后端业务数据，不代替完整用户流程验收。
- V35/V36在测试MySQL中各执行两遍；ngram索引命中与执行计划通过。性能样本是本机小数据集，不外推线上吞吐。

本地原始报告在 `.local/quality/` 与 `backend/target/`，均被忽略，不提交。CI配置会保留质量报告artifact；本次没有远端CI执行记录。

## 发布前顺序

1. 在已备份的实际业务数据库应用V35，再发布新后端；存量token重新登录。数据库迁移不自动执行，禁止导入 schema.sql 覆盖业务库。
2. 如启用全文检索，应用V36、确认MySQL ngram配置及EXPLAIN，再设 `RAG_FULLTEXT_ENABLED=true`。
3. 配置prod、TLS/CA、随机JWT密钥、精确CORS和可信代理；完成真实启动、权限与审核门禁验证。
4. 接入实际备份计划/私有OSS策略、隔离恢复、监控抓取及告警送达；记录时间和结果，核实RTO/RPO。
5. 发布必须对应已验证SHA；建立生产environment审批与变量，再选择发布工作流/现有Sites流程。多副本前处理共享限流和配额。

以上外部步骤未在本轮擅自执行，没有读取本地密钥、修改实际业务数据库或产生付费LLM生成。

## 标准依据更正

单因素密码长度基线参照 [NIST SP800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html)。Boot4升级遵循 [官方迁移指南](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide)，扫描使用 [OSV-Scanner文档](https://google.github.io/osv-scanner/usage/)。工具门禁提供工程证据，不直接给出ISO/IEC27001认证或ISO/IEC5055标准化测量结论。
