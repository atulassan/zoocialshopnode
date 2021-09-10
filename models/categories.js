

Categories = {
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

        let reqdata = {
            status: 'publish',
            per_page: 9,
            page: 1,
            orderby: "date",
            order: "desc"
        }

        let creqdata = {
            per_page: 9,
            page: 1
        };  

        let products = await getWCApiAsync("products", reqdata);
        let categories = await getWCApiAsync("products/categories", creqdata);
        let tags = await getWCApiAsync("products/tags");

        data = {
            products: products,
            categories: utls.getNestedChildren(categories, 0),
            tags: tags,
        }

        return data;

        //res.render("shop/pages/categories", data);

    },

    async list(req) {

        let rqdata = {
            status: 'publish',
            per_page: 9,
            category: req.params.id,
            page: 1,
            orderby: "date",
            order: "desc"
        }

        let creqdata = {
            per_page: 50,
            page: 1
        };  

        let products = await getWCApiAsync("products", rqdata);
        let categories = await getWCApiAsync("products/categories", creqdata);
        let tags = await getWCApiAsync("products/tags");

        var getSubcategories = categories.filter(function (category) {
            return category.parent == req.params.id;
        });

        data = {
            products: products,
            categories: utls.getNestedChildren(categories, 0),
            subcategories: (getSubcategories.length > 0) ? getSubcategories : null,
            tags: tags,
            category_id: rqdata.category,
            customeScript: true,
        }
        
        return data;

        //res.render('shop/pages/category', data);
    },

    async singleCategory(req) {

        console.log(req.params);
        console.log(req.query);

        let qpage = req.query.hasOwnProperty('page') ? parseInt(req.query.page) : 1;
        let urlFilters = [];

        console.log("+++++++++++++++++++++");
        console.log(qpage);
        console.log("+++++++++++++++++++++");

        var parent = {},
            current ={},
            subcat = {},
            linkcategories="";

        let spezialData = null;
        let grosseData = null;
        let lebensphaseData = null;
        let bedurfnisseData = null;
        let geschmackData = null;
        let krankheitData = null;
        let futterartData = null;
        let tags = null;

        let rqdata = {
            status: 'publish',
            per_page: qpage * 9,
            category: req.params.id,
            page: 1,
            orderby: "rating", //title
            order: "desc" //asc
        }

        let creqdata = {
            per_page: 100,
            page: 1,
            hide_empty: true
        };  

        let treqdata = {
            per_page: 100,
            page: 1
        };

        //taxonomies fitlers
        spezialData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/spezial", {method:"GET"});
        grosseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/grosse", {method:"GET"});
        lebensphaseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/lebensphase", {method:"GET"});
        bedurfnisseData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/bedurfnisse", {method:"GET"});
        //geschmackData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/geschmack", {method:"GET"});
        //krankheitData = await utls.fetchData("https://zshop.dev/wp-json/wp/v2/krankheit", {method:"GET"});
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

        let products = await getWCApiAsync("products", rqdata);
        let categories = await getWCApiAsync("products/categories", creqdata);
        let singleCategory = await getWCApiAsync("products/categories/"+req.params.id);
        //let pld = await utls.getNestedChildren(categories, 0);

        console.log(singleCategory);

        if(singleCategory.hasOwnProperty('breadcrumb') && singleCategory.breadcrumb.length > 0) {
            singleCategory.breadcrumb.forEach((category, el)=> {
                linkcategories += category.name + " - ";
            });         
        }

        //console.log(urlFilters);

        //console.log(pld);
        //console.log(singleCategory);

        /*if(singleCategory.parent) {
            var listSubCategories = categories.filter(function (category) {
                return category.parent == singleCategory.parent;
            });
        } else {
            var listSubCategories = categories.filter(function (category) {
                return category.parent == req.params.id;
            });
        }*/

        current = categories.filter(function(category) {
            return category.id == req.params.id;
        });

        if(current.length > 0 && current[0].hasOwnProperty('parent')) {
            parent = categories.filter(function(category) {
                return category.id == current[0].parent;
            });
        }
        
        /*if(parent != null) {
            child = categories.filter(function(category) {
                return category.id == singleCategory.parent;
            });
        }
        
        console.log(parent);
        console.log(child);*/

        /*var getSubcategories = categories.filter(function (category) {
            return category.parent == req.params.id;
        });*/


        //console.log(categories);
        //console.log(getSubcategories);
        //console.log(singleCategory);

        data = {
            products: products,
            categories: utls.getNestedChildren(categories, 0),
            singleCategory: singleCategory,
            //subcategories: (getSubcategories.length > 0) ? getSubcategories : null,
            //listSubCategories: (listSubCategories.length > 0) ? listSubCategories : null,
            listSubCategories: utls.getNestedChildren(categories, 0),
            tags: tags,
            category_id: rqdata.category,
            customeScript: {enable: true},
            active: req.params.id,
            parent: parent,
            current: current,
            spezialData: spezialData,
            grosseData: grosseData,
            lebensphaseData: lebensphaseData,
            bedurfnisseData: bedurfnisseData,
            geschmackData: geschmackData,
            krankheitData: krankheitData,
            futterartData: futterartData,
            qpage: qpage,
            urlFilters: urlFilters,
            metaInfo: {page: "category", category: linkcategories},
        }

        //console.log(data.subcategories);

        return data;

        //res.render('shop/pages/category', data);
    }
}

module.exports = Categories;