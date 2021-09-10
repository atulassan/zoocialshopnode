
Testprod = {
    create(req, res) {
        // List products
        wcapi.get("products", {
            per_page: 20, // 20 products per page
        }).then((response) => {
            res.render("shop/pages/shop", response.data);
        }).catch((error) => {
            // Invalid request, for 4xx and 5xx statuses
            console.log("Response Status:", error.response.status);
            console.log("Response Headers:", error.response.headers);
            console.log("Response Data:", error.response.data);
        });

    },
    update(req, res) {
        res.send(JSON.stringify({ "status": 400, "method": 'put' }));
    },
    delete(req, res) {
        res.send(JSON.stringify({ "status": 400, "method": 'delete' }));
    },
    async lists(req) {

        let creqdata = {
            per_page: 50,
            page: 1
        };

        let products = await getWCApiAsync("products");
        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            products: products,
            categories: utls.getNestedChildren(categories, 0)
        }

        return data;
        //res.render("shop/pages/shop", data);
    },
    async list(req, res) {
        inputdata = {
            product_id : req.params.id
        }
        let creqdata = {
            per_page: 50,
            page: 1
        };
        //console.log(req.params.id);
        let product = await getWCApiAsync("products/" + req.params.id);
        let reviews = await getWCApiAsync("products/reviews", inputdata);
        let categories = await getWCApiAsync("products/categories", creqdata);

        console.log(product);

        data = {
            product: product,
            categories: utls.getNestedChildren(categories, 0),
            reviews: reviews
        }
        res.render("shop/pages/singleproduct", data);
    }
}

module.exports = Testprod;