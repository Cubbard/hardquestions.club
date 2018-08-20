require('dotenv').config()

const Model = require('./db.js');
const User  = require('./User.js');


class Cycle extends Model
/**
 * Queue implementation using objection.js
 */
{
    static get tableName() {
        return 'cycle';
    }

    static get relationMappings() {
        return {
            participants: {
                relation: Model.HasManyRelation,
                modelClass: User,
                join: {
                    from: 'cycle.id',
                    to: 'user.cycle_id'
                }
            }
        }
    }
}

module.exports = Cycle;