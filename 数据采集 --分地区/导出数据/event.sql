create table event
(
    id           bigint auto_increment comment '事件ID'
        primary key,
    title        varchar(200)                       not null comment '事件标题',
    description  text                               null comment '事件描述',
    dynasty_id   bigint                             null comment '所属朝代ID',
    year         int                                null comment '发生年份',
    significance text                               null comment '历史意义',
    image_url    text                               null comment '相关图片URL列表(JSON数组)',
    created_at   datetime default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at   datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint event_ibfk_1
        foreign key (dynasty_id) references dynasty (id)
)
    comment '历史事件表' charset = utf8mb4;

create index dynasty_id
    on event (dynasty_id);

