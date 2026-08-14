-- V10: scenic_spot.region 行政区划层级归一化(统一到地级市)
-- 背景: region 混用地级市与县级市 —— 曲阜(3)、邹城(1) 均为济宁市下辖县级市,
--       而前端 /regions/:region 城市页与 /api/public/spots/regions 只支持沿黄九市(地级)。
--       青岛(1) 本身是地级市(崂山·李白游踪), 层级正确且城市页有通用兜底渲染, 保持不变。
-- 幂等: UPDATE 幂等, 可重复执行。
-- 应用: python3 scripts/apply_migration.py backend/src/main/resources/db/migration/V10__scenic_spot_region_normalize.sql
UPDATE scenic_spot SET region = '济宁' WHERE region IN ('曲阜', '邹城');