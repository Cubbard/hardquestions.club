require('dotenv').config()

const Model = require('./db.js');
const date  = require('../modules/date.js');


class Cycle extends Model
/**
 * Queue implementation using objection.js
 */
{
    static get tableName() {
        return 'cycle';
    }
    
    static get relationMappings() {
        const User  = require('./User.js');
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

    static ongoing() {
        return Cycle.query().whereNull('end_date').first();
    }

    static plusStagingDuration(time) {
        //return date.plusDay(date);
        return time + (60 * 60 * 1000);
    }

    static plusCycleDuration(time) {
        //return date.plusWeek(date);
        return time + (60 * 60 * 1000);
    }

    static isInStaging(cycle) {
        return date.now() < cycle.begin_after;
    }

    static isInProgress(cycle) {
        return cycle.begin_date ? date.now() < this.plusCycleDuration(cycle.begin_date) : false;
    }
}

module.exports = Cycle;