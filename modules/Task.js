const date = require('date-and-time');

class Task
{
    constructor(title, descr, group) {
        this.title = title;
        this.descr = descr;
        this.group = group;

        const now  = new Date(Date.now());
        const str = date.format(now, 'YYYY-MM-DD HH:mm:ss');
        this.expires = arguments[3] || str;
    }

    static get A() { // animal
        return 'A';
    }

    static get S() { // serf
        return 'S';
    }

    static get K() { // knight
        return 'K';
    }

    static get L() { // lord
        return 'L';
    }

    static get Q() { // queen
        return 'K';
    }
}

module.exports = Task;
