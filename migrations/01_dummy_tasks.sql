/**
 * dummy tasks:
 * DATETIME:
 * YYYY-MM-DD HH:MM:SS 
 */

insert into task_queue (group_type, title, descr, is_head, expires)
    values ('A', 'Animal Task', 'This is a test task', 1, '2019-05-25 23:59:59');

insert into task_queue (group_type, title, descr, expires)
    values ('A', 'Animal Task 2', 'This is a test task', '2019-05-25 23:59:59');

update task_queue set next = (select uuid from 
    (select * from task_queue) as queue where queue.is_head = 0 limit 1)
    where is_head = 1;
