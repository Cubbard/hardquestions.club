const express = require('express');
const router  = express.Router();

const User = require('../modules/User.js');

/* middleware */
const excludesAuth = require('../middleware/excludesAuth.js');

/* controllers */
const IndexController = require('../controllers/IndexController.js');

router.get('/', excludesAuth, (...args) => IndexController.index(...args).catch(e => console.log(e.message)));
router.get('/early-access', (...args) => IndexController.earlyAccess(...args).catch(e => console.log(e.message)));
router.get('/faq', (...args) => IndexController.faq(...args).catch(e => console.log(e.message)));
router.get('/thanks', (...args) => IndexController.thanks(...args).catch(e => console.log(e.message)));
router.get('/guide', (...args) => IndexController.guide(...args).catch(e => console.log(e.message)));
router.post('/request', (...args) => IndexController.request(...args).catch(e => console.log(e.message)));
router.route('/login')
    .get(excludesAuth, (...args) => IndexController.login(...args).catch(e => console.log(e.message)))
    .post(excludesAuth, (...args) => IndexController.postLogin(...args).catch(e => console.log(e.message)));


module.exports = router;