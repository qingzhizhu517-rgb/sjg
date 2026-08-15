-- 民间文学种子数据（幂等：先删后插）
-- 生成自 scripts/generate_literature.py

DELETE FROM cultural_item WHERE title='孟姜女传说' AND category='literature';
INSERT INTO cultural_item (category, title, summary, content, region, tags, status, source) VALUES ('literature', '孟姜女传说', '中国四大民间传说之一，讲述孟姜女哭倒长城的故事。', '孟姜女传说是中国四大民间传说之一。相传秦朝时期，孟姜女的丈夫范喜良被征去修长城，多年未归。孟姜女千里寻夫，得知丈夫已死，悲痛欲绝，哭了三天三夜，竟把长城哭倒了一段。这个传说反映了古代劳动人民对暴政的控诉和对爱情忠贞的赞美。山东泰安、淄博等地都有孟姜女传说的流传版本。', '泰安', '["四大传说", "泰安", "爱情传说"]', 'draft', 'ai');

DELETE FROM literature_detail WHERE item_id = (SELECT id FROM cultural_item WHERE title='孟姜女传说' AND category='literature');
INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) VALUES ((SELECT id FROM cultural_item WHERE title='孟姜女传说' AND category='literature'), '传说', '山东泰安、淄博等地', '孟姜女、范喜良、秦始皇', '1. 范喜良新婚三日被征修长城
2. 孟姜女千里寻夫
3. 得知丈夫死讯，痛哭三天三夜
4. 哭倒长城八百里
5. 秦始皇欲纳其为妃
6. 孟姜女投海自尽', '反映了古代劳动人民对暴政的控诉，歌颂了忠贞不渝的爱情', '[]', '中国民间文学集成·山东卷');

DELETE FROM cultural_item WHERE title='梁祝传说' AND category='literature';
INSERT INTO cultural_item (category, title, summary, content, region, tags, status, source) VALUES ('literature', '梁祝传说', '中国四大民间传说之一，讲述梁山伯与祝英台的爱情故事。', '梁祝传说是中国四大民间传说之一。相传东晋时期，祝英台女扮男装外出求学，与梁山伯同窗三年。梁山伯不知祝英台是女子，待得知真相后，祝英台已被许配他人。梁山伯相思成疾而死，祝英台出嫁途中祭拜梁山伯墓，墓裂而入，双双化蝶。山东济宁等地有梁祝传说的流传版本。', '济宁', '["四大传说", "济宁", "爱情传说"]', 'draft', 'ai');

DELETE FROM literature_detail WHERE item_id = (SELECT id FROM cultural_item WHERE title='梁祝传说' AND category='literature');
INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) VALUES ((SELECT id FROM cultural_item WHERE title='梁祝传说' AND category='literature'), '传说', '山东济宁等地', '梁山伯、祝英台、马文才', '1. 祝英台女扮男装求学
2. 与梁山伯同窗三载
3. 梁山伯不知其为女子
4. 祝英台被许配马家
5. 梁山伯相思成疾而死
6. 祝英台祭墓，墓裂化蝶', '歌颂了忠贞不渝的爱情，反映了古代青年男女对自由恋爱的追求', '[]', '中国民间文学集成·山东卷');

DELETE FROM cultural_item WHERE title='泰山传说' AND category='literature';
INSERT INTO cultural_item (category, title, summary, content, region, tags, status, source) VALUES ('literature', '泰山传说', '关于泰山的神话传说，包括泰山老奶奶、碧霞元君等。', '泰山传说是关于泰山的神话传说。泰山被誉为五岳之首，自古就是帝王封禅之地。传说泰山老奶奶（碧霞元君）是泰山的主神，掌管人间生死福祸。泰山还有许多著名传说，如泰山石敢当、泰山挑夫等。这些传说反映了古代人民对自然的敬畏和对美好生活的向往。', '泰安', '["泰山", "泰安", "神话传说"]', 'draft', 'ai');

DELETE FROM literature_detail WHERE item_id = (SELECT id FROM cultural_item WHERE title='泰山传说' AND category='literature');
INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) VALUES ((SELECT id FROM cultural_item WHERE title='泰山传说' AND category='literature'), '传说', '山东泰安', '碧霞元君、泰山石敢当、泰山挑夫', '1. 碧霞元君修道成仙
2. 掌管泰山，庇佑众生
3. 泰山石敢当驱邪镇宅
4. 泰山挑夫坚韧不拔
5. 帝王封禅祭祀', '反映了古代人民对自然的敬畏，体现了中华民族的精神追求', '[]', '泰山民间故事集');

DELETE FROM cultural_item WHERE title='运河传说' AND category='literature';
INSERT INTO cultural_item (category, title, summary, content, region, tags, status, source) VALUES ('literature', '运河传说', '关于京杭大运河的民间传说，反映运河沿岸人民的生活。', '运河流传说是关于京杭大运河的民间传说。聊城是运河沿岸的重要城市，流传着许多与运河有关的传说。这些传说反映了运河沿岸人民的生活、劳动和爱情，展现了运河文化的丰富内涵。著名的传说包括运河龙王、运河纤夫、运河商帮等。', '聊城', '["运河", "聊城", "生活传说"]', 'draft', 'ai');

DELETE FROM literature_detail WHERE item_id = (SELECT id FROM cultural_item WHERE title='运河传说' AND category='literature');
INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) VALUES ((SELECT id FROM cultural_item WHERE title='运河传说' AND category='literature'), '传说', '山东聊城', '运河龙王、运河纤夫、运河商帮', '1. 运河龙王保佑航运平安
2. 运河纤夫艰辛劳作
3. 运河商帮闯荡江湖
4. 运河沿岸百姓生活
5. 运河文化交流融合', '反映了运河沿岸人民的生活，展现了运河文化的丰富内涵', '[]', '运河民间故事集');

DELETE FROM cultural_item WHERE title='黄河号子' AND category='literature';
INSERT INTO cultural_item (category, title, summary, content, region, tags, status, source) VALUES ('literature', '黄河号子', '黄河沿岸劳动人民在劳动中创作的民歌，节奏铿锵有力。', '黄河号子是黄河沿岸劳动人民在劳动中创作的民歌。在黄河航运、筑堤、抢险等劳动中，人们为了统一节奏、鼓舞士气，创作了各种号子。黄河号子节奏铿锵有力，歌词朴实生动，反映了黄河人民的勤劳勇敢和乐观精神。著名的有黄河船工号子、黄河夯歌等。', '东营', '["黄河", "东营", "劳动号子"]', 'draft', 'ai');

DELETE FROM literature_detail WHERE item_id = (SELECT id FROM cultural_item WHERE title='黄河号子' AND category='literature');
INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) VALUES ((SELECT id FROM cultural_item WHERE title='黄河号子' AND category='literature'), '歌谣', '山东东营、滨州等地', '黄河船工、黄河纤夫、黄河筑堤工', '1. 黄河船工拉纤行船
2. 黄河夯歌筑堤抢险
3. 号子统一劳动节奏
4. 歌词反映生活艰辛
5. 展现乐观精神', '反映了黄河人民的勤劳勇敢，展现了劳动人民的智慧和乐观精神', '[]', '黄河民间歌谣集');

DELETE FROM cultural_item WHERE title='孔融让梨' AND category='literature';
INSERT INTO cultural_item (category, title, summary, content, region, tags, status, source) VALUES ('literature', '孔融让梨', '孔子后裔孔融幼时让梨的故事，体现礼让美德。', '孔融让梨是孔子后裔孔融幼时的故事。孔融四岁时，与兄弟们一起吃梨，他每次都拿最小的。大人问他为什么，他说：''我年纪小，应该吃小的，大的留给哥哥们。''这个故事体现了中华民族礼让的传统美德，成为教育儿童的经典故事。孔融是孔子的二十世孙，山东曲阜人。', '济宁', '["孔子", "济宁", "美德故事"]', 'draft', 'ai');

DELETE FROM literature_detail WHERE item_id = (SELECT id FROM cultural_item WHERE title='孔融让梨' AND category='literature');
INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) VALUES ((SELECT id FROM cultural_item WHERE title='孔融让梨' AND category='literature'), '故事', '山东济宁曲阜', '孔融、孔融兄弟', '1. 孔融四岁与兄弟吃梨
2. 每次都拿最小的梨
3. 大人问其原因
4. 孔融说年纪小应吃小的
5. 体现礼让美德', '体现了中华民族礼让的传统美德，成为教育儿童的经典故事', '[]', '三字经故事');
