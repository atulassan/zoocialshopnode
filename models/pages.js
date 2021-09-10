
Pages = {

    async faq(req, res) {
        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = { 
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "faq"},
        }
        res.render("shop/pages/faq", data);
    },
    async about(req, res) {

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "ueberuns"},
        }
        res.render("shop/pages/about_us", data);
    },
    async zahlungsarten(req, res) {

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "zahlungsarten"},
        }
        res.render("shop/pages/zahlungsarten", data);
    },
    async versandkosten(req, res) {

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "versandkosten"},
        }
        res.render("shop/pages/versandkosten", data);
    },
    async ruckgabe_artikeln(req, res) {

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0)
        }
        res.render("shop/pages/ruckgabe_artikeln", data);
    },
    async agb(req, res) {

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "agb"},
        }
        res.render("shop/pages/agb", data);
    },
    async nutzungsbedingung(req, res) {

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "nutzungsbedingung"},
        }
        res.render("shop/pages/nutzungsbedingung", data);
    },
    async impressum(req, res) {

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "impressum"},
        }
        res.render("shop/pages/impressum", data);
    },
    async datenschutz(req, res) {

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "datenschutz"},
        }
        res.render("shop/pages/datenschutz", data);
    },
    async register(req, res) {

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "register"},
        }
        res.render("shop/pages/register", data);
    },
    async kontakt(req, res) {

        var userdata = (req.session.auth.hasOwnProperty('id')) ? req.session.auth : {};

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            userdata: userdata,
            metaInfo: {page: "kontakt"},
        }
        res.render("shop/pages/kontakt", data);
    },
    async medien(req, res) {

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "medien"},
        }
        res.render("shop/pages/medien", data);
    },
    async sponsoring(req, res) {

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "sponsoring"},
        }
        res.render("shop/pages/sponsoring", data);
    },
    async mein_ubersicht(req, res) {

        let creqdata = {
            per_page: 50,
            page: 1
        };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            userdata: req.session.auth,
            metaInfo: {page: "mein_ubersicht"},
        }
        res.render("shop/pages/mein_ubersicht", data);
    },
    async meine_bestellungen(req, res) {

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "meine_bestellungen"},
        }

        res.render("shop/pages/meine_bestellungen", data);
    },
    async lieferung(req, res) {
        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "lieferung"},
        }

        res.render("shop/pages/lieferung", data);
    },
    async dsgvo(req, res) {

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "dsgvo"},
        }

        res.render("shop/pages/dsgvo", data);
    },
    async checkout(req, res) {

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "checkout"},
        }

        res.render("shop/pages/checkout", data);

    },
    async stopfootwaste(req, res) {

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "stopfootwaste"},
        }

        res.render("shop/pages/stop-foodwaste", data);

    },
    async versandkosten(req, res) {
        let creqdata = {
            per_page: 50,
            page: 1
          };  
        let categories = await getWCApiAsync("products/categories", creqdata);
        data = {
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: { page: "versandkosten" },
        }
        res.render("shop/pages/versandkosten", data);
    },
}

module.exports = Pages;