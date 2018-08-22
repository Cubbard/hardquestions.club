'use strict';

/* app bootstrap */
const express = require('express');
const app     = express();

/* app state */
const bodyParser = require('body-parser');
const cookParser = require('cookie-parser');
const session    = require('express-session');

const date = require('date-and-time');

/* dev modules */
const Queue  = require('./modules/Queue.js');
const Task   = require('./modules/Task.js');
const Crypto = require('./modules/Crypto.js');
const User   = require('./modules/User.js');


/* app config */
app.use(cookParser());
app.use(bodyParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    secure: false,
    cookie: {
        maxAge: 600000
    }
}));

app.use('/public', express.static('./public'));
app.set('view engine', 'pug');

/**
 *  TODO: find something better than 'excludesAuth', 'requiresAuth' paradigm
 */

/* app routes */
app.get('/', excludesAuth, ( req, res ) => {
    res.render('index', { page: 'Home' });
});

app.get('/login', excludesAuth, ( req, res ) => {
    res.render('login', { page: 'Login' });
})

app.post('/login', excludesAuth, ( req, res ) => {
    Crypto.tryUser(req.body.identity, req.body.password).then( user => {
        if (user) {
            req.session.userid = user.id;
            res.redirect('/profile');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/logout', requiresAuth, ( req, res ) => {
    req.session.destroy( errors => {
        res.redirect('/');
    })
});

app.get('/profile', requiresAuth, ( req, res ) => {
    User.query().findById(req.session.userid).then( user => {
        res.render('profile', { identity: user.identity, score: user.score });
    })
});

/* middleware */
function excludesAuth(req, res, next) {
    if (req.session.userid) {
        res.redirect('/profile');
    } else {
        next();
    }
}

function requiresAuth(req, res, next) {
    console.log(req.session.id);
    if (req.session.userid) {
        next();
    } else {
        res.redirect('/');
    }
}

app.listen(3000, () => console.log('listening on 3000!'));
