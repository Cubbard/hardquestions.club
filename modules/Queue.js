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

    static async tail(group_type) {
        let tasks = await this.whereActive(group_type);
        if (tasks.length === 0)
            return null;

        return tasks.reduce((accum, current) => current.queue_order > accum.queue_order ? current : accum);
    }

    static async head(group_type) {
        return Queue.query().where('is_active', '=', 1).andWhere('group_type', '=', group_type).andWhere('is_head', '=', 1).first()
    }

    static async whereActive(group_type) {
        /* TODO: would rather make this return the query builder */
        return Queue.query().where('is_active', '=', 1).andWhere('group_type', '=', group_type);
    }

    static async next(group_type, order) {
        return Queue.query().where('is_active', '=', 1).andWhere('group_type', '=', group_type).andWhere('queue_order', '=', order + 1).first();
    }

    static async push(task) {
        if (!task)
            throw 'A task and task type is required!';

        let isHead = (await this.whereActive(task.group_type)).length === 0;

        // 1. create new tail or update existing
        let newTail;
        if (task.id) {
            newTail = await Queue.query().patchAndFetchById(task.id, {is_head: isHead, is_active: 1, set_active: Date.now()});
        } else {
            task.is_head = isHead ? 1 : 0;
            task.is_active = 1;
            task.set_active = Date.now();
            newTail = await Queue.query().insert(task);
        }

        return new Promise( async (resolve, reject) => {
            let count = await this.tail(task.group_type);
            count = parseInt((count ? count.queue_order : 0)) + 1;
            newTail.$query().patchAndFetchById(newTail.id, {queue_order: count}).then(result => {
                resolve(result);
            })
        });
    }
    
    static async pop(type) {
        if (!type)
            throw 'A task type is required!';
        
        const oldHead = await this.head(type);
        if (!oldHead)
            return null;
        
        const newHead = await this.next(type, parseInt(oldHead.queue_order));
        await oldHead.$query().patch({is_head: 0, is_active: 0, queue_order: 0})

        if (newHead) {
            await newHead.$query().patch({is_head: 1, set_active: Date.now()});
        }

        return new Promise( (resolve, reject) => {  
            resolve(oldHead);
        });
    }
};

module.exports = Queue;
