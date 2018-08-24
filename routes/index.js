const express = require('express');
const router  = express.Router();

/* dev modules */
const Queue  = require('../modules/Queue.js');
const Task   = require('../modules/Task.js');
const Crypto = require('../modules/Crypto.js');
const User   = require('../modules/User.js');


router.get('/', (req, res) => {
    res.render('index', { page: 'Home' });
});

router.route('/login')
    .get((req, res) => {
        res.render('login', { page: 'Login' });
    }).post((req, res) => {
        Crypto.tryUser(req.body.identity, req.body.password).then( user => {
            if (user) {
                req.session.userid = user.id;
                res.redirect('/app/profile');
            } else {
                res.redirect('/');
            }
        });
    });


module.exports = router;