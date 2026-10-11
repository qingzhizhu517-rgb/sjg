# Railway + Sites 统一发布执行计划

**Goal:** 合并当前整改代码，用同一仓库版本更新已有 MySQL/后端/三个 Sites 前端，保留域名与私有访问范围。
**Architecture:** `ops/release.json` 单点声明目标与依赖；发布工具只从干净已提交版本准备快照，所有产物携带仓库SHA。MySQL备份与检查后，Railway pre-deploy执行受限幂等迁移，后端健康和SHA匹配后才放行前端；通过Sites官方helper同步源与打包，并用原生工具发布。部分失败写入journal，可恢复，绝不把多平台发布声称为原子事务。
**Tech Stack:** Node24、Java17、Maven Wrapper3.9.16、Railway CLI5.64.2、Sites官方工具、MySQL。

- [ ] 创建统一配置、发布阶段与回归测试；统一前端公开变量，独立站点内打包shared，固定SHA和产物记录。
- [ ] 添加后端公开版本标记与部署前迁移入口，迁移持锁/校验和/备份确认，失败停止发布；更新Docker与Railway配置。
- [ ] 核对已有MySQL健康/TLS，备份实际库；不导入schema、不批量发布内容、不启动付费LLM。
- [ ] 运行完整门禁；提交已授权部署范围并安全合并master，保留用户其他文件。
- [ ] 更新后端生产配置与部署，等待平台SUCCESS、HTTP健康和新SHA；再顺序发布大屏/后台/主站。
- [ ] 验证三个站点版本、API/CORS/匿名后台拒绝，记录真实部署ID；更新步骤、回滚与未验收项。

用户已选择保留 Railway + Sites。部署授权来自本次“合并部署”请求；不重复要求方案批准。
