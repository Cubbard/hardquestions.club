'use strict';

/* app bootstrap */
const express = require('express');
const app     = express();
const profileRouter = require('./routers/profile.js');
const indexRouter   = require('./routers/index.js');

/* app state */
const bodyParser = require('body-parser');
const cookParser = require('cookie-parser');
const session    = require('express-session');
const fileUpload = require('express-fileupload');
/* middleware */
const requiresAuth = require('./middleware/requiresAuth.js');
const date = require('./modules/date.js');

/* app config */

app.locals.date = date; // hell yeah
app.locals.classes = require('./data/config.js').classes;


app.use(cookParser());
app.use(bodyParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    secure: false,
    cookie: {
        maxAge: 600000
    }
}));
app.use(fileUpload());

app.use((req, res, next) => {
    if (req.session.userid) {
        res.locals.loggedIn = true;
    } else {
        res.locals.loggedIn = false;
    }
    next();
});

app.use('/public', express.static('./public'));
app.set('view engine', 'pug');

/* routes */
app.use('/app', requiresAuth, profileRouter);
app.use(indexRouter); // ORDER IS IMPORTANT

app.listen(3000, () => console.log('listening on 3000!'));
