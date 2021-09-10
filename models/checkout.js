
var mCart = require("../models/cart");

Checkout = {
    async checkout(req) {

        let creqdata = {
            per_page: 50,
            page: 1
        };

        let categories = await getWCApiAsync("products/categories", creqdata);
        //let shipping_methods = await getWCApiAsync("shipping/zones/5/methods");
        let shipping_methods = await getWCApiAsync("shipping_methods");
        let payment_methods = await getWCApiAsync("payment_gateways");

        data = {
            categories: utls.getNestedChildren(categories, 0),
            userdata: (req.session.auth.hasOwnProperty('id')) ? req.session.auth : 0,
            shipmethods: shipping_methods,
            paymethods: payment_methods,
            metaInfo: {page: "checkout"},
        }

        return data;
    },
    async onepagecheckout(req) {

        let creqdata = {
            per_page: 50,
            page: 1
        };

        var shipaddresses = [];

        //var userdata = (req.session.auth.hasOwnProperty('id')) ? req.session.auth : {};
        var userdata = req.session.auth;

        let categories = await getWCApiAsync("products/categories", creqdata);
        //let shipping_methods = await getWCApiAsync("shipping/zones/5/methods");
        let shipping_methods = await getWCApiAsync("shipping_methods");
        let payment_methods = await getWCApiAsync("payment_gateways");
        if(userdata.hasOwnProperty('id')) {
            let customer = await getWCApiAsync("customers/" +userdata.id);
            customer.meta_data.forEach((meta, idx) => {
                if(meta.key == 'shipaddresses') {
                    shipaddresses = meta.value;
                }
            });
        }

        console.log("++++++++++++++++++++++++++++++++");    
        console.log(shipaddresses);
        console.log("++++++++++++++++++++++++++++++++");    

        data = {
            categories: utls.getNestedChildren(categories, 0),
            userdata: userdata,
            shipmethods: shipping_methods,
            paymethods: payment_methods,
            shipaddresses: shipaddresses,
            metaInfo: {page: "onepagecheckout"},
        }

        return data;
    },
    async commononepagecheckout(req) {

        let creqdata = {
            per_page: 50,
            page: 1
        };

        var shipaddresses = [];

        //var userdata = (req.session.auth.hasOwnProperty('id')) ? req.session.auth : {};
        var userdata = req.session.auth;
        var customer = "";
        var gval = "";

        let categories = await getWCApiAsync("products/categories", creqdata);
        //let shipping_methods = await getWCApiAsync("shipping/zones/5/methods");
        let shipping_methods = await getWCApiAsync("shipping_methods");
        let payment_methods = await getWCApiAsync("payment_gateways");
        if(userdata.hasOwnProperty('id')) {
            /*let customer = await getWCApiAsync("customers/" +userdata.id);
            customer.meta_data.forEach((meta, idx) => {
                if(meta.key == 'shipaddresses') {
                    shipaddresses = meta.value;
                }
            });*/
            var options = {
                url: "https://www.zoocial.ch/retrieve-all-shipping",
            
                data: {authkey: 'HE612533629606',user_id: userdata.id},
            }
            var reqData = await utls.requestPostDataCommon(options);
            customer = await reqData;
            gval = customer.shipping_address;
        }
        else{
            gval = shipaddresses;
        }

        console.log("++++++++++++++++++++++++++++++++");    
        //console.log(customer.shipping_address);
        console.log("++++++++++++++++++++++++++++++++");    

        data = {
            categories: utls.getNestedChildren(categories, 0),
            userdata: userdata,
            shipmethods: shipping_methods,
            paymethods: payment_methods,
            shipaddresses: gval,
            metaInfo: {page: "onepagecheckout"},
            coupon: (Object.keys(req.session.coupon).length > 0) ? req.session.coupon : {},
        }
        console.log(data);
        return data;
    },
    async createorder(req) {

        console.log(req.method);

        var citems = req.session.cartitems;
        var userdata = req.session.auth;
        var isUserAvail = Object.keys(userdata).length;

        var shopitems = [];
        citems.forEach(citem => {
            var ls = {};
            ls.product_id = citem.id;
            ls.quantity = citem.quantity;
            if (citem.hasOwnProperty('variation_id')) {
                ls.variation_id = citem.variation_id;
            }
            shopitems.push(ls);
        });

        var orderdata = utls.parseQuery(req.body.orderdata);

        var billing = {
            first_name: orderdata.first_name,
            last_name: orderdata.last_name,
            company: orderdata.company,
            address_1: orderdata.address_1,
            address_2: orderdata.address_2,
            city: orderdata.city,
            state: orderdata.state,
            postcode: orderdata.postcode,
            country: "CH",
            email: orderdata.email,
            phone: orderdata.phone
        }

        var shipping1 = {
            first_name: orderdata.first_name,
            last_name: orderdata.last_name,
            company: orderdata.company,
            address_1: orderdata.address_1,
            address_2: orderdata.address_2,
            city: orderdata.city,
            state: orderdata.state,
            postcode: orderdata.postcode,
            country: "CH"
        };

        var shipping2 = {
            first_name: orderdata.b2_first_name,
            last_name: orderdata.b2_last_name,
            company: orderdata.b2_company,
            address_1: orderdata.b2_address_1,
            address_2: orderdata.b2_address_2,
            city: orderdata.b2_city,
            state: orderdata.b2_state,
            postcode: orderdata.b2_postcode,
            country: "CH"
        };

        const data = {
            //customer_id: userdata.id,
            payment_method: orderdata.payment_method,
            payment_method_title: orderdata.pay_method_title,
            set_paid: true,
            status: "processing",
            billing: billing,
            shipping: (isUserAvail > 0) ? shipping2 : (orderdata.hasOwnProperty('diffshipping')) ? shipping2 : shipping1,
            line_items: shopitems,
            shipping_lines: [
                {
                    method_id: orderdata.ship_method,
                    method_title: orderdata.ship_method_title
                }
            ]
        };

        if (isUserAvail > 0) {
            data.customer_id = userdata.id;
        }

        /*console.log("++++++++++++Start console++++++++++++++++");
        console.log(isUserAvail);
        console.log(data);
        return false;
        console.log("++++++++++++End Console++++++++++++++++");*/
        //return {"status": true};

        var order = await postWCApiAsync("orders", data);

        if (order.hasOwnProperty('message')) {
            return { "status": false, "code": order.data.status, "error": order.message };
        }

        /*if(order.id) {
            var result = await this.paymentProcess(order);
        }*/

        return { "status": true, "code": 200, 'order_total': order.total, 'order_id': order.id, "order_key": order.order_key, "message": "Order Successfully Received..." };
    },
    async onepageorder(req) {

        console.log(req.method);

        var cart = await mCart.cart(req);

        var citems = req.session.cartitems;
        var userdata = req.session.auth;
        var isUserAvail = Object.keys(userdata).length;

        var shopitems = [];
        citems.forEach(citem => {
            var ls = {};
            ls.product_id = citem.id;
            ls.quantity = citem.quantity;
            if (citem.hasOwnProperty('variation_id')) {
                ls.variation_id = citem.variation_id;
            }
            if (citem.hasOwnProperty('meta_data')) {
                ls.meta_data = citem.meta_data;
            }
            shopitems.push(ls);
        });

        var user_info = utls.parseQuery(req.body.user_info);
        var payment_type = utls.parseQuery(req.body.payment_info);

        //var user_info = req.body.user_info;
        //console.log(user_info);
        //console.log(payment_info);

        if(Object.keys(payment_type).length > 0  && payment_type.hasOwnProperty('payment_type')) {
            req.session.auth.ptype = payment_type.payment_type;
        }
        
        var billing = {
            first_name: userdata.billing.first_name,
            last_name: userdata.billing.last_name,
            company: userdata.billing.company,
            address_1: userdata.billing.address_1,
            address_2: userdata.billing.address_2,
            city: userdata.billing.city,
            state: userdata.billing.state,
            postcode: userdata.billing.postcode,
            country: userdata.billing.country,
            email: userdata.billing.email,
            phone: userdata.billing.phone
        }

        var shipping1 = {
            first_name: userdata.shipping.first_name,
            last_name: userdata.shipping.last_name,
            company: userdata.shipping.company,
            address_1: userdata.shipping.address_1,
            address_2: userdata.shipping.address_2,
            city: userdata.shipping.city,
            state: userdata.shipping.state,
            postcode: userdata.shipping.postcode,
            country: userdata.shipping.country
        };

        /*var shipping2 = {
            first_name: orderdata.b2_first_name,
            last_name: orderdata.b2_last_name,
            company: orderdata.b2_company,
            address_1: orderdata.b2_address_1,
            address_2: orderdata.b2_address_2,
            city: orderdata.b2_city,
            state: orderdata.b2_state,
            postcode: orderdata.b2_postcode,
            country: "CH"
        };*/

        const data = {
            //customer_id: userdata.id,
            payment_method: 'bacs',
            payment_method_title: 'Post Finance Payments',
            set_paid: false,
            status: "pending",
            billing: billing,
            //shipping: (isUserAvail > 0) ? shipping2 : (orderdata.hasOwnProperty('diffshipping')) ? shipping2 : shipping1,
            shipping: shipping1,
            line_items: shopitems,
            shipping_lines: [cart.shipping_lines]
        };

        var vData = {
            email: userdata.email
        }
        
        zcustomer = await getWCApiAsync("customers", vData);
        //console.log(zcustomer[0].id);
        //console.log(zcustomer);
        if (userdata.hasOwnProperty('id')) {
            data.customer_id = zcustomer[0].id;
        }

        if(Object.keys(cart.coupon).length > 0) {
            let coupon = { code: cart.coupon.code };
            data.coupon_lines = [coupon];
        }

        console.log("+++++++++++++  before order date +++++++++++++");
        console.log(data);
        console.log("+++++++++++++  end order date +++++++++++++");

        //return false;

        var order = await postWCApiAsync("orders", data);

        console.log("++++++++++++++++++++++++++++++ Order Data +++++++++++++++++++++++++++++++++");

        console.log(order);

        //return false;

        if (order.hasOwnProperty('message')) {
            return { "status": false, "code": order.data.status, "error": order.message, "message": order.message };
        } else {
            //remove coupon
            req.session.coupon = {};
        }

        /*if(order.hasOwnProperty('id')) {
            var ftotal = parseFloat(order.total) + parseFloat(cart.payment_fees);
            var finaltotal = ftotal.toFixed(2).toString();
        }*/

        //console.log(order);
        //return false;

        return { "status": true, "code": 200, 'order_total': order.total, 'order_id': order.id, "order_key": order.order_key, "message": "Order Successfully Received..." };
    },
    async paymentProcess(order) {
        var options = {
            url: "https://postfinance.zoocial.ch/shop.php",
            data: { amount: parseFloat(order.total), order_id: order.id, order_key: order.key },
          }
        
          var reqData = await utls.requestPostData(options);
          var result = await reqData;
          return result;
    }
}

module.exports = Checkout;