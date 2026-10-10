# 城市册页改版验收

- 用户授权：2026-10-10，认可“济南竖幅新画 + 一主三辅”方案并要求生成配图与推进实施。
- 五张独立生成图已保存项目 public/media/inkwash/city-experiences/，WebP 合计614692字节；两个不透明山水画、三个真实 Alpha 小景。提示词、尺寸与校验和见同目录 manifest.json；未调用旧积分接口。
- 主画为1024×1536，主体验横幅1024×683，三个小景512×512。浏览器中全部成功加载，透明边缘在暖纸底上正常融合。
- 前端全量163项测试通过、构建通过、git diff --check通过；规格与代码质量独立审查PASS。新增10项行为测试涵盖入口URL/preview、城市筛选及旧响应保护、图谱城市与朝代筛选为空后清除恢复、原始错误/空态。
- 本地实际浏览器使用线上公开API，济南无已发布景点时清晰展示“待审核发布”，没有自动回填虚构景点。1440px桌面和390px手机无横向溢出；手机体验单列；五张图片加载成功；Tab焦点可见，2px轮廓；reduced-motion 下 transition 为0s。
- 名士入口实际跳转 /poets?region=济南 并展示当前城市提示；经典景点链接使用本页真实锚点，保留查询参数。
- 浏览器截图保存在 Git 忽略的 .local/city-desktop-final.png、.local/city-mobile-top-final.png、.local/city-mobile-experience-final.png。截图原件供本地验收，不作为长期应用依赖。
- 当前改动只影响展示站，后端和数据库审核状态保持原有结果；线上发布结果另行记录于 deployment-state.json。
