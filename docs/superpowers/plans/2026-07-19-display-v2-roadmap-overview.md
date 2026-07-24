# display-v2 齐鲁文化扩容 — 实施计划总览

> 基于路线图 `2026-07-19-display-v2-next-phase-roadmap.md` 的8个方向实施计划。
> 日期: 2026-07-23
> 状态: 计划已完成, 待执行

---

## 计划清单

### P0 基线与数据卫生

| # | 方向 | 计划文件 | 状态 |
|---|---|---|---|
| 1 | 诗人信息: 分层展示 + 完整度治理 | `2026-07-19-poet-tiering-and-data-cleanup.md` | ✅ 已有 |
| 2 | 前端整体美观与布局 | `2026-07-19-design-token-theme-consolidation.md` | ✅ 已有 |

### P1 收尾在途

| # | 方向 | 计划文件 | 状态 |
|---|---|---|---|
| 7 | 关系图谱优化升级 | `2026-07-19-poet-relation-graph-phase1.md` | ✅ 已有 |
| 3 | 首页黄河意境 | `2026-07-19-yellow-river-flowing-light.md` | ✅ 已有 |

### P2 新增能力

| # | 方向 | 计划文件 | 状态 |
|---|---|---|---|
| 4 | 诗词页 AI 分析 | `2026-07-19-poem-ai-analysis.md` | ✅ 新建 |
| 6 | 数字化可视面板 | `2026-07-19-dashboard-visualization.md` | ✅ 新建 |
| 5 | AI 写诗渲染模块 | `2026-07-19-poem-ink-rendering.md` | ✅ 新建 |

### P3 拓展(数据先行)

| # | 方向 | 计划文件 | 状态 |
|---|---|---|---|
| 8 | 拓展业务(民俗等) | `2026-07-19-culture-expansion.md` | ✅ 新建 |

---

## 依赖关系

```
P0 #1 分层+清洗 ──► P1 #7 关系图谱 ──► P2 #4 AI赏析卡
                                          │
P0 #2 design token ──► P1 #3 黄河流光 ──► P2 #6 /dashboard
                                          │
                                          └──► P2 #5 落墨渲染
                                                  │
                                                  └──► P3 #8 culture 抽象
```

## 长线并行工作(跨分期持续)

1. **水墨头像 AI 生成补全**: 126 位, 走 `scripts/gen_all_images.py` 调豆包 seedream。
2. **TTS 朗读音频生成**: 195 首, 引擎待选(edge-tts / 阿里 / 火山)。
3. **数据清洗**: OSS 路径校验 + 坏文件名修复(`.jpg.jpg` / `.jpg.mp4`)。
4. **design token 抽取与双主题收口**: CSS 变量统一 + 双主题切换不破版。

## 执行建议

1. **从 P0 开始**: #1(分层 + 数据清洗) 与 #2(design token) 先行, 因为基础且与当前 `feat/map-frame-layout` 分支在途工作(#7/#3)可并行收尾。
2. **P1 顺势收尾**: #7(关系图谱) 和 #3(黄河流光) 在当前分支基础上完成。
3. **P2 新增能力**: #4(AI 赏析)、#6(看板)、#5(落墨渲染) 依次开发, 每个独立可测试。
4. **P3 数据先行**: #8(culture 抽象) 先做数据模型 + 采集规范, 数据到位后开发页面。

## 技术栈

- **前端**: Vue3 + Vite(display-v2), `@antv/g6@^5` + `echarts@^6` + `three@^0.184` + `gsap@^3.15`
- **后端**: Java 17 + Spring Boot + MyBatis-Plus + Flyway(MySQL)
- **AI**: DeepSeek(经 ChatService/LlmClient), 可复用
- **资产**: 阿里云 OSS(`shandong-lit-landscape`)

## 待用户确认项

1. **TTS 引擎选型**: edge-tts / 阿里 / 火山
2. **DataV-Vue3 是否引入**: 仅参考视觉 vs 引入轻量组件
3. **#5 模块位置**: 独立"即兴赋诗"页 / 首页 hero 动画 / 诗详情页装饰
4. **poet_relation 种子清单**: 需与现有 126 诗人对齐
5. **#8 首批类目**: 民俗节庆 vs 非遗工艺 vs 其他
