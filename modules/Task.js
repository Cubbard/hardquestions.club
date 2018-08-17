const date = require('date-and-time');

class Task
{
    constructor(name, descr, group, type) {
        this.name  = name;
        this.descr = descr;
        this.group = group;
        this.type  = type;

        const now  = new Date(Date.now());
        const str = date.format(now, 'YYYY-MM-DD HH:mm:ss');
        this.expires = arguments[4] || str;
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

    static get K() { // king
        return 'K';
    }
}

if (module !== undefined) {
    module.exports = Task;
}
