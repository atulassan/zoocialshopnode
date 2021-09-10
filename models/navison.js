var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var probe = require('probe-image-size');

Navison = {
    async insert(req) {

        var navisonData= {};
        var versionNo = "";
        
        var logErrors = [];

        var options = { url: "https://navshop.provet.ch/api/v1/item/all", key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' }
        //var options = { url: "https://navshop.provet.ch/api/v1/item/getItems", key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' }
        //var options = { url: "https://navision.oneix.dev/api/v1/item/all", key: 'YMv7wakenwoJlN2wrUDa4QM8-Adj28' }
        //var options = { url: "https://navision.oneix.dev/api/v1/item/getItems", key: 'YMv7wakenwoJlN2wrUDa4QM8-Adj28' }
        navisonData = await utls.navisionGetData(options);

        if(navisonData.hasOwnProperty('status') && navisonData.status == 200 ) {

            for (const [indx, apiData] of navisonData.data.entries()) {

                if(!indx) {
                    versionNo = parseInt(apiData.VersionNo);
                }

                if(parseInt(apiData.VersionNo) > versionNo) {
                    versionNo = apiData.VersionNo;
                }
                
                let productData = await this.productData(apiData);
                let newProduct = await postWCApiAsync("products", productData);
                console.log("+++++ Start New ++++++");
                console.log("Api KEY: "+apiData.Id);
                console.log(newProduct);
                console.log("+++++ End New ++++++");
                if(newProduct.hasOwnProperty('code') && newProduct.code == "product_invalid_sku") {
                    var updId = newProduct.hasOwnProperty('data') && newProduct.data.resource_id != "" ? newProduct.data.resource_id : 0;
                    var updProduct = await putWCApiAsync("products/"+updId, productData);
                    console.log("+++++Start upd++++++");
                    console.log("Api KEY: "+apiData.Id);
                    console.log(updProduct.id);
                    console.log("+++++End upd++++++");
                }
                if(newProduct.hasOwnProperty('code') && newProduct.code == "woocommerce_product_image_upload_error") {
                    logErrors.push({SKU: productData.sku, ERROR: newProduct});
                }
            };

            console.log(versionNo);
            console.log(navisonData.data.length);
            console.log(logErrors);

            var versionData = JSON.stringify({ versionNo : versionNo});

            if (fs.existsSync("navison.json")) {
                //file exists
                fs.writeFile('navison.json', versionData, (err) => {
                    if (err) throw err;
                    console.log('Data written to file');
                });
            } else {
                fs.writeFileSync('navison.json', versionData);
            }

            var data = {
                status: true,
                message: "Data Inserted Successfully",
                logErrors: logErrors,
            } 
        } else {
            var data = {
                status: false,
                message: "Data Not Inserted",
                logErrors: logErrors,
            } 
        }
        
        //var data = JSON.stringify({ "status": true, "method": 'Navison insert' });
        return data;
    },
    async update(req) {

        var navisonData= {};
        var versionNo = "";
        var tmpVersionNo = 0;

        var options = { url: "https://navshop.provet.ch/api/v1/item/all", key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        //var options = { url: "https://navshop.provet.ch/api/v1/item/getItems", key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        //var options = { url: "https://navision.oneix.dev/api/v1/item/all", key: 'YMv7wakenwoJlN2wrUDa4QM8-Adj28' };
        //var options = { url: "https://navision.oneix.dev/api/v1/item/getItems", key: 'YMv7wakenwoJlN2wrUDa4QM8-Adj28' };
        navisonData = await utls.navisionGetData(options);

        if (fs.existsSync("navison.json")) {
            let navijson = fs.readFileSync('navison.json');
            let naviData = JSON.parse(navijson);
            versionNo = naviData.hasOwnProperty('versionNo') ? naviData.versionNo : "";
            console.log(versionNo);      
        }

        if(navisonData.hasOwnProperty('status') && navisonData.status == 200 && versionNo > 0 ) {

            for (const [indx, apiData] of navisonData.data.entries()) {
                if(parseInt(apiData.VersionNo) > parseInt(versionNo)) {
                    //versionNo = apiData.VersionNo;
                    tmpVersionNo = (tmpVersionNo < apiData.VersionNo) ? apiData.VersionNo : tmpVersionNo;
                    let productData = await this.productData(apiData);
                    let newProduct = await postWCApiAsync("products", productData);
                    console.log("+++++ Start New ++++++");
                    console.log("NAVISION SKU", apiData.Id);
                    console.log("NEW PRODUCT ID", newProduct.id);
                    console.log("+++++ End New ++++++");
                    if(newProduct.hasOwnProperty('code') && newProduct.code == "product_invalid_sku") {
                        var updId = newProduct.hasOwnProperty('data') && newProduct.data.resource_id != "" ? newProduct.data.resource_id : 0;
                        var updProduct = await putWCApiAsync("products/"+updId, productData);
                        console.log("+++++Start upd++++++");
                        console.log("UPDATE PRODUCT ID", updProduct.id);
                        console.log("+++++End upd++++++");
                    }
                }
            }

            console.log("New version No " + (tmpVersionNo > versionNo) ? tmpVersionNo : versionNo);
            var versionData = JSON.stringify({ versionNo : (tmpVersionNo > versionNo) ? tmpVersionNo : versionNo });

            if (fs.existsSync("navison.json")) {
                //file exists
                fs.writeFile('navison.json', versionData, (err) => {
                    if (err) throw err;
                    console.log('Data written to file');
                });
            } else {
                fs.writeFileSync('navison.json', versionData);
            }

            var data = {
                status: true,
                message: "Data Updated Successfully",
            } 
        } else {
            var data = {
                status: false,
                message: "Data Is not Updated",
            }
        }
        
        return data;
    },
    async productData(apiData) {
        let wcData = {};
        var cats = [];
        var brands = [];

        let creqdata = { per_page: 200, page: 1, };
        //let categories = await getWCApiAsync("products/categories", creqdata);
        
        let stockOptions = { url: "https://navshop.provet.ch/api/v1/item/itemStock/"+apiData.Id, key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        //let stockOptions = { url: "https://navision.oneix.dev/api/v1/item/itemStock/"+apiData.Id, key: 'YMv7wakenwoJlN2wrUDa4QM8-Adj28' };
        let stockData = await utls.navisionGetData(stockOptions);

        let priceOptions = { url: "https://navshop.provet.ch/api/v1/item/getSalePrice?ItemNo="+apiData.Id+"&MinQty=1", key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        //let priceOptions = { url: "https://navision.oneix.dev/api/v1/item/getSalePrice?ItemNo="+apiData.Id+"&MinQty=1", key: 'YMv7wakenwoJlN2wrUDa4QM8-Adj28' };
        let priceData = await utls.navisionGetData(priceOptions);

        //"https://navshop.provet.ch/api/v1/item/getDiscount?ItemNo="+sku+"&MinQty=1"

        let discountOptions = { url: "https://navshop.provet.ch/api/v1/item/getDiscount?ItemNo="+apiData.Id+"&MinQty=1", key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        //let discountOptions = { url: "https://navision.oneix.dev/api/v1/item/getSalePrice?ItemNo="+apiData.Id+"&MinQty=1", key: 'YMv7wakenwoJlN2wrUDa4QM8-Adj28' };
        let discountData = await utls.navisionGetData(discountOptions);

        //console.log(stockData);
        //console.log(priceData);

        //sku
        if(apiData.Id != null && apiData.Id != "") {
            wcData.sku = apiData.Id; 
        }        
        //i2-> name
        if(apiData['Description'] != null && apiData['Description'] != "") {
            wcData.name = apiData['Description']; 
        }
        /*if(apiData['Article name'] != null && apiData['Article name'] != "") {
            wcData.name = apiData['Article name']; 
        }*/
        //type
        wcData.type = "simple";

        /*//i6 -> Unit List Price -> regular price
        if(priceData.hasOwnProperty('status') && priceData.status == 200 && priceData.data[0].length > 0 && priceData.data[0][0].hasOwnProperty('Unit Price')) {
            let unitPrice = parseFloat(priceData.data[0][0]["Unit Price"]);
            wcData.regular_price = unitPrice.toFixed(2);
        } else {
            if(apiData['Unit List Price'] != null && apiData['Unit List Price'] != "") {
                let unitPrice = parseFloat(apiData['Unit List Price']);
                wcData.regular_price = unitPrice.toFixed(2);
            } 
        }*/

        //i6 -> Unit List Price -> regular price
        wcData.regular_price = 0;
        if(priceData.hasOwnProperty('status') && priceData.status == 200 && priceData.data[0].length > 0 && priceData.data[0][0].hasOwnProperty('Unit Price')) {
            let unitPrice = parseFloat(priceData.data[0][0]["Unit Price"]);
            wcData.regular_price = unitPrice.toFixed(2);
        } else {
            wcData.status = 'pending';
        }

        //Pending Product
        if(apiData['Blocked']) {
            wcData.status = "pending"; 
        } else {
            wcData.status = parseInt(wcData.regular_price) > 0 ? "publish" : 'pending';
        }

        let discountPercentage = 0;
        let discountDesc = "";
        if(parseInt(wcData.regular_price) > 0 && discountData.hasOwnProperty('status') && discountData.status == 200 && discountData.data[0].length > 0) {
            discountData.data[0].forEach((discount, el) => {
                //get highest discount Description
                discountDesc = (discountPercentage < parseInt(discount["line discount _"])) ? discount["Description"] : discountDesc;
                //get highest discount value
                discountPercentage = (discountPercentage < parseInt(discount["line discount _"])) ? parseInt(discount["line discount _"]) : discountPercentage;
            });
            console.log("Discount: " + discountPercentage);
            console.log("Discount Desc: " + discountDesc);
            let salePrice = parseFloat(wcData.regular_price - ((wcData.regular_price/100) * parseInt(discountPercentage)));
            wcData.sale_price = salePrice.toFixed(2);
        } else {
            wcData.sale_price = "";
        }    
        

        //i6 -> line discount _ -> sale price
        /*if(discountData.hasOwnProperty('status') && discountData.status == 200 && discountData.data[0].length > 0 && discountData.data[0][0].hasOwnProperty('line discount _')) {
            let salePrice = parseFloat(wcData.regular_price - ((wcData.regular_price/100) * parseInt(discountData.data[0][0]["line discount _"])));
            wcData.sale_price = salePrice.toFixed(2);
        } else {
            wcData.sale_price = "";
        }*/

        //i7 -> Gross Weight -> weight
        if(apiData['Gross Weight'] != null && apiData['Gross Weight'] != "") {
            wcData.weight = apiData['Gross Weight']; 
        }
        //i15 -> variant code
        if(apiData['VariantCode'] != null && apiData['VariantCode'] != "" && apiData['VariantCode'] == "REMI") {
            wcData.shipping_class = "remi";
        } else {
            wcData.shipping_class = "noshipping";
        }
        //i17 -> short description
        if(apiData['item Description'] != null && apiData['item Description'] != "") {
            wcData.short_description = apiData['item Description']; 
        }
        //i26- > description
        //let descriptionTxt = (apiData['ItemCategoryCode'] == '52') ? apiData['Detailed description'] : apiData['Products Notes'];
        let descriptionTxt = (apiData['ItemCategoryCode'] == '52') ? apiData['Detailed description'] : apiData['Detailed description'];
        if(descriptionTxt != null && descriptionTxt != "") {
            wcData.description = descriptionTxt; 
        } else {
            wcData.description = ""; 
        }
        
        if(apiData.brand != null && apiData.brand != "") {
            let branData = { name: apiData.brand.trim() };
            let newBrand = await postWCApiAsync("products/tags", branData);
            if(newBrand.hasOwnProperty('code')) {
                var brand_id = parseInt(newBrand.data.resource_id);
                brands.push({id: brand_id});
            } else {
                var brand_id = newBrand.id;
                brands.push({id: brand_id});
            }
        }

        //i19 -> tags
        if(brands.length > 0) {
            wcData.tags = brands;
        }
        
        //ItemCategoryCode for 52 => apiData['Of feed 2'], ItemCategoryCode for 50 => apiData['Product Group'], 
        //let childCategory = (apiData['ItemCategoryCode'] == '52') ? (apiData['Of feed 2'] != null && apiData['Of feed 2'] != "") ? apiData['Of feed 2'] : null : (apiData['Product Group'] != null && apiData['Product Group'] != "") ? apiData['Product Group'] : null ;
        
        let childCategory = (apiData['ItemCategoryCode'] == '52') ? apiData['Of feed 2'] : apiData['Product Group'];
        /*if(apiData.species !== null && apiData.species !== "") {
            let catsplit = apiData.species.split(",");
            if(catsplit.length > 0) {
                for(i=1; i<=catsplit.length; i++) {
                    
                    let categories = await getWCApiAsync("products/categories", creqdata);
                    let mainCategory = catsplit[i-1].toLocaleLowerCase().trim();
                    let getcats = await this.getCategories(mainCategory, childCategory, apiData['ItemCategoryCode'], apiData['VariantCode'], categories, cats);
                }
            }
        }*/

        if(apiData['Animal species'] !== null && apiData['Animal species'] !== "") {
            let catsplit = apiData['Animal species'].split(",");
            if(catsplit.length > 0) {
                for(i=1; i<=catsplit.length; i++) {
                    
                    let categories = await getWCApiAsync("products/categories", creqdata);
                    let mainCategory = catsplit[i-1].toLocaleLowerCase().trim();
                    let getcats = await this.getCategories(mainCategory, childCategory, apiData['ItemCategoryCode'], apiData['VariantCode'], categories, cats);
                }
            }
        }

        //i20 -> category
        if(cats.length > 0) {
            wcData.categories = cats;
        }

        //i21 -> VAT Products Group(shipping class)
        if(apiData['ItemCategoryCode'] != null && apiData['ItemCategoryCode'] != "") {
            wcData.tax_class = (apiData['ItemCategoryCode'] == "52") ? "mwst-2-5" : "mwst-7-7"; // Shipping class
        }

        //i12 -> stock
        if(stockData.hasOwnProperty('status') && stockData.status == 200) {
            wcData.stock_quantity = ( parseInt(stockData.data[0]['Stock']) > 0 ) ? parseInt(stockData.data[0]['Stock']) : 0;
            //wcData.stock_quantity = parseInt(stockData.data[0]['totalStock']);
            wcData.manage_stock = ( parseInt(stockData.data[0]['Stock']) > 0) ? true : false;
        } else {
            if(apiData.stock != null && apiData.stock != "") {
                wcData.stock_quantity = parseInt(apiData.stock);
                wcData.manage_stock = true;
            }
        }
        
        var filters = [];

        //i30 -> symptoms
        /*if(apiData['symptoms'] != null && apiData['symptoms'] != "") {
            filters.push({name: "krankheit", values:[apiData['symptoms']]});
        }*/
        if(apiData['Symptoms'] != null && apiData['Symptoms'] != "") {
            filters.push({name: "krankheit", values:[apiData['Symptoms']]});
        }
        //i35 -> Of feed 1
        if(apiData['Of feed 1'] != null && apiData['Of feed 1'] != "") {
            filters.push({name: "bedurfnisse", values:[apiData['Of feed 1']]});
        }
        //i36 -> Of feed 2
        if(apiData['Of feed 2'] != null && apiData['Of feed 2'] != "") {
            filters.push({name: "futterart", values:[apiData['Of feed 2']]});
        }
        //i39 -> flavor
        /*if(apiData['flavor'] != null && apiData['flavor'] != "") {
            filters.push({name: "geschmack", values:[apiData['flavor']]});
        }*/
        if(apiData['Flavor'] != null && apiData['Flavor'] != "") {
            filters.push({name: "geschmack", values:[apiData['Flavor']]});
        }
        //i40 -> Special Feature
        if(apiData['Special Feature'] != null && apiData['Special Feature'] != "") {
            filters.push({name: "spezial", values:[apiData['Special Feature']]});
        }
        //i41 -> Life stage
        if(apiData['Life stage'] != null && apiData['Life stage'] != "") {
            filters.push({name: "lebensphase", values:[apiData['Life stage']]});
        }
        //i42 -> Size
        if(apiData['Size'] != null && apiData['Size'] != "") {
            filters.push({name: "grosse", values:[apiData['Size']]});
        }

        if(filters.length > 0) {
            wcData.custom_taxonomy = filters;                                                
        }
        
        let images = [];

        //i1 -> product Image
        if(apiData.item_image != null && apiData.item_image != "") {
            let imgExits1 = await this.ifImageExists(apiData.item_image);
            if(imgExits1) {
                images.push({src: apiData.item_image});
            }
        }    
        //i50 -> product Image
        if(apiData['Image 1'] != null && apiData['Image 1'] != "") {
            let imgExits2 = await this.ifImageExists(apiData['Image 1']);
            if(imgExits2) {
                images.push({src: apiData['Image 1']});
            }
        }
        //i51 -> product Image
        if(apiData['Image 2'] != null && apiData['Image 2'] != "") {
            let imgExits3 = await this.ifImageExists(apiData['Image 2']);
            if(imgExits3) {
                images.push({src: apiData['Image 2']});
            }
        }
        //i52 -> product Image
        if(apiData['Image 3'] != null && apiData['Image 3'] != "") {
            let imgExits4 = await this.ifImageExists(apiData['Image 3']);
            if(imgExits4) {
                images.push({src: apiData['Image 3']});
            }
        }
        //i53 -> product Image
        if(apiData['Image 4'] != null && apiData['Image 4'] != "") {
            let imgExits5 = await this.ifImageExists(apiData['Image 4']);
            if(imgExits5) {
                images.push({src: apiData['Image 4']});
            }
        }    

        //woocommerce images
        if(images.length > 0) {
            //atul commend
            //wcData.images = images;
        }
        
        wcData.meta_data = [];

        if(discountData.hasOwnProperty('status') && discountData.status == 200 && discountData.data[0].length > 0) {
            wcData.meta_data.push({ "key": "discountperiod", "value": discountPercentage });
            wcData.meta_data.push({ "key": "discountdesc", "value": discountDesc });
        } else {
            wcData.meta_data.push({ "key": "discountperiod", "value": "" });
        }
        
        //i17 -> product short description meta
        if(apiData['item Description'] != null && apiData['item Description'] != "") {
            wcData.meta_data.push({ "key": "short_description",  "value": apiData['item Description'] });
        }
        //i23 -> product description meta
        if(descriptionTxt != null && descriptionTxt != "") {
            wcData.meta_data.push({ "key": "description",  "value": descriptionTxt });
        } else {
            wcData.meta_data.push({ "key": "description",  "value": "" });
        }
        //i3 -> Description2
        if(apiData.Description2 != null && apiData.Description2 != "") {
            wcData.meta_data.push({ "key": "description2",  "value": apiData.Description2 });
        }
        //i5 -> Ampelwert
        if(apiData.Ampelwert != null && apiData.Ampelwert != "") {
            wcData.meta_data.push({ "key": "ampelwert", "value": apiData.Ampelwert });
        }
        //i9 -> Sales Unit of Measure
        if(apiData['Sales Unit of Measure'] != null && apiData['Sales Unit of Measure'] != "") {
            wcData.meta_data.push({ "key": "sales_unit_measure", "value": apiData['Sales Unit of Measure'] });
        }
        //i10 -> Base Unit of Measure
        if(apiData['Base Unit of Measure'] != null && apiData['Base Unit of Measure'] != "") {
            wcData.meta_data.push({ "key": "base_unit_measure", "value": apiData['Base Unit of Measure'] });
        }
        //i11 -> additional text
        if(apiData['additional text'] != null && apiData['additional text'] != "") {
            wcData.meta_data.push({ "key": "additional_text", "value": apiData['additional text'] });
        }
        //i13 -> Alternative Article no
        if(apiData['Alternative Article no'] != null && apiData['Alternative Article no'] != "") {
            wcData.meta_data.push({ "key": "alt_article_no", "value": apiData['Alternative Article no'] });
        }
        //i14 -> Replacement Item
        if(apiData['Replacement Item'] != null && apiData['Replacement Item'] != "") {
            wcData.meta_data.push({ "key": "replacement_item", "value": apiData['Replacement Item'] });
        }
        //i15 -> item no
        if(apiData['item no'] != null && apiData['item no'] != "") {
            wcData.meta_data.push({ "key": "sku2", "value": apiData['item no'] });
        }
        //i18 -> Product Description 2
        if(apiData['Product Description 2'] != null && apiData['Product Description 2'] != "") {
            wcData.meta_data.push({ "key": "product_description_2", "value": apiData['Product Description 2'] });
        }
        //i22 -> Country of origin
        if(apiData['Country of origin'] != null && apiData['Country of origin'] != "") {
            wcData.meta_data.push({ "key": "country_of_origin", "value": apiData['Country of origin'] });
        }
        //i23 -> Product Advantage
        /*if(apiData['products advantage'] != null && apiData['products advantage'] != "") {
            wcData.meta_data.push({ "key": "products_advantage", "value": apiData['products advantage'] });
        }*/
        if(apiData['Product advantage'] != null && apiData['Product advantage'] != "") {
            wcData.meta_data.push({ "key": "products_advantage", "value": apiData['Product advantage'] });
        }
        //i24 -> Diameter
        if(apiData.diameter != null && apiData.diameter != "") {
            wcData.meta_data.push({ "key": "diameter", "value": apiData.diameter });
        }
        //i25 -> height
        if(apiData.height != null && apiData.height != "") {
            wcData.meta_data.push({ "key": "height", "value": apiData.height });
        }
        //i27 -> indication
        if(apiData.indication != null && apiData.indication != "") {
            wcData.meta_data.push({ "key": "indication", "value": apiData.indication });
        }
        //i28 -> indication
        if(apiData['Pharmacodynamic properties'] != null && apiData['Pharmacodynamic properties'] != "") {
            wcData.meta_data.push({ "key": "pharmacodynamic_properties", "value": apiData['Pharmacodynamic properties'] });
        }
        //i29 -> active substance
        if(apiData['active substance'] != null && apiData['active substance'] != "") {
            wcData.meta_data.push({ "key": "active_substance", "value": apiData['active substance'] });
        }
        //i31 -> features
        /*if(apiData.features != null && apiData.features != "") {
            wcData.meta_data.push({ "key": "features", "value": apiData.features });
        }*/
        if(apiData['Properties / effects'] != null && apiData['Properties / effects'] != "") {
            wcData.meta_data.push({ "key": "features", "value": apiData['Properties / effects'] });
        }
        //i32 -> Pharma Composition
        if(apiData['Pharma Composition'] != null && apiData['Pharma Composition'] != "") {
            wcData.meta_data.push({ "key": "pharma_composition", "value": apiData['Pharma Composition'] });
        }
        //i33 -> Additives per kg
        if(apiData['Additives per kg'] != null && apiData['Additives per kg'] != "") {
            wcData.meta_data.push({ "key": "additives_per_kg", "value": apiData['Additives per kg'] });
        }
        //i34 -> duration of treatment
        /*if(apiData['duration of treatment'] != null && apiData['duration of treatment'] != "") {
            wcData.meta_data.push({ "key": "duration_treatment", "value": apiData['duration of treatment'] });
        }*/
        if(apiData['Duration of treatment'] != null && apiData['Duration of treatment'] != "") {
            wcData.meta_data.push({ "key": "duration_treatment", "value": apiData['Duration of treatment'] });
        }
        //i38 -> Petfood composition
        let zusammensetzung = (apiData['ItemCategoryCode'] == '52') ? apiData['Petfood composition'] : apiData['Petfood composition'];
        if(zusammensetzung != null && zusammensetzung != "") {
            wcData.meta_data.push({ "key": "zusammensetzung", "value": zusammensetzung });
        } else {
            wcData.meta_data.push({ "key": "zusammensetzung", "value": "" });
        }
        //i42 -> Life stage
        if(apiData['Life stage'] != null && apiData['Life stage'] != "") {
            wcData.meta_data.push({ "key": "life_stage", "value": apiData['Life stage'] });
        }
        //i43 -> feeding recommendation
        //let futter_content = (apiData['ItemCategoryCode'] == '52') ? apiData['feeding recommendation'] : apiData['Products Notes'];
        let futter_content = (apiData['ItemCategoryCode'] == '52') ? apiData['Feeding recommendation'] : apiData['Products Notes'];
        if(futter_content != null && futter_content != "") {
            wcData.meta_data.push({ "key": "futter_content", "value": futter_content });
        } else {
            wcData.meta_data.push({ "key": "futter_content", "value": "" });
        }

        //i44 -> Höhe
        if(apiData['Höhe'] != null && apiData['Höhe'] != "") {
            wcData.meta_data.push({ "key": "hohe", "value": apiData['Höhe'] });
        }
        //i45 -> Packungsgrösse
        if(apiData['Packungsgrösse'] != null && apiData['Packungsgrösse'] != "") {
            wcData.meta_data.push({ "key": "disp_weight", "value": apiData['Packungsgrösse'] });
        }
        //i46 -> Technical specifications
        if(apiData['Technical specifications'] != null && apiData['Technical specifications'] != "") {
            wcData.meta_data.push({ "key": "technical_specifications", "value": apiData['Technical specifications'] });
        }
        //i47 -> scope of delivery
        if(apiData['scope of delivery'] != null && apiData['scope of delivery'] != "") {
            wcData.meta_data.push({ "key": "scope_of_delivery", "value": apiData['scope of delivery'] });
        }
        //i48 -> measuring range
        if(apiData['measuring range'] != null && apiData['measuring range'] != "") {
            wcData.meta_data.push({ "key": "measuring_range", "value": apiData['measuring range'] });
        }
        //i49 -> applications
        if(apiData.applications != null && apiData.applications != "") {
            wcData.meta_data.push({ "key": "applications", "value": apiData.applications });
        }
        //i54 -> Attachments
        if(apiData['Attachments'] != null && apiData['Attachments'] != "") {
            wcData.meta_data.push({ "key": "attachments", "value": apiData['Attachments'] });
        }
        //i55 -> Links to youtube videos
        if(apiData['Links to youtube videos'] != null && apiData['Links to youtube videos'] != "") {
            wcData.meta_data.push({ "key": "youtube_vidoes", "value": apiData['Links to youtube videos'] });
        }
        //i4
        if(apiData.GTIN != null && apiData.GTIN != "") {
            wcData.meta_data.push({ "key": "gtin", "value": apiData.GTIN });
        }

        //i37 -> Ingredients
        //let inhaltstsstoffe = (apiData['ItemCategoryCode'] == '52') ? apiData['Ingredients'] : apiData['products advantage'];
        let inhaltstsstoffe = (apiData['ItemCategoryCode'] == '52') ? apiData['Ingredients'] : apiData['Product advantage'];
        if(inhaltstsstoffe != null && inhaltstsstoffe != "") {
            wcData.meta_data.push({ "key": "inhaltstsstoffe", "value": inhaltstsstoffe });
        } else {
            wcData.meta_data.push({ "key": "inhaltstsstoffe", "value": "" });
        }

        //vetsExklusiv
        if(apiData['vetsExklusiv'] != null && apiData['vetsExklusiv'] != "") {
            wcData.meta_data.push({ "key": "vetsexklusiv", "value": apiData['vetsExklusiv'] });
        }

        //ItemCategoryCode
        if(apiData['ItemCategoryCode'] != null && apiData['ItemCategoryCode'] != "") {
            wcData.meta_data.push({ "key": "categorycode", "value": apiData['ItemCategoryCode'] });
        }

        /*if(discountData.hasOwnProperty('status') && discountData.status == 200 && discountData.data[0].length > 0 && discountData.data[0][0].hasOwnProperty('line discount _')) {
            //let discountPeriod = {discount: discountData.data[0][0]["line discount _"], start: discountData.data[0][0]["starting date"], end: discountData.data[0][0]["ending date"]};
            wcData.meta_data.push({ "key": "discountperiod", "value": parseInt(discountData.data[0][0]['line discount _']) });
        } else {
            wcData.meta_data.push({ "key": "discountperiod", "value": "" });
        }*/

        return wcData;
    },
    async getNavisionItem(req) {

        console.log("++++++++++++++++++++++++++++NaviITEM+++++++++++++++++++");

        let psku = req.params.sku;
        let type = req.query.type;
        let rdata = { sku: psku };
        let creqdata = {
            per_page: 100,
            page: 1,
        };
        var skus = [];
        let categories = await getWCApiAsync("products/categories", creqdata);
        if(type) {
            var itemUrl = "https://navision.oneix.dev/api/v1/item/"+psku;
        } else {
            var itemUrl = "https://navshop.provet.ch/api/v1/item/"+psku;
        }
        let options = { url: itemUrl, key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        let reqData = await utls.navisionGetData(options);
        let productData = await this.productData(reqData.data);
        console.log(reqData);
        
        let newProduct = await postWCApiAsync("products", productData);
        //New Product
        if(newProduct.hasOwnProperty('id')) {
            console.log("+++++++++ New Product ID:" + newProduct.id);
        }
        console.log("+++++++++++++++New Product+++++++++++++++++");
        console.log(newProduct);
        //Update Product
        if(newProduct.hasOwnProperty('code') && newProduct.code == "product_invalid_sku") {
            var updId = newProduct.hasOwnProperty('data') && newProduct.data.resource_id != "" ? newProduct.data.resource_id : 0;
            console.log("updID+++++++++++++++++++++>", updId);
            var updProduct = await putWCApiAsync("products/"+updId, productData);
            console.log("UPD PROUDCT++++++++++++++++++++++++", updProduct);
            console.log("+++++++++ Update Product ID:" + updProduct.id);
        }

        return productData;
    },
    async getNavisionItemStock(req) {
        let sku = req.params.sku;
        var itemUrl = "https://navshop.provet.ch/api/v1/item/itemStock/"+sku;
        let options = { url: itemUrl, key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        let reqData = await utls.navisionGetData(options);
        return reqData;
    },
    async getNavisionItemPrice(req) {
        let sku = req.params.sku;
        var itemUrl = "https://navshop.provet.ch/api/v1/item/getSalePrice?ItemNo="+sku+"&MinQty=1";
        let options = { url: itemUrl, key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        let reqData = await utls.navisionGetData(options);
        return reqData;
    },
    async getNavisionItemFilter(req) {
        let sku = req.params.sku;
        var navisionUrl = "https://navshop.provet.ch/api/v1/item/all";
        let options = { url: navisionUrl, key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        let navisonData = await utls.navisionGetData(options);
        let reqData = [];
        if(navisonData.hasOwnProperty('status') && navisonData.status == 200 ) {
            for (const [indx, apiData] of navisonData.data.entries()) {
                if(sku == 'REMI' && sku == apiData.VariantCode) {
                    reqData.push(apiData);
                }
                /*if(sku == 'zubehor' && apiData['ItemCategoryCode'] == '50' && (apiData.species != "" && apiData.species != null)) {
                    reqData.push(apiData);
                }
                if(sku == 'species' && (apiData.species == "" || apiData.species == null)) {
                    reqData.push(apiData);
                }*/
                if(sku == 'zubehor' && apiData['ItemCategoryCode'] == '50' && (apiData['Animal species'] != "" && apiData['Animal species'] != null)) {
                    reqData.push(apiData);
                }
                if(sku == 'species' && (apiData['Animal species'] == "" || apiData['Animal species'] == null)) {
                    reqData.push(apiData);
                }
                if(sku == apiData.Id) {
                    reqData.push(apiData);
                }
            }
        }
        return reqData;
    },
    async getNavisionItemDiscount(req) {
        let sku = req.params.sku;
        var itemUrl = "https://navshop.provet.ch/api/v1/item/getDiscount?ItemNo="+sku+"&MinQty=1";
        let options = { url: itemUrl, key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        let reqData = await utls.navisionGetData(options);
        return reqData;
    },
    async getCategories(mainCategory, childCategory, itemcode, variantcode, categories, cats) {

        let parentID = 0;

        if(mainCategory == "katze") {
            cats.push({id: 15});
            if(itemcode == '52') {
                parentID = 17;
                cats.push({id: parentID});
                if(variantcode != null && variantcode != "" && variantcode == "REMI") {
                    cats.push({id: 229});
                }
            }
            if(itemcode == '50') {
                parentID = 231;
                cats.push({id: parentID});
                if(variantcode != null && variantcode != "" && variantcode == "REMI") {
                    cats.push({id: 233});
                }
            }
        }

        if(mainCategory == "hund") {
            cats.push({id: 24});
            if(itemcode == '52') {
                parentID = 25;
                cats.push({id: parentID});
                if(variantcode != null && variantcode != "" && variantcode == "REMI") {
                    cats.push({id: 228});
                }
            }
            if(itemcode == '50') {
                parentID = 207;
                cats.push({id: parentID});
                if(variantcode != null && variantcode != "" && variantcode == "REMI") {
                    cats.push({id: 230});
                }
            }
        }

        if(mainCategory == "andere") {
            cats.push({id: 646});
            if(itemcode == '52') {
                parentID = 649;
                cats.push({id: parentID});
                if(variantcode != null && variantcode != "" && variantcode == "REMI") {
                    cats.push({id: 652});
                }
            }
            if(itemcode == '50') {
                parentID = 650;
                cats.push({id: parentID});
                if(variantcode != null && variantcode != "" && variantcode == "REMI") {
                    cats.push({id: 651});
                }
            }
        }

        if(childCategory !== null && childCategory !== "" && (mainCategory === "hund" || mainCategory === "katze" || mainCategory === "andere")) {
            var category = categories.filter(function(category) {
                return childCategory.trim().toLowerCase() == category.name.toLowerCase() && parentID == category.parent;
            });
            if(category.length > 0) {
                cats.push({id: category[0].id});                                                                                                                               
            } else {
                let cData = {
                    name: childCategory.trim(),
                    parent: (parentID > 0) ? parentID: 0, 
                };
                let createCategory = await postWCApiAsync("products/categories", cData);
                console.log(createCategory);
                cats.push({id: createCategory.id});
            }
        }
        
        return cats;
    },
    async getNoImagesProduct(req) {
        let data = [];
        
        /*let reqdata = {
            per_page: 500,
            page: 1,
        };*/        

        let allProducts = [],
        page = 1

        while (page !== false) {

            let products = await getWCApiAsync(`products?images=no&per_page=500&page=${page}`);

            if (products.length > 0) {
                allProducts = allProducts.concat(products)
                page++
            } else {
                page = false // last page
            }
        }

        console.log(allProducts.length);

        //allProducts = await getWCApiAsync(`products?per_page=200&page=${page}`);

        for (const [indx, product] of allProducts.entries()) {
            if(!indx) {
                console.log(product);
            }
            if(product.hasOwnProperty('images') && product.images.length === 0) {
                //data.push({NaviID: product.sku, WCID: product.id, name: product.name, url: "https://zoocialshop.ch/product/"+product.slug+"/"+product.id });
                data.push({NaviID: product.sku, WCID: product.id, name: product.name, url: `https://zoocialshop.ch/product/${product.slug}/${product.id}` });
            }
        }

        console.log(data.length);

        return data;
    },
    async navisionTest(req) {

        let sku = req.query.sku;
        var versionNo = "";
        let creqdata = { per_page: 200, page: 1, };
        
        let options = { url: "https://navshop.provet.ch/api/v1/item/"+sku, key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        let navisonData = await utls.navisionGetData(options);
        
        let wcData = {};
        
        if(navisonData.hasOwnProperty('status') && navisonData.status == 200 ) {
        
            let apiData = navisonData['data'];
            
            let stockOptions = { url: "https://navshop.provet.ch/api/v1/item/itemStock/"+apiData.Id, key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
            
            let stockData = await utls.navisionGetData(stockOptions);

            let priceOptions = { url: "https://navshop.provet.ch/api/v1/item/getSalePrice?ItemNo="+apiData.Id+"&MinQty=1", key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
            let priceData = await utls.navisionGetData(priceOptions);
                    
            let discountOptions = { url: "https://navshop.provet.ch/api/v1/item/getDiscount?ItemNo="+apiData.Id+"&MinQty=1", key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
            let discountData = await utls.navisionGetData(discountOptions);
            
            let dataAvail = false;                    

            wcData.sku = apiData.Id;
       

            //i6 -> Unit List Price -> regular price
            wcData.regular_price = 0;
            if(priceData.hasOwnProperty('status') && priceData.status == 200 && priceData.data[0].length > 0 && priceData.data[0][0].hasOwnProperty('Unit Price')) {
                let unitPrice = parseFloat(priceData.data[0][0]["Unit Price"]);
                wcData.regular_price = unitPrice.toFixed(2);
            } else {
                wcData.status = 'pending';
            }

            //Pending Product
            if(apiData['Blocked']) {
                wcData.status = "pending"; 
            } else {
                wcData.status = parseInt(wcData.regular_price) > 0 ? "publish" : 'pending';
            }

            //i6 -> line discount _ -> sale price
            let discountPercentage = 0;
            let discountDesc = "";
            let discountObject = {};
            if(discountData.hasOwnProperty('status') && discountData.status == 200 && discountData.data[0].length > 0) {
                discountData.data[0].forEach((discount, el)=> {
                    //get highest discount Description
                    discountDesc = (discountPercentage < parseInt(discount["line discount _"])) ? discount["Description"] : discountDesc;
                    //get highest discount value
                    discountPercentage = (discountPercentage < parseInt(discount["line discount _"])) ? parseInt(discount["line discount _"]) : discountPercentage;
                    //Highest Version No
                    if(versionNo < parseInt(discount["VersionNo"])) {
                        versionNo = discount["VersionNo"];
                        dataAvail = true;
                        console.log("+++++++++++++++++++++Highest Version No++++++++++++" +versionNo);
                    } else {
                        versionNo = versionNo;
                    }
                    //versionNo = (versionNo < parseInt(discount["VersionNo"])) ? discount["VersionNo"] : versionNo;
                });
                console.log("Discount: " + discountPercentage);
                console.log("Discount Desc: " + discountDesc);
                let salePrice = parseFloat(wcData.regular_price - ((wcData.regular_price/100) * parseInt(discountPercentage)));
                wcData.sale_price = salePrice.toFixed(2);
            } else {
                wcData.sale_price = "";
            }

            //i12 -> stock
            if(stockData.hasOwnProperty('status') && stockData.status == 200) {
                wcData.stock_quantity = ( parseInt(stockData.data[0]['Stock']) > 0 ) ? parseInt(stockData.data[0]['Stock']) : 0;
                //wcData.stock_quantity = parseInt(stockData.data[0]['totalStock']);
                wcData.manage_stock = ( parseInt(stockData.data[0]['Stock']) > 0) ? true : false;
            } else {
                if(apiData.stock != null && apiData.stock != "") {
                    wcData.stock_quantity = parseInt(apiData.stock);
                    wcData.manage_stock = true;
                }
            }

            //Shipping class Update
            //i15 -> variant code
            if(apiData['VariantCode'] != null && apiData['VariantCode'] != "" && apiData['VariantCode'] == "REMI") {
                wcData.shipping_class = "remi";
            } else {
                wcData.shipping_class = "noshipping";
            }

            wcData.meta_data = [];

            if(discountData.hasOwnProperty('status') && discountData.status == 200 && discountData.data[0].length > 0) {
                wcData.meta_data.push({ "key": "discountperiod", "value": discountPercentage });
                wcData.meta_data.push({ "key": "discountdesc", "value": discountDesc });
            } else {
                wcData.meta_data.push({ "key": "discountperiod", "value": "" });
            }       

            //i5 -> Ampelwert
            if(apiData.Ampelwert != null && apiData.Ampelwert != "") {
                wcData.meta_data.push({ "key": "ampelwert", "value": apiData.Ampelwert });
            }

            console.log(versionNo);
            //console.log(wcData);
            let rdata = { sku: apiData.Id };
            let wcProduct = await getWCApiAsync("products", rdata);
            if(wcProduct.length > 0 && wcProduct[0].hasOwnProperty('id')) {
                let updateData = await putWCApiAsync("products/"+wcProduct[0].id, wcData);
                console.log("+++++++++ Data Updated ++++++++");
                console.log("SKU: " + apiData.Id+ ", UPDID: "+ updateData.id);
            }
                    
        }
        
        return wcData;
    },
    async discountUpdate(req) {
        
        let data = {}; 
        var versionNo = "";
        let creqdata = { per_page: 200, page: 1, };
        var navisionUrl = "https://navshop.provet.ch/api/v1/item/all";
        let options = { url: navisionUrl, key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        let navisonData = await utls.navisionGetData(options);
        let reqData = [];
        var tmpVersionNo = 0;

        if (fs.existsSync("navidiscount.json")) {
            let navijson = fs.readFileSync('navidiscount.json');
            let naviData = JSON.parse(navijson);
            versionNo = naviData.hasOwnProperty('versionNo') ? naviData.versionNo : "";
            console.log(versionNo);      
        }

        if(navisonData.hasOwnProperty('status') && navisonData.status == 200 ) {
            
            for (const [indx, apiData] of navisonData.data.entries()) {
                
                //if(parseInt(apiData.VersionNo) > parseInt(versionNo)) {

                    //versionNo = apiData.VersionNo;
                    //tmpVersionNo = (tmpVersionNo < apiData.VersionNo) ? apiData.VersionNo : tmpVersionNo;
                    var cats =  [];
                    let stockOptions = { url: "https://navshop.provet.ch/api/v1/item/itemStock/"+apiData.Id, key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
                    let stockData = await utls.navisionGetData(stockOptions);

                    let priceOptions = { url: "https://navshop.provet.ch/api/v1/item/getSalePrice?ItemNo="+apiData.Id+"&MinQty=1", key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
                    let priceData = await utls.navisionGetData(priceOptions);
                
                    let discountOptions = { url: "https://navshop.provet.ch/api/v1/item/getDiscount?ItemNo="+apiData.Id+"&MinQty=1", key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
                    let discountData = await utls.navisionGetData(discountOptions);

                    let wcData = {};
                    let dataAvail = false;

                    wcData.sku = apiData.Id;

                    let childCategory = (apiData['ItemCategoryCode'] == '52') ? apiData['Of feed 2'] : apiData['Product Group'];

                    if(apiData['Animal species'] !== null && apiData['Animal species'] !== "") {
                        let catsplit = apiData['Animal species'].split(",");
                        if(catsplit.length > 0) {
                            for(i=1; i<=catsplit.length; i++) {
                                let categories = await getWCApiAsync("products/categories", creqdata);
                                let mainCategory = catsplit[i-1].toLocaleLowerCase().trim();
                                let getcats = await this.getCategories(mainCategory, childCategory, apiData['ItemCategoryCode'], apiData['VariantCode'], categories, cats);
                            }
                        }
                    }

                    //i20 -> category
                    if(cats.length > 0) {
                        wcData.categories = cats;
                    }        

                    /*//i6 -> Unit List Price -> regular price
                    if(priceData.hasOwnProperty('status') && priceData.status == 200 && priceData.data[0].length > 0 && priceData.data[0][0].hasOwnProperty('Unit Price')) {
                        let unitPrice = parseFloat(priceData.data[0][0]["Unit Price"]);
                        wcData.regular_price = unitPrice.toFixed(2);
                    } else {
                        if(apiData['Unit List Price'] != null && apiData['Unit List Price'] != "") {
                            let unitPrice = parseFloat(apiData['Unit List Price']);
                            wcData.regular_price = unitPrice.toFixed(2);
                        } 
                    }*/

                    //i6 -> Unit List Price -> regular price
                    wcData.regular_price = 0;
                    if(priceData.hasOwnProperty('status') && priceData.status == 200 && priceData.data[0].length > 0 && priceData.data[0][0].hasOwnProperty('Unit Price')) {
                        let unitPrice = parseFloat(priceData.data[0][0]["Unit Price"]);
                        wcData.regular_price = unitPrice.toFixed(2);
                    } else {
                        wcData.status = 'pending';
                    }

                    //Pending Product
                    if(apiData['Blocked']) {
                        wcData.status = "pending"; 
                    } else {
                        wcData.status = parseInt(wcData.regular_price) > 0 ? "publish" : 'pending';
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
                            
                            //Highest Version No
                            if(versionNo < parseInt(discount["VersionNo"])) {
                                versionNo = discount["VersionNo"];
                                dataAvail = true;
                                console.log("+++++++++++++++++++++Highest Version No++++++++++++" +versionNo);
                            } else {
                                versionNo = versionNo;
                            }
                            //versionNo = (versionNo < parseInt(discount["VersionNo"])) ? discount["VersionNo"] : versionNo;
                        });
                        console.log("Discount: " + discountPercentage);
                        console.log("Discount Desc: " + discountDesc);
                        let salePrice = parseFloat(wcData.regular_price - ((wcData.regular_price/100) * parseInt(discountPercentage)));
                        wcData.sale_price = salePrice.toFixed(2);
                    } else {
                        wcData.sale_price = "";
                    }

                    //i12 -> stock
                    if(stockData.hasOwnProperty('status') && stockData.status == 200) {
                        wcData.stock_quantity = ( parseInt(stockData.data[0]['Stock']) > 0 ) ? parseInt(stockData.data[0]['Stock']) : 0;
                        //wcData.stock_quantity = parseInt(stockData.data[0]['totalStock']);
                        wcData.manage_stock = ( parseInt(stockData.data[0]['Stock']) > 0) ? true : false;
                    } else {
                        if(apiData.stock != null && apiData.stock != "") {
                            wcData.stock_quantity = parseInt(apiData.stock);
                            wcData.manage_stock = true;
                        }
                    }

                    //Shipping class Update
                    //i15 -> variant code
                    if(apiData['VariantCode'] != null && apiData['VariantCode'] != "" && apiData['VariantCode'] == "REMI") {
                        wcData.shipping_class = "remi";
                    } else {
                        wcData.shipping_class = "noshipping";
                    }
                    
                    wcData.meta_data = [];

                    if(discountData.hasOwnProperty('status') && discountData.status == 200 && discountData.data[0].length > 0) {
                        wcData.meta_data.push({ "key": "discountperiod", "value": discountPercentage });
                        wcData.meta_data.push({ "key": "discountdesc", "value": discountDesc });
                    } else {
                        wcData.meta_data.push({ "key": "discountperiod", "value": "" });
                    }       

                    //i5 -> Ampelwert
                    if(apiData.Ampelwert != null && apiData.Ampelwert != "") {
                        wcData.meta_data.push({ "key": "ampelwert", "value": apiData.Ampelwert });
                    }

                    console.log(versionNo);
                    //console.log(wcData);
                    let rdata = { sku: apiData.Id };
                    let wcProduct = await getWCApiAsync("products", rdata);
                    if(wcProduct.length > 0 && wcProduct[0].hasOwnProperty('id')) {
                        let updateData = await putWCApiAsync("products/"+wcProduct[0].id, wcData);
                        console.log("+++++++++ Data Updated ++++++++");
                        console.log("SKU: " + apiData.Id+ ", UPDID: "+ updateData.id);
                    }
                
                //}

                //delay time 1000 milliseconds    
                //await this.timeDelay(1000);

            }

            console.log("Discount Data Updated Successfully");

            console.log("++++++++++++++++++New Version NO +++++++++++++++++++");
            console.log("New version No " + versionNo);
            console.log("++++++++++++++++++New Version NO +++++++++++++++++++");
            var versionData = JSON.stringify({ versionNo : versionNo });
            
            if (fs.existsSync("navidiscount.json")) {
                //file exists
                fs.writeFile('navidiscount.json', versionData, (err) => {
                    if (err) throw err;
                    console.log('Data written to file');
                });
            } else {
                fs.writeFileSync('navidiscount.json', versionData);
            }

            data = { status:true, message: "Discount Data Updated Successfully" };

        } else {
            data = { status:false, message: "Data Is not valid" };
        }

        return data;

    },
    async filtersUpdate(req) {
        
        var data = {};

        var navisionUrl = "https://navshop.provet.ch/api/v1/item/all";
        //var navisionUrl = "https://navshop.provet.ch/api/v1/item/getItems";
        let options = { url: navisionUrl, key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        let navisonData = await utls.navisionGetData(options);
        
        if(navisonData.hasOwnProperty('status') && navisonData.status == 200 ) {

            let spezialData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/spezial", {method:"GET"});
            let grosseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/grosse", {method:"GET"});
            let lebensphaseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/lebensphase", {method:"GET"});
            let bedurfnisseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/bedurfnisse", {method:"GET"});
            let geschmackData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/geschmack", {method:"GET"});
            let krankheitData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/krankheit", {method:"GET"});
            let futterartData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/futterart", {method:"GET"});

            //Remove All Data in spezial
            if(spezialData.length > 0) {
                for (const [sidx, spezial] of spezialData.entries()) {
                    let spezialDel = await utls.fetchData("https://zshop.dev/wp-json/custom_api/v2/taxonomies?taxonomy=spezial&tag_id="+spezial.id, {method:"DELETE"});
                    console.log(spezial.id + ", "+ spezial.name);
                }
            }        
                
            //Remove All Data in grosse
            if(grosseData.length > 0 ) {
                for (const [gidx, grosse] of grosseData.entries()) {
                    let grosseDel = await utls.fetchData("https://zshop.dev/wp-json/custom_api/v2/taxonomies?taxonomy=grosse&tag_id="+grosse.id, {method:"DELETE"});
                    console.log(grosse.id + ", "+ grosse.name);
                }
            }        

            //Remove All Data in lebensphase
            if(lebensphaseData.length > 0 ) {
                for (const [lidx, lebensphase] of lebensphaseData.entries()) {
                    let lebensphaseDel = await utls.fetchData("https://zshop.dev/wp-json/custom_api/v2/taxonomies?taxonomy=lebensphase&tag_id="+lebensphase.id, {method:"DELETE"});
                    console.log(lebensphase.id + ", "+ lebensphase.name);
                }
            }        

            //Remove All Data in bedurfnisse
            if(bedurfnisseData.length > 0 ) {
                for (const [bidx, bedurfnisse] of bedurfnisseData.entries()) {
                    let bedurfnisseDel = await utls.fetchData("https://zshop.dev/wp-json/custom_api/v2/taxonomies?taxonomy=bedurfnisse&tag_id="+bedurfnisse.id, {method:"DELETE"});
                    console.log(bedurfnisse.id + ", "+ bedurfnisse.name);
                }
            }        

            //Remove All Data in geschmack
            if(geschmackData.length > 0 ) {
                for (const [gidx, geschmack] of geschmackData.entries()) {
                    let geschmackDel = await utls.fetchData("https://zshop.dev/wp-json/custom_api/v2/taxonomies?taxonomy=geschmack&tag_id="+geschmack.id, {method:"DELETE"});
                    console.log(geschmack.id + ", "+ geschmack.name);
                }
            }        

            //Remove All Data in krankheit
            if(krankheitData.length > 0 ) {
                for (const [kidx, krankheit] of krankheitData.entries()) {
                    let krankheitDel = await utls.fetchData("https://zshop.dev/wp-json/custom_api/v2/taxonomies?taxonomy=krankheit&tag_id="+krankheit.id, {method:"DELETE"});
                    console.log(krankheit.id + ", "+ krankheit.name);
                }
            }        

            //Remove All Data in futterart
            if(futterartData.length > 0 ) {
                for (const [fidx, futterart] of futterartData.entries()) {
                    let futterartDel = await utls.fetchData("https://zshop.dev/wp-json/custom_api/v2/taxonomies?taxonomy=futterart&tag_id="+futterart.id, {method:"DELETE"});
                    console.log(futterart.id + ", "+ futterart.name);
                }
            }                

            //Navision Data Processing
            for (const [indx, apiData] of navisonData.data.entries()) {

                let wcData = {};
                let brands = [];

                wcData.sku = apiData.Id;

                if(apiData.brand != null && apiData.brand != "") {
                    let branData = { name: apiData.brand.trim() };
                    let newBrand = await postWCApiAsync("products/tags", branData);
                    if(newBrand.hasOwnProperty('code')) {
                        var brand_id = parseInt(newBrand.data.resource_id);
                        brands.push({id: brand_id});
                    } else {
                        var brand_id = newBrand.id;
                        brands.push({id: brand_id});
                    }
                }
        
                //i19 -> tags
                if(brands.length > 0) {
                    wcData.tags = brands;
                }

                var filters = [];

                //i30 -> symptoms
                /*if(apiData['symptoms'] != null && apiData['symptoms'] != "") {
                    filters.push({name: "krankheit", values:[apiData['symptoms']]});
                }*/
                if(apiData['Symptoms'] != null && apiData['Symptoms'] != "") {
                    filters.push({name: "krankheit", values:[apiData['Symptoms']]});
                }
                //i35 -> Of feed 1
                if(apiData['Of feed 1'] != null && apiData['Of feed 1'] != "") {
                    filters.push({name: "bedurfnisse", values:[apiData['Of feed 1']]});
                }
                //i36 -> Of feed 2
                if(apiData['Of feed 2'] != null && apiData['Of feed 2'] != "") {
                    filters.push({name: "futterart", values:[apiData['Of feed 2']]});
                }
                //i39 -> flavor
                /*if(apiData['flavor'] != null && apiData['flavor'] != "") {
                    filters.push({name: "geschmack", values:[apiData['flavor']]});
                }*/
                if(apiData['Flavor'] != null && apiData['Flavor'] != "") {
                    filters.push({name: "geschmack", values:[apiData['Flavor']]});
                }
                //i40 -> Special Feature
                if(apiData['Special Feature'] != null && apiData['Special Feature'] != "") {
                    filters.push({name: "spezial", values:[apiData['Special Feature']]});
                }
                //i41 -> Life stage
                if(apiData['Life stage'] != null && apiData['Life stage'] != "") {
                    filters.push({name: "lebensphase", values:[apiData['Life stage']]});
                }
                //i42 -> Size
                if(apiData['Size'] != null && apiData['Size'] != "") {
                    filters.push({name: "grosse", values:[apiData['Size']]});
                }

                if(filters.length > 0) {
                    wcData.custom_taxonomy = filters;                                                
                }

                console.log(wcData);
                let rdata = { sku: apiData.Id };
                let wcProduct = await getWCApiAsync("products", rdata);
                if(wcProduct.length > 0 && wcProduct[0].hasOwnProperty('id')) {
                    let updateData = await putWCApiAsync("products/"+wcProduct[0].id, wcData);
                    console.log("+++++++++ Data Updated START ++++++++");
                    console.log("SKU: " + apiData.Id+ ", UPDID: "+ updateData.id);
                    console.log("+++++++++ Data Updated END ++++++++");
                }
            }

            //tags start here
            let treqdata = { per_page: 200, page: 1 };
            let wcTags = await getWCApiAsync("products/tags", treqdata);
            //remove empty tags
            if(wcTags.length > 0 ) {
                for (const [tidx, tag] of wcTags.entries()) {
                    if(!tag.count) {
                        let deleteEmpty = await getWCApiAsync("products/tags/"+tag.id, {force: true});
                        console.log(deleteEmpty);
                    }
                }
            }
            //tags end here

            console.log("Filters Data Updated Successfully");

            data = { status:true, message: "Filters Data Updated Successfully" };
        } else {
            data = { status:false, message: "Data Is not valid" };
        }

        return data;

    },
    async imagesUpdate() {

        let data = {};
        var versionNo = ""; 

        const url = await config.wcsettings.url + "wp-json/jwt-auth/v1/token";

        let formdata = {username: 'kolavape', password: 'ujagjemrofHas2'};
        const inputData = { method: 'POST', data: formdata };
        let jwtres = await utls.postData(url, inputData);
        let token = jwtres.token;
        console.log(jwtres);

        var navisionUrl = "https://navshop.provet.ch/api/v1/item/all";
        //var navisionUrl = "https://navshop.provet.ch/api/v1/item/getItems";
        let options = { url: navisionUrl, key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        let navisonData = await utls.navisionGetData(options);


        if(navisonData.hasOwnProperty('status') && navisonData.status == 200 ) {
            for (const [indx, apiData] of navisonData.data.entries()) {

                let imgUpdate = false;

                    let wcData = {};

                    console.log("+++++++++++++"+ apiData.Id + "+++++++++++++");

                    wcData.sku = apiData.Id;

                    let images = [];

                    //i1 -> product Image
                    if(apiData.item_image != null && apiData.item_image != "") {
                        let imgExits1 = await this.ifImageExists(apiData.item_image);
                        if(imgExits1) {
                            images.push({src: apiData.item_image});
                        }
                    }    
                    //i50 -> product Image
                    if(apiData['Image 1'] != null && apiData['Image 1'] != "") {
                        let imgExits2 = await this.ifImageExists(apiData['Image 1']);
                        if(imgExits2) {
                            images.push({src: apiData['Image 1']});
                        }
                    }
                    //i51 -> product Image
                    if(apiData['Image 2'] != null && apiData['Image 2'] != "") {
                        let imgExits3 = await this.ifImageExists(apiData['Image 2']);
                        if(imgExits3) {
                            images.push({src: apiData['Image 2']});
                        }
                    }
                    //i52 -> product Image
                    if(apiData['Image 3'] != null && apiData['Image 3'] != "") {
                        let imgExits4 = await this.ifImageExists(apiData['Image 3']);
                        if(imgExits4) {
                            images.push({src: apiData['Image 3']});
                        }
                    }
                    //i53 -> product Image
                    if(apiData['Image 4'] != null && apiData['Image 4'] != "") {
                        let imgExits5 = await this.ifImageExists(apiData['Image 4']);
                        if(imgExits5) {
                            images.push({src: apiData['Image 4']});
                        }
                    }    

                    //woocommerce images
                    if(images.length > 0) {
                        //atul commend
                        wcData.images = images;    
                    }

                    console.log(wcData);
                    //let rdata = { sku: apiData.Id, images: "both" };
                    let wcProduct = await getWCApiAsync("products", { sku: apiData.Id, images: "both" });
                    
                    //atul commend
                    if(wcProduct.length > 0 && wcProduct[0].hasOwnProperty('id')) {
                        if(wcData.hasOwnProperty('images') && wcProduct[0].images.length > 0) {

                            let naviImage = await utls.imageSize(wcData.images[0].src);
                            let wooImage = await utls.imageSize(wcProduct[0].images[0].src);
                            
                            if(naviImage.width != wooImage.width || naviImage.height != wooImage.height) {
                                imgUpdate = true;                                                        
                            }
                            
                            if(imgUpdate) {

                                for (const [indx, image] of wcProduct[0].images.entries()) {

                                    let imageID = image.id;
                                    const options = {
                                        url: 'https://zshop.dev/wp-json/wp/v2/media/'+imageID+'?force=true',
                                        authtoken: 'Bearer ' + token,
                                    };
                                    let delData = await utls.requestDeleteData(options);
                                    //let result = await delData;
                                    if(delData.status && delData.response.hasOwnProperty('deleted') && delData.response.deleted ) {
                                        console.log("---------------------->Deleted Image ID: " + imageID);
                                        let updateData = await putWCApiAsync("products/"+wcProduct[0].id, wcData);
                                        console.log("+++++++++ Data Updated START ++++++++");
                                        console.log("SKU: " + apiData.Id+ ", UPDID: "+ updateData.id);
                                        console.log("+++++++++ Data Updated END ++++++++");
                                    }
                                }
                            }

                        } else {
                            if(wcData.hasOwnProperty('images') && wcData.images.length > 0) {
                                let updateData = await putWCApiAsync("products/"+wcProduct[0].id, wcData);
                                console.log("+++++++++ Data Updated START ++++++++");
                                console.log("SKU: " + apiData.Id+ ", UPDID: "+ updateData.id);
                                console.log("+++++++++ Data Updated END ++++++++");
                            }
                        }
                        
                    }

            } //LOOP End

            console.log("Images Data Updated Successfully");

            data = { status:true, message: "Images Data Updated Successfully" };
        } else {
            data = { status:false, message: "Data Is not valid" };
        }
        return data;
    },
    async singleImagesUpdate(req) {

        let data = {};
        let psku = req.params.sku;
        let type = req.query.type;
        let rdata = { sku: psku, images: "both" };
        let imgUpdate = false; 

        const url = await config.wcsettings.url + "wp-json/jwt-auth/v1/token";

        let formdata = {username: 'kolavape', password: 'ujagjemrofHas2'};
        const inputData = { method: 'POST', data: formdata };
        let jwtres = await utls.postData(url, inputData);
        let token = jwtres.token;
        console.log(jwtres);

        if(type) {
            var itemUrl = "https://navision.oneix.dev/api/v1/item/"+psku;
        } else {
            var itemUrl = "https://navshop.provet.ch/api/v1/item/"+psku;
        }
        let options = { url: "https://navshop.provet.ch/api/v1/item/"+psku, key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };

        let navisonData = await utls.navisionGetData(options);
        
        console.log("Navision Get Data+++++++++++++", navisonData);

        if(navisonData.hasOwnProperty('status') && navisonData.status == 200 ) {
            
                let apiData = navisonData.data;

                let wcProduct = await getWCApiAsync("products", rdata);

                console.log("Single Image Update", wcProduct);

                let wcData = {};

                console.log("+++++++++++++"+ apiData.Id + "+++++++++++++");

                wcData.sku = apiData.Id;

                let images = [];

                //i1 -> product Image
                if(apiData.item_image != null && apiData.item_image != "") {
                    let imgExits1 = await this.ifImageExists(apiData.item_image);
                    if(imgExits1) {
                        //console.log("FIND VERIFIED iMAGE+++++++++++", imgExits1)
                        images.push({src: apiData.item_image});
                    }
                }    
                //i50 -> product Image
                if(apiData['Image 1'] != null && apiData['Image 1'] != "") {
                    let imgExits2 = await this.ifImageExists(apiData['Image 1']);
                    if(imgExits2) {
                        images.push({src: apiData['Image 1']});
                    }
                }
                //i51 -> product Image
                if(apiData['Image 2'] != null && apiData['Image 2'] != "") {
                    let imgExits3 = await this.ifImageExists(apiData['Image 2']);
                    if(imgExits3) {
                        images.push({src: apiData['Image 2']});
                    }
                }
                //i52 -> product Image
                if(apiData['Image 3'] != null && apiData['Image 3'] != "") {
                    let imgExits4 = await this.ifImageExists(apiData['Image 3']);
                    if(imgExits4) {
                        images.push({src: apiData['Image 3']});
                    }
                }
                //i53 -> product Image
                if(apiData['Image 4'] != null && apiData['Image 4'] != "") {
                    let imgExits5 = await this.ifImageExists(apiData['Image 4']);
                    if(imgExits5) {
                        images.push({src: apiData['Image 4']});
                    }
                }    

                //woocommerce images
                if(images.length > 0) {
                    //atul commend
                    wcData.images = images;    
                }

                //atul commend
                if(wcProduct.length > 0 && wcProduct[0].hasOwnProperty('id')) {
                    //console.log("LEN1++++++", wcProduct);
                    if(wcData.hasOwnProperty('images') && wcProduct[0].images.length > 0) {

                        let naviImage = await utls.imageSize(wcData.images[0].src);
                        let wooImage = await utls.imageSize(wcProduct[0].images[0].src);
                        
                        if((naviImage.width != wooImage.width) || (naviImage.height != wooImage.height)) {
                            imgUpdate = true;                                                        
                        }

                        console.log(imgUpdate);
                        console.log(wcData);

                        if(imgUpdate) {
                            // Delete ALL woocommerce Images
                            for (const [indx, image] of wcProduct[0].images.entries()) {
                                let imageID = image.id;
                                const options = {
                                    url: 'https://zshop.dev/wp-json/wp/v2/media/'+imageID+'?force=true',
                                    authtoken: 'Bearer ' + token,
                                };
    
                                let delData = await utls.requestDeleteData(options);
                                //console.log("del Data+++++++++++++", delData);
                                //let result = await delData;
                                if(delData.status && delData.response.hasOwnProperty('deleted') && delData.response.deleted ) {
                                    console.log("---------------------->Deleted Image ID: " + imageID);
                                    // Update Data
                                    let updateData = await putWCApiAsync("products/"+wcProduct[0].id, wcData);
                                    console.log("+++++++++ Data Updated START ++++++++");
                                    console.log("SKU: " + apiData.Id+ ", UPDID: "+ updateData.id);
                                    console.log("+++++++++ Data Updated END ++++++++");
                                }
                            }
                        }

                    } else {
                        //console.log("LEN2++++++", wcProduct);
                        if(wcData.hasOwnProperty('images')) {
                            //console.log("LEN3++++++", wcProduct);
                            let updateData = await putWCApiAsync("products/"+wcProduct[0].id, wcData);
                            console.log("+++++++++ Data Updated START ++++++++");
                            console.log("SKU: " + apiData.Id+ ", UPDID: "+ updateData.id);
                            console.log("+++++++++ Data Updated END ++++++++");
                        }
                    }
                    
                }

            data = { status:true, message: "Images Data Updated Successfully" };
        } else {
            data = { status:false, message: "Data Is not valid" };
        }
        return data;
    },
    async ifImageExists(image_url) {
        var http = new XMLHttpRequest();
        http.open('HEAD', image_url, false);
        http.send();
        console.log(image_url+"  ->  " +http.status);
        return (http.status == 200) ? true : false;
    },
    async contentUpdate(req) {
        
        let data = {}; 
        var versionNo = "";
        var tmpVersionNo = 0;

        var navisionUrl = "https://navshop.provet.ch/api/v1/item/all";
        let options = { url: navisionUrl, key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };
        let navisonData = await utls.navisionGetData(options);
        let reqData = [];

        if (fs.existsSync("navicontent.json")) {
            let navijson = fs.readFileSync('navicontent.json');
            let naviData = JSON.parse(navijson);
            versionNo = naviData.hasOwnProperty('versionNo') ? naviData.versionNo : "";
            console.log(versionNo);      
        }

        if(navisonData.hasOwnProperty('status') && navisonData.status == 200 ) {
            for (const [indx, apiData] of navisonData.data.entries()) {
                
                //version no based condition
                //if(parseInt(apiData.VersionNo) > parseInt(versionNo)) {

                    //versionNo = apiData.VersionNo;
                    tmpVersionNo = (tmpVersionNo < apiData.VersionNo) ? apiData.VersionNo : tmpVersionNo;

                    let wcData = {};
                    
                    wcData.sku = apiData.Id;
                    
                    if(apiData['Description'] != null && apiData['Description'] != "") {
                        wcData.name = apiData['Description']; 
                    }

                    //Pending Product
                    /*if(apiData['Blocked']) {
                        wcData.status = "pending"; 
                    } else {
                        wcData.status = "publish";
                    }*/

                    //i15 -> variant code
                    if(apiData['VariantCode'] != null && apiData['VariantCode'] != "" && apiData['VariantCode'] == "REMI") {
                        wcData.shipping_class = "remi";
                    } else {
                        wcData.shipping_class = "noshipping";
                    }

                    //i26- > description
                    let descriptionTxt = (apiData['ItemCategoryCode'] == '52') ? apiData['Detailed description'] : apiData['Detailed description'];
                    if(descriptionTxt != null && descriptionTxt != "") {
                        wcData.description = descriptionTxt; 
                    } else {
                        wcData.description = ""; 
                    }

                    wcData.meta_data = [];

                    //i23 -> product description meta
                    if(descriptionTxt != null && descriptionTxt != "") {
                        wcData.meta_data.push({ "key": "description",  "value": descriptionTxt });
                    } else {
                        wcData.meta_data.push({ "key": "description",  "value": "" });
                    }

                    let inhaltstsstoffe = (apiData['ItemCategoryCode'] == '52') ? apiData['Ingredients'] : apiData['products advantage'];
                    if(inhaltstsstoffe != null && inhaltstsstoffe != "") {
                        wcData.meta_data.push({ "key": "inhaltstsstoffe", "value": inhaltstsstoffe });
                    } else {
                        wcData.meta_data.push({ "key": "inhaltstsstoffe", "value": "" });
                    }

                    //i38 -> Petfood composition
                    let zusammensetzung = (apiData['ItemCategoryCode'] == '52') ? apiData['Petfood composition'] : apiData['Petfood composition'];
                    if(zusammensetzung != null && zusammensetzung != "") {
                        wcData.meta_data.push({ "key": "zusammensetzung", "value": zusammensetzung });
                    } else {
                        wcData.meta_data.push({ "key": "zusammensetzung", "value": "" });
                    }

                    //i43 -> feeding recommendation
                    //let futter_content = (apiData['ItemCategoryCode'] == '52') ? apiData['feeding recommendation'] : apiData['Products Notes'];
                    let futter_content = (apiData['ItemCategoryCode'] == '52') ? apiData['Feeding recommendation'] : apiData['Products Notes'];
                    if(futter_content != null && futter_content != "") {
                        wcData.meta_data.push({ "key": "futter_content", "value": futter_content });
                    } else {
                        wcData.meta_data.push({ "key": "futter_content", "value": "" });
                    }

                    //i5 -> Ampelwert
                    if(apiData.Ampelwert != null && apiData.Ampelwert != "") {
                        wcData.meta_data.push({ "key": "ampelwert", "value": apiData.Ampelwert });
                    }

                    //ItemCategoryCode
                    if(apiData['ItemCategoryCode'] != null && apiData['ItemCategoryCode'] != "") {
                        wcData.meta_data.push({ "key": "categorycode", "value": apiData['ItemCategoryCode'] });
                    }

                    //i3 -> Description2
                    if(apiData.Description2 != null && apiData.Description2 != "") {
                        wcData.meta_data.push({ "key": "description2",  "value": apiData.Description2 });
                    }

                    console.log(wcData);
                    let rdata = { sku: apiData.Id };
                    let wcProduct = await getWCApiAsync("products", rdata);
                    if(wcProduct.length > 0 && wcProduct[0].hasOwnProperty('id')) {
                        let updateData = await putWCApiAsync("products/"+wcProduct[0].id, wcData);
                        console.log("+++++++++ Data Updated ++++++++");
                        console.log("SKU: " + apiData.Id+ ", UPDID: "+ updateData.id);
                    }
                
                //}

            //delay time 1000 milliseconds    
            await this.timeDelay(1000);

            }

            console.log("Content Data Updated Successfully");

            console.log("New version No " + (tmpVersionNo > versionNo) ? tmpVersionNo : versionNo);
            var versionData = JSON.stringify({ versionNo : (tmpVersionNo > versionNo) ? tmpVersionNo : versionNo });

            if (fs.existsSync("navicontent.json")) {
                //file exists
                fs.writeFile('navicontent.json', versionData, (err) => {
                    if (err) throw err;
                    console.log('Data written to file');
                });
            } else {
                fs.writeFileSync('navicontent.json', versionData);
            }

            data = { status:true, message: "Content Data Updated Successfully" };

        } else {
            data = { status:false, message: "Data Is not valid" };
        }

        return data;

    },
    async timeDelay(ms) {
        setTimeout(function(){
            console.log(ms + " Delay");
        }, ms);
    }
}

module.exports = Navison;