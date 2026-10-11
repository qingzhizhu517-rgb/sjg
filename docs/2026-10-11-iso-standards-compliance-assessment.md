# SJG 齐鲁文化数字人文平台 —— ISO/IEC 标准合规性与健壮性评估报告


> **基线归档与更正（2026-10-11）**：以下正文保留整改前的静态评估，原行号、版本、评级与百分比不表示当前状态。逐项实施和真实验证以 [整改结果台账](2026-10-11-iso-remediation-results.md) 为准。
>
> 评估证据边界：旧版本与扫描缺失证明治理缺口，具体 CVE 是否影响本应用仍须匹配依赖版本、配置和漏洞适用条件；`chunkSizeWarningLimit` 只是告警阈值，不能单独证明实际 chunk 大小。原“约40%达标”为未加权定性估计，不是认证结论。缺 OpenAPI schema 对拍不等于没有接口契约测试；缺完整 SpringBootTest 不等于没有真实 WebMvcTest 切片。ISO/IEC 5055 的度量不要求特定品牌工具，配置工具也不等于完成标准化测量。
>
> 处置建议更正：不把已停止开源支持的旧修复线作为本轮终点，本轮实际升级 Spring Boot 4.1.1 并验证 Java17/MySQL 集成。单因素密码本轮按 NIST SP800-63B-4 至少15字符落实，而非原建议8–12字符；登录无限流产生在线暴力猜测风险，不能据此声称获得离线密码哈希攻击条件。

- **评估日期**：2026-10-11
- **评估对象**：SJG 平台（`backend` / `admin-frontend` / `display-v2` / `sjg-datav` + `scripts` 工具链）
- **评估基准**：ISO/IEC 25010:2023（产品质量模型）、ISO/IEC 27001:2022（附录 A 控制项）、ISO/IEC 5055:2021（自动化源代码质量度量）、参照 NIST SP 800-63B（认证）、OWASP ASVS 思路
- **评估方法**：依据 ISO/IEC 25040 评估过程思路，对源码（117 个后端主源文件）、配置、CI 流水线、质量门禁与部署文件进行静态审查（source code review + configuration audit），并结合仓库内既有验证记录。**本报告为差距分析（gap analysis），不等同于 ISO 认证审核；评级为定性映射，非合规范畴的法律结论。**
- **证据模式**：所有结论均给出 `文件:行号` 级别证据索引（见文末附录）。

---

## 0. 总体结论

> **一句话结论：工程治理基线显著高于同类毕设/中小项目（内容审核状态机、AI 审计脱敏、CI 契约测试、容器化加固均属亮点），但在「技术脆弱性管理、认证防护、可观测性、集成级验证」四个维度存在成体系的硬差距，尚未达到 ISO/IEC 27001 与 ISO/IEC 5055 的完整要求。**

**总体成熟度（定性）：B-（基本合规、局部差距显著）**

| 维度                        | 结论                             | 关键依据 |
| ------------------------- | ------------------------------ | ---- |
| ISO/IEC 25010 九特性         | 5 项「基本满足」，3 项「部分满足」，1 项「不满足」   | 见 §1 |
| ISO/IEC 27001 附录 A（相关控制项） | 约 40% 达标、35% 部分达标、25% 未达标      | 见 §2 |
| ISO/IEC 5055 四维度          | 四项均有可量化的弱项证据，且**无任何自动化度量工具落地** | 见 §3 |

**三个最紧急的风险（P0）**：

1. **后端依赖栈已过开源支持生命周期且<u>锁定于已知 CVE 版本</u>**<u>（Spring Boot 3.2.5，2024-04 发布），且全仓</u>**<u>没有任何 SCA</u>（软件成分分析）/依赖漏洞扫描**——这是 ISO 27001 A.8.8「技术脆弱性管理」的直接不达标项。
2. **登录接口零速率限制 + 密码最小长度仅 6 位**——`/api/auth/login` 为 `permitAll` 且不经过任何限流（限流服务只挂在 AI 通路上），存在可工程化利用的密码暴力破解风险。
3. **无安全监控与告警体系**：无 Actuator、无指标采集、无集中日志，生产日志级别为 `debug`——对应 ISO 27001 A.8.15/A.8.16 的监控活动缺口。

---

## 1. ISO/IEC 25010:2023 产品质量特性评估

> 采用 2023 版九特性框架（括号内为 2011 版对照名）。评级：**A=满足 / B=基本满足 / C=部分满足 / D=不满足**。

### 1.1 汇总评级表

| # | 质量特性         | 评级    | 一句话结论                                                    |
| - | ------------ | ----- | -------------------------------------------------------- |
| 1 | 功能适合性        | **B** | 功能完备、内容治理状态机强；但接口契约无自动化验证、文档与实现漂移                        |
| 2 | 性能效率         | **C** | 有分散优化实践但无基准测试、无缓存层、RAG 全表扫描、前端存在超大 chunk                 |
| 3 | 兼容性          | **B** | 内部接口一致、CORS 可配置；无 API 版本策略、三前端重复实现同一逻辑                   |
| 4 | 交互能力（易用性）    | **B** | 错误/空/加载态齐备、中文错误提示友好；无无障碍审计、后端 `@Valid` 零使用               |
| 5 | 可靠性          | **C** | 容器化加固与事务边界良好；无监控、无自动备份、无 DB 高可用与容错验证                     |
| 6 | 信息安全         | **C** | 加密与访问控制基线扎实；依赖 EOL、登录防护缺失、无静态安全扫描是硬伤                     |
| 7 | 可维护性         | **B** | 文档与 CI 门禁超平均水准；无 lint、无复杂度度量、零集成测试                       |
| 8 | 灵活性（可移植/可扩展） | **B** | 12-factor 配置、多阶段 Dockerfile；无 IaC、无 CD 自动化、配置缺 fail-fast |
| 9 | 功能安全（Safety） | **B** | AI 内容有审核与溯源、fallback 不落库；LLM 输出无独立于模型的二次过滤               |

### 1.2 功能适合性（B）

**满足项（加分证据）**

- 业务功能完整闭环：五类实体（诗人/诗词/景点/事件/文化条目）+ AI 对话 + AI 赏析 + 学习任务 + 数据大屏。
- **内容治理状态机**是本项目最大的功能正确性保障：`draft → needs_review → approved → published → archived` 白名单流转（`ContentReviewService.java:151`），公开接口强制 `publishedOnly` 子查询过滤，编辑自动退回待审（`ContentGovernanceCleanupService.java:74,91`）——这在「发布即可见」的功能正确性上达到工业级实践。
- 公开端统计口径统一套治理过滤（`countByRegion`、`categoryStats`），避免计数与列表不一致。

**差距与风险**

- **接口契约无自动化验证**：无 OpenAPI schema 对拍测试；`docs/data_interfaces.md` 自述部分过时，`cultural`/`chat` 等接口未覆盖。对照 25010「功能完备性/正确性」，接口行为回归仅靠 10 个源码字符串断言型契约测试兜底。
- **文档-实现漂移已实际发生**：`AGENTS.md:68` 称「admin GET 只需任意登录用户」，实际 `SecurityConfig.java:49` 已收窄为全接口 `hasAuthority("admin")`；`AGENTS.md:74` 称「不校验 user.status」，实际 `SecurityConfig.java:86-88` 已补上 `approved` 校验。漂移方向是"实现更严"，但对功能文档的可信度构成挑战。
- `PoemAnalysisService.CURRENT_VERSION` 变更会触发全量付费重生成，功能演进成本高但已有文档警示（可接受）。

### 1.3 性能效率（C）

**满足项**

- 前端分包策略合理：`display-v2/vite.config.js:21-38` 将 echarts/g6/three 拆为独立 vendor chunk；图片全面 webp；明示性能预算 LCP < 2.5s。
- 已知 N+1 已修复：`PublicSpotController.list` 从逐景点 `selectCount` 改为单次 `IN` + stream 分组。
- `sjg-datav` 用 `ResizeObserver` 量容器而非 `window.innerWidth` 做自适应缩放（`useAutoFit.ts`），避免重排抖动。

**差距与风险**

- **无任何性能基准/压测证据**：无 JMeter/k6 脚本、无 Lighthouse 报告入库、无 CI 性能回归门禁。性能预算仅停留在文档声明。
- **RAG 检索全表扫描**：`RagRetrievalService` 用 `CONCAT(IFNULL(...)) LIKE '%kw%'` 扫 `poet/poem/scenic_spot` 三表（`RagRetrievalService.java:36-41`），前导通配符使索引完全失效；`KnowledgeRetrievalService` 同模式（`:135-221`）。当前数据量（数百条）可容忍，但这是随内容增长线性劣化的结构性瓶颈。
- **`PublicTimelineController` 每朝代 4 次查询且不分页**（已知性能项，文档自记录）。
- 无后端缓存层：仅 `poem_analysis` 表充当 LLM 结果缓存、前端 60s SWR 缓存；公开列表接口每次全量查询。
- 前端 `SpotDetail.vue` 全量引入 echarts（`import * as echarts`），chunk 拆分治标不治本；`chunkSizeWarningLimit: 1500` 本身即「存在 >1.5MB chunk」的证据。
- HikariCP 连接池**零配置**（`application.yml` 无 pool 段，默认 10 连接），大屏 + 三前端并发场景无容量规划依据。

### 1.4 兼容性（B）

- ✅ 三前端统一通过 `/api/public/**` 消费；CORS 域名可配置（`CorsConfig.java:21`）；`VITE_OSS_BUCKET_URL` 切换本地/OSS 媒体基址。
- ⚠️ **同一业务逻辑三处独立实现**：Result 解包在 `display-v2/src/api/index.js`、`admin-frontend/src/api/index.js`、`sjg-datav/src/api/index.ts:6-20` 各写一遍；`getFirstImage/parseImageUrls` 在 admin 四个文件复制 4 份（`PoetList.vue:77,98` 等）。语义漂移一旦发生将造成接口不兼容。
- ⚠️ 无 API 版本化策略（无 `/v1/` 前缀、无兼容性测试、无废弃流程）。对内部单体可接受，但违反 25010 兼容性中的「可演化性」期望。
- ⚠️ `CorsConfig.java:33` 恒定放行 `http://localhost:*`——生产环境同样生效，属于遗留放宽项（低风险，见 §2）。

### 1.5 交互能力 / 易用性（B)

- ✅ 交互基元齐备：`ErrorState`/`SkeletonBlock`/`EmptyState` 全站复用；`prefers-reduced-motion` 兜底（`theme.css`）；外键删除失败给出精准中文提示（`GlobalExceptionHandler.java:21-32`）。
- ✅ admin 端 401/403 统一会话处理、删除二次确认全覆盖（五个列表页）。
- ⚠️ 无无障碍（a11y）审计：无 axe/lighthouse a11y 检查、无键盘导航测试记录。四前端均无自动化可访问性门禁。
- ⚠️ `spring-boot-starter-validation` 在 classpath 但**零个 `@Valid`**（`pom.xml:31`），全部校验手写在 service 层——错误提示质量依赖开发者自觉，且校验逻辑分散。
- ⚠️ admin 端无表单校验框架，`DataTable/FormDialog` 层无统一校验约定（`@Valid` 缺失的下游体现）。

### 1.6 可靠性（C）

**满足项（显著加分）**

- 容器化加固到位：`Dockerfile` 非 root 用户运行、`MaxRAMPercentage=65`、`ExitOnOutOfMemoryError`（快速失败而非僵尸）；`railway.json` 健康检查 + `ON_FAILURE` 重试 3 次。
- 事务边界完整：27 处 `@Transactional` 覆盖全部多表写路径（级联删除、导入、治理状态流转）。
- 数据一致性防守：AI 赏析 fallback 结果**永不落库**（`PoemAnalysisService` 避污染缓存）；`content_review` 唯一约束 `(entity_type, entity_id)`。
- 前端错误降级：display-v2 全站 ErrorState；`AiChatBox` SSE 断流有 error 事件；datav 无 mock 降级（显示 0/—，不欺骗用户）。

**差距与风险**

- **可观测性为零**：无 Spring Actuator、无 Micrometer/metrics、无 APM；健康检查靠业务接口 `/api/public/dynasties` 兼任（`railway.json:8`）。故障发生时无指标、无追踪、无告警，MTTR（平均修复时间）不可控。
- **无自动备份策略证据**：数据库备份是手工 `mysqldump` 快照流程（`docs/local_db_setup.md` 相关），Railway 托管 MySQL 无定期备份配置记录。对应 ISO 27001 A.8.13 缺口。
- **无故障注入/混沌测试**：`mvn test` 零 `@SpringBootTest`（已在 `AGENTS.md:37` 自认），装配层错误（如历史双 `@Autowired` 构造器事件）只能靠人工启动发现——「测试全绿 ≠ 能启动」是可靠性验证的系统性缺口。
- **限流是单实例内存态**：`InMemoryRateLimitService` 重启清零、多实例不共享；且 `server.trusted-proxies` 默认空——生产部署在反代后若未配置 `TRUSTED_PROXIES`，`ClientIpResolver` 会将全部流量归并为反代 IP 单桶，限流退化为全局共享（既误伤又失去防滥用意义）。
- `RuntimeException → 400 + 原样 message`兜底通道（`GlobalExceptionHandler.java:70-75`）：虽然当前 19 处 `throw new RuntimeException` 仅在 Auth/User 两个 service，但该通道无类型隔离——任何新引入的 NPE/IllegalArgument 也会以 400 形式把内部消息透出（且不记录日志），错误语义与可观测性双输。

### 1.7 信息安全（C）—— 本报告重点

**已达标基线（加分项）**

- 密码 BCrypt 哈希（`SecurityConfig.java:70-72`）；注册制审批（`status=pending` 需 admin 放行，`AuthService.java:56`）。
- JWT 使用 jjwt 0.12.5 现行 API，HS256 签名验证（`JwtUtil.java:36-42`）；**每请求校验账号 `approved` 状态**（`SecurityConfig.java:86-88`）——历史"禁用账号 token 仍有效"缺陷已修复。
- 密钥全部环境变量化，仓库零敏感文件提交（`git ls-files` 核查通过）；`.gitignore` 覆盖 `.env`。
- 上传双重白名单（content-type + 扩展名，`OssService.java:31-50,81-92`），对象名 UUID 化。
- AI 审计脱敏规范：**不落原始 IP**，仅存 SHA-256 `client_key_hash`、截断 1000 字符的 query（`AiAuditService.java:21,30,69-77`）。
- CI `permissions: contents: read`（最小权限，`ci.yml:8-9`）。

**差距与风险（按严重度）**

| 级别     | 风险                                                                                                                                                                                      | 证据                                                 | 对标                               |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------- |
| **P0** | 登录/注册零速率限制：`/api/auth/login` permitAll 且不经过 RateLimitService（限流仅挂 `ChatService`/`AiPoemService`/`PoemComparisonService`），配合 6 位最小密码，可在线暴力猜测                                              | `SecurityConfig.java:46`；`AuthService.java:63-87`  | 27001 A.8.5；NIST 800-63B         |
| **P0** | Spring Boot 3.2.5 已出开源支持期，含多个已修复 CVE：CVE-2024-38816/38819（路径遍历/DoS，修于 3.2.9）、CVE-2024-38807（签名伪造，修于 3.2.9）、CVE-2025-22235（端点安全绕过）；**且无任何依赖扫描工具**（无 Dependabot 配置、无 dependency-check 插件） | `pom.xml:9`；`.github/` 仅 `ci.yml`                  | 27001 A.8.8、A.5.19；5055 Security |
| P1     | 密码策略弱：最小 6 位含字母数字（NIST 建议 ≥8；无泄露口令黑名单、无复杂度提升路径）                                                                                                                                         | `AuthService.java:17-18,119-135`                   | NIST 800-63B                     |
| P1     | JWT 会话生命周期：24h 有效期无刷新机制；**改密/角色变更后旧 token 仍有效至过期**（token 无凭据版本 claim）                                                                                                                   | `application.yml:26`；`JwtUtil.java:26-33`          | 27001 A.8.5                      |
| P1     | 生产配置缺陷：`logging.level.com.sjg: debug`；Swagger UI 公开（`/swagger-ui/**`、`/v3/api-docs/**` permitAll）；DB 连接 `useSSL=false` 默认                                                               | `application.yml:8,72`；`SecurityConfig.java:48`    | 27001 A.8.9、A.8.24               |
| P2     | 兜底异常通道可能泄露内部信息（`RuntimeException` 原样透传 message，无专用业务异常类型隔离）                                                                                                                             | `GlobalExceptionHandler.java:70-75`                | 5055 Security（CWE-209）           |
| P2     | SVG 允许上传（`image/svg+xml` + `.svg` 在白名单），SVG 可携带脚本；上传校验无 magic bytes（仅声明类型），200MB 上限无配额                                                                                                  | `OssService.java:33,46,81-92`；`application.yml:15` | 27001 A.8.28；OWASP               |
| P2     | CORS `allowCredentials(true)` + 恒定 `localhost:*` 放行；CSRF 全禁用（对纯 Bearer API 可接受，但应显式文档化论证）                                                                                               | `CorsConfig.java:33,37`；`SecurityConfig.java:43`   | 27001 A.8.9                      |
| P2     | 无 SECURITY.md / 漏洞披露与安全响应流程；无依赖锁定策略（三前端 `overrides` 缺失）                                                                                                                                 | 仓库根目录；三前端 `package.json`                           | 27001 A.5.24-5.26                |
| P2     | LLM 通路无输入/输出内容安全二次过滤（依赖系统提示自身约束与上游模型），prompt injection 面随 RAG 上下文注入存在                                                                                                                   | `ChatService.java:107-118`；`application.yml:50-61` | 25010 Safety；OWASP LLM Top10     |

### 1.8 可维护性（B）

**满足项（显著加分）**

- **文档体系超出同级项目一个量级**：`AGENTS.md`（273 行）含架构、坑位、行为约定；`docs/` 下 90+ 篇计划/规范/评估文档；"勿当 bug 回滚"清单避免误修设计行为。
- **CI 质量门禁成体系**（`ci.yml`）：三前端构建 + 后端 36 个测试类 + 10 个平台契约测试（AI 评测、迁移幂等、来源台账、学习任务、CI 契约）+ 迁移应用测试 + 空白检查。`verify:all` 本地等价复现。
- 模块化良好：后端分层清晰（pub/admin controller 分离）、前端纯函数抽取（`imageCandidates.js`、`learning*.js`）、可视化注册集中（`echartsSetup.ts`）。
- 测试量可观：后端 36 类 / display-v2 40 文件 / 契约测试 10 文件。

**差距与风险（按 ISO 5055 Maintainability 映射）**

- **零 lint/format 工具链**：全仓无 ESLint/Prettier/Checkstyle（无任何 `lint` script）；`sjg-datav` 的 `tsc -b` 是唯一类型关卡。对照 ISO 5055「可维护性度量自动化」为空白。
- **无复杂度/重复度度量**：无 SonarQube/PMD/SpotBugs，循环复杂度、重复率、嵌套深度全部不可见——ISO 5055 的核心要求「可自动化度量的质量」未落地。
- **零集成测试**：无 `@SpringBootTest`、无 Testcontainers；DB 层（21 个 mapper、SQL 语义、迁移正确性）与装配层无自动化验证。`CulturalItemServiceContextTest` 用过 `AnnotationConfigApplicationContext` 做局部装配检查，但覆盖窄。
- **重复代码已知清单**：Result 解包 ×3、`getFirstImage` ×4、两套 RAG 并存、`ChatService` 4 个构造器重载（测试便利 vs 复杂度妥协）。
- 死配置与化石：`mapper-locations` 指向不存在目录（`application.yml:19`）；`isAnime` 命名化石（含义 inkwash）；`deleted` 列全局无 `@TableLogic` 使用（写了会"数据复活"）。文档已警示，但均是无自动化守卫的人工约束。
- 构建可重现性：无 Maven Wrapper（`mvnw` 不存在），依赖本机 Maven；三前端无 `engines` 约束（根 `package.json:21-23` 有 node>=20）。

### 1.9 灵活性 / 可移植性（B）

- ✅ 12-factor 落地：`PORT`、`SPRING_DATASOURCE_*`、`JWT_SECRET`、`LLM_*`、`OSS_*`、`CORS_ALLOWED_ORIGINS` 全环境变量注入；多阶段 Dockerfile 构建（maven → JRE 17 jammy）。
- ✅ 部署路径清晰：Railway（后端+MySQL）+ Sites（三前端静态托管）+ 全链路 HTTPS；`docs/deployment-railway.md` 有完整操作记录。
- ⚠️ 无 docker-compose / IaC，本地依赖手工 MySQL；无 CD 自动化（`deployment-state.json`：`master_updates_do_not_auto_deploy: true`，发布靠手工上传）——存在「验证过的提交 ≠ 线上版本」的漂移风险（文档已自认）。
- ⚠️ 配置无 fail-fast 校验：`JWT_SECRET` 空值时**启动成功**、签发时爆炸（`WeakKeyException`）；`LLM_API_KEY` 缺失仅 WARN。对照 25010 灵活性中的「可安装性」应启动自检。
- ⚠️ `Vite` 四个工程版本各异但无统一约束；`admin-frontend`/`display-v2` 允许 Host `.cpolar.top/.cpolar.cn`（隧道用途，生产构建不含，可接受但应记录）。


### 1.10 功能安全 / AI 内容安全（B）

- ✅ 内容层治理严密：状态机 + 来源溯源（`source_document`/`content_source_link`）+ 发布门禁 + AI 审计，AI 生成身份与原诗来源保持可见（不冒充原始文献），证据检索只使用 published 赏析——对齐「信息可信性」与欧盟 AI 法案式的透明度关切。
- ✅ 边界与拒绝策略写入 system prompt（政治敏感温和回绝、不编造史实）。
- ⚠️ 输出侧无独立于模型的安全过滤（无内容审核 API、无敏感词兜底、无输出结构强校验——JSON 解析失败即 fallback，可接受但被动）。
- ⚠️ AI 评测集（`docs/ai-evaluation-set.json`）存在且入 CI，但未见评测集规模/覆盖度与通过阈值设计文档化（`docs/ai-evaluation.md` 有规范，规模未核查）。

---

## 2. ISO/IEC 27001:2022 附录 A 控制项差距分析（节选相关项）

> 认证级 ISMS 建设（A.5 组织政策全套、A.6 人员、A.7 物理）超出本评估范围；以下聚焦该技术型项目已具备证据链的控制项。状态：✅达标 / ⚠️部分 / ❌未达标。

| 控制项 | 状态 | 证据与差距 |
|---|---|---|
| A.5.15 访问控制 | ✅ | 审批制注册 + 角色门（admin/user）+ 公开接口只读分流 |
| A.5.16 身份管理 | ⚠️ | 有唯一性约束与状态机（pending/rejected/disabled）；无身份生命周期策略文档（离职/长期未用账号处置） |
| A.5.17 认证信息 | ⚠️ | BCrypt ✅；密码策略弱、无轮换策略、无泄露口令黑名单 |
| A.5.19 供应商/供应链安全 | ❌ | 依赖零治理：无 Dependabot、无 SCA、无依赖锁定审计；OSS/Railway/DeepSeek 第三方组件无风险评估记录 |
| A.5.23 云服务使用 | ⚠️ | Railway/阿里云 OSS 使用有文档（`deployment-railway.md`、`oss-access-troubleshooting.md`）；无正式安全评估记录 |
| A.5.24 安全事件管理 | ❌ | 无 SECURITY.md、无披露渠道、无事件响应流程 |
| A.8.2 特权访问 | ⚠️ | `/api/admin/**` 全接口要求 admin ✅；无细粒度 RBAC、无特权操作双人复核 |
| A.8.5 安全认证 | ❌ | **登录无限流/无失败锁定**（P0）；JWT 改密不失效（P1） |
| A.8.8 技术脆弱性管理 | ❌ | 依赖 EOL+CVE 未修；无漏洞扫描（CI 无任何安全步骤）；无渗透测试记录 |
| A.8.9 配置管理 | ⚠️ | 配置环境变量化 ✅；生产 debug 日志、Swagger 公开、`localhost:*` CORS 遗留、无配置基线（hardening 清单） |
| A.8.11 数据脱敏 | ✅ | AI 审计 SHA-256 客户端哈希 + 截断；异常响应已收敛为固定文案（除 RuntimeException 通道） |
| A.8.13 信息备份 | ⚠️ | 手工快照流程存在；无自动定期备份、无恢复演练记录（RTO/RPO 未定义） |
| A.8.15 日志记录 | ⚠️ | 有 AI 审计日志表 + 异常日志；无集中日志收集、无日志防篡改、登录/权限变更等安全事件未纳入审计 |
| A.8.16 监控活动 | ❌ | 无 Actuator/指标/告警；健康检查靠业务接口兼任 |
| A.8.24 密码学使用 | ⚠️ | BCrypt ✅、HS256 ✅、全程 HTTPS（平台提供）✅；DB 链路 `useSSL=false` 默认、无密钥轮换策略 |
| A.8.25 安全开发生命周期 | ⚠️ | CI 门禁强 ✅；但无威胁建模、无 SAST、无依赖审查、无安全需求条目 |
| A.8.28 安全编码 | ⚠️ | 无 SQL 注入（全参数化查询 ✅）、全站 DOMPurify/SFC 默认转义（XSS 防线好）✅；但上传无 magic bytes、异常通道无类型隔离、无静态分析工具 |
| A.8.31 开发/测试/生产隔离 | ⚠️ | 本地库 vs 生产库分离；无独立测试环境（CI 不连 DB 属双刃剑） |
| A.8.32 变更管理 | ⚠️ | Git 流转 + CI ✅；无变更审批记录、无回滚预案文档化（Railway 重部署方式未书面化） |

---

## 3. ISO/IEC 5055 四维度评估（自动化源代码质量度量视角）

> ISO 5055 要求质量以「可自动化度量」的方式保障；本节的实质结论是：**代码本身的弱点密度可控，但度量基础设施为零**。

### 3.1 Security（安全性）

| 检查项 | 结果 | 证据 |
|---|---|---|
| SQL 注入（CWE-89） | ✅ 未发现 | 全参数化：`@Select` 用 `#{}`（`AiAuditLogMapper.java:12-27`）；`inSql` 仅用于常量子查询；`RagRetrievalService` 的 `LIMIT` 拼接源为 `@Value` int（类型不可注入）；`apply(clause, {0})` 为参数绑定 |
| XSS（CWE-79） | ✅ 防线良好 | 三处 `v-html` 全经 DOMPurify（`AiChatBox.vue:162` 等）；admin/datav 零 `v-html`/`dangerouslySetInnerHTML` |
| 硬编码凭证（CWE-798） | ✅ 未发现 | 仓库零密钥提交；`application.yml` 全环境变量占位 |
| 信息泄露响应（CWE-209） | ⚠️ | 兜底 handler 已收敛；`RuntimeException` 通道例外（见 1.6） |
| 依赖漏洞（CWE-1104） | ❌ | Spring Boot 3.2.5 EOL + 已知 CVE；无 SCA |
| 输入验证（CWE-20） | ⚠️ | 白名单上传 ✅；`@Valid` 零使用、无 magic bytes、无请求体大小语义化限制 |
| 认证薄弱（CWE-307） | ❌ | 登录无尝试限制 |

### 3.2 Reliability（可靠性）

| 检查项 | 结果 | 证据 |
|---|---|---|
| 资源泄露（CWE-404） | ✅ | `try-with-resources` 用于流（`OssService.java:104`）；`OSS client` 有 `@PreDestroy` |
| 并发正确性 | ✅/⚠️ | `InMemoryRateLimitService` `synchronized` 保证正确 ✅；但全局锁 + 同步内 O(n) 清理为吞吐瓶颈，高并发退化 |
| 错误吞掉（CWE-390） | ⚠️ | `validateToken` 全异常 catch 返回 false（安全但掩盖诊断）；审计失败仅 WARN（可接受） |
| 未处理异常（CWE-248） | ⚠️ | SSE 流中单 chunk 解析异常静默跳过（`LlmClient`），可能造成答案静默截断 |
| 超时/恢复 | ✅/⚠️ | LLM 有 15s 连接 + 60s 请求超时 ✅；无重试/退避/熔断策略 ⚠️ |

### 3.3 Performance Efficiency（性能效率）

- ❌ **无基准数据**：无任何压测或性能回归证据 → 该维度"不可度量"。
- ⚠️ 结构性问题：RAG 全表 `LIKE`、timeline N+1、无后端缓存、Hikari 默认池、前端存在超 1.5MB chunk。
- ✅ 局部优化：vendor 拆分、webp 素材、SSE 流式（首字延迟低）、分页累加有 `maxPages` 兜底。

### 3.4 Maintainability（可维护性）

- ✅ 注释/文档密度高；命名规范（后端）；契约测试锁定治理行为（变更前先读期望）——「防御性文档化」是最大亮点。
- ⚠️ 重复代码（解包 ×3、图片解析 ×4、构造器重载）；复杂度无度量；死配置残留；命名化石。
- ❌ 工具链空白：无 lint/format/复杂度过门槛/覆盖率门槛。display-v2 有 `--experimental-test-coverage` 但**未设置阈值**，无回归拦截力。

---

## 4. 风险登记册（按优先级）

### P0 —— 建议 2 周内处置

| # | 风险 | 处置建议 | 验收标准 |
|---|---|---|---|
| 1 | 依赖 EOL + CVE + 无 SCA | ① Spring Boot 升到 3.2.12（同系列最低修复线）或直接评估 3.5.x/4.x（注意 `mvn test` 全绿后仍需真实启动验证）；② 启用 Dependabot（Maven + npm 4 个 manifest）；③ CI 增加 OWASP dependency-check 或 `npm audit --audit-level=high` 门禁 | CI 出现依赖扫描步骤；高危及上 CVE 数为 0 或已豁免登记 |
| 2 | 登录暴破 | 复用 `RateLimitService` 给 `/api/auth/login`、`/api/auth/register` 加 IP+用户名维度限流（如 5 次/分钟 + 指数退避）；失败计数入日志 | 单 IP 第 6 次尝试被拒；契约测试锁定 |

### P1 —— 建议 1-2 个月处置

| # | 风险 | 处置建议 |
|---|---|---|
| 3 | 密码策略弱 | 最小长度提升至 8-12；引入常见弱口令黑名单（注册/改密时校验）；`schema.sql` 种子账号注释与实测口令不一致问题一并修正（改哈希或改注释，杜绝"注释误导"） |
| 4 | JWT 生命周期 | token 增加凭据版本 claim（改密/角色变更时自增），filter 校验版本；或缩短有效期 + 刷新机制 |
| 5 | 生产配置加固 | `logging.level.com.sjg: info`（debug 仅本地 profile）；Swagger 仅登录可访问或生产关闭；DB 连接启用 TLS（`useSSL=true` 或依赖 Railway 内网并记录论证） |
| 6 | 无监控告警 | 引入 Actuator（仅暴露 health/info 且鉴权隔离）+ Micrometer；关键指标：登录失败率、AI 错误率（已有 `ai_audit_log` 可出看板）、5xx 率、连接池饱和度 |
| 7 | 备份策略 | Railway MySQL 定期导出（cron/平台能力）+ 备份到 OSS 异地；定义 RTO/RPO 并做一次恢复演练记录 |
| 8 | 集成测试缺失 | 引入 Testcontainers，覆盖 3-5 条关键链路（登录→审批→发布→公开可见；AI 赏析生成→审核→检索过滤） |

### P2 —— 持续改进

| # | 风险 | 处置建议 |
|---|---|---|
| 9 | 前端重复代码 | 抽 `shared/` 或 npm workspace：`unwrapResult`、`parseImageUrls` 单点化（4 处→1 处） |
| 10 | 工具链空白 | 引入 ESLint（flat config）+ Prettier + 后端 Checkstyle/SpotBugs；display-v2 覆盖率阈值化（如 lines ≥ 60% 起步） |
| 11 | 无复杂度度量 | 接入 SonarQube（Community）或 PMD；设定新代码质量门槛（duplicated lines < 3%、复杂度上限） |
| 12 | 上传安全 | magic bytes 校验（如 Tika/file signature）；SVG 改为强制下载头或禁用；上传配额（用户/天） |
| 13 | 异常通道治理 | 引入 `BusinessException` 类型域隔离，`RuntimeException` 兜底回落 500 + 固定文案 + log |
| 14 | API 版本化 | `/api/public` 增加版本协商或冻结策略；`docs/data_interfaces.md` 与 OpenAPI 从代码生成 |
| 15 | RAG 性能 | 中文检索改 MySQL FULLTEXT（ngram parser）或引入独立索引；timeline 查询合批 |
| 16 | 可移植性 | 补 Maven Wrapper；docker-compose 本地一键起库；CD 自动化（GitHub Actions → Railway/Sites） |
| 17 | 文档同步 | AGENTS.md 中「GET 只需登录」等已漂移条目更新；建立"实现变更 → 文档检查"的 PR 清单 |

---

## 5. 改进路线图（三阶段）

```text
阶段一「止血」（2 周）    P0：依赖升级 + SCA 门禁 + 登录限流
阶段二「补短板」（1-2 月）P1：监控/备份/集成测试/生产配置 + a11y 基础检查
阶段三「达标化」（持续）  P2：工具链（lint/复杂度/覆盖率）+ 去重 + API 版本化 + 性能基准
```

**阶段一验收**：CI 含依赖扫描且高危清零；登录限流有测试锁定；Spring Boot 升级后 `mvn test` + 真实启动 + 三条前端构建全绿。
**阶段二验收**：Actuator 指标可查；近 7 天备份存在且恢复演练成功一次；Testcontainers 集成测试 ≥3 条链路绿；生产日志级别与 Swagger 暴露面复核。
**阶段三验收**：lint/format 入 CI；覆盖率门槛生效；重复代码清单归零；ISO 5055 四维度首次出现可自动生成的度量报告。

---

## 6. 结论

SJG 平台在**内容可信治理（审核状态机+溯源）、AI 安全审计（脱敏）、工程文档与 CI 契约测试**三个方面的实践已经超出同规模项目水平，构成其 ISO/IEC 25010「功能适合性」与「可维护性」的部分高分项。但对照 ISO/IEC 27001 与 ISO/IEC 5055 的要求，其差距集中且明确：

1. **技术脆弱性管理完全缺失**（依赖 EOL、无扫描、无披露流程）——ISO 27001 A.8.8 / A.5.19 结构性不达标；
2. **认证防护与监控告警薄弱**（登录无限流、无指标无告警无备份）——A.8.5 / A.8.13 / A.8.16 不达标；
3. **验证完备性不足**（零集成测试、零覆盖率门槛、零复杂度度量）——ISO/IEC 5055 的「可自动化度量」要求未落地。

上述差距的修复路径清晰、成本可控（升级+加门禁为主，无需架构重构），按本报告路线图执行后，平台即可从「B-（基本合规）」进入「A-（接近达标）」区间。

---

## 附录 A：评估证据索引（关键文件）

| 领域 | 文件 |
|---|---|
| 访问控制 | `backend/src/main/java/com/sjg/config/SecurityConfig.java`（46-51, 86-88） |
| 认证 | `backend/src/main/java/com/sjg/service/AuthService.java`（17-18, 63-135）、`util/JwtUtil.java` |
| 限流 | `service/InMemoryRateLimitService.java`、`service/ClientIpResolver.java`（使用面：仅 AI 三服务） |
| 异常处理 | `config/GlobalExceptionHandler.java`（70-75） |
| CORS | `config/CorsConfig.java`（33, 37） |
| 上传 | `controller/admin/UploadController.java`、`service/OssService.java`（31-50, 81-92） |
| 审计 | `service/AiAuditService.java`（21, 30, 69-77） |
| 配置 | `backend/src/main/resources/application.yml`（8, 15, 19, 26, 72） |
| 依赖 | `backend/pom.xml`（9） |
| CI/质量门禁 | `.github/workflows/ci.yml`、`scripts/verify-all.sh`、根 `package.json` |
| 部署加固 | `backend/Dockerfile`、`backend/railway.json`、`docs/deployment-railway.md` |
| 数据库约束 | `backend/src/main/resources/schema.sql`（110-112）、`db/migration/V12/V17`（索引） |
| 前端安全 | `display-v2/src/components/AiChatBox.vue`（147, 162）、`admin-frontend/src/api/index.js` |

## 附录 B：评估局限

- 本评估为**静态审查**，未执行渗透测试、未做动态扫描（DAST）、未运行完整 CI；对运行时行为（如高并发下的限流失效模式）的结论基于代码推断。
- ISO/IEC 27001 部分仅对照附录 A 技术控制项，不涵盖组织级 ISMS 要求（方针、职责、内审、管理评审）。
- 评分为定性映射（A-D），用于内部差距定位，不作对外合规声明使用。
