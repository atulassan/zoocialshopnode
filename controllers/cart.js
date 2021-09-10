
var mCart = require("../models/cart");

Cart = {
    async create(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = await mCart.create(req);
        res.send(result);
    },
    async delete(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = await mCart.delete(req);
        console.log(result);
        res.send(result);
    },
    async lists(req, res) {
        var citems = req.session.cartitems;
        var result = await mCart.cart(req, true);
        res.render("shop/pages/cart", result);
        //res.setHeader('Content-Type', 'application/json');
        //res.send(JSON.stringify({ "status": 200, "method": 'lists', 'items': req.session.cartitems }));
    },
    async module(req, res) {
        var citems = req.session.cartitems;
        if (citems.length > 0 && typeof citems != 'undefined') {
            var result = await mCart.cart(req, true);
            res.render("shop/modules/minicart", result);
        } else {
            var str = `<div class="form-header">
                        <h4>Warenkorb</h4>
                        <div id="cartPopupClose" class="slideFormClose">×</div>
                        </div>
                        <div class="form-body form-scrolling">
                        <div class="noProductListing">
                        <img src="/images/noProductList.jpg" alt="">
                        <h3>kein Eintrag vorhanden</h3>
                        </div>
                        </div>
                        <div class="cart-total w-100">
                        <div class="mt-2 cart-form-buttons">
                        <div class="row">
                        <div class="col-md-6 col-sm-6 col-6">
                        <a href="/cart" class="view-cart-button btn btn-primary disabled">zum Warenkorb</a>
                        </div>
                        <div class="col-md-6 col-sm-6 col-6 text-right">
                        <a href="/checkout" class="view-cart-button btn btn-primary disabled">zur Kasse</a>
                        </div>
                        </div>
                        </div>
                        </div>
                        `;
            res.send(str);
        }
    },
    async update(req, res) {

        console.log(req.method);

        if (req.method.toLowerCase() === 'get') {
            var result = await mCart.cart(req);
            res.render("shop/modules/cartupdate", result);
        }

        if (req.method.toLowerCase() === 'post') {
            req.session.cartitems = [];
            req.session.cartitems = req.body.cartdata;
            res.setHeader('Content-Type', 'application/json');
            var result = { "status": 200, "method": 'update', 'items': req.session.cartitems };
            res.send(result);
        }

    },
    async miniCartUpdate(req, res) {

        console.log(req.method);

        if (req.method.toLowerCase() === 'get') {
            var result = await mCart.cart(req);
            res.render("shop/modules/minicart", result);
        }

        if (req.method.toLowerCase() === 'post') {
            req.session.cartitems = [];
            req.session.cartitems = req.body.cartdata;
            res.setHeader('Content-Type', 'application/json');
            var result = { "status": 200, "method": 'update', 'items': req.session.cartitems };
            res.send(result);
        }

    },
    async coupon(req, res) {
        res.setHeader('Content-Type', 'application/json');
        console.log(req.method);
        var result = await mCart.coupon(req);
        res.send(result);
    },
    async removeCoupon(req, res) {
        res.setHeader('Content-Type', 'application/json');
        req.session.coupon = {};
        var result = { status:200, message: "Erfolgreich entfernt" };
        res.send(result);
    },
}

module.exports = Cart;