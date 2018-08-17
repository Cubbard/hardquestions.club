require('dotenv').config()
const mysql = require('promise-mysql');

class Queue
/**
 * The idea here is to have the queue facilitate
 * all sql (or no-sql) operations pertaining to tasks
 */
{
    constructor() {
        this.ready = false; // might be a dumb way to do things...

        this.headQuery = 'select * from task_queue where is_head = 1';
        this.tailQuery = 'select * from task_queue where next is NULL';

        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB
        });
    }

    push(task) {
        return new Promise( (resolve, reject) => {
            this.connection.then(async conn => {
                const old_tail = await conn.query(this.tailQuery);
                const new_tail = await conn.query(`insert into task_queue (group_type, task_type, title, descr, expires) \
                    values ('${task.group}', '${task.type}', '${task.name}', '${task.descr}', '${task.expires}')`);
                
                const set_next = await conn.query(`update task_queue set next = ${new_tail.insertId} where uuid = ${old_tail[0].uuid}`);
                resolve(set_next);
            });
        });
    }

    pop() {
        return new Promise( async (resolve, rejext) => {
            this.connection.then(async conn => {
                // This is all super awful but will improve later

                const old_head = await conn.query(this.headQuery);
                const old_tail = await conn.query(this.tailQuery);

                // TODO: set is_prev = 0 before updating it on former head
                const set_head = await conn.query(`update task_queue set is_head = 1 where uuid = ${old_head[0].next}`);
                const rem_head = await conn.query(`update task_queue set is_head = 0 where uuid = ${old_head[0].uuid}`);
                const set_prev = await conn.query(`update task_queue set is_prev = 1 where uuid = ${old_head[0].uuid}`);
                const set_tail = await conn.query(`update task_queue set next = ${old_head[0].uuid} where uuid = ${old_tail[0].uuid}`);
                const set_next = await conn.query(`update task_queue set next = NULL where uuid = ${old_head[0].uuid}`);

                resolve(old_head);
            })
        })
    }
}

if (module !== undefined) {
    module.exports = Queue;
}
