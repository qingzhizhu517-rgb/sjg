# P1 #7: 关系图谱 Phase 1 — 表 + 后端 + 种子 + 前端接真实数据

> 路线图 `2026-07-19-display-v2-next-phase-roadmap.md` 的 #7「关系图谱优化升级」。分两期:
> - **Phase 1(本计划)**: 建 `poet_relation` 表 + 后端关系 API + 补关键关系种子(真实在库诗人) + 前端 G6 接真实数据。
> - **Phase 2(后续)**: 派生边(同朝代/同景点/同籍贯) + 节点折叠/筛选 + 扩知识图谱。
> 分支: `feat/map-frame-layout`。

## 1. 现状(已探明)

- **前端 G6 图是硬编码 demo**(PoetList.vue L378-399): 8 节点(李白/杜甫/李清照/辛弃疾/赵孟頫/蒲松龄 + 济南/泰安) + 8 边(李杜齐鲁相会/济南二安等), 非真实数据驱动。G6 v5 force 布局, real/inkwash 双主题色。
- **demo 引用的李清照/辛辛弃疾不在库**(查 MCP 确认) -> 接真实数据后这些节点消失, 须用真实诗人替换。
- **后端无 `poet_relation` 表/entity/mapper**(grep 空)。后端模式: entity(@TableName)+mapper(BaseMapper)+service+controller/pub, 已有 PoemEvent junction 先例。
- **派生数据齐备**: poem 有 `poetId`/`dynastyId`/`spotId`(L31), poet 有 `birthplace`(Phase 2 用)。
- **迁移**: V2/V3 在, Flyway 不在 pom, 手动 pymysql 应用(memory 记录)。

## 2. 真实种子关系(已按在库诗人策展, 13 对)

| poet_a | poet_b | relation_type | description |
|---|---|---|---|
| 李白(6) | 杜甫(1) | 并称 | 李杜齐鲁相会 |
| 李白(6) | 高适(105) | 交游 | 梁宋同游 |
| 杜甫(1) | 高适(105) | 交游 | 梁宋同游 |
| 苏轼(17) | 黄庭坚(18) | 师承 | 苏黄, 庭坚出苏轼门下 |
| 苏轼(17) | 苏辙(15) | 亲属 | 三苏兄弟 |
| 曾巩(3) | 苏轼(17) | 并称 | 唐宋八大家 |
| 蒲松龄(31) | 王士禛(122) | 交游 | 王士禛评《聊斋》 |
| 蒲松龄(31) | 赵执信(32) | 交游 | 山东清初同代 |
| 王士禛(122) | 赵执信(32) | 亲属 | 赵执信为王士禛甥婿 |
| 李攀龙(27) | 王世贞(41) | 并称 | 明后七子 |
| 李攀龙(27) | 谢榛(56) | 并称 | 明后七子 |
| 王世贞(41) | 谢榛(56) | 并称 | 明后七子 |
| 元好问(7) | 赵孟頫(5) | 交游 | 金元之际(待考, 或删) |

source 标 `seed`(人工录入)。

## 3. 方案(Phase 1)

### 3.1 DB — V4 迁移 + 种子(seed)
`backend/src/main/resources/db/migration/V4__poet_relation.sql`:
```sql
CREATE TABLE IF NOT EXISTS poet_relation (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  poet_a_id BIGINT NOT NULL,
  poet_b_id BIGINT NOT NULL,
  relation_type VARCHAR(16) NOT NULL COMMENT '师承/交游/并称/亲属',
  description VARCHAR(128),
  source VARCHAR(16) DEFAULT 'seed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_pair_type (poet_a_id, poet_b_id, relation_type),
  KEY idx_a (poet_a_id), KEY idx_b (poet_b_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- + 13 条 INSERT(上表, poet_a_id<b_id 保序)
```
手动 pymysql 应用(同 #1 V3 模式)。

### 3.2 后端
- `entity/PoetRelation.java`(@TableName("poet_relation"), 字段对应)。
- `mapper/PoetRelationMapper.java`(extends BaseMapper<PoetRelation>)。
- `controller/pub/PublicPoetRelationController.java`: `GET /api/public/poet-relations` 返回所有关系(带 poet_a/b 的 name+dynasty, 供前端直接建图); DTO `RelationView{poetAId, poetAName, poetBDynasty...}` 或 join 查。
- 简单实现: service 查 `poet_relation` 全表 + 按 poet_id 批量取 name/dynasty, 组装 `{nodes:[...], edges:[...]}` 或 `{relations:[...]}` 返回。

### 3.3 前端
- PoetList.vue `initG6`: 删硬编码 demo data, 改为 `fetch('/api/public/poet-relations')` -> 转 G6 nodes/edges。
  - node: id=poetId, label=name, sub=`{dynasty} · {style或bio截断}`, isPoet:true(无 city 节点了, Phase 1 只诗人-诗人)。
  - edge: source/target=poetId, label=description, eDashed=(relation_type=='并称'?false:true)。
- 保留 force 布局 + 双主题 graphTheme + 节点点击(可飞诗人详情, 复用现有)。
- 加载态/空态(无关系时提示)。

## 4. 任务分解

- **T1** V4 迁移 SQL(建表+13 种子), 写 /tmp 脚本 pymysql 应用, MCP 验证行数。
- **T2** PoetRelation entity + mapper。
- **T3** PublicPoetRelationController + service, `GET /api/public/poet-relations` 返回组装数据。
- **T4** 后端重启 + curl 验证返回 13 关系 + 节点 name/dynasty。
- **T5** PoetList `initG6` 接真实 API(删 demo), 加载态。
- **T6** 验证(npm run dev 看图谱 + 节点点击), 提交(2 commit: 计划 + 实现)。

## 5. 待定/决策

- **元好问-赵孟頫** 关系存疑(金元之际, 无直接交游) -> 种子表标 `待考`, 或删。倾向删(保种子质量)。
- **节点点击行为**: 飞诗人详情页(`/poets/{id}`) vs 侧栏卡。倾向飞详情(现有 PoetList 点击行为)。
- **edge 样式按 relation_type**: 并称=实线粗, 交游=实线, 师承=虚线, 亲属=双线/虚线。Phase 1 先并称实线粗/其余虚线, Phase 2 精化。

## 6. 不在 Phase 1 范围(-> Phase 2)

- 派生边(同朝代/同景点题诗/同籍贯)。
- 节点过多折叠/筛选(按朝代过滤等)。
- 扩为 知识图谱(诗人-诗-景点-事件)。
- city 节点(济南/泰安等) — Phase 1 只诗人-诗人。

## 7. 风险

- 种子 poet_a_id<b_id 保序避免重复对; UNIQUE(poet_a_id,poet_b_id,relation_type) 防重。
- 前端 G6 force 布局 13 节点性能无虞; Phase 2 派生边可能致节点爆炸(届时加折叠)。
- demo 删后李清照/辛弃疾节点消失 — 预期(它们不在库)。
