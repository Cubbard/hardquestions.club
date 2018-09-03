require('dotenv').config()

const Model = require('./db.js');


class Queue extends Model
/**
 * Queue implementation using objection.js
 */
{
    static get tableName() {
        return 'task_queue';
    }

    /**
     * Custom methods
     */

    static async tail() {
        let max = await Queue.query().max({max: 'queue_order'});
        return max[0].max
    }

    static async push(task) {
        if (!task)
            throw 'A task and task type is required!';

        let oldTail = await Queue.query().where('group_type', '=', task.group_type)
            .andWhere('is_active', '=', 1)
            .andWhere('queue_order', '=', await Queue.tail()).first();
        let newTail, is_head = oldTail ? 0 : 1;
        if (task.id && task.id !== "")
            newTail = await Queue.query().patchAndFetchById(task.id, {is_head, is_active: 1});
        else {
            task.is_head = is_head;
            task.set_active = new Date(Date.now()).toLocaleString(); 
            newTail = await Queue.query().insert(task);
        }

        return new Promise( async (resolve, reject) => {
            let count = 0;

            if (oldTail) {
                count = await oldTail.$query().select('queue_order');
                count = count.queue_order;
            }

            // update queue order
            newTail.$query().patchAndFetchById(newTail.id, {queue_order: (count + 1)}).then(result => {
                resolve(result);
            })
        });
    }
    
    static async pop(type) {
        if (!type)
            throw 'A task type is required!';
        
        const oldHead = await Queue.query().where('group_type', '=', type).andWhere('is_head', '=', 1).first();
        if (!oldHead)
            return null;
        
        const newHead = await Queue.query().where('group_type', '=', type).andWhere('queue_order', '=', parseInt(oldHead.queue_order) + 1).first();
        await oldHead.$query().patch({is_head: 0, is_active: 0})

        if (newHead) {
            /* TODO: rethink expires date system */
            // set expiration x amount of time into the future
            await newHead.$query().patch({is_head: 1, set_active: new Date(Date.now()).toLocaleString()});
        }

        return new Promise( (resolve, reject) => {  
            resolve(oldHead);
        });
    }
};

module.exports = Queue;
