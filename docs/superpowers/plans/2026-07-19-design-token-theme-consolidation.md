# P0 #2-A: Design Token 双主题收口

> 路线图 `2026-07-19-display-v2-next-phase-roadmap.md` 的 #2「前端整体美观与布局」P0 切片。
> 范围: **(A) design token 抽取 + 双主题收口**(本计划)。**(B) 水墨头像批量生成**(126 位, 走 `scripts/gen_all_images.py` 调豆包 seedream, **付费 + 外呼**, 单独确认, 不在本计划)。
> 分支: `feat/map-frame-layout`(承接 P0 #1 的 6 个提交之后)。

## 1. 问题(已探明)

### 1.1 两套主题机制并行, token 同名不同值
- `<html data-theme="real|inkwash">`(由 `composables/useTheme.ts` 的 `watch` 设置) → 驱动 `styles/variables.css` 的 `:root`(real 默认) + `[data-theme="inkwash"]`(inkwash 覆盖)。
- `<div class="app-root theme-real|theme-inkwash">`(由 `App.vue:2` 绑 `themeClass`) → 驱动 `styles/real.css` 的 `.theme-real` + `styles/inkwash.css` 的 `.theme-inkwash` 覆盖, 以及 ~16 个组件内的 `.theme-*` 装饰规则。
- cascade: `variables.css`(main.js 先引入) 被 `real.css`/`inkwash.css`(App.vue 后引入) 覆盖。**同名 token 两处定义且值打架**(如 `--card-shadow`: `:root` 是 `0 1px 3px...0 4px 16px`, `.theme-real` 是 `0 4px 20px...0 10px 40px`)。`.app-root` 内的元素吃到 `.theme-*` 那套; teleport/fixed 出 `.app-root` 的元素(如 `AiChatBox` 抽屉)只吃到 `:root`/`[data-theme]` 那套 → **切主题不彻底**。

### 1.2 组件硬编码主题色, 绕过 token
组件 `<style>` 内直接写死主题色而非 `var(--*)`, 切主题时这些不跟随。Top offenders:
| 字面量 | 次数 | 应为 |
|---|---|---|
| `#b8860b` | 12 | `--accent`(real 金) |
| `#9e2b25` / `#8e352e` | 12 / 12 | inkwash 深红(非精确 token, 见 §4) |
| `#8b6508` | 6 | `--accent-dark` |
| `#c23a2b` | 5 | `--accent`(inkwash 红) |
| `#1a1a1a` | 5 | `--text-primary`(inkwash) |
| `#f4efe4` | 5 | `--bg-primary`(inkwash) |
| `#3d2b1f` | 4 | `--text-primary`(real) |
| `#fdfaf5` | 2 | `--bg-primary`(real) |
| `rgba(184,134,11,*)` / `rgba(194,58,43,*)` | 多 | accent 透明度变体(无对应 token) |
| `rgba(61,43,31,*)` / `rgba(0,0,0,0.0x)` | 多 | text-primary / 通用阴影变体(无对应 token) |

## 2. 方案: 单机制 + 单源 + 补透明度 token + 清扫 top offenders

### 2.1 机制统一(类上提到 `<html>`)
`useTheme.ts` 的 `watch` 改为在 `<html>` 上 toggle `.theme-real`/`.theme-inkwash` 类(替代/并存 `data-theme` 属性)。效果:
- 主题类成为最高祖先(`<html>`), 所有元素(含 fixed/teleport)统一吃到 `.theme-*` token。
- 已验证安全: 无 `.app-root.theme-*` 复合选择器; 16 个 scoped 组件用祖先类选择器仍生效; 无组件用 `[data-theme]` 选择器(故可移除 `[data-theme]` 块与属性, 或保留属性仅作冗余标记——**保留属性更稳, 零风险**, 见 T1)。

### 2.2 Token 单源(3 个 css 文件)
- **`variables.css` `:root`**: real 主题默认(pre-paint 正确, `localStorage` 默认 `'real'`) + 不变 token(radius/nav-height/page-padding/font stacks)。**删除 `[data-theme="inkwash"]` 块**(与 `inkwash.css` `.theme-inkwash` 重复)。
- **`inkwash.css` `.theme-inkwash`**: inkwash 唯一 token 源(保留装饰规则 `.card::before`/`.divider`/`.section-heading`)。
- **`real.css` `.theme-real`**: **删除 token 重定义块**(与 `:root` 重复且值打架), 保留装饰规则(`.card::after` 金边/`.divider`/`.section-heading`)。real 源 = `:root`。

### 2.3 补透明度 token(让 rgba 泄漏可映射)
在 `:root` 与 `.theme-inkwash` 各自定义派生 token, 用 `color-mix(in srgb, var(--accent) X%, transparent)`(现代浏览器支持, Vite target evergreen):
- `--accent-soft` = accent @ ~8%
- `--accent-faint` = accent @ ~4%
- `--shadow-color` = `var(--text-primary)` 透明度基底
- `--shadow-soft` = text-primary @ ~10% / @ ~5%

### 2.4 硬编码色清扫(P0 范围 = top offenders, ~70% 覆盖)
按 §1.2 表替换 top offenders 为 token。**长尾**(`#9e2b25`/`#8e352e` 等非精确匹配深红、单次偏门色)→ P1 精致度阶段。

## 3. 任务分解

- **T1** `composables/useTheme.ts`: `watch` 内追加 `document.documentElement.classList` toggle(`'theme-inkwash'`/`'theme-real'`); 保留 `data-theme` 属性设置(零风险冗余, 避免任何隐性依赖)。
- **T2** `styles/variables.css`: 删 `[data-theme="inkwash"]` 块; `:root` 新增 `--accent-soft`/`--accent-faint`/`--shadow-color`/`--shadow-soft`(real 值, color-mix 派生)。
- **T3** `styles/inkwash.css`: `.theme-inkwash` 补同款派生 token(inkwash 值); 确认 inkwash token 唯一源。
- **T4** `styles/real.css`: 删 `.theme-real` token 重定义块; 保留装饰规则; 确认 real 源 = `:root`。
- **T5** 硬编码色清扫(top offenders): `#b8860b`×12 / `#8b6508`×6 / `#c23a2b`×5 / `#1a1a1a`×5 / `#f4efe4`×5 / `#3d2b1f`×4 / `#fdfaf5`×2 → 对应 token; `rgba(184,134,11,*)`/`rgba(194,58,43,*)` → `--accent-soft`/`--accent-faint`; `rgba(61,43,31,*)`/`rgba(0,0,0,0.0x)` → `--shadow-soft`/`--shadow`。涉及 ~8 个文件(主要 App.vue/InkHero/Featured*/PoetDetail 等)。
- **T6** 验证: `npm run dev` 启动; 切 real↔inkwash 目测无破版; `grep` 硬编码色计数应大幅下降; 检查 AiChatBox 抽屉等 fixed 元素主题跟随; 改动提交(1 个 commit: `feat(display-v2): design token 双主题收口`)。

## 4. 待定项 / 决策

- **`#9e2b25`/`#8e352e`(各 12 次)**: inkwash 较深的非精确匹配红, 不等于 `--accent-dark`(`#8B1A1A`)。可能是组件特定的"印泥深红"。**P0 先不动**(归长尾), P1 精致度阶段评估是否新增 `--accent-deep` token 统一。
- **color-mix 兼容**: Chrome 111+/Safari 16.2+/FF 113+ 支持。display-v2 是新前端, target 现代, **不做 rgba fallback**(若后续发现目标用户旧浏览器占比高再补)。
- **`data-theme` 属性**: T1 保留(零风险)。若 T6 验证后确认无任何依赖, 可在后续 commit 移除以彻底单一化。

## 5. 不在 P0 范围(→ P1 / 单独确认)
- 长尾硬编码色清扫(`#9e2b25`/`#8e352e`/单次偏门色) → P1 精致度。
- 精致度 + 导航(路线图 #2 的 P1 部分)。
- **(B) 水墨头像批量生成 126 位**: 付费 + 外呼, 走 `scripts/gen_all_images.py`, 需用户单独确认才启动。

## 6. 验证口径
- 切 real↔inkwash: 背景文字卡片阴影全部跟随, 无残留硬编码色块。
- AiChatBox 抽屉 / fixed 元素: 主题正确(此前因 teleport 风险吃到 `:root` 那套, 上提后应统一)。
- `grep -rhoE "#[0-9A-Fa-f]{6}" display-v2/src --include="*.vue" | wc -l` 较改前下降明显(改前 top offenders 合计 ~60 处)。
- 无 console 报错, 无样式回归(Hero/卡片/导航主视觉无破版)。
