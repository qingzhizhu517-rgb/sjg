-- V19: 九城五类数据采集 · craft 种子数据（生成自 scripts/gen_cultural_migration.mjs）
-- 幂等策略: 按 (category,title) 先删后插; detail 表 FK ON DELETE CASCADE 随主行级联删除
-- 数据来源: 见各条目下方注释, 采集于 2026-08; 存疑内容已标（待考）

-- [1] 曹州面塑（面人·曹州面人）（菏泽）来源: 菏泽广电网"国家级非物质文化遗产——曹州面人"（https://www.hezegd.com/news/hezefeiyi/detail-5132.html）；山东宣传网"指尖上的传承：曹县江米人守正创新"（https://sdxw.iqilu.com/w/article/YS0yMS0xNzExNjEzMA.html）
DELETE FROM cultural_item WHERE title='曹州面塑（面人·曹州面人）' AND category='craft';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('craft', '曹州面塑（面人·曹州面人）', '国家级非遗，以面塑牡丹、戏曲人物著称的鲁西南民间面塑艺术。', '曹州面塑即"面人（曹州面人）"，是国家级非物质文化遗产，流行于菏泽市牡丹区及曹县一带。艺人以小麦面、糯米面调色捏塑，题材多取戏曲人物、神话故事与牡丹花卉，造型古朴、色彩艳丽，尤以面塑牡丹闻名。曹县江米人同属鲁西南面塑脉络，曾亮相黄河流域非遗展并登上国际舞台。当代传承人将面塑与现代文创、研学体验结合，在校园与景区开设传习课堂，让老手艺持续焕发新生。', '菏泽', '["国家级非遗","菏泽","面塑","传统美术"]', 0, 'published', 'manual');
INSERT INTO craft_detail (item_id, craft_category, materials, tools, process, inheritors, representative_works, difficulty_level, learning_resources) VALUES ((SELECT id FROM cultural_item WHERE title='曹州面塑（面人·曹州面人）' AND category='craft'), '面塑', '小麦面粉、糯米粉（江米粉）、蜂蜜、食用色素、防腐剂', '捏塑刀（竹刀/牛角刀）、剪刀、梳子、模具、垫板', '1. 和面：面粉加糯米粉、蜂蜜等蒸熟揉匀
2. 调色：分块调入各色颜料
3. 捏塑：按头、身、四肢顺序捏出造型
4. 妆饰：用刀具压出衣纹、五官
5. 晾干：自然阴干定型', '曹州面人传承群体（曹县江米人艺人群，代表性传承人姓名待考）', '面塑牡丹、戏曲人物面人、十二生肖面人', 3, '菏泽非遗工坊体验、曹州面人传习所/研学课堂');

-- [2] 鲁锦织造技艺（菏泽）来源: 澎湃/大众网"鲁西南的活历史——国家级非遗项目鲁锦织造技艺掠影"（https://m.thepaper.cn/baijiahao_10897034）；鲁网"菏泽鲁锦文化展示体验中心"（http://sd.sdnews.com.cn/heze/xwzx/202303/t20230330_4207771.htm）
DELETE FROM cultural_item WHERE title='鲁锦织造技艺' AND category='craft';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('craft', '鲁锦织造技艺', '国家级非遗，鄄城、郓城一带以彩色棉线织成的鲁西南老粗布织造技艺。', '鲁锦织造技艺是国家级非物质文化遗产，主要流传于菏泽鄄城、郓城等县。鲁锦以纯棉纱为经线、彩色棉纱为纬线，在传统木织机上织出平纹、斜纹与提花图案，纹样多取"八宝""龙凤""万字"等吉祥题材，质地厚实、色彩浓烈，俗称"老粗布"。当代鲁锦在保持手工织造的同时融入设计创新，发展出服饰、家纺、文创等品类，鄄城等地建有鲁锦文化展示体验中心并开展暑期研学，机杼声声不绝于耳。', '菏泽', '["国家级非遗","菏泽","织造","传统技艺"]', 0, 'published', 'manual');
INSERT INTO craft_detail (item_id, craft_category, materials, tools, process, inheritors, representative_works, difficulty_level, learning_resources) VALUES ((SELECT id FROM cultural_item WHERE title='鲁锦织造技艺' AND category='craft'), '织造', '纯棉纱线、彩色棉纱、经线、纬线', '木织机、梭子、综、筘、纺车、染缸', '1. 纺线：纺车纺出棉纱
2. 染线：染色备用
3. 经线：按纹样设计排经
4. 上机：穿综过筘
5. 织造：踩踏板投梭织布
6. 整理：下机、缩水、修边', '鲁锦织造传承群体（鄄城、郓城织女群体）', '鲁锦床单、鲁锦服饰、鲁锦壁挂、八宝纹鲁锦', 3, '菏泽鲁锦文化展示体验中心、非遗工坊研学');

-- [3] 曲阜楷木雕刻（木雕·曲阜楷木雕刻）（济宁）来源: 中国非物质文化遗产网"国家级非物质文化遗产系列报道之曲阜楷木雕"（https://www.ihchina.cn/art/detail/id/11317.html）；济宁新闻网"曲阜楷木雕刻 千年非遗薪火相传"（https://www.jnnews.tv/xianqu/qufu/2026/07-25/n1KLgjqr.html）
DELETE FROM cultural_item WHERE title='曲阜楷木雕刻（木雕·曲阜楷木雕刻）' AND category='craft';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('craft', '曲阜楷木雕刻（木雕·曲阜楷木雕刻）', '国家级非遗，以孔林楷木为材、刀法精细的曲阜传统木雕艺术。', '曲阜楷木雕刻是国家级非物质文化遗产，因以曲阜孔林所产楷树（黄连木）为雕刻材料而得名，明清两代曾为贡品。艺人以楷木雕刻孔子像、如意、手杖、镇纸等，刀法圆润细腻，尤其"楷木如意"与孔庙祭祀礼仪关系密切。当代传承群体在保留传统题材的同时开发文创摆件，依托"孔孟之乡"文旅资源开展传习与研学，曲阜楷木雕刻作品屡获国家级奖项，千年非遗薪火相传。', '济宁', '["国家级非遗","济宁","雕刻","传统美术"]', 0, 'published', 'manual');
INSERT INTO craft_detail (item_id, craft_category, materials, tools, process, inheritors, representative_works, difficulty_level, learning_resources) VALUES ((SELECT id FROM cultural_item WHERE title='曲阜楷木雕刻（木雕·曲阜楷木雕刻）' AND category='craft'), '雕刻', '楷木（黄连木）、蜡、清漆', '刻刀（平刀、圆刀、三角刀）、木槌、锉刀、砂纸', '1. 选料：选用孔林楷木，去湿晾干
2. 画样：在木坯上勾画图样
3. 粗雕：凿出整体轮廓
4. 细雕：精刻眉眼衣纹
5. 打磨：砂纸抛光
6. 上蜡：涂蜡或清漆养护', '曲阜楷木雕刻传承群体（曲阜艺人群，代表性传承人姓名待考）', '楷木孔子像、楷木如意、楷木手杖、楷木镇纸', 4, '曲阜非遗传习所、孔府/孔庙研学体验');

-- [4] 嘉祥石雕（石雕·嘉祥石雕）（济宁）来源: 中国非物质文化遗产网"石雕（嘉祥石雕）"（https://www.ihchina.cn/project_details/14113.html）；大众日报"新增五项国家级非物质文化遗产代表性项目"（http://paper.dzwww.com/dzrb/content/20140729/Articel14008MT.htm）
DELETE FROM cultural_item WHERE title='嘉祥石雕（石雕·嘉祥石雕）' AND category='craft';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('craft', '嘉祥石雕（石雕·嘉祥石雕）', '国家级非遗，依托武氏祠汉画像石传统的济宁嘉祥石雕技艺。', '嘉祥石雕是国家级非物质文化遗产，济宁嘉祥县素有"中国石雕之乡"之称。嘉祥石刻技艺上承武氏祠汉画像石传统，题材涵盖麒麟、石狮、人物、碑刻等，技法分圆雕、浮雕、透雕、线刻，作品气势雄浑、刀法洗练。当代嘉祥石雕已形成集开采、设计、加工、销售于一体的文化产业集群，嘉祥石雕文化产业园聚集大量艺人，产品远销海内外，并广泛运用于城市雕塑与园林建筑。', '济宁', '["国家级非遗","济宁","雕刻","传统美术"]', 0, 'published', 'manual');
INSERT INTO craft_detail (item_id, craft_category, materials, tools, process, inheritors, representative_works, difficulty_level, learning_resources) VALUES ((SELECT id FROM cultural_item WHERE title='嘉祥石雕（石雕·嘉祥石雕）' AND category='craft'), '雕刻', '青石（石灰岩）、花岗岩、汉白玉', '錾子、锤子、凿子、磨光机、切割机', '1. 选石：挑选质地致密的青石/花岗岩
2. 设计：绘制图样或打样
3. 开坯：切割石材粗坯
4. 粗雕：錾凿出大形
5. 细雕：精刻细部纹饰
6. 磨光：打磨抛光', '嘉祥石雕艺人群体（武氏祠石刻技艺传承脉络）', '石麒麟、石狮子、汉画像石拓片、人物石雕', 5, '嘉祥石雕文化产业园、嘉祥石雕厂见习');

-- [5] 泰山玉雕刻（石雕·泰山玉雕刻）（泰安）来源: 泰安市文化馆"泰山张氏玉雕技艺非遗传承体验活动"（http://whg.taian.cn/art/2023/3/13/art_75469_10287246.html）；百度百科"石雕（泰山玉雕刻）——山东省第六批省级非物质文化遗产代表性项目"
DELETE FROM cultural_item WHERE title='泰山玉雕刻（石雕·泰山玉雕刻）' AND category='craft';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('craft', '泰山玉雕刻（石雕·泰山玉雕刻）', '山东省级非遗，以泰山墨玉、碧玉为材的泰山玉石雕刻技艺。', '泰山玉雕刻是山东省第六批省级非物质文化遗产代表性项目。泰山玉产自泰山周边，以墨玉为主，兼有碧玉、翠斑玉，质地温润、黑中透亮。艺人依玉施艺，雕刻泰山风景、平安符、茶具、印章等，尤以"泰山平安玉"寓意深得市场青睐。当代泰山玉雕从业者众多，泰安市文化馆等机构持续举办玉雕技艺非遗传承体验活动，泰山张氏玉雕等老字号传承脉络清晰，带动泰安玉石文创产业发展。', '泰安', '["省级非遗","泰安","雕刻","传统美术"]', 0, 'published', 'manual');
INSERT INTO craft_detail (item_id, craft_category, materials, tools, process, inheritors, representative_works, difficulty_level, learning_resources) VALUES ((SELECT id FROM cultural_item WHERE title='泰山玉雕刻（石雕·泰山玉雕刻）' AND category='craft'), '雕刻', '泰山墨玉、泰山碧玉、翠斑玉、金刚砂', '玉石切割机、雕磨机、钻头、抛光轮、刻刀', '1. 选料：鉴别玉石质地与色泽
2. 设计：依形构思图样
3. 切割：切出坯料
4. 雕琢：水磨雕刻造型
5. 抛光：打磨上光
6. 配饰：穿绳配座成器', '泰山玉雕传承群体（泰山张氏玉雕等老字号艺人群）', '泰山平安玉佩、泰山风景玉雕、墨玉茶具、玉印章', 4, '泰安市文化馆非遗体验活动、玉石雕刻工坊学徒');

-- [6] 肥城桃木雕刻（泰安）来源: 泰安市文旅局"桃木王——王来新"（http://whlyj.taian.gov.cn/art/2015/3/20/art_69027_4642175.html）；国际在线"山东肥城：桃木雕刻以木传神"（https://sd.cri.cn/2024-07-03/33fd553a-fd4a-fa68-e912-615124576d12.html）；非遗级别待考
DELETE FROM cultural_item WHERE title='肥城桃木雕刻' AND category='craft';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('craft', '肥城桃木雕刻', '泰安肥城传统雕刻技艺，"桃木王"王来新等艺人以桃木制剑、符、如意。（级别待考）', '肥城桃木雕刻是泰安肥城市的传统工艺，依托"世界最大桃园"的桃木资源发展壮大。艺人取桃木制作桃木剑、桃符、如意、摆件等，借"桃木辟邪"民俗寓意走俏市场，相关"肥城桃木桃符制作民俗"已列入非遗名录（级别待考）。当地涌现王来新（人称"桃木王"）等知名艺人，桃木工艺品形成规模化产业，建有国内首家专业桃木旅游商品博物馆，并获"肥城桃木雕刻"国家地理标志证明商标。', '泰安', '["泰安","肥城","雕刻","桃木工艺"]', 0, 'published', 'manual');
INSERT INTO craft_detail (item_id, craft_category, materials, tools, process, inheritors, representative_works, difficulty_level, learning_resources) VALUES ((SELECT id FROM cultural_item WHERE title='肥城桃木雕刻' AND category='craft'), '雕刻', '桃木（肥城桃木）、清漆、蜡', '刻刀、木工锯、刨、砂纸、电磨', '1. 选材：取老桃木晾干
2. 开料：锯出坯形
3. 粗雕：凿出轮廓
4. 精雕：刻出纹饰
5. 打磨：抛光表面
6. 上漆：涂清漆或打蜡', '王来新（"桃木王"）等肥城桃木雕刻艺人群', '桃木剑、桃木如意、桃符、桃木生肖摆件', 3, '肥城桃木旅游商品博物馆、桃木雕刻工坊体验');

-- [7] 德州黑陶烧制技艺（陶器烧制技艺·德州黑陶烧制技艺）（德州）来源: 中国非物质文化遗产网"陶器烧制技艺（德州黑陶烧制技艺）"（https://www.ihchina.cn/project_details/14466.html）；德州市政府"德州黑陶制作技艺"（http://wap.dezhou.gov.cn/n43517423/n43517738/n43926269/c29053317/content.html）
DELETE FROM cultural_item WHERE title='德州黑陶烧制技艺（陶器烧制技艺·德州黑陶烧制技艺）' AND category='craft';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('craft', '德州黑陶烧制技艺（陶器烧制技艺·德州黑陶烧制技艺）', '国家级非遗，以"黑如漆、明如镜、薄如纸"著称的德州制陶技艺。', '德州黑陶烧制技艺是国家级非物质文化遗产（入选批次待考），流传于德州德城区一带。黑陶以黄河淤积细泥为原料，经练泥、拉坯、修坯、压光、雕刻、烧制而成，成品"黑如漆、亮如镜、薄如纸、叩如磬"。梁子黑陶等企业在传统基础上恢复硬刻陶、镂空、浮雕等工艺，并发展彩陶与文创产品，德州学院建有黑陶文化产业学院，形成"非遗+教育+产业"的当代传承模式。', '德州', '["国家级非遗","德州","制陶","传统技艺"]', 0, 'published', 'manual');
INSERT INTO craft_detail (item_id, craft_category, materials, tools, process, inheritors, representative_works, difficulty_level, learning_resources) VALUES ((SELECT id FROM cultural_item WHERE title='德州黑陶烧制技艺（陶器烧制技艺·德州黑陶烧制技艺）' AND category='craft'), '制陶', '黄河细泥（淤积土）、水、釉料（彩陶用）', '拉坯机、转盘、修坯刀、刻刀、压光板、窑炉', '1. 取泥：采黄河细泥淘洗沉淀
2. 练泥：揉练排除气泡
3. 拉坯：转盘上拉出器形
4. 修坯：修整器壁
5. 雕刻压光：刻花并压光
6. 烧制：渗碳还原烧成黑陶', '梁丽霞（德州梁子黑陶文化有限公司负责人）及黑陶艺人群体（省级传承人名单待考）', '黑陶瓶、黑陶茶具、硬刻陶花觚、镂空黑陶', 5, '梁子黑陶文化园体验、德州学院黑陶文化产业学院');

-- [8] 蟋蟀罐传统制作技艺（宁津）（德州）来源: 宁津县政府"蟋蟀罐传统制作技艺"（http://www.sdningjin.gov.cn/n50593809/n50593811/n50593829/n73677400/c94278805/content.html）；德州日报"第五批省级非遗代表性项目名录及扩展项目名录公布"（http://www.dezhoudaily.com/p/1568473.html）
DELETE FROM cultural_item WHERE title='蟋蟀罐传统制作技艺（宁津）' AND category='craft';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('craft', '蟋蟀罐传统制作技艺（宁津）', '山东省级非遗，宁津"中华蟋蟀第一县"以澄浆泥制蟋蟀罐的技艺。', '蟋蟀罐传统制作技艺是山东省省级非物质文化遗产（第五批省级名录，2021），流传于德州宁津县。宁津素有"中华蟋蟀第一县"之称，斗蟋之风催生了制罐行业。艺人取黄河澄浆细泥，经澄泥、练泥、拉坯、晾干、烧制等工序制成蟋蟀罐，罐壁致密透气、保湿性好，讲究"养口"。宁津蟋蟀罐远销京津沪等地，"小罐子"闯出大市场，形成集养殖、用具、赛事于一体的蟋蟀文化产业。', '德州', '["省级非遗","德州","制陶","蟋蟀文化"]', 0, 'published', 'manual');
INSERT INTO craft_detail (item_id, craft_category, materials, tools, process, inheritors, representative_works, difficulty_level, learning_resources) VALUES ((SELECT id FROM cultural_item WHERE title='蟋蟀罐传统制作技艺（宁津）' AND category='craft'), '制陶', '黄河澄浆泥、细沙', '拉坯机/转轮、刮板、刻刀、模具、窑炉', '1. 澄泥：黄河泥加水沉淀取细泥
2. 练泥：揉练至细腻均匀
3. 制坯：拉坯或模制罐身
4. 修坯：刮光内外壁
5. 刻花：刻吉祥纹样
6. 烧制：低温烧成', '宁津蟋蟀罐制作艺人群体（代表性传承人姓名待考）', '澄浆泥蟋蟀罐、雕花蟋蟀罐、斗盆', 3, '宁津非遗工坊体验、蟋蟀文化市场研学');

-- [9] 泥塑（惠民泥塑）（滨州）来源: 中国非物质文化遗产网"泥塑（惠民泥塑）"（https://www.ihchina.cn/project_details/14051.html）；惠民县政府"惠民县的国家级非物质文化遗产代表性项目有哪些"（http://www.huimin.gov.cn/art/2025/7/8/art_320522_10422131.html）
DELETE FROM cultural_item WHERE title='泥塑（惠民泥塑）' AND category='craft';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('craft', '泥塑（惠民泥塑）', '国家级非遗，惠民河南张村"泥娃娃"泥塑及火把李庙会民俗。', '惠民泥塑是国家级非物质文化遗产（2021年入选，批次待考），以滨州惠民县河南张村最为著名。艺人取黄河胶泥捏塑"泥娃娃"，题材有胖娃娃、戏曲人物、飞禽走兽等，彩绘鲜艳、造型憨态可掬，多寓吉祥之意。每年农历二月二火把李庙会，泥娃娃集市延续数百年。当代惠民泥塑走进校园课堂与非遗工坊，"非遗+艺术"融合创新，让老手艺持续传承、不遗失。', '滨州', '["国家级非遗","滨州","泥塑","传统美术"]', 0, 'published', 'manual');
INSERT INTO craft_detail (item_id, craft_category, materials, tools, process, inheritors, representative_works, difficulty_level, learning_resources) VALUES ((SELECT id FROM cultural_item WHERE title='泥塑（惠民泥塑）' AND category='craft'), '泥塑', '黄河胶泥、麦秸、颜料（广告色/矿物色）', '捏塑刀、竹签、模具、画笔、晾架', '1. 取泥：采黄河胶泥掺麦秸揉练
2. 塑形：手捏或模具翻制坯体
3. 晾干：阴干防裂
4. 打磨：修整表面
5. 彩绘：白粉打底后上色', '惠民河南张村泥塑艺人群（火把李庙会传承脉络）', '泥娃娃（不倒翁）、戏曲人物泥塑、十二生肖泥塑', 2, '惠民火把李庙会、河南张村泥塑工坊体验');

-- [10] 柳编（博兴柳编）（滨州）来源: 大众日报"博兴柳编入选第三批国家级非遗名录"（https://paper.dzwww.com/dzrb/content/20110714/ArticelA09009MT.htm）；博兴县政府"草柳编一条街"（http://www.boxing.gov.cn/art/2026/2/25/art_117919_9427179.html）
DELETE FROM cultural_item WHERE title='柳编（博兴柳编）' AND category='craft';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('craft', '柳编（博兴柳编）', '国家级非遗，博兴"草柳编之乡"以柳条、蒲草编织器具的传统技艺。', '博兴柳编是国家级非物质文化遗产（第三批，2011），滨州博兴县为"中国草柳编之乡"。当地以柳条、蒲草、玉米皮为原料，编成提篮、箱包、工艺品等，技法有平编、绞编、勒编等数十种，制品柔韧耐用、天然环保。博兴草柳编已形成集种植、加工、电商销售于一体的产业集群，年产值可观、产品远销海外，湾头村等专业村落的"草柳编一条街"成为产业与文旅融合的样本。', '滨州', '["国家级非遗","滨州","编织","传统技艺"]', 0, 'published', 'manual');
INSERT INTO craft_detail (item_id, craft_category, materials, tools, process, inheritors, representative_works, difficulty_level, learning_resources) VALUES ((SELECT id FROM cultural_item WHERE title='柳编（博兴柳编）' AND category='craft'), '编织', '柳条、蒲草、玉米皮、棉绳', '剪刀、锥子、模具、压条器', '1. 备料：柳条去皮晾干、蒲草理顺
2. 浸泡：入水浸泡增加柔韧性
3. 起底：编出器物底部
4. 编身：自下而上编出器壁
5. 收口：编沿收边
6. 修饰：修剪毛刺、加配件', '博兴草柳编传承群体（湾头、锦秋一带编织艺人）', '柳编提篮、蒲草坐垫、草编工艺品、柳编箱包', 3, '博兴草柳编一条街体验、非遗工坊研学');

-- [11] 毛笔制作技艺（广饶齐笔制作技艺）（东营）来源: 山东省省级非物质文化遗产名录（毛笔制作技艺·广饶齐笔制作技艺）；大众日报"齐笔生花"（http://paper.dzwww.com/dzrb/data/20101105/html/12/content_1.html）
DELETE FROM cultural_item WHERE title='毛笔制作技艺（广饶齐笔制作技艺）' AND category='craft';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('craft', '毛笔制作技艺（广饶齐笔制作技艺）', '山东省级非遗，东营广饶"齐笔"与湖笔、宣笔齐名的制笔技艺。', '广饶齐笔制作技艺是山东省省级非物质文化遗产，流传于东营广饶县大王镇一带。齐笔古称"齐国笔"，与浙江湖笔、安徽宣笔等并称名笔，以"尖、齐、圆、健"四德著称。制笔选用优质狼毫、羊毫、紫毫，经选料、脱脂、梳理、扎毫、装管、修笔等百余道工序精制而成。当代齐笔依托广饶非遗展览、传承人工作室延续技艺，朱长春等艺人坚守制笔五十余载，齐笔产品远销海内外。', '东营', '["省级非遗","东营","制笔","传统技艺"]', 0, 'published', 'manual');
INSERT INTO craft_detail (item_id, craft_category, materials, tools, process, inheritors, representative_works, difficulty_level, learning_resources) VALUES ((SELECT id FROM cultural_item WHERE title='毛笔制作技艺（广饶齐笔制作技艺）' AND category='craft'), '制笔', '狼毫、羊毫、紫毫等兽毛、竹管/木管、胶', '梳笔梳、刀、针、缠线、胶锅', '1. 选毫：挑选兽毛分类
2. 脱脂：石灰水浸泡去脂
3. 梳理：梳齐毫毛
4. 扎毫：捆扎笔头
5. 装管：笔头装入笔杆
6. 修笔：修圆笔锋、定型', '郭明昌（省级非遗齐笔制作技艺第五代传承人）、朱长春等', '齐笔狼毫、齐笔羊毫、书法套装笔', 4, '广饶齐笔非遗展览/工作室体验、齐笔工坊研学');

-- [12] 黄河口芦苇画（东营）来源: 河口区文化馆"大美河口 多彩非遗·芦苇画"（http://dyhkwhg.com/news/html/?1552.html）；东营日报"芦苇'画'兔 迎新春"（https://news.dongyingnews.cn/system/2023/01/18/010793655.shtml）；省级资格待考
DELETE FROM cultural_item WHERE title='黄河口芦苇画' AND category='craft';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('craft', '黄河口芦苇画', '东营河口区非遗项目，以黄河口芦苇为材、烙烫成画的工艺。（省级待考）', '黄河口芦苇画是东营市河口区的非物质文化遗产代表性项目（市级，省级资格待考）。艺人取黄河入海口天然芦苇，经选料、剖秆、压平、剪贴、烙烫等工序制成画作，题材多取湿地风光、飞禽与民俗吉祥图案，画风自然质朴、富有黄河口地域特色。东营职业学院等院校开展芦苇手工艺活态传承，东营市文化馆开设非遗传习课程，芦苇画还常与生肖主题结合，成为黄河口特色文创与旅游伴手礼。', '东营', '["东营","芦苇画","贴画","黄河口文化"]', 0, 'published', 'manual');
INSERT INTO craft_detail (item_id, craft_category, materials, tools, process, inheritors, representative_works, difficulty_level, learning_resources) VALUES ((SELECT id FROM cultural_item WHERE title='黄河口芦苇画' AND category='craft'), '贴画', '芦苇秆、芦苇花、胶、相框', '剪刀、烙铁（电烙笔）、镊子、压平器、浆糊', '1. 选料：采黄河口芦苇
2. 剖秆压平：剖开秆皮压展
3. 剪贴：剪出形象拼贴
4. 烙烫：烙笔烫出明暗层次
5. 装裱：入框成画', '河口区芦苇画传承群体（代表性传承人姓名待考）', '黄河湿地风光画、芦苇烙画生肖摆件', 3, '东营市文化馆非遗传习课程、河口区文化馆体验');

-- 校验: SELECT category, region, COUNT(*) FROM cultural_item WHERE category='craft' GROUP BY region ORDER BY region;