-- V22: 九城五类数据采集 · 滨州/东营/淄博三城诗词补缺(研究+人工核实, 2026-08)
-- 幂等策略: 按唯一键先删后插(诗人按 name, 景点按 name+region, 诗词按 title+poet)。
-- 归属规则与 PoemService.list(region) 一致: spot_id 指向该城景点, 无 spot 按诗人籍贯 LIKE 匹配。
-- 来源: 王士禛《秋柳》《真州绝句》《秦淮杂诗》(渔洋山人精华录); 李之仪《姑溪词》;
--       曹操《步出夏门行·观沧海》(乐府诗集); 李白《将进酒》、王之涣《登鹳雀楼》、
--       刘禹锡《浪淘沙》(通行唐诗选本, 均为公版经典)。
-- 展示性挂靠已标注: 将进酒/登鹳雀楼/浪淘沙以"黄河入海"立意挂黄河大堤(东营); 观沧海挂无棣碣石山(地点存争议, 待考)。

-- 新诗人(无棣籍宋词人/咏黄河诗人)
DELETE FROM poet WHERE name='李之仪';
INSERT INTO poet (name, dynasty_id, birth_year, death_year, birthplace, biography, style) VALUES
('李之仪', 5, 1038, 1117, '山东无棣（今滨州无棣县）', '北宋词人，字端叔，号姑溪居士，沧州无棣（今山东无棣）人。苏轼门人之一，以尺牍、词著称，有《姑溪词》。代表作《卜算子·我住长江头》以江水寄相思，传诵千古。', '婉约（清婉峭茜）');
DELETE FROM poet WHERE name='王之涣';
INSERT INTO poet (name, dynasty_id, birth_year, death_year, birthplace, biography, style) VALUES
('王之涣', 4, 688, 742, '并州晋阳（今山西太原）', '盛唐诗人，字季凌。与高适、王昌龄齐名，诗以描写边塞风光著称，气势雄浑。《登鹳雀楼》"黄河入海流"与《凉州词》"黄河远上白云间"皆咏黄河名篇。', '边塞（雄浑阔大）');
DELETE FROM poet WHERE name='刘禹锡';
INSERT INTO poet (name, dynasty_id, birth_year, death_year, birthplace, biography, style) VALUES
('刘禹锡', 4, 772, 842, '洛阳（今河南洛阳）', '中唐文学家、哲学家，字梦得，世称"诗豪"。诗风豪健明快，善咏史与民歌体，《浪淘沙》组诗咏黄河万里奔流，气势磅礴。', '豪健（诗豪）');

-- 新景点: 无棣碣石山(滨州)
DELETE FROM scenic_spot WHERE name='无棣碣石山（马谷山）' AND region='滨州';
INSERT INTO scenic_spot (name, description, region, category) VALUES
('无棣碣石山（马谷山）', '鲁北平原孤丘，古称碣石。曹操《观沧海》所咏"东临碣石"之地一说（与河北昌黎碣石山并存，地点学界存争议）。', '滨州', '山岳');

-- 淄博(王士禛, 籍贯桓台新城): 3 首, 无 spot → 按籍贯归属淄博
DELETE FROM poem WHERE title='秋柳（其一）' AND poet_id=(SELECT id FROM poet WHERE name='王士禛');
INSERT INTO poem (title, content, poet_id, dynasty_id, spot_id, annotation, background, poem_type) VALUES
('秋柳（其一）', '秋来何处最销魂，残照西风白下门。\n他日差池春燕影，只今憔悴晚烟痕。\n愁生陌上黄骢曲，梦远江南乌夜村。\n莫听临风三弄笛，玉关哀怨总难论。', (SELECT id FROM poet WHERE name='王士禛'), 8, NULL, '白下门：指南京西门。黄骢曲：唐太宗定中原所制乐曲。乌夜村：晋何准隐居处，此借指江南旧地。', '顺治十四年秋，王士禛与诸名士会于济南大明湖，赋《秋柳》四章，借柳咏史伤时，一时和者甚众，传诵南北，渔洋之名由是鹊起。', '七律');
DELETE FROM poem WHERE title='真州绝句五首·其四' AND poet_id=(SELECT id FROM poet WHERE name='王士禛');
INSERT INTO poem (title, content, poet_id, dynasty_id, spot_id, annotation, background, poem_type) VALUES
('真州绝句五首·其四', '江干多是钓人居，柳陌菱塘一带疏。\n好是日斜风定后，半江红树卖鲈鱼。', (SELECT id FROM poet WHERE name='王士禛'), 8, NULL, '真州：今江苏仪征。江干：江边。', '康熙元年王士禛任扬州推官，往来江上，作《真州绝句》五首，此首以清淡之笔写江乡风物，为"神韵说"代表。', '七绝');
DELETE FROM poem WHERE title='秦淮杂诗十四首·其一' AND poet_id=(SELECT id FROM poet WHERE name='王士禛');
INSERT INTO poem (title, content, poet_id, dynasty_id, spot_id, annotation, background, poem_type) VALUES
('秦淮杂诗十四首·其一', '年来肠断秣陵舟，梦绕秦淮水上楼。\n十日雨丝风片里，浓春烟景似残秋。', (SELECT id FROM poet WHERE name='王士禛'), 8, NULL, '秣陵：南京古称。秦淮：秦淮河。', '王士禛客居金陵期间作《秦淮杂诗》十四首，追怀六朝旧事，此首写雨丝风片中的秦淮春色，笔调哀婉朦胧。', '七绝');

-- 滨州(李之仪无棣籍 + 曹操观沧海挂无棣碣石山): 3 首
DELETE FROM poem WHERE title='卜算子·我住长江头' AND poet_id=(SELECT id FROM poet WHERE name='李之仪');
INSERT INTO poem (title, content, poet_id, dynasty_id, spot_id, annotation, background, poem_type) VALUES
('卜算子·我住长江头', '我住长江头，君住长江尾。\n日日思君不见君，共饮长江水。\n此水几时休，此恨何时已。\n只愿君心似我心，定不负相思意。', (SELECT id FROM poet WHERE name='李之仪'), 5, NULL, '长江头、长江尾：以江水上下游喻相隔之远。', '李之仪晚年谪居当涂（今安徽），此词以江水起兴写相思，语言明净而情深，是宋词名篇。李之仪为滨州无棣人，故归属滨州。', '词');
DELETE FROM poem WHERE title='忆秦娥·用太白韵' AND poet_id=(SELECT id FROM poet WHERE name='李之仪');
INSERT INTO poem (title, content, poet_id, dynasty_id, spot_id, annotation, background, poem_type) VALUES
('忆秦娥·用太白韵', '清溪咽。霜风洗出山头月。\n山头月。迎得云归，还送云别。\n不知今是何时节。凌歊望断音尘绝。\n音尘绝。帆来帆去，天际双阙。', (SELECT id FROM poet WHERE name='李之仪'), 5, NULL, '凌歊：凌歊台，在今安徽当涂。双阙：天门。', '用李白《忆秦娥》原韵而作，写溪月云帆，寄托羁旅怀人之思，收入《姑溪词》。', '词');
DELETE FROM poem WHERE title='观沧海' AND poet_id=(SELECT id FROM poet WHERE name='曹操');
INSERT INTO poem (title, content, poet_id, dynasty_id, spot_id, annotation, background, poem_type) VALUES
('观沧海', '东临碣石，以观沧海。\n水何澹澹，山岛竦峙。\n树木丛生，百草丰茂。\n秋风萧瑟，洪波涌起。\n日月之行，若出其中。\n星汉灿烂，若出其里。\n幸甚至哉，歌以咏志。', (SELECT id FROM poet WHERE name='曹操'), 2, (SELECT id FROM scenic_spot WHERE name='无棣碣石山（马谷山）' AND region='滨州'), '碣石：山名，其地一说即无棣马谷山（待考）。澹澹：水波摇荡貌。竦峙：高耸挺立。', '建安十二年（207）曹操北征乌桓凯旋，途经碣石观海赋此，为《步出夏门行》首章，气象壮阔，开山水诗先声。', '乐府');

-- 东营(黄河口立意, 挂黄河大堤): 3 首(展示性挂靠已标注)
DELETE FROM poem WHERE title='将进酒' AND poet_id=(SELECT id FROM poet WHERE name='李白');
INSERT INTO poem (title, content, poet_id, dynasty_id, spot_id, annotation, background, poem_type) VALUES
('将进酒', '君不见黄河之水天上来，奔流到海不复回。\n君不见高堂明镜悲白发，朝如青丝暮成雪。\n人生得意须尽欢，莫使金樽空对月。\n天生我材必有用，千金散尽还复来。\n烹羊宰牛且为乐，会须一饮三百杯。\n岑夫子，丹丘生，将进酒，杯莫停。\n与君歌一曲，请君为我倾耳听。\n钟鼓馔玉不足贵，但愿长醉不复醒。\n古来圣贤皆寂寞，惟有饮者留其名。\n陈王昔时宴平乐，斗酒十千恣欢谑。\n主人何为言少钱，径须沽取对君酌。\n五花马、千金裘，呼儿将出换美酒，与尔同销万古愁。', (SELECT id FROM poet WHERE name='李白'), 4, (SELECT id FROM scenic_spot WHERE name='黄河大堤' AND region='东营'), '岑夫子：岑勋。丹丘生：元丹丘。陈王：曹植，封陈王。平乐：平乐观。', '天宝年间李白与友人岑勋、元丹丘会饮时所作，以"黄河之水天上来，奔流到海不复回"起兴，豪放恣肆。以黄河入海立意挂靠东营黄河大堤（展示性关联）。', '乐府');
DELETE FROM poem WHERE title='登鹳雀楼' AND poet_id=(SELECT id FROM poet WHERE name='王之涣');
INSERT INTO poem (title, content, poet_id, dynasty_id, spot_id, annotation, background, poem_type) VALUES
('登鹳雀楼', '白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。', (SELECT id FROM poet WHERE name='王之涣'), 4, (SELECT id FROM scenic_spot WHERE name='黄河大堤' AND region='东营'), '鹳雀楼：旧址在今山西永济，前临黄河。', '盛唐五绝名篇，以"黄河入海流"写黄河奔涌入海之势，与黄河口立意相合，挂靠东营黄河大堤（展示性关联）。', '五绝');
DELETE FROM poem WHERE title='浪淘沙九首·其一' AND poet_id=(SELECT id FROM poet WHERE name='刘禹锡');
INSERT INTO poem (title, content, poet_id, dynasty_id, spot_id, annotation, background, poem_type) VALUES
('浪淘沙九首·其一', '九曲黄河万里沙，浪淘风簸自天涯。\n如今直上银河去，同到牵牛织女家。', (SELECT id FROM poet WHERE name='刘禹锡'), 4, (SELECT id FROM scenic_spot WHERE name='黄河大堤' AND region='东营'), '浪淘风簸：大浪淘沙、狂风颠簸。', '刘禹锡《浪淘沙》组诗首章，咏黄河九曲万里奔流入海，联想直上银河，气势飞扬。挂靠东营黄河大堤（展示性关联）。', '七绝');

-- 校验: 三城诗词归属
-- SELECT s.region, COUNT(DISTINCT p.id) FROM poem p LEFT JOIN scenic_spot s ON p.spot_id=s.id WHERE s.region IN ('滨州','东营','淄博') GROUP BY s.region;
-- SELECT p.id FROM poem p JOIN poet pt ON p.poet_id=pt.id WHERE p.spot_id IS NULL AND pt.birthplace LIKE '%淄博%';