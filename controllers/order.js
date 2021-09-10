
var mOrder = require("../models/order");

Order = {
    
    async orderSuccess(req, res) {
        //res.setHeader('Content-Type', 'application/json');
        var result = await mOrder.orderSuccess(req);
        //console.log(result);
        res.render("shop/pages/order-received", result);
        //res.send(result);
    },
    async orderPending(req, res) {
        console.log(req.method);
        if (req.method.toLowerCase() === 'get') {
            var result = await mOrder.orderPending(req);
            res.render("shop/pages/order-pending", result);
        }
        if (req.method.toLowerCase() === 'post') {
            res.setHeader('Content-Type', 'application/json');
            var result = await mOrder.pendingPaymentProcess(req);
            res.send(result);
        }
    },
    async orderCancel(req, res) {
        var result = await mOrder.orderCancel(req);
        res.render("shop/pages/order-cancel", result);
    },
    async viewOrder(req, res) {
        //res.setHeader('Content-Type', 'application/json');
        var result = await mOrder.orderSuccess(req);
        console.log(result);
        res.render("shop/pages/view-order", result);
        //res.send(result);
    },
    async lists(req, res) {
        //res.setHeader('Content-Type', 'application/json');
        var result = await mOrder.lists(req);
        res.render("shop/pages/myorders", result);
        //res.send(result);
    },
    async orderPdfs(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = await mOrder.orderPdfs(req);
        res.send(result);
    },

}

module.exports = Order;