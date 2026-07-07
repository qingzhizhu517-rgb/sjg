create table user
(
    id         bigint auto_increment comment '用户ID'
        primary key,
    username   varchar(50)                           not null comment '用户名',
    password   varchar(200)                          not null comment '密码（BCrypt加密）',
    role       varchar(20) default 'user'            not null comment '角色（admin/user）',
    status     varchar(20) default 'pending'         not null comment '状态（pending/approved/rejected/disabled）',
    created_at datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    constraint username
        unique (username)
)
    comment '用户表' charset = utf8mb4;

INSERT INTO sjg.user (id, username, password, role, status, created_at) VALUES (1, 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'admin', 'approved', '2026-05-31 12:58:43');
