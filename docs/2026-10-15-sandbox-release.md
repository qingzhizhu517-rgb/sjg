# 2026-10-15 微缩山河沙盘发布

线上入口：https://qilu.aohs.top/river-sandbox

## 发布范围

- 应用提交：`6ba4290b6e71fc189a4a22fa44f72e23ccc8e5e3`，已合入并推送 `master`。
- 本次仅发布 `display-v2`：微缩地形、海岸与金色台座、实例化植被及城市、可编辑场景、天气、九城巡游和移动端适配。
- 后端、管理端、数据大屏继续运行已验证的 `d336636892bc0696eb669ad7dc93f9152795b3c5`。与该版本相比，这三个工程及 `shared` 没有源码差异；本次不涉及数据库迁移或内容发布。
- 地形、山体和楼阁为艺术化表达，不是 DEM 测绘或历史建筑复原。

## 发布凭据

| 项目 | 值 |
| --- | --- |
| Sites 项目 | `appgprj_6aca26e375b081919acfa874a379028d` |
| 版本号 | 12 |
| 源码提交 | `8105b61b78278196ee93d73417b519b75fe783e6` |
| 版本 ID | `appgprj_6aca26e375b081919acfa874a379028d~appgver_0afff43392e48191b3e5b0ed1d990ce7` |
| 部署 ID | `appgdep_6ad0c35891588191ab0b3ad765df2522` |
| 部署结果 | `succeeded`，2026-10-15T12:13:23Z |
| 默认域名 | https://qilu-wenmai-qzzhu.noisyamber1.chatgpt.site |
| 访问权限 | 保持 public |

使用仓库 `release prepare` 提取已提交的不可变源码，保留站点身份配置；按既有发布代码迁移本地 shared 依赖路径，写入公开构建环境和版本标记。Sites source helper 完成生产构建、源码推送和打包，随后保存版本并发布。本次不运行整栈发布流水线，也没有修改其后端同版本门禁。

## 验证结果

- Java 17 下 `npm run verify:all` 全部通过：305 个展示端测试、70.43% 行覆盖率、三前端构建、192 个后端单元/MVC 测试、7 个真实 MySQL 集成测试，以及安全扫描、静态质量检查与五页面无障碍检查。
- [应用提交的 GitHub CI](https://github.com/qingzhizhu517-rgb/sjg/actions/runs/38732301001) 已完成，结果为 success。
- 正式域名 `/deployment-info.json` 返回本次应用 SHA；沙盘 JS/CSS、Three.js 及四个入口依赖共 7 项资源 SHA-256 与生产构建一致。
- `/river-sandbox` HTTP 200。HTML 包含托管平台追加的 Cloudflare challenge 脚本；去除这一已识别的注入后，应用入口与构建文件一致。
- 后端健康为 UP；九城公开接口 HTTP 200，允许来源精确匹配 `https://qilu.aohs.top`。
- 发布前已完成本地真实浏览器桌面/移动端交互与巡游验证。发布后浏览器任务空间返回用户接管硬停止，本轮未重新接管，也未宣称完成线上 DOM/视觉验收。

本地详细日志、资源校验结果及发布归档保留在 `.local/releases/6ba4290b6e71fc189a4a22fa44f72e23ccc8e5e3/`，未提交构建产物或凭据。

## 回滚

如需回滚展示站，重新部署上一已保存版本 `appgprj_6aca26e375b081919acfa874a379028d~appgver_6c23be7c91f8819186e52a542320314f`（版本 11），保留公开权限及域名。回滚不涉及数据库或其他服务，并须同步更新 `deployment-state.json`。
