const date = {
    now: () => Date.now(),
    plusDay: date => date + (24 * 60 * 60 * 1000),
    plusWeek: date => date + (7 * 24 * 60 * 60 * 1000)
}

module.exports = date;