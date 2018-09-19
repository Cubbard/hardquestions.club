require('dotenv').config();

const uuids = require('uuid');

/* dev modules */
const User  = require('../modules/User.js');
const Cycle = require('../modules/Cycle.js');
const Queue = require('../modules/Queue.js');
const Proof = require('../modules/Proof.js');
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

        if (req.session.formErrors) {
            model.formErrors = req.session.formErrors;
            delete req.session.formErrors;
        }

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

    static async submitProof(req, res, next) {
        const media = req.files.media;
        const {notes, suck, like} = req.body;

        let errorMsg = '';
        if (!notes || !suck || !like) {
            errorMsg += '"notes", "suck", and "like" are all required fields!\n';
        }

        // new proof record
        const insert = {
            descr: notes,
            suck_it: suck,
            like_it: like,
            user_id: req.session.userid
        };

        if (media) {
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(media.mimetype)) {
                errorMsg += 'file can only be "png" or "jpeg"\n';
            }
        }

        if (errorMsg.length > 0) {
            req.session.formErrors = errorMsg;
            return res.redirect('/app/profile');
        }

        if (media) {
            let now       = new Date(Date.now()),
                ext       = () =>  media.mimetype.substring(media.mimetype.indexOf('/') + 1),
                timestamp = () => `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
                name      = () => `d${now.getFullYear()}-${now.getMonth()}-${now.getDay()}_t${timestamp()}_${uuids()}.${ext()}`;

            let fileName = name(), path = process.env.STORAGE_DIR + '/images/' + fileName;
            try {
                await media.mv(path);
                insert.media_url = '/public/images/' + fileName;
            }
            catch(e) {
                console.log(e);
                return res.redirect('/app/profile');
            }
        }

        // insert into proof
        Proof.query().insert(insert).then(result => {
            console.log({notes, suck, like});
            res.redirect('/app/proof');
        });
    }

    static async proof(req, res, next) {
        Proof.query().then(proofs => {
            let model = req.model || {};
            model.proofs = proofs;
            model.loggedIn = true;
            res.render('profile/proof', model);
        })
    }
}

module.exports = ProfileController;