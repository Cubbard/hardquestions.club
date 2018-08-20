require('dotenv').config()

const Model = require('./db.js');


class User extends Model
/**
 * Queue implementation using objection.js
 */
{
    static get tableName() {
        return 'user';
    }
}


module.exports = User;