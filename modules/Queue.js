require('dotenv').config()

const mysql = require('promise-mysql');
const Model = require('./db.js');


class Queue extends Model
/**
 * Queue implementation using objection.js
 */
{
    static get tableName() {
        return 'task_queue';
    }

    static get idColumn() {
        return 'uuid';
    }

    static get relationMappings() {
        return {
            nextTask: {
                relation: Model.BelongsToOneRelation,
                modelClass: Queue,
                join: {
                    from: 'task_queue.next',
                    to: 'task_queue.uuid'
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
        
        let newTail;
        if (task.uuid)
            newTail = await Queue.query().patchAndFetchById(task.uuid, {is_active: 1});
        else
            newTail = await Queue.query().insert(task);

        return new Promise( (resolve, reject) => {
            oldTail.$query().patch({next: newTail.uuid}).then( result => {
                resolve(newTail);
            });
        });
    }
    
    static async pop(type) {
        if (!type)
            throw 'A task type is required!';
        
        const oldHead = await Queue.query().where('group_type', '=', type).andWhere('is_head', '=', 1).first();
        if (!oldHead)
            return 'null'

        const newHead = await oldHead.$relatedQuery('nextTask');

        return new Promise( (resolve, reject) => {
            Promise.all(newHead ? [
                newHead.$query().patch({is_head: 1}),
                oldHead.$query().patch({is_head: 0, is_active: 0, next: null}),
            ] : [] )
            .then( results => {
                resolve(oldHead);
            });
        });
    }
};

module.exports = Queue;
