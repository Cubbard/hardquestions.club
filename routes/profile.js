const express = require('express');
const router  = express.Router();

/* dev modules */
const User  = require('../modules/User.js');
const Cycle = require('../modules/Cycle.js');
const Queue = require('../modules/Queue.js');

const currentCycle = Cycle.query().first();

// Maybe shouldn't do it this way... Testing
router.get('/profile', (req, res) => {
    currentCycle.then(cycle => {
        cycle.$relatedQuery('participants').findById(req.session.userid).then( async user => {
            const {identity, score, group_type} = user;

            let queues = {
                none: true,
                'A': [],
                'S': [],
                'K': [],
                'L': [],
                'Q': []
            };
            if (group_type === 'Q') {
                users = await Queue.query();
                users.forEach(task => {
                    queues[task.group_type].push(task);
                });
                delete queues.none;
            }
            res.render('profile', { identity, score, group_type, cycle, queues });
        });
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy( errors => {
        res.redirect('/login');
    })
});


module.exports = router;