-- V20: 九城五类数据采集 · literature 种子数据（生成自 scripts/gen_cultural_migration.mjs）
-- 幂等策略: 按 (category,title) 先删后插; detail 表 FK ON DELETE CASCADE 随主行级联删除
-- 数据来源: 见各条目下方注释, 采集于 2026-08; 存疑内容已标（待考）

-- [1] 尧的传说（鄄城谷林）（菏泽）来源: 中国非物质文化遗产网（ihchina.cn）'尧的传说'条目；菏泽市政府非遗名录公示；大众日报《'隐'于鄄城谷林的尧帝陵》（2021-08）；菏泽新闻网'国家级非遗项目尧的传说研讨会'报道（2019-12）
DELETE FROM cultural_item WHERE title='尧的传说（鄄城谷林）' AND category='literature';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('literature', '尧的传说（鄄城谷林）', '国家级非遗，帝尧葬于鄄城谷林，当地流传尧舜禅让、访贤等传说。', '尧的传说流传于山东菏泽鄄城谷林一带。相传帝尧为上古五帝之一，建都平阳，仁德如天，不传子而禅位于舜，被尊为圣王。鄄城谷林传为尧葬之地，谷林尧陵历代祭祀不绝。当地民间世代讲述尧访贤得舜、舜耕历山（鄄城历山古遗址）、尧舜禅让、大禹治水等故事，将上古圣王传说与本地山水风物融为一体。传说彰显公天下、尚贤德的古风，是研究上古史与鲁西南民间信仰的重要口承文献。该项目为国家级非物质文化遗产（申报地区以山西临汾尧都区为主，菏泽鄄城为重要流传地与谷林尧陵所在，名录归属细节待考），堪称齐鲁大地尧舜文化的源头标识之一。', '菏泽', '["尧","舜","鄄城","谷林尧陵","国家级非遗","民间文学"]', 0, 'published', 'manual');
INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) VALUES ((SELECT id FROM cultural_item WHERE title='尧的传说（鄄城谷林）' AND category='literature'), '传说', '山东菏泽鄄城谷林、山西临汾尧都区等地', '尧、舜、禹', '1. 帝尧仁德治国、访贤求才
2. 于历山访得舜
3. 尧舜禅让，公天下传为美谈
4. 鄄城谷林传为尧葬之地，谷林尧陵世代祭祀
5. 当地流传舜耕历山等传说', '彰显禅让尚贤的上古德政传统，是齐鲁尧舜文化与黄河文明的源头性口承遗产', '["古鄄城","鄄城"]', '菏泽市非遗普查资料、《中国民间文学集成·山东卷》（待考）');

-- [2] 麒麟传说（菏泽）来源: 中国非物质文化遗产网（ihchina.cn）'麒麟传说'条目（第二批国家级名录）；菏泽市政府'菏泽市国家级非物质文化遗产项目名录（民间文学）'；巨野县文化馆国家级非遗保护单位公示
DELETE FROM cultural_item WHERE title='麒麟传说' AND category='literature';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('literature', '麒麟传说', '国家级非遗，巨野为西狩获麟之地，流传麒麟呈祥、获麟绝笔等传说。', '麒麟传说流传于山东菏泽巨野一带。麒麟为传说中的仁兽，不践生虫、不折生草，主太平祥瑞。相传春秋鲁哀公十四年，鲁国西狩大野（今巨野）获麟，孔子见麟而叹''吾道穷矣''，遂绝笔《春秋》，史称''获麟绝笔''。巨野因此被视为麒麟降生之地，现存麒麟台（获麟台）遗址。民间围绕麒麟衍生出麒麟送子、麒麟吐书、麒麟呈祥等故事，婚嫁节庆喜用麒麟图案祈吉纳福。该传说将圣贤文化、祥瑞信仰与地方风物相结合，2008年入选第二批国家级非物质文化遗产名录，是鲁西南最具代表性的民间文学遗产之一。', '菏泽', '["麒麟","获麟绝笔","孔子","巨野","国家级非遗","民间文学"]', 0, 'published', 'manual');
INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) VALUES ((SELECT id FROM cultural_item WHERE title='麒麟传说' AND category='literature'), '传说', '山东菏泽巨野（春秋大野泽一带）', '孔子、麒麟', '1. 鲁哀公十四年西狩大野获麟
2. 孔子见麟叹''吾道穷矣''而绝笔《春秋》
3. 巨野存麒麟台（获麟台）遗址
4. 民间流传麒麟送子、麒麟呈祥等故事
5. 麒麟成为祥瑞文化符号', '承载儒家''获麟绝笔''的文化记忆与民间祥瑞信仰，见证圣贤文化与地方风物的融合', '[]', '巨野县文化馆（国家级非遗保护单位）非遗档案、菏泽市非遗普查资料');

-- [3] 大舜传说（济南）来源: 大众网'舜耕历山 德润泉城——历下区省级非遗项目大舜传说主题讲座'系列报道；千佛山'古称历山，有舜耕传说'景点资料
DELETE FROM cultural_item WHERE title='大舜传说' AND category='literature';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('literature', '大舜传说', '省级非遗，舜耕历山的传说在济南历下区世代流传，千佛山古称历山。', '大舜传说流传于济南历下区一带。相传舜为有虞氏，生于诸冯，耕于历山，济南历山即今千佛山，山下有舜井、舜祠、娥英水等遗迹。传说舜在历山耕田，象为之耕、鸟为之耘；在雷泽捕鱼、河滨制陶，所居之处一年成聚、二年成邑。他孝感动天、宽厚待人，终受尧禅让为帝，后人尊其为''大舜''。历下区民间世代讲述舜耕历山、孝感动天、娥皇女英等故事，并与趵突泉、舜井等泉城风物相连。传说体现了孝德文化与德政思想，是济南泉城文化的精神源头，现为山东省省级非物质文化遗产代表性项目。', '济南', '["大舜","舜耕历山","千佛山","济南","省级非遗","民间文学"]', 0, 'published', 'manual');
INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) VALUES ((SELECT id FROM cultural_item WHERE title='大舜传说' AND category='literature'), '传说', '山东济南历下区（历山/千佛山一带）', '舜、尧、娥皇、女英', '1. 舜耕历山，象耕鸟耘
2. 雷泽捕鱼、河滨制陶，居地成聚成邑
3. 孝感动天，宽厚待人
4. 受尧禅让为帝，尊称大舜
5. 历山即今千佛山，舜井舜祠遗迹犹存', '承载孝德与禅让德政传统，是泉城济南''舜耕历山''文脉与泉水文化的源头记忆', '["千佛山"]', '历下区省级非遗项目''大舜传说''宣传资料、济南市文化馆非遗档案');

-- [4] 闵子骞传说（济南）来源: 山东省非遗保护中心（sdfeiyi.org）'济南·闵子骞传说'条目；大众日报《济南市省级非遗(扩展)项目》（2012-04-28）
DELETE FROM cultural_item WHERE title='闵子骞传说' AND category='literature';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('literature', '闵子骞传说', '省级非遗，闵子骞芦衣顺母的孝道传说在济南历城世代流传。', '闵子骞传说流传于济南历城区一带。闵子骞名损，字子骞，孔子弟子，以德行著称。相传他幼年丧母，继母虐待他，寒冬以芦花絮衣，而亲生子以棉絮为衣。其父察觉后欲休弃继母，子骞跪求说：''母在一子寒，母去三子单。''父亲感悟，继母亦悔改，全家和好。''鞭打芦花''''芦衣顺母''的故事由此传为千古孝道典范，被列入《二十四孝》。济南历城存闵子骞墓及闵子祠，历代奉祀不绝。传说倡导以德报怨、以孝化人，是儒家孝道文化在齐鲁民间的生动载体，现为山东省省级非物质文化遗产代表性项目。', '济南', '["闵子骞","二十四孝","芦衣顺母","济南","省级非遗","民间文学"]', 0, 'published', 'manual');
INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) VALUES ((SELECT id FROM cultural_item WHERE title='闵子骞传说' AND category='literature'), '传说', '山东济南历城区（闵子骞墓/闵子祠一带）', '闵子骞、闵父、继母', '1. 闵子骞幼年丧母，继母以芦花絮其冬衣
2. 父亲发现后欲休弃继母
3. 子骞跪求''母在一子寒，母去三子单''
4. 继母感悟悔改，全家和好
5. 故事列入《二十四孝》，济南历城存墓祠奉祀', '以''芦衣顺母''诠释孝道与宽容，是儒家孝德文化在民间传说的典范呈现', '[]', '济南市非遗普查资料、山东省非遗保护中心项目档案（济南·闵子骞传说）');

-- [5] 东方朔传说（德州）来源: 百度百科'东方朔民间传说（山东省非物质文化遗产代表性项目）'；陵城区政府网《关于提升东方朔墓文化旅游价值提案的答复》
DELETE FROM cultural_item WHERE title='东方朔传说' AND category='literature';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('literature', '东方朔传说', '省级非遗，西汉名臣东方朔的机智传说在德州陵城世代流传。', '东方朔传说流传于德州陵城区一带。东方朔，字曼倩，西汉文学家，平原厌次（今德州陵城区）人。相传他博闻多智、诙谐善辩，汉武帝时官至太中大夫，常以嬉笑讽谏规劝君王，留下骂杀侏儒、射覆猜谜、谏阻扩建上林苑等轶事，民间称其''智圣''。陵城现存东方朔墓及故里遗址，当地百姓世代讲述他戏弄朝臣、巧解难题的故事，并举办东方朔庙会祭祀纪念。传说将历史人物智慧化、喜剧化，展现了齐地诙谐尚智的民风，是鲁北最具代表性的历史人物传说之一，现为山东省省级非物质文化遗产代表性项目。', '德州', '["东方朔","智圣","陵城","德州","省级非遗","民间文学"]', 0, 'published', 'manual');
INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) VALUES ((SELECT id FROM cultural_item WHERE title='东方朔传说' AND category='literature'), '传说', '山东德州陵城区（东方朔墓一带）', '东方朔、汉武帝', '1. 东方朔为西汉平原厌次（今德州陵城）人
2. 诙谐多智，官至太中大夫
3. 以嬉笑讽谏规劝汉武帝
4. 留下骂侏儒、射覆猜谜等轶事
5. 陵城存东方朔墓，庙会祭祀相沿', '以机智诙谐形象展现齐鲁尚智民风，是历史人物传说民间化、喜剧化的典范', '[]', '德州市、陵城区非遗普查资料，陵城区政协''东方朔文化''提案答复');

-- [6] 四女寺的传说（德州）来源: 武城县人民政府网《武城县非物质文化遗产名录项目一览表》；百度百科'四女寺的传说'；大众日报《非遗传说四女孝亲搬上京剧舞台》（2012-07）
DELETE FROM cultural_item WHERE title='四女寺的传说' AND category='literature';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('literature', '四女寺的传说', '流传于德州武城四女寺一带的孝道传说，四女侍母终身不嫁。', '四女寺的传说流传于德州武城县四女寺镇。相传汉代此地傅氏有女四人，父亡母病，四女矢志侍母，终身不嫁，各植槐树一株以明心志，人称''四女槐''。母殁后四女于墓前立祠，乡人感其孝行，建寺奉祀，寺因四女得名。后世四女寺临运河而兴，成为运河沿岸商贸重镇，四女孝亲的故事也随漕运商旅传遍南北，被编为京剧《四女槐》搬上舞台。传说将孝道美德与运河古镇兴衰相系，是鲁西北孝文化的重要口承文本，列入武城县非物质文化遗产名录（名录级别待考）。', '德州', '["四女寺","孝道","武城","德州","运河文化","民间文学"]', 0, 'published', 'manual');
INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) VALUES ((SELECT id FROM cultural_item WHERE title='四女寺的传说' AND category='literature'), '传说', '山东德州武城县四女寺镇', '傅氏四女、傅母', '1. 汉代傅氏四女父亡母病
2. 四女矢志侍母，终身不嫁
3. 各植槐树明志，人称''四女槐''
4. 母殁立祠建寺，四女寺由此得名
5. 故事随运河商旅流传，编为京剧《四女槐》', '以''四女孝亲''弘扬孝道，见证运河古镇的民俗信仰与文脉传承', '["卫运河"]', '武城县非物质文化遗产名录、武城县公共文化服务名录项目一览表');

-- [7] 孟姜女传说（淄博）（淄博）来源: 中国非物质文化遗产网（ihchina.cn）'孟姜女传说'条目；淄博市文化和旅游局《淄博市各级非物质文化遗产代表性项目名录》；淄博文明网《孟姜女传说演变传承两千年》
DELETE FROM cultural_item WHERE title='孟姜女传说（淄博）' AND category='literature';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('literature', '孟姜女传说（淄博）', '国家级非遗，孟姜女哭长城的传说在淄博淄川世代流传（与泰安流传版本并存）。', '孟姜女传说为中国四大民间传说之一，在淄博淄川区流传尤盛。相传秦时孟姜女与范喜良新婚三日，丈夫即被征修长城，一去不返。孟姜女缝制寒衣千里寻夫，到长城方知丈夫已劳累而死、尸骨填于城墙之内，她悲痛欲绝，连哭数日，竟哭倒长城，露出丈夫尸骨，遂滴血认骨、背负归乡。淄川民间相传孟姜女为本地人，当地存孟姜女庙等相关遗迹（待考）。传说控诉暴政、礼赞忠贞，是齐鲁民间文学的代表性遗产，现为国家级非物质文化遗产代表性项目（淄博为申报/保护地区，入选批次待考）。', '淄博', '["孟姜女","四大传说","淄川","淄博","国家级非遗","民间文学"]', 0, 'published', 'manual');
INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) VALUES ((SELECT id FROM cultural_item WHERE title='孟姜女传说（淄博）' AND category='literature'), '传说', '山东淄博淄川区等地', '孟姜女、范喜良、秦始皇', '1. 范喜良新婚三日被征修长城
2. 孟姜女缝寒衣千里寻夫
3. 得知丈夫已死，痛哭数日
4. 哭倒长城，滴血认骨
5. 淄川存孟姜女庙等相关遗迹', '控诉暴政、歌颂忠贞爱情，是中国四大民间传说与齐鲁民间文学的代表', '[]', '淄博市非遗名录、淄川区文化馆（国家级非遗保护单位）非遗档案');

-- [8] 牛郎织女传说（沂源）（淄博）来源: 中国非物质文化遗产网（ihchina.cn）'牛郎织女传说'条目；沂源县政府'七夕话沂源'专题；中国牛郎织女传说研究中心资料
DELETE FROM cultural_item WHERE title='牛郎织女传说（沂源）' AND category='literature';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('literature', '牛郎织女传说（沂源）', '国家级非遗，沂源为牛郎织女传说核心流传地，存织女洞牛郎庙。', '牛郎织女传说为中国四大民间传说之一，淄博沂源县为其重要流传地。沂源燕崖镇一带山水相连，织女洞与牛郎官庄隔河相望，传为故事发生地。相传织女下凡与牛郎结为夫妻，男耕女织，育有一双儿女；王母娘娘怒而拔簪划出天河，将二人隔开，只许每年七夕鹊桥相会。沂源民间世代讲述牛郎织女故事，保存织女洞、牛郎庙、天孙泉、银河（沂河）等遗迹，并举办七夕爱情文化节。该传说以鹊桥相会寄托古人对坚贞爱情的向往，2008年与山西和顺等地一同入选第二批国家级非物质文化遗产名录，沂源为中国牛郎织女传说研究中心所在地。', '淄博', '["牛郎织女","七夕","沂源","四大传说","国家级非遗","民间文学"]', 0, 'published', 'manual');
INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) VALUES ((SELECT id FROM cultural_item WHERE title='牛郎织女传说（沂源）' AND category='literature'), '传说', '山东淄博沂源县燕崖镇（织女洞、牛郎官庄一带）', '牛郎、织女、王母娘娘', '1. 织女下凡与牛郎结为夫妻
2. 男耕女织，育有一双儿女
3. 王母拔簪划天河隔开二人
4. 每年七夕鹊桥相会
5. 沂源存织女洞、牛郎庙、天孙泉等遗迹', '寄托坚贞爱情理想与七夕乞巧民俗，是齐鲁山水与神话传说结合的典范', '[]', '沂源县非遗档案、中国牛郎织女传说研究中心资料');

-- [9] 董永传说（滨州）来源: 博兴县人民政府网《国家级非物质文化遗产〈董永传说〉》；非遗网（feiyiw.com）'董永传说（山东省滨州市 国家级）'
DELETE FROM cultural_item WHERE title='董永传说' AND category='literature';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('literature', '董永传说', '国家级非遗，董永卖身葬父遇七仙女的传说在博兴世代流传。', '董永传说流传于滨州博兴县一带。相传东汉千乘（今博兴）人董永家贫，父死无钱安葬，遂卖身富家为奴以葬父，孝行感动天庭。七仙女私自下凡，于槐荫树下与董永相遇，请老槐树为媒结为夫妻，同至债主家织锦百匹偿债赎身，百日姻缘期满，仙女升天而去。''卖身葬父''''槐荫为媒''遂成二十四孝与《天仙配》故事的原型，博兴由此得名''董永故里''，存董永墓、董永祠及麻大湖等遗迹，每年举办董永文化艺术节。传说将孝道与爱情理想融为一体，现为国家级非物质文化遗产代表性项目（滨州博兴为保护地区，入选批次待考），是齐鲁孝文化的标志性遗产。', '滨州', '["董永","七仙女","二十四孝","博兴","国家级非遗","民间文学"]', 0, 'published', 'manual');
INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) VALUES ((SELECT id FROM cultural_item WHERE title='董永传说' AND category='literature'), '传说', '山东滨州博兴县（麻大湖、董永墓一带）', '董永、七仙女、老槐树', '1. 董永家贫，卖身葬父
2. 孝行感动天庭
3. 七仙女槐荫为媒下嫁
4. 织锦百匹偿债赎身，百日姻缘
5. 博兴存董永墓祠，为''董永故里''', '将孝道与爱情理想融为一体，是《天仙配》原型与齐鲁孝文化的标志性遗产', '[]', '博兴县文化馆非遗档案、博兴县政府''国家级非遗〈董永传说〉''专题');

-- [10] 丈八佛传说（滨州）来源: 博兴县人民政府网《市级非物质文化遗产〈丈八佛传说〉》；博兴兴国寺丈八佛（第七批全国重点文物保护单位）资料
DELETE FROM cultural_item WHERE title='丈八佛传说' AND category='literature';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('literature', '丈八佛传说', '市级非遗，博兴旺国寺丈八佛灵验显圣的传说在当地世代流传。', '丈八佛传说流传于滨州博兴县湖滨镇丈八佛村一带。兴国寺内供奉北朝石刻释迦牟尼立像，高约一丈八尺，故名丈八佛。相传石佛凿成后灵验异常，凡遇旱涝兵灾，乡人祈祷辄应；一说石佛夜间显圣，为百姓祛病消灾，故香火不绝，村以佛名。丈八佛历经千年沧桑仍保存完好，现为第七批全国重点文物保护单位。当地百姓围绕石佛讲述其开凿、灵验、护佑一方的故事，逢佛诞日与庙会进香祈福。传说融合佛教信仰与乡土记忆，是鲁北民间信仰文学的代表，列入滨州市级非物质文化遗产名录。', '滨州', '["丈八佛","兴国寺","博兴","市级非遗","民间文学","佛教传说"]', 0, 'published', 'manual');
INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) VALUES ((SELECT id FROM cultural_item WHERE title='丈八佛传说' AND category='literature'), '传说', '山东滨州博兴县湖滨镇丈八佛村（兴国寺）', '丈八佛', '1. 兴国寺供奉北朝石佛，高丈八
2. 相传石佛灵验，祈祷辄应
3. 百姓传其夜间显圣、祛病消灾
4. 村以佛名，香火不绝
5. 丈八佛为全国重点文物保护单位', '融合佛教信仰与乡土记忆，是鲁北民间信仰文学与石佛崇拜文化的代表', '[]', '博兴县非遗档案、博兴县政府''市级非遗〈丈八佛传说〉''公示');

-- 校验: SELECT category, region, COUNT(*) FROM cultural_item WHERE category='literature' GROUP BY region ORDER BY region;