const Crypto = require('../modules/Crypto.js');
const {PageModel} = require('../modules/pageProps.js');

class IndexController
{
    static async index (req, res, next) {
        const model = req.model || Object.create(PageModel);
        model.page = 'Home';
        res.render('index', model);
    }

    static async faq(req, res, next) {
        const model = req.model || Object.create(PageModel);
        model.page = 'FAQ';
        res.render('faq', model);
    }

    static async login(req, res, next) {
        const model = req.model || Object.create(PageModel);
        model.page = 'Login';
        res.render('login', model);
    }

    static async postLogin(req, res, next) {
        Crypto.tryUser(req.body.identity, req.body.password).then( user => {
            if (user) {
                req.session.userid = user.id;
                res.redirect('/app/profile');
            } else {
                res.redirect('/');
            }
        });
    }
}

module.exports = IndexController;