/**
 * task_queue:
 *
 */
drop table if exists task_queue;

create table task_queue (
    id          bigint auto_increment primary key,
    group_type  char(1),
    task_type   char(1),
    title       varchar(128) not null,
    descr       varchar(256) not null,
    is_head     int(1) not null default 0,
    is_active   int(1) not null default 0,
    queue_order bigint not null default 0,
    set_active  bigint null,
    expires     bigint not null,
    points      int not null default 1
);
