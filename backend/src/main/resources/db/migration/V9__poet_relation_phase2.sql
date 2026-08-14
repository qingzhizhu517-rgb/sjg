-- V9: 诗人关系图谱补全(Phase2) + 蒲松龄事件诗词关联
-- 背景: 全库仅 13 条 seed 关系(且 id=25 的赵孟頫-元好问"交游"不成立: 元好问卒于1257, 赵孟頫生于1254, 二人无交集),
--       poem_event 仅 9 条且 event 3(蒲松龄柳泉) 无任何诗词支撑。
-- 内容:
--   1) 删除不成立的待定关系(原 id=25)
--   2) 新增 19 条 seed 关系(史实可考: 师承/亲属/并称/交游)
--   3) 新增 4 条 derived 关系(同朝代同区域且生卒年重叠的山东元代名士 + 同题共咏东阿的元末诗人)
--   4) poem_event 补充 event 3 的蒲松龄诗词(均出自《聊斋诗集》)
-- 幂等: INSERT ... ON DUPLICATE KEY UPDATE(依赖 uk_pair_type 唯一键) + WHERE NOT EXISTS; 可重复执行。
-- 应用: python3 scripts/apply_migration.py backend/src/main/resources/db/migration/V9__poet_relation_phase2.sql

-- 1) 删除待定关系: 赵孟頫(元,1254-1322) 与 元好问(金,1190-1257) 非同时代, "交游"不成立
DELETE FROM poet_relation WHERE poet_a_id = 5 AND poet_b_id = 7 AND relation_type = '交游';

-- 2) seed 关系补充(poet_a_id < poet_b_id)
INSERT INTO poet_relation (poet_a_id, poet_b_id, relation_type, description, source) VALUES
  (24, 25,  '师承', '方孝孺师从宋濂(明初)',                      'seed'),
  (31, 129, '师承', '施闰章任山东学政时擢蒲松龄童子试第一',      'seed'),
  (44, 70,  '亲属', '清圣祖玄烨与清世宗胤禛(父子)',              'seed'),
  (44, 47,  '亲属', '清圣祖玄烨与清高宗弘历(祖孙)',              'seed'),
  (47, 70,  '亲属', '清高宗弘历与清世宗胤禛(父子)',              'seed'),
  (3,  93,  '并称', '唐宋八大家',                                'seed'),
  (15, 93,  '并称', '唐宋八大家',                                'seed'),
  (17, 93,  '并称', '唐宋八大家',                                'seed'),
  (17, 52,  '师承', '晁补之出苏轼门下(苏门四学士)',              'seed'),
  (18, 52,  '并称', '苏门四学士(黄庭坚/晁补之)',                'seed'),
  (17, 108, '师承', '陈师道出苏轼门下(苏门六君子)',              'seed'),
  (18, 108, '并称', '江西诗派(黄庭坚/陈师道)',                  'seed'),
  (52, 108, '并称', '苏门六君子(晁补之/陈师道)',                'seed'),
  (7,  109, '师承', '王恽师从元好问',                            'seed'),
  (40, 86,  '并称', '明前七子(徐祯卿/何景明)',                  'seed'),
  (27, 28,  '并称', '明后七子',                                  'seed'),
  (28, 41,  '并称', '明后七子',                                  'seed'),
  (28, 56,  '并称', '明后七子',                                  'seed'),
  (122, 129, '交游', '清初诗坛领袖交游(王士禛/施闰章)',         'seed')
ON DUPLICATE KEY UPDATE description = VALUES(description), source = VALUES(source);

-- 3) derived 派生关系(规则: 同朝代 + 同区域/同景点 + 生卒年重叠)
INSERT INTO poet_relation (poet_a_id, poet_b_id, relation_type, description, source) VALUES
  (14, 16,  '交游', '元代山东名士(同乡同代)',                    'derived'),
  (14, 123, '交游', '元代山东名士(同乡同代)',                    'derived'),
  (16, 123, '交游', '元代山东名士(同乡同代)',                    'derived'),
  (115, 116, '交游', '同题咏东阿县(元末同代)',                  'derived')
ON DUPLICATE KEY UPDATE description = VALUES(description), source = VALUES(source);

-- 4) poem_event: event 3(蒲松龄柳泉设茶采风) 关联蒲松龄诗作(均出自《聊斋诗集》)
--    幂等: 先查再插; poem_event 无唯一键, 用 WHERE NOT EXISTS 防重复
INSERT INTO poem_event (poem_id, event_id)
SELECT 47, 3 WHERE NOT EXISTS (SELECT 1 FROM poem_event WHERE poem_id = 47 AND event_id = 3);
INSERT INTO poem_event (poem_id, event_id)
SELECT 175, 3 WHERE NOT EXISTS (SELECT 1 FROM poem_event WHERE poem_id = 175 AND event_id = 3);
INSERT INTO poem_event (poem_id, event_id)
SELECT 176, 3 WHERE NOT EXISTS (SELECT 1 FROM poem_event WHERE poem_id = 176 AND event_id = 3);