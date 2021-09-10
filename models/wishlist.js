
Wishlist = {
    async create(req) {

        //res.setHeader('Content-Type', 'application/json');
        console.log(req.body);
        let favid = req.body.id;
        let favitems = req.session.favitems;

        let ckval = _.find(favitems, function (f) {
            return (f == favid);
        });

        if (!ckval || typeof ckval == 'undefined') {
            req.session.favitems.push(favid);
        }

        var data = JSON.stringify({ "status": true, "method": 'create', 'items': req.session.favitems });

        return data;

        //res.send(JSON.stringify({ "status": true, "method": 'create', 'items': req.session.favitems }));

    },
    delete(req) {

        //res.setHeader('Content-Type', 'application/json');

        let favid = req.body.id;
        var favitems = req.session.favitems;
        req.session.favitems = _.without(favitems, favid);

        for (var i = 0; i < favitems.length; i++) {
            if (favitems[i] == favid) {
                req.session.favitems.splice(favid, 1);
            }
        }

        console.log(req.session.favitems);

        var data = JSON.stringify({ "status": 200, "method": 'delete', 'items': req.session.favitems });
        
        return data;

        //res.send(JSON.stringify({ "status": 200, "method": 'delete', 'items': req.session.favitems }));
    },
    async lists(req) {

        var products = [];
        var mwst_2_5 = 0;
        var mwst_7_7 = 0;
        inputdata = {
            include: req.session.favitems
        }

        console.log(req.session.favitems);

        let creqdata = {
            per_page: 50,
            page: 1
        };

        if(req.session.favitems.length > 0) {
            products = await getWCApiAsync("products", inputdata);

            products.forEach((product, el) => {
                if(product.tax_class == 'mwst-2-5') {
                    mwst_2_5 += 1;
                }
                if(product.tax_class = "mwst-7-7") {
                    mwst_7_7 += 1;
                }
            });

        }
        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            products: products,
            categories: utls.getNestedChildren(categories, 0),
            mwst_2_5: mwst_2_5,
            mwst_7_7: mwst_7_7,
            metaInfo: {page: "wishlist"},
        }

        console.log(mwst_2_5);
        console.log(mwst_7_7);

        return data;
        //res.render("shop/pages/wishlist", data);
    },
    async wishlistupdate(req) {
        var products = [];
        inputdata = {
            include: req.session.favitems
        }
        if(req.session.favitems.length > 0) {
            products = await getWCApiAsync("products", inputdata);
        }
        data = {
            products: products
        }
        return data;
    },
    async list(req) {
        //res.setHeader('Content-Type', 'application/json');
        var data = JSON.stringify({ "status": 200, "method": 'list' });
        return data;
        //res.send(JSON.stringify({ "status": 200, "method": 'list' }));
    },
    async module(req) {
        //res.setHeader('Content-Type', 'application/json');

        let favitems = req.session.favitems;
        var mwst_2_5 = 0;
        var mwst_7_7 = 0;

        if (favitems.length > 0 && typeof favitems != 'undefined') {

            inputdata = {
                include: req.session.favitems
            }

            let favproducts = await getWCApiAsync("products", inputdata);

            favproducts.forEach((product, el) => {
                if(product.tax_class == 'mwst-2-5') {
                    mwst_2_5 += 1;
                }
                if(product.tax_class == "mwst-7-7") {
                    mwst_7_7 += 1;
                }
            });

            var data = {
                favproducts: favproducts,
                favcount: req.session.favitems.length,
                mwst_2_5: mwst_2_5,
                mwst_7_7: mwst_7_7
            }

            console.log(mwst_2_5);
            console.log(mwst_7_7);

        } else {
            var data = `<div class="form-header">
                       <h4>Wunschliste</h4>
                       <div id="favClose" class="slideFormClose">×</div>
                        </div>
                        <div class="noProductListing">
                        <img src="/images/noProductList.jpg" alt="">
                        <h3>kein Eintrag vorhanden</h3>
                        </div>
                        `;
            //res.send(str);
        }
        return data;
    }
}

module.exports = Wishlist;