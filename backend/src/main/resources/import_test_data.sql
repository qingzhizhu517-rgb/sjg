USE sjg;

-- Clean existing test data first to prevent duplicate errors if run multiple times
DELETE FROM poem_event;
DELETE FROM poem;
DELETE FROM event;
DELETE FROM poet;
DELETE FROM scenic_spot;

-- 1. Scenic Spots
INSERT INTO scenic_spot (id, name, description, longitude, latitude, address, image_url, image_anime_url, region) VALUES
(1, '趵突泉', '趵突泉位列济南“七十二名泉”之首，被誉为“天下第一泉”。泉水清澈见底，三股泉水喷涌而出，昼夜不停，是济南泉水文化的标志。', 117.0156000, 36.6618000, '山东省济南市历下区趵突泉南路1号', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/baotu_spring.jpg', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/baotu_spring_anime.jpg', '济南'),
(2, '大明湖', '大明湖是由济南众多泉水汇流而成的天然湖泊，湖面宽阔，荷花满塘。古有“四面荷花三面柳，一城山色半城湖”的美誉，是历代文人雅聚的核心场所。', 117.0256000, 36.6733000, '山东省济南市历下区大明湖路271号', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/daming_lake.jpg', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/daming_lake_anime.jpg', '济南'),
(3, '泰山', '泰山为五岳之首，自古被视为国家昌盛、民族团结的象征。山势雄伟壮丽，历代帝王在此封禅，文人骚客在此留下了数以千计的碑刻与诗歌。', 117.1043000, 36.2562000, '山东省泰安市泰山区红门路', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/mount_tai.jpg', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/mount_tai_anime.jpg', '泰安'),
(4, '曲阜三孔', '曲阜的孔庙、孔府、孔林合称“三孔”，是纪念与祭祀孔子的圣地，也是儒家文化的核心载体。其古建筑群宏伟壮丽，碑刻林立，文化底蕴极其深厚。', 116.9897000, 35.5910000, '山东省曲阜市神道街', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/three_confucius.jpg', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/three_confucius_anime.jpg', '济宁'),
(5, '黄河入海口', '黄河在这里汇入渤海，呈现出“黄蓝交汇”的自然奇观。这里拥有世界上最完整、最年轻的湿地生态系统，是感受“黄河之水天上来，奔流到海不复还”最终归宿的绝佳地点。', 119.1600000, 37.7500000, '山东省东营市垦利区黄河三角洲国家级自然保护区', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/yellow_river_estuary.jpg', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/yellow_river_estuary_anime.jpg', '东营'),
(6, '光岳楼', '光岳楼是国家历史文化名城聊城的象征，建于明代洪武年间，是一座雄伟的木构楼阁。它地处东昌古城中央，可俯瞰整个古城与东昌湖风光。', 115.9863000, 36.4526000, '山东省聊城市东昌府区古城中央', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/guangyue_tower.jpg', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/guangyue_tower_anime.jpg', '聊城'),
(7, '蒲松龄纪念馆', '位于淄博市淄川区蒲家庄，依托蒲松龄故居而建。馆内有著名的“柳泉”，是蒲松龄当年设茶采风、创作《聊斋志异》的原址。', 118.0125000, 36.6540000, '山东省淄博市淄川区蒲家庄', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/pu_manor.jpg', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/pu_manor_anime.jpg', '淄博'),
(8, '苏禄王墓', '坐落于德州市北部，是安葬明代来华访问的古苏禄国（今菲律宾）东王巴都葛叭答剌的陵墓，见证了海上丝绸之路与中外友好往来的辉煌历史。', 116.3056000, 37.4721000, '山东省德州市德城区', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/sulu_tomb.jpg', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/sulu_tomb_anime.jpg', '德州'),
(9, '魏氏庄园', '位于滨州市惠民县，是清代布局独特的城堡式民居建筑群。庄园融合了北京四合院与军事防御堡垒的设计，是黄河下游鲁北平原上一颗璀璨的民居明珠。', 117.5256000, 37.3733000, '山东省滨州市惠民县魏集镇', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/wei_manor.jpg', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/wei_manor_anime.jpg', '滨州'),
(10, '曹州牡丹园', '位于菏泽市牡丹区，是世界上面积最大、品种最多的牡丹主题公园。菏泽古称曹州，以牡丹甲天下，历代文人墨客在此留下了无数赏花赞花的诗作。', 115.4856000, 35.2633000, '山东省菏泽市牡丹区人民路', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/peony_garden.jpg', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/peony_garden_anime.jpg', '菏泽');

-- 2. Poets
INSERT INTO poet (id, name, dynasty_id, birth_year, death_year, birthplace, biography, avatar_url, avatar_anime_url, style) VALUES
(1, '李白', 4, 701, 762, '陇西成纪（今甘肃秦安）', '字太白，号青莲居士，唐代伟大的浪漫主义诗人，被后人誉为“诗仙”。他曾多次游历山东（齐鲁大地），并在济南、泰山、任城（今济宁）等地留下了大量脍炙人口的诗篇，与杜甫在齐鲁相会更是中国文学史上的一段佳话。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/li_bai.jpg', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/li_bai_anime.jpg', '浪漫主义、豪放飘逸、雄奇奔放'),
(2, '杜甫', 4, 712, 770, '河南巩县（今河南巩义）', '字子美，自号少陵野老，唐代伟大的现实主义诗人，被世人尊为“诗圣”，其诗被称为“诗史”。青年时期曾游历齐鲁，写下了气吞山河的《望岳》。在历下（今济南）大明湖畔与高适、李邕等人聚会，留下了“海右此亭古，济南名士多”的千古名句。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/du_fu.jpg', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/du_fu_anime.jpg', '现实主义、沉郁顿挫、忧国忧民'),
(3, '李清照', 5, 1084, 1155, '齐州章丘（今山东济南章丘）', '号易安居士，宋代女词人，婉约词派代表，有“千古第一才女”之称。她出生于济南，青年时期在济南度过了无忧无虑的美好时光，其词作多写溪亭日暮、藕花深处等济南风光，其清丽典雅的风格成为济南文学景观的重要底色。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/li_qingzhao.jpg', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/li_qingzhao_anime.jpg', '婉约清丽、情深意切、细腻委婉'),
(4, '辛弃疾', 5, 1140, 1207, '历城（今山东济南）', '字幼安，号稼轩，南宋豪放派词人、将领，与苏轼合称“苏辛”，与李清照并称“济南二安”。他出生于金国沦陷区，青年时期在山东聚众起义投奔南宋。其词作慷慨激昂，充满收复失地的满腔热血和报国无门的壮志难酬。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/xin_qiji.jpg', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/xin_qiji_anime.jpg', '豪放雄壮、慷慨悲凉、气势磅礴'),
(5, '赵孟頫', 6, 1254, 1322, '吴兴（今浙江湖州）', '字子昂，号松雪道人，元代著名画家、书法家、诗人。曾任同知济南路总管府事，在济南任职期间，他深深被济南的山水风光所吸引，创作了大量描绘济南山水的书画与诗歌，其中以《鹊华秋色图》和《趵突泉》诗最为著名。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/zhao_mengfu.jpg', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/zhao_mengfu_anime.jpg', '清丽典雅、意境深远、文质彬彬'),
(6, '蒲松龄', 8, 1640, 1715, '山东淄川（今淄博市淄川区）', '字留仙，一字剑臣，别号柳泉居士，世称聊斋先生，清代杰出的小说家、诗人。他在家乡淄博撰写了名扬世界的文言短篇小说集《聊斋志异》。蒲松龄一生多在家乡及周边游历讲学，其诗文词曲也极具齐鲁地方文化特色。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/pu_songling.jpg', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/poets/pu_songling_anime.jpg', '幽沉奇幻、通俗生动、写实与浪漫结合');

-- 3. Poems
INSERT INTO poem (id, title, content, poet_id, dynasty_id, spot_id, annotation, background, audio_url, video_url, sentiment_tags) VALUES
(1, '望岳', '岱宗夫如何？齐鲁青未了。\n造化钟神秀，阴阳割昏晓。\n荡胸生曾云，决眦入归鸟。\n会当凌绝顶，一览众山小。', 2, 4, 3, '【岱宗】泰山亦名岱山，为五岳之首，故尊为岱宗。\n【齐鲁青未了】唐代齐鲁两国以泰山为界，青未了指泰山绵延不绝，青翠之色不尽。\n【造化】指大自然。\n【钟】聚集。\n【割】划分。\n【决眦】眦，眼角。决，裂开。形容极力张大眼睛看。\n【会当】终当，必定。', '这首诗是杜甫开元二十四年（736年）游历齐鲁时所写。当时诗人二十四岁，正值风华正茂，科举考试落第后漫游吴越、齐鲁。面对雄伟壮丽的泰山，诗人满怀豪情，写下了这首气象万千、传诵千古的杰作，展现了年轻杜甫昂扬向上、志存高远的博大胸怀。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/audio/wang_yue.mp3', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/wang_yue.mp4', '["豪放", "雄奇", "壮志"]'),
(2, '陪李北海宴历下亭', '东藩驻皂盖，北海阁清尊。\n风幕双流急，沙园万井分。\n海右此亭古，济南名士多。\n云山已发兴，玉佩伫招魂。\n斐回作行乐，但歌宴余温。', 2, 4, 2, '【李北海】即李邕，曾任北海太守，当时名噪一时的文学家和书法家。\n【历下亭】位于济南大明湖畔。\n【海右】古人以东为右，海右指山东或济南一带。\n【伫】等待。', '天宝四年（745年）夏，杜甫在齐鲁漫游期间，与李北海（李邕）、高适等人同宴于济南大明湖的历下亭。席间杜甫有感于历下名士之多与古亭之幽，写下了这首宴集诗，其中“海右此亭古，济南名士多”成为了济南最具代表性的城市文化名片。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/audio/lishi_ting.mp3', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/lishi_ting.mp4', '["雅致", "宴乐", "怀古"]'),
(3, '如梦令·常记溪亭日暮', '常记溪亭日暮，沉醉不知归路。\n兴尽晚回舟，误入藕花深处。\n争渡，争渡，惊起一滩鸥鹭。', 3, 5, 2, '【溪亭】济南名胜。宋代建有溪亭，临近泉水。\n【沉醉】大醉。\n【争渡】争着划船过渡。\n【鸥鹭】水鸟名。', '这首词是李清照早期的代表作，写于她出嫁前居住在济南的少女时期。词中生动地回忆了某次在大明湖畔或郊外溪流中划船游玩，因饮酒大醉而迷路，误入荷花丛中，惊飞水鸟的欢乐场景，充满活泼的青春气息，极具生活情趣。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/audio/rumengling.mp3', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/rumengling.mp4', '["婉约", "恬淡", "欢愉"]'),
(4, '趵突泉', '泺水发源天下无，平地涌出白玉壶。\n谷虚久恐元气泄，岁旱不愁东海枯。\n云雾润蒸华不注，波澜声震大明湖。\n时来泉上濯尘土，冰雪满怀清兴孤。', 5, 6, 1, '【泺（luò）水】指趵突泉的泉水，古称泺水。\n【白玉壶】形容泉水洁白晶莹，从平地涌出，如同白玉雕成的壶。\n【华不注】山名，即华山，位于济南市东北部。\n【大明湖】济南名胜，趵突泉水汇入大明湖。\n【濯（zhuó）】洗涤。', '这首诗是元代著名书画家赵孟頫任职济南期间创作的。他在泉畔游玩，被趵突泉平地泉水喷涌如白玉壶、声势震天的壮丽景观所震撼，提笔写下了这首七律，不仅笔力雄健，而且其中“云雾润蒸华不注，波澜声震大明湖”一联更是对济南山水关联的绝妙写照。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/audio/baotu_spring_zhao.mp3', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/baotu_spring_zhao.mp4', '["清丽", "豪放", "写景"]'),
(5, '鲁郡东石门送杜二甫', '醉别复几日，登临遍池台。\n何时石门路，重有金樽开。\n秋波落泗水，海色明徂徕。\n飞蓬各自远，且尽手中杯。', 1, 4, 4, '【鲁郡】即兖州，治所在今山东兖州，辖曲阜等地。\n【泗水】水名，流经曲阜、兖州等地。\n【徂徕】山名，在今山东泰安东南。\n【飞蓬】一种随风飘荡的蓬草，比游子行踪无定。', '唐玄宗天宝四载（745年）秋天，李白与杜甫在齐鲁大地同游结束。杜甫将西去长安，李白将下江东。两人在鲁郡东面的石门山（今曲阜东北）分手，李白在临别时写下这首诗。这是两位伟大诗人文学史上的最后一次会面，此后天各一方，再未相见。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/audio/shimen_send.mp3', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/shimen_send.mp4', '["豪放", "深情", "惜别"]'),
(6, '柳泉消夏杂咏', '一曲清泉数行柳，闲中消夏胜于秋。\n月黑忽来星一点，流萤飞上读书灯。', 6, 8, 7, '【一曲清泉数行柳】描写了柳泉溢水成溪、柳树环抱的幽雅风光。\n【流萤飞上读书灯】写夜里读书时，萤火虫像一颗微小的星星一样飞落在书灯上的美丽画面，表现了诗人安贫乐道、沉浸于读书写作的清雅心境。', '这首诗写于蒲松龄的故乡淄博淄川蒲家庄。蒲松龄在柳泉畔结庐读书，并在泉边设茶招待路人，搜集奇闻异事，最终创作了《聊斋志异》。本诗生动再现了他在柳泉畔消夏读书的静谧氛围。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/audio/liuquan_xiaoxia.mp3', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/liuquan_xiaoxia.mp4', '["恬淡", "幽静", "写实"]'),
(7, '陪从祖济南太守泛鹊山湖三首（其三）', '水入北湖去，舟从南浦回。\n遥看鹊山转，却似送人来。', 1, 4, 2, '【鹊山湖】古湖名，在今济南鹊山下。\n【北湖】指大明湖及以北的水域。\n【南浦】泛指送别之地或小码头。', '唐代天宝年间，李白游历济南时，陪同他的从祖（堂祖父，时任济南太守）乘舟游览鹊山湖（今济南大明湖及鹊山一带），写下了这首五言绝句。诗中把山水倒转、行舟如飞的动感写得极其空灵，展现了济南黄河附近湖光山色的清秀之美。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/audio/queshan_lake.mp3', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/queshan_lake.mp4', '["清新", "空灵", "写景"]'),
(8, '将进酒', '君不见黄河之水天上来，奔流到海不复还。\n君不见高堂明镜悲白发，朝如青丝暮成雪。\n人生得意须尽欢，莫使金樽空对月。\n天生我材必有用，千金散尽还复来。\n烹羊宰牛且为乐，会须一饮三百杯。\n岑夫子，丹丘生，将进酒，杯莫停。\n与君歌一曲，请君为我倾耳听。\n钟鼓馔玉不足贵，但愿长醉不复醒。\n古来圣贤皆寂寞，惟有饮者留其名。\n陈王昔时宴平乐，斗酒十千恣欢谑。\n主人何为言少钱，径须沽取对君酌。\n五花马，千金裘，\n呼儿将出换美酒，与尔同销万古愁。', 1, 4, 5, '【天上来】指黄河发源于极高的高原，气势磅礴，宛如从天而降。\n【到海】黄河流经山东，注入渤海。\n【岑夫子】岑勋，李白好友。\n【丹丘生】元丹丘，李白好友，隐士。\n【钟鼓馔玉】形容富贵人家的奢华生活。', '《将进酒》约创作于唐天宝十一年（752年）左右。当时李白与好友元丹丘、岑勋在颍阳聚会。李白此时已被排挤出长安数年，政治抱负无法施展，满怀怀才不遇的悲愤，借酒兴写下了这首气吞山河的千古杰作。开头“奔流到海不复还”形象地概括了黄河最终在山东注入大海的壮阔历程。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/audio/qiangjinjiu.mp3', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/video/qiangjinjiu.mp4', '["豪放", "悲壮", "洒脱"]');

-- 4. Events
INSERT INTO event (id, title, description, dynasty_id, year, significance, image_url) VALUES
(1, '李杜齐鲁相会', '天宝三载（744年）至天宝四载（745年），“诗仙”李白与“诗圣”杜甫在洛阳相识后，同游梁宋（今河南开封、商丘），并先后两次来到山东齐鲁大地。他们同游济南大明湖、泰山、泗水等地，携手登高、饮酒赋诗，度过了一段真挚的文学交游时光。最终在曲阜东石门山依依惜别。', 4, 745, '中国文学史上最伟大的双子星的相遇与同游，代表了盛唐气象下文人交往的巅峰，留下了《鲁郡东石门送杜二甫》、《陪李北海宴历下亭》等传世名篇，对山东段黄河流域的文学地标构建具有奠基性意义。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/events/lidu_meeting.jpg'),
(2, '赵孟頫出任济南总管', '元世祖至元二十九年（1292年），著名书画家赵孟頫出任同知济南路总管府事。在任三年期间，他深入考察济南的山川泉水，写下了《趵突泉》等描绘泉城风光的诗歌。并在离任后根据记忆绘制了中国艺术史上著名的《鹊华秋色图》，展现济南鹊山和华不注山一带的清丽风光。', 6, 1292, '极大地提升了济南泉水与山水在全国文学艺术界的地位，其创作的《鹊华秋色图》和诗歌成为济南最具标志性的艺术文化名片之一。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/events/zhao_jinan.jpg'),
(3, '蒲松龄柳泉设茶采风', '清康熙年间，蒲松龄在故乡淄川（今淄博市淄川区）的柳泉（又称满井）旁设立茅亭，为过往行人免费提供茶水，只求路人讲述听闻的民间怪异故事或传说。他以此积累了大量的创作素材，并在其“聊斋”中挑灯夜战，历时数十年创作出中国文言小说巅峰之作《聊斋志异》。', 8, 1679, '开启了中国古典文学史上独特的“民间采风”与“文人再创作”模式，使淄博柳泉成为聊斋文化的核心发源地，构建了极具鲁中特色的神秘浪漫文学景观。', 'https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/events/pu_gathering.jpg');

-- 5. Poem-Event Relations
INSERT INTO poem_event (poem_id, event_id) VALUES
(1, 1), -- 《望岳》 -> 李杜齐鲁相会
(2, 1), -- 《陪李北海宴历下亭》 -> 李杜齐鲁相会
(4, 2), -- 《趵突泉》（赵孟頫） -> 赵孟頫出任济南总管
(5, 1), -- 《鲁郡东石门送杜二甫》 -> 李杜齐鲁相会
(6, 3); -- 《柳泉消夏杂咏》 -> 蒲松龄柳泉设茶采风
