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

    static get relationMappings() {
        return {
            nextTask: {
                relation: Model.HasOneRelation,
                modelClass: Queue,
                join: {
                    from: 'task_queue.next',
                    to: 'task_queue.id'
                }
            }
        }
    }

    /**
     * Custom methods
     */

    static async push(task) {
        if (!task)
            throw 'A task and task type is required!';

        let oldTail = await Queue.query().where('group_type', '=', task.group_type).andWhere('is_active', '=', 1).whereNull('next').first();
        let newTail, is_head = oldTail ? 0 : 1;
        if (task.id)
            newTail = await Queue.query().patchAndFetchById(task.id, {is_head, is_active: 1});
        else {
            task.is_head = is_head;
            newTail = await Queue.query().insert(task);
        }

        return new Promise( async (resolve, reject) => {
            let count = 0;

            await newTail.$query().patch({next: null});
            if (oldTail) {
                count = await oldTail.$query().select('queue_order');
                count = count.queue_order;
                await oldTail.$query().patch({next: newTail.id});
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
        
        const newHead = await oldHead.$relatedQuery('nextTask');
        await oldHead.$query().patch({is_head: 0, is_active: 0, next: null})

        if (newHead) {
            /* TODO: rethink expires date system */
            // set expiration x amount of time into the future
            const datePlusSome = new Date(Date.now().valueOf() + (5 * 1000));
            await newHead.$query().patch({is_head: 1, expires: datePlusSome.toLocaleString()});
        }

        return new Promise( (resolve, reject) => {  
            resolve(oldHead);
        });
    }
};

module.exports = Queue;
