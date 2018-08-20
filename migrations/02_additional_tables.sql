/**
 * additional tables:
 */
drop table if exists user;
drop table if exists cycle;

create table cycle (
    id                  bigint auto_increment primary key,
    total_participants  int(3) default 0,
    correct_guesses     int(3) default 0,
    score_sum           int,
    date_began          datetime,
    date_end            datetime
);


create table user (
    id             bigint auto_increment primary key,
    identity       varchar(20) unique not null,
    pass_hash      char(64) not null,
    salt           char(4) not null,
    score          int default 0,
    cycle_id       bigint null,

    foreign key(cycle_id) references cycle(id)
);