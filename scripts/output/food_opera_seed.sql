-- 饮食戏曲种子数据（幂等：先删后插）
-- 生成自 scripts/generate_food_opera.py

DELETE FROM cultural_item WHERE title='鲁菜' AND category='food_opera';
INSERT INTO cultural_item (category, title, summary, content, region, tags, status, source) VALUES ('food_opera', '鲁菜', '中国八大菜系之首，以咸鲜为主，注重火候，讲究原汁原味。', '鲁菜是中国八大菜系之首，也是历史最悠久、技法最丰富的菜系。鲁菜以咸鲜为主，注重火候，讲究原汁原味。鲁菜选料精细，刀工精湛，烹调方法多样，擅长爆、炒、烧、塌、焖等技法。鲁菜分为济南菜、胶东菜、孔府菜三大流派，各具特色。', '济南', '["八大菜系", "济南", "传统美食"]', 'published', 'ai');

DELETE FROM food_opera_detail WHERE item_id = (SELECT id FROM cultural_item WHERE title='鲁菜' AND category='food_opera');
INSERT INTO food_opera_detail (item_id, sub_category, cuisine_type, ingredients, preparation_method, representative_dishes, historical_origin, current_status, preservation_level) VALUES ((SELECT id FROM cultural_item WHERE title='鲁菜' AND category='food_opera'), 'food', '鲁菜', '海鲜、禽畜、蔬菜、豆制品、面食', '爆、炒、烧、塌、焖、扒、溜、炸、烩等', '糖醋鲤鱼、九转大肠、葱烧海参、油焖大虾、德州扒鸡', '鲁菜起源于春秋战国时期，历经秦汉、隋唐、明清不断发展完善', '鲁菜作为中国八大菜系之首，在国内外享有盛誉', '国家级非物质文化遗产');

DELETE FROM cultural_item WHERE title='德州扒鸡' AND category='food_opera';
INSERT INTO cultural_item (category, title, summary, content, region, tags, status, source) VALUES ('food_opera', '德州扒鸡', '德州三宝之一，以五香脱骨、肉嫩味纯著称。', '德州扒鸡是德州三宝之一，以五香脱骨、肉嫩味纯著称。德州扒鸡始于明代，至今已有300多年历史。制作工艺独特，需经过宰杀、整形、油炸、卤煮等多道工序。成品色泽金黄，肉质鲜嫩，骨酥肉烂，香气扑鼻。', '德州', '["德州", "传统美食", "中华老字号"]', 'published', 'ai');

DELETE FROM food_opera_detail WHERE item_id = (SELECT id FROM cultural_item WHERE title='德州扒鸡' AND category='food_opera');
INSERT INTO food_opera_detail (item_id, sub_category, cuisine_type, ingredients, preparation_method, representative_dishes, historical_origin, current_status, preservation_level) VALUES ((SELECT id FROM cultural_item WHERE title='德州扒鸡' AND category='food_opera'), 'food', '鲁菜', '整鸡、香料（八角、桂皮、丁香、砂仁等）、酱油、盐', '宰杀、整形、油炸、卤煮、焖制', '德州扒鸡', '德州扒鸡始于明代，相传乾隆皇帝南巡时曾品尝并赞誉', '德州扒鸡已成为中国驰名商标，远销国内外', '国家级非物质文化遗产');

DELETE FROM cultural_item WHERE title='周村烧饼' AND category='food_opera';
INSERT INTO cultural_item (category, title, summary, content, region, tags, status, source) VALUES ('food_opera', '周村烧饼', '淄博周村传统名点，以薄、香、酥、脆著称。', '周村烧饼是淄博周村传统名点，以薄、香、酥、脆著称。周村烧饼起源于汉代，至今已有1800多年历史。制作工艺独特，需经过和面、揉剂、成型、烘烤等多道工序。成品薄如纸，酥如雪，香如兰，口感酥脆，回味无穷。', '淄博', '["淄博", "传统美食", "中华老字号"]', 'published', 'ai');

DELETE FROM food_opera_detail WHERE item_id = (SELECT id FROM cultural_item WHERE title='周村烧饼' AND category='food_opera');
INSERT INTO food_opera_detail (item_id, sub_category, cuisine_type, ingredients, preparation_method, representative_dishes, historical_origin, current_status, preservation_level) VALUES ((SELECT id FROM cultural_item WHERE title='周村烧饼' AND category='food_opera'), 'food', '鲁点', '面粉、芝麻、糖、盐、花生油', '和面、揉剂、成型、烘烤', '周村烧饼', '周村烧饼起源于汉代，明清时期成为贡品', '周村烧饼已成为中国驰名商标，远销国内外', '省级非物质文化遗产');

DELETE FROM cultural_item WHERE title='煎饼卷大葱' AND category='food_opera';
INSERT INTO cultural_item (category, title, summary, content, region, tags, status, source) VALUES ('food_opera', '煎饼卷大葱', '山东传统主食，以杂粮煎饼卷大葱、蘸酱食用。', '煎饼卷大葱是山东传统主食，以杂粮煎饼卷大葱、蘸酱食用。山东煎饼历史悠久，相传孟姜女哭长城时带的就是煎饼。煎饼以小米、玉米、高粱等杂粮为原料，摊制而成。食用时卷上大葱、蘸上酱料，简单美味，营养丰富。', '临沂', '["临沂", "传统美食", "地方小吃"]', 'published', 'ai');

DELETE FROM food_opera_detail WHERE item_id = (SELECT id FROM cultural_item WHERE title='煎饼卷大葱' AND category='food_opera');
INSERT INTO food_opera_detail (item_id, sub_category, cuisine_type, ingredients, preparation_method, representative_dishes, historical_origin, current_status, preservation_level) VALUES ((SELECT id FROM cultural_item WHERE title='煎饼卷大葱' AND category='food_opera'), 'food', '鲁菜', '小米、玉米、高粱等杂粮、大葱、酱料', '磨面、摊制、卷料、蘸酱', '煎饼卷大葱', '山东煎饼历史悠久，相传孟姜女哭长城时带的就是煎饼', '煎饼卷大葱是山东人民日常主食，深受喜爱', '市级非物质文化遗产');

DELETE FROM cultural_item WHERE title='吕剧' AND category='food_opera';
INSERT INTO cultural_item (category, title, summary, content, region, tags, status, source) VALUES ('food_opera', '吕剧', '山东省地方戏曲剧种，以优美动听的唱腔著称。', '吕剧是山东省地方戏曲剧种，起源于东营广饶地区。吕剧以优美动听的唱腔著称，唱腔以''四平腔''为基本曲调，旋律优美，节奏明快。吕剧表演朴实自然，贴近生活，深受山东人民喜爱。代表剧目有《李二嫂改嫁》《姊妹易嫁》等。', '东营', '["东营", "地方戏曲", "国家级非遗"]', 'published', 'ai');

DELETE FROM food_opera_detail WHERE item_id = (SELECT id FROM cultural_item WHERE title='吕剧' AND category='food_opera');
INSERT INTO food_opera_detail (item_id, sub_category, cuisine_type, ingredients, preparation_method, representative_dishes, historical_origin, current_status, preservation_level) VALUES ((SELECT id FROM cultural_item WHERE title='吕剧' AND category='food_opera'), 'opera', '吕剧', '演员、乐队（坠琴、扬琴、二胡等）、服装道具', '唱、念、做、打，以唱为主', '《李二嫂改嫁》《姊妹易嫁》《小姑贤》', '吕剧起源于清代末年，由山东琴书发展而来', '吕剧是国家级非物质文化遗产，在山东各地广泛流传', '国家级非物质文化遗产');

DELETE FROM cultural_item WHERE title='山东快书' AND category='food_opera';
INSERT INTO cultural_item (category, title, summary, content, region, tags, status, source) VALUES ('food_opera', '山东快书', '山东省传统曲艺形式，以节奏明快、语言幽默著称。', '山东快书是山东省传统曲艺形式，以节奏明快、语言幽默著称。山东快书起源于清代，由民间说唱艺术发展而来。表演者手持竹板，边打边说，节奏明快，语言生动。代表曲目有《武松传》《鲁达除霸》等。', '济南', '["济南", "传统曲艺", "国家级非遗"]', 'published', 'ai');

DELETE FROM food_opera_detail WHERE item_id = (SELECT id FROM cultural_item WHERE title='山东快书' AND category='food_opera');
INSERT INTO food_opera_detail (item_id, sub_category, cuisine_type, ingredients, preparation_method, representative_dishes, historical_origin, current_status, preservation_level) VALUES ((SELECT id FROM cultural_item WHERE title='山东快书' AND category='food_opera'), 'opera', '山东快书', '表演者、竹板、服装', '说、唱、表演，以说为主', '《武松传》《鲁达除霸》《马寡妇开店》', '山东快书起源于清代，由民间说唱艺术发展而来', '山东快书是国家级非物质文化遗产，在山东各地广泛流传', '国家级非物质文化遗产');

DELETE FROM cultural_item WHERE title='柳子戏' AND category='food_opera';
INSERT INTO cultural_item (category, title, summary, content, region, tags, status, source) VALUES ('food_opera', '柳子戏', '山东省地方戏曲剧种，以粗犷豪放的唱腔著称。', '柳子戏是山东省地方戏曲剧种，以粗犷豪放的唱腔著称。柳子戏起源于明代，由民间小调发展而来。唱腔以''柳子调''为主，旋律高亢激昂，表演粗犷豪放。代表剧目有《白兔记》《金锁记》等。', '菏泽', '["菏泽", "地方戏曲", "国家级非遗"]', 'published', 'ai');

DELETE FROM food_opera_detail WHERE item_id = (SELECT id FROM cultural_item WHERE title='柳子戏' AND category='food_opera');
INSERT INTO food_opera_detail (item_id, sub_category, cuisine_type, ingredients, preparation_method, representative_dishes, historical_origin, current_status, preservation_level) VALUES ((SELECT id FROM cultural_item WHERE title='柳子戏' AND category='food_opera'), 'opera', '柳子戏', '演员、乐队（柳琴、笛子、唢呐等）、服装道具', '唱、念、做、打，以唱为主', '《白兔记》《金锁记》《孙安动本》', '柳子戏起源于明代，由民间小调发展而来', '柳子戏是国家级非物质文化遗产，在菏泽等地流传', '国家级非物质文化遗产');
