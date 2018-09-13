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

/* middleware */
const requiresAuth = require('./middleware/requiresAuth.js');

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
app.use(indexRouter); // ORDER IS IMPORTANT

app.listen(3000, () => console.log('listening on 3000!'));
