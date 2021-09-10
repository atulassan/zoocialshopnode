const mNavison = require("../models/navison");

Navison = {
  async insert(req, res) {
    res.setHeader("Content-Type", "application/json");
    var result = await mNavison.insert(req);
    res.send(result);
  },
  async update(req, res) {
    res.setHeader("Content-Type", "application/json");
    var result = await mNavison.update(req);
    res.send(result);
  },
  async navisionTest(req, res) {
    res.setHeader("Content-Type", "application/json");
    var result = await mNavison.navisionTest(req);
    res.send(result);
  },
  async getNavisionItem(req, res) {
    res.setHeader("Content-Type", "application/json");
    var result = await mNavison.getNavisionItem(req);
    res.send(result);
  },
  async getNavisionItemStock(req, res) {
    res.setHeader("Content-Type", "application/json");
    var result = await mNavison.getNavisionItemStock(req);
    res.send(result);
  },
  async getNavisionItemPrice(req, res) {
    res.setHeader("Content-Type", "application/json");
    var result = await mNavison.getNavisionItemPrice(req);
    res.send(result);
  },
  async getNavisionItemFilter(req, res) {
    res.setHeader("Content-Type", "application/json");
    var result = await mNavison.getNavisionItemFilter(req);
    res.send(result);
  },
  async getNavisionItemDiscount(req, res) {
    res.setHeader("Content-Type", "application/json");
    var result = await mNavison.getNavisionItemDiscount(req);
    res.send(result);
  },
  async getNoImagesProduct(req, res) {
    res.setHeader("Content-Type", "application/json");
    var result = await mNavison.getNoImagesProduct(req);
    res.send(result);
  },
  async discountUpdate(req, res) {
    res.setHeader("Content-Type", "application/json");
    var result = await mNavison.discountUpdate(req);
    res.send(result);
  },
  async filtersUpdate(req, res) {
    res.setHeader("Content-Type", "application/json");
    var result = await mNavison.filtersUpdate(req);
    res.send(result);
  },
  async imagesUpdate(req, res) {
    res.setHeader("Content-Type", "application/json");
    var result = await mNavison.imagesUpdate(req);
    res.send(result);
  },
  async contentUpdate(req, res) {
    res.setHeader("Content-Type", "application/json");
    var result = await mNavison.contentUpdate(req);
    res.send(result);
  },
  async singleImagesUpdate(req, res) {
    res.setHeader("Content-Type", "application/json");
    var result = await mNavison.singleImagesUpdate(req);
    res.send(result);
  },
};

module.exports = Navison;