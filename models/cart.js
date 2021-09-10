
Cart = {
    create(req) {

        /*console.log(req.body);
        return false;*/

        //res.setHeader('Content-Type', 'application/json');
        let pid = parseInt(req.body.id);
        let qty = parseInt(req.body.quantity);
        let vid = parseInt(req.body.variation_id);
        let citems = req.session.cartitems;
        let favitems = req.session.favitems;
        let ckavail = false;
        let availvarid = false;

        if(favitems.length > 0) {
            
            var wishItems = favitems.filter(function(favitem) {
                return favitem != pid;   
            });

            req.session.favitems = wishItems;
        }

        citems.forEach((cartitem, el) => {
            //var quantity = citems[el].quantity;
            if (parseInt(cartitem.id) == pid) {
                ckavail = true;
                if (!cartitem.hasOwnProperty('variation_id')) {
                    req.session.cartitems[el].quantity += parseInt(qty);
                } else {
                    if (cartitem.variation_id == vid) {
                        req.session.cartitems[el].quantity += parseInt(qty);
                        availvarid = true;
                    }
                }
                //console.log(req.session.cartitems[el]);
            }
        });

        //cart = { id: pid, quantity: qty };
        //cart = { id: pid, quantity: qty, variation_id: vid };
        cart = (req.body.hasOwnProperty('id')) ? req.body : {};

        if (!ckavail || !availvarid) {
            req.session.cartitems.push(cart);
        }

        var data = JSON.stringify({ "status": 200, "method": 'create', 'items': req.session.cartitems });
        return data;

        //res.send(JSON.stringify({ "status": 200, "method": 'create', 'items': req.session.cartitems }));
    },
    delete(req) {

        //res.setHeader('Content-Type', 'application/json');

        var cartitems = req.session.cartitems;
        let pid = req.body.id;
        let variation_id = req.body.variation_id;
        let ptype = req.body.product_type;
        console.log(pid);
        console.log(variation_id);
        console.log(ptype);
        req.session.cartitems = cartitems.filter(cartitem => {
            if (ptype == 'variable' && variation_id > 0) {
                return cartitem.variation_id != variation_id;
            } else {
                return cartitem.id != pid;
            }
        });

        console.log(req.session.cartitems);

        if(req.session.cartitems.length == 0) {
            req.session.coupon = {};
        }

        var data = JSON.stringify({ "status": 200, "method": 'delete', 'items': req.session.cartitems });

        return data;

        //res.send(JSON.stringify({ "status": 200, "method": 'delete', 'items': req.session.cartitems }));
    },
    async lists(req) {

        var citems = req.session.cartitems;
        //var cartitems = [];
        var carttotals = 0;
        var pitems = [];
        var itms = [];

        let creqdata = {
            per_page: 50,
            page: 1
        };

        //console.log(citems);
        let categories = await getWCApiAsync("products/categories", creqdata);

        if (citems.length > 0 && typeof citems != 'undefined') {

            //return only IDS
            var cids = citems.map((citem) => {
                return citem.id;
            });

            inputdata = {
                include: cids
            }

            let cartproducts = await getWCApiAsync("products", inputdata);

            var results = utls.joinObjects(citems, cartproducts);
            var st = 0;
            results.forEach(result => {
                result.subtotal = parseInt(result.quantity) * parseFloat(result.price);
                st += parseInt(result.quantity) * parseFloat(result.price);
                pitems.push(result);
            });

            //console.log(pitems);
            //console.log(st);

            data = {
                cartproducts: pitems,
                carttotals: st,
                categories: utls.getNestedChildren(categories, 0),
                metaInfo: {page: "warenkorb"},
            }

        } else {
            data = {
                cartproducts: [],
                carttotals: 0,
                categories: utls.getNestedChildren(categories, 0),
                metaInfo: {page: "warenkorb"},
            }
        }
        return data;
        //res.setHeader('Content-Type', 'application/json');
        //res.send(JSON.stringify({ "status": 200, "method": 'lists', 'items': req.session.cartitems }));
    },
    async cart(req, cats = false) {
        var citems = req.session.cartitems;
        var couponAvail = Object.keys(req.session.coupon).length > 0 ? true : false;
        var cartitems = [];
        var cartvitems = [];
        var carttotal = 0;
        var pitems = [];
        var discount = 0;
        var mwst_2_5 = 0;
        var mwst_7_7 = 0;
        var shipping_cost = 0;
        var finaltotal = 0;
        var payment_fees = 0;
        var shipping_lines = {};
        var remiAvail = false;
        var remiMetaUpd = [];
        var vetsexklusiv = false;
        var noDiscountTotal = 0;

        let creqdata = {
            per_page: 50,
            page: 1
        };

        //console.log(citems);
        if (cats) {
            var categories = await getWCApiAsync("products/categories", creqdata);
        }

        if (citems.length > 0 && typeof (citems) != 'undefined') {

            // return non variation objects
            var cdata = citems.filter(function (itm) {
                return !itm.hasOwnProperty('variation_id');
            });

            // return variation objects
            var cvdata = citems.filter(function (itm) {
                return itm.hasOwnProperty('variation_id');
            });

            //return only cdata IDS
            var cids = cdata.map((citem) => {
                return citem.id;
            });

            //console.log(cids.length);

            inputdata = {
                include: cids
            }

            if (cids.length > 0) {
                let cproducts = await getWCApiAsync("products", inputdata); 
                var cartitems = await utls.joinObjects(cdata, cproducts);
            }

            var minqty = {};
            var disPercentage = {};
            var discount_quantity = null;
            var discount_percentage = null;
            for (const file of cvdata) {
                //console.log(file.quantity);
                var product = await getWCApiAsync("products/" + parseInt(file.id));
                //console.log(product);
                var variation = await getWCApiAsync("products/" + parseInt(file.id) + "/variations/" + parseInt(file.variation_id));
                //console.log(variation);
                variation.meta_data.forEach((metainfo, el) => {
                    if (metainfo.key == "discount_quantity") {
                        discount_quantity = metainfo;
                    }
                    if (metainfo.key == "discount_percentage") {
                        discount_percentage = metainfo;
                    }
                });
                //console.log(file.quantity);
                //console.log(parseInt(minqty.value));
                //console.log(parseFloat(disPercentage.value));
                product.variation_id = file.variation_id;
                product.quantity = file.quantity;
                product.sku = variation.sku;
                product.price = (parseFloat(discount_percentage.value) > 0 && parseInt(file.quantity) >= parseInt(discount_quantity.value)) ? await utls.discountPrice(variation.price, discount_percentage.value) : variation.price;
                /*if (parseFloat(disPercentage.value) > 0 && parseInt(file.quantity) >= parseInt(minqty.value)) {
                    console.log('11111');
                    product.price = await utls.discountPrice(variation.price, disPercentage.value);
                } else {
                    console.log('22222');
                    product.price = variation.price;
                }*/
                //product.price = variation.price;
                product.regular_price = variation.regular_price;
                product.sale_price = variation.sale_price;
                product.attributes = variation.attributes;
                product.images = product.images;
                cartvitems.push(product);
            }

            //console.log(cartvitems);

            var cartfinal = [...cartitems, ...cartvitems];

            cartfinal.forEach(result => {

                result.meta_data.forEach((metainfo, el) => {
                    if(metainfo.key == "disp_weight") {
                        result.disp_weight = metainfo.value;
                    }
                    if(metainfo.key == "vetsexklusiv" && metainfo.value) {
                        vetsexklusiv = true;
                    }
                });

                result.subtotal = parseInt(result.quantity) * parseFloat(result.price);
                carttotal += parseInt(result.quantity) * parseFloat(result.price);
                discount += parseInt(result.quantity) * (parseFloat(result.regular_price) - parseFloat(result.price));
                if(result.tax_class == 'mwst-2-5') {
                    mwst_2_5 += ((parseInt(result.quantity) * parseFloat(result.price)) / 102.5) * 2.5;
                }
                if(result.tax_class == 'mwst-7-7') {
                    mwst_7_7 += ((parseInt(result.quantity) * parseFloat(result.price)) / 107.7) * 7.7;
                }
                let cartUpd = {};
                cartUpd.id = result.id;
                //cartUpd.meta_data = [];
                //cartUpd.meta_data.push({ "key": "price", "value": parseFloat(result.price) });
                var price_meta = { "key": "price", "value": parseFloat(result.subtotal) };
                var remi_meta = { "key":"remi", "value":"Remi Produkt" };
                //cartUpd.meta_data.push(price_meta);
                cartUpd.quantity = result.quantity;
                if(result.hasOwnProperty('variation_id')) {
                    cartUpd.variation_id = result.variation_id;
                }
                
                if(result.shipping_class == "remi") {
                    result.remi = "Remi";
                    cartUpd.meta_data = [remi_meta, price_meta];
                    remiAvail = true;
                } else {
                    cartUpd.meta_data = [price_meta];
                }

                pitems.push(result);
                remiMetaUpd.push(cartUpd);
            });
            
            //console.log(JSON.stringify(remiMetaUpd));
            req.session.cartitems = remiMetaUpd;

            //console.log(remiMetaUpd);
            //console.log(req.session.cartitems);

            //shipment price include
            /*if(parseFloat(carttotal) < 100) {
                shipping_cost += 7.50;
            }*/
            
            if(remiAvail) {
                console.log(remiAvail + ' Remi Available');
            }

            shipping_cost += carttotal < 100 && !remiAvail ? 7.50 : 0.00; // shipping cost minimum total 100 be charge 7.50

            payment_fees += (parseFloat(carttotal)/100) * 2.9; //payment method fees 2.9%

            //without discount display purpose only
            noDiscountTotal = carttotal;

            //finaltotal += carttotal + shipping_cost + payment_fees;
            
            // Hidden for
            //finaltotal += carttotal + shipping_cost;

            if(carttotal < 100 && !remiAvail) {
                
                shipping_lines.method_id = "flat_rate";
                shipping_lines.method_title= "Flat Rate";
                shipping_lines.total = "7.50";

                if(!couponAvail) {
                    if(mwst_7_7 > 0) {
                        mwst_7_7 += (7.50/107.7) * 7.7;
                    } else {
                        mwst_2_5 += (7.50/102.5) * 2.5;
                    }
                }

            } else {
                shipping_lines.method_id = "free_shipping";
                shipping_lines.method_title= "Free Shipping";
            }

            //coupon applied
            if(Object.keys(req.session.coupon).length > 0) {

                let inputData = { code: req.session.coupon.code };
                let couponResult = await getWCApiAsync("coupons", inputData);
                console.log(couponResult);
                if(couponResult.length > 0) {
                    let couponInfo = {
                        id: couponResult[0].id, code: couponResult[0].code, amount: couponResult[0].amount, discount_type: couponResult[0].discount_type,
                    }
                    req.session.coupon = couponInfo;
                    if(req.session.coupon.hasOwnProperty('discount_type') && req.session.coupon.discount_type == 'fixed_cart') {
                        
                        //Discount Tax
                        carttotal = carttotal - req.session.coupon.amount;

                        //discount percentage also affect 7.7% tax
                        /*if(mwst_7_7 > 0) {
                            let mwst7_7_percentage = ((parseInt(req.session.coupon.amount) / finaltotal) * 100);
                            mwst_7_7 = mwst_7_7 - ((mwst_7_7 / 100) * mwst7_7_percentage);
                        }
                        // discount percentage also affect 2.5% tax
                        if(mwst_2_5 > 0) {
                            let mwst2_5_percentage = ((parseInt(req.session.coupon.amount) / finaltotal) * 100);
                            mwst_2_5 = mwst_2_5 - ((mwst_2_5 / 100) * mwst2_5_percentage);
                        }*/

                    }
                    if(req.session.coupon.hasOwnProperty('discount_type') && req.session.coupon.discount_type == 'percent') {
                        
                        //Discount percentage also affect 7.7% tax
                        if(mwst_7_7 > 0) {
                            mwst_7_7 = mwst_7_7 - ((mwst_7_7 / 100) * parseFloat(req.session.coupon.amount));
                        }
                        //Discount percentage also affect 2.5% tax
                        if(mwst_2_5 > 0) {
                            mwst_2_5 = mwst_2_5 - ((mwst_2_5 / 100) * parseFloat(req.session.coupon.amount));
                        }

                        //Discount Tax
                        carttotal = carttotal - ((carttotal / 100) * parseFloat(req.session.coupon.amount));

                    }
                    } else {
                        req.session.coupon = {};
                    }
                
                console.log(req.session.coupon);

            }

            //console.log(vetsexklusiv);

            //console.log(mwst_2_5);
            //console.log(mwst_7_7);

            console.log('++++++++++++++++ Coupon Available or Not +++++++++++++');
            console.log(couponAvail);
            console.log(noDiscountTotal);
            console.log(carttotal);

            if(carttotal < 100 && !remiAvail) {
                if(couponAvail) {
                    if(mwst_7_7 > 0) {
                        mwst_7_7 += (7.50/107.7) * 7.7;
                    } else {
                        mwst_2_5 += (7.50/102.5) * 2.5;
                    }
                }
            }

            finaltotal += carttotal + shipping_cost;

            var data = {
                cartproducts: pitems,
                carttotal: carttotal,
                discount: discount,
                categories: (cats) ? utls.getNestedChildren(categories, 0) : null,
                cats: (cats) ? categories : null,
                mwst_2_5: mwst_2_5,
                mwst_7_7: mwst_7_7,
                shipping_cost: shipping_cost,
                finaltotal: finaltotal,
                //payment_fees: payment_fees,
                shipping_lines: shipping_lines,
                vetsexklusiv: vetsexklusiv,
                metaInfo: {page: "warenkorb"},
                coupon: (Object.keys(req.session.coupon).length > 0) ? req.session.coupon : {},
                noDiscountTotal: noDiscountTotal,
            }

        } else {
            var data = {
                cartproducts: null,
                carttotal: null,
                discount: null,
                categories: (cats) ? utls.getNestedChildren(categories, 0) : null,
                cats: (cats) ? categories : null,
                mwst_2_5: null,
                mwst_7_7: null,
                shipping_cost: null,
                finaltotal: null,
                //payment_fees: null,
                shipping_lines: null,
                vetsexklusiv: vetsexklusiv,
                metaInfo: {page: "warenkorb"},
                coupon: {},
                noDiscountTotal: null,
            }
        }

        return data;
    },
    async isCartAvail(req) {
        var citems = req.session.cartitems;
        return (parseInt(citems.length) > 0) ? true : false;
    },
    async coupon(req) {
        let data = {};
        let coupon = req.body.coupon;
        let inputData = { code: coupon };
        let couponResult = await getWCApiAsync("coupons", inputData);
        console.log(couponResult);
        if(couponResult.length > 0) {
            let couponInfo = {
                id: couponResult[0].id, code: couponResult[0].code, amount: couponResult[0].amount, discount_type: couponResult[0].discount_type,
            }
            req.session.coupon = couponInfo;
            data = { status: true, message: "Erfolgreich hinzugefügt" };
        } else {
            data = { status: false, message: "Gutschein ist ungültig oder abgelaufen" };
        }
        return data;
    },
}

module.exports = Cart;