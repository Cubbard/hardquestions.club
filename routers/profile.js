const CYCLE_LENGTH = 1; // week

const express = require('express');
const router  = express.Router();

/* dev modules */
const User  = require('../modules/User.js');
const Cycle = require('../modules/Cycle.js');
const Queue = require('../modules/Queue.js');

const checkCycle = require('../middleware/checkCycle.js');
const checkExpiration = require('../middleware/checkExpiration.js');
const ProfileController = require('../controllers/ProfileController');

router.get(  ['/profile', '/', ''], checkCycle, checkExpiration, getUser, getCycle, 
    (...args) => ProfileController.index(...args).catch(e => console.log(e.message)));
router.get(   '/logout', (...args) => ProfileController.logout(...args)     .catch(e => console.log(e.message)));
router.post(    '/push', (...args) => ProfileController.push(...args)       .catch(e => console.log(e.message)));
router.get(  '/getTask', (...args) => ProfileController.getTask(...args)    .catch(e => console.log(e.message)));
router.post(   '/proof', (...args) => ProfileController.submitProof(...args).catch(e => console.log(e.message)));
router.post(    '/join', getUser, getCycle,
    (...args) => ProfileController.join(...args).catch(e => console.log(e.message)));
router.get(    '/proof', (...args) => ProfileController.proof(...args)      .catch(e => console.log(e.message)));
router.get('/getProofs', (...args) => ProfileController.getProofs(...args)  .catch(e => console.log(e.message)));

/* testing middleware */
async function getUser(req, res, next) {
    const user = await User.query().eager('cycle').findById(req.session.userid);
    res.locals.user = user;
    next();
}

async function getCycle(req, res, next) {
    let cycle = await res.locals.user.cycle;

    if (!cycle) {
        cycle = await Cycle.ongoing();
    }
    res.locals.cycle = cycle;
    next();
}
module.exports = router;