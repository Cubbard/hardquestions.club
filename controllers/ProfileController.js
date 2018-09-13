/* dev modules */
const User  = require('../modules/User.js');
const Cycle = require('../modules/Cycle.js');
const Queue = require('../modules/Queue.js');

class ProfileController
{
    static async index(req, res, next) {
        const user = await User.query().where('id', '=', req.session.userid).first();
        if (!user.cycle_id || req.staging)
            return res.redirect('profile/staging');

        let cycle = await user.$relatedQuery('cycle');
    }
}

module.exports = ProfileController;