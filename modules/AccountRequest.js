require('dotenv').config()

const Model = require('./db.js');
const date  = require('../modules/date.js');


class AccountRequest extends Model
{
    static get tableName() {
        return 'account_request';
    }
}

module.exports = AccountRequest;