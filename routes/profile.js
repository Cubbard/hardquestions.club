const express = require('express');
const router  = express.Router();

/* dev modules */
const User = require('../modules/User.js');


router.get('/profile', (req, res) => {
    User.query().findById(req.session.userid).then( user => {
        const {identity, score} = user;
        res.render('profile', { identity, score });
    })
});

router.get('/logout', (req, res) => {
    req.session.destroy( errors => {
        res.redirect('/login');
    })
});


module.exports = router;