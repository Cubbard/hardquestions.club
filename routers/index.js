const express = require('express');
const router  = express.Router();

const User = require('../modules/User.js');

/* middleware */
const excludesAuth = require('../middleware/excludesAuth.js');

/* controllers */
const IndexController = require('../controllers/IndexController.js');

router.get('/', excludesAuth, (...args) => IndexController.index(...args).catch(e => console.log(e.message)));
router.route('/login')
    .get(excludesAuth, (...args) => IndexController.login(...args).catch(e => console.log(e.message)))
    .post(excludesAuth, (...args) => IndexController.postLogin(...args).catch(e => console.log(e.message)));


module.exports = router;