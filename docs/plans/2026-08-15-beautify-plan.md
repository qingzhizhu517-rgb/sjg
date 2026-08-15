# 前端美化方案对照表（任务 5）

> 依据 `docs/ai-fix-prompts-2.md` 任务 5 + `japanese-minimal` skill 验收清单。本表为提案，待确认后分批实现（每批独立 commit + build/test 验证）。
> 双主题原则：**inkwash 强化日式极简（米白、衬线、朱红唯一点缀、1px 细线、留白）**；**real 保持现代实景风，仅做克制收敛**（去多余阴影/统一间距），不动其信息架构。

## 对照表

| # | 组件/路由 | 现状（2026-08 实测） | 目标改动 | 依据 |
|---|---|---|---|---|
| 1 | PoetList 卡墙 `.poet-card-wrap` | `card hover-lift` 阴影+上浮，圆角卡片风 | inkwash: 改 1px 细线描边+大留白，hover 仅 2px 轻移+描边加深；real: 阴影减弱 | skill 禁阴影/圆角卡片；留白 |
| 2 | DynastyRail `.rail__chip` | 圆角 4px + 阴影 + 高饱和 active 底色 | 改方形/2px 圆角、1px 细线、active 用朱红描边+浅朱红底（inkwash），real 维持但去阴影 | 细线分隔；朱红唯一点缀 |
| 3 | 五类列表卡（FestivalList/FoodOperaList/LiteratureList/CraftWorkshop） | 阴影+圆角卡片，风格互不一致 | 统一「细线+留白+印章角标」卡片语言；印章字复用 CULTURAL_CATEGORIES（节/诗/艺/文/味） | 印章系统化；细线+留白 |
| 4 | CulturalDetail | 已有印章头，但区块密度高 | 区块间距 ≥80px；`cd-text` 行高 2.0；分隔改 1px `--line` 细线 | 留白「間」；细线分隔 |
| 5 | PoemDetail 诗词正文 | 横排默认 | 桌面端加「竖排阅读」切换（`writing-mode: vertical-rl`），落款竖排小字；默认仍横排 | 竖排为可选高级手法 |
| 6 | EmptyState（全局） | 纯文字+按钮 | 加单笔水墨 SVG（本地内联，不新增素材）+ 一句衬线文案 | 空态水墨 hint |
| 7 | MapView 长卷（已部分处理） | 印章已统一朱红；木轴金色渐变保留 | 金色渐变属卷轴器物装饰，保留；四周留白加大 | 器物感装饰可保留 |
| 8 | 首页五类入口（culturalCategories 注册表驱动处） | ready 标志过时、入口样式零散 | 修正 ready；入口统一印章按钮组（见任务 2 B3） | 与任务 2 合并实施 |
| 9 | 全局间距/字距 | 区块间距普遍 40-64px | 内容区块间距提至 80px+（inkwash 优先）；标题字距 `0.05em` | 留白 ≥96px 精神（按页适配） |
| 10 | 动效 | 多处长 transition/上浮 | 梳理清单：保留 scroll 叙事、入场 reveal、河流流动；移除 hover 大位移与多余弹跳 | 动效克制清单 |

## 创新建议（已在 ai-fix-prompts-2.md 任务 5 列出，此处落为待办批次）

- 九城卷轴导航（任务 3 已实现快捷导航，待城市文化页上线后联动跳转 `/cities/:region`）
- 一城一册 CityCulture 五格册页（任务 2 B2）
- 印章系统化（本表 #3/#4）
- 诗词竖排模式（本表 #5）
- 空态水墨 SVG（本表 #6）

## 实施批次

| 批 | 内容 | 依赖 |
|---|---|---|
| A1 | #1 #2 #3 列表类卡片细线化（inkwash 先行，real 减阴影） | 无 |
| A2 | #4 #6 详情间距/空态水墨 SVG | A1 |
| A3 | #5 竖排阅读模式 | 无 |
| A4 | #9 #10 间距字距统一 + 动效梳理 | A1-A3 |

## 验收

- inkwash 通过 japanese-minimal 清单：衬线标题、留白、朱红 ≤2 处、无渐变阴影（器物装饰除外）
- real 主题无回归；build + test:unit 全过