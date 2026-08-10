# 文化板块扩展设计（诗词 → 五大板块）

> 创建：2026-08-08 ｜ 状态：**已实施（2026-08-10，C0-C5 代码完成）** ｜ 前置决策已与用户确认
>
> **实施进度**：C0 ✅（V6 SQL + entity/mapper/service）｜ C1 ✅（pub/admin controller，backend 编译通过）｜ C2 ⚠️（25 条种子已生成 `scripts/output/festivals_seed.sql`，**DB 未应用**——远端 MySQL 连接中断）｜ C3 ✅（admin CulturalList + 发布流）｜ C4 ✅（FestivalList/Detail + 路由）｜ C5 ✅（CulturalGallery 首页区块）｜ C6 部分（双前端构建通过；**待 DB 应用后端到端走查**）
> 关联：`docs/plans/2026-08-05-display-v2-ui-optimization-tasks.md`（UI 优化线并行进行）

## 1. 背景与目标

当前平台内容域仅覆盖古诗词（poet/poem/spot/event/dynasty 五表）。业务扩展为五大文化板块，拓展顺序：

**①民俗节庆 → ②古诗词（已有，纳入聚合）→ ③非遗工艺 → ④民间文学 → ⑤饮食戏曲**

本轮交付：**统一扩展架构 + ①民俗节庆完整闭环**（建表 → AI 生成内容 → 管理端校对发布 → 前台页面）。其余四类按同模式复制。

### 已确认决策

| 决策点 | 结论 |
|---|---|
| 数据来源 | AI 批量生成草稿 → admin 人工校对 → 发布（`status: draft/published`） |
| 数据建模 | 混合：公共表 `cultural_item` + 每类扩展详情表（如 `festival_detail`） |
| 页面形态 | 每类独立路由页 + 首页「文化长廊」聚合入口 |
| 本轮范围 | 架构 + 民俗节庆闭环；古诗词不重建模，仅在聚合层接入 |

## 2. 数据模型（混合：公共表 + 扩展表）

新 migration：`backend/src/main/resources/db/migration/v6_cultural_item.sql`

```sql
-- 文化条目公共表：五类共用，新增类别零迁移
CREATE TABLE cultural_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(20) NOT NULL COMMENT 'festival节庆/craft非遗/literature民间文学/food_opera饮食戏曲',
    title VARCHAR(200) NOT NULL COMMENT '名称',
    summary VARCHAR(500) COMMENT '一句话简介（卡片用）',
    content TEXT COMMENT '详细介绍正文',
    region VARCHAR(50) COMMENT '所属区域（沿黄九市，NULL=全域性内容）',
    image_url VARCHAR(500) COMMENT '实景图',
    image_anime_url VARCHAR(500) COMMENT '水墨风图',
    tags JSON COMMENT '标签数组',
    sort_order INT DEFAULT 0 COMMENT '排序权重',
    status VARCHAR(20) DEFAULT 'draft' COMMENT 'draft草稿/published已发布',
    source VARCHAR(20) DEFAULT 'ai' COMMENT 'ai生成/manual人工',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_status (category, status),
    INDEX idx_region (region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文化条目公共表';

-- 民俗节庆扩展表（1:1，详情页才 JOIN）
CREATE TABLE festival_detail (
    item_id BIGINT PRIMARY KEY,
    festival_date VARCHAR(100) COMMENT '节庆时间（如"农历正月初一""每年4月"）',
    origin TEXT COMMENT '起源渊源',
    customs TEXT COMMENT '习俗活动',
    food TEXT COMMENT '节庆饮食',
    FOREIGN KEY (item_id) REFERENCES cultural_item(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='民俗节庆扩展表';
```

**设计要点**：
- 双图字段 `image_url/image_anime_url` 与现有实体一致，直接复用 display-v2 的 `useImage`/themeAdapter 双主题选图链路。
- `status` 是 AI 生成+人工校对流程的载体：AI 导入一律 `draft`，管理端校对后转 `published`；公开 API 只查 `published`。
- `region` 复用沿黄九市维度（菏泽/济宁/泰安/聊城/济南/德州/淄博/滨州/东营），`NULL` 表示全域性节庆（如春节）。
- 后续类别只加扩展表：`craft_detail`（工艺类别/传承人/工序）、`literature_detail`（体裁/流传地）、`food_opera_detail`（剧种/菜系/代表剧目）——公共表零改动。

## 3. 后端 API

沿用现有分层（entity → mapper → service → controller），`Result<T>` 包装：

**公开端**（`controller/pub/PublicCulturalController.java`，无需认证，只读 published）：
- `GET /api/public/cultural?category=&region=&keyword=&page=&size=` → `PageResult<CulturalItem>` 列表（仅公共字段，卡片用）
- `GET /api/public/cultural/{id}` → item + 按 category JOIN 对应扩展表，返回合并视图
- `GET /api/public/cultural/categories` → 五类元信息（名称/印章字/已发布条目数），首页聚合入口用

**管理端**（`controller/admin/CulturalController.java`，写操作需 admin 角色，SecurityConfig 现有规则自动覆盖）：
- `GET /api/admin/cultural?category=&status=&page=&size=`（含 draft）
- `POST /api/admin/cultural` / `PUT /api/admin/cultural/{id}` / `DELETE /api/admin/cultural/{id}`（公共字段 + 扩展字段一并收发，service 层分写两表）
- `PUT /api/admin/cultural/{id}/status`（publish/unpublish 切换）

**新增文件**：`entity/CulturalItem.java`、`entity/FestivalDetail.java`、`mapper/CulturalItemMapper.java`、`mapper/FestivalDetailMapper.java`、`service/CulturalItemService.java`、pub/admin 两 controller。古诗词域不动。

## 4. AI 内容生成管线

- 生成：`scripts/generate_festivals.py` —— 按九市 × 全域两档构造 prompt（每市 2-3 个地方特色节庆 + 全域性传统节庆 6-8 个，首批约 25 条），输出结构化 JSON（六字段：title/summary/content/region/tags + festival_detail 四字段）。
- 导入：JSON → SQL INSERT（`status='draft'`），脚本直接写库或生成 migration 风格 SQL 文件。
- 校对：admin 列表按 `status=draft` 过滤逐条校对，可编辑后发布。
- 图片：本轮**不批量生成**，前端缺图走既有主题化 SVG 印章占位（P0-5 链路）；后期随 P2-M5~M9 大批素材一并 AI 生成后上 OSS。

**风险控制**：AI 内容可能含史实错误 → draft 强制隔离 + 校对发布闸门；prompt 中要求"仅输出有可靠民俗记载的节庆，不确定的宁缺毋滥"。

## 5. display-v2 前台

**类别注册表** `src/config/culturalCategories.js`（新增类别只改这里 + 加页面组件）：

```js
export const CULTURAL_CATEGORIES = [
  { key: 'festival',   name: '民俗节庆', seal: '节', route: '/festivals',   ready: true  },
  { key: 'poem',       name: '古诗词',   seal: '诗', route: '/poets',      ready: true  }, // 复用现有
  { key: 'craft',      name: '非遗工艺', seal: '艺', route: '/crafts',      ready: false },
  { key: 'literature', name: '民间文学', seal: '文', route: '/literature',  ready: false },
  { key: 'food_opera', name: '饮食戏曲', seal: '味', route: '/food-opera',  ready: false },
]
```

- **聚合入口**：MapView 新增「文化长廊」section（`components/homepage/CulturalGallery.vue`），五张入口卡（印章 + 名称 + 条目数），`ready: false` 的显示「筹备中」禁用态。位次：RiverCityRail 之后、AiChatBox 之前。
- **节庆列表页** `views/FestivalList.vue`（`/festivals`）：real=红金节庆卡片栅格（九市筛选条）；inkwash=竖排卷轴式列表。三态复用批次 A 三件套（SkeletonBlock/EmptyState/ErrorState）。
- **节庆详情页** `views/FestivalDetail.vue`（`/festivals/:id`）：复用详情页模式（mood 模糊铺底 + 返回 + 正文卡），扩展字段四区块：节庆时间/起源/习俗/饮食。
- 路由 2 条懒加载注册；`data-reveal` 滚动动画沿用 useReveal。

## 6. admin-frontend 管理端

- `views/CulturalList.vue`：按类别 tab 过滤的列表（标题/区域/来源/状态/操作），状态列 draft 徽标醒目；操作含 编辑/发布/下架/删除。
- 编辑弹窗：公共字段表单 + 按 category 动态渲染扩展字段（本轮仅 festival 四字段，后续类别注册式扩展）。
- `Layout.vue` 菜单加「文化条目」；router 注册。

## 7. 任务分解（实施计划另文细化）

| 批次 | 内容 | 验收 |
|---|---|---|
| C0 地基 | v6 migration + entity/mapper/service + 类别注册表 | 建表成功，service 单测 |
| C1 后端 API | pub/admin controller 全套 | curl 冒烟：draft 不可见于 pub，publish 后可见 |
| C2 AI 内容 | 生成脚本 + 首批 ~25 条节庆草稿入库 | 条数核对 + 字段完整率 |
| C3 管理端 | CulturalList + 编辑弹窗 + 发布流 | 校对 2 条并发布 |
| C4 前台页面 | FestivalList + FestivalDetail + 路由 | 双主题走查 + 三态走查 |
| C5 聚合入口 | CulturalGallery 首页区块 | 五卡渲染，筹备中态正确 |
| C6 验收 | 端到端 + 回写进度 | 构建/单测/人工走查 |

## 8. 后续类别复制成本（预估）

每类 = 1 张扩展表 + service 少量分支 + 前台 1 个页面组件 + 管理端扩展字段配置。公共表/API/管理端骨架零改动。②古诗词在聚合层接入（已存在于注册表）。按此架构，③④⑤ 每类约 1-2 个批次即可上线。

## 9. 风险与备注

- **AI 内容质量**：draft 隔离 + 校对闸门是底线；prompt 限定"宁缺毋滥"。
- **图片缺口**：本轮占位印章；避免重复 P2 的素材债务，图片批量生成与 OSS 上传合并到 P2-M5~M9 一并排期。
- **与 UI 优化线关系**：P3 批次 B（滚动叙事/FLIP/真机验收）与 P4/P5 不受影响；CulturalGallery 上线后 P3-1 滚动叙事设计需把该 section 纳入叙事流。
- **YAGNI**：不做评论/收藏/分享；不做跨板块全文搜索（等五类齐后再议）。
