insert into cycle (total_participants, correct_guesses, score_sum, date_began, date_end)
    values (0, 0, 0, '2018-05-25 23:59:59', '2019-05-25 23:59:59');

update cycle set total_participants = (select count(id) from user);

update user set cycle_id = (select id from cycle limit 1);