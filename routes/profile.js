const CYCLE_LENGTH = 1; // week

const express = require('express');
const router  = express.Router();

/* dev modules */
const User  = require('../modules/User.js');
const Cycle = require('../modules/Cycle.js');
const Queue = require('../modules/Queue.js');


// Maybe shouldn't do it this way... Testing
router.get('/profile', checkCycle, checkExpiration, (req, res) => {
    User.query().then(async users => {
        let user;
        users = users.filter(elem => elem.id !== req.session.userid ? true : (user = elem) && false);
        let cycle;
        
        if (req.staging) {
            cycle =  await Cycle.query().whereNull('end_date').first();
            return res.render('profile', { staging: req.staging, user, cycle, participants: users, loggedIn: true });
        }

        cycle = await user.$relatedQuery('cycle');
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
        res.render('profile', { user, cycle, queues, participants: users, loggedIn: true });
    });
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

router.post('/optin/:id', async (req, res) => {
    let user = await User.query().findById(req.params.id);
    user.$query().patch({next_cycle: 1}).then(result => res.redirect('/app/profile'));
});

router.post('/proof/:id', async (req, res) => {
    let user = await User.query().findById(req.params.id);
    user.$query().patch({daily_proof: 1}).then(result => res.redirect('/app/profile'));
});

router.get('/logout', (req, res) => {
    req.session.destroy( errors => {
        res.redirect('/login');
    })
});

router.post('/push', (req, res) => {
    const task = req.body;
    task.expires = task.expires || 1;
    
    if (task.id === "") delete task.id;
    
    Queue.push(task).then(result => {
        res.redirect('/app/profile');
    })
});

/* middleware */
async function checkExpiration(req, res, next) {
    const heads = await Queue.query().where('is_head', '=', 1).andWhere('is_active', '=', 1);
    heads.forEach(async head => {
        const expirDate = new Date(parseInt(head.set_active.valueOf()) + (parseInt(head.expires) * 24 * 60 * 60 * 1000));
        if (Date.now().valueOf() > expirDate.valueOf()) {
            let users = await User.activeUsers(head.group_type);
            users.forEach(async user => {
                let daily = head.points * (user.daily_proof ? 1 : -1);
                let score = user.score + daily;
                await user.$query().patch({score: (user.score + score), total_score: (user.total_score + daily), daily_proof: 0});
            });
            let old = await Queue.pop(head.group_type);
            Queue.push(old);
        }
    });
    next();
}

// Cycle expiration
const now = () => new Date(Date.now());
const plusWeek = date => new Date(date.valueOf() + CYCLE_LENGTH * 7 * 24 * 60 * 60 * 1000);
const plusDay = date => new Date(date.valueOf() + 24 * 60 * 60 * 1000);
const isInProgress = cycle => cycle.begin_date ? now().valueOf() < plusWeek(cycle.begin_date).valueOf() : false;
const isInStaging = cycle => now().valueOf() < new Date(cycle.begin_after).valueOf();

const hasParticipants = async function(cycle) {
    const users = await cycle.$relatedQuery('participants');
    return users.length >= 2;
}

async function checkCycle(req, res, next) {
    req.staging = true;

    let currentCycle = await Cycle.query().whereNull('end_date').first();
    if (isInProgress(currentCycle) && await hasParticipants(currentCycle)) {
        req.staging = false;
        next();
    }
    else {
        await Queue.query().patch({is_active: 0});
        await User.query().where('cycle_id', '=', currentCycle.id).increment('total_cycles', 1);

        if (currentCycle.begin_date) { // need to create new
            await currentCycle.$query().patch({end_date: now().toLocaleString()});

            let params = {
                total_participants: 0,
                score_sum: 0,
                begin_after: plusDay(new Date(currentCycle.end_date)).toLocaleString()
            }
            currentCycle = await Cycle.query().insert(params);
        }
        
        let users = await User.query().where('next_cycle', '=', 1);
        await currentCycle.$query().patch({total_participants: users.length});

        if (isInStaging(currentCycle)) {
            return next();
        }

        if (users.length >= 2) {
            req.staging = false;
            await currentCycle.$query().patch({begin_date: now().toLocaleString()});

            // assign user classes
            let unassigned = ['A', 'S', 'K', 'L'], updated = [];

            // assign king
            let king  = users[Math.floor(Math.random() * users.length)];
            king.group_type = 'Q'
            updated.push(king);

            users = users.filter(elem => elem.id !== king.id);
            while (unassigned.length > 0) {
                if (users.length === 0) break;

                let user = users.pop();
                let type = unassigned[Math.floor(Math.random() * unassigned.length)];
                user.group_type = type;
                updated.push(user);
                unassigned = unassigned.filter(elem => elem !== type);
            }

            updated.forEach(async user => {
                await user.$query().patch({cycle_id: currentCycle.id, next_cycle: 0, score: 0, group_type: user.group_type});
            })

            return next();
        }
        next();
    }
}


module.exports = router;