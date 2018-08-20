/**
 * task_queue:
 *
 */
drop table if exists task_queue;

create table task_queue (
    uuid        bigint auto_increment primary key,
    next        bigint null,
    group_type  char(1),
    task_type   char(1),
    title       varchar(128) not null,
    descr       varchar(256) not null,
    is_head     int(1) not null default 0,
    is_active   int(1) not null default 1,
    expires     datetime,

    foreign key(next) references task_queue(uuid)
);
