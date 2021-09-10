const mtestprod = require('../models/testprod');

Testprod = {
    async lists(req, res) {
        var result = await mtestprod.lists(req);
        res.render("shop/pages/shop", result);
    }
};

module.exports = Testprod;