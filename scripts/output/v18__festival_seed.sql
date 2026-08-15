-- V18: 九城五类数据采集 · festival 种子数据（生成自 scripts/gen_cultural_migration.mjs）
-- 幂等策略: 按 (category,title) 先删后插; detail 表 FK ON DELETE CASCADE 随主行级联删除
-- 数据来源: 见各条目下方注释, 采集于 2026-08; 存疑内容已标（待考）

-- [1] 菏泽国际牡丹文化旅游节（曹州牡丹花会）（菏泽）来源: 菏泽市人民政府网、山东宣传网及大众日报相关报道；菏泽牡丹文化旅游节大事记（heze.cn）
DELETE FROM cultural_item WHERE title='菏泽国际牡丹文化旅游节（曹州牡丹花会）' AND category='festival';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('festival', '菏泽国际牡丹文化旅游节（曹州牡丹花会）', '以“曹州牡丹甲天下”为根基的年度花会盛事，赏花、演艺与经贸交融，为黄河流域山东段春季最具人气的节庆。', '菏泽古称曹州，牡丹栽培历史逾千年（栽培上限年代待考），明清时已有“曹州牡丹甲于海内”之誉。1992年，菏泽举办首届国际牡丹花会，此后每年四月花开时节如期举行，今称菏泽国际牡丹文化旅游节，已历三十余届。节会以曹州牡丹园等万亩花海为核心，融赏花游园、文艺演出、书画笔会、非遗展示与经贸洽谈于一体，近年更以“非遗+牡丹”为特色，集中展演菏泽面塑、戏曲、剪纸等非遗项目。花会既是花乡民俗的活态展台，也是菏泽城市形象与牡丹产业走向全国的重要窗口。', '菏泽', '["节庆","牡丹","花会","菏泽","非遗展演"]', 0, 'published', 'manual');
INSERT INTO festival_detail (item_id, festival_date, origin, customs, food) VALUES ((SELECT id FROM cultural_item WHERE title='菏泽国际牡丹文化旅游节（曹州牡丹花会）' AND category='festival'), '每年4月中下旬至5月初（牡丹盛花期）', '源于曹州（今菏泽）千年牡丹栽培传统，明清时牡丹已成曹州名品；1992年举办首届菏泽国际牡丹花会，延续至今。', '赏花游园、牡丹摄影与书画笔会、戏曲及非遗展演、牡丹产品与文创市集', '牡丹宴（以牡丹入馔）及牡丹花茶、牡丹糕点等（具体席面待考）');

-- [2] 曲阜祭孔大典（济宁）来源: 中国非物质文化遗产网（ihchina.cn）祭孔大典条目；新华网、光明日报历年祭孔大典报道
DELETE FROM cultural_item WHERE title='曲阜祭孔大典' AND category='festival';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('festival', '曲阜祭孔大典', '曲阜孔庙举行的国家级非遗祭祀盛典，纪念孔子诞辰，佾舞雅乐、礼乐庄严，为儒家文化标志性仪式。', '祭孔之礼始于孔子卒后次年（公元前478年），历代相沿，至明清形成规制完备的“释奠礼”。祭孔大典已列入国家级非物质文化遗产名录（批次年份待考）。当代曲阜祭孔大典每年9月28日孔子诞辰日于孔庙大成殿前举行，依古礼行迎神、三献等仪程，佾舞雅乐、衣冠肃穆，并联动海内外文庙与孔学堂同步祭拜。大典既承“国之大事，在祀与戎”的礼乐传统，亦成为中华优秀传统文化当代传承与世界文明对话的标志性文化符号，彰显儒家“仁礼”精神。', '济宁', '["祭祀","儒家","非遗","曲阜","礼乐"]', 0, 'published', 'manual');
INSERT INTO festival_detail (item_id, festival_date, origin, customs, food) VALUES ((SELECT id FROM cultural_item WHERE title='曲阜祭孔大典' AND category='festival'), '每年9月28日（孔子诞辰纪念日）', '始于孔子卒后第二年的家祭，历代帝王尊崇祀孔，明清形成国家层面的释奠礼制；当代恢复公祭后每年于孔子诞辰日举行。', '迎神、三献礼、佾舞雅乐、诵读《论语》、海内外文庙联动公祭', '');

-- [3] 泰山东岳庙会（泰安）来源: 中国非物质文化遗产网“庙会（泰山东岳庙会）”条目；泰安市人民政府网；大众网历年庙会报道
DELETE FROM cultural_item WHERE title='泰山东岳庙会' AND category='festival';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('festival', '泰山东岳庙会', '国家级非遗泰山民俗盛会，以东岳大帝信仰为核，朝山进香、百戏云集，山上祀神、山下赶集。', '泰山东岳庙会源于泰山崇拜与东岳大帝信仰，随唐宋以来碧霞元君信仰的盛行而兴，明清时臻于鼎盛，是泰山最具代表性的民俗活动，已列入国家级非物质文化遗产名录（庙会类，批次年份待考）。传统会期以农历三月二十八东岳大帝诞辰为中心，当代庙会多于四月中下旬启会，会期数日至半月。庙会期间，朝山进香、祈福还愿与民间百戏、商贸集市交融，杂技曲艺、糖画面塑、泰山剪纸等非遗技艺竞相展演，形成“山上祀神、山下赶集”的独特文化景观，是泰山信仰与市井生活的生动联结。', '泰安', '["庙会","非遗","泰山","信仰","民俗"]', 0, 'published', 'manual');
INSERT INTO festival_detail (item_id, festival_date, origin, customs, food) VALUES ((SELECT id FROM cultural_item WHERE title='泰山东岳庙会' AND category='festival'), '农历三月二十八前后（当代多于4月中下旬启会）', '源于泰山崇拜与东岳大帝信仰，唐宋年间随香火兴盛形成庙会，明清鼎盛，传承至今。', '朝山进香、祭祀祈福、民间杂技戏曲展演、非遗市集、商贸集会', '泰山煎饼、豆腐脑等庙会小吃（具体摊档待考）');

-- [4] 临清庙会（古运河庙会）（聊城）来源: 华中师范大学“地方社会变迁与庙会社火传承”研究文献；新华网山东、临清市人民政府网“非遗过大年”系列报道
DELETE FROM cultural_item WHERE title='临清庙会（古运河庙会）' AND category='festival';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('festival', '临清庙会（古运河庙会）', '明清运河商埠遗风的正月庙会，社火锣鼓、商贸百戏云集，重现“古埠烟火”景象。', '临清为明清京杭大运河漕运重镇，清代“临清庙会不一而足”：城隍庙正月、腊月及五月二十八有会，五龙宫三月三有会，碧霞宫九月初有会（见地方史研究）。庙会随商埠繁盛而兴，融祭祀、商贸、娱乐于一体，是运河城市民俗的典型样本。当代临清庙会多集中于春节期间举办，以“非遗过大年”“冬游临清”贺年会等形式呈现，社火巡游、驾鼓锣鼓、戏曲曲艺与非遗市集云集，重现“古埠烟火”景象。当代庙会的固定名称与会期逐年调整，具体场次待考。', '聊城', '["庙会","运河","临清","社火","非遗"]', 0, 'published', 'manual');
INSERT INTO festival_detail (item_id, festival_date, origin, customs, food) VALUES ((SELECT id FROM cultural_item WHERE title='临清庙会（古运河庙会）' AND category='festival'), '每年春节期间（正月；传统会期因庙宇而异，待考）', '源于明清漕运商埠的祭祀与商贸集会传统，清代临清庙会众多，随运河兴衰而变迁。', '进香祈福、社火巡游、驾鼓表演、戏曲曲艺演出、非遗展示与商贸集市', '临清什香面等运河风味小吃（待考）');

-- [5] 临清驾鼓（新春社火锣鼓）（聊城）来源: 中国非物质文化遗产网“锣鼓艺术（临清驾鼓）”条目；聊城市文旅局、临清市人民政府发布
DELETE FROM cultural_item WHERE title='临清驾鼓（新春社火锣鼓）' AND category='festival';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('festival', '临清驾鼓（新春社火锣鼓）', '国家级非遗锣鼓艺术，运河古埠社火中的雄浑鼓声，春节庙会常闻，屡登央视舞台。', '临清驾鼓是流传于临清一带的民间锣鼓艺术，2021年以“锣鼓艺术（临清驾鼓）”列入第五批国家级非物质文化遗产代表性项目名录。相传其鼓声曾为古代将帅助阵扬威，又随京杭大运河商埠的庙会社火传承不息（具体形成年代待考）。驾鼓鼓点雄壮、队列齐整，多人同击大鼓、铙钹相和，气势撼人，多于春节、庙会及重大庆典中展演，屡登央视及省市级节庆舞台，是临清乃至聊城最具辨识度的民俗声音符号。', '聊城', '["非遗","锣鼓","社火","临清","民俗"]', 0, 'published', 'manual');
INSERT INTO festival_detail (item_id, festival_date, origin, customs, food) VALUES ((SELECT id FROM cultural_item WHERE title='临清驾鼓（新春社火锣鼓）' AND category='festival'), '春节、庙会及重大节庆期间展演', '源于古代军旅仪仗锣鼓，随运河商埠庙会社火传承，明清至近现代不绝（具体形成年代待考）。', '驾鼓列阵巡演、社火踩街、庙会助兴、节庆庆典展演', '');

-- [6] 趵突泉迎春花灯会（济南）来源: 山东宣传网《海右第一灯会》；大众日报、齐鲁晚报“半个多世纪济南年味”报道
DELETE FROM cultural_item WHERE title='趵突泉迎春花灯会' AND category='festival';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('festival', '趵突泉迎春花灯会', '“海右第一灯会”，泉城新春赏灯盛事，花灯映泉、流光溢彩，年味绵延半个多世纪。', '趵突泉迎春花灯会自1965年起办，已延续半个多世纪，被媒体誉为“海右第一灯会”。灯会依托趵突泉“泉涌灯明”的独特景致，于每年春节期间（腊月下旬至正月十五前后）在趵突泉公园举办，花灯依水而设、流光溢彩，融传统扎灯技艺与当代声光电于一体。灯会期间游人如织，猜灯谜、观民俗演出、品泉城年味相映成趣，是济南最具代表性的新春民俗节庆，也是北方城市灯会文化的经典样本。', '济南', '["灯会","春节","济南","花灯","民俗"]', 0, 'published', 'manual');
INSERT INTO festival_detail (item_id, festival_date, origin, customs, food) VALUES ((SELECT id FROM cultural_item WHERE title='趵突泉迎春花灯会' AND category='festival'), '每年春节期间（腊月下旬至正月十五前后）', '承济南上元赏灯古俗；现代灯会始于1965年，由趵突泉公园举办，历届不辍。', '赏灯游园、猜灯谜、民俗演出、非遗手作展示、夜游泉水', '元宵、糖葫芦等年节小吃');

-- [7] 千佛山重阳山会（千佛山庙会）（济南）来源: 齐鲁网、爱济南等媒体“延续700多年山会”报道；济南市文旅部门公开资料
DELETE FROM cultural_item WHERE title='千佛山重阳山会（千佛山庙会）' AND category='festival';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('festival', '千佛山重阳山会（千佛山庙会）', '延续七百余年的重阳登高庙会，登高赏菊、市集百戏，为泉城秋日标志性民俗盛景。', '千佛山山会源于重阳登高古俗与庙会传统，据媒体报道已延续七百余年。每年农历九月初九重阳节前后，济南人登千佛山望远怀亲、赏菊祈福，山道两侧摊贩云集，杂技曲艺、糖画面塑、风味小吃纷呈，形成“重阳山会”盛景。山会既有敬老孝亲的文化内涵，亦承载泉城市民的秋日休闲记忆，与趵突泉迎春花灯会遥相呼应，一春一秋，构成济南岁时民俗的两大标志性节会。', '济南', '["庙会","重阳","济南","登高","民俗"]', 0, 'published', 'manual');
INSERT INTO festival_detail (item_id, festival_date, origin, customs, food) VALUES ((SELECT id FROM cultural_item WHERE title='千佛山重阳山会（千佛山庙会）' AND category='festival'), '每年农历九月初九（重阳节）前后', '承古代重阳登高习俗与千佛山祭祀传统，历史已延续七百余年。', '登高祈福、赏菊、庙会集市、民俗杂技展演、敬老活动', '糖炒栗子、糖葫芦等山会小吃（待考）');

-- [8] 中国乐陵金丝小枣文化旅游节（德州）来源: 齐鲁网、大众网“第32届乐陵金丝小枣文化旅游节”报道；乐陵市政府及德州市政务公开信息
DELETE FROM cultural_item WHERE title='中国乐陵金丝小枣文化旅游节' AND category='festival';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('festival', '中国乐陵金丝小枣文化旅游节', '金丝小枣之乡乐陵的年度枣文化盛会，枣熟时节采摘品鉴，枣乡民俗与产业文旅交融。', '乐陵地处鲁北，为金丝小枣之乡，小枣栽培历史悠久，所产小枣“金丝万缕、香甜酥脆”，久负盛名。中国乐陵金丝小枣文化旅游节自1989年（据第32届于2020年举办推算）起每年9月枣熟时节举行，已历三十余届。节会以万亩枣林为舞台，融采摘体验、枣乡民俗展演、红枣品鉴与产业博览、文旅消费于一体，近年更与红枣健康食品产业博览会联动。节会是德州最具代表性的县域节庆，也是黄河流域枣文化与乡村振兴结合的生动样本。', '德州', '["节庆","枣文化","乐陵","德州","产业文旅"]', 0, 'published', 'manual');
INSERT INTO festival_detail (item_id, festival_date, origin, customs, food) VALUES ((SELECT id FROM cultural_item WHERE title='中国乐陵金丝小枣文化旅游节' AND category='festival'), '每年9月（枣熟时节）', '承乐陵枣乡种植传统与枣文化民俗；1989年举办首届金丝小枣节，延续至今。', '枣园采摘、枣乡民俗展演、红枣品鉴与产业博览、文旅市集', '乐陵金丝小枣、枣糕等枣制食品');

-- [9] 宁津蟋蟀文化节（暨杂技古会）（德州）来源: 宁津县人民政府网；人民网“山东宁津：杂技古会+蟋蟀文化”；大众日报相关报道
DELETE FROM cultural_item WHERE title='宁津蟋蟀文化节（暨杂技古会）' AND category='festival';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('festival', '宁津蟋蟀文化节（暨杂技古会）', '蟋蟀之乡宁津的秋日民俗盛会，斗蟋观战、蟋蟀交易与杂技古会同台，非遗民俗新名片。', '宁津素有“蟋蟀之乡”“杂技之乡”之誉，斗蟋风俗流传已久，宁津斗蟋已列入非遗保护名录（级别待考）。宁津蟋蟀文化节创办于2010年代（首届年份待考），已历十届（第十届于2024年举办），多在秋季斗蟋时节举行。节会期间斗蟋观战、蟋蟀交易与促消费活动并举；2024年首届“杂技古会”同期亮相，重现古会市集百戏景象，2026年又推出“杂技蟋蟀谷”艺术美食嘉年华。节会将蟋蟀民俗、杂技传统与文旅消费相融，是德州特色民俗节庆的新名片（会期逐年浮动，待考）。', '德州', '["节庆","斗蟋","杂技","宁津","民俗"]', 0, 'published', 'manual');
INSERT INTO festival_detail (item_id, festival_date, origin, customs, food) VALUES ((SELECT id FROM cultural_item WHERE title='宁津蟋蟀文化节（暨杂技古会）' AND category='festival'), '每年秋季（9—10月，逐年浮动，待考）', '承宁津斗蟋民俗与杂技之乡传统；2010年代创办蟋蟀文化节，2024年增设杂技古会。', '斗蟋观战、蟋蟀交易、杂技展演、古会市集、非遗美食体验', '宁津保店驴肉等地方名吃（待考）');

-- [10] 齐文化节（临淄）（淄博）来源: 临淄区政府网、山东省政府网“第二十二届齐文化节开幕”报道；淄博文明网
DELETE FROM cultural_item WHERE title='齐文化节（临淄）' AND category='festival';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('festival', '齐文化节（临淄）', '齐国故都临淄的年度文化盛典，祭齐祖、展蹴鞠，弘扬泱泱齐风，黄河流域文化底蕴深厚的城市节庆。', '淄博临淄为齐国故都，齐文化节自2004年起每年9月举行（第二十二届于2025年9月举办），是弘扬齐文化、展示故都风采的标志性节庆。节会以“泱泱齐风”为主题，设开幕式暨文艺演出、齐文化学术研讨、蹴鞠展演与体验（临淄为世界足球起源地，蹴鞠为国家级非遗）、非遗与文创市集等活动，并带动文旅经贸洽谈。齐文化节使“春秋五霸之首、战国七雄之一”的齐国历史文化走进当代，是黄河流域山东段最具文化底蕴的城市节庆之一。', '淄博', '["节庆","齐文化","临淄","蹴鞠","文化节"]', 0, 'published', 'manual');
INSERT INTO festival_detail (item_id, festival_date, origin, customs, food) VALUES ((SELECT id FROM cultural_item WHERE title='齐文化节（临淄）' AND category='festival'), '每年9月（通常9月12日前后开幕）', '为纪念齐国故都与姜太公、齐桓公等历史人物、弘扬齐文化而设，2004年创办。', '开幕式文艺演出、祭祀姜太公仪式（待考）、蹴鞠展演、齐文化论坛、非遗文创市集', '');

-- [11] 淄博国际聊斋文化旅游节（聊斋文化节）（淄博）来源: 中国新闻网2002年、2003年发布消息；2025年“五一”聊斋文化节新闻报道
DELETE FROM cultural_item WHERE title='淄博国际聊斋文化旅游节（聊斋文化节）' AND category='festival';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('festival', '淄博国际聊斋文化旅游节（聊斋文化节）', '蒲松龄故里淄川的聊斋文化嘉年华，五一假期体验志怪奇幻，民俗活化与文旅融合的典型。', '淄博国际聊斋文化旅游节创办于2002年（当年“五一”假期首办，2003年发布“国际”版本举办消息），在《聊斋志异》作者蒲松龄故里淄川区蒲家庄一带举行，多以“五一”假期为节期。节会以聊斋文化为魂，融聊斋园景区游览、情景剧与奇幻演艺、民俗市集、非遗展示于一体，近年以“聊斋文化节”“奇幻嘉年华”等名目持续举办（如2025年“五一”开幕的聊斋文化节）。节会将志怪文学的想象力转化为可游可感的文旅体验，是淄博文旅融合与民俗活化利用的典型代表。', '淄博', '["节庆","聊斋","淄川","蒲松龄","文旅"]', 0, 'published', 'manual');
INSERT INTO festival_detail (item_id, festival_date, origin, customs, food) VALUES ((SELECT id FROM cultural_item WHERE title='淄博国际聊斋文化旅游节（聊斋文化节）' AND category='festival'), '每年“五一”假期前后（4月底至5月初）', '依托蒲松龄故里与聊斋文化资源创办于21世纪初，历年以五一假期为节期。', '聊斋园游览、奇幻演艺、民俗市集、非遗体验、文创展销', '');

-- [12] 惠民胡集书会（滨州）来源: 中国非物质文化遗产网及央广网、中新网、大众日报历年“胡集书会”报道
DELETE FROM cultural_item WHERE title='惠民胡集书会' AND category='festival';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('festival', '惠民胡集书会', '“中国民间艺术活化石”，正月十二开锣的八百年曲艺大集，一日能看千台戏、四天可读万卷书。', '胡集书会于每年农历正月十二至十六前后在滨州市惠民县胡集镇举行，据称已有八百年传承历史（起源年代待考），已列入国家级非物质文化遗产名录（曲艺类，批次年份待考），被誉为“中国民间艺术活化石”。届时全国各地曲艺艺人云集胡集，鼓书、琴书、评书、快板等竞相献艺，素有“一日能看千台戏，四天可读万卷书”之誉，堪称中国北方民间曲艺的活态博物馆。当代书会兼设曲艺擂台、非遗市集与文旅活动，2026年书会于2月28日至3月4日举办，盛况再续。', '滨州', '["曲艺","非遗","书会","滨州","民俗"]', 0, 'published', 'manual');
INSERT INTO festival_detail (item_id, festival_date, origin, customs, food) VALUES ((SELECT id FROM cultural_item WHERE title='惠民胡集书会' AND category='festival'), '每年农历正月十二至十六前后', '相传源于元代说书艺人年节聚会（待考），明清成俗，历代相沿，今仍为全国性曲艺盛会。', '曲艺说书、曲艺擂台赛、非遗展演、民俗市集、文旅经贸活动', '');

-- [13] 黄河口开渔节（东营）来源: 大众日报、东营市政府网及黄河口新闻历年“开渔节”报道
DELETE FROM cultural_item WHERE title='黄河口开渔节' AND category='festival';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('festival', '黄河口开渔节', '黄蓝交汇处渔港的开海盛会，千帆竞发、祭海祈福，开海第一鲜热闹登场。', '每年9月1日黄渤海伏季休渔期结束，东营沿海渔港迎来开渔时节。2017年，垦利区红光渔港举办首届开渔节，此后延续为一年一度的渔港节庆（节名与会期逐年略有调整）。开渔节上，锣鼓齐鸣、千帆竞发，渔民以祭海祈福仪式祈愿鱼虾满仓、平安归来（祭海仪式细节待考）；开海首捕归航后，渔港码头随即举办海鲜美食节，梭子蟹、大虾、梭鱼等“开海第一鲜”供市民游客尝鲜。开渔节既承渔民敬海传统，也见证黄河入海口渔港经济的当代活力。', '东营', '["节庆","开渔","东营","渔港","黄河口"]', 0, 'published', 'manual');
INSERT INTO festival_detail (item_id, festival_date, origin, customs, food) VALUES ((SELECT id FROM cultural_item WHERE title='黄河口开渔节' AND category='festival'), '每年9月初（黄渤海开海前后）', '承渔民开海祭海传统；2017年首届开渔节于垦利红光渔港举办，延续至今。', '开海仪式、千帆出海、祭海祈福（待考）、海鲜美食节、渔港市集', '梭子蟹、开凌梭鱼等“开海第一鲜”');

-- [14] 中国孙子文化旅游节（广饶）（东营）来源: 东营市政府网；国际在线“第十七届孙子文化旅游节开幕”（2025年9月）报道
DELETE FROM cultural_item WHERE title='中国孙子文化旅游节（广饶）' AND category='festival';
INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES ('festival', '中国孙子文化旅游节（广饶）', '兵圣故里广饶的年度文旅盛典，金秋时节祭兵圣、论兵学，弘扬“知彼知己”的兵学智慧。', '东营广饶为兵圣孙武故里（孙武故里学界考证有争议，广饶说获较多认可，待考）。中国孙子文化旅游节每年9月10日至10月中旬举行，第十七届于2025年9月举办（首届年份据届数推算，待考）。节会设开幕式文艺演出、兵学文化研讨、孙子兵法主题展演与体验、非遗文创市集及文旅经贸活动，弘扬“知彼知己、百战不殆”的兵学智慧与齐地尚武文化。节会依托孙武湖、孙子文化园等载体，将兵圣文化转化为可游可学可体验的文旅产品，是东营最具辨识度的城市文化节庆品牌。', '东营', '["节庆","孙子文化","广饶","东营","兵学"]', 0, 'published', 'manual');
INSERT INTO festival_detail (item_id, festival_date, origin, customs, food) VALUES ((SELECT id FROM cultural_item WHERE title='中国孙子文化旅游节（广饶）' AND category='festival'), '每年9月10日至10月中旬', '依托广饶孙武故里文化资源创办于21世纪初（首届年份待考），为弘扬孙子兵学文化而设。', '开幕式演出、兵学研讨、兵法主题体验、非遗市集、文旅经贸活动', '');

-- 校验: SELECT category, region, COUNT(*) FROM cultural_item WHERE category='festival' GROUP BY region ORDER BY region;