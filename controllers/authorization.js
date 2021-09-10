
var mAuthorization = require("../models/authorization");

Authorization = {

    async register(req, res) {

        console.log(req.method);

        if (req.method.toLowerCase() === 'get') {
            var result = await mAuthorization.register(req);
            res.render("shop/pages/register", result);
        }

        if (req.method.toLowerCase() === 'post') {
            res.setHeader('Content-Type', 'application/json');
           // var result = await mAuthorization.create(req);
            var result = await mAuthorization.createCommonReg(req);
            res.send(result);
        }

        //res.setHeader('Content-Type', 'application/json');
        //res.send(JSON.stringify({ "status": 200, "method": 'register', 'items': req.session.cartitems }));
    },
    async oneguestregister(req, res) {
        res.setHeader('Content-Type', 'application/json');
        //var result = await mAuthorization.oneguestregister(req);
        var result = await mAuthorization.commononeguestregister(req);
        res.send(result);
    },
    async login(req, res) {

        console.log(req.method);

        if (req.method.toLowerCase() === 'get') { 
            var result = await mAuthorization.login(req);
            res.render("shop/pages/login", result);
        }

        if (req.method.toLowerCase() === 'post') {
            res.setHeader('Content-Type', 'application/json');
            //var result = await mAuthorization.authorize(req);
            var result = await mAuthorization.commonAuthorize(req);
            var citems = req.session.cartitems;
            //result.redirect = (citems.length > 0) ? "/checkout": "/";;
            //result.redirect = "/mein_ubersicht";
            res.send(result);
        }

        //res.setHeader('Content-Type', 'application/json');
        //res.send(JSON.stringify({ "status": 200, "method": 'register', 'items': req.session.cartitems }));
    },
   
    async isAuthorize(req, res, next) {
        if (req.session.auth.hasOwnProperty('id')) {
            next();
        } else {
            res.redirect("/");
        }
    },
    async authChecker(req, res, next) {
        if (req.session.auth.hasOwnProperty('id')) {
            req.flash('notify', 'You Have Been Already Login, Please Continue shopping...');
            res.redirect("/");
        } else {
            next();
        }
    },
    async logout(req, res) {
        req.session.auth = {};
        req.flash('notify', 'Logout Successfully');
        res.redirect("/");
    },
    async myAccount(req, res) {
        var result = await mAuthorization.myAccount(req);
        res.render("shop/pages/myaccount", result);
    },
    async updateAccount(req, res) {

        console.log(req.method);

        if (req.method.toLowerCase() === 'get') { 
            var result = await mAuthorization.benutzerdaten(req);
            res.render("shop/pages/benutzerdaten", result);
        }
        if (req.method.toLowerCase() === 'post') {
            res.setHeader('Content-Type', 'application/json');
           // var result = await mAuthorization.updateAccount(req);
            var result = await mAuthorization.commonupdateAccount(req);
            res.send(result);
        }
        
    },
    async userMenus(req, res) {
        var result = await mAuthorization.userMenus(req);
        res.render("shop/modules/usermenus", result);
    },
    async userMenusn(req, res) {
        res.setHeader("Content-Type", "application/json");
        var result = await mAuthorization.userMenusn(req);
        res.json(result);
        //res.render("shop/modul,es/usermenus", result);
    },
    async passwortandern(req, res) {
        console.log(req.method);
        if (req.method.toLowerCase() === 'get') {
            var result = await mAuthorization.passwortandern(req);
            res.render("shop/pages/passwortandern", result);
        }
        if (req.method.toLowerCase() === 'post') {
            res.setHeader('Content-Type', 'application/json');
            //var result = await mAuthorization.passwordUpdate(req);
            var result = await mAuthorization.commonpasswordUpdate(req);
            res.send(result);
        }
    },
    async passwortvergessen(req, res) {
        console.log(req.method);
        if (req.method.toLowerCase() === 'get') {
            //var result = await mAuthorization.passwortvergessen(req);
            var result = await mAuthorization.commonpasswortvergessen(req);
            res.render("shop/pages/passwortvergessen", result);
        }
        if (req.method.toLowerCase() === 'post') {
            res.setHeader('Content-Type', 'application/json');
            var result = await mAuthorization.forgotpassword(req);
            res.send(result);
        }
    },
    async passwortzuruecksetzen(req, res) {
        console.log(req.method);
        if (req.method.toLowerCase() === 'get') {
           // var result = await mAuthorization.passwortzuruecksetzen(req);
            var result = await mAuthorization.commonpasswortzuruecksetzen(req);
            res.render("shop/pages/passwort-zuruecksetzen", result);
        }
        if (req.method.toLowerCase() === 'post') {
            res.setHeader('Content-Type', 'application/json');
            //var result = await mAuthorization.forgotpassword(req);
            var result = await mAuthorization.commonforgotpassword(req);
            res.send(result);
        }
    },
    async tokengenerate(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = await mAuthorization.commontokengenerate(req);
        //var result = await mAuthorization.tokengenerate(req);
        res.send(result);
    },
    async adressen_verwalten(req, res) {
       // var result = await mAuthorization.adressen_verwalten(req);
        var result = await mAuthorization.commonadressen_verwalten(req);
        res.render("shop/pages/adressen_verwalten", result);
    },
    async newshipaddress(req, res) {
        //var result = await mAuthorization.newshipaddress(req);
        var result = await mAuthorization.commonnewshipaddress(req);
        res.send(result);
    },
    async editshipaddress(req, res) {
        //var result = await mAuthorization.editshipaddress(req);
        var result = await mAuthorization.commoneditshipaddress(req);
        res.send(result);
    },
    async removeshipaddress(req, res) {
        //var result = await mAuthorization.removeshipaddress(req);
        var result = await mAuthorization.commonremoveshipaddress(req);
        res.send(result);
    },
    async zoocialanmelden(req, res) {
        var result = await mAuthorization.zoocialanmelden(req);
        //res.send(result);  
        var citems = req.session.cartitems;
        res.send(result);                                                           
    },
    async newsletterPost(req, res) {
        var result = await mAuthorization.newsletterPost(req);
        res.send(result);                                                             
    }
}

module.exports = Authorization;