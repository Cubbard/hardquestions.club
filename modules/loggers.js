const cycleLogger = cycle => {
    let ba, ed, bd;

    ba = cycle.begin_after ? new Date(cycle.begin_after).toLocaleString() : null;
    ed = cycle.end_date    ? new Date(cycle.end_date).toLocaleString()   : null;
    bd = cycle.begin_date  ? new Date(cycle.begin_date).toLocaleString()  : null;
    let msg = `cycle(${cycle.id}) begin_date: ${bd}, end_date: ${ed}, begin_after: ${ba}`;
    console.log(msg);
}

module.exports = { cycleLogger };