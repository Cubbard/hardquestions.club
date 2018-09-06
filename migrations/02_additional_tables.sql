/**
 * additional tables:
 */
drop table if exists user;
drop table if exists cycle;

create table cycle (
    id                  bigint auto_increment primary key,
    total_participants  int(3) default 0,
    score_sum           int,
    begin_date          datetime,
    end_date            datetime
);


create table user (
    id             bigint auto_increment primary key,
    identity       varchar(20) unique not null,
    pass_hash      char(64) not null,
    salt           char(4) not null,
    score          int default 0,
    cycle_id       bigint null,
    next_cycle     tinyint(1) not null default 0,
    group_type     char(1) null,

    foreign key(cycle_id) references cycle(id)
);