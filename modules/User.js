require('dotenv').config()

const Model = require('./db.js');
const Cycle = require('./Cycle.js');

class User extends Model
/**
 * Queue implementation using objection.js
 */
{
    static get tableName() {
        return 'user';
    }

    static get relationMappings() {
        return {
            cycle: {
                relation: Model.BelongsToOneRelation,
                modelClass: Cycle,
                join: {
                    from: 'user.cycle_id',
                    to: 'cycle.id'
                }
            }
        }
    }

    static activeUsers(group_type) {
        return User.query().whereNotNull('cycle_id').andWhere('group_type', '=', group_type);
    }
}


module.exports = User;