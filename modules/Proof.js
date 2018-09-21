require('dotenv').config()

const Model = require('./db.js');
const date  = require('../modules/date.js');

class Proof extends Model
{
    static get tableName() {
        return 'proof';
    }

    static get relationMappings() {
        const User = require('./User.js');
        return {
            createUser: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'proof.user_id',
                    to: 'user.id'
                }
            }
        }
    }
}

module.exports = Proof;