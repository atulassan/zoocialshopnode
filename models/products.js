

Products = {
    create(req) {
        var data = JSON.stringify({ "status": true, "method": 'create' });
        return data;
    },
    update(req) {
        var data = JSON.stringify({ "status": true, "method": 'update' });
        return data;
    },
    delete(req) {
        var data = JSON.stringify({ "status": true, "method": 'delete' });
        return data;
    },
    async lists(req) {

        let creqdata = {
            per_page: 100,
            page: 1,
            hide_empty: true,
        };

        let products = await getWCApiAsync("products");
        let categories = await getWCApiAsync("products/categories", creqdata);
        let tags = await getWCApiAsync("products/tags");

        data = {
            products: products,
            categories: utls.getNestedChildren(categories, 0),
            tags: tags
        }

        return data;
    },
    async list(req) {

        let creqdata = {
            per_page: 100,
            page: 1,
            hide_empty: true,
        };

        //console.log(req.params.id);
        let product = await getWCApiAsync("products/" + req.params.id);
        let categories = await getWCApiAsync("products/categories", creqdata);
        //let reviews = await getWCApiAsync("products/reviews/"+req.params.id);
        let reviews = await getWCApiAsync("products/reviews/" + parseInt(req.params.id));
        let variations = (product.type == 'variable') ? await getWCApiAsync("products/" + req.params.id + "/variations") : null;

        product.meta_data.forEach((metainfo, el)=> {
            if(metainfo.hasOwnProperty('yikes_woo_products_tabs')) {
                var tabs = metainfo;
            }
            if(metainfo.hasOwnProperty('minquantity')) {
                var mqty = metainfo;
            }
            if(metainfo.hasOwnProperty('discount')) {
                var discount = metainfo;
            }
        });

        //console.log(tabs);
        //console.log(mqty);
        //console.log(discount);

        data = {
            product: product,
            categories: utls.getNestedChildren(categories, 0),
            reviews: (reviews.data.status == 404) ? null : reviews,
            variations: variations
        }

        return data;
    },
    async singleProduct(req) {

        var tabs = {},
            minqty={}, 
            discount= {},
            variations ={},
            discountAvail = {},
            inhaltstsstoffe = null,
            zusammensetzung = null,
            futter_content = null,
            futter_image_url = {},
            product_rating = {},
            product_rating_count = {},
            disp_weight = {},
            reviews = {},
            userdata = {},
            short_description = null,
            ampelwert = {},
            additional_text = null,
            description = null,
            description2 = null,
            product_description_2 = null,
            categorycode = null,
            filters = {},
            discountperiod = null,
            discountdesc = null,
            sales_unit_measure = null,
            metatitle= "",
            metakeywords= "",
            metadescription= "",
            linkcategories = "",
            linkbrands= "";

        userdata = req.session.auth;

        //console.log(req.params.slug);

        //  "/(\d+)[^-]*$/g"  //identify final hyphen

        reqdata = {
            slug: req.params.slug
        }

        let creqdata = {
            per_page: 100,
            page: 1,
            hide_empty: true,
        };
        
        let wcData = {};

        //console.log(req.params.id);
        
        var product = await getWCApiAsync("products/" + parseInt(req.params.id));

        let stockOptions = { url: "https://navshop.provet.ch/api/v1/item/itemStock/"+product.sku, key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        let stockData = await utls.navisionGetData(stockOptions);

        console.log(stockData);

        let priceOptions = { url: "https://navshop.provet.ch/api/v1/item/getSalePrice?ItemNo="+product.sku+"&MinQty=1", key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        let priceData = await utls.navisionGetData(priceOptions);

        let discountOptions = { url: "https://navshop.provet.ch/api/v1/item/getDiscount?ItemNo="+product.sku+"&MinQty=1", key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        let discountData = await utls.navisionGetData(discountOptions);
        
        if(stockData.hasOwnProperty('status') && stockData.status == 200) {
            wcData.stock_quantity = ( parseInt(stockData.data[0]['Stock']) > 0 ) ? parseInt(stockData.data[0]['Stock']) : 0;
            //wcData.stock_quantity = parseInt(stockData.data[0]['totalStock']);
            wcData.manage_stock = ( parseInt(stockData.data[0]['Stock']) > 0) ? true : false;
        }

        if(priceData.hasOwnProperty('status') && priceData.status == 200 && priceData.data[0].length > 0 && priceData.data[0][0].hasOwnProperty('Unit Price')) {
            console.log(priceData.data);
            let unitPrice = parseFloat(priceData.data[0][0]["Unit Price"]);
            wcData.regular_price = unitPrice.toFixed(2);
        }

        //i6 -> line discount _ -> sale price
        let discountPercentage = 0;
        let discountDesc = "";
        if(discountData.hasOwnProperty('status') && discountData.status == 200 && discountData.data[0].length > 0) {
            discountData.data[0].forEach((discount, el)=> {
                //get highest discount Description
                discountDesc = (discountPercentage < parseInt(discount["line discount _"])) ? discount["Description"] : discountDesc;
                //get highest discount value
                discountPercentage = (discountPercentage < parseInt(discount["line discount _"])) ? parseInt(discount["line discount _"]) : discountPercentage;
            });
            console.log("++++++++++++++ Discount: " + discountPercentage);
            console.log("++++++++++++++ Discount: " + discountDesc);
            if(wcData.hasOwnProperty('regular_price') && wcData.regular_price > 0) {
                let salePrice = parseFloat(wcData.regular_price - ((wcData.regular_price/100) * parseInt(discountPercentage)));
                wcData.sale_price = salePrice.toFixed(2);
            }
        } else {
            wcData.sale_price = "";
        }

        wcData.meta_data = [];

        if(discountData.hasOwnProperty('status') && discountData.status == 200 && discountData.data[0].length > 0) {
            wcData.meta_data.push({ "key": "discountperiod", "value": discountPercentage });
            wcData.meta_data.push({ "key": "discountdesc", "value": discountDesc });
        } else {
            wcData.meta_data.push({ "key": "discountperiod", "value": "" });
            wcData.meta_data.push({ "key": "discountdesc", "value": "" });
        }       

        console.log(wcData);

        if(Object.keys(wcData).length > 0) {
            let updateData = await putWCApiAsync("products/"+ parseInt(req.params.id), wcData);
            console.log("+++++++++ Data Updated ++++++++");
            console.log("SKU: " + product.sku+ ", UPDID: "+ updateData.id);
            console.log("++++++++++++++++++++++++ Update Data +++++++++++++++++++++");
            console.log(updateData);
            product = await getWCApiAsync("products/" + parseInt(req.params.id));
        }

        let categories = await getWCApiAsync("products/categories", creqdata);
        variations = (product.type == 'variable') ? await getWCApiAsync("products/" + req.params.id + "/variations") : null;

        console.log(product.tags);
        console.log(product.categories);
        console.log(product.breadcrumb);
        
        // No Image
        if(!product.images.length) {
            product.images = [{src:"https://zoocialshop.ch/images/noimage.jpg"}];
        }
        if(product.custom_taxonomies.length > 0) {
            product.custom_taxonomies.forEach((filter, el)=> {
                if(filter.hasOwnProperty('spezial')) {
                    filters.spezial = filter.spezial;
                }
                if(filter.hasOwnProperty('grosse')) {
                    filters.grosse = filter.grosse;
                }
                if(filter.hasOwnProperty('lebensphase')) {
                    filters.lebensphase = filter.lebensphase;
                }
                if(filter.hasOwnProperty('bedurfnisse')) {
                    filters.bedurfnisse = filter.bedurfnisse;
                }
                if(filter.hasOwnProperty('geschmack')) {
                    filters.geschmack = filter.geschmack;
                }
                if(filter.hasOwnProperty('futterart')) {
                    filters.futterart = filter.futterart;
                }
                if(filter.hasOwnProperty('krankheit')) {
                    filters.krankheit = filter.krankheit;
                }
            });
        }

        if(product.hasOwnProperty('categories') && product.categories.length > 0) {
            product.categories.forEach((category, el)=> {
                linkcategories += " - "+ category.name; 
            });         
        }

        if(product.hasOwnProperty('tags') && product.tags.length > 0) {
            product.tags.forEach((tag, el)=> {
                linkbrands += " - "+ tag.name; 
            });         
        }

        console.log(linkcategories);
        console.log(linkbrands);

        if(product.meta_data.length > 0) {
           product.meta_data.forEach((metainfo, el)=> {
                if(metainfo.key == "metatitle") {
                    metatitle = metainfo.value;
                }
                if(metainfo.key == "metakeywords") {
                    metakeywords = metainfo.value;
                }
                if(metainfo.key == "metadescription") {
                    metadescription = metainfo.value;
                }
                if(metainfo.key == "sales_unit_measure") {
                    sales_unit_measure = metainfo;
                }
                if(metainfo.key == "categorycode") {
                    categorycode = metainfo;
                }
                if(metainfo.key == "ampelwert") {
                    ampelwert = metainfo;
                }
                if(metainfo.key == "additional_text") {
                    additional_text = metainfo;
                }    
                if(metainfo.key == "yikes_woo_products_tabs") {
                    tabs = metainfo.value;
                }
                if(metainfo.key == "minquantity") {
                    minqty = metainfo;
                }
                if(metainfo.key == "discount") {
                    discount = metainfo;
                }
                if(metainfo.key == "discountAvail") {
                    discountAvail = metainfo.value;
                }
                if(metainfo.key == "inhaltstsstoffe") {
                    inhaltstsstoffe = metainfo;
                }
                if(metainfo.key == "zusammensetzung") {
                    zusammensetzung = metainfo;
                }
                if(metainfo.key == "futter_content") {
                    futter_content = metainfo;
                }
                if(metainfo.key == "futter_image_url") {
                    futter_image_url = metainfo;
                }
                if(metainfo.key == "product_rating") {
                    product_rating = metainfo;
                }
                if(metainfo.key == "product_rating_count") {
                    product_rating_count = metainfo;
                }
                if(metainfo.key == "disp_weight") {
                    disp_weight = metainfo;
                }
                if(metainfo.key == "description") {
                    description = metainfo;
                }
                if(metainfo.key == "description2") {
                    description2 = metainfo;
                }
                if(metainfo.key == "product_description_2") {
                    product_description_2 = metainfo;
                }
                if(metainfo.key == "short_description") {
                    short_description = metainfo;
                }
                if(metainfo.key == "discountperiod") {
                    discountperiod = metainfo;
                }
                if(metainfo.key == "discountdesc") {
                    discountdesc = metainfo;
                }
            }); 
        }

        data = {
            product: product,
            categories: utls.getNestedChildren(categories, 0),
            variations: (product.type == 'variable') ? variations.reverse() : {},
            tabs: tabs,
            minqty: minqty,
            discount: discount,
            discountAvail: discountAvail,
            inhaltstsstoffe: inhaltstsstoffe,
            zusammensetzung: zusammensetzung,
            futter_content: futter_content,
            futter_image_url: futter_image_url,
            product_rating: product_rating,
            product_rating_count: product_rating_count,
            disp_weight: disp_weight,
            userdata: userdata,
            description: description,
            description2: description2,
            product_description_2: product_description_2,
            additional_text: additional_text,
            ampelwert: ampelwert,
            short_description: short_description,
            filters: filters,
            discountperiod: discountperiod,
            discountdesc: discountdesc,
            sales_unit_measure: sales_unit_measure,
            categorycode: categorycode,
            metaInfo: { page: "singleproduct", 
                        title: product.name + linkbrands + linkcategories + " - nachhaltig online bestellen bei ZOOCIALShop.ch " + metatitle,
                        keywords: product.name + linkbrands + linkcategories + " - nachhaltig online bestellen bei ZOOCIALShop.ch " + metakeywords, 
                        description: metadescription, 
                        productimage: product.images[0].src },
        }

        return data;
    },
    async tags(req) {

        console.log(req.params);

        var slug = req.params.slug;
        var id = req.params.id;

        let qpage = req.query.hasOwnProperty('page') ? parseInt(req.query.page) : 1;
        let urlFilters = [];

        let spezialData = null;
        let grosseData = null;
        let lebensphaseData = null;
        let bedurfnisseData = null;
        let geschmackData = null;
        let krankheitData = null;
        let futterartData = null;
        let tags = null;
        
        let treqdata = {
            per_page: 100,
            page: 1
        };

        let rqdata = {
            status: 'publish',
            per_page: qpage * 9,
            tag: id,
            page: 1,
            orderby: "rating",
            order: "desc"
        }

        let creqdata = {
            per_page: 100,
            page: 1,
            hide_empty: true,
            orderby: "id",
            order: "asc",
        };

        let products = await getWCApiAsync("products", rqdata);
        let categories = await getWCApiAsync("products/categories", creqdata);
        let tag = await getWCApiAsync("products/tags/"+ req.params.id);

        spezialData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/spezial", {method:"GET"});
        grosseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/grosse", {method:"GET"});
        lebensphaseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/lebensphase", {method:"GET"});
        bedurfnisseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/bedurfnisse", {method:"GET"});
        geschmackData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/geschmack", {method:"GET"});
        krankheitData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/krankheit", {method:"GET"});
        futterartData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/futterart", {method:"GET"});
        tags = await getWCApiAsync("products/tags", treqdata);

        data = {
            products: products,
            categories: utls.getNestedChildren(categories, 0),
            listSubCategories: utls.getNestedChildren(categories, 0),
            tag: tag,
            tag_id: id,
            active: req.params.id,
            customeScript: {enable: true},
            spezialData: spezialData,
            grosseData: grosseData,
            lebensphaseData: lebensphaseData,
            bedurfnisseData: bedurfnisseData,
            geschmackData: geschmackData,
            krankheitData: krankheitData,
            futterartData: futterartData,
            tags: tags,
            qpage: qpage,
            urlFilters: urlFilters,
            metaInfo: {page: "tags"},
        }

        //res.render("shop/pages/brand", data);
        return data;

    },
    async createReview(req) {

        let formdata = utls.parseQuery(req.body.formdata);
        var mailformat = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        var data = {};

        /*if(formdata.reviewer_email == "") {
            data = { status: false, message: "E-Mail überprüfen Kann nicht leer sein" }    
        }

        if(!mailformat.test(formdata.reviewer_email)) {
            data = { status: false, message: "Bitte geben Sie die richtige E-Mail" }    
        }*/

        if(formdata.review == "") {
            data = { status: false, message: "bitte Rezension schreiben" }
            return data;
        }    
        
        const postData = {
            product_id: formdata.product_id,
            review: formdata.review,
            reviewer: formdata.reviewer,
            reviewer_email: formdata.reviewer_email,
            rating: formdata.rating,
            status: "hold"
        };

        let reviews = await postWCApiAsync("products/reviews", postData);
        
        console.log(reviews);

        if(reviews.hasOwnProperty('code')) {
            if(reviews.code == "woocommerce_rest_comment_duplicate") {
                data = { status: false, message: "Rezension bereits vorhanden bitte überprüfen und umändern - Danke" }
            } else {
                data = { status: false, message: "Wir können Ihre Bewertung nicht akzeptieren" }
            }
        } else {
            data = { status: true, message: "Vielen Dank, dass Du dir die Zeit genommen hast, das Produkt zu bewerten! Für uns ist jede Rückmeldungen sehr wichtig. Wir werden Deine Bewertung prüfen und innerhalb von 48h veröffentlichen." }
        }

        return data;

    },
    async filter(req) {

        //let formdata = utls.parseQuery(req.body.formdata);
        //console.log(req.query);
        //console.log(req.params);
        var azflt = req.query.s;
        var noflt = req.query.p;
        var page = req.query.page;
        var price = req.query.price;
        var category_id = req.query.cid;
        var tag_id = req.query.tag_id;
        var search = req.query.search;
        var filters = (req.query.filters) ? JSON.parse(req.query.filters) : [];
        var ftag = true;

        reqdata = {
            status: "publish",
            //per_page: (parseInt(noflt) > 0) ? noflt : 9,
            per_page: 9,
            page: (page) ? parseInt(page) + 1 : 1,
        };

        if(parseInt(category_id) > 0) {
            reqdata.category = category_id;
        }

        if(filters.length > 0) {
            filters.forEach(function(filter) {
                console.log(filter);
                if(filter.hasOwnProperty('spezial')) {
                    reqdata.spezial = filter.spezial;
                }
                if(filter.hasOwnProperty('grosse')) {
                    reqdata.grosse = filter.grosse;
                }
                if(filter.hasOwnProperty('lebensphase')) {
                    reqdata.lebensphase = filter.lebensphase;
                }
                if(filter.hasOwnProperty('bedurfnisse')) {
                    reqdata.bedurfnisse = filter.bedurfnisse;
                }
                if(filter.hasOwnProperty('geschmack')) {
                    reqdata.geschmack = filter.geschmack;
                }
                if(filter.hasOwnProperty('krankheit')) {
                    reqdata.krankheit = filter.krankheit;
                }
                if(filter.hasOwnProperty('futterart')) {
                    reqdata.futterart = filter.futterart;
                }
                if(filter.hasOwnProperty('brand')) {
                    reqdata.tag = filter.brand.toString();
                    ftag = false;
                }
            });
        }

        if(ftag && parseInt(tag_id) > 0) {
            reqdata.tag = tag_id;
        }

        if(search != '0') {
            reqdata.search = search;
        }

        switch (azflt) {
            case "rating-desc":
                reqdata.orderby = 'rating';
                reqdata.order = "desc";
                break;
            case "alpha-desc":
                reqdata.orderby = 'title';
                reqdata.order = "desc";
                break;
            case "date-asc":
                reqdata.orderby = 'date';
                reqdata.order = "asc";
                break;
            case "date-desc":
                reqdata.orderby = 'date';
                reqdata.order = "desc";
                break;
            case "price-desc":
                reqdata.orderby = 'price';
                reqdata.order = "desc";
                break;
            case "price-asc":
                reqdata.orderby = 'price';
                reqdata.order = "asc";
                break;
            case "popularity":
                reqdata.orderby = 'popularity';
                break;
            default:
                reqdata.orderby = 'title';
                reqdata.order = "asc";
        }

        //console.log(reqdata);
        //return false;

        if (price !== "") {
            if (utls.isNotEmpty(price) && price == '-20') {
                reqdata.min_price = "";
                reqdata.max_price = "20";
                console.log('price:' + price);
            }
            if (utls.isNotEmpty(price) && price == '20-100') {
                reqdata.min_price = '20';
                reqdata.max_price = '100';
                console.log('price:' + price);
            }
            if (utls.isNotEmpty(price) && price == "100+") {
                reqdata.min_price = '100';
                reqdata.max_price = "";
                console.log('price:' + price);
            }
        }

        console.log(reqdata);

        /*reqdata.orderby = 'price';
        reqdata.order = "desc";
        //reqdata.meta_key = "price";*/

        var products = await getWCApiAsync("products", reqdata);

        if (products.length > 0) {
            data = {
                status: true,
                products: products,
                page: reqdata.page,
                count: products.length,
            }
        } else {
            data = {
                status: false,
                products: null,
                page: reqdata.page,
                count: products.length,
            }
        }

        return data;
    },
    async homePageNew(req) {

        let creqdata = {
            per_page: 100,
            page: 1,
            hide_empty: true,
        };    

        let categories = await getWCApiAsync("products/categories", creqdata);
        data = {
            categories: utls.getNestedChildren(categories, 0)
        }
        return data;                        
    },
    async searchProducts(req) {
     
        let search = req.query.search;

        let qpage = req.query.hasOwnProperty('page') ? parseInt(req.query.page) : 1;
        let urlFilters = [];

        var products = [];

        let spezialData = null;
        let grosseData = null;
        let lebensphaseData = null;
        let bedurfnisseData = null;
        let geschmackData = null;
        let krankheitData = null;
        let futterartData = null;
        let tags = null;
        
        let treqdata = {
            per_page: 100,
            page: 1
        };

        //for category params
        let creqdata = {
            per_page: 100,
            page: 1,
            hide_empty: true,
            orderby: "id",
            order: "asc",
        };
        
        //for product params
        let reqdata = {
            status: 'publish',
            per_page: qpage * 9,
            page: 1,
            orderby: "rating",
            order: "desc",
        };

        let categories = await getWCApiAsync("products/categories", creqdata);

        if(search != "") {
            products = await getWCApiAsync("products?search=" + search, reqdata);
        }

        spezialData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/spezial", {method:"GET"});
        grosseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/grosse", {method:"GET"});
        lebensphaseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/lebensphase", {method:"GET"});
        bedurfnisseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/bedurfnisse", {method:"GET"});
        geschmackData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/geschmack", {method:"GET"});
        krankheitData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/krankheit", {method:"GET"});
        futterartData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/futterart", {method:"GET"});
        tags = await getWCApiAsync("products/tags", treqdata);

        console.log("Products++++++++++",products[1]['meta_data']);
        console.log("Discount period+++++++++++++++++++++++ Start")
        products[1]['meta_data'].forEach((meta, idx)=> {
            if(meta.key === 'discountperiod') {
                console.log("Discount period", meta.value);
            }
        });
        console.log("Discount period+++++++++++++++++++++++ END")

        var data = {
            products: products,
            categories: utls.getNestedChildren(categories, 0),
            listSubCategories: utls.getNestedChildren(categories, 0),
            active: req.params.id,
            customeScript: {enable: true},
            search: search,
            spezialData: spezialData,
            grosseData: grosseData,
            lebensphaseData: lebensphaseData,
            bedurfnisseData: bedurfnisseData,
            geschmackData: geschmackData,
            krankheitData: krankheitData,
            futterartData: futterartData,
            tags: tags,
            qpage: qpage,
            urlFilters: urlFilters,
            metaInfo: {page: "search"},
        }

        return data;
    },
    async filters(req) {
        
        let spezialData = null;
        let grosseData = null;
        let lebensphaseData = null;
        let bedurfnisseData = null;
        let geschmackData = null;
        let krankheitData = null;
        let futterartData = null;
        let tags = null;
        
        let treqdata = {
            per_page: 100,
            page: 1
        };

        //taxonomies fitlers
        spezialData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/spezial", {method:"GET"});
        grosseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/grosse", {method:"GET"});
        lebensphaseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/lebensphase", {method:"GET"});
        bedurfnisseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/bedurfnisse", {method:"GET"});
        geschmackData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/geschmack", {method:"GET"});
        krankheitData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/krankheit", {method:"GET"});
        futterartData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/futterart", {method:"GET"});
        tags = await getWCApiAsync("products/tags", treqdata);

        var data = {
            spezialData: spezialData,
            grosseData: grosseData,
            lebensphaseData: lebensphaseData,
            bedurfnisseData: bedurfnisseData,
            geschmackData: geschmackData,
            krankheitData: krankheitData,
            futterartData: futterartData,
            tags: tags,
        }

        return data;
    },
    async remiProducts(req) {

        var slug = req.params.slug;
        var id = req.params.id;
        let count = 0;

        let qpage = req.query.hasOwnProperty('page') ? parseInt(req.query.page) : 1;
        let urlFilters = [];

        let spezialData = null;
        let grosseData = null;
        let lebensphaseData = null;
        let bedurfnisseData = null;
        let geschmackData = null;
        let krankheitData = null;
        let futterartData = null;
        let tags = null;
        
        let treqdata = {
            per_page: 100,
            page: 1
        };

        let rqdata = {
            status: 'publish',
            category: "228,229,230,233",
            per_page: qpage * 9,
            //tag: id,
            page: 1,
            orderby: "rating",
            order: "desc"
        }

        let creqdata = {
            per_page: 100,
            page: 1,
            hide_empty: true,
            orderby: "id",
            order: "asc",
        };

        spezialData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/spezial", {method:"GET"});
        grosseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/grosse", {method:"GET"});
        lebensphaseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/lebensphase", {method:"GET"});
        bedurfnisseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/bedurfnisse", {method:"GET"});
        geschmackData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/geschmack", {method:"GET"});
        krankheitData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/krankheit", {method:"GET"});
        futterartData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/futterart", {method:"GET"});
        tags = await getWCApiAsync("products/tags", treqdata);

        if(req.query.hasOwnProperty('lebensphase') && req.query.lebensphase !== '') {
            rqdata.lebensphase = req.query.lebensphase.split(',');
            if(rqdata.lebensphase.length > 0) {
                rqdata.lebensphase.forEach(function(id) {
                    lebensphaseData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('grosse') && req.query.grosse !== '') {
            rqdata.grosse = req.query.grosse.split(',');
            if(rqdata.grosse.length > 0) {
                rqdata.grosse.forEach(function(id) {
                    grosseData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('bedurfnisse') && req.query.bedurfnisse !== '') {
            rqdata.bedurfnisse = req.query.bedurfnisse.split(',');
            if(rqdata.bedurfnisse.length > 0) {
                rqdata.bedurfnisse.forEach(function(id) {
                    bedurfnisseData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('geschmack') && req.query.geschmack !== '') {
            rqdata.geschmack = req.query.geschmack.split(',');
            if(rqdata.geschmack.length > 0) {
                rqdata.geschmack.forEach(function(id) {
                    geschmackData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('krankheit') && req.query.krankheit !== '') {
            rqdata.krankheit = req.query.krankheit.split(',');
            if(rqdata.krankheit.length > 0) {
                rqdata.krankheit.forEach(function(id) {
                    krankheitData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('spezial') && req.query.spezial !== '') {
            rqdata.spezial = req.query.spezial.split(',');
            if(rqdata.spezial.length > 0) {
                rqdata.spezial.forEach(function(id) {
                    spezialData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('futterart') && req.query.futterart !== '') {
            rqdata.futterart = req.query.futterart.split(',');
            if(rqdata.futterart.length > 0) {
                rqdata.futterart.forEach(function(id) {
                    futterartData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('brand') && req.query.brand !== '') {
            let brand = req.query.brand.split(',');
            rqdata.tag = req.query.brand.toString();
            if(brand.length > 0) {
                brand.forEach(function(id) {
                    tags.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        console.log(rqdata);

        let products = await getWCApiAsync("products", rqdata);
        let categories = await getWCApiAsync("products/categories", creqdata);
        
        //Get count of products related categories("228,229,230,233")
        for(const category of categories) {
            if(category.id == 228 || category.id == 229 || category.id == 230 || category.id == 233) {
                count += parseInt(category.count);
                //console.log(category.id + " ->  " + category.count);
            }
        }


        data = {
            products: products,
            categories: utls.getNestedChildren(categories, 0),
            listSubCategories: utls.getNestedChildren(categories, 0),
            cIds: rqdata.category,
            active: 5001,
            customeScript: {enable: true},
            spezialData: spezialData,
            grosseData: grosseData,
            lebensphaseData: lebensphaseData,
            bedurfnisseData: bedurfnisseData,
            geschmackData: geschmackData,
            krankheitData: krankheitData,
            futterartData: futterartData,
            tags: tags,
            breadcrumb: null,
            count: count,
            qpage: qpage,
            urlFilters: urlFilters,
            metaInfo: {page: "remi"},
        }

        //res.render("shop/pages/brand", data);
        return data;

    },
    async hundeRemi(req) {

        var slug = req.params.slug;
        var id = req.params.id;
        let count = 0;

        let qpage = req.query.hasOwnProperty('page') ? parseInt(req.query.page) : 1;
        let urlFilters = [];

        let spezialData = null;
        let grosseData = null;
        let lebensphaseData = null;
        let bedurfnisseData = null;
        let geschmackData = null;
        let krankheitData = null;
        let futterartData = null;
        let tags = null;
        
        let treqdata = {
            per_page: 100,
            page: 1
        };

        let rqdata = {
            status: 'publish',
            category: "228,230",
            per_page: qpage * 9,
            //tag: id,
            page: 1,
            orderby: "rating",
            order: "desc"
        }

        let creqdata = {
            per_page: 100,
            page: 1,
            hide_empty: true,
            orderby: "id",
            order: "asc",
        };

        spezialData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/spezial", {method:"GET"});
        grosseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/grosse", {method:"GET"});
        lebensphaseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/lebensphase", {method:"GET"});
        bedurfnisseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/bedurfnisse", {method:"GET"});
        geschmackData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/geschmack", {method:"GET"});
        krankheitData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/krankheit", {method:"GET"});
        futterartData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/futterart", {method:"GET"});
        tags = await getWCApiAsync("products/tags", treqdata);

        if(req.query.hasOwnProperty('lebensphase') && req.query.lebensphase !== '') {
            rqdata.lebensphase = req.query.lebensphase.split(',');
            if(rqdata.lebensphase.length > 0) {
                rqdata.lebensphase.forEach(function(id) {
                    lebensphaseData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('grosse') && req.query.grosse !== '') {
            rqdata.grosse = req.query.grosse.split(',');
            if(rqdata.grosse.length > 0) {
                rqdata.grosse.forEach(function(id) {
                    grosseData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('bedurfnisse') && req.query.bedurfnisse !== '') {
            rqdata.bedurfnisse = req.query.bedurfnisse.split(',');
            if(rqdata.bedurfnisse.length > 0) {
                rqdata.bedurfnisse.forEach(function(id) {
                    bedurfnisseData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('geschmack') && req.query.geschmack !== '') {
            rqdata.geschmack = req.query.geschmack.split(',');
            if(rqdata.geschmack.length > 0) {
                rqdata.geschmack.forEach(function(id) {
                    geschmackData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('krankheit') && req.query.krankheit !== '') {
            rqdata.krankheit = req.query.krankheit.split(',');
            if(rqdata.krankheit.length > 0) {
                rqdata.krankheit.forEach(function(id) {
                    krankheitData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('spezial') && req.query.spezial !== '') {
            rqdata.spezial = req.query.spezial.split(',');
            if(rqdata.spezial.length > 0) {
                rqdata.spezial.forEach(function(id) {
                    spezialData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('futterart') && req.query.futterart !== '') {
            rqdata.futterart = req.query.futterart.split(',');
            if(rqdata.futterart.length > 0) {
                rqdata.futterart.forEach(function(id) {
                    futterartData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('brand') && req.query.brand !== '') {
            let brand = req.query.brand.split(',');
            rqdata.tag = req.query.brand.toString();
            if(brand.length > 0) {
                brand.forEach(function(id) {
                    tags.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        console.log(rqdata);

        let products = await getWCApiAsync("products", rqdata);
        let categories = await getWCApiAsync("products/categories", creqdata);

        //Get count of products related categories(228, 230)
        for(const category of categories) {
            if(category.id == 228 || category.id == 230) {
                count += parseInt(category.count);
                //console.log(category.id + " ->  " + category.count);
            }
        }
        
        data = {
            products: products,
            categories: utls.getNestedChildren(categories, 0),
            listSubCategories: utls.getNestedChildren(categories, 0),
            cIds: rqdata.category,
            active: 24,
            customeScript: {enable: true},
            spezialData: spezialData,
            grosseData: grosseData,
            lebensphaseData: lebensphaseData,
            bedurfnisseData: bedurfnisseData,
            geschmackData: geschmackData,
            krankheitData: krankheitData,
            futterartData: futterartData,
            tags: tags,
            breadcrumb: "Hunde",
            count: count,
            qpage: qpage,
            urlFilters: urlFilters,
            metaInfo: {page: "remi"},
        }

        //res.render("shop/pages/brand", data);
        return data;

    },
    async katzeRemi(req) {

        var slug = req.params.slug;
        var id = req.params.id;
        let count = 0;

        let qpage = req.query.hasOwnProperty('page') ? parseInt(req.query.page) : 1;
        let urlFilters = [];

        let spezialData = null;
        let grosseData = null;
        let lebensphaseData = null;
        let bedurfnisseData = null;
        let geschmackData = null;
        let krankheitData = null;
        let futterartData = null;
        let tags = null;
        
        let treqdata = {
            per_page: 100,
            page: 1
        };

        let rqdata = {
            status: 'publish',
            category: "229,233",
            per_page: qpage * 9,
            tag: id,
            page: 1,
            orderby: "rating",
            order: "desc"
        }

        let creqdata = {
            per_page: 100,
            page: 1,
            hide_empty: true,
            orderby: "id",
            order: "asc",
        };

        spezialData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/spezial", {method:"GET"});
        grosseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/grosse", {method:"GET"});
        lebensphaseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/lebensphase", {method:"GET"});
        bedurfnisseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/bedurfnisse", {method:"GET"});
        geschmackData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/geschmack", {method:"GET"});
        krankheitData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/krankheit", {method:"GET"});
        futterartData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/futterart", {method:"GET"});
        tags = await getWCApiAsync("products/tags", treqdata);

        if(req.query.hasOwnProperty('lebensphase') && req.query.lebensphase !== '') {
            rqdata.lebensphase = req.query.lebensphase.split(',');
            if(rqdata.lebensphase.length > 0) {
                rqdata.lebensphase.forEach(function(id) {
                    lebensphaseData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('grosse') && req.query.grosse !== '') {
            rqdata.grosse = req.query.grosse.split(',');
            if(rqdata.grosse.length > 0) {
                rqdata.grosse.forEach(function(id) {
                    grosseData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('bedurfnisse') && req.query.bedurfnisse !== '') {
            rqdata.bedurfnisse = req.query.bedurfnisse.split(',');
            if(rqdata.bedurfnisse.length > 0) {
                rqdata.bedurfnisse.forEach(function(id) {
                    bedurfnisseData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('geschmack') && req.query.geschmack !== '') {
            rqdata.geschmack = req.query.geschmack.split(',');
            if(rqdata.geschmack.length > 0) {
                rqdata.geschmack.forEach(function(id) {
                    geschmackData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('krankheit') && req.query.krankheit !== '') {
            rqdata.krankheit = req.query.krankheit.split(',');
            if(rqdata.krankheit.length > 0) {
                rqdata.krankheit.forEach(function(id) {
                    krankheitData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('spezial') && req.query.spezial !== '') {
            rqdata.spezial = req.query.spezial.split(',');
            if(rqdata.spezial.length > 0) {
                rqdata.spezial.forEach(function(id) {
                    spezialData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('futterart') && req.query.futterart !== '') {
            rqdata.futterart = req.query.futterart.split(',');
            if(rqdata.futterart.length > 0) {
                rqdata.futterart.forEach(function(id) {
                    futterartData.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        if(req.query.hasOwnProperty('brand') && req.query.brand !== '') {
            let brand = req.query.brand.split(',');
            rqdata.tag = req.query.brand.toString();
            if(brand.length > 0) {
                brand.forEach(function(id) {
                    tags.forEach(function(data) {
                        if(id == data.id) {
                            urlFilters.push(data);        
                        }
                    });
                });
            }
        }

        console.log(rqdata);

        let products = await getWCApiAsync("products", rqdata);
        let categories = await getWCApiAsync("products/categories", creqdata);


        //Get count of products related categories(229, 233)
        for(const category of categories) {
            if(category.id == 229 || category.id == 233) {
                count += parseInt(category.count);
                //console.log(category.id + " ->  " + category.count);
            }
        }
        
        data = {
            products: products,
            categories: utls.getNestedChildren(categories, 0),
            listSubCategories: utls.getNestedChildren(categories, 0),
            cIds: rqdata.category,
            active: 15,
            customeScript: {enable: true},
            spezialData: spezialData,
            grosseData: grosseData,
            lebensphaseData: lebensphaseData,
            bedurfnisseData: bedurfnisseData,
            geschmackData: geschmackData,
            krankheitData: krankheitData,
            futterartData: futterartData,
            tags: tags,
            breadcrumb: "Katze",
            count: count,
            qpage: qpage,
            urlFilters: urlFilters,
            metaInfo: {page: "remi"},
        }

        //res.render("shop/pages/brand", data);
        return data;

    },
    async remiProductsApi(req) {

        let data = {};

        let rqdata = {
            status: 'publish',
            category: "228,229,230,233",
            per_page: 10,
            //tag: id,
            page: 1,
            orderby: "rating",
            order: "desc"
        }
        let products = await getWCApiAsync("products", rqdata);

        data = {
            status: true,
            products: products,
        }

        return data;

    },

}


module.exports = Products;