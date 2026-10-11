# ISO 差距整改执行计划

**Goal:** 按评估报告 P0 → P1 → P2 落实代码和可执行运维配置，逐项记录真实验证结果。
**Architecture:** 保留四工程独立构建与现有发布审核规则。安全边界在后端落实，CI 与本地门禁一致；线上配置和恢复演练单独记录，不能用静态文件代替运行证据。
**Tech Stack:** Java 17、Spring Boot、MyBatis-Plus、Vue/React、Node test runner、MySQL、GitHub Actions。

执行方式：当前会话逐项实施。每项涉及行为变更时先增加失败测试，再实现，再执行针对性和全量验证。

## P0
- [x] 1. 升级受支持 Spring Boot 及直接依赖；Dependabot、Maven/npm 成分扫描、安全披露政策；执行扫描并修复高危。
  - 文件：backend/pom.xml、.github/dependabot.yml、.github/workflows/ci.yml、scripts/verify-all.sh、SECURITY.md、各 package-lock.json。
  - 验证：mvn test、依赖树/SCA、npm audit、后端真实上下文启动、三前端 build。
- [x] 2. 认证 IP 与账户维度限制；429/Retry-After、可信反代解析、安全事件日志。
  - 文件：AuthController、AuthAttemptService、RateLimitService、ClientIpResolver；新增 AuthSecurityTest。
  - 验证：真实 MVC 中第六次被拒、换 IP 的账户限制、伪造转发头无法绕过。

## P1
- [x] 3. 注册/修改/管理员重置统一密码规则，前端提示同步；核实种子账号注释。
- [x] 4. JWT 与当前密码/角色/状态绑定，密钥启动校验，改密/禁用旧 token 立即失效。
- [x] 5. info 日志、Swagger/指标鉴权、生产配置校验、CORS 精确白名单、TLS 基线。
- [x] 6. Actuator health、指标和告警规则；记录端点访问控制验证。
- [x] 7. 私有备份、校验与隔离库恢复工具、RTO/RPO/保留策略和调度配置；恢复演练需要实际备份和目标库。
- [x] 8. 真实 Spring 上下文 + MySQL 集成链路，CI 中必须执行，不能静默跳过。

## P2
- [x] 9. Result 解包与图片数组解析单点化，保持独立工程和发布打包可用。
- [x] 10–11. ESLint/格式与 Java 静态分析、复杂度/重复度报告、覆盖率基线门禁。
- [x] 12. 禁 SVG、文件签名与目录校验、上传配额、固定内部失败文案。
- [x] 13. BusinessException 隔离已知业务错误，未预期运行时异常 500 固定文案。
- [x] 14. API 兼容性冻结文档、OpenAPI 可生成与契约回归。
- [x] 15. timeline 查询合批；检索索引与性能基准，保持 published 来源过滤。
- [x] 16. Maven Wrapper、隔离本地依赖配置、可显式触发的发布工作流及回滚说明。
- [x] 17. AGENTS.md、评估报告更正与整改台账同步。

[x] 表示仓库代码、工具或配置已落实并验证。生产备份、告警、TLS 和发布的外部验收仍待执行，具体剩余条件见结果台账。

## 验收记录
每个编号对应 docs/2026-10-11-iso-remediation-results.md 的状态、证据、命令和剩余条件。总体执行 npm run verify:all、git diff --check；任何未运行或外部阻塞的验收保持未完成状态。
