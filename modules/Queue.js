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
                relation: Model.BelongsToOneRelation,
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

        return new Promise( (resolve, reject) => {
            (oldTail || newTail).$query().patch({ next: oldTail ? newTail.id : null }).then( result => {
                resolve(newTail);
            });
        });
    }
    
    static async pop(type) {
        if (!type)
            throw 'A task type is required!';
        
        const oldHead = await Queue.query().where('group_type', '=', type).andWhere('is_head', '=', 1).first();
        if (!oldHead)
            return null;
        
        let resolution = [
            oldHead.$query().patch({is_head: 0, is_active: 0, next: null})
        ];

        const newHead = await oldHead.$relatedQuery('nextTask');
        if (newHead)
            resolution.push(newHead.$query().patch({is_head: 1}));

        return new Promise( (resolve, reject) => {
            Promise.all(resolution).then( results => {
                resolve(oldHead);
            });
        });
    }
};

module.exports = Queue;
