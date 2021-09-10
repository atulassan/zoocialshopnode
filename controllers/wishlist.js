var mWishlist = require("../models/wishlist");

Wishlist = {
    async create(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = await mWishlist.create(req);
        res.send(result);
    },
    async delete(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = await mWishlist.delete(req);
        res.send(result);
    },
    async lists(req, res) {
        var result = await mWishlist.lists(req);
        res.render("shop/pages/wishlist", data);
    },
    async wishlistupdate(req, res) {
        var result = await mWishlist.wishlistupdate(req);
        res.render("shop/modules/wishlistupdate", data);
    },
    async list(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = await mWishlist.list(req);
        res.send(result);
    },
    async module(req, res) {
        //res.setHeader('Content-Type', 'application/json');

        let favitems = req.session.favitems;

        if (favitems.length > 0 && typeof favitems != 'undefined') {
            var result = await mWishlist.module(req);
            res.render("shop/modules/wishlist", result);
        } else {
            var result = `<div class="form-header">
                       <h4>Wunschliste</h4>
                       <div id="favClose" class="slideFormClose">×</div>
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
                        <div class="col-md-12 col-sm-12 col-12">
                        <a href="javascript:;" class="view-cart-button btn btn-primary disabled">zur Wunschliste</a>
                        </div>
                        </div>
                        </div>
                        </div>
                        `;
            res.send(result);
        }
    }
}

module.exports = Wishlist;