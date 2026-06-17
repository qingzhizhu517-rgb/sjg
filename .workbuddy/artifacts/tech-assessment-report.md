# SJG 数字人文平台 — 技术评估与改进报告

**评估日期**: 2026-06-17 | **评估人**: 高级开发工程师 (吴八哥)  
**审查范围**: backend/ + admin-frontend/ + display-frontend/ + display-v2/ + display-v3/  
**审查文件数**: 120+ 源文件

---

## 一、总体评估

| 维度 | 后端 (Spring Boot) | 管理端 (Vue 3) | 展示端 (Vue 3/Next.js) |
|------|-------------------|----------------|----------------------|
| 架构设计 | ⚠️ 中等偏下 | ⚠️ 中等 | ⚠️ 中等 (v3 较好) |
| 安全性 | 🔴 严重 | 🔴 严重 | 🔴 严重 |
| 代码质量 | ⚠️ 中等 | ⚠️ 中等 | ⚠️ 中等偏下 |
| 可维护性 | ⚠️ 中等 | ❌ 偏下 | ❌ 偏下 |
| 性能 | ✅ 良好 | ✅ 良好 | ⚠️ 中等 |

> 整体评价：代码能跑，但存在多个必须在投产前修复的安全/架构问题。三次迭代产生了大量代码重复，缺乏统一的标准和最佳实践。

---

## 二、🔴 严重问题 (必须立即修复)

### 2.1 安全漏洞

| ID | 问题 | 影响范围 | 风险 |
|----|------|---------|------|
| SEC-01 | **JWT 密钥使用弱默认值** `sjg-secret-key...` 写在 application.yml 中 | backend | 攻击者可伪造 Token |
| SEC-02 | **数据库密码默认值 `123456`**，数据库 IP `47.104.207.58` 直接暴露 | backend | 数据库可被直接攻击 |
| SEC-03 | **高德地图 API Key + 安全密钥硬编码在前端源码** (AmapInteractiveMap.vue:45-49) | display-frontend | Key 泄露，配额被盗用 |
| SEC-04 | **Token 存储在 localStorage** 无 httpOnly 保护 | admin-frontend | XSS 可窃取 Token |
| SEC-05 | **CORS 配置 `allowedOriginPattern("*")` + `allowCredentials(true)`** | backend | 跨域攻击大门敞开 |
| SEC-06 | **异常消息直接暴露给客户端** `e.getMessage()` | backend | 信息泄露 (SQL/路径/堆栈) |
| SEC-07 | **所有表单无前端输入校验和 XSS 净化** | admin-frontend | 恶意输入可直通后端 |

### 2.2 架构缺陷

| ID | 问题 | 影响 |
|----|------|------|
| ARC-01 | Public 控制器直接注入 Mapper，绕过 Service 层 | 分层架构瓦解 |
| ARC-02 | Entity 类直接作为 API 入参 (@RequestBody) | 客户端可注入 createdAt/updatedAt |
| ARC-03 | 所有 DTO 无 Bean Validation 注解 (@NotBlank, @Size) | 无效数据进入数据库 |
| ARC-04 | 全局异常处理不完整 (缺少 7+ 种常见异常处理器) | 异常响应不友好 |

### 2.3 代码重复 (灾难级)

| ID | 问题 | 详情 |
|----|------|------|
| DUP-01 | **App.vue 在 display-frontend 和 display-v2 之间 100% 重复 (845行)** | 任何修改都要改两处 |
| DUP-02 | `mockDetailData.js` 在 3 个版本中重复 (~300行) | 数据不一致风险 |
| DUP-03 | 主题 CSS 变量在 6 个文件中重复定义 | 主题维护噩梦 |
| DUP-04 | `getFirstImage()` / `parseImageUrls()` 在 admin 3 个视图中重复 | 应提取为工具函数 |
| DUP-05 | CRUD 模式 (openAdd/openEdit/handleSubmit/handleDelete) 在 3+ 个视图中重复 | 应使用 composable |

---

## 三、⚠️ 重要问题 (短期需修复)

### 3.1 后端

- **所有 Service 零日志记录** — 无操作审计，问题排查困难
- **业务异常统一使用 RuntimeException** — 无法区分错误类型
- **Pinia 已安装但完全未使用** — 用户状态通过 localStorage 零散管理
- **更新操作不检查记录是否存在** (Poem/Spot/Event Service)
- **OSS 客户端无超时/连接池配置**
- **无环境配置隔离** (只有单一的 application.yml)

### 3.2 管理端

- **Element Plus Icons 全局注册** — 打包体积膨胀，数百个无用图标
- **Google Fonts 外部加载** — 中国境内可能加载失败导致 FOIT
- **PoemList 一次性加载 1000 条诗人** 用于下拉 — 应改用远程搜索
- **多个 Promise 无 .catch()** — 错误静默丢失

### 3.3 展示端

- **display-v2 移除了 Pinia 但保留了 stores/theme.js 死代码** — 可能运行时报错
- **display-v3 完全没有 API 集成** — 仅使用模拟数据，非完整实现
- **地图页 `size=1000` 请求所有景点** — 无分页
- **图片无懒加载/WebP/srcset** — 首屏加载慢
- **App.vue 承担过多职责** (~845行，Header/Nav/Footer 全部内联)

---

## 四、📋 改进路线图

### 第一阶段：安全修复 (本周)

```
[ ] SEC-01: 移除 JWT 默认密钥 → 强制环境变量 JWT_SECRET，使用 256-bit 随机密钥
[ ] SEC-02: 数据库密码 → 强制环境变量，使用内网地址，开启 SSL
[ ] SEC-03: 高德地图 Key → 环境变量注入，或后端代理
[ ] SEC-04: Token → 迁移至 httpOnly Cookie
[ ] SEC-05: CORS → 限定具体域名白名单
[ ] SEC-06: 异常处理 → 生产环境不暴露 e.getMessage()
```

### 第二阶段：架构加固 (下周)

```
[ ] ARC-01: Public Controller → 创建 PublicService 封装聚合逻辑
[ ] ARC-02: Entity API 入参 → 为每个实体创建独立的 CreateDTO / UpdateDTO
[ ] ARC-03: DTO Validation → 所有 DTO 添加 @NotBlank/@Size/@Pattern 注解
[ ] 为所有 Service 添加 SLF4J 日志
[ ] 创建自定义异常体系 (BusinessException / NotFoundException)
```

### 第三阶段：代码质量提升 (两周)

```
[ ] 统一三个前端版本 → 以 display-v3 架构为基础，合一为单个 display-frontend
[ ] 提取共用代码 → utils/ composables/ 消除重复
[ ] 添加 Pinia Store → 集中管理 auth state 和 theme state
[ ] 配置环境隔离 → application-dev.yml / application-prod.yml
[ ] 前端表单统一添加 Element Plus 表单验证
[ ] 图片优化 → 懒加载 + WebP + srcset
```

### 第四阶段：团队规范建立 (持续)

```
[ ] 制定团队 Code Review 检查清单
[ ] 建立 Git 分支规范 (feature/ fix/ release/)
[ ] 引入 ESLint + Prettier 统一代码风格
[ ] 引入 TypeScript (至少在新模块中)
[ ] 建立 API 接口文档 (Swagger/OpenAPI)
[ ] 建立前端组件文档 (Storybook，可选)
```

---

## 五、团队技术提升建议

### 5.1 即刻可以做的

1. **Code Review 机制**：每次 PR 必须至少一人 Review，关注安全、架构、重复代码
2. **安全检查清单**：每次提交前自查：敏感信息是否硬编码？输入是否校验？异常是否安全？
3. **代码复用意识**：发现重复代码立即提取为公共函数/composable

### 5.2 需要学习的

1. **Spring Boot 最佳实践**：分层架构、全局异常处理、Bean Validation、环境配置分离
2. **Vue 3 最佳实践**：Composables 复用逻辑、Pinia 状态管理、组件拆分原则
3. **前端安全基础**：XSS 防护、CSRF 防护、Token 存储方案

### 5.3 推荐学习资源

- Spring Boot: 官方文档 + Baeldung 教程
- Vue 3: Vue.js 官方文档 (Composition API 章节)
- 安全: OWASP Top 10 Web 安全风险

---

## 附录：各模块关键指标

| 指标 | backend | admin-frontend | display-frontend | display-v3 |
|------|---------|---------------|------------------|------------|
| 总文件数 | 43 | 16 | 22 | 17 |
| CRITICAL 问题 | 3 | 3 | 1 | 1 |
| HIGH 问题 | 11 | 5 | 5 | 2 |
| 代码重复行数 | ~50 | ~120 | ~1200+ | ~300 |

> **结论**：项目基础架构合理，核心功能完整。当前最大风险是安全隐患和代码重复。按照上述路线图逐步推进，2-4 周内可将代码质量提升到生产级别。
