# 本地数据库搭建与应用指南

> 适用场景：不依赖云服务器 MySQL（47.104.207.58），在本机 MySQL 8.x 上搭建 sjg 库用于开发/测试。

## 方案 A（推荐）：直接导入生产备份 + 应用新 migration

生产全量备份已在仓库根目录：`sjg_20260813214743xlghi.sql`（MySQL 8.4 dump，含全部 9 张表与数据）。

```bash
# 1. 建库（字符集 utf8mb4）
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sjg DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"

# 2. 导入生产备份
mysql -u root -p sjg < sjg_20260813214743xlghi.sql

# 3. 按顺序应用新 migration（备份之后的新增修复）
DB_HOST=127.0.0.1 DB_USER=root DB_PASSWORD=你的密码 python3 scripts/apply_migration.py backend/src/main/resources/db/migration/V7__poem_analysis_fallback_cleanup.sql
DB_HOST=127.0.0.1 DB_USER=root DB_PASSWORD=你的密码 python3 scripts/apply_migration.py backend/src/main/resources/db/migration/V8__poet_fill_profile.sql
DB_HOST=127.0.0.1 DB_USER=root DB_PASSWORD=你的密码 python3 scripts/apply_migration.py backend/src/main/resources/db/migration/V9__poet_relation_phase2.sql
DB_HOST=127.0.0.1 DB_USER=root DB_PASSWORD=你的密码 python3 scripts/apply_migration.py backend/src/main/resources/db/migration/V10__scenic_spot_region_normalize.sql
```

注意：`apply_migration.py` 内置的"verify"查询是按 V4（poet_relation）写的，对其他 migration 输出仅供参考；语句本身会全部执行。所有新 migration 均为幂等 SQL，可重复执行。

## 方案 B：全新建库（schema + 全部 migration）

适合想从零重建结构的场景（数据需另行导入种子或备份）：

```bash
mysql -u root -p sjg < backend/src/main/resources/schema.sql          # 基础表: dynasty/poet/scenic_spot/poem/event/poem_event/user
mysql -u root -p sjg < backend/src/main/resources/db/migration/V2__multi_image_and_video.sql
mysql -u root -p sjg < backend/src/main/resources/db/migration/V3__fix_malformed_asset_filenames.sql
mysql -u root -p sjg < backend/src/main/resources/db/migration/V4__poet_relation.sql      # poet_relation 表 + 12 条 seed
mysql -u root -p sjg < display-v2/migrations/v5_poem_analysis.sql                          # poem_analysis 表
mysql -u root -p sjg < backend/src/main/resources/db/migration/V6__cultural_item.sql
# 再按方案 A 第 3 步应用 V7/V8/V9/V10
```

## 后端指向本地库

`backend/src/main/resources/application.yml` 的 datasource 支持环境变量覆盖，本地启动时设置：

```bash
# PowerShell
$env:SPRING_DATASOURCE_URL='jdbc:mysql://127.0.0.1:3306/sjg?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true'
$env:SPRING_DATASOURCE_USERNAME='root'
$env:SPRING_DATASOURCE_PASSWORD='你的密码'
$env:DB_PASSWORD='你的密码'
cd backend; .\mvnw spring-boot:run   # 或 mvn spring-boot:run
```

## 验证要点（应用 V7-V10 后）

| 检查 | SQL / 方式 |
|---|---|
| 赏析 fallback 已清理 | `SELECT COUNT(*) FROM poem_analysis WHERE model='fallback';` → 0 |
| 47 位诗人已补齐 | `SELECT COUNT(*) FROM poet WHERE biography IS NOT NULL;` → ≥ 110（原 79 + 47） |
| 待定关系已删除 | `SELECT * FROM poet_relation WHERE poet_a_id=5 AND poet_b_id=7;` → 空 |
| 关系数量 | `SELECT COUNT(*) FROM poet_relation;` → 13-1+23 = 35 |
| event3 有诗词 | `SELECT * FROM poem_event WHERE event_id=3;` → 3 行 |
| region 无县级 | `SELECT DISTINCT region FROM scenic_spot;` → 无"曲阜/邹城" |