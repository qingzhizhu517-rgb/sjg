-- V37: 齐鲁文化来源与本地插画补充；按类别和名称匹配，不依赖环境中的实体 ID。
-- 由 scripts/generate-cultural-resource-migration.mjs 生成；不修改正文或审核状态。
-- 来源支持扩展观察，正文内待考断言尚需逐句复核；外部媒体版权仍归原机构。
-- 来源与关系写入不含 DELETE；已有配图与已有来源保留。

-- 菏泽国际牡丹文化旅游节（曹州牡丹花会）
UPDATE cultural_item c SET c.image_anime_url = '/images/cultural/peony_festival.webp'
WHERE c.category = 'festival' AND c.title = '菏泽国际牡丹文化旅游节（曹州牡丹花会）' AND (c.image_anime_url IS NULL OR c.image_anime_url = '');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '千年花事今更艳——2025世界牡丹大会 第34届菏泽国际牡丹文化旅游节开幕侧记', '淄博市商务局网站', 2025, 'https://boftec.zibo.gov.cn/cec/news/detail?newsid=1833', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '菏泽国际牡丹文化旅游节（曹州牡丹花会）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://boftec.zibo.gov.cn/cec/news/detail?newsid=1833');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：2025年4月8日开幕；赏花、非遗与演艺。原页图文，避免把往年会期当今年会期。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://boftec.zibo.gov.cn/cec/news/detail?newsid=1833')
WHERE c.category = 'festival' AND c.title = '菏泽国际牡丹文化旅游节（曹州牡丹花会）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '2026世界牡丹大会 第35届菏泽国际牡丹文化旅游节开幕', '山东广播电视台（齐鲁网）', 2026, 'https://v.iqilu.com/sdws/sdxwlb/2026/0410/5873803.html', '原页公开提供MP4与嵌入分享代码；版权归原机构，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '菏泽国际牡丹文化旅游节（曹州牡丹花会）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://v.iqilu.com/sdws/sdxwlb/2026/0410/5873803.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：该年度活动现场记录，不作下届会期、票价信息。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://v.iqilu.com/sdws/sdxwlb/2026/0410/5873803.html')
WHERE c.category = 'festival' AND c.title = '菏泽国际牡丹文化旅游节（曹州牡丹花会）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 曲阜祭孔大典
UPDATE cultural_item c SET c.image_anime_url = '/images/cultural/confucius_ceremony.webp'
WHERE c.category = 'festival' AND c.title = '曲阜祭孔大典' AND (c.image_anime_url IS NULL OR c.image_anime_url = '');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '祭孔大典', '中国非物质文化遗产网', NULL, 'https://www.ihchina.cn/project_details/14982.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '曲阜祭孔大典')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.ihchina.cn/project_details/14982.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：国家级项目Ⅹ-35，集乐、歌、舞、礼。民俗家祭与当代公祭流程需区别。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.ihchina.cn/project_details/14982.html')
WHERE c.category = 'festival' AND c.title = '曲阜祭孔大典'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '[视频]甲午年公祭孔子大典举行', '中央广播电视总台央视网', 2014, 'https://tv.cctv.com/2014/09/28/VIDE1411903848514381.shtml', '引用原站公开视频流，版权归原作者与机构；技术可嵌核验不代表开放授权，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '曲阜祭孔大典')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/2014/09/28/VIDE1411903848514381.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：2014年曲阜公祭现场记录；用于观察礼乐与仪程，不作今年会期信息。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/2014/09/28/VIDE1411903848514381.shtml')
WHERE c.category = 'festival' AND c.title = '曲阜祭孔大典'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '乙巳年公祭孔子大典现场（2025年）', '济宁市人民政府（济宁日报全媒体记者杨国庆摄）', 2025, 'https://www.jining.gov.cn/art/2025/9/29/art_182_2915095.html', '版权归原发布方，非开放授权；原页未见明示转载限制'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '曲阜祭孔大典')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.jining.gov.cn/art/2025/9/29/art_182_2915095.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：作品与现场素材原页；仅支持素材所述范围。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.jining.gov.cn/art/2025/9/29/art_182_2915095.html')
WHERE c.category = 'festival' AND c.title = '曲阜祭孔大典'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 泰山东岳庙会
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '泰山东岳庙会', '泰山风景名胜区管理委员会', 2026, 'https://tsgw.taian.gov.cn/art/2026/3/23/art_363610_10321002.html', '版权归原发布方；仅引用原始链接并署名，未发现本页明确禁止引用图片的声明，不视为开放授权。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '泰山东岳庙会')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tsgw.taian.gov.cn/art/2026/3/23/art_363610_10321002.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：宗教文化、民间艺术与商贸活动；2008年第二批国家级非遗。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tsgw.taian.gov.cn/art/2026/3/23/art_363610_10321002.html')
WHERE c.category = 'festival' AND c.title = '泰山东岳庙会'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 临清庙会（古运河庙会）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '地方神庙、信仰空间与社会文化变迁——以临清碧霞元君庙宇碑刻为中心', '中国孔子网（周嘉研究）', 2020, 'https://www.chinakongzi.org/xsyj/xmcg/202004/t20200415_426393.htm', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '临清庙会（古运河庙会）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.chinakongzi.org/xsyj/xmcg/202004/t20200415_426393.htm');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：庙宇碑刻史料与运河商埠信俗；当代活动名称/会期不统一，勿认定为每年固定节期。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.chinakongzi.org/xsyj/xmcg/202004/t20200415_426393.htm')
WHERE c.category = 'festival' AND c.title = '临清庙会（古运河庙会）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 临清驾鼓（新春社火锣鼓）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '锣鼓艺术（临清驾鼓）', '中国非物质文化遗产网', NULL, 'https://www.ihchina.cn/project_details/23648/', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '临清驾鼓（新春社火锣鼓）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.ihchina.cn/project_details/23648/');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：国家级项目Ⅱ-123；鼓、点锣、筛锣；行街与圆场、六首曲目。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.ihchina.cn/project_details/23648/')
WHERE c.category = 'festival' AND c.title = '临清驾鼓（新春社火锣鼓）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '聊城非物质文化遗产——临清驾鼓', '聊城临清市文化馆（山东公共文化云）', NULL, 'https://www.sdpcc.com/resources/1775', '原页明示“未经允许不得转载”，未获得外站呈现授权，仅保留原页观看入口。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '临清驾鼓（新春社火锣鼓）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.sdpcc.com/resources/1775');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：作品与现场素材原页；仅支持素材所述范围。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.sdpcc.com/resources/1775')
WHERE c.category = 'festival' AND c.title = '临清驾鼓（新春社火锣鼓）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 趵突泉迎春花灯会
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '锦绣中国年 | 龙元素引领新春灯会国潮热 “中国风”视觉盛宴点亮文旅市场', '央视网', 2024, 'https://news.cctv.com/2024/02/16/ARTIqRimyZ6nJx5DFWLkB5BT240216.shtml', '版权归原发布方；仅引用原始链接并署名，未发现本页明确禁止引用图片的声明，不视为开放授权。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '趵突泉迎春花灯会')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://news.cctv.com/2024/02/16/ARTIqRimyZ6nJx5DFWLkB5BT240216.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：正文明确趵突泉花灯会融入龙元素、泉文化、宫灯等；图文及新闻视频原页。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://news.cctv.com/2024/02/16/ARTIqRimyZ6nJx5DFWLkB5BT240216.shtml')
WHERE c.category = 'festival' AND c.title = '趵突泉迎春花灯会'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '【喜庆新春】趵突泉花灯盛宴 三大主题板块独具匠心', '山东广播电视台（齐鲁网）', NULL, 'https://v.iqilu.com/ggpd/xwwbc/202501/31/5661175.html', '原页公开提供MP4与嵌入分享代码；版权归原机构，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '趵突泉迎春花灯会')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://v.iqilu.com/ggpd/xwwbc/202501/31/5661175.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：2025年灯会现场记录；用于观看灯组设计，不作当下会期与票价信息。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://v.iqilu.com/ggpd/xwwbc/202501/31/5661175.html')
WHERE c.category = 'festival' AND c.title = '趵突泉迎春花灯会'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 千佛山重阳山会（千佛山庙会）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '10月25日至11月2日，济南千佛山第42届“九月九”重阳山会举行', '济南市政府新闻办“济南发布”官方账号', 2025, 'https://m.thepaper.cn/newsDetail_forward_31825125', '版权归原发布方；仅引用原始链接并署名，未发现本页明确禁止引用图片的声明，不视为开放授权。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '千佛山重阳山会（千佛山庙会）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://m.thepaper.cn/newsDetail_forward_31825125');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：传统看戏、品小吃、赏民俗；巡游、登山、非遗市集。仅核验2025届，非实时活动预告。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://m.thepaper.cn/newsDetail_forward_31825125')
WHERE c.category = 'festival' AND c.title = '千佛山重阳山会（千佛山庙会）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 中国乐陵金丝小枣文化旅游节
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '德州市乐陵经济开发区：以文明实践打通服务群众“最后一公里”', '山东宣传网（乐陵经济开发区）', 2021, 'https://www.sdxc.gov.cn/wmsd/wmsj/202101/t20210113_11639973.htm', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '中国乐陵金丝小枣文化旅游节')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.sdxc.gov.cn/wmsd/wmsj/202101/t20210113_11639973.htm');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：正文记录2020年小枣文化旅游节开杆仪式与农民合唱；可配枣文化物候图。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.sdxc.gov.cn/wmsd/wmsj/202101/t20210113_11639973.htm')
WHERE c.category = 'festival' AND c.title = '中国乐陵金丝小枣文化旅游节'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 宁津蟋蟀文化节（暨杂技古会）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '杂技 “炫技”遇蟋蟀 “雅趣” 宁津让传统文化持续迸发新活力', '宁津县文化和旅游局、宁津县融媒体中心', 2026, 'https://iapp.njxrmtzx.cn/share/YS0xOTMtNDIxNTQwNjM.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '宁津蟋蟀文化节（暨杂技古会）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://iapp.njxrmtzx.cn/share/YS0xOTMtNDIxNTQwNjM.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：官方页报道筹备宁津蟋蟀文化节与研究恢复黄镇杂技古会，不能据此确认二者历年同期、固定会期或库中文案的第十届信息。页脚明确未经授权不得转载、摘编，故仅保留原页链接。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://iapp.njxrmtzx.cn/share/YS0xOTMtNDIxNTQwNjM.html')
WHERE c.category = 'festival' AND c.title = '宁津蟋蟀文化节（暨杂技古会）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 齐文化节（临淄）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '关于深化文旅融合促进齐文化新时代的传承与发展的建议答复', '淄博市文化和旅游局', 2025, 'https://wh.zibo.gov.cn/gongkai/channel_c_5f9fa491ab327f36e4c13060_n_1605682639.9549/doc_68bf96911427114bd64b5b4b.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '齐文化节（临淄）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://wh.zibo.gov.cn/gongkai/channel_c_5f9fa491ab327f36e4c13060_n_1605682639.9549/doc_68bf96911427114bd64b5b4b.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：官方答复谈齐文化传承、节庆、研学旅游；使用整合展示而非复刻现场。网页由本地HTTP成功读取。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://wh.zibo.gov.cn/gongkai/channel_c_5f9fa491ab327f36e4c13060_n_1605682639.9549/doc_68bf96911427114bd64b5b4b.html')
WHERE c.category = 'festival' AND c.title = '齐文化节（临淄）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '第二十届齐文化节暨第八届齐文化与稷下学论坛在淄博开幕', '山东广播电视台（齐鲁网）', NULL, 'https://v.iqilu.com/ggpd/sddsy/202309/24/5398555.html', '原页公开提供MP4与嵌入分享代码；版权归原机构，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '齐文化节（临淄）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://v.iqilu.com/ggpd/sddsy/202309/24/5398555.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：该年度活动现场记录，不作下届会期、票价信息。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://v.iqilu.com/ggpd/sddsy/202309/24/5398555.html')
WHERE c.category = 'festival' AND c.title = '齐文化节（临淄）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 淄博国际聊斋文化旅游节（聊斋文化节）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '关于深化文旅融合促进齐文化新时代的传承与发展的建议答复', '淄博市文化和旅游局', 2025, 'https://wh.zibo.gov.cn/gongkai/channel_c_5f9fa491ab327f36e4c13060_n_1605682639.9549/doc_68bf96911427114bd64b5b4b.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '淄博国际聊斋文化旅游节（聊斋文化节）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://wh.zibo.gov.cn/gongkai/channel_c_5f9fa491ab327f36e4c13060_n_1605682639.9549/doc_68bf96911427114bd64b5b4b.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：明确聊斋文化节罗刹海市巡游、民间杂耍与二人转；可接原页视频作为视听入口。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://wh.zibo.gov.cn/gongkai/channel_c_5f9fa491ab327f36e4c13060_n_1605682639.9549/doc_68bf96911427114bd64b5b4b.html')
WHERE c.category = 'festival' AND c.title = '淄博国际聊斋文化旅游节（聊斋文化节）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '【畅游齐鲁 乐享“五一”】科技赋能 淄博解锁《聊斋》新玩法', '山东广播电视台（齐鲁网·闪电新闻）', 2025, 'https://v.iqilu.com/ggpd/sddsy/202505/04/5708711.html', '引用原站公开视频流，版权归原作者与机构；技术可嵌核验不代表开放授权，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '淄博国际聊斋文化旅游节（聊斋文化节）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://v.iqilu.com/ggpd/sddsy/202505/04/5708711.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：影像资料原页，用于对照观察。山东广播电视台原页观看；未核验跨站嵌入许可；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://v.iqilu.com/ggpd/sddsy/202505/04/5708711.html')
WHERE c.category = 'festival' AND c.title = '淄博国际聊斋文化旅游节（聊斋文化节）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 惠民胡集书会
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '胡集书会', '中国非物质文化遗产网', NULL, 'https://www.ihchina.cn/project_details/15035/', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '惠民胡集书会')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.ihchina.cn/project_details/15035/');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：国家级项目Ⅹ-59为民俗（库中文案“曲艺类”不准确）；正月十二偏节、十五正节，曲艺集市。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.ihchina.cn/project_details/15035/')
WHERE c.category = 'festival' AND c.title = '惠民胡集书会'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '[文化十分]十分深度 2026胡集书会——鼓板铿锵传古韵 说唱笑乐送春风', '中央广播电视总台央视网', 2026, 'https://tv.cctv.com/2026/03/12/VIDEe9Y4vdGjDWqy0MQhddzt260312.shtml', '引用原站公开视频流，版权归原作者与机构；技术可嵌核验不代表开放授权，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '惠民胡集书会')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/2026/03/12/VIDEe9Y4vdGjDWqy0MQhddzt260312.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：2026年胡集书会现场记录，可听原声与观察说唱、鼓板，不作后续会期公告。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/2026/03/12/VIDEe9Y4vdGjDWqy0MQhddzt260312.shtml')
WHERE c.category = 'festival' AND c.title = '惠民胡集书会'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 黄河口开渔节
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '【风雅颂·东营】开海咯！约你来赴一场带着海风的舌尖盛宴', '东营网', 2017, 'https://www.dongyingnews.cn/topic/system/2017/09/19/010689818.shtml', '原页版权声明①要求书面授权，未获授权；仅保留原页入口'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '黄河口开渔节')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.dongyingnews.cn/topic/system/2017/09/19/010689818.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：首届中国·垦利红光开渔节，红光渔港千帆出海；会期以当年官方发布为准。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.dongyingnews.cn/topic/system/2017/09/19/010689818.shtml')
WHERE c.category = 'festival' AND c.title = '黄河口开渔节'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 中国孙子文化旅游节（广饶）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '第十七届孙子文化旅游节在东营广饶开幕', '中央广电总台国际在线（东营市委宣传部供图）', 2025, 'https://sd.cri.cn/20250910/f5a8eb6d-1dfe-358b-f697-1f6deab4e1a2.html', '未经书面授权不得转载、复制或其他方式使用。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'festival' AND c.title = '中国孙子文化旅游节（广饶）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://sd.cri.cn/20250910/f5a8eb6d-1dfe-358b-f697-1f6deab4e1a2.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：2025年第十七届，问道孙武·溯说古今，13项主题活动。该站已实际HTTP读取200。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://sd.cri.cn/20250910/f5a8eb6d-1dfe-358b-f697-1f6deab4e1a2.html')
WHERE c.category = 'festival' AND c.title = '中国孙子文化旅游节（广饶）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 曹州面塑（面人·曹州面人）
UPDATE cultural_item c SET c.image_anime_url = '/images/cultural/caozhou_dough_art.webp'
WHERE c.category = 'craft' AND c.title = '曹州面塑（面人·曹州面人）' AND (c.image_anime_url IS NULL OR c.image_anime_url = '');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '曹州面塑指尖上的非遗传承', '央视网艺术台（大众日报）', 2012, 'https://arts.cntv.cn/20120516/111335.shtml', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '曹州面塑（面人·曹州面人）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://arts.cntv.cn/20120516/111335.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：揉、搓、拈、压、拍等技法；配传承人教学照片。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://arts.cntv.cn/20120516/111335.shtml')
WHERE c.category = 'craft' AND c.title = '曹州面塑（面人·曹州面人）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '《三农群英汇》 20250318 行走的非遗——让面团在指尖生花', '中央广播电视总台央视网', 2025, 'https://tv.cctv.com/2025/03/18/VIDEijoYiLIon8vLW7Gg2nHl250318.shtml', '引用原站公开视频流，版权归原作者与机构；技术可嵌核验不代表开放授权，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '曹州面塑（面人·曹州面人）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/2025/03/18/VIDEijoYiLIon8vLW7Gg2nHl250318.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：真实影音原页，供观察节目所展示的内容；版权归来源机构。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/2025/03/18/VIDEijoYiLIon8vLW7Gg2nHl250318.shtml')
WHERE c.category = 'craft' AND c.title = '曹州面塑（面人·曹州面人）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 鲁锦织造技艺
UPDATE cultural_item c SET c.image_anime_url = '/images/cultural/lu_brocade_weaving.webp'
WHERE c.category = 'craft' AND c.title = '鲁锦织造技艺' AND (c.image_anime_url IS NULL OR c.image_anime_url = '');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '鲁锦织造技艺', '中国非物质文化遗产网', NULL, 'https://www.ihchina.cn/art/detail/id/14489.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '鲁锦织造技艺')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.ihchina.cn/art/detail/id/14489.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：国家级项目Ⅷ-103；彩色经纬线交织与几何纹样。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.ihchina.cn/art/detail/id/14489.html')
WHERE c.category = 'craft' AND c.title = '鲁锦织造技艺'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '[非遗里的中国第五季]鲁锦织造技艺', '央视网', NULL, 'https://tv.cctv.com/2026/07/11/VIDECMDdZ5aLceFtWKGjJCKR260711.shtml', '引用原站公开视频流，版权归原作者与机构；技术可嵌核验不代表开放授权，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '鲁锦织造技艺')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/2026/07/11/VIDECMDdZ5aLceFtWKGjJCKR260711.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：影像资料原页，用于对照观察。央视原页播放器；未核验跨站嵌入许可；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/2026/07/11/VIDECMDdZ5aLceFtWKGjJCKR260711.shtml')
WHERE c.category = 'craft' AND c.title = '鲁锦织造技艺'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 曲阜楷木雕刻（木雕·曲阜楷木雕刻）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '曲阜楷木:从笔杆到雕刻的非遗之路', '济宁市文化和旅游局', 2026, 'https://whlyj.jining.gov.cn/art/2026/4/14/art_32446_2711940.html', '未发现开放许可；版权归来源机构/作者，未复制下载。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '曲阜楷木雕刻（木雕·曲阜楷木雕刻）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://whlyj.jining.gov.cn/art/2026/4/14/art_32446_2711940.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：择木、顺木纹规划纹样，深凿浅刻与斜削平推。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://whlyj.jining.gov.cn/art/2026/4/14/art_32446_2711940.html')
WHERE c.category = 'craft' AND c.title = '曲阜楷木雕刻（木雕·曲阜楷木雕刻）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 嘉祥石雕（石雕·嘉祥石雕）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '石雕（嘉祥石雕）', '中国非物质文化遗产网', NULL, 'https://www.ihchina.cn/project_details/14113.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '嘉祥石雕（石雕·嘉祥石雕）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.ihchina.cn/project_details/14113.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：国家级项目Ⅶ-56；当地天青石，圆雕、浮雕、透雕、线雕。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.ihchina.cn/project_details/14113.html')
WHERE c.category = 'craft' AND c.title = '嘉祥石雕（石雕·嘉祥石雕）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '[地理·中国]嘉祥石雕造型逼真 雕工圆润细腻 纹饰流畅洒脱', '中央广播电视总台央视网', 2025, 'https://tv.cctv.com/2025/11/05/VIDEApsYmCZ0UgTSkxQssrCU251105.shtml', '引用原站公开视频流，版权归原作者与机构；技术可嵌核验不代表开放授权，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '嘉祥石雕（石雕·嘉祥石雕）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/2025/11/05/VIDEApsYmCZ0UgTSkxQssrCU251105.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：真实影音原页，供观察节目所展示的内容；版权归来源机构。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/2025/11/05/VIDEApsYmCZ0UgTSkxQssrCU251105.shtml')
WHERE c.category = 'craft' AND c.title = '嘉祥石雕（石雕·嘉祥石雕）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 泰山玉雕刻（石雕·泰山玉雕刻）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '泰安税务：雕玉成器 税惠呵护匠心巧手', '央广网', 2023, 'https://www.cnr.cn/sd/tysd/20231115/t20231115_526486978.shtml', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '泰山玉雕刻（石雕·泰山玉雕刻）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.cnr.cn/sd/tysd/20231115/t20231115_526486978.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：介绍遇石记泰山玉雕刻与传承人师秀娜；项目细分名称与库中广义标题不同。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.cnr.cn/sd/tysd/20231115/t20231115_526486978.shtml')
WHERE c.category = 'craft' AND c.title = '泰山玉雕刻（石雕·泰山玉雕刻）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '发现不一样的泰安！带您一览2024“泰有礼”泰安城市礼品展', '泰安市文化和旅游局', 2024, 'https://whlyj.taian.gov.cn/art/2024/9/9/art_350861_10303832.html', '原机构公开图像；保留原网址与署名，仅链接引用，不复制或重新分发媒体；不等于取得开放授权'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '泰山玉雕刻（石雕·泰山玉雕刻）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://whlyj.taian.gov.cn/art/2024/9/9/art_350861_10303832.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：本文相邻标题明确标注“泰山玉吉祥如意系列产品”与“泰吉祥·泰如意文房系列产品”，据此采用两张对应作品图；产品展陈不替代具体工序演示。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://whlyj.taian.gov.cn/art/2024/9/9/art_350861_10303832.html')
WHERE c.category = 'craft' AND c.title = '泰山玉雕刻（石雕·泰山玉雕刻）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 肥城桃木雕刻
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '山东省传统村落肥城市仪阳街道办事处鱼山古村', '泰安市住房和城乡建设局', 2023, 'https://tajs.taian.gov.cn/art/2023/8/9/art_318699_10301263.html', '版权归原发布方；仅引用原始链接并署名，未发现本页明确禁止引用图片的声明，不视为开放授权。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '肥城桃木雕刻')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tajs.taian.gov.cn/art/2023/8/9/art_318699_10301263.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：原页“民俗文化”介绍肥城桃木雕刻、作品、传承人王来新，含配图；以该部分作为技艺资料，不据其中古代起源说覆盖正文。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tajs.taian.gov.cn/art/2023/8/9/art_318699_10301263.html')
WHERE c.category = 'craft' AND c.title = '肥城桃木雕刻'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '肥城桃木雕刻：以刀为笔 刻木生“花”', '山东广播电视台（齐鲁网）', 2024, 'https://v.iqilu.com/sdws/zasd/2024/0807/5569723.html', '原页公开提供MP4与嵌入分享代码；版权归原机构，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '肥城桃木雕刻')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://v.iqilu.com/sdws/zasd/2024/0807/5569723.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：真实影音原页，供观察节目所展示的内容。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://v.iqilu.com/sdws/zasd/2024/0807/5569723.html')
WHERE c.category = 'craft' AND c.title = '肥城桃木雕刻'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 德州黑陶烧制技艺（陶器烧制技艺·德州黑陶烧制技艺）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '陶器烧制技艺（德州黑陶烧制技艺）', '中国非物质文化遗产网', NULL, 'https://www.ihchina.cn/project_details/14466.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '德州黑陶烧制技艺（陶器烧制技艺·德州黑陶烧制技艺）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.ihchina.cn/project_details/14466.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：国家级项目Ⅷ-98；手工轮制、无釉压光、渗碳还原。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.ihchina.cn/project_details/14466.html')
WHERE c.category = 'craft' AND c.title = '德州黑陶烧制技艺（陶器烧制技艺·德州黑陶烧制技艺）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '德州黑陶亮相“运河大集” 为市民送上文化大餐', '山东广播电视台（齐鲁网）', 2026, 'https://v.iqilu.com/qlpd/mrxw/2026/0204/5846245.html', '原页公开提供MP4与嵌入分享代码；版权归原机构，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '德州黑陶烧制技艺（陶器烧制技艺·德州黑陶烧制技艺）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://v.iqilu.com/qlpd/mrxw/2026/0204/5846245.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：真实影音原页，供观察节目所展示的内容。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://v.iqilu.com/qlpd/mrxw/2026/0204/5846245.html')
WHERE c.category = 'craft' AND c.title = '德州黑陶烧制技艺（陶器烧制技艺·德州黑陶烧制技艺）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '中国黑陶城博物馆东厅黑陶精品展陈', '德州学院黑陶文化产业学院', NULL, 'https://ht.dzu.edu.cn/info/1003/1079.htm', '版权归原发布方；仅引用原始链接并署名，未发现本页明确禁止引用图片的声明，不视为开放授权。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '德州黑陶烧制技艺（陶器烧制技艺·德州黑陶烧制技艺）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://ht.dzu.edu.cn/info/1003/1079.htm');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：作品与现场照片原页；仅支持照片所述范围。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://ht.dzu.edu.cn/info/1003/1079.htm')
WHERE c.category = 'craft' AND c.title = '德州黑陶烧制技艺（陶器烧制技艺·德州黑陶烧制技艺）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 蟋蟀罐传统制作技艺（宁津）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '瓷器、核雕、鸽子会... 非遗项目过大年 德州启动线上非遗展播', '国际在线山东频道（德州文化和旅游局资料）', 2022, 'https://sd.cri.cn/20220130/64ca8177-f93d-94be-9bfa-9d5821605136.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '蟋蟀罐传统制作技艺（宁津）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://sd.cri.cn/20220130/64ca8177-f93d-94be-9bfa-9d5821605136.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：明确刘氏丫头蟋蟀罐：胶土、拉坯、压光、匣钵高温封窑还原。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://sd.cri.cn/20220130/64ca8177-f93d-94be-9bfa-9d5821605136.html')
WHERE c.category = 'craft' AND c.title = '蟋蟀罐传统制作技艺（宁津）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '山东省第五批省级非物质文化遗产代表性项目名录', '中国非物质文化遗产网（山东省名录）', 2021, 'https://www.ihchina.cn/Uploads/File/2021/11/23/u619cc935d42d7.pdf', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '蟋蟀罐传统制作技艺（宁津）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.ihchina.cn/Uploads/File/2021/11/23/u619cc935d42d7.pdf');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：名单第511项：蟋蟀罐传统制作技艺，申报地宁津县。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.ihchina.cn/Uploads/File/2021/11/23/u619cc935d42d7.pdf')
WHERE c.category = 'craft' AND c.title = '蟋蟀罐传统制作技艺（宁津）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '【乡约“她力量”】刘秀芬：蟋蟀罐里的巾帼力量', '山东广播电视台（齐鲁网）', 2025, 'https://v.iqilu.com/nkpd/xcjf/2025/1112/5805955.html', '原页公开提供MP4与嵌入分享代码；版权归原机构，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '蟋蟀罐传统制作技艺（宁津）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://v.iqilu.com/nkpd/xcjf/2025/1112/5805955.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：真实影音原页，供观察节目所展示的内容。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://v.iqilu.com/nkpd/xcjf/2025/1112/5805955.html')
WHERE c.category = 'craft' AND c.title = '蟋蟀罐传统制作技艺（宁津）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '宁津县刘营伍乡践行社会主义核心价值观 以敬业匠心赋能非遗传承', '大众网·海报新闻', 2026, 'https://hb.dzwww.com/p/pbEXdMBVjG6.html', '原机构公开图像；保留原网址与署名，仅链接引用，不复制或重新分发媒体；不等于取得开放授权'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '蟋蟀罐传统制作技艺（宁津）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://hb.dzwww.com/p/pbEXdMBVjG6.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：2026-09-09 原页报道刘记丫头蟋蟀罐非遗工坊探访，图中制罐者展示器物，后方有不同器形样品。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://hb.dzwww.com/p/pbEXdMBVjG6.html')
WHERE c.category = 'craft' AND c.title = '蟋蟀罐传统制作技艺（宁津）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 泥塑（惠民泥塑）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '泥塑（惠民泥塑）', '中国非物质文化遗产网', NULL, 'https://www.ihchina.cn/project_details/14051.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '泥塑（惠民泥塑）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.ihchina.cn/project_details/14051.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：国家级项目Ⅶ-47；捣泥制坯、晾干糊纸、涂粉上色、开眼涂胶；泥哨及活动玩具。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.ihchina.cn/project_details/14051.html')
WHERE c.category = 'craft' AND c.title = '泥塑（惠民泥塑）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '《农广天地》 20130829 惠民泥塑', '中央广播电视总台央视网', 2013, 'https://tv.cctv.com/2013/08/29/VIDE1409105343127739.shtml', '引用原站公开视频流，版权归原作者与机构；技术可嵌核验不代表开放授权，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '泥塑（惠民泥塑）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/2013/08/29/VIDE1409105343127739.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：真实影音原页，供观察节目所展示的内容；版权归来源机构。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/2013/08/29/VIDE1409105343127739.shtml')
WHERE c.category = 'craft' AND c.title = '泥塑（惠民泥塑）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 柳编（博兴柳编）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '柳编（博兴柳编）', '中国非物质文化遗产网', NULL, 'https://www.ihchina.cn/project_details/14108.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '柳编（博兴柳编）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.ihchina.cn/project_details/14108.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：国家级项目Ⅶ-55；蒲草苇草等湿地材料与家居器物。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.ihchina.cn/project_details/14108.html')
WHERE c.category = 'craft' AND c.title = '柳编（博兴柳编）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '《经济半小时》 20140719 村庄创富记：“草柳村”今昔', '中央广播电视总台央视网', 2014, 'https://tv.cctv.com/2014/07/19/VIDE1405780740754751.shtml', '引用原站公开视频流，版权归原作者与机构；技术可嵌核验不代表开放授权，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '柳编（博兴柳编）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/2014/07/19/VIDE1405780740754751.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：2014年博兴湾头村现场记录，可用于观察传统材料、编织和产业背景；不作当前经济数据。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/2014/07/19/VIDE1405780740754751.shtml')
WHERE c.category = 'craft' AND c.title = '柳编（博兴柳编）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '博兴草柳编作品与制作图文', '新华财经（中国金融信息网）', NULL, 'https://www.cnfin.com/cmjj-lb/detail/20230110/3782700_1.html', '原页明示“未经授权 不得转载”；仅保留原页入口'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '柳编（博兴柳编）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.cnfin.com/cmjj-lb/detail/20230110/3782700_1.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：作品与现场素材原页；仅支持素材所述范围。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.cnfin.com/cmjj-lb/detail/20230110/3782700_1.html')
WHERE c.category = 'craft' AND c.title = '柳编（博兴柳编）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 毛笔制作技艺（广饶齐笔制作技艺）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '第三批省级非遗生产性保护示范基地出炉 广饶齐笔入选', '山东广播电视台闪电新闻（东营台、广饶台）', 2017, 'https://sdxw.iqilu.com/share/YS0yMS02OTgzNTg=.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '毛笔制作技艺（广饶齐笔制作技艺）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://sdxw.iqilu.com/share/YS0yMS02OTgzNTg=.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：浸、拔、梳、并、连、剔、修、刻字工序与尖齐圆健四德。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://sdxw.iqilu.com/share/YS0yMS02OTgzNTg=.html')
WHERE c.category = 'craft' AND c.title = '毛笔制作技艺（广饶齐笔制作技艺）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '《远方的家》 20111219 沿海行（15）', '中央广播电视总台央视网', 2011, 'https://tv.cctv.com/2011/12/19/VIDE1397721288122844.shtml', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '毛笔制作技艺（广饶齐笔制作技艺）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/2011/12/19/VIDE1397721288122844.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：2011年东营沿海行整期，齐笔制作是节目第六节，尚未核定章节时间；请标整期而非齐笔专门短片。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/2011/12/19/VIDE1397721288122844.shtml')
WHERE c.category = 'craft' AND c.title = '毛笔制作技艺（广饶齐笔制作技艺）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '【传承非遗技艺】广饶：齐笔工坊翰墨香 千年技艺写“共富”', '山东广播电视台（齐鲁网）', 2026, 'https://v.iqilu.com/nkpd/snxw/2026/0209/5848837.html', '原页公开提供MP4与嵌入分享代码；版权归原机构，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '毛笔制作技艺（广饶齐笔制作技艺）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://v.iqilu.com/nkpd/snxw/2026/0209/5848837.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：真实影音原页，供观察节目所展示的内容。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://v.iqilu.com/nkpd/snxw/2026/0209/5848837.html')
WHERE c.category = 'craft' AND c.title = '毛笔制作技艺（广饶齐笔制作技艺）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 黄河口芦苇画
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '“老手艺”的时尚传承', '新华网', 2023, 'https://www.xinhuanet.com/culture/20230602/aeff368ea36741c5a82f1c7485bc33ac/c.html', '版权归原发布方；仅引用原始链接并署名，未发现本页明确禁止引用图片的声明，不视为开放授权。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'craft' AND c.title = '黄河口芦苇画')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.xinhuanet.com/culture/20230602/aeff368ea36741c5a82f1c7485bc33ac/c.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：东营乐安苇编传承人李光祥；选材、浸泡、熨烫、构图、裁剪、烫画、缝边工序与湿地题材。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.xinhuanet.com/culture/20230602/aeff368ea36741c5a82f1c7485bc33ac/c.html')
WHERE c.category = 'craft' AND c.title = '黄河口芦苇画'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 尧的传说（鄄城谷林）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '山东省第五批省级非物质文化遗产代表性项目名录', '中国非物质文化遗产网（山东省名录）', 2021, 'https://www.ihchina.cn/Uploads/File/2021/11/23/u619cc935d42d7.pdf', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '尧的传说（鄄城谷林）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.ihchina.cn/Uploads/File/2021/11/23/u619cc935d42d7.pdf');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：表中尧的传说申报地为鄄城县；库中文案不能把山西/菏泽其他地区国家级归属套给鄄城谷林。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.ihchina.cn/Uploads/File/2021/11/23/u619cc935d42d7.pdf')
WHERE c.category = 'literature' AND c.title = '尧的传说（鄄城谷林）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '图像文献：宋代马麟《帝尧立像》', '马麟绘；台北故宫博物院藏；Wikimedia Commons', NULL, 'https://commons.wikimedia.org/wiki/File:Ma_Lin_-_Emperor_Yao.jpg', 'Public domain（Commons文件原页PD-Art／PD-old-100）'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '尧的传说（鄄城谷林）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://commons.wikimedia.org/wiki/File:Ma_Lin_-_Emperor_Yao.jpg');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：宋代后世艺术形象，供比较尧传说的图像传播；不是鄄城出土文物、尧的真实肖像或鄄城谷林现场照片。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://commons.wikimedia.org/wiki/File:Ma_Lin_-_Emperor_Yao.jpg')
WHERE c.category = 'literature' AND c.title = '尧的传说（鄄城谷林）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 麒麟传说
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '麒麟传说', '中国非物质文化遗产网', NULL, 'https://www.ihchina.cn/project_details/12268.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '麒麟传说')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.ihchina.cn/project_details/12268.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：巨野县项目Ⅰ-43，西狩获麟、孔母梦麟、麒麟送子等故事母题，关联获麟台等地方风物。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.ihchina.cn/project_details/12268.html')
WHERE c.category = 'literature' AND c.title = '麒麟传说'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '当代麒麟雕塑：传说的地方文化表达', '济宁市文化和旅游局', 2021, 'https://whlyj.jining.gov.cn/art/2021/1/26/art_69979_2705987.html', '版权归原发布方；仅引用原始链接并署名，未发现本页明确禁止引用图片的声明，不视为开放授权。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '麒麟传说')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://whlyj.jining.gov.cn/art/2021/1/26/art_69979_2705987.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：作品与现场素材原页；仅支持素材所述范围。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://whlyj.jining.gov.cn/art/2021/1/26/art_69979_2705987.html')
WHERE c.category = 'literature' AND c.title = '麒麟传说'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 大舜传说
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '济南市系列主题宣讲基层行走进市交通运输局', '济南市交通运输局', 2026, 'https://jnjtj.jinan.gov.cn/col/col15149/art/2026/art_1ed475235a414e318296579b6f6146a2.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '大舜传说')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://jnjtj.jinan.gov.cn/col/col15149/art/2026/art_1ed475235a414e318296579b6f6146a2.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：由历下区大舜传说省级非遗传承人赵志刚讲述舜文化；仅支持传承人/地方传承，不把舜事当信史。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://jnjtj.jinan.gov.cn/col/col15149/art/2026/art_1ed475235a414e318296579b6f6146a2.html')
WHERE c.category = 'literature' AND c.title = '大舜传说'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '当代演绎：千佛山重阳山会大舜巡游', '济南发布（济南市政府新闻办官方澎湃号）', NULL, 'https://m.thepaper.cn/newsDetail_forward_31825125', '版权归原发布方；仅引用原始链接并署名，未发现本页明确禁止引用图片的声明，不视为开放授权。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '大舜传说')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://m.thepaper.cn/newsDetail_forward_31825125');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：作品与现场照片原页；仅支持照片所述范围。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://m.thepaper.cn/newsDetail_forward_31825125')
WHERE c.category = 'literature' AND c.title = '大舜传说'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 闵子骞传说
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '闵子骞孝行的文学流传', '全国哲学社会科学工作办公室', 2019, 'https://www.nopss.gov.cn/n1/2019/0610/c219470-31126949.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '闵子骞传说')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.nopss.gov.cn/n1/2019/0610/c219470-31126949.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：梳理芦衣故事的文学流传与版本差异，指出故事传闻性质；适合故事排序，明确传说标签。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.nopss.gov.cn/n1/2019/0610/c219470-31126949.html')
WHERE c.category = 'literature' AND c.title = '闵子骞传说'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '海右名士第三十三期：闵子骞', '济南广播电视台（济南市政府网转载）', 2025, 'https://www.jinan.gov.cn/col/col73383/art/2025/art_2ea538ab260d46909c2335503eb5665d.html', '引用原页公开视频，版权归原机构，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '闵子骞传说')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.jinan.gov.cn/col/col73383/art/2025/art_2ea538ab260d46909c2335503eb5665d.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：作品与现场素材原页；仅支持素材所述范围。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.jinan.gov.cn/col/col73383/art/2025/art_2ea538ab260d46909c2335503eb5665d.html')
WHERE c.category = 'literature' AND c.title = '闵子骞传说'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 东方朔传说
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '东方朔传说:东方朔传为岁星下凡', '大众网山东文史地图', 2013, 'https://dzwww.com/2013/sdwsdt/dzwsdt/lxwsdt/lxywcs/201312/t20131211_9332213.htm', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '东方朔传说')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://dzwww.com/2013/sdwsdt/dzwsdt/lxwsdt/lxywcs/201312/t20131211_9332213.htm');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：陵县神头镇口承、岁星下凡故事与地方传承；历史人物和民间神话区分呈现。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://dzwww.com/2013/sdwsdt/dzwsdt/lxwsdt/lxywcs/201312/t20131211_9332213.htm')
WHERE c.category = 'literature' AND c.title = '东方朔传说'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '东方朔庙会当代纪念礼仪现场', '陵城融媒（齐鲁网·闪电新闻）', NULL, 'https://sdxw.iqilu.com/w/article/YS0yMS00NjcwNDQ2.html', '版权归原发布方；仅引用原始链接并署名，原页未见明示必须书面授权；非开放授权。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '东方朔传说')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://sdxw.iqilu.com/w/article/YS0yMS00NjcwNDQ2.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：作品与现场素材原页；仅支持素材所述范围。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://sdxw.iqilu.com/w/article/YS0yMS00NjcwNDQ2.html')
WHERE c.category = 'literature' AND c.title = '东方朔传说'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 四女寺的传说
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '山东武城县四女祠传说考辨（德州学院学报，2020年第3期）', '德州学院学报（胡梦飞）', 2020, 'https://dzxyxb.dzu.edu.cn/__local/9/56/97/AE839DE5B15954E255800CABB27_94782008_36D848.pdf', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '四女寺的传说')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://dzxyxb.dzu.edu.cn/__local/9/56/97/AE839DE5B15954E255800CABB27_94782008_36D848.pdf');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：胡梦飞原始研究，考辨傅氏四女、宋氏姊妹和“四棵柳树”地名演变等说法；未支持把其中任一解释认定唯一史实。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://dzxyxb.dzu.edu.cn/__local/9/56/97/AE839DE5B15954E255800CABB27_94782008_36D848.pdf')
WHERE c.category = 'literature' AND c.title = '四女寺的传说'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 孟姜女传说（淄博）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '孟姜女传说', '中国非物质文化遗产网', NULL, 'https://www.ihchina.cn/project_details/12192/', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '孟姜女传说（淄博）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.ihchina.cn/project_details/12192/');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：淄博国家级Ⅰ-8；源于杞梁妻故事，博山悲歌哀哭习俗。官方叙述不同于库中秦长城版本，适合并列版本比较。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.ihchina.cn/project_details/12192/')
WHERE c.category = 'literature' AND c.title = '孟姜女传说（淄博）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '寻找孟姜女 下集', '中央广播电视总台央视网', 2010, 'https://tv.cctv.com/2010/02/27/VIDE1384937048552975.shtml', '引用原站公开视频流，版权归原作者与机构；技术可嵌核验不代表开放授权，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '孟姜女传说（淄博）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/2010/02/27/VIDE1384937048552975.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：纪录片对传说流变与长城地点进行探寻；文化叙事与学术假说不等于历史定论。旧节目，仅用于比较传说版本。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/2010/02/27/VIDE1384937048552975.shtml')
WHERE c.category = 'literature' AND c.title = '孟姜女传说（淄博）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '孟姜女传说采风与民歌传承现场（一）', '淄博市教育局（淄川区教育和体育局）', 2022, 'https://edu.zibo.gov.cn/art/2022/9/28/art_3533_2328655.html', '版权归原发布方；仅引用原始链接并署名，原页未见明示必须书面授权；非开放授权。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '孟姜女传说（淄博）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://edu.zibo.gov.cn/art/2022/9/28/art_3533_2328655.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：作品与现场素材原页；仅支持素材所述范围。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://edu.zibo.gov.cn/art/2022/9/28/art_3533_2328655.html')
WHERE c.category = 'literature' AND c.title = '孟姜女传说（淄博）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 牛郎织女传说（沂源）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '牛郎织女传说', '中国非物质文化遗产网', NULL, 'https://www.ihchina.cn/Article/Index/detail?id=12254', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '牛郎织女传说（沂源）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.ihchina.cn/Article/Index/detail?id=12254');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：沂源县国家级Ⅰ-36；星宿意象、男耕女织、七夕乞巧、地方遗迹；不要将地方化传说视为人物生活实证。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.ihchina.cn/Article/Index/detail?id=12254')
WHERE c.category = 'literature' AND c.title = '牛郎织女传说（沂源）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '沂源牛郎织女寻踪', '央视网', NULL, 'https://tv.cctv.com/2010/05/18/VIDE1384937047438877.shtml', '引用原站公开视频流，版权归原作者与机构；技术可嵌核验不代表开放授权，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '牛郎织女传说（沂源）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/2010/05/18/VIDE1384937047438877.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：影像资料原页，用于对照观察。央视原页观看；旧节目，仅用于传说地方化研究，不作当下旅游信息；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/2010/05/18/VIDE1384937047438877.shtml')
WHERE c.category = 'literature' AND c.title = '牛郎织女传说（沂源）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 董永传说
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '孝子董永', '山东公共文化云·滨州市博兴县文化馆', 2022, 'https://www.sdpcc.com/article/12091', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '董永传说')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.sdpcc.com/article/12091');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：文化馆介绍董永卖身葬父与天仙配题材，人物从史事/孝子叙事到神话演变。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.sdpcc.com/article/12091')
WHERE c.category = 'literature' AND c.title = '董永传说'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '图像文献：1830年《古圣贤像传略》董孝子像', '孔莲卿绘；Wikimedia Commons公开馆藏扫描', NULL, 'https://commons.wikimedia.org/wiki/File:%E8%91%A3%E5%AD%9D%E5%AD%90%E5%83%8F%EF%BC%88%E5%8F%A4%E8%81%96%E8%B3%A2%E5%83%8F%E5%82%B3%E7%95%A7%EF%BC%89.jpg', 'Public domain（Commons文件原页PD-old／CC-PD-Mark）'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '董永传说')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://commons.wikimedia.org/wiki/File:%E8%91%A3%E5%AD%9D%E5%AD%90%E5%83%8F%EF%BC%88%E5%8F%A4%E8%81%96%E8%B3%A2%E5%83%8F%E5%82%B3%E7%95%A7%EF%BC%89.jpg');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：1830年后世图像文献，用于观察董永形象的传播；不是汉代真实肖像或博兴现场实拍。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://commons.wikimedia.org/wiki/File:%E8%91%A3%E5%AD%9D%E5%AD%90%E5%83%8F%EF%BC%88%E5%8F%A4%E8%81%96%E8%B3%A2%E5%83%8F%E5%82%B3%E7%95%A7%EF%BC%89.jpg')
WHERE c.category = 'literature' AND c.title = '董永传说'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 丈八佛传说
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '山东博兴：文旅融合为乡村振兴赋彩', '文化和旅游部', 2023, 'https://www.mct.gov.cn/whzx/qgwhxxlb/sd/202312/t20231204_950081.htm', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '丈八佛传说')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.mct.gov.cn/whzx/qgwhxxlb/sd/202312/t20231204_950081.htm');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：支持博兴湖滨镇丈八佛村的兴国寺丈八佛文旅资源；并不证实库中所有灵验故事或市级非遗级别，保留待核提示。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.mct.gov.cn/whzx/qgwhxxlb/sd/202312/t20231204_950081.htm')
WHERE c.category = 'literature' AND c.title = '丈八佛传说'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '博兴丈八佛庙会现场', '齐鲁网（转载大众网，记者吕云龙）', 2017, 'https://binzhou.iqilu.com/bzminsheng/2017/0204/3370439.shtml', '版权归原发布方；仅引用原始链接并署名，原页未见明示必须书面授权；非开放授权。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'literature' AND c.title = '丈八佛传说')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://binzhou.iqilu.com/bzminsheng/2017/0204/3370439.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：作品与现场素材原页；仅支持素材所述范围。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://binzhou.iqilu.com/bzminsheng/2017/0204/3370439.shtml')
WHERE c.category = 'literature' AND c.title = '丈八佛传说'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 甏肉干饭
UPDATE cultural_item c SET c.image_anime_url = '/images/cultural/bengrou_rice.webp'
WHERE c.category = 'food_opera' AND c.title = '甏肉干饭' AND (c.image_anime_url IS NULL OR c.image_anime_url = '');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '甏肉干饭', '济宁市人民政府', 2025, 'https://www.jining.gov.cn/art/2025/4/7/art_65758_2898310.html', '未发现开放许可；版权归来源机构/作者，未复制下载。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'food_opera' AND c.title = '甏肉干饭')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.jining.gov.cn/art/2025/4/7/art_65758_2898310.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：以陶器甏炖五花肉，卷煎、面筋、豆腐皮、鸡蛋与米饭搭配。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.jining.gov.cn/art/2025/4/7/art_65758_2898310.html')
WHERE c.category = 'food_opera' AND c.title = '甏肉干饭'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '[味道]街巷食味（9） 甏肉干饭在任城落地生根', '中央广播电视总台央视网', 2024, 'https://tv.cctv.com/2024/05/30/VIDEjrQIzbW3JXULy8JWoIOX240530.shtml', '引用原站公开视频流，版权归原作者与机构；技术可嵌核验不代表开放授权，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'food_opera' AND c.title = '甏肉干饭')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/2024/05/30/VIDEjrQIzbW3JXULy8JWoIOX240530.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：作品与现场素材原页；仅支持素材所述范围。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/2024/05/30/VIDEjrQIzbW3JXULy8JWoIOX240530.shtml')
WHERE c.category = 'food_opera' AND c.title = '甏肉干饭'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 四平调（金乡四平调）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '四平调', '中国非物质文化遗产网', NULL, 'https://www.ihchina.cn/project_details/13253/', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'food_opera' AND c.title = '四平调（金乡四平调）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.ihchina.cn/project_details/13253/');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：金乡县项目Ⅳ-50；平调板式、四句旋律、以高胡为主要伴奏乐器。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.ihchina.cn/project_details/13253/')
WHERE c.category = 'food_opera' AND c.title = '四平调（金乡四平调）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '《欢乐大猜想》20230812（金乡四平调）', '央视网', NULL, 'https://tv.cctv.com/2023/08/12/VIDEUWPBAHmpX1rKWyKiRYpc230812.shtml', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'food_opera' AND c.title = '四平调（金乡四平调）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/2023/08/12/VIDEUWPBAHmpX1rKWyKiRYpc230812.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：影像资料原页，用于对照观察。央视官方原页播放器观看；未核验跨站嵌入或素材复制许可；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/2023/08/12/VIDEUWPBAHmpX1rKWyKiRYpc230812.shtml')
WHERE c.category = 'food_opera' AND c.title = '四平调（金乡四平调）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '[欢乐大猜想]金乡四平调名称的由来是什么？', '中央广播电视总台央视网', NULL, 'https://tv.cctv.com/2023/08/12/VIDEy9h3MQCSK7lKouTsBDBA230812.shtml', '引用原站公开视频流，版权归原作者与机构；技术可嵌核验不代表开放授权，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'food_opera' AND c.title = '四平调（金乡四平调）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/2023/08/12/VIDEy9h3MQCSK7lKouTsBDBA230812.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：真实影音原页，供观察节目所展示的内容；原节目版权归来源机构。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/2023/08/12/VIDEy9h3MQCSK7lKouTsBDBA230812.shtml')
WHERE c.category = 'food_opera' AND c.title = '四平调（金乡四平调）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 泰山豆腐宴
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '我们最喜欢吃各地美食，能不能给我讲讲泰安有哪些美食？', '泰安市文化和旅游局', 2026, 'https://whlyj.taian.gov.cn/art/2026/4/13/art_366263_10312080.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'food_opera' AND c.title = '泰山豆腐宴')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://whlyj.taian.gov.cn/art/2026/4/13/art_366263_10312080.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：明确泰山豆腐宴是豆腐传统制作技艺的活态展示方式；国家级项目是技艺，不能把宴席概念当独立名录名。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://whlyj.taian.gov.cn/art/2026/4/13/art_366263_10312080.html')
WHERE c.category = 'food_opera' AND c.title = '泰山豆腐宴'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '泰山豆腐宴菜品实拍', '泰安市文化和旅游局', 2026, 'https://whlyj.taian.gov.cn/art/2026/3/12/art_365230_10311647.html', '版权归原发布方；仅引用原始链接并署名，未发现本页明确禁止引用图片的声明，不视为开放授权。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'food_opera' AND c.title = '泰山豆腐宴')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://whlyj.taian.gov.cn/art/2026/3/12/art_365230_10311647.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：作品与现场照片原页；仅支持照片所述范围。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://whlyj.taian.gov.cn/art/2026/3/12/art_365230_10311647.html')
WHERE c.category = 'food_opera' AND c.title = '泰山豆腐宴'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 山东梆子（泰安）
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '山东梆子', '中国非物质文化遗产网', NULL, 'https://www.ihchina.cn/project_details/13521/', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'food_opera' AND c.title = '山东梆子（泰安）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.ihchina.cn/project_details/13521/');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：项目Ⅳ-118，泰安市保护单位；梆子、板胡等伴奏与唱腔特征。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.ihchina.cn/project_details/13521/')
WHERE c.category = 'food_opera' AND c.title = '山东梆子（泰安）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '山东梆子《泰山石敢当》2-3（泰安市山东梆子剧团）', '央视网', NULL, 'https://tv.cctv.com/v/v1/VIDE1355619984056451.html', '引用原站公开视频流，版权归原作者与机构；技术可嵌核验不代表开放授权，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'food_opera' AND c.title = '山东梆子（泰安）')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/v/v1/VIDE1355619984056451.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：影像资料原页，用于对照观察。央视官方原页播放器观看；未核验跨站嵌入或素材复制许可；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/v/v1/VIDE1355619984056451.html')
WHERE c.category = 'food_opera' AND c.title = '山东梆子（泰安）'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 临清什香面
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '山东·“春‘运’来临 千年运河文化”之旅', '文化和旅游部', 2023, 'https://zhuanti.mct.gov.cn/mmyghcyt2023/hjgn/detail/4996.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'food_opera' AND c.title = '临清什香面')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://zhuanti.mct.gov.cn/mmyghcyt2023/hjgn/detail/4996.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：明确什读shí、取什锦之意，也称十香面，菜码品种多样；套餐配菜随厨师与季节变化。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://zhuanti.mct.gov.cn/mmyghcyt2023/hjgn/detail/4996.html')
WHERE c.category = 'food_opera' AND c.title = '临清什香面'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '《乐游新乡村》 20251220 沿着运河游古城', '中央广播电视总台央视网', 2025, 'https://tv.cctv.com/2025/12/20/VIDEnwPA8G0IH9aaMPC764nJ251220.shtml', '引用原站公开视频流，版权归原作者与机构；技术可嵌核验不代表开放授权，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'food_opera' AND c.title = '临清什香面')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/2025/12/20/VIDEnwPA8G0IH9aaMPC764nJ251220.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：《乐游新乡村》临清整期节目，第一站跟随非遗传承人买菜码、学做什香面；后续还包含园林、钞关、贡砖等临清内容。章节时间尚未核定。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/2025/12/20/VIDEnwPA8G0IH9aaMPC764nJ251220.shtml')
WHERE c.category = 'food_opera' AND c.title = '临清什香面'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 聊城八角鼓
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '非遗传承人进校园 聊城八角鼓奏新歌', '聊城大学东昌学院音乐系', 2022, 'https://yyx.lcudcc.edu.cn/info/1087/2162.htm', '未发现开放许可；版权归来源机构/作者，未复制下载。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'food_opera' AND c.title = '聊城八角鼓')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://yyx.lcudcc.edu.cn/info/1087/2162.htm');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：商景刚传承人讲解，现场演示拍、弹、搓、碰、摇手法；曲艺与戏曲应区别，互动不以泛戏曲脸谱代替。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://yyx.lcudcc.edu.cn/info/1087/2162.htm')
WHERE c.category = 'food_opera' AND c.title = '聊城八角鼓'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 滨州锅子饼
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '《回家吃饭》20180620 波罗叶饼 滨州锅子饼', '央视网', 2018, 'https://tv.cctv.com/2018/06/20/VIDEoTrBWEXxq1KiD5igodJO180620.shtml', '引用原站公开视频流，版权归原作者与机构；技术可嵌核验不代表开放授权，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'food_opera' AND c.title = '滨州锅子饼')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/2018/06/20/VIDEoTrBWEXxq1KiD5igodJO180620.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：厨师示范滨州锅子饼，饼皮包裹馅料；节目还含波罗叶饼，不能把其素材误标为锅子饼。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/2018/06/20/VIDEoTrBWEXxq1KiD5igodJO180620.shtml')
WHERE c.category = 'food_opera' AND c.title = '滨州锅子饼'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');

-- 沾化渔鼓戏
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'official_site', '道情戏（沾化渔鼓戏）', '中国非物质文化遗产网', NULL, 'https://www.ihchina.cn/project_details/13323.html', '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'food_opera' AND c.title = '沾化渔鼓戏')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://www.ihchina.cn/project_details/13323.html');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：国家级Ⅳ-71；渔鼓道情、地方歌舞、渔民号子与三句一番唱词。；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://www.ihchina.cn/project_details/13323.html')
WHERE c.category = 'food_opera' AND c.title = '沾化渔鼓戏'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)
SELECT 'article', '[生财有道]国家级非物质文化遗产代表性项目——沾化渔鼓戏', '央视网', NULL, 'https://tv.cctv.com/2026/07/27/VIDEoHTGbvVnWmNkKfvjpBKt260727.shtml', '引用原站公开视频流，版权归原作者与机构；技术可嵌核验不代表开放授权，不复制或重新分发媒体'
WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE c.category = 'food_opera' AND c.title = '沾化渔鼓戏')
AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = 'https://tv.cctv.com/2026/07/27/VIDEoHTGbvVnWmNkKfvjpBKt260727.shtml');
INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)
SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', '扩展资料：影像资料原页，用于对照观察。央视官方原页播放器观看；未核验跨站嵌入或素材复制许可；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。'
FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = 'https://tv.cctv.com/2026/07/27/VIDEoHTGbvVnWmNkKfvjpBKt260727.shtml')
WHERE c.category = 'food_opera' AND c.title = '沾化渔鼓戏'
AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');
