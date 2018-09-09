/**
 * additional tables:
 */
drop table if exists cycle;

create table cycle (
    id                  bigint auto_increment primary key,
    total_participants  int(3) default 0,
    score_sum           int,
    begin_date          bigint,
    begin_after         bigint,
    end_date            bigint
);