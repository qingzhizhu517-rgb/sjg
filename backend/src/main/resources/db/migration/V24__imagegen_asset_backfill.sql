-- V24: 历史图片生成素材回填(2026-08-20)
--
-- 背景: 旧图片生成流程生成的 44 张素材已上传 OSS(逐个 HEAD 校验 44/44 返回 200),
--       但一直没有写回数据库, 属于"素材在库外躺着"。
--       本 migration 只回填其中能与库内条目严格同名匹配、且当前该字段为空的 33 条。
--
-- 匹配规则: 素材文件名去掉 `_实景_01.jpg` / `_画像_01.jpg` 后缀后, 与实体 name 严格相等
--          (仅做全角括号→半角、中点→连字符的归一)。模糊匹配的一律不填, 见文末"未回填"清单。
--
-- 幂等: 每条 UPDATE 都带 `AND name = '<预期名>'`(防 ID 漂移误伤) 和
--       `AND (<字段> IS NULL OR <字段> = '')`(只填空值, 不覆盖已有素材)。重复执行影响 0 行。
--
-- 路径格式: 与库内既有行一致, 用未编码的中文 OSS URL(MySQL 存原文, 浏览器请求时自动百分号编码)。

-- ============================================================
-- 一、景点 real 实景图 21 条(image_url 原为 NULL)
-- ============================================================

UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/德州黄河号子_实景_01.jpg' WHERE id = 18 AND name = '德州黄河号子' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/石佛寺(济宁)_实景_01.jpg' WHERE id = 30 AND name = '石佛寺（济宁）' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/济宁王母阁(南城)_实景_01.jpg' WHERE id = 31 AND name = '济宁王母阁（南城）' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/济宁南湖_实景_01.jpg' WHERE id = 33 AND name = '济宁南湖' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/东明漆园庄子钓台_实景_01.jpg' WHERE id = 34 AND name = '东明漆园庄子钓台' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/东明漆园_实景_01.jpg' WHERE id = 36 AND name = '东明漆园' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/郓州谿xi堂_实景_01.jpg' WHERE id = 40 AND name = '郓州谿xi堂' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/新堂_实景_01.jpg' WHERE id = 42 AND name = '新堂' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/郓城七陵碑古迹_实景_01.jpg' WHERE id = 43 AND name = '郓城七陵碑古迹' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/古鄄城_实景_01.jpg' WHERE id = 45 AND name = '古鄄城' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/楚丘城_实景_01.jpg' WHERE id = 50 AND name = '楚丘城' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/古濮水_实景_01.jpg' WHERE id = 51 AND name = '古濮水' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/曹州城_实景_01.jpg' WHERE id = 52 AND name = '曹州城' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/东阿县_实景_01.jpg' WHERE id = 58 AND name = '东阿县' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/阳谷县_实景_01.jpg' WHERE id = 59 AND name = '阳谷县' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/盟台_实景_01.jpg' WHERE id = 60 AND name = '盟台' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/灵泉_实景_01.jpg' WHERE id = 61 AND name = '灵泉' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/泰山-岱顶观河_实景_01.jpg' WHERE id = 66 AND name = '泰山·岱顶观河' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/大明湖-小沧浪亭_实景_01.jpg' WHERE id = 67 AND name = '大明湖·小沧浪亭' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/济南-趵突泉_实景_01.jpg' WHERE id = 68 AND name = '济南·趵突泉' AND (image_url IS NULL OR image_url = '');
UPDATE scenic_spot SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/济宁-太白酒楼_实景_01.jpg' WHERE id = 69 AND name = '济宁·太白酒楼' AND (image_url IS NULL OR image_url = '');

-- ============================================================
-- 二、诗人头像 9 条(avatar_url 原为 NULL)
-- 说明: 这 9 位此前完全无头像, 详情页只有占位印章。
-- ============================================================

UPDATE poet SET avatar_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/蒲松龄_画像_01.jpg' WHERE id = 31 AND name = '蒲松龄' AND (avatar_url IS NULL OR avatar_url = '');
UPDATE poet SET avatar_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/曹操_画像_01.jpg' WHERE id = 51 AND name = '曹操' AND (avatar_url IS NULL OR avatar_url = '');
UPDATE poet SET avatar_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/韩愈_画像_01.jpg' WHERE id = 93 AND name = '韩愈' AND (avatar_url IS NULL OR avatar_url = '');
UPDATE poet SET avatar_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/文天祥_画像_01.jpg' WHERE id = 94 AND name = '文天祥' AND (avatar_url IS NULL OR avatar_url = '');
UPDATE poet SET avatar_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/关汉卿_画像_01.jpg' WHERE id = 103 AND name = '关汉卿' AND (avatar_url IS NULL OR avatar_url = '');
UPDATE poet SET avatar_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/高适_画像_01.jpg' WHERE id = 105 AND name = '高适' AND (avatar_url IS NULL OR avatar_url = '');
UPDATE poet SET avatar_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/林逋_画像_01.jpg' WHERE id = 107 AND name = '林逋' AND (avatar_url IS NULL OR avatar_url = '');
UPDATE poet SET avatar_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/李商隐_画像_01.jpg' WHERE id = 113 AND name = '李商隐' AND (avatar_url IS NULL OR avatar_url = '');
UPDATE poet SET avatar_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/王士禛_画像_01.jpg' WHERE id = 122 AND name = '王士禛' AND (avatar_url IS NULL OR avatar_url = '');

-- ============================================================
-- 三、历史事件配图 3 条(image_url 原为 NULL, 全表仅 3 行)
-- 注意: 前端 InkTimeline 目前只渲染事件的年份+标题, 不消费 image_url。
--       此处先入库, 待时间轴展示层支持事件配图后即可直接生效。
-- ============================================================

UPDATE event SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/events/lidu_meeting.jpg' WHERE id = 1 AND title = '李杜齐鲁相会' AND (image_url IS NULL OR image_url = '');
UPDATE event SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/events/zhao_jinan.jpg' WHERE id = 2 AND title = '赵孟頫出任济南总管' AND (image_url IS NULL OR image_url = '');
UPDATE event SET image_url = 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/events/pu_gathering.jpg' WHERE id = 3 AND title = '蒲松龄柳泉设茶采风' AND (image_url IS NULL OR image_url = '');

-- ============================================================
-- 未回填清单(素材存在但故意不入库, 留待人工确认)
-- ============================================================
-- 11 张景点素材对应的条目「已有 real 图」, 不覆盖:
--   东阿县→id55 东阿(与 id58 东阿县 重名歧义, 已填 id58) / 京杭大运河(济宁段)→id26 /
--   兖州城楼(遗址)→id27 / 华不注山→id4 / 华山→id10 / 古濮水→id46 濮水(已填 id51 古濮水) /
--   德州黄河号子→id15 黄河(已填 id18) / 文宣王庙(曲阜孔庙)→id21 / 曲阜阙里→id22 /
--   济宁南池→id25 / 济宁太白楼→id24 / 济宁浣笔泉→id29 / 郓城七陵碑古迹→id39 郓城(已填 id43) /
--   泰山-岱顶观河→id14 泰山(已填 id66) / 济南-趵突泉→id2 趵突泉(已填 id68) /
--   大明湖-小沧浪亭→id1 大明湖(已填 id67) / 济宁-太白酒楼→id69 / 青岛-崂山→id70
-- 1 张无对应条目: 济宁石门山-泗水(库内 id28 名为「济宁石门山/泗水」, 分隔符不同, 未做模糊匹配)
-- 1 个条目无素材: id71 无棣碣石山（马谷山）
--
-- 历史生成的 3 段 5 秒通用氛围视频不对应具体城市或景点, 本次不入库;
-- 原始素材已移至工作区外归档, 详见 docs/plans/2026-08-15-media-visual-plan.md P2。
