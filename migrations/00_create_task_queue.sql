/**
 * task_queue:
 *
 */

create table task_queue (
    uuid        bigint auto_increment primary key,
    next        bigint,
    group_type  char(1),
    task_type   char(1),
    title       varchar(128) not null,
    descr       varchar(256) not null,
    is_head     binary not null default 0,
    is_prev     binary not null default 0,
    expires     datetime,

    foreign key(next) references task_queue(uuid)
);
