# P3 #8: 拓展业务 — 民俗等文化扩容(数据先行)

> 路线图 `2026-07-19-display-v2-next-phase-roadmap.md` 的 #8「拓展业务」。
> 范围: 本轮写入文档 + 数据模型 + 数据收集, 数据到位后挨个开发页面。民俗节庆为首批。
> 分支: `feat/map-frame-layout`(承接 #1/#2/#3/#4/#5/#6/#7 提交)。

## 1. 现状(已探明)

- **仅诗词 + 景点**: 定位为齐鲁文化扩容, 拓展为正式栏目。
- **远景类目**: 民俗节庆 / 非遗工艺 / 民间文学 / 饮食戏曲。
- **数据先行**: 本轮设计数据模型 + 定义采集字段, 数据到位后开发页面。

## 2. 目标(路线图 #8 验收: culture 抽象模型定稿; 至少 1 类目(民俗)数据采集完成并入库可展示)

1. **统一 culture 内容抽象**: 设计 `culture_item` 表, 支持多类目扩展。
2. **定义 4 类目数据字段与采集来源**: 民俗节庆 / 非遗工艺 / 民间文学 / 饮食戏曲。
3. **导航 / 黄河轴接入位预留**: 导航加"民俗"占位, 黄河流光可挂沿河民俗节点。
4. **数据到位后按类目挨个开发页面**: 本轮先做数据模型 + 采集规范, 页面后续开发。

## 3. 方案

### 3.1 数据库 — `culture_item` 统一抽象表

```sql
CREATE TABLE IF NOT EXISTS culture_item (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(32) NOT NULL COMMENT '类目: folk_festival/intangible/folklore/cuisine_opera',
  title VARCHAR(128) NOT NULL,
  dynasty_id BIGINT COMMENT '所属朝代(可为空)',
  region VARCHAR(64) COMMENT '所属地区(济南/青岛等)',
  summary VARCHAR(512) COMMENT '摘要',
  content JSON COMMENT '详情内容(差异化字段)',
  cover_url VARCHAR(512) COMMENT '封面图',
  inkwash_url VARCHAR(512) COMMENT '水墨风格图',
  media JSON COMMENT '媒体: {images:[], videos:[], audios:[]}',
  geo JSON COMMENT '地理: {lng, lat}',
  yellow_river BOOLEAN DEFAULT FALSE COMMENT '是否沿黄河',
  sort INT DEFAULT 0 COMMENT '排序',
  status VARCHAR(16) DEFAULT 'draft' COMMENT '状态: draft/published/archived',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_type (type),
  KEY idx_region (region),
  KEY idx_yellow_river (yellow_river)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3.2 类目差异化字段(`content` JSON 内)

| 类目 | content 字段示例 |
|---|---|
| 民俗节庆 `folk_festival` | `{ "festival_date":"农历正月初一", "customs":["贴春联","放鞭炮"], "origin":"..." }` |
| 非遗工艺 `intangible` | `{ "craft_type":"陶瓷", "steps":["选土","拉坯","烧制"], "inheritors":["张三"] }` |
| 民间文学 `folklore` | `{ "story_type":"传说", "related_spots":[], "text":"..." }` |
| 饮食戏曲 `cuisine_opera` | `{ "category":"鲁菜", "ingredients":[], "recipe":"..." }` |

### 3.3 后端 — `CultureItem` entity + mapper + controller

- `entity/CultureItem.java`(@TableName("culture_item"))。
- `mapper/CultureItemMapper.java`(extends BaseMapper<CultureItem>)。
- `controller/pub/PublicCultureController.java`: `GET /api/public/culture-items?type=folk_festival` 列表 + `GET /api/public/culture-items/{id}` 详情。

### 3.4 前端 — 导航占位 + 数据采集规范

- 导航加"民俗"占位(不可点击, 或点击提示"即将上线")。
- 数据采集规范文档: 定义每类目的字段、采集来源(官方非遗名录/文旅公开/人工录入)、格式要求。

### 3.5 黄河轴预留

- `culture_item` 表有 `yellow_river` + `geo` 字段, 后期可挂 #3 流光河沿河节点。

## 4. 任务分解

- **T1** `culture_item` 表迁移(V6), 手动 pymysql 应用。
- **T2** `CultureItem` entity + mapper。
- **T3** `PublicCultureController`(列表 + 详情 API)。
- **T4** 后端重启 + curl 验证(空表返回空数组)。
- **T5** 数据采集规范文档(`docs/culture-data-collection.md`)。
- **T6** 导航占位(加"民俗"链接, 点击提示"即将上线")。
- **T7** 验证(后端 API + 导航占位), 提交(2 commit: 后端 + 前端占位)。

## 5. 待定/决策

- **首批类目**: 民俗节庆 vs 非遗工艺 vs 其他。倾向民俗节庆(与齐鲁文化底色最合)。
- **数据采集来源**: 官方非遗名录 / 文旅公开 / 人工录入。需具体调研。
- **页面开发时机**: 数据到位后开发。本轮先做数据模型 + 采集规范。
- **导航占位形式**: 不可点击 vs 点击提示"即将上线"。倾向点击提示。

## 6. 风险

- **数据采集耗时**: 民俗数据需人工整理, 可能源头少/质量差。
- **类目差异化**: 4 类目字段差异大, `content` JSON 需灵活设计。
- **黄河轴挂载**: 后期需 #3 流光河支持节点扩展。

## 7. 不在范围

- 民俗页面开发(数据到位后单独做)。
- 非遗/民间文学/饮食戏曲页面(后续类目)。
- 黄河轴挂载(后期 #3 扩展)。
