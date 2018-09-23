drop table if exists account_request;

create table account_request (
    id             bigint auto_increment primary key,
    identity       varchar(20) unique not null,
    pass_hash      char(64) not null,
    salt           char(4) not null,
    email          varchar(55) not null
);