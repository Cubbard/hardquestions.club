'use strict';

const express = require('express');
const app     = express();

const bodyParser = require('body-parser');

/* dev modules */
const Queue = require('./modules/Queue.js');
const Task  = require('./modules/Task.js');
const date  = require('date-and-time');

/* app config */
app.use(bodyParser.json());
app.use('/public', express.static('./public'));
app.set('view engine', 'pug');

app.get('/push', async ( req, res ) => {
    let task = new Task('ahh1!', 'descriptive baby', Task.A);

    let count = await Queue.query().count('uuid as num');
    let params = {
        group_type  : task.group,
        title       : task.title + ' ' + count[0].num,
        descr       : task.descr,
        expires     : task.expires
    };

    Queue.push(params).then( result => {
        res.send(result);
    })
    .catch( err => {
        throw err;
    });
});

app.get('/pop', async ( req, res ) => {
    Queue.pop(Task.A).then( result => {
        res.send(result);
    })
    .catch( err => {
        throw err;
    });
});

app.get('/pop-and-push', async ( req, res ) => {
    Queue.pop(Task.A).then( head => {
        Queue.push({uuid: head.uuid, group_type: Task.A}).then( tail => {
            res.send(tail);
        });
    })
});

app.listen(3000, () => console.log('listening on 3000!'));
