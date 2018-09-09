'use strict';

/* app bootstrap */
const express = require('express');
const app     = express();
const profileRouter = require('./routes/profile.js');
const indexRouter   = require('./routes/index.js');

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

/* routes */
app.use('/app', requiresAuth, profileRouter);
app.use(checkIsLoggedIn, indexRouter); // ORDER IS IMPORTANT

app.get('/faq', (req, res) => {
    res.render('faq', {loggedIn: req.loggedIn});
});

/* middleware */
function checkIsLoggedIn(req, res, next) {
    if (req.session.userid) {
        req.loggedIn = true;
    }
    next();
}

function requiresAuth(req, res, next) {
    if (req.session.userid) {
        next();
    } else {
        res.redirect('/');
    }
}


app.listen(3000, () => console.log('listening on 3000!'));
