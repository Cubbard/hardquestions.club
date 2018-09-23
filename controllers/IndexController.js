const Crypto = require('../modules/Crypto.js');
const AccountRequest = require('../modules/AccountRequest.js');
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

    static async request(req, res, next) {
        const {identity, password, email} = req.body

        let salt = Crypto.getSalt(), pepp = Crypto.getPepper(), pass_hash = Crypto.createHash(password, salt, pepp);
        let params = {
            identity,
            salt,
            pass_hash,
            email
        }
        AccountRequest.query().insert(params).then(result => {
            res.redirect('/thanks');
        })
    }

    static async earlyAccess(req, res, next) {
        res.render('early-access');
    }

    static async faq(req, res, next) {
        res.render('faq');
    }

    static async thanks(req, res, next) {
        res.render('thanks');
    }
}

module.exports = IndexController;