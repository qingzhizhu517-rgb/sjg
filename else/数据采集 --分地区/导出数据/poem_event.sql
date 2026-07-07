create table poem_event
(
    id       bigint auto_increment comment 'ID'
        primary key,
    poem_id  bigint not null comment '诗词ID',
    event_id bigint not null comment '事件ID',
    constraint uk_poem_event
        unique (poem_id, event_id),
    constraint poem_event_ibfk_1
        foreign key (poem_id) references poem (id),
    constraint poem_event_ibfk_2
        foreign key (event_id) references event (id)
)
    comment '诗词-事件关联表' charset = utf8mb4;

create index event_id
    on poem_event (event_id);

