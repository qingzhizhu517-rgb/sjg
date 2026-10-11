# 统一合并部署验收

应用版本为 `752604f289ac89572ad5e3603cbf6026f9c838ff`，已合并并推送 master。三个 Sites 仍 owner-private，原项目/域名保持一致；发布工具修复与验收文档的后续提交不改变这次应用版本。

| 服务 | 状态 | 部署/版本 |
| --- | --- | --- |
| MySQL | 原业务数据保留，TLS身份校验通过，V35/V36完成 | da89eb30-be7e-44d6-a5f2-0f53d3ca2d8a |
| backend | SUCCESS，prod，health UP，SHA匹配 | f6eaf91c-75c7-4fda-a540-0af6dd888146 |
| sjg-datav | succeeded，私有，SHA匹配 | appgdep_6acbb9fc3fe88191ba04c49663901996 |
| admin-frontend | succeeded，私有，SHA匹配 | appgdep_6acbbb2df1148191ae246ab6235cbab1 |
| display-v2 | succeeded，私有，SHA匹配 | appgdep_6acbbd39bbc88191945642909455b4c9 |

统一配置与操作步骤见 [部署说明](unified-deployment.md)，无密钥平台回执见 [部署状态](deployment-state.json)。

## 实际证据

- 生产库备份SHA-256为 `1d348bdc04a6ab2a565540a4561c1da2670ff7e26ea4df69d622fbe7384dd4d8`，28张表恢复到隔离MySQL后记录数全部匹配，原始备份仅在忽略的私有目录。
- MySQL使用私网主机名SAN证书，Python与Java实际连接验证通过；后端强制VERIFY_IDENTITY。证书保存在卷内独立700目录，过期时间：`notAfter=Oct 11 16:16:32 2027 GMT`，应在过期前续期并同步公开CA。
- Railway原生IaC实际配置包含pre-deploy与180秒超时；日志明确记录V35/V36应用成功。后端版本接口与Actuator匹配，不用旧实例的健康响应替代新部署验收。
- 三前端经Sites官方helper独立安装/构建、源码推送与原生私有发布，三份版本标记同SHA；HTML引用及合计10个已编译入口资源与本地产物逐字节匹配。
- 三个CORS预检通过，匿名后台401；完整统一门禁再次退出0：188单元/MVC、5真实MySQL集成、250展示测试、8发布测试、三前端构建、SCA与静态分析、四页axe通过。
- 应用版本的[远端完整CI](https://github.com/qingzhizhu517-rgb/sjg/actions/runs/38154731847)已成功；发布工具的后续修复在本地完整门禁再次验证。

## 发布流程修复

CLI上传与有效配置是两条链路：本次发现隐式Config-as-Code没有进入有效部署，因此工具改为原生IaC导入、限定后端字段的plan/apply、再核验实际pre-deploy/health配置；测试同时覆盖对象return与SDK的project-return格式。上传从backend快照目录执行。journal加入写锁、原子替换和快照校验，过期写入不能覆盖另一服务回执。

后台源码推送曾返回HTTP500；沿用已验证本地提交与构建包恢复推送，没有强推或重复创建站点。应用依赖按MySQL→迁移→后端→大屏/后台→主站完成。

## 保留边界与清理

旧JWT需重新登录，存量密码未自动更改。没有重放V31等素材迁移或批量发布内容，也未启用付费订阅。LLM仍未配置，OSS真实上传、私有站点登录后的DOM/Canvas、定时异地备份与告警送达未在此轮验收。

临时云维护服务已删除，临时SSH授权已撤销并清理生成的密钥文件。用于恢复演练的本地 `sjg-release-restore-20261012` 容器已停止；删除被本机PreToolUse保护钩子拒绝，未换用其他机制绕过，需要用户从Docker界面手动清理。它不影响线上服务。

用户原始评估报告保存在主目录 `.local/iso-input/2026-10-11-iso-standards-compliance-assessment.original.md`；用户 `.workbuddy/memory/2026-10-11.md` 保持未跟踪且未提交。
