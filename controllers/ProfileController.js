/* dev modules */
const User  = require('../modules/User.js');
const Cycle = require('../modules/Cycle.js');
const Queue = require('../modules/Queue.js');
const {PageModel} = require('../modules/pageProps.js');

class ProfileController
{
    static async index(req, res, next) {
        let participants = await User.activeUsers(), model = {}, user;
        participants = participants.filter(elem => elem.id === req.session.userid ? (user = elem) && false : true);
        model.loggedIn = true;
        model.name = user.identity;
        model.user = user;
        model.participants = participants;
        model.staging = req.staging;

        if (!user.cycle_id)
            return res.render('profile/staging', model);

        const cycle = await user.$relatedQuery('cycle');
        model.cycle = cycle;
        if (req.staging)
            return res.render('profile/staging', model);

        // user participating, continue...
        let tasks = await Queue.whereActive();
        // sort and push

        let queues = {
            'A': [],
            'S': [],
            'K': [],
            'L': [],
            'Q': []  };
        
        if (user.group_type !== 'Q') {
            console.log('here1');
            let isHead = task => task.is_head === 1;
            tasks.filter(isHead).forEach(elem => {
                queues[elem.group_type].push(elem);
            })
        }
        else {
            console.log('here2');
            let asc = (a, b) => a.queue_order < b.queue_order ? -1 : 1;
            tasks.sort(asc).forEach(elem => {
                queues[elem.group_type].push(elem);
            })
        }
        model.queues = queues;
        res.render('profile/index', model);
    }

    static async logout(req, res, next) {
        req.session.destroy( errors => {
            res.redirect('/login');
        })
    }

    static async push(req, res, next) {
        const task = req.body;
        task.expires = task.expires || 1;
        
        if (task.id === "") delete task.id;
        
        Queue.push(task).then(result => {
            res.redirect('/app/profile');
        })
    }

    static async getTask(req, res, next) {
        if (!req.query.group_type)
        return res.json({error: "You must select a class before getting a task!"});
    
        let tasks = await Queue.query().where('group_type', '=', req.query.group_type).andWhere('is_active', '=', 0);
        if (tasks.length === 0)
            return res.json({error: "There are no new tasks to assign!"});

        let index = Math.floor(Math.random() * tasks.length);
        res.json(tasks[Math.floor(Math.random() * tasks.length)]);
    }
}

module.exports = ProfileController;