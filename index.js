'use strict';

const express = require('express');
const app     = express();

const bodyParser = require('body-parser');
const randString = require('random-string');

/* dev modules */
const Queue  = require('./modules/Queue.js');
const Task   = require('./modules/Task.js');
const Crypto = require('./modules/Crypto.js');
const User   = require('./modules/User.js');

/* included modules */
const date   = require('date-and-time');

/* methods I should move to modules */
const getSalt = () => randString({ special: true, length: 4 });

/* app config */
app.use(bodyParser());
app.use('/public', express.static('./public'));
app.set('view engine', 'pug');

/* app routes */
app.get('/', ( req, res ) => {
    res.render('index', { page: 'Home' });
});

app.get('/login', ( req, res ) => {
    res.render('login', { page: 'Login' });
})

app.post('/login', ( req, res ) => {
    Crypto.tryUser(req.body.identity, req.body.password).then( worked => {
        res.send(worked ? worked : 'bad credentials');
    });
});

/* routes for testing */
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

app.post('/createUser', ( req, res ) => {
    // identity, password
    let params  = { identity: req.body.identity },
        salt    = randString({ special: true, length: 4 });
    
    let passwordHash = Crypto.hash(req.body.password, salt);

    params.pass_hash = passwordHash;
    params.salt      = salt;
    User.query().insert(params).then( user => {
        res.send(user);
    })
});

app.post('/tryUser', async ( req, res ) => {
    let identity = req.body.identity;
    let password = req.body.password;
    let result = await Crypto.tryUser(identity, password);

    res.send(result);
});


app.listen(3000, () => console.log('listening on 3000!'));
