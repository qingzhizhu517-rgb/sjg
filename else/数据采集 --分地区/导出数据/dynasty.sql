create table dynasty
(
    id          bigint auto_increment comment '朝代ID'
        primary key,
    name        varchar(50) not null comment '朝代名称',
    start_year  int         null comment '起始年份',
    end_year    int         null comment '结束年份',
    description text        null comment '朝代描述'
)
    comment '朝代表' charset = utf8mb4;

INSERT INTO sjg.dynasty (id, name, start_year, end_year, description) VALUES (1, '先秦', -2070, -221, '夏商周时期');
INSERT INTO sjg.dynasty (id, name, start_year, end_year, description) VALUES (2, '秦汉', -221, 220, '秦朝与汉朝');
INSERT INTO sjg.dynasty (id, name, start_year, end_year, description) VALUES (3, '魏晋南北朝', 220, 589, '三国两晋南北朝');
INSERT INTO sjg.dynasty (id, name, start_year, end_year, description) VALUES (4, '隋唐', 581, 907, '隋朝与唐朝');
INSERT INTO sjg.dynasty (id, name, start_year, end_year, description) VALUES (5, '宋', 960, 1279, '北宋与南宋');
INSERT INTO sjg.dynasty (id, name, start_year, end_year, description) VALUES (6, '元', 1271, 1368, '元朝');
INSERT INTO sjg.dynasty (id, name, start_year, end_year, description) VALUES (7, '明', 1368, 1644, '明朝');
INSERT INTO sjg.dynasty (id, name, start_year, end_year, description) VALUES (8, '清', 1644, 1912, '清朝');
INSERT INTO sjg.dynasty (id, name, start_year, end_year, description) VALUES (9, '金', 1115, 1234, '金朝');
