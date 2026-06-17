-- SJG 景点视频修正 (JSON数组格式)
START TRANSACTION;

UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/历下亭_视频_01.mp4"]' WHERE id = 1;  -- 大明湖 (1个)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/曲阜孔庙_视频_01.mp4"]' WHERE id = 23;  -- 文宣王庙（曲阜孔庙） (1个)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/大成殿_视频_01.mp4", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/奎文阁_视频_01.mp4", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/曲阜孔庙_视频_01.mp4", "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/诗礼堂_视频_01.mp4"]' WHERE id = 21;  -- 曲阜孔庙 (4个)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/阙里街_视频_01.mp4"]' WHERE id = 22;  -- 曲阜阙里 (1个)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/大明湖_汇波楼_视频_01.mp4"]' WHERE id = 6;  -- 汇波楼 (1个)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/南池公园_视频_01.mp4"]' WHERE id = 25;  -- 济宁南池 (1个)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/太白楼_视频_01.mp4"]' WHERE id = 24;  -- 济宁太白楼 (1个)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/浣笔泉遗址_视频_01.mp4"]' WHERE id = 29;  -- 济宁浣笔泉 (1个)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/王母阁公园_视频_01.mp4"]' WHERE id = 31;  -- 济宁王母阁（南城） (1个)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/泗水河_视频_01.mp4"]' WHERE id = 28;  -- 济宁石门山/泗水 (1个)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/灵岩寺_视频_01.mp4"]' WHERE id = 12;  -- 灵岩寺 (1个)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/珍珠泉_视频_01.mp4"]' WHERE id = 8;  -- 珍珠泉 (1个)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/趵突泉_视频_01.mp4"]' WHERE id = 2;  -- 趵突泉 (1个)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/金线泉_视频_01.mp4"]' WHERE id = 11;  -- 金线泉 (1个)
UPDATE scenic_spot SET video_url = '["https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/鹊山_视频_01.mp4"]' WHERE id = 5;  -- 鹊山 (1个)

-- 共修正 15 个景点视频
COMMIT;