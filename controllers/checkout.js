
var mCheckout = require("../models/checkout");
var mCart = require("../models/cart");

Checkout = {

    async checkout(req, res) {
        var isCartAvail = await mCart.isCartAvail(req);
        var cart = await mCart.cart(req);
        //console.log(isCartAvail);
        //console.log(cart);
        if(isCartAvail) {
            var result = await mCheckout.checkout(req);
            result.cart = cart;
            res.render("shop/pages/checkout", result);
        } else {
            res.redirect('/cart');
        }
    },
    async onepagecheckout(req, res) {
        var isCartAvail = await mCart.isCartAvail(req);
        var cart = await mCart.cart(req);
        //console.log(isCartAvail);
        //console.log(cart);
        if(isCartAvail) {
            var result = await mCheckout.commononepagecheckout(req);
            result.cart = cart;
            res.render("shop/pages/checkout_new", result);
        } else {
            res.redirect('/cart');
        }
    },
    async order(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = await mCheckout.createorder(req);
        
        if(result.status) {

            var options = {
                url: "https://postfinance.zoocial.ch/shop.php",
                data: { amount: parseFloat(result.order_total), order_id: result.order_id, order_key: result.order_key },
            }
            
              var reqData = await utls.requestPostData(options);
              var payres = await reqData;
              var paymentUrl = payres.response.url + '&amount=' + payres.response.amount + '&transaction_id=' + payres.response.transaction_id + '&order_id=' + payres.response.order_id + '&order_key=' + payres.response.order_key;
              payres.paymentUrl = paymentUrl;
              payres.message = result.message;
              req.session.transaction_id = payres.response.transaction_id != undefined ? (payres.response.transaction_id != "" ? payres.response.transaction_id : '') : '';
              app.locals.transaction_id = payres.response.transaction_id != undefined ? (payres.response.transaction_id != "" ? payres.response.transaction_id : '') : '';
        }

        console.log(payres);

        if(payres.status) {
            //res.status(301).redirect(payres);
            res.send(payres);
        } else {
            res.send(result);
        }
    },
    async onepageorder(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = await mCheckout.onepageorder(req);
        
        console.log(result);

        if(result.status) {

            var options = {
                url: "https://postfinance.zoocial.ch/shop.php",
                data: { amount: parseFloat(result.order_total), order_id: result.order_id, order_key: result.order_key },
            }
            
            var reqData = await utls.requestPostData(options);
            var payres = await reqData;
            var paymentUrl = payres.response.url + '&amount=' + payres.response.amount + '&transaction_id=' + payres.response.transaction_id + '&order_id=' + payres.response.order_id + '&order_key=' + payres.response.order_key;
            payres.paymentUrl = paymentUrl;
            payres.message = result.message;
            req.session.transaction_id = payres.response.transaction_id != undefined ? (payres.response.transaction_id != "" ? payres.response.transaction_id : '') : '';
        }

        console.log(payres);

        if(payres.status) {
            //res.status(301).redirect(payres);
            res.send(payres);
        } else {
            res.send(result);
        }
    },
    async onepagecart(req, res){
        var cart = await mCart.cart(req);
        console.log(cart);
        data = {
            cart: cart,
        }
        res.render("shop/modules/onepage-cart", data);
    },
}

module.exports = Checkout;