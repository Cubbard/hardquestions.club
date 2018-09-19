drop table if exists proof;

create table proof (
    id          bigint auto_increment primary key,
    descr       varchar(256) not null,
    media_url   varchar(256) null,
    user_id     bigint not null,
    suck_it     tinyint(2) not null,
    like_it     tinyint(2) not null,
    foreign key(user_id) references user(id)
);