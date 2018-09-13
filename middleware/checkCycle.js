const Cycle = require('../modules/Cycle.js');
const User  = require('../modules/User.js');
const date  = require('../modules/date.js');
const Game  = require('../modules/Game');

module.exports = checkCycle;

async function checkCycle(req, res, next) {
    req.staging = true;
    let ongoing = await Cycle.ongoing();

    if (Cycle.isInProgress(ongoing)) {
        req.staging = false;
        next();
    }
    else {
        let participants = await User.query().where('next_cycle', '=', 1);

        if (ongoing.begin_date) { // need to create new
            await ongoing.$query().patch({end_date: date.now()});

            let params = {total_participants: participants.length, begin_after: Cycle.plusStagingDuration(ongoing.end_date)};
            ongoing = await Cycle.query().insert(params);
        } else
            await ongoing.$query().patch({total_participants: participants.length});
        
        if (Cycle.isInStaging(ongoing)) {
            return next();
        }

        if (participants.length >= 2) {
            req.staging = false;

            // start new cycle
            Game.start(ongoing);

            Game.assignRoles(participants);
            // save
            participants.forEach(async user => {
                await user.$query().patch({cycle_id: ongoing.id, next_cycle: 0, score: 0, group_type: user.group_type, total_cycles: (user.total_cycles + 1)});
            });

            Game.resetTasks();
            //Game.assignTasks();
        }
        next();
    }
}