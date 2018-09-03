const express = require('express');
const router  = express.Router();

/* dev modules */
const User  = require('../modules/User.js');
const Cycle = require('../modules/Cycle.js');
const Queue = require('../modules/Queue.js');

const currentCycle = Cycle.query().first();

// Maybe shouldn't do it this way... Testing
router.get('/profile', checkExpiration, (req, res) => {
    User.query().findById(req.session.userid).then(async user => {
        const {identity, score, group_type} = user;
        
        const cycle = await user.$relatedQuery('cycle');
        if (!cycle) {
            res.render('profile', { identity });
            return;
        }

        let queues = {
            none: true,
            'A': [],
            'S': [],
            'K': [],
            'L': [],
            'Q': []
        };
        let tasks;
        if (user.group_type === 'Q') {
            tasks = await Queue.query().orderBy('queue_order', 'asc');
        } else {
            tasks = await Queue.query().where('is_head', '=', 1).orderBy('queue_order', 'asc');
        }
        tasks.forEach(task => {
            queues[task.group_type].push(task);
        });
            delete queues.none;
        res.render('profile', { identity, score, group_type, cycle, queues });
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy( errors => {
        res.redirect('/login');
    })
});

/* middleware */
async function checkExpiration(req, res, next) {
    const heads = await Queue.query().where('is_head', '=', 1);
    heads.forEach(async head => {
        const expirDate = new Date(parseInt(head.set_active.valueOf()) + (parseInt(head.expires) * 24 * 60 * 60 * 1000));
        if (Date.now().valueOf() > expirDate.valueOf()) {
            let old = await Queue.pop(head.group_type);
            Queue.push(old);
        }
    });
    next();
}


module.exports = router;