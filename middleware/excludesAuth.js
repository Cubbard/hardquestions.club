module.exports = excludesAuth;

function excludesAuth(req, res, next) {
    if (req.session.userid) {
        res.redirect('/app/profile');
    } else {
        next();
    }
}