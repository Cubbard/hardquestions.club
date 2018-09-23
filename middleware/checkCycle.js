const Cycle = require('../modules/Cycle.js');
const User  = require('../modules/User.js');
const date  = require('../modules/date.js');
const Game  = require('../modules/Game');
const {cycleLogger} = require('../modules/loggers.js');

module.exports = checkCycle;


async function checkCycle(req, res, next) {
    let ongoing = await Cycle.ongoing();
    res.locals.ongoing = ongoing

    cycleLogger(ongoing);

    if (Cycle.isInProgress(ongoing)) {
        next();
    }
    else {
        if (ongoing.begin_date) { // need to create new
            await ongoing.$query().patch({end_date: date.now()});
            ongoing.participants.forEach(async user => {
                await user.$query().patch({group_type: null, total_cycles: (user.total_cycles + 1), daily_proof: 0, score: 0});
            });

            let params = {total_participants: 0, begin_after: Cycle.plusStagingDuration(ongoing.end_date)};
            ongoing = await Cycle.query().eager('participants').insert(params);
        }
        
        res.locals.ongoing = ongoing; // need for staging page

        if (Cycle.isInStaging(ongoing)) {
            return next();
        }

        if (ongoing.participants.length >= 2) {
            // start new cycle
            Game.start(ongoing);
            Game.assignRoles(ongoing.participants);
            Game.resetTasks();
            
            //Game.assignTasks();
        }
        next();
    }
}