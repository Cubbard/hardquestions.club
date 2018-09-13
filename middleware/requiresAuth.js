module.exports = requiresAuth;

function requiresAuth(req, res, next) {
    if (req.session.userid) {
        next();
    } else {
        res.redirect('/');
    }
}