const express = require('express');
const router  = express.Router();

/* dev modules */
const Queue  = require('../modules/Queue.js');
const Task   = require('../modules/Task.js');
const Crypto = require('../modules/Crypto.js');
const User   = require('../modules/User.js');


router.get('/', excludesAuth, (req, res) => {
    res.render('index', { page: 'Home' });
});

router.route('/login')
    .get(excludesAuth, (req, res) => {
        res.render('login', { page: 'Login' });
    }).post(excludesAuth, (req, res) => {
        Crypto.tryUser(req.body.identity, req.body.password).then( user => {
            if (user) {
                req.session.userid = user.id;
                res.redirect('/app/profile');
            } else {
                res.redirect('/');
            }
        });
    });


function excludesAuth(req, res, next) {
    if (req.session.userid) {
        res.redirect('/app/profile');
    } else {
        next();
    }
}

module.exports = router;