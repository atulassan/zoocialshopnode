const mCategories = require('../models/categories');

Categories = {
    async create(req, res) {
        var result = await mCategories.create(req);
        res.send(result);
    },
    async update(req, res) {
        var result = await mCategories.update(req);
        res.send(result);
    },
    async delete(req, res) {
        var result = await mCategories.delete(req);
        res.send(result);
    },
    async lists(req, res) {
        var result = await mCategories.lists(req);
        res.render("shop/pages/categories", result);
    },
    async list(req, res) {
        var result = await mCategories.list(req);
        res.render('shop/pages/category', data);
    },
    async singleCategory(req, res) {
        var result = await mCategories.singleCategory(req);
        res.render('shop/pages/category', data);
    }
}

module.exports = Categories;