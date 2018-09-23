require('dotenv').config();

const uuids = require('uuid');

/* dev modules */
const User  = require('../modules/User.js');
const Game  = require('../modules/Game.js');
const Cycle = require('../modules/Cycle.js');
const Queue = require('../modules/Queue.js');
const Proof = require('../modules/Proof.js');

class ProfileController
{
    static async index(req, res, next) {
        let participants = await res.locals.ongoing.$relatedQuery('participants');
        let model        = {};

        participants = participants.filter(elem => elem.id !== req.session.userid);
        model.participants = participants;

        if (!res.locals.user.cycle
        ||  !res.locals.user.cycle.begin_date
        ||   res.locals.user.cycle.end_date) {
             return res.render('profile/staging', model);
         }

        if (req.session.formErrors) {
            res.locals.formErrors = req.session.formErrors;
            delete req.session.formErrors;
        }

        // user participating, continue...
        let tasks = await Queue.whereActive();
        // sort and push

        let queues = {
            'A': [],
            'S': [],
            'K': [],
            'L': [],
            'Q': []  };
        
        if (res.locals.user.group_type !== 'Q') {
            let isHead = task => task.is_head === 1;
            tasks.filter(isHead).forEach(elem => {
                queues[elem.group_type].push(elem);
            })
        }
        else {
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
    
        let tasks = await Queue.query().where('group_type', '=', req.query.group_type).andWhere('is_active', '=', 0).orderBy('id', 'desc');
        if (tasks.length === 0)
            return res.json({error: "There are no new tasks to assign!"});

        let index = parseInt(req.query.index) % tasks.length;
        res.json(tasks[index]);
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
            user_id: req.session.userid,
            submitted: Date.now()
        };

        if (media) {
            if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(media.mimetype)) {
                errorMsg += 'file can only be "png", "jpeg", or "gif"!\n';
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
        Proof.query().insert(insert).then(_ => {
            User.query().findById(req.session.userid).patch({daily_proof: 1}).then(result => {
                res.redirect('/app/proof');
            })
        });
    }

    static async proof(req, res, next) {
        Proof.query().eager('createUser').orderBy('id', 'desc').then(proofs => {
            let model = req.model || {};
            model.proofs = proofs;
            model.loggedIn = true;
            model.start = 1;
            res.render('profile/proof', model);
        })
    }

    static async getProofs(req, res, next) {
        let {start} = req.query;
        start = parseInt(start);
        Proof.query().orderBy('id', 'desc').eager('createUser').range(start, start + 5).then(result => {
            res.render('profile/includes/proofs', {start: start + 1, proofs: result.results, loggedIn: true});
        })
    }

    static async join(req, res, next) {
        Cycle.ongoing().then(ongoing => {
            res.locals.user.$query()
                .patch({cycle_id: ongoing.id})
                .then(_ => {
                    if (ongoing.begin_date) {
                        Game.assignClass(res.locals.user).then(_ => res.redirect('/app'));
                    } else {
                        res.redirect('/app');
                    }
                })
            })
    }
}

module.exports = ProfileController;