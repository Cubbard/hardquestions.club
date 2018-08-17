'use strict';

const express = require('express');
const app     = express();

const bodyParser = require('body-parser');

/* dev modules */
const Queue = require('./modules/Queue.js');
const Task  = require('./modules/Task.js');

/* app config */
app.use(bodyParser.json());
app.use('/public', express.static('./public'));
app.set('view engine', 'pug');


app.get('/', async ( req, res ) => {
    // populate a queue
    let queue = new Queue();
    let task  = new Task('foo', 'bar 2', Task.A, 'R');

    let result;
    try {
        result = JSON.stringify(await queue.push(task)) + JSON.stringify(await queue.pop());
    }
    catch (err) {
        result = err;
    }

    res.send(result);
});


app.listen(3000, () => console.log('listening on 3000!'));
