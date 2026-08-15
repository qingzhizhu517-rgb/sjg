-- V21: 九城五类数据采集 · food_opera 种子数据（生成自 scripts/gen_cultural_migration.mjs）
-- 幂等策略: 按 (category,title) 先删后插; detail 表 FK ON DELETE CASCADE 随主行级联删除
-- 数据来源: 见各条目下方注释, 采集于 2026-08; 存疑内容已标（待考）

-- [1] 甏肉干饭（济宁）来源: 济宁新闻网《老品牌焕发新活力——从甏肉干饭看运河文化传承》、人民周刊《“甏肉干饭”吃过吗？运河美食历久弥新》
DELETE FROM cultural_item WHERE title='甏肉干饭' AND category='food_opera';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('food_opera', '甏肉干饭', '济宁传统名吃，以陶甏慢火焖肉配米饭，肉烂汤浓、肥而不腻，是运河码头的老味道。', '甏肉干饭是济宁最具代表性的传统名吃，因以“甏”（陶制大罐）焖制五花肉而得名。将带皮五花肉改刀入甏，加酱油与八角、桂皮等香料小火慢焖，肉烂汤浓、肥而不腻，配现蒸米饭，佐以卤蛋、面筋、豆腐卷、海带结等配菜，一甏之内滋味丰富。其形成与京杭大运河济宁段漕运码头的饮食传统密切相关（待考），运河船工与码头食肆以甏代锅、连甏带饭的吃法沿袭至今。甏肉干饭已列入济宁市非遗展播项目，多家老字号品牌化经营，成为“老济宁”记忆里的运河美食名片。', '济宁', '["济宁","运河美食","地方小吃","传统名吃"]', 0, 'published', 'manual');
INSERT INTO food_opera_detail (item_id, sub_category, cuisine_type, ingredients, preparation_method, representative_dishes, historical_origin, current_status, preservation_level) VALUES ((SELECT id FROM cultural_item WHERE title='甏肉干饭' AND category='food_opera'), 'food', '鲁菜（济宁地方风味）', '带皮五花肉、酱油、八角、桂皮等香料、米饭、卤蛋、面筋、豆腐卷、海带结', '五花肉改刀入甏，加酱油香料小火慢焖，配菜卤制，米饭现蒸', '甏肉干饭（甏肉、卤蛋、面筋、豆腐卷等）', '与京杭大运河济宁段漕运码头饮食传统密切相关，具体起始年代无确考（待考）', '列入济宁市非遗展播项目，多家老字号品牌化经营，为济宁运河美食名片', '市级非遗(待考)');

-- [2] 四平调（金乡四平调）（济宁）来源: 国务院第二批国家级非遗名录（Ⅳ-50，金乡县、成武县）、中国网《冲不散的民间老调——国家级非物质文化遗产金乡四平调》
DELETE FROM cultural_item WHERE title='四平调（金乡四平调）' AND category='food_opera';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('food_opera', '四平调（金乡四平调）', '发源于济宁金乡的国家级非遗戏曲，由民间花鼓演变而来，唱腔质朴、乡土气息浓。', '四平调是流行于鲁西南、豫东、苏北、皖北交界地带的地方戏曲剧种，济宁金乡为其重要发源地与流传中心之一。四平调由民间“花鼓”（花鼓丁香）说唱演变而来，唱腔以平腔为主，四句一循环、平稳舒展，故名“四平调”，板式有慢板、二八板等，表演载歌载舞、生活气息浓厚。金乡县四平调剧团长期活跃于乡村舞台，传承有序。2008年，四平调入选第二批国家级非物质文化遗产名录（编号Ⅳ-50，申报地区含金乡县、成武县）。金乡持续开展非遗进校园与展演活动，传统剧目《刘芳福借银》等仍在传演。', '济宁', '["济宁","金乡","地方戏曲","国家级非遗"]', 0, 'published', 'manual');
INSERT INTO food_opera_detail (item_id, sub_category, cuisine_type, ingredients, preparation_method, representative_dishes, historical_origin, current_status, preservation_level) VALUES ((SELECT id FROM cultural_item WHERE title='四平调（金乡四平调）' AND category='food_opera'), 'opera', '四平调（地方戏曲）', '演员（生旦净丑行当）、乐队（板胡、二胡、笛子、打击乐等）、服装道具', '唱、念、做、打并举，以唱为主，四句一循环的平腔板式', '《刘芳福借银》等传统剧目', '由民间花鼓说唱演变而来，金乡为重要发源地之一，具体成形年代待考', '金乡县四平调剧团演出活跃，非遗进校园，传承有序', '国家级非遗');

-- [3] 泰山豆腐宴（泰安）来源: 泰安市文旅局《泰山豆腐宴——泰安市非物质文化遗产》、新华社《泰山豆腐宴：皇家御膳端上百姓餐桌》
DELETE FROM cultural_item WHERE title='泰山豆腐宴' AND category='food_opera';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('food_opera', '泰山豆腐宴', '泰安市级非遗，以泰山豆腐为主料、泰山泉水点化的传统宴席，菜品多达百余道。', '泰山豆腐宴是以泰山豆腐为主料形成的传统宴席，与泰山“三美”（白菜、豆腐、水）一脉相承，讲究用泰山泉水点浆、配泰山白菜与时蔬。相传与历代帝王泰山封禅祭祀的素食传统有关（待考），民间有“豆腐满汉全席”之称，菜品多达百余道，煎、炒、炖、炸、蒸俱全，代表作如“泰山三美”锅仔、八宝豆腐等。2012年前后，泰山豆腐宴入选泰安市非物质文化遗产名录。如今豆腐宴从“皇家御膳”走向百姓餐桌，泰安多家餐饮老店将其列为招牌，成为泰山旅游的饮食名片。', '泰安', '["泰安","泰山","传统宴席","市级非遗"]', 0, 'published', 'manual');
INSERT INTO food_opera_detail (item_id, sub_category, cuisine_type, ingredients, preparation_method, representative_dishes, historical_origin, current_status, preservation_level) VALUES ((SELECT id FROM cultural_item WHERE title='泰山豆腐宴' AND category='food_opera'), 'food', '鲁菜（泰安素食风味）', '泰山豆腐、泰山泉水、白菜、时蔬、豆制品、调味料', '泉水点浆制豆腐，煎炒炖炸蒸等多种技法成宴', '泰山三美、八宝豆腐、豆腐宴全席（百余道菜品）', '相传源于泰山封禅祭祀的素食传统（待考），泰山豆腐历史久远，素食文化一脉相承', '泰安市非遗，餐饮老店推广，成为泰山旅游饮食名片', '市级非遗');

-- [4] 山东梆子（泰安）（泰安）来源: 泰安市文旅局《鲁韵梆腔——记泰安市山东梆子剧团》、大众日报《山东梆子：300年老树发新芽》
DELETE FROM cultural_item WHERE title='山东梆子（泰安）' AND category='food_opera';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('food_opera', '山东梆子（泰安）', '国家级非遗剧种，泰安设专业剧院，唱腔高亢激越，是山东梆子腔系重要代表。', '山东梆子又称“高调梆子”，是流行于鲁西南、鲁中及豫冀苏皖部分地区的古老梆子腔剧种，泰安是其重要流行区之一。山东梆子相传由山陕梆子东传后与山东语音、民间音乐融合而成（待考），唱腔高亢激越、慷慨激昂，板式丰富，表演质朴火爆。泰安市山东梆子剧院（原泰安市山东梆子剧团）坚守传承数十年，复排《两狼山上》等传统剧目并冲击文华奖，在宁阳等地开展“老戏新唱”。2008年，山东梆子入选第二批国家级非物质文化遗产名录，成为山东梆子腔系的重要代表。', '泰安', '["泰安","山东梆子","地方戏曲","国家级非遗"]', 0, 'published', 'manual');
INSERT INTO food_opera_detail (item_id, sub_category, cuisine_type, ingredients, preparation_method, representative_dishes, historical_origin, current_status, preservation_level) VALUES ((SELECT id FROM cultural_item WHERE title='山东梆子（泰安）' AND category='food_opera'), 'opera', '山东梆子（梆子腔系）', '演员（生旦净丑行当）、乐队（板胡、笛子、笙、打击乐等）、服装道具', '唱、念、做、打并举，高亢激越的梆子腔板式', '《两狼山上》《两狼山》等传统剧目', '相传由山陕梆子东传与山东方言融合形成（待考），泰安传唱已久，剧院始建于20世纪50年代（待考）', '泰安市山东梆子剧院活跃，复排经典剧目，非遗展演不断', '国家级非遗');

-- [5] 临清什香面（聊城）来源: 临清市政府网《“临清什香面”登陆央视》、文物中国《临清什香面制作技艺入选省级非物质文化遗产项目》
DELETE FROM cultural_item WHERE title='临清什香面' AND category='food_opera';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('food_opera', '临清什香面', '临清运河名吃，手擀面配十余种菜码，一面百味，制作技艺入选省级非遗。', '临清什香面是聊城临清的传统名吃，因配料繁多的“什锦”菜码得名。手擀面条细韧筋道，配以黄瓜丝、豆芽、香椿芽、咸香椿、蒜薹、腌萝卜、芝麻盐、麻汁及多种酱料等十余种菜码，吃时现拌，一碗面中尝尽百味。临清地处京杭大运河要冲，漕运商贸繁荣，什香面融合南北饮食之长，是运河饮食文化的活标本。临清什香面制作技艺已入选山东省级非物质文化遗产项目，央视等媒体多次报道，成为“运河美食”的代表之一。', '聊城', '["聊城","临清","运河美食","省级非遗"]', 0, 'published', 'manual');
INSERT INTO food_opera_detail (item_id, sub_category, cuisine_type, ingredients, preparation_method, representative_dishes, historical_origin, current_status, preservation_level) VALUES ((SELECT id FROM cultural_item WHERE title='临清什香面' AND category='food_opera'), 'food', '鲁菜（临清面食）', '面粉、黄瓜丝、豆芽、香椿芽、蒜薹、腌萝卜、芝麻盐、麻汁、多种酱料', '和面擀面、煮面过水，十余种菜码分别备制，现拌现食', '临清什香面（什锦菜码面）', '与运河漕运商贸繁荣及南北饮食融合密切相关，具体起源年代待考', '入选省级非遗，央视报道，为临清“运河美食”名片', '省级非遗');

-- [6] 聊城八角鼓（聊城）来源: 聊城市志·曲艺、大众日报《八角鼓：百年老曲再现往昔神韵》
DELETE FROM cultural_item WHERE title='聊城八角鼓' AND category='food_opera';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('food_opera', '聊城八角鼓', '聊城曲艺类省级非遗，满族八角鼓与运河方言融合的说唱艺术，百年传承。', '聊城八角鼓是流传于聊城（东昌府、临清一带）的说唱曲艺，源于清代满族八角鼓曲艺，随旗人驻防与运河商路传入鲁西，与当地方言、民间音乐融合而成（待考）。表演以八角鼓（八边形单面鼓）击节，间以三弦等伴奏，说唱结合、语言风趣，书目多取材于民间传说与市井故事。20世纪中叶曾盛极一时，后一度濒临失传，被媒体称为“大运河畔失落的遗韵”。近年已列入山东省非物质文化遗产名录，东昌府区组织八角鼓艺术团展演、开展非遗进校园，老曲种正焕发新声。', '聊城', '["聊城","东昌府","曲艺","省级非遗"]', 0, 'published', 'manual');
INSERT INTO food_opera_detail (item_id, sub_category, cuisine_type, ingredients, preparation_method, representative_dishes, historical_origin, current_status, preservation_level) VALUES ((SELECT id FROM cultural_item WHERE title='聊城八角鼓' AND category='food_opera'), 'opera', '聊城八角鼓（说唱曲艺）', '演员（说唱艺人）、八角鼓、三弦等伴奏乐器、醒木等道具', '击八角鼓说唱，说唱结合，韵白相间', '传统书目多取材于民间传说、市井故事（具体曲目待考）', '源于满族八角鼓，清代经运河商路传入聊城（待考）', '列入省级非遗名录，东昌府区艺术团展演、非遗进校园', '省级非遗');

-- [7] 滨州锅子饼（滨州）来源: 滨城区文化馆《滨州锅子饼制作技艺》、大众网《百年非遗看滨州｜滨州锅子饼》
DELETE FROM cultural_item WHERE title='滨州锅子饼' AND category='food_opera';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('food_opera', '滨州锅子饼', '滨州传统名吃，薄饼裹炒馅再烙制，香而不腻、酥而不硬，市级非遗。', '滨州锅子饼是滨州最具代表性的传统名吃之一。将面团擀成薄饼在鏊子上烙至半熟，卷入以鸡蛋、豆腐、粉条、韭菜、豆芽等炒制的馅料，再入饼铛（锅子）复烙至金黄，切段食用，外皮酥脆、馅料鲜香，“香而不腻、酥而不硬”。锅子饼馅料可随季节变换，素有“可裹卷万物”之说，无棣佘家等地传承尤盛。滨州锅子饼制作技艺已列入市级非物质文化遗产名录，多家老字号坚守古法，成为滨州待客的招牌名吃。', '滨州', '["滨州","无棣","地方小吃","市级非遗"]', 0, 'published', 'manual');
INSERT INTO food_opera_detail (item_id, sub_category, cuisine_type, ingredients, preparation_method, representative_dishes, historical_origin, current_status, preservation_level) VALUES ((SELECT id FROM cultural_item WHERE title='滨州锅子饼' AND category='food_opera'), 'food', '鲁菜（滨州地方风味）', '面粉、鸡蛋、豆腐、粉条、韭菜、豆芽等时令菜蔬', '和面擀饼、鏊子烙制、炒馅、卷馅、锅子复烙、切段', '滨州锅子饼（素馅/荤素馅）', '滨州地区传统名吃，具体起源年代待考，无棣佘家等传承谱系清晰', '列入市级非遗名录，老字号经营，为滨州名吃名片', '市级非遗');

-- [8] 沾化渔鼓戏（滨州）来源: 中国非物质文化遗产网（道情戏·沾化渔鼓戏）、光明日报《渔鼓声声脆 古韵盛世新》
DELETE FROM cultural_item WHERE title='沾化渔鼓戏' AND category='food_opera';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('food_opera', '沾化渔鼓戏', '滨州沾化国家级非遗，渔鼓击节伴唱的说唱戏曲，独创剧种，相传传承三百年。', '沾化渔鼓戏是流行于滨州沾化的地方戏曲剧种，因以渔鼓（竹筒蒙皮）击节伴唱得名，属道情腔系，是滨州独有的地方剧种。相传起源于清雍正年间（约1723年），由渔鼓道情说唱发展而来，唱腔质朴明快，表演载歌载舞，唱词有“三句一番”的结构特点。沾化渔鼓戏以“道情戏（沾化渔鼓戏）”之名列入国家级非物质文化遗产名录；沾化区渔鼓戏剧团坚持创演，推出《老邪上任》《戏说西游·高老庄》等新剧目，走出一条“剧种与剧团互救共赢”的传承之路。', '滨州', '["滨州","沾化","地方戏曲","国家级非遗"]', 0, 'published', 'manual');
INSERT INTO food_opera_detail (item_id, sub_category, cuisine_type, ingredients, preparation_method, representative_dishes, historical_origin, current_status, preservation_level) VALUES ((SELECT id FROM cultural_item WHERE title='沾化渔鼓戏' AND category='food_opera'), 'opera', '渔鼓戏（道情腔系）', '演员（生旦净丑行当）、渔鼓、简板、坠琴等乐器、服装道具', '击渔鼓伴唱，唱念做舞并重，“三句一番”唱腔结构', '《老邪上任》《戏说西游·高老庄》等', '相传起源于清雍正年间（约1723年），由渔鼓道情说唱发展而来', '国家级非遗，沾化渔鼓戏剧团活跃，新剧目屡获好评', '国家级非遗');

-- 校验: SELECT category, region, COUNT(*) FROM cultural_item WHERE category='food_opera' GROUP BY region ORDER BY region;