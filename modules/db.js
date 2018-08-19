require('dotenv').config();

const { Model } = require('objection');

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB
    },
    debug: true
});

// provide knex connection for all models
Model.knex(knex);

module.exports = Model;
