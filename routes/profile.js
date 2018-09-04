const CYCLE_LENGTH = 1; // week

const express = require('express');
const router  = express.Router();

/* dev modules */
const User  = require('../modules/User.js');
const Cycle = require('../modules/Cycle.js');
const Queue = require('../modules/Queue.js');


// Maybe shouldn't do it this way... Testing
router.get('/profile', checkCycle, checkExpiration, (req, res) => {
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
            tasks = await Queue.query().where('is_active', '=', 1).orderBy('queue_order', 'asc');
        } else {
            tasks = await Queue.query().where('is_active', '=', 1).where('is_head', '=', 1).orderBy('queue_order', 'asc');
        }
        tasks.forEach(task => {
            queues[task.group_type].push(task);
        });
            delete queues.none;
        res.render('profile', { identity, score, group_type, cycle, queues });
    });
});

router.get('/staging', async (req, res) => {
    currentCycle = await Cycle.query().whereNull('end_date').first().then(cycle => {
        res.render('profile', {staging: true, cycle});
    })
});

router.get('/getTask', async (req, res) => {
    if (!req.query.group_type)
        return res.json({error: "You must select a class before getting a task!"});
    
    let tasks = await Queue.query().where('group_type', '=', req.query.group_type).andWhere('is_active', '=', 0);
    if (tasks.length === 0)
        return res.json({error: "There are no new tasks to assign!"});

    let index = Math.floor(Math.random() * tasks.length);
    res.json(tasks[Math.floor(Math.random() * tasks.length)]);
});

router.get('/logout', (req, res) => {
    req.session.destroy( errors => {
        res.redirect('/login');
    })
});

router.post('/push', (req, res) => {
    const task = req.body;
    task.expires = task.expires || 1;
    Queue.push(task).then(result => {
        res.send(result);
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

// Cycle expiration
// date functions
const now = () => new Date(Date.now());
const plusWeek = date => new Date(date.valueOf() + CYCLE_LENGTH * 7 * 24 * 60 * 60 * 1000);

// lifecycle functions
const isInProgress = cycle => now().valueOf() < plusWeek(cycle.begin_date).valueOf() && cycle.total_participants >= 2;

function isStaging(cycle) {

}

async function checkCycle(req, res, next) {
    const currentCycle = await Cycle.query().whereNull('end_date').first();
    if (isInProgress(currentCycle)) {
        next();
    }
    else {
        await currentCycle.$query().patch({end_date: now().toLocaleString()});
        // create new cycle

        // 1. create new
        let params = {
            total_participants: 0,
            score_sum: 0,
            begin_date: now().toLocaleString() 
        }
        const newCycle = await Cycle.query().insert(params);

        User.query().where('next_cycle', '=', 1).then(async users => {
            newCycle.$query().patchAndFetch({total_participants: users.length}).then(cycle => {
                if (users.length >= 2) {
        
                    users.forEach(async user => {
                        await user.$query().patch({cycle_id: cycle.id, next_cycle: 0});
                    })
    
                    Queue.query().patch({is_active: 0}).then(result => {
                        next();
                    })
                }
                else {
                    res.redirect('/app/staging');
                }
            })
        });
    }
}


module.exports = router;