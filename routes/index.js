var express = require('express');
var router = express.Router();

var Products = require('../controllers/products');
var Categories = require('../controllers/categories');
var Cart = require('../controllers/cart');
var Wishlist = require('../controllers/wishlist');
var Authorization = require('../controllers/authorization');
var Checkout = require('../controllers/checkout');
var Order = require('../controllers/order');
var Pages = require('../models/pages');
var Navison = require('../controllers/navison');
var NavisonDev = require('../controllers/navisonDev');

//controllers
var Testprod = require('../controllers/testprod');

//Products
router.post('/products', Products.create);
router.get('/productupdate', Products.filter);
router.get('/products', Products.lists);
router.get('/products/:id', Products.list);
router.get('/product/:slug/:id', Products.singleProduct);
router.put('/products/:id', Products.update);
router.delete('/products/:id', Products.delete);
router.get('/home', Products.homePageNew);
router.post('/search', Products.search);
router.get('/search-products', Products.searchProducts);
router.get('/filters', Products.filters);
router.get('/remi', Products.remiProducts);
router.get('/hunde', Products.hundeRemi);
router.get('/katze', Products.katzeRemi);
router.get('/remiapi', Products.remiProductsApi);

//Reviews
router.post('/review', Products.createReview);

//brands
router.get("/brand/:slug/:id", Products.tags);

//Categories
router.post('/categories', Categories.create);
router.get('/categories', Categories.lists);
router.get('/categories/:id', Categories.list);
router.get('/category/:slug/:id', Categories.singleCategory);
router.put('/categories/:id', Categories.update);
router.delete('/categories/:id', Categories.delete);

//Wishlist
router.post('/wishlist', Wishlist.create);
router.get('/wunschliste', Wishlist.lists);
router.get('/wishlistupdate', Wishlist.wishlistupdate);
router.delete('/wishlist', Wishlist.delete);
router.get('/wishmodule', Wishlist.module);

//Cart
router.post('/cart', Cart.create);
router.get('/cart', Cart.lists);
router.delete('/cart', Cart.delete);
router.get('/cartmodule', Cart.module);
router.post('/cartupdate', Cart.update);
router.post('/minicartupdate', Cart.miniCartUpdate);
router.get('/cartupdate', Cart.update);
router.post('/coupon', Cart.coupon);
router.get('/removecoupon', Cart.removeCoupon);
//router.get('/dmodule', Cart.module);

//Pages
router.get('/faq', Pages.faq);
router.get('/ueberuns', Pages.about);
router.get('/zahlungsarten', Pages.zahlungsarten);
router.get('/ruckgabe_artikeln', Pages.ruckgabe_artikeln);
router.get('/agb', Pages.agb);
router.get('/versandkosten', Pages.versandkosten);
router.get('/remi-produkte', Pages.stopfootwaste);
router.get('/mein_ubersicht', Authorization.isAuthorize, Pages.mein_ubersicht);
router.get('/lieferung', Pages.lieferung);
router.get('/dsgvo', Pages.dsgvo);
router.get('/impressum', Pages.impressum);
router.get('/nutzungsbedingung', Pages.nutzungsbedingung);
//router.get('/datenschutz', Pages.datenschutz);
router.get('/kontakt', Pages.kontakt);
//router.get('/medien', Pages.medien);
//router.get('/sponsoring', Pages.sponsoring);
//router.get('/meine_bestellungen', Pages.meine_bestellungen);

//Authorization
router.get('/registrieren', Authorization.authChecker, Authorization.register);
router.post('/register', Authorization.register);
router.post('/oneguestregister', Authorization.oneguestregister);
router.get('/login', Authorization.authChecker, Authorization.login);
router.post('/login', Authorization.login);
router.get('/logout', Authorization.logout);
router.get('/mein_konto', Authorization.myAccount);
router.post('/updateaccount', Authorization.updateAccount);
router.get('/usermenus', Authorization.userMenus);
router.get('/usermenusn', Authorization.userMenusn);
router.get('/benutzerdaten', Authorization.isAuthorize, Authorization.updateAccount);
router.post('/benutzerdaten', Authorization.isAuthorize, Authorization.updateAccount);
router.get('/passwortandern', Authorization.isAuthorize, Authorization.passwortandern);
router.post('/passwortandern', Authorization.isAuthorize, Authorization.passwortandern);
router.get('/passwortvergessen', Authorization.passwortvergessen);
//router.post('/passwortvergessen', Authorization.passwortvergessen);
router.get('/passwort-zuruecksetzen', Authorization.passwortzuruecksetzen);
router.post('/passwort-zuruecksetzen', Authorization.passwortzuruecksetzen);
router.post('/tokengenerate', Authorization.tokengenerate);
router.get('/lieferadressen-verwalten', Authorization.isAuthorize, Authorization.adressen_verwalten);
router.post('/newshipaddress', Authorization.newshipaddress);
router.post('/editshipaddress', Authorization.editshipaddress);
router.post('/removeshipaddress', Authorization.removeshipaddress);
router.post('/zoocialanmelden', Authorization.zoocialanmelden);
router.post('/newsletterPost', Authorization.newsletterPost);

//Checkout
router.get('/checkoutold', Checkout.checkout);
router.get('/checkout', Checkout.onepagecheckout);
router.post('/onepageorder', Checkout.onepageorder);
router.get('/onepagecart', Checkout.onepagecart);
router.post('/order', Checkout.order);

//Orders
router.get('/order-received/:orderid', Order.orderSuccess);
router.get('/order-pending/:orderid', Order.orderPending);
router.get('/order-cancel/:orderid', Authorization.isAuthorize, Order.orderCancel);
router.post('/order-pending', Order.orderPending);
router.get('/view-order/:orderid', Authorization.isAuthorize, Order.viewOrder);
router.get('/meine_bestellungen', Authorization.isAuthorize, Order.lists);
router.get('/order-pdfs/:orderid', Authorization.isAuthorize, Order.orderPdfs);

router.get('/testlists', Testprod.lists);

router.get('/navison-insert', Navison.insert);
router.get('/navison-update', Navison.update); // Every 30 mins
router.get('/navisionTest', Navison.navisionTest);
router.get('/navisonitem/:sku', Navison.getNavisionItem);
router.get('/navisonitemstock/:sku', Navison.getNavisionItemStock);
router.get('/navisonitemprice/:sku', Navison.getNavisionItemPrice);
router.get('/navisonitemfilter/:sku', Navison.getNavisionItemFilter);
router.get('/navisonitemdiscount/:sku', Navison.getNavisionItemDiscount);
router.get('/noimagesproduct', Navison.getNoImagesProduct);
router.get('/discountupdate', Navison.discountUpdate); // Every 30 mins
router.get('/filtersupdate', Navison.filtersUpdate); // Every-day at 6AM and 2PM
router.get('/imagesupdate', Navison.imagesUpdate); // Every-day at 5AM and 3PM
router.get('/contentupdate', Navison.contentUpdate); // Every 4 hours
router.get('/singleimagesupdate/:sku', Navison.singleImagesUpdate);

router.get('/navison-insert-dev', NavisonDev.insert);
router.get('/navison-update-dev', NavisonDev.update); // Every 30 mins
router.get('/navisionTest-dev', NavisonDev.navisionTest);
router.get('/navisonitem-dev/:sku', NavisonDev.getNavisionItem);
router.get('/navisonitemstock-dev/:sku', NavisonDev.getNavisionItemStock);
router.get('/navisonitemprice-dev/:sku', NavisonDev.getNavisionItemPrice);
router.get('/navisonitemfilter-dev/:sku', NavisonDev.getNavisionItemFilter);
router.get('/navisonitemdiscount-dev/:sku', NavisonDev.getNavisionItemDiscount);
router.get('/noimagesproduct-dev', NavisonDev.getNoImagesProduct);
router.get('/discountupdate-dev', NavisonDev.discountUpdate); // Every 30 mins
router.get('/filtersupdate-dev', NavisonDev.filtersUpdate); // Every-day at 6AM and 2PM
router.get('/imagesupdate-dev', NavisonDev.imagesUpdate); // Every-day at 5AM and 3PM
router.get('/contentupdate-dev', NavisonDev.contentUpdate); // Every 4 hours
router.get('/singleimagesupdate-dev/:sku', NavisonDev.singleImagesUpdate);

module.exports = router;