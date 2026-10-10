# 城市体验区水墨配图

生成日期：2026-10-10。用户已授权生成并用于城市册页。五张图均使用 Codex 内置 `imagegen` 从零生成，未调用旧 WorkBuddy 积分管线或外部图像 API。

| 文件 | 用途 | 网页展示 |
| --- | --- | --- |
| jinan-portrait-v1.webp | 济南城市页侧栏，大明湖柳岸意象 | 2:3竖幅 |
| jinan-springs-v1.webp | 济南主推荐，泉畔漫游意象 | 横幅 |
| jinan-scholars-v1.webp | 名士寻踪，书案卷轴 | 透明小景 |
| jinan-poetry-v1.webp | 湖山诗词，荷花卷轴 | 透明小景 |
| jinan-oldtown-v1.webp | 老城风物，街巷水渠 | 透明小景 |

图片用于视觉表达，不作为真实地理图、人物肖像或古迹复原证据。网页图注标明“AI生成 · 济南山水意象”；画内无文字与题诗。只在济南页使用这些资产，其他城市保留自身画面和独立矢量符号。

原始 PNG 保留在生成器返回目录及工作区 `.local/generated/city-experiences/`（不提交）。生产 WebP 通过 `cwebp -q 82 -m 6 -alpha_q 100 -resize <width> 0` 编码，只缩放与编码，不做生成式重绘；主画和横幅宽1024px，小景宽512px，保留真实 Alpha。环境 ffmpeg 缺少 libwebp 编码器，因此采用现有 cwebp。

`manifest.json` 保存完整提示词、原稿文件名、校验和、尺寸、最终文件体积和生成方式。替换时保留版本化命名，更新页面配置、来源与清单。五张图合计不超过1MB；必须在暖纸底上检查透明边缘及390px移动视图。
