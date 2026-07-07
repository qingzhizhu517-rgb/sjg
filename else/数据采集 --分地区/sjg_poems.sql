-- ========================================
-- 诗词导入 SQL (自动查 poet_id / spot_id)
-- 生成时间: 2026-06-17 18:12:26
-- 共 195 首
-- ========================================

START TRANSACTION;
SET FOREIGN_KEY_CHECKS = 0;

-- 如果诗词表已有数据且要覆盖，取消下面这行的注释
-- TRUNCATE TABLE poem;

INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 1, '陪李北海宴历下亭', '东藩驻皂盖，北渚凌青荷。海右此亭古，济南名士多。', (SELECT id FROM poet WHERE name = '杜甫' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '大明湖' LIMIT 1),  '历下亭原址已移建；意象: 青荷、碧波、古亭、名士；出处: 《全唐诗》卷216', '杜甫、李邕曾游宴，有"济南名士多"典故',  '["青荷", "碧波", "古亭", "名士"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杜甫' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '大明湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 2, '谐石缘游历下亭', '城外青山城里湖，七桥风月一亭孤。秋云拂镜荒蒲芡，水气销烟冷画图。邕甫名游谁可继，颍杭胜迹未全输。酒船祇傍鸥边舣，携被重来兴有无。', (SELECT id FROM poet WHERE name = '黄景仁' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '大明湖' LIMIT 1),  '意象: 青山、云、船；出处: 《词林正韵》', '杜甫、李邕曾游宴，有"济南名士多"典故',  '["青山", "云", "船"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '黄景仁' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '大明湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 3, '趵突泉', '一派遥从玉水分，暗来都洒历山尘。滋荣冬茹温尝早，润泽春茶味更真。已觉路傍行似鉴，最怜沙际涌如轮。曾成齐鲁封疆会，况托娥英诧世人。', (SELECT id FROM poet WHERE name = '曾巩' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '趵突泉' LIMIT 1),  '意象: 清泉、历山、春茶；出处: 《元丰类稿》卷七', '乾隆御封"天下第一泉"，为济南三大名胜之一',  '["清泉", "历山", "春茶"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '曾巩' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '趵突泉' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 4, '趵突泉', '渴马崖前水满川，江心泉迸蕊珠圆。济南七十泉流乳，趵突独称第一泉。', (SELECT id FROM poet WHERE name = '晏璧' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '趵突泉' LIMIT 1),  '意象: 泉水、趵突泉；出处: 《七十二泉诗》', '乾隆御封"天下第一泉"，为济南三大名胜之一',  '["泉水", "趵突泉"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '晏璧' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '趵突泉' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 5, '咏千佛山', '玉簪山对玉渊澄，翠影漙漙落半升。最爱千佛山色好，夜凉扶月过齐城。', (SELECT id FROM poet WHERE name = '赵孟頫' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '千佛山' LIMIT 1),  '意象: 青山、齐城、月色；出处: 《松雪斋集》卷五', '佛教名山，济南三大名胜之一，有舜耕传说',  '["青山", "齐城", "月色"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '赵孟頫' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '千佛山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 6, '咏华不注', '泺水发源天下无，平地涌出白玉壶。谷虚久恐元气泄，岁旱不愁东海枯。云雾润蒸华不注，波涛声震大明湖。时来泉上濯尘土，冰雪满怀清兴孤。', (SELECT id FROM poet WHERE name = '赵孟頫' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '华不注山' LIMIT 1),  '此诗原题为《趵突泉》，兼咏华不注；意象: 孤峰、云雾、泺水、泉；出处: 《松雪斋集》卷四', '孤峰刺天，历代画家诗人题咏众多，赵孟頫《鹊华秋色》主角之一',  '["孤峰", "云雾", "泺水", "泉"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '赵孟頫' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '华不注山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 7, '昔我游齐都', '昔我游齐都，登华不注峰。兹山何峻秀，绿翠入芙蓉。家家泉水，户户垂杨。', (SELECT id FROM poet WHERE name = '李白' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '华不注山' LIMIT 1),  '意象: 山峰、泉水、垂杨；出处: 《古风·其二十》', '孤峰刺天，历代画家诗人题咏众多，赵孟頫《鹊华秋色》主角之一',  '["山峰", "泉水", "垂杨"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李白' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '华不注山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 8, '鹊山', '乡县交邻境，岗峦抱郭斜。石藏丹灶药，山属羽人家。烟树高低见，川原远近赊。不应容老鹊，千岁复藏巢。', (SELECT id FROM poet WHERE name = '元好问' LIMIT 1), 9, (SELECT id FROM scenic_spot WHERE name = '鹊山' LIMIT 1),  '意象: 烟树、丹灶、远山；出处: 《元遗山诗集笺注》卷五', '与华不注并称鹊华，为赵孟頫《鹊华秋色》主角之一',  '["烟树", "丹灶", "远山"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '元好问' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '鹊山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 9, '汇波楼晚望', '高楼薄暝射平沙，返照衔山落照斜。水满平芜飞白鸟，林藏古刹出黄花。断霞映水明渔浦，芳草连浦起暮鸦。渔笛数声桡几两，令人却忆泛仙槎。', (SELECT id FROM poet WHERE name = '胡缵宗' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '汇波楼' LIMIT 1),  '意象: 晚照、秋水、白鸟、渔浦；出处: 《鸟鼠山人集》卷九', '汇波晚照为济南八景之一',  '["晚照", "秋水", "白鸟", "渔浦"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '胡缵宗' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '汇波楼' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 10, '济南杂诗', '白烟消尽冻云凝，山月飞来夜气澄。且向波间看玉塔，不须桥畔觅金绳。', (SELECT id FROM poet WHERE name = '元好问' LIMIT 1), 9, (SELECT id FROM scenic_spot WHERE name = '汇波楼' LIMIT 1),  '意象: 楼阁、月亮；出处: 《遗山集》', '汇波晚照为济南八景之一',  '["楼阁", "月亮"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '元好问' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '汇波楼' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 11, '游五龙潭', '一派灵源滚滚来，寒声长振古城隈。细通云气藏深洞，暗入湖光浸绿苔。地胜不随人事改，岁寒谁识此心回。我来欲濯尘缨去，为爱清风两腋开。', (SELECT id FROM poet WHERE name = '曾巩' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '五龙潭' LIMIT 1),  '意象: 灵源、寒泉、深洞、绿苔；出处: 《元丰类稿》卷九', '传说为秦琼故居，泉群汇为深潭',  '["灵源", "寒泉", "深洞", "绿苔"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '曾巩' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '五龙潭' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 12, '珍珠泉', '济南多名泉，趵突珍珠最显著。一泓清绝沁诗脾，百斛跳丸泻潺湲。岸旁杨柳自成幄，石隙苔藓青无痕。我来坐对久忘去，胸尘一洗空千烦。', (SELECT id FROM poet WHERE name = '王昶' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '珍珠泉' LIMIT 1),  '意象: 跳丸、清泉、杨柳、苔藓；出处: 《春融堂集》卷十一', '泉沸如浮珍珠，为济南四大名泉之一',  '["跳丸", "清泉", "杨柳", "苔藓"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '王昶' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '珍珠泉' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 13, '黑虎泉', '石蟠三窍吼寒泉，怒喷涛声落槛前。疑是真虎出山穴，长风飒飒生春烟。', (SELECT id FROM poet WHERE name = '刘藻' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黑虎泉' LIMIT 1),  '意象: 寒泉、涛声、猛虎、春烟；出处: 《济南府志·艺文志》', '三兽喷黑水，声如虎啸，为济南四大名泉之一',  '["寒泉", "涛声", "猛虎", "春烟"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '刘藻' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黑虎泉' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 14, '趵突泉歌', '趵突泉头万玉垒，喷珠溅雪流无穷。我来坐久心自静，一洗万虑归真空。须知此水本无妄，不逐众派争朝东。发源应自太古来，直与沧海通无穷。', (SELECT id FROM poet WHERE name = '王守仁' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '趵突泉' LIMIT 1),  '意象: 万玉、喷珠、清泉、真空；出处: 《王文成公全书》卷二十', '被誉为天下第一泉',  '["万玉", "喷珠", "清泉", "真空"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '王守仁' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '趵突泉' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 15, '大明湖', '荷花杨柳映平湖，云影天光入画图。四面亭台开罨画，一川风月满蒲菰。济南胜槩天下少，况复此亭当胜区。日暮移舟更回首，青山隐隐隔城隅。', (SELECT id FROM poet WHERE name = '赵孟頫' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '大明湖' LIMIT 1),  '意象: 荷花、杨柳、平湖、风月；出处: 《松雪斋集》卷四', '济南三大名胜之一，四面荷花三面柳',  '["荷花", "杨柳", "平湖", "风月"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '赵孟頫' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '大明湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 16, '再题趵突泉', '历城泺水古名泉，趵突突出异他泉。三穴跳出冰玉碎，万斛涌作银河悬。震雷平地走风雾，倒景落半天涵渊。观民问俗偶一憩，便觉襟袖皆清寒。', (SELECT id FROM poet WHERE name = '乾隆' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '趵突泉' LIMIT 1),  '意象: 冰玉、银河、震雷、清泉；出处: 《御制诗集初集》卷三十', '被誉为天下第一泉',  '["冰玉", "银河", "震雷", "清泉"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '乾隆' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '趵突泉' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 17, '题铁公祠', '历下亭前芳草青，铁公祠下晚烟青。平湖十顷碧于染，剩有残山剩水形。', (SELECT id FROM poet WHERE name = '刘鹗' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '大明湖' LIMIT 1),  '意象: 芳草、平湖、晚烟、残山；出处: 《铁云诗存》', '祠堂临湖，可览全湖胜景',  '["芳草", "平湖", "晚烟", "残山"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '刘鹗' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '大明湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 18, '鞌之战', '齐侯治兵，出抵华下。晋师逐之，三周兹山。车轶遗血，马逸不止。千古奇功，付之流水。', (SELECT id FROM poet WHERE name = '张养浩' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '华山' LIMIT 1),  '意象: 华峰、齐晋、古战、流水；出处: 《归田类稿》卷一', '孤峰独秀，为济南胜景',  '["华峰", "齐晋", "古战", "流水"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '张养浩' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '华山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 19, '过历下亭', '济南胜景说明湖，万柳荷花入座绿。海上此亭自古好，谁言名士不重遇。我来吊古不复作，落日寒潭空自绿。唯有当年诗语在，江湖流落满人间。', (SELECT id FROM poet WHERE name = '苏辙' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '大明湖' LIMIT 1),  '意象: 明湖、古亭、柳荷、落日；出处: 《栾城集》卷六', '杜甫宴饮留诗，为济南名胜',  '["明湖", "古亭", "柳荷", "落日"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '苏辙' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '大明湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 20, '金线泉', '水纹浮一线，金缕绕寒泉。映日斜分影，随风弱曳烟。到底不能断，流出小桥边。', (SELECT id FROM poet WHERE name = '张养浩' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '金线泉' LIMIT 1),  '意象: 金线、寒泉、水纹、烟霞；出处: 《归田类稿》卷十二', '水面有纹如金线，为济南四大名泉之一',  '["金线", "寒泉", "水纹", "烟霞"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '张养浩' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '金线泉' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 21, '金线泉', '水纹浮绿影摇金，倒挽银河百尺深。中有锦鱼三十六，碧波荡漾任浮流。', (SELECT id FROM poet WHERE name = '晏璧' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '金线泉' LIMIT 1),  '意象: 金线、鱼、碧波；出处: 《七十二泉诗》', '水面有纹如金线，为济南四大名泉之一',  '["金线", "鱼", "碧波"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '晏璧' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '金线泉' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 22, '题超然楼', '超然楼上望远山，大明湖水净无烟。济南七十二名泉出，总入平湖作钓船。水色山光共一楼，阑干高倚碧天秋。', (SELECT id FROM poet WHERE name = '李泂' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '大明湖' LIMIT 1),  '历代因于战火及灾涝等原因，原楼久已荡涤无存；意象: 远山、平湖、秋水、蓝天；出处: 《元诗选·李泂集》', '元代学士李泂建，为大明湖制高点',  '["远山", "平湖", "秋水", "蓝天"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李泂' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '大明湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 23, '题灵岩寺', '青山绕四郭，古木藏深宫。不辞山路远，踏雪也相过。方其欲睡时，已觉尘心空。夜来清露湿，时有松风雄。', (SELECT id FROM poet WHERE name = '苏轼' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '灵岩寺' LIMIT 1),  '意象: 青山、古寺、松风、禅意；出处: 《苏轼诗集》卷十六', '海内四大名刹之首，有千佛殿辟支塔',  '["青山", "古寺", "松风", "禅意"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '苏轼' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '灵岩寺' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 24, '灵岩寺', '青山何重重，行进士囊底。岩高曰气薄，秀色如新洗。', (SELECT id FROM poet WHERE name = '苏辙' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '灵岩寺' LIMIT 1),  '意象: 青山、岩石', '海内四大名刹之首，有千佛殿辟支塔',  '["青山", "岩石"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '苏辙' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '灵岩寺' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 25, '灵岩寺', '灵岩千佛殿，老木上参天。山僧不出户，坐看白云眠。泉声落枕席，岚气湿阶前。我来聊一憩，不觉谢尘缘。', (SELECT id FROM poet WHERE name = '黄庭坚' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '灵岩寺' LIMIT 1),  '意象: 千佛殿、老木、白云、泉声；出处: 《山谷集》卷九', '殿内有四十尊宋代彩塑罗汉，闻名天下',  '["千佛殿", "老木", "白云", "泉声"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '黄庭坚' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '灵岩寺' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 26, '游龙洞', '山盘谷转回幽深，石洞虚无草木深。岩树阴浓春寂寂，涧泉声彻夜沈沈。龙归洞口云犹湿，雨过山前翠欲滴。我来欲问降龙事，只有青山对客吟。', (SELECT id FROM poet WHERE name = '曾巩' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '龙洞' LIMIT 1),  '意象: 幽谷、石洞、岩树、涧泉；出处: 《元丰类稿》卷八', '山川幽胜，有龙洞秋风为济南八景之一',  '["幽谷", "石洞", "岩树", "涧泉"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '曾巩' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '龙洞' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 27, '小沧浪亭', '独泛沧浪平底船，荷花面面叶田田。风光谁许平分得，人与池心四照莲。', (SELECT id FROM poet WHERE name = '阮元' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '大明湖' LIMIT 1),  '意象: 荷花、沧浪亭；出处: 《研经室集》', '临湖取景，有"四面荷花三面柳"题联',  '["荷花", "沧浪亭"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '阮元' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '大明湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 28, '济游漫录', '一面屏山三面水，夹堤柳丝护堤。', (SELECT id FROM poet WHERE name = '浣花' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '大明湖' LIMIT 1),  '意象: 柳树、大明湖；出处: 《大公报》', '杜甫、李邕曾游宴，有"济南名士多"典故',  '["柳树", "大明湖"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '浣花' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '大明湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 29, '陪李北海宴历下亭', '东藩驻皂盖，北渚凌青荷。
海右此亭古，济南名士多。', (SELECT id FROM poet WHERE name = '杜甫' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '大明湖' LIMIT 1),  '历下亭原址已移建；意象: 青荷、碧波、古亭、名士；出处: 《全唐诗》卷216', '杜甫、李邕曾游宴于此，有“济南名士多”典故',  '["青荷", "碧波", "古亭", "名士"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杜甫' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '大明湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 30, '泰山吟', '泰山一何高，迢迢造天庭。
峻极周已远，层云郁冥冥。
梁甫亦有馆，蒿里亦有亭。
幽涂延万鬼，神房集百灵。
长吟泰山侧，慷慨激楚声。', (SELECT id FROM poet WHERE name = '陆机' LIMIT 1), 3, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 泰山、重云
梁甫、楚声；出处: 《‌乐府诗集‌》卷41“相
和歌
辞·楚调曲上', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于25亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["泰山", "重云\\n梁甫", "楚声"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '陆机' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 31, '泰山吟', '峨峨东岳高，秀极冲清天。
岩中间虚宇，寂漠幽以玄。
非工复非匠，云构发自然。
器象尔何物，遂令我屡迁。
逝将宅斯宇，可以尽天年。', (SELECT id FROM poet WHERE name = '谢道韫' LIMIT 1), 3, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 泰山、清天
白云；出处: 《艺文类聚》
卷7', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于26亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["泰山", "清天\\n白云"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '谢道韫' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 32, '游泰山
（其二）', '清晓骑白鹿，直上天门山。
山际逢羽人，方瞳好容颜。
扪萝欲就语，却掩青云关。
遗我鸟迹书，飘然落岩间。
其字乃上古，读之了不闲。
感此三叹息，从师方未还。', (SELECT id FROM poet WHERE name = '李白' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 白鹿、仙人、
东岳、白鹿、
山川、古字；出处: 《全唐诗》‌
卷179', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于27亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["白鹿", "仙人", "东岳", "白鹿", "山川", "古字"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李白' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 33, '游泰山
（其三）', '平明登日观，举手开云关。
精神四飞扬，如出天地间。
黄河从西来，窈窕入远山。
凭崖览八极，目尽长空闲。
偶然值青童，绿发双云鬟。
笑我晚学仙，蹉跎凋朱颜。
踌躇忽不见，浩荡难追攀。', (SELECT id FROM poet WHERE name = '李白' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 泰山、黄河、
远山、长空、
青童、白云；出处: 《全唐诗》‌
卷179', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于28亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["泰山", "黄河", "远山", "长空", "青童", "白云"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李白' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 34, '游泰山
（其四）', '清斋三千日，裂素写道经。
吟诵有所得，众神卫我形。
云行信长风，飒若羽翼生。
攀崖上日观，伏槛窥东溟。
海色动远山，天鸡已先鸣。
银台出倒景，白浪翻长鲸。
安得不死药，高飞向蓬瀛。', (SELECT id FROM poet WHERE name = '李白' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 泰山、长风、
东溟、海色、远山、蓬瀛；出处: 《全唐诗》‌
卷179', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于29亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["泰山", "长风", "东溟", "海色", "远山", "蓬瀛"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李白' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 35, '游泰山
（其五）', '日观东北倾，两崖夹双石。
海水落眼前，天光遥空碧。
千峰争攒聚，万壑绝凌历。
缅彼鹤上仙，去无云中迹。
长松入霄汉，远望不盈尺。
山花异人间，五月雪中白。
终当遇安期，于此炼玉液。', (SELECT id FROM poet WHERE name = '李白' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 海水、碧空、
万壑、霄汉、
山花；出处: 《全唐诗》‌
卷179', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于30亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["海水", "碧空", "万壑", "霄汉", "山花"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李白' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 36, '望岳', '岱宗夫如何，齐鲁青未了。
造化钟神秀，阴阳割昏晓。
荡胸生层云，决眦入归鸟。
会当凌绝顶，一览众山小。', (SELECT id FROM poet WHERE name = '杜甫' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 泰山、齐鲁、
山云、归鸟；出处: 《全唐诗》‌
卷225', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于31亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["泰山", "齐鲁", "山云", "归鸟"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杜甫' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 37, '泰山', '七百里鲁望，北瞻何岩岩。
诸山知峻极，五岳独尊岩。
寰宇登来小，龟蒙视觉凡。
此为群物祖，草木莫锄芟。', (SELECT id FROM poet WHERE name = '石介' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 泰山、寰宇、
龟蒙；出处: 《徂徕集》', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于32亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["泰山", "寰宇", "龟蒙"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '石介' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 38, '登岱', '泰山天壤间，屹如郁萧台。
厥初造化手，办此何雄哉！
天门一何高，天险若可阶。
积苏与累块，分明见九垓。
扶摇九万里，未可诬齐谐。
秦皇憺威灵，茂陵亦雄材。
翠华行不归，石坛满苍苔。
古今一俯仰，感极令人哀。
是时春夏交，红绿无边涯。
奇探忘登顿，意惬自迟回。
惜无赏心人，欢然尽馀杯。
夜宿玉女祠，崩奔涌云雷。
山灵见光怪，似喜诗人来。
鸡鸣登日观，四望无氛霾。
六龙出扶桑，翻动青霞堆。
平生华嵩游，兹山未忘怀。
十年望齐鲁，登临负吟鞋。
孤云拂层崖，青壁落落云间开。
眼前有句道不得，但觉胸次高崔嵬。
徂徕山头唤李白，吾欲从此观蓬莱。', (SELECT id FROM poet WHERE name = '元好问' LIMIT 1), 9, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 泰山、天地
天门、九州
云海、日出
翠崖、孤云
青壁；出处: 《遗山集》', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于33亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["泰山", "天地\\n天门", "九州\\n云海", "日出\\n翠崖", "孤云\\n青壁"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '元好问' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 39, '登泰山', '风云一举到天关，快意生平有此观。
万古齐州烟九点，五更沧海日三竿。
向来井处方知隘，今后巢居亦觉宽。
笑拍洪崖咏新作，满空笙鹤下高寒。‌‌', (SELECT id FROM poet WHERE name = '张养浩' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 泰山、沧海；出处: 《归田类稿》
卷十九', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于34亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["泰山", "沧海"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '张养浩' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 40, '登岱', '岧峣泰岳拄苍穹，万壑千岩一径通。
象纬平临青帝观，灵光长绕碧霞宫。
凌晨云幔天涯白，子夜晴摇海日红。
玉露金茎应咫尺，举头霄汉思偏雄。', (SELECT id FROM poet WHERE name = '宋濂' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 岱岳、岩石、
云海、日出；出处: 《宋学士全集》', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于35亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["岱岳", "岩石", "云海", "日出"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '宋濂' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 41, '夏月登岱', '振衣千仞思悠悠，泰岱于今惬胜游。
秦汉旧封悬碧落，乾坤胜概点浮沤。
海明日观三更晓，风动天门九夏秋。
更上云端频极目，紫微光电闪吴钩。', (SELECT id FROM poet WHERE name = '方孝孺' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 岱岳、海日、
长空；出处: 《‌逊志斋集‌》', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于36亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["岱岳", "海日", "长空"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '方孝孺' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 42, '岱宗', '岱顶凌霄十八盘，中原萧瑟思漫漫。
振衣日观三秋曙，依剑天门六月寒。
风雨黄河通瀚海，星辰紫极近长安。
小臣愿献蓬莱颂，闾阖高悬谒帝难。', (SELECT id FROM poet WHERE name = '徐文通' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 泰山、十八盘、黄河、沙漠、星辰；出处: 《梦山存家诗稿》', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于37亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["泰山", "十八盘", "黄河", "沙漠", "星辰"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '徐文通' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 43, '怀泰山', '域内名山有岱宗，侧身东望一相从。
河流晓挂天门树，海色秋高日观峰。
金箧何人探汉策，白云千载护秦封。
向来信宿藤萝外，杖底西风万壑钟。', (SELECT id FROM poet WHERE name = '李攀龙' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 岱岳、黄河、沧海、日观峰、藤萝、万壑；出处: 《沧溟集》', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于38亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["岱岳", "黄河", "沧海", "日观峰", "藤萝", "万壑"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李攀龙' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 44, '登岱', '东岳峥嵘迥不群，中峰瑞霭更氤氲。
天门雪尽河流合，日观春晴海色分。
风起秦松常似雨，气蒸汉柏欲成云。
千秋霸迹终销歇，犹说相如封禅文。‌‌', (SELECT id FROM poet WHERE name = '徐中行' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 泰山、天门、沧海、汉柏；出处: 《天目山堂集》', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于39亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["泰山", "天门", "沧海", "汉柏"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '徐中行' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 45, '登泰山', '千盘鸟道转云萝，徙倚云霄发浩歌。
北走峰阴凌紫塞，西来练影落黄河。
诸天回薄星辰近，下界苍茫风雨多。
眼底殊庭君自见，九还未就奈人何。‌‌', (SELECT id FROM poet WHERE name = '李化龙' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 山道、云霄、山峰、黄河', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于40亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["山道", "云霄", "山峰", "黄河"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李化龙' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 46, '登泰山', '日跃扶桑大海东,黄河南望隔烟笼。 
欲分武帝金茎露,或出仙人掌握中。', (SELECT id FROM poet WHERE name = '李中行' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 沧海、黄河、
山岚；出处: 《渑溪集》', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于41亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["沧海", "黄河", "山岚"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李中行' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 47, '登岱行', '兜舆迢迢入翠微，往为白云荡胸飞。
白云直上接天界，山巅又出白云外。
黄河泡影摇天门，千峰万峰列儿孙。
放眼忽看天欲尽，跂足真疑星河扪。
瑶席借寄高岩宿，鸡鸣海东红一簇。
俄正五更黍半炊，洸漾明霞射秋谷。
吴门白马望依稀，沧溟一掬推琉璃。
七月晨寒胜秋暮，晓月露冷天风吹。
顷刻朝暾上山觜，山头翠碧连山尾。
及到山下雨新晴，归途半喳蹄涔水。
回首青嶂倚天开，始知适自日边来。', (SELECT id FROM poet WHERE name = '蒲松龄' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 泰山、白云、
黄河、沧海、
群峰；出处: 《聊斋诗集》', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于42亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["泰山", "白云", "黄河", "沧海", "群峰"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '蒲松龄' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 48, '泰山下作', '昨行泰山东，白云蓊天门。
但疑霄汉近，岂谓冈峦尊。
今晨路南转，北面朝丈人。
秋风生西极，万里开朝暾。
披豁盛大容，摆簸雷雨痕。
洗然耳目前，赫矣神灵存。
两观耀日月，指顾引越秦。
三溪郁参差，秀色相吐吞。
左映万碧瓦，松柏晴犹昏。
禅亭久芜没，辇道方增新。
右拥千寻壁，瀑布悬天绅。
冉冉水帘垂，一一白鹤训。
喷薄冰玉碎，腾攫蛟龙伸。
谁掬沧海波，濯此青嶙峋。
匡庐抱银河，失意空南奔。
眇兹峄与蒙，亭亭复云云。
终当结茅字，长与神房邻。', (SELECT id FROM poet WHERE name = '赵执信' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 泰山、白云、秋风、瀑布、
沧海；出处: 《饴山诗集》', '黄河与泰山是齐鲁大地独一无二的地理坐标。黄河与泰山古有“河岳”之并称。从古至今，泰山和黄河从文化的点、线、面多个维度互动，蕴含静与动、阳与阴、时间与空间、责任与信仰的多重意象。
见证着华夏文明的形成和发展，映照出中华民族对和谐、安宁的千年追寻。主峰玉皇顶拔地而起，海拔1545米，如天柱般屹立。
泰山并非寻常山岳，而是华北克拉通古老基底的脊梁，其岩体形成于43亿年前的新太古代，历经五次构造运动隆升，终成“五岳独尊”。
地质上，泰山属于鲁西隆起带，而其北侧广袤的黄河下游平原则坐落在济阳坳陷之上，一隆一陷，一刚一柔。
二者在构造上互为镜像：山为骨，河为脉；山主静，河主动；山守恒，河创生。正是这种地质上的张力与互补，塑造了齐鲁“山河表里、刚柔相济”的独特格局。',  '["泰山", "白云", "秋风", "瀑布", "沧海"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '赵执信' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 49, '岱岳吟', '呜呼岱宗之脉胡来哉，或言辽东渡海来。

不然中原莽荡数千里，何以巀起平地雄崔嵬。

丙子之冬登日观，大雪茫茫无所瞰。

辛巳之春寻石峪，摹拓摩崖游太促。

壬午之夏偕游侣，未极峰巅愁酷暑。

三度登岳未悉岳真形，搔首岳渎惭山灵。

齐鲁阴阳今踏遍，始识禹樏非漫经。

熊耳外方桐柏及陪尾，中干横行屡伏起。

始由淮北分干来，每过一峡辄分水。

为峄为蜀徐沛间，初峡吕梁穿泗水。

再峡阴平起东蒙，亦犹少室少华争华嵩。

三峡为陪尾，遂起徂徕峰。

南过莱芜原岭峡，始瞻东岳插天雄。

正干西尽东平麓，回顾葱岭如转毂。

怀抱邹鲁肘腋间，乾转坤旋灵淑育。

不有旷平，不显岌嶞。

不有纡回，不显变化。

东南横行逆西北，直与昆崙遥揖迓。

宜乎封禅朝百灵，掉尾神龙殿区夏。

七十二泉汶泗源，旺湖水匮渟其间。

运河黄河一再截，遂疑地脉亡其元。

但见中原渡海为岛屿，几见岛屿又复登中原。

登日观，俯黄河。

水荡荡，山峨峨，沧桑陵谷何其多。

登岱岳，俯齐鲁，川渎中条传自古。

稽首黄河决北勿决南，川渎洪荒还大禹。', (SELECT id FROM poet WHERE name = '魏源' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '泰山' LIMIT 1),  '意象: 岱宗、雪、泗水
邹鲁；出处: 《魏源集》', '魏源《岱岳吟》作于清道光八年（1828年）第四次登泰山途中。
这组诗气势磅礴，既展现了泰山的雄奇险峻与日出奇观，又融入了诗人对历史、
地理及人生哲理的深刻思考。',  '["岱宗", "雪", "泗水\\n邹鲁"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '魏源' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 50, '陪李北海宴历下亭', '东藩驻皂盖，北渚凌青荷。海右此亭古，济南名士多。', (SELECT id FROM poet WHERE name = '杜甫' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '大明湖' LIMIT 1),  '历下亭原址已移建；意象: 青荷，碧波，古亭，名士；出处: 《全唐诗》卷216', '杜甫，李邕曾游宴于此，有“济南名士多”典故',  '["青荷", "碧波", "古亭", "名士"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杜甫' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '大明湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 51, '棹歌行', '迟迟暮春日。天气柔且嘉。元吉降初巳。
濯秽游黄河。龙舟浮鹢首。羽旗垂藻葩。
乘风宣飞景。逍遥戏中波。
名讴激清唱。榜人纵棹歌。投纶沈洪川。
飞缴入紫霞。', (SELECT id FROM poet WHERE name = '陆机' LIMIT 1), 3, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 黄河、龙舟、
羽旗、紫霞；出处: 《陆平原集》', '陆机任平原内史时乘舟畅游黄河时做此诗，元吉降初巳。濯秽游黄河。此诗是诗人活动于德州黄河流域重要见证。',  '["黄河", "龙舟", "羽旗", "紫霞"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '陆机' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 52, '临邑舍弟书至苦雨黄河泛溢堤防之患簿领所忧因寄此诗用宽其意', '二仪积风雨，百谷漏波涛。
闻道洪河坼，遥连沧海高。
职司忧悄悄，郡国诉嗷嗷。
舍弟卑栖邑，防川领簿曹。
尺书前日至，版筑不时操。
难假鼋鼍力，空瞻乌鹊毛。
燕南吹畎亩，济上没蓬蒿。
螺蚌满近郭，蛟螭乘九皋。
徐关深水府，碣石小秋毫。
白屋留孤树，青天失万艘。
吾衰同泛梗，利涉想蟠桃。
却倚天涯钓，犹能掣巨鳌。', (SELECT id FROM poet WHERE name = '杜甫' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 黄河、田野
村庄、孤树；出处: 《全唐诗》', '“德水长流州城永固”是山东德州的历史文化概括，源于黄河（古称“德水”）与运河对城市的塑造。德州因水成洲，秦时敬称黄河为“德水”，西汉置安德县取其“德水安澜”之意，隋开皇九年（589年）正式定名德州。作为黄河与运河交汇的枢纽，德州自古兼具军事防御与商贸功能',  '["黄河", "田野\\n村庄", "孤树"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杜甫' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 53, '晚泊无棣沟', '无棣何年邑，长城作楚关。
河通星宿海，云近马谷山。
僧寺白云外，人家绿渚间。
晩来潮正满，处处落帆还。', (SELECT id FROM poet WHERE name = '刘长卿' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '无棣沟' LIMIT 1),  '意象: 长城、黄河、白云、寺庙、绿渚、马谷山；出处: 《刘随州集》', '无棣沟，是位于今河北省盐山县境内的一条古河道，古称无棣水（河），为清河支流，也是古黄河的支。其历史可追溯至春秋之前，春秋时即为齐国北部重要的鱼盐运输通道 。该河道在北朝魏时改称无棣沟。隋朝末年淤废，唐永徽元年（公元650年），沧州刺史薛大鼎曾主持疏浚以利鱼盐运输 。唐开元年间（公元723年）复经开挖。至元、明时期，无棣沟已基本湮灭。隋开皇六年（586年）置无棣县，即因县南临此沟而得名。',  '["长城", "黄河", "白云", "寺庙", "绿渚", "马谷山"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '刘长卿' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '无棣沟' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 54, '发御河', '一棹黄流去复回，
飞沙积岸雪皑皑。
梨花乱逐沙鸥起，
燕子深随野马来。
晚岁宦情初岸帻，
暮云乡思独停杯。
荼蘼满架留春住，
知我将归为缓开。', (SELECT id FROM poet WHERE name = '袁桷' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '卫运河' LIMIT 1),  '意象: 黄河、飞沙、白雪、梨花、沙鸥、燕子；出处: 《清容居士集》', '卫运河（含卫河）上段是沟通河南、山东的重要航道，历史上大部分时间都为通航河段。是古黄河文化在德州重要见证。',  '["黄河", "飞沙", "白雪", "梨花", "沙鸥", "燕子"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '袁桷' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '卫运河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 55, '九月初旬临清下陵州舟中', '谁云北土异南方，
九日晴暄未陨霜。
河水浑黄千里疾，
柳荫浓绿两堤长。
丰年有象占农亩，
佳气非烟望帝乡。
驿酒一升犹可饮，
只愁无客共重阳。', (SELECT id FROM poet WHERE name = '吴师道' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 黄河、柳荫、佳气、农田；出处: 《吴礼部诗集》', '作者由临清至德州行船至夏津境内留下的诗篇。',  '["黄河", "柳荫", "佳气", "农田"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '吴师道' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 56, '过古黄河堤', '迢迢古黄河，隐隐若城势。
古来黄河流，而今作耕地。
都道变通津，沧海化为尘。
堤长燕麦秀，不见筑堤人。', (SELECT id FROM poet WHERE name = '萨都剌' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 黄河、长堤、麦苗；出处: 《雁门集》', '德州文脉丰厚，在以汉代大儒董仲舒、唐代颜真卿为代表的儒家文脉的浸润熏陶下，在运河漕运的推动下进入了文化大发展的鼎盛时期，一时间“人文飙起，名卿蝉联，实甲山左”。黄河在德州改道，运河在德州入京，德州黄河、运河沿岸名楼、芳园、书院林立，文人名士在此聚集吟咏。',  '["黄河", "长堤", "麦苗"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '萨都剌' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 57, '陵州', '日落陵州路，沿流古岸旁。泊舟人自语，听雨夜偏长。过客愁闻盗，荒村久绝粮。何人肯忧国，得似董贤良。', (SELECT id FROM poet WHERE name = '葛逻禄乃贤' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 陵州、古岸
听雨；出处: 《金台集》（元至正刻本）
明《德州志・艺文》
清《元诗选》', '德州市德城区古陵州城西门外是黄河故道古岸',  '["陵州", "古岸\\n听雨"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '葛逻禄乃贤' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 58, '过德州有感', '平原襟喉郡，城堞亦何雄。
地控齐鲁际，路当幽蓟冲。
古河忘旧名，故垒有遗踪。
我频扈仙跸，来往经山东。
到此怀宿昔，望远台已空。
诙谐失方朔，聪明无管公。
高士文不传，祢衡赋徒工。
若人俱寂寞，蔓草起凄风。
伟哉颜太师，矫矫人中龙。
智明炳几先，芽蘖防奸凶。
豺虎方哮噬，于以折其锋。
霜雪瘁百草，挺然见孤松。
高名悬日月，壮节凌苍穹。
千年英烈气，尚见成长虹。', (SELECT id FROM poet WHERE name = '胡广' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 古河遗踪、故垒荒迹、齐鲁襟喉、幽蓟要冲；出处: 明・万历《德州志》收录；
《胡文穆公诗集》（明嘉靖刻本）；
清・康熙《德州志・艺文志》题作《过德州有感》。', '德州市区（古安德州）黄河故道与运河交汇处，是黄河故道与京杭大运河交汇的水陆枢纽，先秦为 “九河” 之地，秦汉设安德县，隋唐为德州治所，明清为漕运重镇，古河、故垒见证南北文化交融与军事战略价值。',  '["古河遗踪", "故垒荒迹", "齐鲁襟喉", "幽蓟要冲"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '胡广' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 59, '济上作', '两年为客逢秋节,千里孤舟济水旁。 
忽见黄花倍惆怅,故园明日又重阳。', (SELECT id FROM poet WHERE name = '徐祯卿' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 孤舟、济水
黄河、故园；出处: 《迪功集》', '济水为古四渎之一，明代济水指的是黄河北部分，在山东段屡经变迁。',  '["孤舟", "济水\\n黄河", "故园"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '徐祯卿' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 60, '卫河', '河流曲曲转，十里还相唤。
那比下江船，杨帆忽不见。', (SELECT id FROM poet WHERE name = '王世贞' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '卫运河' LIMIT 1),  '意象: 黄河、船帆；出处: 《弇山堂别集》', '卫运河（含卫河）上段是沟通河南、山东的重要航道，历史上大部分时间都为通航河段。是古黄河文化在德州重要见证。',  '["黄河", "船帆"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '王世贞' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '卫运河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 61, '自德州买舟浒上纪', '茫茫四野水，水鸟掠风帆。
土屋无人闭，江艘有使监。
新鱼随罩得，遗穗进桴芟。
出涕忧无象，京飙沸露衫', (SELECT id FROM poet WHERE name = '高出' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 荒滩、明末萧条；出处: 明《德州志・艺文》
清《德州志・艺文》
民国《德县志・文征》', '地处南北水陆要冲，黄河故道与京杭运河在此十字交汇，是黄河迁徙、运河漕运、军事要道、文人怀古的文化叠加之地。明末战乱频仍，此地荒滩与漕舟并存，尽显乱世萧瑟。',  '["荒滩", "明末萧条"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '高出' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 62, '吊卢德水五言律', '读杜怀诗叟，笺成号寄卢。
扶衰看老辈，振雅属吾徒。
古岸春流疾，荒城落日孤。
驱车莫怅望，遗卷付江湖。', (SELECT id FROM poet WHERE name = '秦松龄' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 古岸、荒城；出处: 明《德州志・艺文》
清《德州志・艺文》
民国《德县志・文征》', '清朝江南文人秦松龄与德州明末清初大诗人卢世傕应是亦师亦友的忘年交，卢世傕是明朝天启年间进士，而秦松龄是清顺治年间进士，卢比秦要大近50岁。卢世傕是德州卢世承上启下之重要人物，晚号南村病叟，对杜甫的诗颇有研究，是我国杜诗学的奠基人之一。卢世傕去世时秦松龄为其写下《吊卢德水五言律》一诗，虽其当时还是一个16岁少年，然峥嵘已初露于诗句之间，两年后考中进士。',  '["古岸", "荒城"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '秦松龄' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 63, '德州', '长河绝流澌，晓坐寒仍肃。

若使居深宫，安知有冷燠？', (SELECT id FROM poet WHERE name = '爱新觉罗·玄烨' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 黄河、晓寒；出处: 《圣祖仁皇帝御制文集》', '创作于康熙四十八年（1709年）第六次南巡驻跸德州期间。“晓坐寒仍肃”表明康熙帝拂晓之前已经起来，当时正是清晨最冷的时候，他听着长河水的奔流声，不禁想到“若使居深宫，安知有冷燠？”，如果久居深宫，哪能体会这人间冷暖，由气候联想到民间疾苦与世间冷暖。《德州》诗反映了康熙帝以四海为念，心怀天下苍生之胸怀。',  '["黄河", "晓寒"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '爱新觉罗·玄烨' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 64, '柳湖', '环水亭台有画图，下帷争效汉名儒。
河干断碣分明在，不见城西旧柳湖', (SELECT id FROM poet WHERE name = '卢见曾' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 断碣”“旧柳湖”；出处: 清・乾隆《德州志・艺文志》；
《长河志籍考》（卢见曾自撰）；
《雅雨堂诗集》（清乾隆刻本）；
民国《德县志・文征》收录', '汉代：董仲舒于此 “下帷讲诵”，作《春秋繁露》，黄河故道流经，水泽环绕；
隋唐：为德州文脉核心，设 “董子书院”；
明清：称 “柳湖书院 / 繁露书院”，环湖植柳，与黄河故道、京杭运河相依，是黄河文明 + 董子儒学 + 运河文化交汇地标；
清中期：故道淤塞，柳湖萎缩，仅存残碑与台基，成为黄河迁徙、文脉兴废的见证。',  '["断碣”“旧柳湖”"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '卢见曾' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 65, '陵州四时词・春', '柳湖西畔御河隈，芦荻萧萧两岸苔。
酒户词场多少客，登高齐上读书台', (SELECT id FROM poet WHERE name = '田致' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 柳湖、运河、读书台（董子台）、黄河故道；出处: 清・乾隆《德州志・艺文志》；
《陵州四时词》（清乾隆抄本，藏山东省图书馆）；
民国《德县志・文征》收录，题作《陵州四时词・春》', '古黄河（德水）故道在此与京杭运河十字交汇，是黄河迁徙、运河开凿双重水文地标；
西望柳湖书院，东临运河漕运，北依董子台，集儒学、漕运、黄河文明于一体；清中期故道荒滩、芦荻丛生，运河舟楫往来，形成荒古与繁华并存的独特意境。',  '["柳湖", "运河", "读书台（董子台）", "黄河故道"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '田致' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 66, '老黄河', '导河积石至龙门，华阴底柱逮孟津。
播为九河入于海，神禹旧迹堪指论。
后世因循渐南徙，谁能障使归其原。
又闻刷黄利深导，义取其合毋取分。
一河犹时虞淤壅，析而为九流难奔。
居今志古不尽同，卓哉史迁垂名言。', (SELECT id FROM poet WHERE name = '爱新觉罗·弘历' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 积石龙门、九河入海、禹迹；出处: 《御制诗集》（乾隆内府刻本）
清《德州志・艺文》
民国《德县志・文征》', '古鬲津河（九河之一），宋代后为黄河故道，称 “老黄河”；禹疏九河、黄河改道、德州得名（德水）、治水文化核心地标。',  '["积石龙门", "九河入海", "禹迹"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '爱新觉罗·弘历' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 67, '题谢方山别墅', '高原临马颊，中有谢公村。
芳树春连屋，清川日在门。
人如古渔父，地即桃花源。
十载长安别，心期此重论。', (SELECT id FROM poet WHERE name = '王士祯' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 高原，马颊，清川，芳树；出处: 《渔洋山人精华录》卷六', '清朝文坛领袖王士祯与德州谢重辉、田雯等文人交情甚密，康熙年间王士祯编选的《金台十子诗》，山左占其四，德州占两位，分别是田雯、谢重辉，王士祯和谢重辉都是当时神韵说诗歌流派的核心人物。谢重辉，号方山，引疾归隐后，在黄河涯建杏村别墅，王士祯晚年因案牵连，致仕归隐后，每年都会到德州探望谢重辉，杏村别墅也就成为文坛聚会之所',  '["高原", "马颊", "清川", "芳树"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '王士祯' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 68, '观吴西岭画河图', '匹马南来访杏村，
新图喜见旧河源。
三长愧我无才识，
幸有名贤共讨论。', (SELECT id FROM poet WHERE name = '许朝' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 杏村、河源；出处: 民国《德县志》', '清朝文坛领袖王士祯与德州谢重辉、田雯等文人交情甚密，康熙年间王士祯编选的《金台十子诗》，山左占其四，德州占两位，分别是田雯、谢重辉，王士祯和谢重辉都是当时神韵说诗歌流派的核心人物。谢重辉，号方山，引疾归隐后，在黄河涯建杏村别墅，王士祯晚年因案牵连，致仕归隐后，每年都会到德州探望谢重辉，杏村别墅也就成为文坛聚会之所',  '["杏村", "河源"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '许朝' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 69, '长河偶记', '历历牙樯插浦间，
海门潮接九河湾。
西来一派朝宗水，
经过千山与万山。', (SELECT id FROM poet WHERE name = '李浃' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 桅杆、河湾；出处: 民国《德县志》', '古黄河（德水）故道在此与京杭运河十字交汇，是黄河迁徙、运河开凿双重水文地标；
西望柳湖书院，东临运河漕运，北依董子台，集儒学、漕运、黄河文明于一体；清中期故道荒滩、芦荻丛生，运河舟楫往来，形成荒古与繁华并存的独特意境。',  '["桅杆", "河湾"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李浃' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 70, '腊月宿齐河城外', '魄落魂消酒一卮，冻躯围火得温迟。
人如败叶浑无属，骨似劳薪不可支。 
红烛无光贪化泪，黄河传响已流澌。
 那堪岁月荒城道，风雨千山梦醒时。', (SELECT id FROM poet WHERE name = '刘鹗' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 炉火，寒声，寒柳，浊酒；出处: 《铁云诗存》', '诗史价值：晚清河患的文学实录；文学坐标：《老残游记》的现实原型地；水利文化：近代治河的见证；地域文化：齐河 — 黄河文化的核心符号
“老残观凌处” 成为齐河文化名片，连接《老残游记》文学 IP 与黄河文明，承载鲁西北水乡记忆、运河 — 黄河商贸史、治河精神传承。',  '["炉火", "寒声", "寒柳", "浊酒"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '刘鹗' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 71, '齐河题壁', '地裂北风号，长冰蔽河下。
后冰逐前冰，相凌复相亚。
河曲易为塞，嵯峨银桥架。
归人长咨嗟，旅客空叹咤。
盈盈一水间，轩车不得架。
锦筵招妓乐，乱此凄其夜。', (SELECT id FROM poet WHERE name = '刘鹗' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 北风，冻地，荒堤；出处: 《铁云诗存》', '诗史价值：晚清河患的文学实录；文学坐标：《老残游记》的现实原型地；水利文化：近代治河的见证；地域文化：齐河 — 黄河文化的核心符号
“老残观凌处” 成为齐河文化名片，连接《老残游记》文学 IP 与黄河文明，承载鲁西北水乡记忆、运河 — 黄河商贸史、治河精神传承。',  '["北风", "冻地", "荒堤"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '刘鹗' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 72, '陪李北海宴历下亭', '东藩驻皂盖，北渚凌青荷。海右此亭古，济南名士多。', (SELECT id FROM poet WHERE name = '杜甫' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '大明湖' LIMIT 1),  '历下亭原址已移建；意象: 青荷，碧波，古亭，名士；出处: 《全唐诗》卷216', '杜甫，李邕曾游宴于此，有“济南名士多”典故',  '["青荷", "碧波", "古亭", "名士"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杜甫' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '大明湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 73, '观沧海', '东临碣石，以观沧海。树木丛生，百草丰茂。秋风萧瑟，洪波涌起。日月之行，若出其中；星汉灿烂，若出其里。幸甚至哉，歌以咏志。', (SELECT id FROM poet WHERE name = '曹操' LIMIT 1), 2, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 碣石山，渤海，黄河，树木；出处: 《曹操集》，收录于《步出夏门行》组诗', '建安十一年（206年），  
曹操曾登此山并作诗《观沧海》',  '["碣石山", "渤海", "黄河", "树木"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '曹操' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 74, '晚泊无棣沟', '无棣何年邑，长城接楚关。
河通星宿海，云近马谷山。
僧寺白云外，人家绿渚间。
晚来潮正满，处处落帆还。', (SELECT id FROM poet WHERE name = '刘长卿' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 无棣邑，楚关，河，星宿海，马谷山；出处: 明嘉靖《海丰县志》，清康熙《海丰县志》，乾隆《蒲台县志》。', '黄河故道支流无棣沟，古人认为黄河发源于星宿海，此处以“河通星宿海”极言无棣沟河道绵长，上接黄河源头；“马谷山”即今滨州无棣碣石山，为黄河故道入海口的标志性名山，是鲁北沿海的地理制高点。',  '["无棣邑", "楚关", "河", "星宿海", "马谷山"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '刘长卿' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 75, '滨州道中四首·其一', '月堕孤村露合，日出高原雾开。    道逐故河西去，人将新雁南来。', (SELECT id FROM poet WHERE name = '晁补之' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 黄河故道，滨州古道，孤村，新雁；出处: 《鸡肋集》', '黄河故道',  '["黄河故道", "滨州古道", "孤村", "新雁"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '晁补之' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 76, '归自滨州', '扶疏弱柳绿初匀，
哑咤黄鹂语未真。
行路逢春浑不觉，
却须说似探花人。', (SELECT id FROM poet WHERE name = '许景衡' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 弱柳，黄鹂，春路，河滨春色；出处: 《横塘集》卷六（四库全书本）；
《全宋诗》卷 1325', '滨州故城（旧蒲台北）临汉唐黄河故道，堤岸植柳固堤，“隋堤 / 唐堤柳” 为本地标志性景观；故道两岸春柳黄鹂，兼具河防，漕运，驿道三重文化意义。',  '["弱柳", "黄鹂", "春路", "河滨春色"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '许景衡' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 77, '烈妇杀虎行', '滨州之阴有猛虎，白昼食人不敢侮。
妇姑樵采山下归，虎攫其姑去如舞。
妇奋前搏虎，虎顾妇怒。
姑得脱走，妇遂为虎所取。
呜呼！妇之节，可与河水俱东注。', (SELECT id FROM poet WHERE name = '赵孟頫' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 滨州黄河沿岸，民生百态，烈妇事迹；出处: 《滨州志·艺文志》', '传达对时政的婉转批判，不同于伦理纲常或国之祥瑞的阐释，在宣扬胡氏的义烈之余，更批评时政对百姓的苛虐。',  '["滨州黄河沿岸", "民生百态", "烈妇事迹"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '赵孟頫' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 78, '次蒲台', '晓廛集似鸟投林，密栅缘墙布棘针。
冷雾障天云木暗，暖风着地雪泥深。
济流东去长归海，蜀客西来远货金。
喜遇采江香酝卖，一尊见贶慰乡心', (SELECT id FROM poet WHERE name = '陶安' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 古城，大清河（黄河故道）；出处: 《陶学士集》卷九', '源自秦始皇派遣徐福东渡寻药未归后东巡至此，在单寺乡西石村附近筑台望海，因台周蒲草繁茂得名',  '["古城", "大清河（黄河故道）"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '陶安' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 79, '齐河道中', '齐东城外水漫漫，系缆河堤五月寒。
桑柘几家连浦暗，鱼盐万里到城宽。
沙边古堞晴云出，渡口新堤浊浪蟠。
闻道年来频水患，居民犹说旧河官。', (SELECT id FROM poet WHERE name = '杨巍' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 古城，大清河（黄河故道）；出处: 《梦山存家诗稿》', '源自秦始皇派遣徐福东渡寻药未归后东巡至此，在单寺乡西石村附近筑台望海，因台周蒲草繁茂得名',  '["古城", "大清河（黄河故道）"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杨巍' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 80, '渡黄河', '路出大梁城，关河开晓晴。
日翻龙窟动，风扫雁沙平。
倚剑嗟身事，张帆快旅情。
茫茫不知处，空外棹歌声。', (SELECT id FROM poet WHERE name = '谢榛' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 黄河下游，滨州渡口，浊浪，归帆；出处: 《四溟山人全集》', '据金代石碑记载，“南望清河影带，昼夜不息，舳舫交错，商旅蝉阵于东西，滨之城市士庶蚊聚。”这里船运繁荣，交通发达。',  '["黄河下游", "滨州渡口", "浊浪", "归帆"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '谢榛' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 81, '午日泛大清河', '天涯令节喜天中，江上龙舟此日同。
谁向罗川怀屈子，且从济水泛群公。
晚风习习青帆动，落照茫茫碧汉空。
更是夜来新月上，良宵佳境亦难逢。', (SELECT id FROM poet WHERE name = '杨玉润' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 大清河（黄河故道），新月；出处: 民国《齐东县志》', '源自秦始皇派遣徐福东渡寻药未归后东巡至此，在单寺乡西石村附近筑台望海，因台周蒲草繁茂得名',  '["大清河（黄河故道）", "新月"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杨玉润' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 82, '秋夜大清河泛舟・其一', '新秋雨露多，水涨大清河。
漫有乘舟兴，还宜对酒歌。
中流萧鼓动，夹岸树烟罗。
月色知人意，瑶光满碧波。', (SELECT id FROM poet WHERE name = '杨玉润' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 大清河（黄河故道），月色；出处: 民国《齐东县志》', '源自秦始皇派遣徐福东渡寻药未归后东巡至此，在单寺乡西石村附近筑台望海，因台周蒲草繁茂得名',  '["大清河（黄河故道）", "月色"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杨玉润' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 83, '秋夜大清河泛舟・其二', '雨后泛轻舟，良辰此共游。
萧爽知无暑，熙壤慰有秋。
月光如练素，星影带河流。
子夜方归棹，渔蓑隐隐收。', (SELECT id FROM poet WHERE name = '杨玉润' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 大清河（黄河故道），月色；出处: 民国《齐东县志》', '源自秦始皇派遣徐福东渡寻药未归后东巡至此，在单寺乡西石村附近筑台望海，因台周蒲草繁茂得名',  '["大清河（黄河故道）", "月色"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杨玉润' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 84, '咏滨州', '渤海之滨古棣州，人家多在竹林幽。
春深处处闻啼鸟，秋至村村见卧牛。
渔笛一声烟水阔，盐帆千片海云浮。
黄河远带沧溟色，万顷平畴绕碧流。', (SELECT id FROM poet WHERE name = '王象春' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 黄河，盐帆；出处: 《问山亭诗集》', '素有“鲁北首邑”之称',  '["黄河", "盐帆"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '王象春' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 85, '黄河', '河流挟风雨，势欲穿城堞。
平田多陆沈，不逢村女馌。
居人忧水患，夜卧孰敢怗。
往来南北舍，涂泥每遭蹶。
如何渔蛮子，独与河伯狎。
举家傍芦苇，取给舟一叶。
生儿虽长成，不绔亦不屧。
委身馀淖中，颇类猪与鸭。
我来三叹息，安得防河筴。
但听欢呼声，家家持畚插。', (SELECT id FROM poet WHERE name = '汪琬' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 黄河水患，滨州沿岸民生，治河；出处: 《尧峰文钞卷四十二》，为汪琬视察滨州黄河水患时所作。', '源自秦始皇派遣徐福东渡寻药未归后东巡至此，在单寺乡西石村附近筑台望海，因台周蒲草繁茂得名',  '["黄河水患", "滨州沿岸民生", "治河"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '汪琬' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 86, '马谷朝云', '孤峰叆叇涌螺鬟，朝出行云意自闲。
淡泊不遣游客梦，聊将多事笑巫山。', (SELECT id FROM poet WHERE name = '张衍' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 孤峰，行云；出处: 民国《无棣县志》艺文志，清康熙九年《海丰县志》景致题咏附录', '以滨州无棣马谷山（古碣石山，滨北海，临黄河故道流域）为核心，描摹清晨山峦云雾缭绕，舒卷悠然的景致。曹操曾登临此山并赋诗《观沧海》',  '["孤峰", "行云"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '张衍' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 87, '题谢方山别墅', '高原临马颊，中有谢公村。
芳树春连屋，清川日在门。
人如古渔父，地即桃花源。
十载长安别，心期此重论。', (SELECT id FROM poet WHERE name = '王士祯' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 高原，马颊，清川，芳树；出处: 《渔洋山人精华录》卷六', '明清时期黄河支流故道',  '["高原", "马颊", "清川", "芳树"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '王士祯' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 88, '渡大清河', '一线泻海角，四渎此最微。
源从王屋山，初发仅激矶。
二伏四见间，息息无停机。
东平至泺口，数百里迂威。
阿井涵乳泉，明湖漾僧衣。
名泉七十二，或停或喷飞。
谓是大地肾，郦注标厥徽。
爰从东北注，经涂相因依。
造物链渊脉，利济众所归。
我来问津渡，古渡人踪稀。
宿雨净林翠，清流明斜晖。
川源渺荡潏，云霭空依稀。
溯源叹未能，竟委尚可几。
高崖且絷马，悠然谢尘鞿。', (SELECT id FROM poet WHERE name = '沈廷芳' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 大清河，名泉；出处: 《惠民县志》卷三十・艺文志', '大清河在古济水下游，具有极其重要的航运与地理价值。',  '["大清河", "名泉"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '沈廷芳' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 89, '徒骇河', '神禹治河乃最神，当时犹致人徒骇。
三千年后智非禹，问胜此任谁能解。
徒骇迤北鬲津南，其间大都九河在。
相去乃至二百里，同为逆河方入海。
今河不过数里馀，安得修防不日殆。
将欲弃地让之水，亿万生计嗟瓦解。
即禹治今河应难，是吾蒿目所以乃。', (SELECT id FROM poet WHERE name = '爱新觉罗·弘历' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 九河，逆河；出处: 《御制诗集》三集卷五十八，《清实录·高宗实录》卷八百八十六有相关创作背景记载。', '明清时期黄河支流故道',  '["九河", "逆河"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '爱新觉罗·弘历' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 90, '蒲台八景诗', '源从王屋济流长，
曲折晴铺匹练光。
敢诩水壶清似水，
一瓯满贮到琴堂。', (SELECT id FROM poet WHERE name = '严文典' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 济水，王屋山；出处: 《蒲台县志》卷一《形胜・附八景》', '蒲台县因秦始皇东巡至此，萦蒲系马筑台望海而得名。大清河（古济水）绕城而过，是古代重要的水运通道和盐运要道，朝廷在此设置盐关，“关临广斥，千艘载雪以俱来；镇表海邦，百雉连云而北拱”。“济水拖蓝” 和 “秦堤晚照” 是蒲台八景中最具代表性的黄河故道景观。',  '["济水", "王屋山"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '严文典' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 91, '登无棣碣石望黄河故道', '巍然碣石镇荒丘，望断长河故道秋。                                       数点寒沙沈晚照，千年残垒剩闲鸥。                                     曹刘事业随流水，吴楚风云入远眸。                                    我欲乘槎探天汉，萧萧风叶下芦洲。', (SELECT id FROM poet WHERE name = '张衍重' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 碣石山，黄河故道；出处: 《海丰县志》', '以滨州无棣马谷山（古碣石山，滨北海，临黄河故道流域）为核心，描摹清晨山峦云雾缭绕，舒卷悠然的景致。曹操曾登临此山并赋诗《观沧海》',  '["碣石山", "黄河故道"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '张衍重' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 92, '秦堤樵唱', '古堤遥接大荒烟，樵径斜通断岭边。
柯斧声喧清昼永，薪歌韵逐晚风传。
归时负担林梢月，坐对衔杯竹里天。
为问当年疏凿意，禹功千载尚依然。', (SELECT id FROM poet WHERE name = '沈世铨' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河' LIMIT 1),  '意象: 古堤，月空；出处: 光绪十年刻本《惠民县志》卷首《艺文志》', '相传为秦始皇东巡时所筑，实则为北宋黄河故道的遗存堤岸，是滨州黄河故道的重要历史遗迹。',  '["古堤", "月空"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '沈世铨' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 93, '经鲁祭孔子而叹之', '夫子何为者？栖栖一代中。地犹鄹氏邑，宅即鲁王宫。叹凤嗟身否，伤麟怨道穷。今看两楹奠，当与梦时同。', (SELECT id FROM poet WHERE name = '李隆基' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '曲阜孔庙' LIMIT 1),  '唐玄宗封禅泰山后所作；意象: 孔子、栖遑、凤鸟、麒麟、两楹之奠；出处: 《全唐诗》卷3', '帝王祭孔，尊崇儒学',  '["孔子", "栖遑", "凤鸟", "麒麟", "两楹之奠"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李隆基' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '曲阜孔庙' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 94, '登奎文阁', '嵯峨杰阁出宫墙，上有云梯百尺长。丹碧九霄明日月，牙谶万轴映奎光。沧溟俯视东洋外，岱岳平临北斗傍。何幸登高豁心目，愿从圣道窃余芳。', (SELECT id FROM poet WHERE name = '陈凤梧' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '曲阜孔庙' LIMIT 1),  '描写孔庙奎文阁壮丽景观；意象: 奎文阁、云梯、丹碧、沧溟、岱岳；出处: 《古今图书集成·方舆汇编·职方典》', '藏书楼，象征文化传承',  '["奎文阁", "云梯", "丹碧", "沧溟", "岱岳"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '陈凤梧' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '曲阜孔庙' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 95, '诗礼堂', '洙泗趋庭日，相传自世家。三千惟有敬，一语自无邪。乔木参天色，猗兰绕砌花。遗风从此地，化雨被无涯。', (SELECT id FROM poet WHERE name = '薛瑄' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '曲阜孔庙' LIMIT 1),  '赞颂孔子诗礼传家之教；意象: 洙泗、趋庭、乔木、猗兰、化雨；出处: 《敬轩文集》', '孔子教子学诗礼处',  '["洙泗", "趋庭", "乔木", "猗兰", "化雨"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '薛瑄' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '曲阜孔庙' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 96, '甲子冬至过阙里', '銮辂来东鲁，先登夫子堂。两楹陈俎豆，数仞见宫墙。道统唐虞接，儒风洙泗长。入门抚松柏，瞻拜肃冠裳。', (SELECT id FROM poet WHERE name = '玄烨' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '曲阜阙里' LIMIT 1),  '康熙皇帝南巡祭孔所作；意象: 銮辂、夫子堂、俎豆、宫墙、唐虞、洙泗；出处: 《康熙御制诗集》', '帝王驾临祭孔，感怀先师',  '["銮辂", "夫子堂", "俎豆", "宫墙", "唐虞", "洙泗"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '玄烨' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '曲阜阙里' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 97, '谒夫子庙诗', '千年礼乐归东鲁，万古衣冠拜素王。泰岱巍巍垂俎豆，秋阳皓皓照宫墙。堂虚似有弦歌响，桧老真看手泽长。用世自怜经术拙，羞称弟子及门行。', (SELECT id FROM poet WHERE name = '戴璟' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '曲阜孔庙' LIMIT 1),  '自谦之语，感慨经术拙劣；意象: 礼乐、素王、泰岱、俎豆、宫墙、弦歌、手泽；出处: 《曲阜县志》', '盛赞孔子功绩，尊崇儒家道统',  '["礼乐", "素王", "泰岱", "俎豆", "宫墙", "弦歌", "手泽"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '戴璟' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '曲阜孔庙' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 98, '祭文庙诗', '扶植纲常百代陈，天将夫子觉斯民。帝王师法成隆治，兆庶遵由臻至淳。道统常垂今与古，文明共仰圣而神。功能遡自生民后，地辟天开第一人。', (SELECT id FROM poet WHERE name = '胤禛' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '曲阜孔庙' LIMIT 1),  '雍正皇帝尊孔之作；意象: 纲常、觉斯民、帝王师、道统、文明、第一人；出处: 《雍正御制诗集》', '歌颂孔子教化之功，堪比帝王',  '["纲常", "觉斯民", "帝王师", "道统", "文明", "第一人"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '胤禛' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '曲阜孔庙' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 99, '谒夫子庙', '道统三王大，功超二帝优。斯文垂彖系，吾志在春秋。车服先公志，威仪弟子修。宅闻丝竹响，壁有简编留。俎豆传千叶，章逢被九州。独全兵火代，不藉庙堂谋，老桧当庭发，清洙绕墓流。一来瞻阙里，如得与从游。', (SELECT id FROM poet WHERE name = '顾炎武' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '曲阜孔庙' LIMIT 1),  '强调孔子道统超越三王二帝；意象: 道统、三王、二帝、斯文、春秋、丝竹、简编、老桧、清洙；出处: 《亭林诗集》', '抒发瞻仰之情，如入圣人之门',  '["道统", "三王", "二帝", "斯文", "春秋", "丝竹", "简编", "老桧", "清洙"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '顾炎武' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '曲阜孔庙' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 100, '游孔庙', '当年辙迹苦牺惶，庙貌千秋更有光。志学敏求能不厌，因材施教实多方。诗书礼乐精华在，思孟颜曾俎豆旁。今日自然时代异，斯民怀念胜前王。', (SELECT id FROM poet WHERE name = '郭沫若' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '曲阜孔庙' LIMIT 1),  '表达对孔子教育思想的现代敬意；意象: 辙迹、志学、敏求、因材施教、诗书礼乐、思孟颜曾；出处: 《郭沫若全集·文学编》', '从现代视角赞颂孔子教育思想',  '["辙迹", "志学", "敏求", "因材施教", "诗书礼乐", "思孟颜曾"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '郭沫若' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '曲阜孔庙' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 101, '谒文宣王庙', '晚来乘兴谒先师，松柏凄凄人不知。九仞萧墙堆瓦砾，三间茅殿走狐狸。雨淋状似悲麟泣，露滴还同叹凤悲。倘使小儒名稍立，岂教吾道受栖迟。', (SELECT id FROM poet WHERE name = '罗隐' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '文宣王庙（曲阜孔庙）' LIMIT 1),  '感慨孔庙衰败，自叹怀才不遇；意象: 松柏、萧墙、瓦砾、茅殿、悲麟、叹凤；出处: 《罗隐集》', '写孔庙萧瑟景象，借古抒怀',  '["松柏", "萧墙", "瓦砾", "茅殿", "悲麟", "叹凤"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '罗隐' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '文宣王庙（曲阜孔庙）' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 102, '登太白楼', '昔闻李供奉，长啸独登楼。此地一垂顾，高名百代留。', (SELECT id FROM poet WHERE name = '王世贞' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '济宁太白楼' LIMIT 1),  '简洁而有力，突出太白楼因李白而名；意象: 李供奉、长啸、登楼、高名；出处: 《弇州山人四部稿》', '追忆李白，赞颂其才名',  '["李供奉", "长啸", "登楼", "高名"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '王世贞' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '济宁太白楼' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 103, '咏任城', '唐虞古邑济宁州，骚雅风流太白楼。诗酒英豪频作赋，南池婉转好乘舟。', (SELECT id FROM poet WHERE name = '蒙建华' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '济宁南池' LIMIT 1),  '概括济宁历史、文化与自然景观；意象: 唐虞古邑、太白楼、诗酒英豪、南池；出处: 《济宁当代诗词选》', '展现济宁的骚雅风流与自然之美',  '["唐虞古邑", "太白楼", "诗酒英豪", "南池"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '蒙建华' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '济宁南池' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 104, '京杭运河踏春行', '柳翠晴光染，桃妍一树红。闲观河两岸，紫燕剪春风。', (SELECT id FROM poet WHERE name = '郑守生' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '京杭大运河（济宁段）' LIMIT 1),  '典型春日运河风光；意象: 柳翠、桃妍、河两岸、紫燕、春风；出处: 《济宁当代诗词选》', '展现运河春日生机与活力',  '["柳翠", "桃妍", "河两岸", "紫燕", "春风"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '郑守生' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '京杭大运河（济宁段）' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 105, '登兖州城楼', '东郡趋庭日，南楼纵目初。浮云连海岱，平野入青徐。孤嶂秦碑在，荒城鲁殿余。从来多古意，临眺独踌躇。', (SELECT id FROM poet WHERE name = '杜甫' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '兖州城楼（遗址）' LIMIT 1),  '杜甫年轻时游历所作；意象: 东郡、南楼、浮云、海岱、平野、秦碑、鲁殿、古意；出处: 《全唐诗》卷224', '登楼远眺，感怀历史沧桑',  '["东郡", "南楼", "浮云", "海岱", "平野", "秦碑", "鲁殿", "古意"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杜甫' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '兖州城楼（遗址）' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 106, '鲁郡东石门送杜二甫', '醉别复几日，登临遍池台。何时石门路，重有金樽开？秋波落泗水，海色明徂徕。飞蓬各自远，且尽手中杯。', (SELECT id FROM poet WHERE name = '李白' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '济宁石门山/泗水' LIMIT 1),  '李白与杜甫在济宁东鲁送别之作；意象: 醉别、石门、金樽、秋波、泗水、海色、徂徕；出处: 《全唐诗》卷176', '以壮丽景色衬托离别之情',  '["醉别", "石门", "金樽", "秋波", "泗水", "海色", "徂徕"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李白' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '济宁石门山/泗水' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 107, '浣笔泉', '济上清泉池，名贤自昔游。豪吟须浣笔，纵饮却登楼。树色千村暮，烟光一涧秋。野亭聊寓意，怀古有余愁。', (SELECT id FROM poet WHERE name = '李如圭' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '济宁浣笔泉' LIMIT 1),  '与李白相关，富有诗情画意；意象: 清泉、浣笔、登楼、树色、烟光、怀古；出处: 《济宁直隶州志》', '清幽景色，引发怀古之愁',  '["清泉", "浣笔", "登楼", "树色", "烟光", "怀古"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李如圭' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '济宁浣笔泉' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 108, '太白楼', '名胜争传太白楼，旅怀冬霁惬初游。风清万里寒云净，日落千村暮霭浮。把酒济流城下绕，钩帘岱色席间收。醉余不觉清狂甚，直欲乘槎入斗牛。', (SELECT id FROM poet WHERE name = '龚勉' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '济宁太白楼' LIMIT 1),  '描写太白楼及济宁城景色的名篇；意象: 太白楼、冬霁、寒云、暮霭、济流、岱色；出处: 《任城县志》', '冬霁登楼，远眺济城景色',  '["太白楼", "冬霁", "寒云", "暮霭", "济流", "岱色"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '龚勉' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '济宁太白楼' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 109, '石佛寺', '石佛寺前秋水平，石佛寺后秋草生。老僧只爱秋色好，夜夜登楼看月明。', (SELECT id FROM poet WHERE name = '杭世骏' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '石佛寺（济宁）' LIMIT 1),  '画面纯净，意境悠远；意象: 秋水平、秋草、老僧、登楼、月明；出处: 《道古堂诗集》', '秋夜宁静，充满禅意',  '["秋水平", "秋草", "老僧", "登楼", "月明"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杭世骏' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '石佛寺（济宁）' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 110, '游南城王母阁', '峥嵘杰阁近层宵，青鸟音沉昼寂寥。出水新荷萦镜面，缘堤细草绣裙腰。片云冉冉浮空尽，万瓦鳞鳞人望遥。更待日长来逭署，绿杨深处听鸣啁。', (SELECT id FROM poet WHERE name = '徐金铭' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '济宁王母阁（南城）' LIMIT 1),  '细腻描绘南城王母阁春夏景色；意象: 杰阁、青鸟、新荷、细草、片云、万瓦、鸣啁；出处: 《济宁直隶州志》', '春日美景，城市与自然交融',  '["杰阁", "青鸟", "新荷", "细草", "片云", "万瓦", "鸣啁"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '徐金铭' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '济宁王母阁（南城）' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 111, '峄山', '孔孔洞洞山，玲玲珑珑窍；蜿蜿蜒蜒路，晶晶铃铃泉。', (SELECT id FROM poet WHERE name = '李白' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '峄山' LIMIT 1),  '李白用叠词写峄山，生动有趣；意象: 孔洞、玲珑、蜿蜒、晶晶、铃铃；出处: 《李太白集》', '描绘峄山奇特的洞穴与清泉',  '["孔洞", "玲珑", "蜿蜒", "晶晶", "铃铃"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李白' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '峄山' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 112, '题任城图', '太白楼前春水多，南湖春老白频波。白频波上风和雨，欲采芙蓉将奈何。', (SELECT id FROM poet WHERE name = '殷云宵' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '济宁南湖' LIMIT 1),  '画面感强，有淡淡的愁绪；意象: 太白楼、春水、南湖、白频波、风和雨；出处: 《济宁直隶州志》', '春湖烟雨，意境朦胧',  '["太白楼", "春水", "南湖", "白频波", "风和雨"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '殷云宵' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '济宁南湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 113, '陪李北海宴历下亭', '东藩驻皂盖，北渚凌青荷。
海右此亭古，济南名士多。', (SELECT id FROM poet WHERE name = '杜甫' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '大明湖' LIMIT 1),  '历下亭原址已移建；意象: 青荷、碧波、古亭、名士；出处: 《全唐诗》卷216', '杜甫、李邕曾游宴于此，有“济南名士多”典故',  '["青荷", "碧波", "古亭", "名士"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杜甫' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '大明湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 114, '咏王大娘戴竿', '楼前百戏竞争新，唯有长竿妙入神。谁谓绮罗翻有力，犹自嫌轻更着人。', (SELECT id FROM poet WHERE name = '刘晏' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '东明漆园庄子钓台' LIMIT 1),  '意象: 漆园、长竿、绮罗；出处: 全唐诗', '漆园是庄子为官、悟道、著书之地，钓鱼台是他濮水垂钓、拒仕明志之所，共同承载道家逍遥哲学、天人合一思想与黄河隐逸文脉。',  '["漆园", "长竿", "绮罗"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '刘晏' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东明漆园庄子钓台' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 115, '濮水', '青春行役去悠悠，一曲浦汀濮水流。正见涂中龟曳尾，今人特地感庄周。', (SELECT id FROM poet WHERE name = '胡曾' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '东明漆园庄子钓台' LIMIT 1),  '意象: 濮水、龟、庄周；出处: 全唐诗', '漆园是庄子为官、悟道、著书之地，钓鱼台是他濮水垂钓、拒仕明志之所，共同承载道家逍遥哲学、天人合一思想与黄河隐逸文脉。',  '["濮水", "龟", "庄周"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '胡曾' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东明漆园庄子钓台' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 116, '比部朱员外知东明县', '宰邑承颜帝泽优，春郊数舍跃骅骝。弦歌平昔有遗爱，桑梓依前访旧游。乡里归时荣尽锦，庭闱到日洁晨羞。陶潜未省荒三径，班嗣何因乐一丘。兰长谢庭傅赋咏，花开潘县占风流。薰炉绫被余香馥，省闼沉沉侍史愁。', (SELECT id FROM poet WHERE name = '杨亿' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '东明县' LIMIT 1),  '意象: 骅骝、桑梓、陶潜、班嗣、谢灵运、潘岳；出处: 全宋诗', '东明底蕴厚重，是庄子故里、葵丘会盟之地，融合圣贤文化、春秋盟会文化与黄河民俗文化，兼具儒道历史底蕴与黄河地域特色。',  '["骅骝", "桑梓", "陶潜", "班嗣", "谢灵运", "潘岳"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杨亿' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东明县' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 117, '漆园', '好闲早成性，果此谐夙诺。今日漆园游，还同庄叟乐。', (SELECT id FROM poet WHERE name = '裴迪' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '东明漆园' LIMIT 1),  '意象: 漆园；出处: 《全宋诗》《辋川集》', '漆园是庄子为官、悟道、著书之地，钓鱼台是他濮水垂钓、拒仕明志之所，共同承载道家逍遥哲学、天人合一思想与黄河隐逸文脉。',  '["漆园"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '裴迪' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东明漆园' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 118, '题王子晋祠', '黄屋非心敝屣然，玉笙吹断鹤升天。载瞻今日丛祠地，讵数当时定鼎年。琬琬真书文半剥，尘埃旧壁画犹鲜。归涂却顾荒山上，万柏森森销暮烟。', (SELECT id FROM poet WHERE name = '李好文' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '东明' LIMIT 1),  '意象: 玉笙、鹤、壁画；出处: 全元诗', '东明底蕴厚重，是庄子故里、葵丘会盟之地，融合圣贤文化、春秋盟会文化与黄河民俗文化，兼具儒道历史底蕴与黄河地域特色。',  '["玉笙", "鹤", "壁画"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李好文' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东明' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 119, '送葛时秀任东明', '东明花满县，令宰即神仙。宓子今为政，庄生旧寄廛。弦歌开小邑，风化入新篇。知有贤侯意，芳名动帝前。', (SELECT id FROM poet WHERE name = '何景明' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '东明县' LIMIT 1),  '意象: 东明花；出处: 明诗综', '东明底蕴厚重，是庄子故里、葵丘会盟之地，融合圣贤文化、春秋盟会文化与黄河民俗文化，兼具儒道历史底蕴与黄河地域特色。',  '["东明花"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '何景明' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东明县' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 120, '五霸盟坛', '霸图竞相长，姬辙既已东。抵掌歃血事，萧瑟起悲风。', (SELECT id FROM poet WHERE name = '陈其猷' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '东明五霸岗' LIMIT 1),  '原名葵丘，因当地盛产向日葵且地势较高有土丘而得名。公元前651年，齐桓公在此召集诸侯会盟，后人为了纪念这次会盟，将此地更名为五霸岗（亦称五伯岗、霸王岗）；意象: 霸王别姬；出处: 明诗综', '东明五霸岗即春秋葵丘会盟之地，是齐桓公确立霸业、尊王攘夷、诚信礼义的文化地标，承载春秋政治秩序、盟会礼仪与中原一统的历史精神',  '["霸王别姬"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '陈其猷' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东明五霸岗' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 121, '同穆敬甫舟中作', '回首云深蓟北台，不缘五斗赋归来。江湖我适扁舟兴，廊庙君终济世材。寒色侵人乡梦断，涛声入夜锦帆开。平生击楫成何事，起向灯前歌莫哀。', (SELECT id FROM poet WHERE name = '石星' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '东明' LIMIT 1),  '意象: 东明会台；出处: 明诗综', '东明底蕴厚重，是庄子故里、葵丘会盟之地，融合圣贤文化、春秋盟会文化与黄河民俗文化，兼具儒道历史底蕴与黄河地域特色。',  '["东明会台"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '石星' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东明' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 122, '钓台', '漆园为吏早知归，濮上垂纶愿不违。浦树千秋依断岸，汀蒲一曲吊斜晖。
掉头往事随流水，曳尾何人问钓矶。独倚南华台上望，逍遥天外大鹏飞。', (SELECT id FROM poet WHERE name = '李先芳' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '东明漆园庄子钓台' LIMIT 1),  '意象: 漆园、钓台、濮水、南华台', '漆园是庄子为官、悟道、著书之地，钓鱼台是他濮水垂钓、拒仕明志之所，共同承载道家逍遥哲学、天人合一思想与黄河隐逸文脉。',  '["漆园", "钓台", "濮水", "南华台"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李先芳' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东明漆园庄子钓台' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 123, '东明河上口占', '重重堤岸绕东明，尽是黄金力筑城。不用防河桑柘满，老农带月荷锄耕。', (SELECT id FROM poet WHERE name = '杨应标' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '东明' LIMIT 1),  '意象: 东明；出处: 清诗汇', '东明底蕴厚重，是庄子故里、葵丘会盟之地，融合圣贤文化、春秋盟会文化与黄河民俗文化，兼具儒道历史底蕴与黄河地域特色。',  '["东明"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杨应标' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东明' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 124, '五霸坛', '当年霸业竞谁存？日落遗坛鸟雀喧。欲问衰周兴废事，空余荒阜列平原。', (SELECT id FROM poet WHERE name = '范通' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '东明五霸岗' LIMIT 1),  '意象: 五覇坛；出处: 清诗汇', '东明五霸岗即春秋葵丘会盟之地，是齐桓公确立霸业、尊王攘夷、诚信礼义的文化地标，承载春秋政治秩序、盟会礼仪与中原一统的历史精神',  '["五覇坛"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '范通' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东明五霸岗' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 125, '寄裴郓州', '乌纱灵寿对秋风，怅望浮云济水东。官树阴阴铃阁暮，州人转忆白头翁。', (SELECT id FROM poet WHERE name = '韩翃' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '郓城' LIMIT 1),  '意象: 济水；出处: 全唐诗卷 245', '黄河厚土孕育 “水浒忠义、崇文尚武、戏曲非遗、黄河古脉” 四大文化，是好汉之乡、武术之乡、戏曲之乡、书画之乡。',  '["济水"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '韩翃' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '郓城' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 126, '郓州谿堂诗', '帝奠九廛，有叶有年。有荒不条，河岱之间。及我宪考，一收正之。视邦选侯，以公来尸。公来尸之，人始未信。公不饮食，以训以徇。孰饥无食，孰呻孰叹。孰冤不问，不得分愿。孰为邦蟊，节根之螟。羊很狼贪，以口覆城。吹之喣之，摩手拊之。箴之石之，膊而磔之。凡公四封，既富以强。谓公吾父，孰违公令。可以师征，不宁守邦。公作谿堂，播播流水。浅有蒲莲，深有葭苇。公以宾燕，其鼓骇骇。公燕谿堂，宾校醉饱。流有跳鱼，岸有集鸟。既歌以舞，其鼓考考。公在谿堂，公御琴瑟。公暨宾赞，稽经诹律。施用不差，人用不屈。谿有蘋苽，有龟有鱼。公在中流，右诗左书。无我斁遗，此邦是庥。', (SELECT id FROM poet WHERE name = '韩愈' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '郓州谿xi堂' LIMIT 1),  '公元1000年之后，郓州城迁至现州城位置，溪堂随之更名为郓州新堂。唐代郓州属河南道，治所初在郓城，到韩愈写诗时已迁至东平，州府驻地须城，前靠汶水，后临济水，西依八百里水泊。；意象: 谿堂；出处: 全唐诗卷 336', '它是唐代德政象征、北方官署园林典范，因韩愈名篇名扬后世，成为汶水流域历代文人雅集的精神地标，融理政思想、文学文脉、园林美学、人文情怀于一体。',  '["谿堂"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '韩愈' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '郓州谿xi堂' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 127, '赠马尚书再领郓州', '来朝当路日，承诏改辕时。再领须句国，仍迁少昊司。暖风抽宿麦，清雨卷归旗。赖寄新珠玉，长吟慰我思。', (SELECT id FROM poet WHERE name = '韩愈' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '郓州' LIMIT 1),  '意象: 郓州；出处: 全唐诗卷 344', '黄河厚土孕育 “水浒忠义、崇文尚武、戏曲非遗、黄河古脉” 四大文化，是好汉之乡、武术之乡、戏曲之乡、书画之乡。',  '["郓州"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '韩愈' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '郓州' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 128, '郓州新堂', '百尺丰堂汶水滨，鲁侯清燕此逡巡。溪寒素砾偏宜月，壁莹黄金不受尘。引客笙歌行处是，赏心花木四时新。未应久作林泉主，天子今思旧学臣。', (SELECT id FROM poet WHERE name = '曾巩' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '新堂' LIMIT 1),  '位于古代郓州（今山东郓城县）的一处著名建筑，原为唐安史之乱后节度使马总所建的溪堂，后经扩建成为集书院、学堂、亭台楼榭于一体的繁华场所；意象: 汶水、郓州新堂；出处: 全宋诗卷 455', '它是唐代德政象征、北方官署园林典范，因韩愈名篇名扬后世，成为汶水流域历代文人雅集的精神地标，融理政思想、文学文脉、园林美学、人文情怀于一体。',  '["汶水", "郓州新堂"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '曾巩' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '新堂' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 129, '月夜（节选）', '去岁游新堂，春风雪消后。池中半篙水，池上千尺柳。佳人如桃李，蝴蝶入衫袖。山川今何许，疆野已分宿。', (SELECT id FROM poet WHERE name = '苏轼' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '新堂' LIMIT 1),  '意象: 郓州新堂；出处: 全宋诗卷 795', '它是唐代德政象征、北方官署园林典范，因韩愈名篇名扬后世，成为汶水流域历代文人雅集的精神地标，融理政思想、文学文脉、园林美学、人文情怀于一体。',  '["郓州新堂"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '苏轼' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '新堂' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 130, '东平馆', '憔悴江南客，萧条古郓州。雨声连五日，月色彻中流。万里山河梦，千年宇宙愁。欲鞭刘豫骨，烟草暗荒邱。', (SELECT id FROM poet WHERE name = '文天祥' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '郓州' LIMIT 1),  '意象: 东平馆；出处: 全宋诗卷 3598', '东平文化以儒家为魂、水利为骨、水浒为韵、黄河为脉、运河为纽带，兼具北方雄健与江南灵秀，是齐鲁大地上千年不褪色的文化地标。',  '["东平馆"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '文天祥' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '郓州' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 131, '发郓州喜晴', '烈风西北来，万窍号高秋。宿云蔽层空，浮潦迷中州。行人苦沮洳，道路阻且修。流澌被鞍鞯，飞沫缀衣裘。昏鸦接翅落，原野惨以愁。城郭何萧条，闭户寒飕飕。中宵月色满，余光散衾裯。余子戒明发，飞雾霭郊邱。微见扶桑红，隐隐如沉浮。身游大荒野，海气吹蜃楼。须臾划当空，六合开沉幽。千年压颜色，苍翠光欲流。太阳经天行，大化不暂留。辉光何曾灭，晻霭终当收。严霜下丰草，长歌夜悠悠。明日东阿道，方轨骤骅骝。', (SELECT id FROM poet WHERE name = '文天祥' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '郓州' LIMIT 1),  '意象: 郓州；出处: 全宋诗卷 3598', '黄河厚土孕育 “水浒忠义、崇文尚武、戏曲非遗、黄河古脉” 四大文化，是好汉之乡、武术之乡、戏曲之乡、书画之乡。',  '["郓州"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '文天祥' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '郓州' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 132, '送杨子宣尹郓城', '明时作邑重优游，我为斯人抱隐忧。巨室昂昂张虎翼，奸民濈濈沸鱼头。朝衙召集乡三老，幕邸趋承郡督邮。利刃往年曾一试，知君谈笑已无牛。', (SELECT id FROM poet WHERE name = '宋褧' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '郓州' LIMIT 1),  '意象: 郓城；出处: 全元诗卷 1075', '黄河厚土孕育 “水浒忠义、崇文尚武、戏曲非遗、黄河古脉” 四大文化，是好汉之乡、武术之乡、戏曲之乡、书画之乡。',  '["郓城"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '宋褧' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '郓州' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 133, '郓城题壁・其一', '高楼绿树带斜晖，十二街中过客稀。忆著涌金门外住，画船湖上未曾归。', (SELECT id FROM poet WHERE name = '乃贤' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '郓州' LIMIT 1),  '意象: 郓城；出处: 全元诗卷 2783', '黄河厚土孕育 “水浒忠义、崇文尚武、戏曲非遗、黄河古脉” 四大文化，是好汉之乡、武术之乡、戏曲之乡、书画之乡。',  '["郓城"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '乃贤' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '郓州' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 134, '郓城题壁・其二', '贾客金多梦不成，窗前叶落自心惊。可怜游子囊羞涩，夜半长歌看月明。', (SELECT id FROM poet WHERE name = '乃贤' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '郓州' LIMIT 1),  '意象: 郓城；出处: 全元诗卷 2783', '黄河厚土孕育 “水浒忠义、崇文尚武、戏曲非遗、黄河古脉” 四大文化，是好汉之乡、武术之乡、戏曲之乡、书画之乡。',  '["郓城"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '乃贤' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '郓州' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 135, '新堤谣（节选）', '近岁河决白茅，东北泛滥千余里，始建行都水监于郓城，以专治之。老人家住黄河边，黄茅缚屋三四椽。有牛一具田一顷，艺桑种谷终残年。', (SELECT id FROM poet WHERE name = '乃贤' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '郓州' LIMIT 1),  '意象: 郓城；出处: 全元诗卷 2783', '黄河厚土孕育 “水浒忠义、崇文尚武、戏曲非遗、黄河古脉” 四大文化，是好汉之乡、武术之乡、戏曲之乡、书画之乡。',  '["郓城"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '乃贤' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '郓州' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 136, '郓城县', '夜听墙下鸡，晓扫墙上霜。鸡啼霜正白，繁星粲成章。维兹古郓城，废塔河冰傍。亦复有民社，鸡犬声相望。我舟泊已久，徒旅行未遑。回瞻百里间，形势转仓皇。闷来走平陆，临眺齐鲁疆。汶济日夜去，青徐互低昂。泰山岳所尊，凫绎圣之邦。归田事则远，怀古心孔伤。', (SELECT id FROM poet WHERE name = '唐之淳' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '郓州' LIMIT 1),  '意象: 郓城；出处: 明诗综卷 18', '黄河厚土孕育 “水浒忠义、崇文尚武、戏曲非遗、黄河古脉” 四大文化，是好汉之乡、武术之乡、戏曲之乡、书画之乡。',  '["郓城"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '唐之淳' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '郓州' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 137, '郓城县（其二）', '废塔千年寺，荒城有数家。行行过村落，稍稍见桑麻。薄酒高论价，轻舟浅阁沙。无言对春晚，独立数残花。', (SELECT id FROM poet WHERE name = '唐之淳' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '郓州' LIMIT 1),  '意象: 郓城；出处: 明诗综卷 18', '黄河厚土孕育 “水浒忠义、崇文尚武、戏曲非遗、黄河古脉” 四大文化，是好汉之乡、武术之乡、戏曲之乡、书画之乡。',  '["郓城"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '唐之淳' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '郓州' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 138, '过廪丘', '远水通雷泽，荒坡接帝丘。渔歌迷五岔，烟树隔千秋。落日孤云霭，空城幼影浮。春皋凭野望，点点试耕牛。', (SELECT id FROM poet WHERE name = '侯祁' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '郓州' LIMIT 1),  '意象: 郓城；出处: 明诗综卷 42', '黄河厚土孕育 “水浒忠义、崇文尚武、戏曲非遗、黄河古脉” 四大文化，是好汉之乡、武术之乡、戏曲之乡、书画之乡。',  '["郓城"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '侯祁' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '郓州' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 139, '七陵碑', '丰碑古篆汉时文，遗碣谁传魏代芬。郁郁苍苍千载树，半巢鸿鹄半烟云。', (SELECT id FROM poet WHERE name = '陈良谟' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '郓城七陵碑古迹' LIMIT 1),  '是古郓十大景观遗址之一，因村中留有汉时残碑上书"七陵"二字而得名；意象: 七陵碑；出处: 清诗汇卷 128', '它是鲁西南珍贵汉代篆书石刻，兼具书法考古价值，因 “七陵” 存历史谜团，依托林木烟云景致成为当地标志性人文景观与乡土文化符号。',  '["七陵碑"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '陈良谟' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '郓城七陵碑古迹' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 140, '病中读《南华》（节选）', '冥鲲修几千，鹏背广几里？南图何日旋，抟土何时止？斥鷃与莺鸠，焉能窥其涘。榆枋蓬蒿间，笑而不自耻。', (SELECT id FROM poet WHERE name = '张锷' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '郓城' LIMIT 1),  '该作者家乡为郓州；意象: 作者家乡；出处: 清诗汇卷 186', '黄河厚土孕育 “水浒忠义、崇文尚武、戏曲非遗、黄河古脉” 四大文化，是好汉之乡、武术之乡、戏曲之乡、书画之乡。',  '["作者家乡"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '张锷' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '郓城' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 141, '送知己赴濮州', '中路行僧谒，邮亭话海涛。剑摇林狖落，旗闪岳禽高。苔长空州狱，花开梦省曹。濮阳流政化，一半布风骚。', (SELECT id FROM poet WHERE name = '李洞' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '濮州' LIMIT 1),  '清朝山东省直隶州之一，原治今山东省菏泽市鄄城县旧城镇(原鄄城县城)，后因黄河水患徙州治至黄河北岸，治今河南省濮阳市范县濮城镇(原属鄄城县)；意象: 濮州；出处: 全唐诗', '古濮水文明核心、黄河下游水陆枢纽，承载颛顼遗墟、昆吾旧壤、卫郑齐鲁交汇的历史层积，也是黄河水患与治河史的典型见证。',  '["濮州"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李洞' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '濮州' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 142, '鄄城道中', '千里长河古鄄城，路傍风物动诗情。烟迷柳岸春方老，雨洗郊原草又生。', (SELECT id FROM poet WHERE name = '张咏' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '古鄄城' LIMIT 1),  '意象: 鄄城；出处: 全宋诗', '尧舜文化发祥地、孙膑故里与曹魏建安文化重要传承地，地处黄河沿岸，融合上古圣迹、兵家智慧、名士文脉与黄河民俗，底蕴厚重。',  '["鄄城"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '张咏' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '古鄄城' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 143, '濮州道中', '濮水悠悠绕鄄城，野田荒冢古今情。行人莫问当年事，落日西风草自生。', (SELECT id FROM poet WHERE name = '关汉卿' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '濮水' LIMIT 1),  '意象: 鄄城；出处: 全元诗', '上古濮文化发源地，因 “桑间濮上” 闻名，见证诸多历史事件，是兼具典故价值与地域风情的文化古水。',  '["鄄城"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '关汉卿' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '濮水' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 144, '子建读书台', '城角岿然土一堆，当年子建读书来。三分鼎沸无遗址，七步歌残有旧台。', (SELECT id FROM poet WHERE name = '李先芳' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '曹植读书台' LIMIT 1),  '原址位于旧城东北1公里许，是曹植于魏文帝黄初二年至三年之间为鄄城侯与鄄城王时所建的读书台，也被称为陈思王台；意象: 子建读书台；出处: 明诗综', '它是建安文学的重要遗存，见证曹植诗文创作，承载着建安风骨与千年文人文脉。',  '["子建读书台"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李先芳' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '曹植读书台' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 145, '鄄城怀古', '齐鲁多奇迹，鄄城会有台。当年空战伐，此日已蒿莱。子建不可作，齐桓安在哉。悠然会心处，选胜草堂。', (SELECT id FROM poet WHERE name = '佚名' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '古会台' LIMIT 1),  '意象: 鄄城；出处: 明诗综', '因葵丘之盟闻名，是春秋霸政的标志性遗存，也是古代信义与礼乐文化的实物见证。',  '["鄄城"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '佚名' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '古会台' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 146, '鄄城八景诗', '映潭明月舞西风，红沟绿岸水流东。杏岗春色红十里，席桥斜渡小舟横。春柳时见杨花落，钓台阴雨雾蒙蒙。修真独卧箕山侧，夜听谷林撞晚钟。', (SELECT id FROM poet WHERE name = '佚名' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '鄄城' LIMIT 1),  '意象: 鄄城；出处: 清诗汇', '尧舜文化发祥地、孙膑故里与曹魏建安文化重要传承地，地处黄河沿岸，融合上古圣迹、兵家智慧、名士文脉与黄河民俗，底蕴厚重。',  '["鄄城"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '佚名' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '鄄城' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 147, '和崔二少府登楚丘城作', '故人亦不遇，异县久栖托。辛勤失路意，感叹登楼作。清晨眺原野，独立穷寥廓。云散芒砀山，水还睢阳郭。绕梁即襟带，封卫多漂泊。事古悲城池，年丰爱墟落。相逢俱未展，携手空萧索。何意千里心，仍求百金诺。公侯皆我辈，动用在谋略。圣心思贤才，朅来刈葵藿。', (SELECT id FROM poet WHERE name = '高适' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '楚丘城' LIMIT 1),  '意象: 楚丘城；出处: 全唐诗', '既是楚人早期发祥之地，也是商汤会盟之所，融汇了上古部族文明与早期王朝礼制文化。',  '["楚丘城"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '高适' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '楚丘城' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 148, '奉和展礼岱宗涂经济濮', '拂汉星旗转，分霄日羽明。将追会阜迹，更濯颖川缨。涧影含山落，林光映水清。古濮流事远，今圣礼情并。', (SELECT id FROM poet WHERE name = '萧楚材' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '古濮水' LIMIT 1),  '楚丘，亦称景山、桑台、邳(丕)山；意象: 濮水；出处: 全唐诗', '上古濮文化发源地，因 “桑间濮上” 闻名，见证诸多历史事件，是兼具典故价值与地域风情的文化古水。',  '["濮水"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '萧楚材' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '古濮水' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 149, '曹州寄任独复', '曹州城枕大河湄，风物偏宜客子诗。几处烟村临古渡，半川寒日照平陂。乡心渐逐流年老，酒力难禁往事悲。别后相逢定何日，雪天休负故山期。', (SELECT id FROM poet WHERE name = '林逋' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '曹州城' LIMIT 1),  '意象: 曹州；出处: 全宋诗', '此地为上古文明沃土，兼具牡丹文化、水浒忠义文化与黄河民俗风情，文化底蕴深厚多元。',  '["曹州"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '林逋' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '曹州城' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 150, '曹州道中', '十日曹州道，尘沙眯客睛。野田寒草短，古渡晚烟平。岁月催人老，山川照眼明。功名竟何事，空负此生情。', (SELECT id FROM poet WHERE name = '陈师道' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '曹州城' LIMIT 1),  '意象: 曹州；出处: 全宋诗', '此地为上古文明沃土，兼具牡丹文化、水浒忠义文化与黄河民俗风情，文化底蕴深厚多元。',  '["曹州"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '陈师道' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '曹州城' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 151, '曹州怀古', '曹南雄镇古名州，往事悠悠逐水流。舜耕历山留圣迹，渔雷泽畔忆贤流。牡丹旧谱传风韵，濮水残波映晚秋。千载兴亡多少恨，夕阳无语下荒丘。', (SELECT id FROM poet WHERE name = '王恽' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '曹州城' LIMIT 1),  '意象: 曹州；出处: 全元诗', '此地为上古文明沃土，兼具牡丹文化、水浒忠义文化与黄河民俗风情，文化底蕴深厚多元。',  '["曹州"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '王恽' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '曹州城' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 152, '凝香园牡丹', '廿年梦想故园花，今到开时始在家。几许新名添旧谱，因多旧种变新芽。摇风百态娇无定，坠露丛芳影乱斜。为语东皇留醉客，好教晴日护丹霞。', (SELECT id FROM poet WHERE name = '何应瑞' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '凝香园' LIMIT 1),  '意象: 牡丹；出处: 明诗综', '以花木景致与古典造园艺术见长，承载当地园林文化与人文雅韵。',  '["牡丹"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '何应瑞' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '凝香园' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 153, '曹州道中', '平芜千里接曹州，古道风沙满客裘。野树啼鸦寒日暮，荒村流水断烟秋。虞舜古迹埋青草，范蠡遗祠枕碧流。极目苍茫思往事，夕阳无语下汀洲。', (SELECT id FROM poet WHERE name = '李先芳' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '曹州城' LIMIT 1),  '意象: 曹州；出处: 明诗综', '此地为上古文明沃土，兼具牡丹文化、水浒忠义文化与黄河民俗风情，文化底蕴深厚多元。',  '["曹州"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李先芳' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '曹州城' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 154, '曹南牡丹四首・其三', '洛阳自昔擅芳丛，姚魏天香冠六宫。一见曹南三百种，从今不数洛花红。', (SELECT id FROM poet WHERE name = '王曰高' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '曹州牡丹' LIMIT 1),  '意象: 牡丹；出处: 清诗汇', '此地为上古文明沃土，兼具牡丹文化、水浒忠义文化与黄河民俗风情，文化底蕴深厚多元。',  '["牡丹"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '王曰高' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '曹州牡丹' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 155, '牡丹行', '洛阳花事既消歇，天彭亦号小西京。当时中原已沦没，南人未到曹南城。人间尤物不可见，姚黄魏紫空闻名。状元得称第一种，玉楼禁苑齐争荣。天香一品及三变，恨不欧阳同日生。', (SELECT id FROM poet WHERE name = '刘大绅' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '曹州牡丹' LIMIT 1),  '意象: 牡丹；出处: 清诗汇', '此地为上古文明沃土，兼具牡丹文化、水浒忠义文化与黄河民俗风情，文化底蕴深厚多元。',  '["牡丹"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '刘大绅' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '曹州牡丹' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 156, '东阿王', '国事分明属灌均，西陵魂断夜来人。君王不得为天子，半为当时赋洛神。', (SELECT id FROM poet WHERE name = '李商隐' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '东阿' LIMIT 1),  '意象: 东阿王曹植；出处: 全唐诗', '曹植居东阿期间留下诸多诗文与遗迹，是三国文学、建安文化在鲁西地区的重要载体。',  '["东阿王曹植"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李商隐' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东阿' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 157, '赛神（节选・咏阿胶）', '阿胶在末派，罔象游上源。灵药所巡尽，黑波朝夕喷。', (SELECT id FROM poet WHERE name = '元稹' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '阿胶' LIMIT 1),  '意象: 阿胶；出处: 全唐诗', '它是鲁西地域特色物产与传统中医药文化的代表，因历代名人推崇、宫廷御用加持，兼具养生价值与深厚的人文底蕴。',  '["阿胶"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '元稹' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '阿胶' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 158, '宿高唐州', '早发东阿县，暮宿高唐州。哲人达几微，志士怀隐忧。山河已历历，天地空悠悠。孤馆一夜宿，北风吹白头。', (SELECT id FROM poet WHERE name = '文天祥' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '高唐' LIMIT 1),  '意象: 东阿、高唐；出处: 全宋诗', '高唐是黄河文化、农耕商贸文化、书画艺术文化、水浒民俗文化交融之地，以“书画之乡、锦鲤之都、金高唐”为核心文化标识。',  '["东阿", "高唐"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '文天祥' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '高唐' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 159, '东阿', '恸哭东阿县，伤心复此来。山河依旧在，人事已全非。野寺荒烟合，空城落日颓。可怜陈思王，千古有余哀。', (SELECT id FROM poet WHERE name = '陈师道' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '东阿县' LIMIT 1),  '意象: 东阿；出处: 全宋诗', '东阿坐拥黄河文化底蕴，以阿胶养生文化、鱼山梵呗佛教音乐文化为两大核心，兼有名士文脉与吉祥民俗，地域文化特色鲜明。',  '["东阿"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '陈师道' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东阿县' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 160, '历枣强县（过东阿）', '东阿望不见，客路思悠悠。野水连天阔，荒城接地流。雁声寒过雨，树色晚凝秋。独有渔樵者，生涯老一丘。', (SELECT id FROM poet WHERE name = '王冕' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '东阿县' LIMIT 1),  '意象: 东阿；出处: 全元诗', '东阿坐拥黄河文化底蕴，以阿胶养生文化、鱼山梵呗佛教音乐文化为两大核心，兼有名士文脉与吉祥民俗，地域文化特色鲜明。',  '["东阿"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '王冕' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东阿县' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 161, '东阿所诗', '东原古东阿，雉堞临清涡。土风厚且淳，物产富而多。阿胶煮灵泉，鱼山郁嵯峨。我来吊陈迹，感慨一长歌。', (SELECT id FROM poet WHERE name = '杨维桢' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '东阿县' LIMIT 1),  '意象: 东阿；出处: 全元诗', '东阿坐拥黄河文化底蕴，以阿胶养生文化、鱼山梵呗佛教音乐文化为两大核心，兼有名士文脉与吉祥民俗，地域文化特色鲜明。',  '["东阿"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杨维桢' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东阿县' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 162, '过东阿怀陈思王', '鱼山青未了，东阿路更赊。荒台余蔓草，古寺半烟霞。往事悲陈迹，风流忆故家。空怜八斗才，沦落向天涯。', (SELECT id FROM poet WHERE name = '李先芳' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '东阿县' LIMIT 1),  '意象: 东阿；出处: 明诗综', '东阿坐拥黄河文化底蕴，以阿胶养生文化、鱼山梵呗佛教音乐文化为两大核心，兼有名士文脉与吉祥民俗，地域文化特色鲜明。',  '["东阿"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李先芳' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东阿县' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 163, '东阿道中', '平路连沙碛，孤城枕大河。天寒草木落，岁晚客行多。古迹思曹植，民风问野婆。夕阳无限意，回首一长歌。', (SELECT id FROM poet WHERE name = '何景明' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '东阿县' LIMIT 1),  '意象: 东阿、曹植；出处: 明诗综', '东阿坐拥黄河文化底蕴，以阿胶养生文化、鱼山梵呗佛教音乐文化为两大核心，兼有名士文脉与吉祥民俗，地域文化特色鲜明。',  '["东阿", "曹植"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '何景明' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东阿县' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 164, '东阿吊古', '东阿吊古重裴徊，其豆相煎事可哀。怪底书生难际遇，侯王犹自不宜才。', (SELECT id FROM poet WHERE name = '张问陶' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '东阿县' LIMIT 1),  '意象: 曹植；出处: 清诗汇', '东阿坐拥黄河文化底蕴，以阿胶养生文化、鱼山梵呗佛教音乐文化为两大核心，兼有名士文脉与吉祥民俗，地域文化特色鲜明。',  '["曹植"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '张问陶' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东阿县' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 165, '东阿县哭故同年房舍人', '满目惜离群，秋风不可闻。鱼山才识我，黄石故非君。往事庭中草，前期水上云。遥怜有新契，子建接荒坟。', (SELECT id FROM poet WHERE name = '赵执信' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '东阿县' LIMIT 1),  '意象: 东阿；出处: 清诗汇', '东阿坐拥黄河文化底蕴，以阿胶养生文化、鱼山梵呗佛教音乐文化为两大核心，兼有名士文脉与吉祥民俗，地域文化特色鲜明。',  '["东阿"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '赵执信' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东阿县' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 166, '送舅氏杨通直令阳谷', '人言慎县宰，颇似太丘君。客户有训遣，司官无讼闻。外家久寂莫，舅氏少辛勤。一邑何足道，高名谁与群。西来马特特，冬晚雪纷纷。公朝道由砥，孤士迹如云。过门苦地僻，下直迫日曛。深泥枉穷巷，寒垆对残煴。感慨说宣子，飘零缀遗文。麟阁窘铅椠，鱼山失耕芸。远情等匏系，归梦剧丝棼。山东接畿甸，阳谷近榆枌。吏昔猛豺虎，民如窜麖麏。幸逢宽大时，庶几仁惠薰。自笑下士策，不殊野人芹。爱民宜百禄，本茂实当蕡。', (SELECT id FROM poet WHERE name = '晁补之' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '阳谷县' LIMIT 1),  '意象: 阳谷；出处: 全宋诗', '阳谷是黄河文化、运河文化、水浒文化交融地，底蕴深厚',  '["阳谷"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '晁补之' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '阳谷县' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 167, '春帖子词·阳谷宾初日', '阳谷宾初日，清台告协风。
愿如风有信，长与日俱中。', (SELECT id FROM poet WHERE name = '苏轼' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '阳谷县' LIMIT 1),  '意象: 阳谷；出处: 全宋诗', '阳谷是黄河文化、运河文化、水浒文化交融地，底蕴深厚',  '["阳谷"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '苏轼' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '阳谷县' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 168, '两曜二首·朝朝出阳谷', '朝朝出阳谷，夜夜入虞渊。
且看乌轮转，休论蚁磨旋', (SELECT id FROM poet WHERE name = '刘克庄' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '阳谷县' LIMIT 1),  '意象: 阳谷；出处: 全宋诗', '阳谷是黄河文化、运河文化、水浒文化交融地，底蕴深厚',  '["阳谷"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '刘克庄' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '阳谷县' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 169, '盟台遗响', '地僻空云雾，台荒更草莱。登临伤往代，谈笑忆雄才。图霸名犹在，尊周事可哀。杏坛方寸地，千古独崔嵬。', (SELECT id FROM poet WHERE name = '吴铠' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '盟台' LIMIT 1),  '今已不存；意象: 盟台；出处: 明诗综', '见证春秋诸侯会盟、尊王攘夷的历史，是齐鲁盟会文化与早期霸业文明的实物遗存，位列阳谷古八景。',  '["盟台"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '吴铠' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '盟台' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 170, '阿井胶泉', '灵源疑出蛟龙窟，淑气原从天地贻。九土所钟惟上品，千年制胶岂凡材。炼砂煮石经济事，丹井药炉亦可哀。', (SELECT id FROM poet WHERE name = '吴铠' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '灵泉' LIMIT 1),  '意象: 阿胶；出处: 明诗综', '它是阿胶文化的发源地，依托优质泉水成就传统制胶技艺，融合医药、运河与人文传说，底蕴深厚。',  '["阿胶"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '吴铠' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '灵泉' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 171, '阳谷县', '江黄曾此会，渺渺棹扁舟。野草迷阳谷，汀花落济州。盟寒菏泽水，春近岳云楼。日暮弦歌地，空悲战伐秋。', (SELECT id FROM poet WHERE name = '陈廷敬' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '阳谷县' LIMIT 1),  '意象: 阳谷；出处: 午亭文编卷二十', '阳谷是黄河文化、运河文化、水浒文化交融地，底蕴深厚',  '["阳谷"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '陈廷敬' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '阳谷县' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 172, '登阳谷县景阳冈，此武松打虎之地也', '满眼秋风草木荒，英雄踪迹转迷茫。
忍看积患胜于虎，能不长怀武二郎。', (SELECT id FROM poet WHERE name = '陈仁德' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '阳谷县' LIMIT 1),  '中华诗词学会理事；意象: 阳谷', '阳谷是黄河文化、运河文化、水浒文化交融地，底蕴深厚',  '["阳谷"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '陈仁德' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '阳谷县' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 173, '阳谷城有狮子楼，传武松搏杀西门庆于此', '登楼我自拜英雄，想见当年气若虹。改尽沧桑今日事，西门个个总从容', (SELECT id FROM poet WHERE name = '陈仁德' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '阳谷县' LIMIT 1),  '中华诗词学会理事；意象: 阳谷', '阳谷是黄河文化、运河文化、水浒文化交融地，底蕴深厚',  '["阳谷"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '陈仁德' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '阳谷县' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 174, '陪李北海宴历下亭', '东藩驻皂盖，北渚凌青荷。
海右此亭古，济南名士多。', (SELECT id FROM poet WHERE name = '杜甫' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '大明湖' LIMIT 1),  '历下亭原址已移建；意象: 青荷、碧波、古亭、名士；出处: 《全唐诗》卷216', '杜甫、李邕曾游宴于此，有“济南名士多”典故',  '["青荷", "碧波", "古亭", "名士"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '杜甫' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '大明湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 175, '渡河', '归途过黄河，一叶大如掌。飕飗西南风，饱帆荡双桨。
船小堕帆侧，高低任俛仰。舟如瓢水盈，闪闪浮瓮盎。
激水雪崩腾，珠花迸衣上。驶急穿横流，汹汹作怒响。
回首过来处，低云接沆漭。', (SELECT id FROM poet WHERE name = '蒲松龄' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河古渡' LIMIT 1),  '意象: 扁舟、黄河浊浪、长风、长堤、低云、惊涛；出处: 《聊斋诗集》卷一；路大荒整理校勘《蒲松龄全集》', '作为淄博本土文学家，蒲松龄以第一视角实录黄河渡河全过程，细致刻画巨浪、狂风、小舟颠簸的惊险旅途。诗作跳出单纯写景，既留存了清代高青段黄河真实水文特征，又记录清代齐地跨黄行旅风貌；同时以个人羁旅视角，将黄河雄浑自然气势与游子旅途心境相融，兼具水利史料价值、旅行文学价值与齐地地域文学特色。',  '["扁舟", "黄河浊浪", "长风", "长堤", "低云", "惊涛"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '蒲松龄' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河古渡' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 176, '黄河晓渡', '扁舟风急晓伶仃，宿酒萦怀醉未醒。河汉微茫人影乱，鱼龙出没浪花腥。
当窗丛荻移新绿，隔水长堤送远青。一曲棹歌烟水碧，沙禽飞过白苹汀。', (SELECT id FROM poet WHERE name = '蒲松龄' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河古渡' LIMIT 1),  '意象: 晓风扁舟、晨雾大河、芦荻长堤、沙禽、苹汀；出处: 《聊斋诗集》卷一；路大荒校本《蒲松龄全集》', '淄博本土文人清晨渡黄河的实景写生，融合黄河水利风貌、齐地乡野湿地风光，留存清代黄河渡口生活图景，兼具文学与地理史料价值',  '["晓风扁舟", "晨雾大河", "芦荻长堤", "沙禽", "苹汀"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '蒲松龄' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河古渡' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 177, '马踏湖秋望', '霜落平湖净，秋空万里开。云连青岱色，水接黄河来。
渔艇依洲渚，人家傍草莱。齐山回首处，落日满苍苔。', (SELECT id FROM poet WHERE name = '王士禛' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河古渡' LIMIT 1),  '意象: 霜天平湖、万里秋空、青岱远山、黄河来水、渔艇、湖洲滩渚、湖畔村居、落日苍苔；出处: 《渔洋诗集》王士禛自定全集', '本土神韵派诗人秋日登高观湖，以 “水接黄河来” 点明湖泊水源与黄河的依存关系，将泰岱山色、黄河水系、齐地田园融为一体，融合黄河湿地文化与齐地乡土文脉',  '["霜天平湖", "万里秋空", "青岱远山", "黄河来水", "渔艇", "湖洲滩渚", "湖畔村居", "落日苍苔"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '王士禛' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河古渡' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 178, '锦秋湖竹枝词・其一', '锦湖水色胜湘湖，雉尾莼羹玉不如。持谢江南陆内史，酪浆还得似渠无。', (SELECT id FROM poet WHERE name = '王士禛' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '马踏湖' LIMIT 1),  '意象: 锦秋湖水、湖中产莼羹、湖乡水产、水乡风光；出处: 《渔洋山人精华录》、《桓台县志・艺文志》', '王士禛立足家乡湖景创作竹枝词，将淄博黄河水系孕育的锦秋湖与江南名湖对比，夸赞本地湖景与湖鲜物产，凸显黄河滋养下齐地水乡独有的风物魅力，承载齐地本土水乡文化自信',  '["锦秋湖水", "湖中产莼羹", "湖乡水产", "水乡风光"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '王士禛' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '马踏湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 179, '锦秋亭', '霜风收绿锦，万顷水云秋。海气朝城市，山光晚对楼。
舟车通北阙，图画入南州。且食鲈鱼美，吾盟在白鸥。', (SELECT id FROM poet WHERE name = '于钦' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '马踏湖' LIMIT 1),  '意象: 霜风湖景、万顷湖水、水云秋光、海气山光、湖上亭楼、往来舟车、湖中鲈鱼、沙鸥；出处: 《桓台县志・艺文志》', '元代地理学者于钦实地游历马踏湖登锦秋亭有感而作，全景描绘黄河水系孕育的万顷湖光、水陆交通与湖鲜物产，借湖景抒发归隐江湖的志趣，兼具地理纪实价值与齐地水乡人文情怀。',  '["霜风湖景", "万顷湖水", "水云秋光", "海气山光", "湖上亭楼", "往来舟车", "湖中鲈鱼", "沙鸥"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '于钦' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '马踏湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 180, '横湖绝句', '贪看翠盖拥红妆，不觉湖边一夜霜。卷却天机云锦缎，纵教匹练写秋光。', (SELECT id FROM poet WHERE name = '苏轼' LIMIT 1), 5, (SELECT id FROM scenic_spot WHERE name = '马踏湖' LIMIT 1),  '意象: 荷叶翠盖、荷花红妆、一夜秋霜、湖光云锦、白练秋水；出处: 《东坡全集》', '苏轼游历齐地驻足横湖赏荷所作，以华美比喻描摹黄河水系滋养的荷塘夏末转秋之景，将湖内荷花、秋霜湖光写得灵动秀美，借湖区风物赞美黄河水土孕育的齐地水乡景致。',  '["荷叶翠盖", "荷花红妆", "一夜秋霜", "湖光云锦", "白练秋水"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '苏轼' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '马踏湖' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 181, '《东津晓渡》', '津河环带碧流长，舟子清晨渡口忙。
缥缈云边人竞渡，汪洋浪里棹轻扬。
寻常荡漾沉波月，来往栖迟向晓霜。
幸际政平方系缆，行人犹似唤渔郎。', (SELECT id FROM poet WHERE name = '章忠' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '东津渡' LIMIT 1),  '意象: 黄河长河、拂晓渡口、晨雾云天、河面浪涛、渡船舟楫、渡河行人、晓霜残月、江上渔郎；出处: 《利津县志・艺文志・古八景》', '明成化利津儒学训导章忠本地实景创作，完整描摹拂晓时分黄河渡口繁忙图景，记录黄河干流航运商贸盛景；既绘黄河长河、晨雾浪涛、竞渡舟楫的自然河景，又写舟子、行旅、渔人的人间烟火，末句借渡口安宁景象称颂当朝治世，兼具黄河地理纪实与地方民生人文价值。',  '["黄河长河", "拂晓渡口", "晨雾云天", "河面浪涛", "渡船舟楫", "渡河行人", "晓霜残月", "江上渔郎"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '章忠' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东津渡' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 182, '东津即事', '济流千曲赴东津，万壑朝宗汇海滨。
岸阔潮平飞野鹜，帆悬风静照游鳞。
青齐车毂争先渡，吴越艨艘列异珍。
此地由来似都会，千村河润泽斯民。', (SELECT id FROM poet WHERE name = '刘学渤' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '东津渡' LIMIT 1),  '意象: 九曲黄河（济流）、入海河口、宽阔河岸、潮水平滩、水鸟、高悬船帆、南北车马、江南商船、沿河村落；出处: 《利津县志续编》卷十艺文志，', '本地邑人立足家乡渡口实景创作，以全景视角刻画黄河河道入海格局、渡口车船云集的商贸盛况，点明黄河水源普惠沿岸百姓，融合黄河水利文化、漕运商贸文化与黄河三角洲乡土民生，饱含对家乡黄河风物的自豪。',  '["九曲黄河（济流）", "入海河口", "宽阔河岸", "潮水平滩", "水鸟", "高悬船帆", "南北车马", "江南商船", "沿河村落"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '刘学渤' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东津渡' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 183, '九日同诸君子登东城楼', '新墉矗画楼，古渡傍城头。
帆曳千林影，鸿书一字秋。
有情天未峔，无恙客销愁。
且酌金花酒，休怀秃鬓羞。', (SELECT id FROM poet WHERE name = '张本大' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '东津渡' LIMIT 1),  '意象: 崭新城垣、东城画楼、黄河古渡、江上帆影、林间倒影、秋日鸿雁、重阳美酒；出处: 《利津县志补》卷五艺文志', '时任利津儒学训导的张本大重阳时节邀约同僚登东城楼，凭楼俯瞰楼下黄河古渡全景，将城垣高楼、黄河渡口、秋日鸿雁相融，借黄河河畔秋景宴饮抒怀，既记录东营城池与黄河相依的地域风貌，也展现清代黄河边文人雅士的休闲社交文化。',  '["崭新城垣", "东城画楼", "黄河古渡", "江上帆影", "林间倒影", "秋日鸿雁", "重阳美酒"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '张本大' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东津渡' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 184, '秋日清河晚眺', '一隄疏柳绘清秋，水色遥空挹暮楼。
座洽兰言堪并味，饮宽酒政任交头。
安澜场墅农功就，集网归帆渔唱幽。
兴尽莫教俱酩酊，明朝还约泛舟游。', (SELECT id FROM poet WHERE name = '汤朝槭' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '黄河大堤' LIMIT 1),  '意象: 黄河长堤、堤畔疏柳、清秋暮色、临水高楼、安澜护堤场墅、成熟农田、收网渔船、江上渔歌、河上泛舟；出处: 《利津县志补》卷五艺文志', '利津本土诗人漫步黄河大堤，于黄昏眺望河堤、河场、归帆，将黄河水利设施、沿岸农耕渔业景象与文人宴游结合。诗歌以本地独有水利地名 “安澜场” 为核心意象，既写实记录东营清代黄河堤防治理成果，又描绘黄河岸边悠然的市井渔耕生活，承载黄河水利文化与三角洲乡土风情。',  '["黄河长堤", "堤畔疏柳", "清秋暮色", "临水高楼", "安澜护堤场墅", "成熟农田", "收网渔船", "江上渔歌", "河上泛舟"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '汤朝槭' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '黄河大堤' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 185, '清河泛舟', '一水通城郭，轻舟出渡头。
波平双桨利，风静片帆收。
薄暮人将别，新凉酒未休。
落霞明远浦，歌啸向中流。', (SELECT id FROM poet WHERE name = '狄培' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '东津渡' LIMIT 1),  '意象: 环城黄河河道、渡口轻舟、平缓水波、收束船帆、薄暮晚风、河畔酒宴、天边落霞、远水滩浦、河面歌啸；出处: 《利津县志补》卷五艺文志', '时任利津少尹狄培公务之余泛舟环城黄河古河道，以白描手法记录县城周边黄河水域的静谧风光与友人泛舟宴饮的雅事，还原清代黄河流经利津县城的城市水系风貌，融合黄河城市水利景观与地方文人游乐文化。',  '["环城黄河河道", "渡口轻舟", "平缓水波", "收束船帆", "薄暮晚风", "河畔酒宴", "天边落霞", "远水滩浦", "河面歌啸"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '狄培' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '东津渡' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 186, '《登岱行》', '兜舆迢迢入翠微，往为白云荡胸飞。白云直上接天界，山巅又出白云外。黄河泡影摇天门，千峰万峰列儿孙。放眼忽看天欲尽，跖足真疑星河扪。', (SELECT id FROM poet WHERE name = '蒲松龄' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '泰山·岱顶观河' LIMIT 1),  '意象: 黄河泡影、天门、千峰万峰、星河；出处: 蒲松龄《聊斋诗集》', '以黄河为飘带反衬泰山之崇高，体现“登高望远”的精神境界。',  '["黄河泡影", "天门", "千峰万峰", "星河"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '蒲松龄' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山·岱顶观河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 187, '《登岱》（其七）', '北悬紫塞云中尽，西泻黄河天上来。日月近从衣畔落，烟霞远向足根开。', (SELECT id FROM poet WHERE name = '李化龙' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '泰山·岱顶观河' LIMIT 1),  '意象: 紫塞、黄河天上来、日月、烟霞；出处: 李化龙《李化龙诗选》', '以黄河“天上来”极写泰山之高。',  '["紫塞", "黄河天上来", "日月", "烟霞"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李化龙' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山·岱顶观河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 188, '《登岱》', '岱顶凌霄十八盘，中原萧瑟思漫漫。振衣日观三秋曙，倚剑天门六月寒。风雨黄河通瀚海，星辰紫极近长安。小臣愿献蓬莱颂，闾阖高悬谒帝难。', (SELECT id FROM poet WHERE name = '王世贞' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '泰山·岱顶观河' LIMIT 1),  '意象: 风雨黄河、瀚海、星辰紫极；出处: 王世贞《弇州山人四部稿》', '以黄河通瀚海意象，将泰山与中原大地连接。',  '["风雨黄河", "瀚海", "星辰紫极"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '王世贞' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山·岱顶观河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 189, '《游泰山六首·其三》', '平崖揽紫雾，飞翠落金梯。黄河从西来，窈窕入远山。', (SELECT id FROM poet WHERE name = '李白' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '泰山·岱顶观河' LIMIT 1),  '意象: 黄河从西来、远山；出处: 李白《李太白全集》', '黄河从西来，勾勒出泰山横亘东西的宏阔视野。',  '["黄河从西来", "远山"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李白' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山·岱顶观河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 190, '《登岱》', '尼父道不行，喟然念泰山。空垂六经文，不睹西周年。七十二君代，乃有封禅坛。……汶水东入海，岱宗青未残。', (SELECT id FROM poet WHERE name = '顾炎武' LIMIT 1), 7, (SELECT id FROM scenic_spot WHERE name = '泰山·岱顶观河' LIMIT 1),  '意象: 汶水、岱宗；出处: 顾炎武《亭林诗集》卷三', '以汶水东流入海写山河依旧，寄寓故国之思。',  '["汶水", "岱宗"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '顾炎武' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '泰山·岱顶观河' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 191, '《小沧浪笔谈》', '“黄河如带卧平楚，岱色苍苍接远天”', (SELECT id FROM poet WHERE name = '阮元' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '大明湖·小沧浪亭' LIMIT 1),  '意象: 黄河如带、岱色苍苍；出处: 阮元《小沧浪笔谈》', '阮元“黄河如带”成为济南望河的经典意象。',  '["黄河如带", "岱色苍苍"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '阮元' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '大明湖·小沧浪亭' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 192, '《趵突泉送严子餐都谏北还》', '传闻此泉来王屋，伏流倒涌历山麓。寒光喷雪复飞云，大声奔雷小碎玉。故人黄门天上来，崔嵬百尺龙门开。凭陵日观照沧海，咄嗟坐啸生风雷。', (SELECT id FROM poet WHERE name = '施闰章' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '济南·趵突泉' LIMIT 1),  '意象: 王屋、伏流、龙门；出处: 施闰章《学馀堂诗集》', '以“王屋伏流”传说暗指黄河源头，将泉与黄河精神相连。',  '["王屋", "伏流", "龙门"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '施闰章' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '济南·趵突泉' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 193, '《趵突泉》', '泺水发源天下无，平地涌出白玉壶。谷虚久恐元气泄，岁旱不愁东海枯。云雾润蒸华不注，波涛声震大明湖。时来泉上濯尘土，冰雪满怀清兴孤。', (SELECT id FROM poet WHERE name = '赵孟頫' LIMIT 1), 6, (SELECT id FROM scenic_spot WHERE name = '济南·趵突泉' LIMIT 1),  '意象: 白玉壶、云雾润蒸、波涛声震；出处: 赵孟頫《松雪斋文集》', '写泉水气势如“波涛声震”，以水势之壮暗喻黄河。',  '["白玉壶", "云雾润蒸", "波涛声震"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '赵孟頫' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '济南·趵突泉' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 194, '《济宁赠潘馨航》', '我来济宁作过客，三日楼头浮大白。……乃今复税济宁车，酒边饮啖黄河鱼。河来西境截汶趋，汶水倒漾沈田庐。', (SELECT id FROM poet WHERE name = '金天羽' LIMIT 1), 8, (SELECT id FROM scenic_spot WHERE name = '济宁·太白酒楼' LIMIT 1),  '意象: 浮大白、黄河鱼、汶水倒漾；出处: 金天羽《天放楼诗集》', '“饮啖黄河鱼”将黄河风物与李白诗酒精神融合。',  '["浮大白", "黄河鱼", "汶水倒漾"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '金天羽' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '济宁·太白酒楼' LIMIT 1);
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id,  annotation, background,  sentiment_tags, created_at, updated_at) SELECT 195, '《寄王屋山人孟大融》', '我昔东海上，崂山餐紫霞。亲见安期生，食枣大如瓜。中年谒汉主，不惬还归家。朱颜谢春晖，白髪见生涯。所期就金液，飞步登云车。愿随夫子天坛上，闲与仙人扫落花。', (SELECT id FROM poet WHERE name = '李白' LIMIT 1), 4, (SELECT id FROM scenic_spot WHERE name = '青岛·崂山' LIMIT 1),  '意象: 东海、崂山、紫霞、安期生、飞步登云车；出处: 李白《李太白全集》', '李白游崂山是其齐鲁文化体验的一部分，诗中以飞升意象寄托仙道情怀。',  '["东海", "崂山", "紫霞", "安期生", "飞步登云车"]', '2026-06-17 18:12:26', '2026-06-17 18:12:26' WHERE EXISTS (SELECT 1 FROM poet WHERE name = '李白' LIMIT 1) AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = '青岛·崂山' LIMIT 1);

ALTER TABLE poem AUTO_INCREMENT = 196;

-- 统计: 实际插入了多少行（跳过找不到 poet/spot 的）
SELECT COUNT(*) AS total_poems FROM poem;

-- 列出没匹配上的（poet_id 或 spot_id 为 NULL）
SELECT id, title, poet_id, spot_id FROM poem WHERE poet_id IS NULL OR spot_id IS NULL;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
