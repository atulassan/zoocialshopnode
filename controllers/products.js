const mProducts = require("../models/products");

Products = {
  async create(req, res) {
    var result = await mProducts.create(req);
    res.send(result);
  },
  async update(req, res) {
    var result = await mProducts.update(req);
    res.send(result);
  },
  async delete(req, res) {
    var result = await mProducts.delete(req);
    res.send(result);
  },
  async lists(req, res) {
    var result = await mProducts.lists(req);
    res.render("shop/pages/shop", result);
  },
  async list(req, res) {
    var result = await mProducts.list(req);
    res.render("shop/pages/singleproduct", result);
  },
  async singleProduct(req, res) {
    var result = await mProducts.singleProduct(req);
    res.render("shop/pages/singleproduct", result);
  },
  async tags(req, res) {
    var result = await mProducts.tags(req);
    res.render("shop/pages/brand", result);
  },
  async createReview(req, res) {
    var result = await mProducts.createReview(req);
    res.send(result);
  },
  async filter(req, res) {
    var result = await mProducts.filter(req);
    if (result.status) {
      res.setHeader("Content-Type", "application/json");
      const productsTmp = "views/shop/modules/productupdate.ejs";
      let productUpd = await utls.renderEjsFile(productsTmp, result);
      result.products = productUpd;
      res.send(result);
      //res.render("shop/modules/productupdate", result);
    } else {
      res.setHeader("Content-Type", "application/json");
      res.send(result);
    }
  },
  async homePageNew(req, res) {
    var result = await mProducts.homePageNew(req);
    res.render("shop/pages/homepage", result);
  },
  async search(req, res) {
    //console.log('testing');
    res.setHeader("Content-Type", "application/json");
    var products = [];
    let search = req.body.search;
    //products = await getWCApiAsync("products?status=publish&search=" + search);
    products = await getWCApiAsync("products", { status: "publish", search: search });
    res.send(products);
  },
  async searchProducts(req, res) {
    result = await mProducts.searchProducts(req);
    res.render("shop/pages/search", result);
  },
  async remiProducts(req, res) {
    result = await mProducts.remiProducts(req);
    res.render("shop/pages/remiproducts", result);
  },
  async hundeRemi(req, res) {
    result = await mProducts.hundeRemi(req);
    res.render("shop/pages/remiproducts", result);
  },
  async katzeRemi(req, res) {
    result = await mProducts.katzeRemi(req);
    res.render("shop/pages/remiproducts", result);
  },
  async filters(req, res) {
    //res.setHeader("Content-Type", "application/json");
    result = await mProducts.filters(req);
    //res.send(result);
    res.render("shop/modules/top-filter.ejs", result);
  },
  async remiProductsApi(req, res) {
      res.setHeader("Content-Type", "application/json");
      result = await mProducts.remiProductsApi(req);
      res.send(result);    
  },
};

module.exports = Products;
