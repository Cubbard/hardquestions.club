const Queue = require('../modules/Queue.js');
const User  =  require('../modules/User.js');
const date  =  require('../modules/date.js');

module.exports = checkExpiration;

async function checkExpiration(req, res, next) {
    const heads = await Queue.whereActive().andWhere('is_head', '=', 1);
    heads.forEach(async head => {
        if (date.now() > date.plusDays(head.set_active, head.expires)) {
            let users = await User.activeUsers(head.group_type);
            users.forEach(async user => {
                let daily = head.points * (user.daily_proof ? 1 : -1);
                await user.$query().patch({score: (user.score + daily), total_score: (user.total_score + daily), daily_proof: 0});
            });
            let old = await Queue.pop(head.group_type);
            Queue.push(old);
        }
    });
    next();
}