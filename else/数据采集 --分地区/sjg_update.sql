-- SJG 数据修正 UPDATE SQL
-- 基于 Excel 原始数据 + OSS 素材库核对

START TRANSACTION;

-- ===== 诗人头像修正 ===== --
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/乾隆_画像_01.jpg"]' WHERE id = 12;  -- 乾隆 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/苏轼_画像_01.jpg"]' WHERE id = 17;  -- 苏轼 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/阮元_画像_01.jpg"]' WHERE id = 19;  -- 阮元 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/杜甫_画像_01.jpg"]' WHERE id = 1;  -- 杜甫 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/王守仁_画像_01.jpg"]' WHERE id = 11;  -- 王守仁 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/曾巩_画像_01.jpg"]' WHERE id = 3;  -- 曾巩 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/张养浩_画像_01.jpg"]' WHERE id = 14;  -- 张养浩 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/黄庭坚_画像_01.jpg"]' WHERE id = 18;  -- 黄庭坚 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/赵孟頫_画像_01.jpg"]' WHERE id = 5;  -- 赵孟頫 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/元好问_画像_01.jpg"]' WHERE id = 7;  -- 元好问 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/刘鹗_画像_01.jpg"]' WHERE id = 13;  -- 刘鹗 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/胡缵宗_画像_01.jpg"]' WHERE id = 8;  -- 胡缵宗 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/苏辙_画像_01.jpg"]' WHERE id = 15;  -- 苏辙 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/顾炎武_作者_01.jpg"]' WHERE id = 71;  -- 顾炎武 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/王士贞_作者_01.jpg"]' WHERE id = 41;  -- 王世贞 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/李白_画像_01.jpg"]' WHERE id = 6;  -- 李白 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/郭沫若_作者_01.jpg"]' WHERE id = 72;  -- 郭沫若 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/玄烨_作者_01.jpg"]' WHERE id = 68;  -- 玄烨 (1张)
UPDATE poet SET avatar_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/李隆基_作者_01.jpg"]' WHERE id = 65;  -- 李隆基 (1张)
-- 共修正 19 位诗人头像

-- ===== 景点图片修正（多图转JSON数组）===== --
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/历下亭_实景_01.jpg", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/大明湖_实景_01.jpg", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/超然楼_实景_01.jpg", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/铁公祠_实景_01.jpg"]' WHERE id = 1;  -- 大明湖 (4张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/趵突泉_实景_01.jpg"]' WHERE id = 2;  -- 趵突泉 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/千佛山_实景_01.jpg"]' WHERE id = 3;  -- 千佛山 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/华不注_实景_01.jpg"]' WHERE id = 4;  -- 华不注山 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/鹊山_实景_01.jpg"]' WHERE id = 5;  -- 鹊山 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/五龙潭_实景_01.jpg"]' WHERE id = 7;  -- 五龙潭 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/珍珠泉_实景_01.jpg"]' WHERE id = 8;  -- 珍珠泉 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/黑虎泉_实景_01.jpg"]' WHERE id = 9;  -- 黑虎泉 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/华不注_实景_01.jpg"]' WHERE id = 10;  -- 华山 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/金线泉_实景_01.jpg"]' WHERE id = 11;  -- 金线泉 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/灵岩寺_实景_01.jpg"]' WHERE id = 12;  -- 灵岩寺 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/龙洞_实景_01.jpg"]' WHERE id = 13;  -- 龙洞 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/黄河-实景-01.jpg", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/黄河-实景-02.jpg", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/黄河-实景-03.jpg", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/黄河-实景-05.jpg", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/黄河-实景-06.jpg", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/黄河-实景-07.jpg", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/黄河-实景-08.jpg", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/黄河-实景-10.jpg", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/黄河-实景-11.jpg", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/黄河-实景-12.jpg", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/黄河-实景-15.jpg"]' WHERE id = 15;  -- 黄河 (11张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/无棣沟-实景-01.jpg"]' WHERE id = 16;  -- 无棣沟 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/大成殿_实景_01.jpg", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/曲阜孔庙_实景_01.jpg", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/诗礼堂_实景_01.jpg"]' WHERE id = 21;  -- 曲阜孔庙 (3张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/阙里街_实景_01.jpg"]' WHERE id = 22;  -- 曲阜阙里 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/曲阜孔庙_实景_01.jpg"]' WHERE id = 23;  -- 文宣王庙（曲阜孔庙） (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/太白楼_实景_01.jpg"]' WHERE id = 24;  -- 济宁太白楼 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/南池公园_实景_01.jpg"]' WHERE id = 25;  -- 济宁南池 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/京杭大运河济宁段_实景_01.jpg"]' WHERE id = 26;  -- 京杭大运河（济宁段） (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/兖州老城_实景_01.jpg"]' WHERE id = 27;  -- 兖州城楼（遗址） (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/泗水河_实景_01.jpg"]' WHERE id = 28;  -- 济宁石门山/泗水 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/浣笔泉遗址_实景_01.jpg"]' WHERE id = 29;  -- 济宁浣笔泉 (1张)
UPDATE scenic_spot SET image_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/峄山_实景_01.jpg"]' WHERE id = 32;  -- 峄山 (1张)
-- 共修正 24 个景点图片

-- ===== 景点视频修正 ===== --
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/历下亭_视频_01.mp4"]' WHERE id = 1;  -- 大明湖 (1个视频)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/趵突泉_视频_01.mp4"]' WHERE id = 2;  -- 趵突泉 (1个视频)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/鹊山_视频_01.mp4"]' WHERE id = 5;  -- 鹊山 (1个视频)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/大明湖_汇波楼_视频_01.mp4"]' WHERE id = 6;  -- 汇波楼 (1个视频)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/珍珠泉_视频_01.mp4"]' WHERE id = 8;  -- 珍珠泉 (1个视频)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/金线泉_视频_01.mp4"]' WHERE id = 11;  -- 金线泉 (1个视频)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/灵岩寺_视频_01.mp4"]' WHERE id = 12;  -- 灵岩寺 (1个视频)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/大成殿_视频_01.mp4", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/奎文阁_视频_01.mp4", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/曲阜孔庙_视频_01.mp4", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/诗礼堂_视频_01.mp4"]' WHERE id = 21;  -- 曲阜孔庙 (4个视频)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/阙里街_视频_01.mp4"]' WHERE id = 22;  -- 曲阜阙里 (1个视频)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/曲阜孔庙_视频_01.mp4"]' WHERE id = 23;  -- 文宣王庙（曲阜孔庙） (1个视频)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/太白楼_视频_01.mp4"]' WHERE id = 24;  -- 济宁太白楼 (1个视频)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/南池公园_视频_01.mp4"]' WHERE id = 25;  -- 济宁南池 (1个视频)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/泗水河_视频_01.mp4"]' WHERE id = 28;  -- 济宁石门山/泗水 (1个视频)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/浣笔泉遗址_视频_01.mp4"]' WHERE id = 29;  -- 济宁浣笔泉 (1个视频)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/王母阁公园_视频_01.mp4"]' WHERE id = 31;  -- 济宁王母阁（南城） (1个视频)
-- 共修正 15 个景点视频

-- ===== 修正 NULL 朝代ID ===== --
UPDATE poet SET dynasty_id = 9 WHERE id = 7;  -- 元好问 → 9
-- 共修正 1 位诗人朝代

COMMIT;