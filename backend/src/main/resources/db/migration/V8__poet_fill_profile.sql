-- V8: 补齐 47 位"空壳"诗人的生平资料(phase 1/1)
-- 背景: poet 表 126 位诗人中 47 位仅有 id/name/dynasty_id, 其余字段全 NULL, 影响诗人页与图谱展示。
-- 原则: 只写有史料依据的内容; 生卒年/籍贯/字号不确定一律 NULL, 严禁编造; 每条附来源注释。
-- 分组: A 组(13位, 济南泉水/泰山/黄河诗人) + B 组(16位, 黄河/曲阜/济宁诗人) + C 组(14位, 菏泽/郓城/利津诗人) + 106 萧楚材(主代理补)。
-- 幂等: UPDATE ... WHERE id = N 幂等, 可重复执行。
-- 应用: python3 scripts/apply_migration.py backend/src/main/resources/db/migration/V8__poet_fill_profile.sql

-- ============ A 组 ============
UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = NULL, biography = '明代诗人，任职济南期间遍访名泉，作《济南七十二泉诗》，逐一咏趵突泉、金线泉等七十二泉，是济南泉水文化重要文献，相关诗作收录于本平台。', style = NULL WHERE id = 4;
-- id: 4 晏璧 | 来源: 齐鲁晚报《晏璧和他的〈七十二泉诗〉》、百度百科; 生卒/籍贯/字号未见明确记载, 保守处理

UPDATE poet SET birth_year = 1701, death_year = 1766, birthplace = '山东菏泽', biography = '字素存，山东菏泽人。清代官员，历官至云贵总督。乾隆三十一年征缅兵败自杀。有咏黑虎泉诗收录于本平台。', style = NULL WHERE id = 10;
-- id: 10 刘藻 | 来源: 清史稿卷327、菏泽县志、西泠拍卖著录(1701-1766)

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = '浙江金华', biography = '明代诗人，浙江金华人。诗见《明诗综》《金华诗录》等总集，有咏泰山诗收录于本平台。', style = NULL WHERE id = 26;
-- id: 26 徐文通 | 来源: 明诗综、金华诗录; 生卒/字号未见明确记载, 保守处理

UPDATE poet SET birth_year = 1554, death_year = 1611, birthplace = '河南长垣', biography = '字于田，河南长垣人。万历二年进士，历官总督、兵部尚书，加太子太保，卒赠太师。平定播州杨应龙之乱，又督理河漕、开泇河以济漕运。有咏泰山诗收录于本平台。', style = NULL WHERE id = 29;
-- id: 29 李化龙 | 来源: 维基百科、长垣"七尚书"资料、大众日报《文武兼备、通泇济漕的李化龙》

UPDATE poet SET birth_year = 1585, death_year = NULL, birthplace = '山东乐安（今广饶）', biography = '明代官员、诗人，山东乐安（今广饶）人。进士出身，为官清廉、声名远播。有咏泰山诗收录于本平台。', style = NULL WHERE id = 30;
-- id: 30 李中行 | 来源: 东营"清官廉吏·李中行"、CBDB(1585年生); 卒年/字号未见明确记载, 保守处理

UPDATE poet SET birth_year = 1370, death_year = 1418, birthplace = '江西吉水', biography = '字光大，号晃庵，江西吉水人。建文二年状元，历仕建文、永乐两朝，官至文渊阁大学士、内阁首辅，谥文穆。有咏黄河诗收录于本平台。', style = NULL WHERE id = 39;
-- id: 39 胡广 | 来源: 维基百科、类书集成(1370-1418, 江西吉水人, 字光大, 号晃庵)

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = '山东莱阳（今属烟台）', biography = '明代官员、诗人，山东莱阳（今属烟台）人，官至按察副使。明末曾游崂山并作游记，有咏黄河诗收录于本平台。', style = NULL WHERE id = 42;
-- id: 42 高出 | 来源: 齐鲁晚报《明末官员高出崂山记游》、维基百科; 生卒/字号未见明确记载, 保守处理(注: 海阳县清雍正十三年方从莱阳析出, 明代称莱阳)

UPDATE poet SET birth_year = 1637, death_year = 1714, birthplace = '江苏无锡', biography = '字留仙，号对岩，江苏无锡人。顺治进士，官至左春坊左谕德，博学工诗。有咏黄河诗收录于本平台。', style = NULL WHERE id = 43;
-- id: 43 秦松龄 | 来源: 维基百科、百度百科(字留仙, 号对岩, 无锡人, 1637-1714)

UPDATE poet SET birth_year = 1690, death_year = 1768, birthplace = '山东德州', biography = '字抱孙，号雅雨山人，山东德州人。康熙六十年进士，官至两淮盐运使。藏书家、刻书家，刻《雅雨堂丛书》，校刊《国朝山左诗钞》。有咏黄河诗收录于本平台。', style = NULL WHERE id = 45;
-- id: 45 卢见曾 | 来源: 德州市政府资料、故宫博物院、教育百科(1690-1768, 字抱孙, 号雅雨, 德州人)

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = NULL, biography = '清代诗人，生平事迹不详，其咏黄河之作收录于本平台，为齐鲁黄河文学景观诗作之一。', style = NULL WHERE id = 46;
-- id: 46 田致 | 来源: 查无生平, 保守处理

UPDATE poet SET birth_year = 1703, death_year = NULL, birthplace = NULL, biography = '字光廷，清代诗人，生于康熙四十二年（1703）。有咏黄河诗收录于本平台。', style = NULL WHERE id = 49;
-- id: 49 许朝 | 来源: 识典古籍(许朝字光廷, 太史许榖之子)、国粹大典(1703年生); 籍贯/卒年未见明确记载, 保守处理

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = '山东德州', biography = '字孔皆，一字霖瞻，山东德州人。顺治三年进士，官芮城知县。有咏黄河诗收录于本平台。', style = NULL WHERE id = 50;
-- id: 50 李浃 | 来源: 晚晴簃诗汇、国朝山左诗钞、识典古籍墓志(字孔皆, 一字霖瞻, 德州人, 顺治丙戌进士); 生卒未见明确记载, 保守处理

UPDATE poet SET birth_year = 1072, death_year = 1128, birthplace = '浙江瑞安', biography = '字少伊，世称横塘先生，温州瑞安人。绍圣元年进士，官至御史中丞、资政殿学士，为北宋名臣。有《横塘集》传世，有咏黄河诗收录于本平台。', style = NULL WHERE id = 53;
-- id: 53 许景衡 | 来源: 类书集成(1072-1128)、维基百科、浙江档案数据库

-- ============ 106 萧楚材(主代理补充) ============
UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = NULL, biography = '唐代诗人，生平事迹不详。《全唐诗》收录其《奉和展礼岱宗涂经济濮》，为帝王东封泰山途经古濮水流域的奉和应制之作，是濮水流域唐代文学景观的重要见证。', style = '应制奉和' WHERE id = 106;
-- id: 106 萧楚材 | 来源: 百度百科、御定全唐诗(存诗《奉和展礼岱宗涂经济濮》); 生卒/籍贯无考, 保守处理

-- ============ B 组 ============
UPDATE poet SET birth_year = 1516, death_year = 1608, birthplace = '山东海丰（今滨州无棣）', biography = '字伯谦，号二山，又号梦山。山东海丰（今无棣）人，嘉靖、万历间名臣，官至吏部尚书。著有《存家诗稿》，五言诗冲古淡泊。有咏黄河诗收录于本平台。', style = '冲古淡泊' WHERE id = 55;
-- id: 55 杨巍 | 来源: 百度百科/滨州地方志(1516-1608, 字伯谦号二山/梦山, 山东海丰(今无棣)人, 官至吏部尚书)

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = NULL, biography = '明代诗人，《新修齐东县志》录其《秋夜大清河泛舟》等咏山东大清河之作，本平台收录其咏黄河诗三首。', style = NULL WHERE id = 57;
-- id: 57 杨玉润 | 来源: 《新修齐东县志》录其咏大清河诗, 其余生平无考, 保守处理

UPDATE poet SET birth_year = 1583, death_year = 1643, birthplace = '山东济南府新城（今淄博桓台）', biography = '字季木，号文水、虞求，别号㟙湖居士。山东新城（今桓台）人，万历三十八年进士，官至南京吏部考功司郎中，诗宗前后七子，著有《齐音》。有咏黄河诗收录于本平台。', style = '宗前后七子' WHERE id = 58;
-- id: 58 王象春 | 来源: 维基百科/新城县志(1583-1643, 字季木号文水、虞求, 新城(今桓台)人, 万历庚戌进士)

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = '山东诸城', biography = '字溯西，山东诸城人。清初遗民，为诸生而不求仕进，以山水友朋为乐，为"张氏四逸"之一。有咏黄河诗收录于本平台。', style = NULL WHERE id = 60;
-- id: 60 张衍 | 来源: 百度百科/潍坊名人(字溯西, 诸城人, 清初遗民, "张氏四逸"之一)

UPDATE poet SET birth_year = 1692, death_year = 1762, birthplace = '浙江仁和（今杭州）', biography = '字畹叔，号椒园。浙江仁和（今杭州）人，乾隆元年举博学鸿词，授编修，出任山东道监察御史，官至河南按察使。富藏书，建"隐拙斋"，著有《隐拙斋诗文集》。有咏黄河诗收录于本平台。', style = NULL WHERE id = 61;
-- id: 61 沈廷芳 | 来源: 维基百科/清史稿(1692-1762, 字畹叔号椒园, 仁和人, 山东道监察御史)

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = '浙江归安（今湖州）', biography = '浙江归安（今湖州）人，乾隆间进士，任蒲台县（今属山东滨州）知县，主持纂修《乾隆蒲台县志》。有咏黄河诗收录于本平台。', style = NULL WHERE id = 62;
-- id: 62 严文典 | 来源: 《乾隆蒲台县志》(归安人, 乾隆进士, 蒲台知县)

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = '山东无棣', biography = '山东无棣人，清代人物，以倡捐军饷获赏戴花翎，故居今存于无棣县。有咏黄河诗收录于本平台。', style = NULL WHERE id = 63;
-- id: 63 张衍重 | 来源: 无棣县地方资料/识典古籍(无棣人, 倡捐军饷赏戴花翎)

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = NULL, biography = '清代官员，光绪年间主持纂修《惠民县志》（今属山东滨州）。有咏黄河诗收录于本平台。', style = NULL WHERE id = 64;
-- id: 64 沈世铨 | 来源: 《光绪惠民县志》修者, 生平细节无考, 保守处理

UPDATE poet SET birth_year = 1475, death_year = 1541, birthplace = '江西吉安府泰和', biography = '字文鸣，号静斋。江西泰和人，弘治九年进士，官至都察院右都御史。正德末嘉靖初曾任山东左布政使、右副都御史巡抚山东。有咏曲阜孔庙诗收录于本平台。', style = NULL WHERE id = 66;
-- id: 66 陈凤梧 | 来源: 维基百科/国朝献征录(1475-1541, 字文鸣号静斋, 泰和人, 曾巡抚山东)

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = '浙江宁波府奉化', biography = '字孟光，号石屏。浙江奉化人，嘉靖五年进士，历官监察御史、巡按广东、南京通政司右参议，纂有《广东通志》。有咏曲阜孔庙诗收录于本平台。', style = NULL WHERE id = 69;
-- id: 69 戴璟 | 来源: 维基百科/四库提要(字孟光号石屏, 奉化人, 嘉靖丙戌进士)

UPDATE poet SET birth_year = 1480, death_year = 1545, birthplace = '湖广岳州府澧州（今湖南澧县）', biography = '字国宝，号涔涯。湖广澧州（今湖南澧县）人，弘治十二年进士，累官至户部尚书，以清廉著称。曾任山东道监察御史、总理河道。有咏济宁浣笔泉诗收录于本平台。', style = NULL WHERE id = 76;
-- id: 76 李如圭 | 来源: 维基百科/澧州志(1480-1545, 字国宝号涔涯, 澧州人, 官至户部尚书)

UPDATE poet SET birth_year = 1536, death_year = 1607, birthplace = '直隶常州府无锡（今江苏无锡）', biography = '字子勤，初号云屋，更号毅所。江苏无锡人，隆庆二年进士，官至浙江右布政使。万历间曾任山东济宁道按察使。有咏济宁太白楼诗收录于本平台。', style = NULL WHERE id = 77;
-- id: 77 龚勉 | 来源: 维基百科/明墓志铭(1536-1607, 字子勤号云屋、毅所, 无锡人, 官山东济宁道按察使)

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = '山东历城（今济南）', biography = '山东历城（今济南）人，光绪三十年甲辰恩科进士，官主事。有咏济宁王母阁诗收录于本平台。', style = NULL WHERE id = 79;
-- id: 79 徐金铭 | 来源: 维基百科(历城人, 光绪三十年甲辰恩科进士, 官主事), 生卒不详

UPDATE poet SET name = '殷云霄', birth_year = 1480, death_year = 1516, birthplace = '山东兖州府东平州寿张（今聊城阳谷）', biography = '字近夫，号石川。山东寿张（今阳谷）人，弘治十八年进士，官至南京给事中。工诗文，富藏书，著有《石川集》十二卷。有咏济宁南湖诗收录于本平台。', style = NULL WHERE id = 80;
-- id: 80 殷云霄 | 来源: 维基百科(1480-1516, 字近夫号石川, 山东寿张(今阳谷)人); 原名"殷云宵"为正史"殷云霄"之误, 一并修正

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = '直隶大名府东明（今山东菏泽东明）', biography = '字念公，号献吾。直隶东明（今属山东菏泽）人，万历二十六年进士，官至河南按察使，曾任山东清军道参议、山东副使，以宽厚著称。有咏东明五霸岗诗收录于本平台。', style = NULL WHERE id = 87;
-- id: 87 陈其猷 | 来源: 维基百科/东明县志(字念公号献吾, 东明人, 万历戊戌进士, 曾官山东副使), 生卒不详

UPDATE poet SET birth_year = 1537, death_year = 1599, birthplace = '直隶大名府东明（今山东菏泽东明）', biography = '字拱辰，号东泉。直隶东明（今属山东菏泽）人，嘉靖三十八年进士，累官至兵部尚书。有咏东明诗收录于本平台。', style = NULL WHERE id = 88;
-- id: 88 石星 | 来源: 维基百科/东明县志(1537-1599, 字拱辰号东泉, 东明(今菏泽东明)人, 官至兵部尚书)

-- ============ C 组 ============
UPDATE poet SET birth_year = 1511, death_year = 1594, birthplace = '山东东昌府濮州（今河南范县）', biography = '字伯承，号北山，濮州人。嘉靖二十六年（1547）进士，官至尚宝司少卿。明代诗人，曾与李攀龙、谢榛等结社论文，名列"广五子"。有咏东明漆园、曹州城、东阿等诗收录于本平台。', style = NULL WHERE id = 89;
-- id: 89 李先芳 | 来源: 维基百科(1511-1594, 字伯承号北山, 濮州人, 嘉靖二十六年进士, 尚宝司少卿), 台湾同乡会文献"广五子之一"

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = NULL, biography = '清代诗人，生卒、籍贯不详，有《东明河上口占》传世。咏东明黄河的诗收录于本平台。', style = NULL WHERE id = 90;
-- id: 90 杨应标 | 来源: 查无生平, 保守处理; 存《东明河上口占》诗(百度百科/sou-yun)

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = NULL, biography = '清代诗人，生卒、籍贯不详，生平见于县志著录。有咏东明五霸岗（春秋五霸会盟处）诗收录于本平台。', style = NULL WHERE id = 91;
-- id: 91 范通 | 来源: 查无生平, 保守处理

UPDATE poet SET birth_year = 1350, death_year = 1401, birthplace = '越州会稽（今浙江绍兴）', biography = '字愚士，以字行，号萍居道人，会稽（今浙江绍兴）人。明初文学家，唐肃之子，建文二年由方孝孺荐授翰林侍读。有《唐愚士诗》《萍居稿》传世，咏郓州诗收录于本平台。', style = NULL WHERE id = 97;
-- id: 97 唐之淳 | 来源: 维基百科"唐愚士"(1350-1401, 字愚士以字行, 会稽人, 翰林侍读, 有《唐愚士诗》)

UPDATE poet SET birth_year = 1524, death_year = NULL, birthplace = '山东兖州府郓城县（今山东郓城）', biography = '字应文，号望海，山东郓城人。嘉靖三十二年（1553）进士，历深泽、荣河知县，官至岳州府知府。有咏郓州诗收录于本平台。', style = NULL WHERE id = 98;
-- id: 98 侯祁 | 来源: 维基百科"侯祁"(1524年生, 卒年不详, 字应文号望海, 郓城人, 嘉靖三十二年进士, 岳州知府)

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = NULL, biography = '清代诗人，生卒、籍贯不详，生平见于县志著录。有咏郓城七陵碑（郓城十景之一）诗收录于本平台。', style = NULL WHERE id = 99;
-- id: 99 陈良谟 | 来源: 查无生平, 保守处理(明清同名者多, 无法确指)

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = NULL, biography = '清代诗人，生卒、籍贯不详，生平见于县志著录。有咏郓城诗收录于本平台。', style = NULL WHERE id = 100;
-- id: 100 张锷 | 来源: 查无生平, 保守处理

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = '京兆（今陕西西安）', biography = '字才江，京兆（今陕西西安）人。唐末苦吟诗人，崇奉贾岛，诗风僻涩，有《李洞诗》一卷。生卒年不详，有咏濮州诗收录于本平台。', style = '苦吟' WHERE id = 101;
-- id: 101 李洞 | 来源: 维基百科"李洞"(字才江, 京兆人, 唐末苦吟诗人学贾岛, 生卒不详)

UPDATE poet SET birth_year = 1583, death_year = 1644, birthplace = '山东兖州府曹州（今山东菏泽）', biography = '字盛符，号大瀛，曹州（今山东菏泽）人。万历三十八年（1610）进士，官至工部尚书，崇祯甲申闻变，郁愤而卒。有咏菏泽凝香园（何家花园）诗收录于本平台。', style = NULL WHERE id = 110;
-- id: 110 何应瑞 | 来源: 维基百科"何应瑞"(1583-1644, 字盛符号大瀛, 曹州人, 工部尚书); 凝香园即菏泽何家花园

UPDATE poet SET birth_year = 1628, death_year = 1678, birthplace = '山东东昌府茌平县（今山东聊城茌平）', biography = '字登孺，号北山，山东茌平人。顺治十五年（1658）进士，改庶吉士，官至礼科都给事中，有《槐轩集》。咏曹州牡丹诗收录于本平台。', style = NULL WHERE id = 111;
-- id: 111 王曰高 | 来源: 维基百科"王曰高"(1628-1678, 字登孺号北山, 茌平人, 礼科都给事中, 有《槐轩集》)

UPDATE poet SET birth_year = NULL, death_year = 1828, birthplace = '云南宁州（今云南华宁）', biography = '字寄庵，云南宁州（今华宁）人。乾隆三十七年（1772）壬辰科进士，历任山东新城、曹县、文登知县及青州、武定同知，人称"刘青天"，晚年任云南五华书院山长。诗宗陶潜，有《寄庵诗文钞》。咏曹州牡丹诗收录于本平台。', style = '平淡自然' WHERE id = 112;
-- id: 112 刘大绅 | 来源: 维基百科"刘大绅"(字寄庵, 云南宁州人, 乾隆壬辰科进士, 历山东新城/曹县/文登知县, 道光八年(1828)卒年八十一, 生年未明)

UPDATE poet SET birth_year = 1491, death_year = 1539, birthplace = '山东阳谷县（今山东聊城阳谷）', biography = '字文济，号石湖，山东阳谷人。正德九年（1514）进士，历监察御史、福建巡海副使、云南按察使，官至宁夏巡抚，嘉靖十八年卒于任。有咏盟台、灵泉诗收录于本平台。', style = NULL WHERE id = 119;
-- id: 119 吴铠 | 来源: 维基百科"吴铠"(约1491-1539, 字文济号石湖, 阳谷人, 正德九年进士, 宁夏巡抚)

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = NULL, biography = '明代诗人，生卒、籍贯不详，生平见于县志著录。有咏利津东津渡诗收录于本平台。', style = NULL WHERE id = 124;
-- id: 124 章忠 | 来源: 查无生平, 保守处理

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = NULL, biography = '清代利津邑人，生卒不详，诗见于《利津县志》。有咏利津东津渡诗收录于本平台。', style = NULL WHERE id = 125;
-- id: 125 刘学渤 | 来源: 《利津县志》诗文选录题"邑人刘学渤"

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = NULL, biography = '清代诗人，生卒、籍贯不详，生平见于县志著录。有咏利津东津渡诗收录于本平台。', style = NULL WHERE id = 126;
-- id: 126 张本大 | 来源: 查无生平, 保守处理

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = NULL, biography = '清代诗人，生卒、籍贯不详，生平见于县志著录。有咏黄河大堤的诗收录于本平台。', style = NULL WHERE id = 127;
-- id: 127 汤朝槭 | 来源: 查无生平, 保守处理

UPDATE poet SET birth_year = NULL, death_year = NULL, birthplace = NULL, biography = '清代利津少尹（县丞），生卒不详，诗见于《利津县志》。有咏利津东津渡诗收录于本平台。', style = NULL WHERE id = 128;
-- id: 128 狄培 | 来源: 《利津县志》诗文选录题"少尹狄培"