const Queue = require('./Queue');
const date = require('./date.js');

class Game
{
    static async start(cycle) {
        await cycle.$query().patch({begin_date: date.now()});
    }

    static assignRoles(users) {
        // assign user classes
        let unassigned = ['A', 'S', 'K', 'L'], updated = [];

        // assign king
        let king  = users[Math.floor(Math.random() * users.length)];
        king.group_type = 'Q'
        updated.push(king);

        users = users.filter(elem => elem.id !== king.id);
        while (unassigned.length > 0) {
            if (users.length === 0) break;

            let user = users.pop();
            let type = unassigned[Math.floor(Math.random() * unassigned.length)];
            user.group_type = type;
            updated.push(user);
            unassigned = unassigned.filter(elem => elem !== type);
        }

        // assign remaining users
        updated.forEach(async user => {
            await user.$query().patch({group_type: user.group_type});
        })
    }

    static async resetTasks() {
        await Queue.query().patch({is_active: 0, queue_order: 0, is_head: 0});
    }

    static assignTasks() {
        let firstA, firstS, firstK,
            firstL, firstQ;
        
        firstA = Queue.query().where('group_type', '=', 'A').first();
        firstS = Queue.query().where('group_type', '=', 'S').first();
        firstK = Queue.query().where('group_type', '=', 'K').first();
        firstL = Queue.query().where('group_type', '=', 'L').first();
        firstQ = Queue.query().where('group_type', '=', 'Q').first();

        Queue.push(firstA);
        Queue.push(firstS);
        Queue.push(firstK);
        Queue.push(firstL);
        Queue.push(firstQ);
    }

    static assignClass(user) {
        let unassigned = ['A', 'S', 'K', 'L'];
        return user.$query().patch({group_type: unassigned[Math.floor(Math.random() * unassigned.length)]});
    }
}

module.exports = Game;