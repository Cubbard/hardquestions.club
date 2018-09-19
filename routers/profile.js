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

router.get('/profile', checkCycle, checkExpiration, (...args) => ProfileController.index(...args).catch(e => console.log(e.message)));
router.get('/logout', (...args) => ProfileController.logout(...args).catch(e => console.log(e.message)));
router.post('/push', (...args) => ProfileController.push(...args).catch(e => console.log(e.message)));
router.get('/getTask', (...args) => ProfileController.getTask(...args).catch(e => console.log(e.message)));
router.post('/proof', (...args) => ProfileController.submitProof(...args).catch(e => console.log(e.message)));
router.get('/proof', (...args) => ProfileController.proof(...args).catch(e => console.log(e.message)));

module.exports = router;