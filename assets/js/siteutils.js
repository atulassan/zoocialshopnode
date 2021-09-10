jQuery(window).on("load", function () {
    getData("/wishmodule", "text")
        .then((content) => {
            jQuery("#wishpopup").empty().append(content);
            var productcount = parseInt(jQuery(".wishToplist ul li").length) > 0 ? parseInt(jQuery(".wishToplist ul li").length) : 0;
            jQuery(".headerCart .fav-count").empty().text(productcount);
        })
        .catch((err) => {
            console.log("wish module error:" + err);
        });
    getData("/cartmodule", "text")
        .then((content) => {
            jQuery("#cartPopup").empty().append(content);
            var productcount = parseInt(jQuery(".cartToplist ul li").length) > 0 ? parseInt(jQuery(".cartToplist ul li").length) : 0;
            jQuery(".headerCart .product_count").empty().text(productcount);
        })
        .catch((err) => {
            console.log("wish module error:" + err);
        });
    getData("/usermenus", "text")
        .then((content) => {
            jQuery(".usermenus").empty().append(content);
        })
        .catch((err) => {
            console.log("usermenus module error:" + err);
        });
    getData("/usermenusn", "json")
        .then((json) => {
            if (json.status) {
                console.log(json);
                jQuery("#footerupd").empty().append(json.fdlinks);
            }
        })
        .catch((err) => {
            console.log("usermenus module error:" + err);
        });
});
$(document).ready(function () {
    jQuery(".jquery-accordion-menu li").each(function () {
        if (jQuery(this).hasClass("active")) {
            var parentid = jQuery(this).attr("data-pid");
            jQuery("#" + parentid).show();
            return false;
        }
    });
    jQuery(document).on("click", "#paymentmethod", function () {
        console.log("payment method");
        $.ajax({
            type: "POST",
            crossDomain: true,
            dataType: "JSON",
            url: "https://postfinance.zoocial.ch/shop.php",
            data: { amount: 20, order_id: "2458", order_key: "2578" },
            success: function (res) {
                if (res) {
                    console.log(res);
                    location.href = res.url;
                    var payment_url = res.url;
                    var amount = res.amount;
                    var spid = res.spid;
                    var transaction_id = res.transaction_id;
                    var order_id = res.order_id;
                    var order_key = res.order_key;
                    window.location.href = payment_url + "&amount=" + amount + "&transaction_id=" + transaction_id + "&order_id=" + order_id + "&order_key=" + order_key;
                }
            },
        });
        return false;
    });
    jQuery(document).on("submit", "#supportForm", function (e) {
        e.preventDefault();
        console.log("submit");
        jQuery(".process-loader").show();
        var name = jQuery(".sup_name").val();
        var email = jQuery(".sup_email").val();
        var address = jQuery(".sup_address").val();
        var sup_devision = jQuery(".sup_devision").val();
        var site = jQuery(".sup_site").val();
        $.ajax({
            type: "POST",
            crossDomain: true,
            dataType: "JSON",
            url: "https://www.zoocial.ch/support",
            headers: { accept: "application/json", "Access-Control-Allow-Origin": "*" },
            data: { name: name, email: email, address: address, sup_devision: sup_devision, site: site },
            success: function (res) {
                console.log(res);
                jQuery("#SupportPopupClose").trigger("click");
                document.getElementById("supportForm").reset();
                jQuery(".process-loader").hide();
                alertify.success("Vielen Dank für dein Feedback. Wir werden uns in Kürze bei dir melden");
            },
            error: function (error) {
                console.log(res);
                jQuery("#SupportPopupClose").trigger("click");
                document.getElementById("supportForm").reset();
                jQuery(".process-loader").hide();
                alertify.success("Vielen Dank für dein Feedback. Wir werden uns in Kürze bei dir melden");
            },
        }).done(function (response) {
            console.log(response);
        });
        return false;
    });
    jQuery(document).on("click", "#zoocialanmelden", function (e) {
        e.preventDefault();
        const url = "/zoocialanmelden";
        const inputdata = { method: "POST", data: { login: "lg" } };
        postData(url, inputdata, "json")
            .then((json) => {
                console.log(json);
                if (json.status) {
                    alertify.success(json.message);
                    setTimeout(function () {
                        window.location.href = json.redirect;
                    }, 1000);
                } else {
                    alertify.error(json.message);
                }
            })
            .catch((error) => {
                console.log("Error:" + error);
            });
        return false;
    });
    jQuery(document).on("click", ".addfavourite", function () {
        var productid = jQuery(this).attr("product-id");
        const url = "/wishlist";
        const inputdata = { method: "POST", data: { id: productid } };
        postData(url, inputdata, "json")
            .then((json) => {
                console.log(json);
                if (json.status) {
                    jQuery(".fav-count").empty().text(json.items.length);
                    getData("/wishmodule", "text")
                        .then((content) => {
                            jQuery("#favOpen").trigger("click");
                            jQuery("#wishpopup").empty().append(content);
                        })
                        .catch((err) => {
                            console.log("wish module error:" + err);
                        });
                }
            })
            .catch((error) => {
                console.log("Error:" + error);
            });
    });
    jQuery(document).on("click", ".remove_wish", function () {
        jQuery(this).closest(".wishlist-item").remove();
        var productid = jQuery(this).attr("product-id");
        console.log(productid);
        const url = "/wishlist";
        const inputdata = { method: "DELETE", data: { id: productid } };
        postData(url, inputdata, "json")
            .then((json) => {
                console.log(json);
                if (json.status) {
                    jQuery(".fav-count").empty().text(json.items.length);
                    getData("/wishmodule", "text")
                        .then((content) => {
                            jQuery("#wishpopup").empty().append(content);
                        })
                        .catch((err) => {
                            console.log("wish module error:" + err);
                        });
                    getData("/wishlistupdate", "text")
                        .then((content) => {
                            jQuery("#wishlistupdate").empty().append(content);
                        })
                        .catch((err) => {
                            console.log("wish list Update Error error:" + err);
                        });
                }
            })
            .catch((error) => {
                console.log("Error:" + error);
            });
    });
    jQuery(document).on("click", ".remove_cart", function (e) {
        e.preventDefault();
        jQuery(this).closest(".remove_cartitem").remove();
        var productid = jQuery(this).attr("product-id");
        var product_type = jQuery(this).attr("product-type");
        var product_variation_id = jQuery(this).attr("product-variation_id");
        console.log(productid);
        console.log(product_type);
        console.log(product_variation_id);
        const url = "/cart";
        const inputdata = { method: "DELETE", data: { id: productid, product_type: product_type, variation_id: product_variation_id } };
        postData(url, inputdata, "json")
            .then((json) => {
                console.log(json);
                if (json.status) {
                    jQuery(".product_count").empty().text(json.items.length);
                    getData("/cartmodule", "text")
                        .then((content) => {
                            jQuery("#cartPopup").empty().append(content);
                        })
                        .catch((err) => {
                            console.log("wish module error:" + err);
                        });
                    getData("/cartupdate", "text")
                        .then((content) => {
                            console.log(content);
                            jQuery("#cartinfo").empty().append(content);
                        })
                        .catch((err) => {
                            console.log("Cart Update Error:" + err);
                        });
                }
            })
            .catch((error) => {
                console.log("Error:" + error);
            });
    });
    jQuery(document).on("click", ".addtocart", function () {
        var productid = parseInt(jQuery(this).attr("product-id"));
        var quantity = parseInt(jQuery(this).attr("product-qty"));
        var variation_id = parseInt(jQuery(this).attr("variation-id"));
        if (quantity <= 0) {
            alertify.error("Produktmenge darf nicht leer sein");
            return false;
        }
        if (jQuery(this).hasClass("favitem")) {
            jQuery(this).closest(".wishlist-item").find(".remove_wish").trigger("click");
        }
        var dt = {};
        if (variation_id > 0) {
            dt = { id: productid, quantity: quantity, variation_id: variation_id };
        } else {
            dt = { id: productid, quantity: quantity };
        }
        const url = "/cart";
        const inputdata = { method: "POST", data: dt };
        postData(url, inputdata, "json")
            .then((json) => {
                console.log(json);
                if (json.status) {
                    jQuery(".product_count").empty().text(json.items.length);
                    getData("/cartmodule", "text")
                        .then((content) => {
                            jQuery("#cartPopupOpen").trigger("click");
                            jQuery("#cartPopup").empty().append(content);
                        })
                        .catch((err) => {
                            console.log("cart module error:" + err);
                        });
                }
            })
            .catch((error) => {
                console.log("Error:" + error);
            });
    });
    jQuery(document).on("change", ".shopqty", function () {
        var selt = jQuery(this).find("option:selected").val();
        jQuery(this).closest(".cart_table").find(".addtocart").attr("product-qty", selt);
        jQuery(this).closest(".wishlist-item").find(".addtocart").attr("product-qty", selt);
    });
    jQuery(document).on("change", "#cartform .cartqty", function () {
        let crtqty = parseInt(jQuery(this).val());
        let product_id = parseInt(jQuery(this).attr("product-id"));
        let variation_id = jQuery(this).attr("variation-id");
        var txtfrmt = '<input type="number" class="cartqty" product-id="' + product_id + '" variation-id="' + variation_id + '" name="quantity" min="1" />';
        if (!crtqty) {
            jQuery(this).parent(".cart-grouped").empty().append(txtfrmt);
        }
        jQuery(".updatecart").removeAttr("disabled");
    });
    jQuery(document).on("change", ".shopqty", function () {
        let crtqty = parseInt(jQuery(this).val());
        let product_id = parseInt(jQuery(this).attr("product-id"));
        let variation_id = jQuery(this).attr("variation-id");
        var txtfrmt = '<input type="number" class="shopqty" product-id="' + product_id + '" variation-id="' + variation_id + '" name="quantity" min="1" />';
        if (!crtqty) {
            jQuery(this).parent(".cart-grouped").empty().append(txtfrmt);
        }
        jQuery(".updatecart").removeAttr("disabled");
    });
    jQuery(document).on("change keyup mouseup", ".shopqty", function () {
        var qty = parseInt(jQuery(this).val());
        if (qty > 0) {
            jQuery(this).closest(".cart-updgroup").find(".addtocart").attr("product-qty", qty);
        } else {
            jQuery(this).closest(".cart-updgroup").find(".addtocart").attr("product-qty", 0);
        }
        console.log(qty);
    });
    jQuery(document).on("submit", "form#cartform", function (e) {
        e.preventDefault();
        var cartdata = jQuery(this).serialize();
        var cartitems = [];
        var cartempty = false;
        jQuery("#cartform .cartqty").each(function () {
            let pqty = jQuery(this).val();
            if (pqty === "") {
                cartempty = true;
                return false;
            }
            var cartinfo = {};
            cartinfo.id = parseInt(jQuery(this).attr("product-id"));
            cartinfo.quantity = parseInt(jQuery(this).val());
            if (parseInt(jQuery(this).attr("variation-id")) != "" && jQuery(this).attr("variation-id").length > 0) {
                cartinfo.variation_id = parseInt(jQuery(this).attr("variation-id"));
            }
            cartitems.push(cartinfo);
        });
        if (cartempty) {
            alertify.error("Produktmenge darf nicht leer sein");
            jQuery(".btnldr").css({ display: "none" });
            return false;
        }
        jQuery(".btnldr").css({ display: "block" });
        const url = "/cartupdate";
        const inputdata = { method: "POST", data: { cartdata: cartitems.reverse() } };
        postData(url, inputdata, "json")
            .then((json) => {
                if (json.status) {
                    jQuery(".product_count").empty().text(json.items.length);
                    getData("/cartupdate", "text")
                        .then((content) => {
                            console.log(content);
                            jQuery("#cartinfo").empty().append(content);
                        })
                        .catch((err) => {
                            console.log("Cart Update Error:" + err);
                        });
                }
            })
            .catch((error) => {
                console.log("Error:" + error);
            });
        jQuery(".btnldr").css({ display: "none" });
    });
    jQuery(document).on("change", "#minicartform .cartqty", function () {
        let crtqty = parseInt(jQuery(this).val());
        let product_id = parseInt(jQuery(this).attr("product-id"));
        let variation_id = jQuery(this).attr("variation-id");
        var txtfrmt = '<input type="number" class="cartqty" product-id="' + product_id + '" variation-id="' + variation_id + '" name="quantity" />';
        if (!crtqty) {
            jQuery(this).parent(".cart-grouped").empty().append(txtfrmt);
            console.log("avail");
        }
        jQuery(".updatecart").removeAttr("disabled");
    });
    jQuery(document).on("submit", "form#minicartform", function (e) {
        e.preventDefault();
        console.log("testing");
        jQuery("#warenkorb_refresh").css({ display: "block" });
        var cartdata = jQuery(this).serialize();
        var cartitems = [];
        var cartempty = false;
        jQuery("#minicartform .cartqty").each(function () {
            let pqty = jQuery(this).val();
            if (pqty === "") {
                cartempty = true;
                return false;
            }
            var cartinfo = {};
            cartinfo.id = parseInt(jQuery(this).attr("product-id"));
            cartinfo.quantity = parseInt(jQuery(this).val());
            if (parseInt(jQuery(this).attr("variation-id")) != "" && jQuery(this).attr("variation-id").length > 0) {
                cartinfo.variation_id = parseInt(jQuery(this).attr("variation-id"));
            }
            cartitems.push(cartinfo);
        });
        console.log(cartitems);
        if (cartempty) {
            alertify.error("Produktmenge darf nicht leer sein");
            jQuery("#minicartform .warenkorb_refresh").css({ display: "none" });
            return false;
        }
        const url = "/minicartupdate";
        const inputdata = { method: "POST", data: { cartdata: cartitems.reverse() } };
        postData(url, inputdata, "json")
            .then((json) => {
                jQuery("#warenkorb_refresh").css({ display: "none" });
                if (json.status) {
                    jQuery(".product_count").empty().text(json.items.length);
                    getData("/cartmodule", "text")
                        .then((content) => {
                            console.log(content);
                            jQuery("#cartPopup").empty().append(content);
                        })
                        .catch((err) => {
                            console.log("Cart Update Error:" + err);
                        });
                }
            })
            .catch((error) => {
                jQuery("#warenkorb_refresh").css({ display: "none" });
                console.log("Error:" + error);
            });
    });
    jQuery('input[id="versanddetail"]').click(function () {
        console.log(jQuery("#versanddetail").is(":checked"));
        validateShipping();
    });
    function validateShipping() {
        if (jQuery("#versanddetail").is(":checked")) {
            jQuery(".inputbox input").attr("data-valcode", "!b");
            jQuery(".selectbox select").attr("data-valcode", "sel");
        } else {
            jQuery(".inputbox input").attr("data-valcode", "").val("");
            jQuery(".selectbox select").attr("data-valcode", "");
        }
    }
    jQuery(document).on("submit", "form#registerform", function (e) {
        e.preventDefault();
        jQuery(".process-loader").show();
        var formdata = jQuery(this).serialize();
        const url = "/register";
        const inputdata = { method: "POST", data: { formdata: formdata } };
        postData(url, inputdata, "json")
            .then((json) => {
                jQuery(".process-loader").hide();
                console.log(json);
                if (json.status) {
                    document.getElementById("registerform").reset();
                    jQuery(".registerSuccessPopup").show();
                } else {
                    jQuery(".process-loader").hide();
                    if (json.hasOwnProperty("message")) {
                        alertify.error(json.message);
                    } else {
                        alertify.error("Registrierung kann nicht durchgeführt werden");
                    }
                }
            })
            .catch((error) => {
                jQuery(".process-loader").hide();
                alertify.error("Registrierung kann nicht durchgeführt werden");
                console.log(error);
            });
    });
    jQuery(document).on("submit", "form#loginform", function (e) {
        e.preventDefault();
        jQuery(".process-loader").show();
        var formdata = jQuery(this).serialize();
        const url = "/login";
        const inputdata = { method: "POST", data: { formdata: formdata } };
        postData(url, inputdata, "json")
            .then((json) => {
                jQuery(".process-loader").hide();
                if (json.status) {
                    console.log(json);
                    document.getElementById("loginform").reset();
                    alertify.success(json.message);
                    setTimeout(function () {
                        window.location.href = json.redirect;
                    }, 1000);
                } else {
                    alertify.error(json.message);
                }
                console.log(json);
            })
            .catch((error) => {
                jQuery(".process-loader").hide();
                console.log(error);
            });
    });
    jQuery(document).on("submit", "form#checkoutform", function (e) {
        e.preventDefault();
        jQuery(".process-loader").show();
        var orderdata = jQuery(this).serialize();
        const url = "/order";
        const inputdata = { method: "POST", data: { orderdata: orderdata } };
        postData(url, inputdata, "json")
            .then((json) => {
                jQuery(".process-loader").hide();
                console.log(json);
                if (json.status) {
                    var paymentUrl = json.response.url + "&amount=" + json.response.amount + "&transaction_id=" + json.response.transaction_id + "&order_id=" + json.response.order_id + "&order_key=" + json.response.order_key;
                    alertify.success(json.message);
                    window.location.href = paymentUrl;
                } else {
                    alertify.error(json.message);
                }
            })
            .catch((error) => {
                jQuery(".process-loader").hide();
                console.log(error);
            });
    });
    jQuery(document).on("submit", "form#reviewform", function (e) {
        e.preventDefault();
        jQuery(".process-loader").show();
        var formdata = jQuery(this).serialize();
        var encodedata = encodeURIComponent(formdata);
        const url = "/review";
        const inputdata = { method: "POST", data: { formdata: formdata } };
        postData(url, inputdata, "json")
            .then((json) => {
                jQuery(".process-loader").hide();
                if (json.status) {
                    document.getElementById("reviewform").reset();
                    alertify.success(json.message);
                } else {
                    alertify.error(json.message);
                }
            })
            .catch((error) => {
                jQuery(".process-loader").hide();
                console.log(error);
            });
    });
    jQuery(document).on("submit", "form#myaccount", function (e) {
        e.preventDefault();
        jQuery(".process-loader").show();
        var formdata = jQuery(this).serialize();
        const url = "/updateaccount";
        const inputdata = { method: "POST", data: { formdata: formdata } };
        postData(url, inputdata, "json")
            .then((json) => {
                jQuery(".process-loader").hide();
                if (json.status) {
                    console.log(json.customer);
                    jQuery(".meine_fname").empty().text(json.customer.first_name);
                    jQuery(".meine_lname").empty().text(json.customer.last_name);
                    alertify.success(json.message);
                } else {
                    alertify.error("Aktualisierung nicht erfolgreich");
                }
            })
            .catch((error) => {
                jQuery(".process-loader").hide();
                alertify.error("Aktualisierung nicht erfolgreich");
                console.log(error);
            });
    });
    jQuery(document).on("click", ".chkoutlogin", function () {
        jQuery(".loginform").slideToggle("500");
    });
    jQuery(document).on("keyup", ".product_search", function () {
        var search = jQuery(this).val();
        if (search.length >= 2) {
            console.log(search);
            jQuery(".searchlisting").show();
            jQuery(".searchlisting .pageloader").show();
            const url = "/search";
            const inputdata = { method: "POST", data: { search: search } };
            postData(url, inputdata, "json")
                .then((json) => {
                    var html = "";
                    console.log(json.length);
                    if (json.length > 0) {
                        html += "<ul>";
                        json.forEach((v, x) => {
                            var tag = v.tags.length > 0 ? "<span>" + v.tags[0].name + "</span>" : "";
                            html += '<li><a href="/product/' + v.slug + "/" + v.id + '">' + v.name + " - " + tag + " </a></li>";
                        });
                        html += "</ul>";
                        console.log(html);
                        jQuery(".searchlisting .pageloader").hide();
                        jQuery(".searchlisting .searchul").empty().append(html);
                    } else {
                        jQuery(".searchlisting").hide();
                        jQuery(".searchlisting .pageloader").hide();
                        jQuery(".searchlisting .searchul").empty();
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            jQuery(".searchlisting").hide();
            jQuery(".searchlisting .pageloader").hide();
            jQuery(".searchlisting .searchul").empty();
        }
    });
    jQuery(document).on("submit", "form#myaccountupdate", function (e) {
        e.preventDefault();
        jQuery(".process-loader").show();
        var formdata = jQuery(this).serialize();
        console.log(formdata);
        const url = "/benutzerdaten";
        const inputdata = { method: "POST", data: { formdata: formdata } };
        postData(url, inputdata, "json")
            .then((json) => {
                if (json.status) {
                    jQuery(".process-loader").hide();
                    console.log(json.customer);
                    jQuery(".meine_fname").empty().text(json.customer.first_name);
                    jQuery(".meine_lname").empty().text(json.customer.last_name);
                    alertify.success(json.message);
                } else {
                    jQuery(".process-loader").hide();
                    alertify.error("Aktualisierung nicht erfolgreich");
                    console.log(error);
                }
            })
            .catch((err) => {
                jQuery(".process-loader").hide();
                alertify.error(json.message);
                console.log(error);
            });
    });
    jQuery(document).on("submit", "form#newshipaddress", function (e) {
        e.preventDefault();
        jQuery(".process-loader").show();
        var formdata = jQuery(this).serialize();
        console.log(formdata);
        const url = "/newshipaddress";
        const inputdata = { method: "POST", data: { formdata: formdata } };
        postData(url, inputdata, "json")
            .then((json) => {
                if (json.status) {
                    jQuery(".process-loader").hide();
                    document.getElementById("newshipaddress").reset();
                    jQuery(".addNewAddressOpen").hide();
                    jQuery(".shippingAddresses").empty().append(json.updhtml);
                    alertify.success(json.message);
                } else {
                    jQuery(".process-loader").hide();
                    alertify.error("Lieferadresse wurde nicht aktualisiert");
                    console.log(error);
                }
            })
            .catch((err) => {
                jQuery(".process-loader").hide();
                alertify.error("Lieferadresse wurde nicht aktualisiert");
                console.log(error);
            });
    });
    jQuery(document).on("submit", "form#editshipaddress", function (e) {
        e.preventDefault();
        jQuery(".process-loader").show();
        var formdata = jQuery(this).serialize();
        console.log(formdata);
        const url = "/editshipaddress";
        const inputdata = { method: "POST", data: { formdata: formdata } };
        postData(url, inputdata, "json")
            .then((json) => {
                if (json.status) {
                    jQuery(".process-loader").hide();
                    jQuery(".addNewAddressOpen").hide();
                    jQuery(".shippingAddresses").empty().append(json.updhtml);
                    alertify.success(json.message);
                } else {
                    jQuery(".process-loader").hide();
                    alertify.error("Lieferadresse wurde nicht aktualisiert");
                    console.log(error);
                }
            })
            .catch((err) => {
                jQuery(".process-loader").hide();
                alertify.error("Lieferadresse wurde nicht aktualisiert");
                console.log(error);
            });
    });
    jQuery(document).on("click", "#removeCoupon", function (e) {
        e.preventDefault();
        var removeCoupon = jQuery(this);
        var couponredirect = jQuery(".couponredirect").val();
        jQuery(".process-loader").show();
        getData("/removecoupon", "text")
            .then((response) => {
                console.log(response);
                if (couponredirect == "checkout") {
                    getData("/onepagecart", "text")
                        .then((content) => {
                            console.log(content);
                            removeCoupon.attr("id", "couponcode").html("Gutschein anwenden");
                            jQuery(".process-loader").hide();
                            jQuery("#updateInfo").empty().append(content);
                        })
                        .catch((err) => {
                            console.log("coupon update Error:" + err);
                        });
                } else {
                    window.location.href = "/cart";
                }
                jQuery(".coupontxt").removeAttr("disabled").val("").css({ "font-size": "14px" });
                alertify.success("Erfolgreich entfernt");
            })
            .catch((err) => {
                console.log("usermenus module error:" + err);
            });
    });
    jQuery(document).on("click", ".removeshipaddress", function (e) {
        e.preventDefault();
        jQuery(".process-loader").show();
        var deletekey = parseInt(jQuery(this).attr("data-key"));
        jQuery(this).closest(".displayShippingAddress").remove();
        const url = "/removeshipaddress";
        const inputdata = { method: "POST", data: { key: deletekey } };
        postData(url, inputdata, "json")
            .then((json) => {
                if (json.status) {
                    jQuery(".process-loader").hide();
                    jQuery(".addNewAddressOpen").hide();
                    jQuery(".shippingAddresses").empty().append(json.updhtml);
                    alertify.success(json.message);
                } else {
                    jQuery(".process-loader").hide();
                    alertify.error("Lieferadresse wurde nicht aktualisiert");
                    console.log(error);
                }
            })
            .catch((err) => {
                jQuery(".process-loader").hide();
                alertify.error("Lieferadresse wurde nicht aktualisiert");
                console.log(error);
            });
    });
    jQuery(document).on("submit", "form#tokengenrate", function (e) {
        e.preventDefault();
        jQuery(".process-loader").show();
        var formdata = jQuery(this).serialize();
        const url = "/tokengenerate";
        const inputdata = { method: "POST", data: { formdata: formdata } };
        postData(url, inputdata, "json")
            .then((json) => {
                if (json.status) {
                    jQuery(".pass-verification, .process-loader").hide();
                    jQuery(".email-verification .fpsupdate").empty().append(json.email);
                    jQuery(".email-verification").show();
                } else {
                    jQuery(".process-loader").hide();
                    alertify.error(json.message);
                }
            })
            .catch((err) => {
                jQuery(".process-loader").hide();
                alertify.error(json.message);
                console.log(error);
            });
    });
    jQuery(document).on("submit", "form#orderpending", function (e) {
        e.preventDefault();
        jQuery(".process-loader").show();
        var formdata = jQuery(this).serialize();
        const url = "/order-pending";
        const inputdata = { method: "POST", data: { formdata: formdata } };
        postData(url, inputdata, "json")
            .then((json) => {
                if (json.status) {
                    jQuery(".process-loader").hide();
                    console.log(json);
                    var paymentUrl =
                        json.response.url + "&amount=" + json.response.amount + "&transaction_id=" + json.response.transaction_id + "&order_id=" + json.response.order_id + "&order_key=" + json.response.order_key + "&redirect=1";
                    alertify.success(json.message);
                    window.location.href = paymentUrl;
                } else {
                    jQuery(".process-loader").hide();
                    alertify.error(json.message);
                    console.log(json.message);
                }
            })
            .catch((err) => {
                jQuery(".process-loader").hide();
                alertify.error(json.message);
                console.log(error);
            });
    });
    jQuery(document).on("submit", "form#changepassword", function (e) {
        e.preventDefault();
        jQuery(".process-loader").show();
        var formdata = jQuery(this).serialize();
        const url = "/passwortandern";
        const inputdata = { method: "POST", data: { formdata: formdata } };
        postData(url, inputdata, "json")
            .then((json) => {
                if (json.status) {
                    document.getElementById("changepassword").reset();
                    jQuery(".process-loader, .onepage_checkInfo").hide();
                    jQuery(".email-verification").show();
                } else {
                    jQuery(".process-loader").hide();
                    alertify.error(json.message);
                    console.log(error);
                }
            })
            .catch((err) => {
                jQuery(".process-loader").hide();
                alertify.error(json.message);
                console.log(error);
            });
    });
    jQuery(document).on("submit", "form#forgotpassword", function (e) {
        e.preventDefault();
        jQuery(".process-loader").show();
        var formdata = jQuery(this).serialize();
        const url = "/passwort-zuruecksetzen";
        const inputdata = { method: "POST", data: { formdata: formdata } };
        postData(url, inputdata, "json")
            .then((json) => {
                if (json.status) {
                    document.getElementById("forgotpassword").reset();
                    jQuery(".process-loader, #forgotpassword").hide();
                    console.log(json);
                    jQuery(".email-verification").show();
                } else {
                    jQuery(".process-loader").hide();
                    alertify.error(json.message);
                    console.log(error);
                }
            })
            .catch((err) => {
                jQuery(".process-loader").hide();
                alertify.error(json.message);
                console.log(error);
            });
    });
    jQuery(document).on("submit", "form#oneguestregister", function (e) {
        e.preventDefault();
        jQuery(".process-loader").show();
        var formdata = jQuery(this).serialize();
        console.log(formdata);
        const url = "/oneguestregister";
        const inputdata = { method: "POST", data: { formdata: formdata } };
        postData(url, inputdata, "json")
            .then((json) => {
                jQuery(".process-loader").hide();
                console.log(json);
                if (json.status) {
                    var step4scroll = jQuery("#opc-shipping_method .card-header");
                    jQuery("#opc-billing .card-body").slideUp();
                    jQuery("#opc-shipping .card-body").slideUp();
                    jQuery("#opc-shipping_method .card-body").addClass("show").slideDown();
                    setTimeout(function () {
                        jQuery("html,body").animate({ scrollTop: step4scroll.offset().top }, "slow");
                    }, 500);
                    jQuery(".usrbilling_info .cart-info-box").empty().append(json.billing_info).show();
                    jQuery(".usrshipping_info .cart-info-box").empty().append(json.shipping_info).show();
                    if (json.shiptype == "1") {
                        jQuery(".shiptrackgo").attr("id", "backstep2");
                    }
                } else {
                    jQuery(".process-loader").hide();
                    alertify.error(json.message);
                    console.log(json.message);
                }
            })
            .catch((error) => {
                jQuery(".process-loader").hide();
                console.log(error);
            });
    });
    jQuery(document).on("click", "#onepageorder", function (e) {
        e.preventDefault();
        jQuery(".process-loader").show();
        if (!jQuery("#mochte").is(":checked")) {
            jQuery(".process-loader").css({ display: "none" }).hide();
            alertify.error("Bitte AGB lesen und akzeptieren");
            return false;
        }
        var user_info = jQuery("form#oneguestregister").serialize();
        var payment_info = jQuery("form#payment_form").serialize();
        const url = "/onepageorder";
        const inputdata = { method: "POST", data: { user_info: user_info, shipment_info: {}, payment_info: payment_info, coupon_info: {} } };
        postData(url, inputdata, "json")
            .then((json) => {
                jQuery(".process-loader").hide();
                console.log(json);
                if (json.status) {
                    var paymentUrl = json.response.url + "&amount=" + json.response.amount + "&transaction_id=" + json.response.transaction_id + "&order_id=" + json.response.order_id + "&order_key=" + json.response.order_key;
                    window.location.href = paymentUrl;
                } else {
                    jQuery(".process-loader").hide();
                    alertify.error(json.message);
                    console.log(json.message);
                }
            })
            .catch((error) => {
                jQuery(".process-loader").hide();
                console.log(error);
            });
    });
    jQuery(document).on("click", "#couponcode", function (e) {
        e.preventDefault();
        let addCoupon = jQuery(this);
        let coupon = jQuery(".coupontxt").val();
        let couponredirect = jQuery(".couponredirect").val();
        if (coupon === "") {
            alertify.error("Coupon code cant be empty");
            return false;
        }
        console.log(coupon);
        const url = "/coupon";
        const inputdata = { method: "POST", data: { coupon: coupon } };
        jQuery(".process-loader").show();
        postData(url, inputdata, "json")
            .then((json) => {
                console.log(json);
                if (json.status) {
                    if (couponredirect == "checkout") {
                        getData("/onepagecart", "text")
                            .then((content) => {
                                alertify.success(json.message);
                                console.log(content);
                                jQuery(".coupontxt").attr("disabled", "disabled").css({ "font-size": "18px" });
                                addCoupon.attr("id", "removeCoupon").html("Gutschein löschen");
                                jQuery(".process-loader").hide();
                                jQuery("#updateInfo").empty().append(content);
                            })
                            .catch((err) => {
                                alertify.error("code update error");
                                console.log("coupon update Error:" + err);
                            });
                    } else {
                        alertify.success(json.message);
                        window.location.href = "/cart";
                    }
                } else {
                    document.getElementById("coupon").reset();
                    alertify.error(json.message);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    });
    jQuery(document).on("click", ".headingOne", function (e) {
        e.preventDefault();
        jQuery(".registeropen").hide();
    });
    jQuery(document).on("click", ".shp .shipaddress", function () {
        var step2scroll = jQuery("#opc-billing .card-header");
        var step3scroll = jQuery("#opc-shipping .card-header");
        if (jQuery(this).find("input").val() == "2") {
            jQuery(".trigger_versandetails").hide();
            jQuery("#opc-shipping .card-body").show();
            setTimeout(function () {
                jQuery("html,body").animate({ scrollTop: step3scroll.offset().top }, "slow");
            }, 500);
        } else {
            jQuery(".trigger_versandetails").show();
            jQuery("#opc-shipping .card-body").hide();
            setTimeout(function () {
                jQuery("html,body").animate({ scrollTop: step2scroll.offset().top }, "slow");
            }, 500);
        }
        changeShipping();
    });
    function changeShipping() {
        if (jQuery("#andere").is(":checked")) {
            jQuery(".versanddetails input.shipping_valid").attr("data-valcode", "!b");
            jQuery(".versanddetails select.shipping_valid").attr("data-valcode", "sel");
        } else {
            jQuery(".versanddetails input.shipping_valid").attr("data-valcode", "");
            jQuery(".versanddetails select.shipping_valid").attr("data-valcode", "");
        }
    }
    jQuery(document).on("click", ".geustTrigger", function () {
        jQuery(".registeropen").show();
        var step2scroll = jQuery("#opc-billing .card-header");
        jQuery("#opc-login .card-body").slideUp();
        jQuery(".onepage_credentials").addClass("empty").hide();
        jQuery(".onepage_credentials input").attr("data-valcode", "").val("");
        jQuery(".formtype").val("2");
        setTimeout(function () {
            jQuery("html,body").animate({ scrollTop: step2scroll.offset().top }, "slow");
        }, 500);
    });
    jQuery(document).on("click", ".oneregister", function () {
        jQuery(".registeropen").show();
        if (jQuery(".onepage_credentials").hasClass("empty")) {
            jQuery(".onepage_credentials").removeClass("empty").show();
            jQuery(".onepage_credentials input.oneusername").attr("data-valcode", "!b");
            jQuery(".onepage_credentials input.password").attr("data-valcode", "spl_min");
            jQuery(".onepage_credentials input.oneconfirmpassword").attr("data-valcode", "!b_pas");
        }
        var step2scroll = jQuery("#opc-billing .card-header");
        jQuery("#opc-login .card-body").slideUp();
        jQuery("#collapseTwo").addClass("show");
        jQuery(".formtype").val("1");
        setTimeout(function () {
            jQuery("html,body").animate({ scrollTop: step2scroll.offset().top }, "slow");
        }, 500);
    });
    jQuery(document).on("click", "#backstep2", function () {
        var step2scroll = jQuery("#opc-billing .card-header");
        $("input#andiese").prop("checked", true);
        jQuery("#opc-shipping .card-body").hide();
        jQuery("#opc-shipping_method .card-body").removeClass("show").hide();
        jQuery("#opc-billing .card-body").show();
        jQuery(".trigger_versandetails").show();
        setTimeout(function () {
            jQuery("html,body").animate({ scrollTop: step2scroll.offset().top }, "slow");
        }, 500);
        changeShipping();
    });
    jQuery(document).on("click", "#backstep3", function () {
        var step3scroll = jQuery("#opc-shipping .card-header");
        jQuery("#opc-shipping .card-body").show();
        jQuery("#opc-shipping_method .card-body").removeClass("show").hide();
        setTimeout(function () {
            jQuery("html,body").animate({ scrollTop: step3scroll.offset().top }, "slow");
        }, 500);
    });
    jQuery(document).on("click", "#back2billing", function () {
        var step2scroll = jQuery("#opc-billing .card-header");
        jQuery("#opc-billing .card-body").show();
        jQuery("#opc-shipping .card-body").removeClass("show").hide();
        setTimeout(function () {
            jQuery("html,body").animate({ scrollTop: step2scroll.offset().top }, "slow");
        }, 500);
    });
    jQuery(document).on("click", "#backstep1", function () {
        var step1scroll = jQuery("#opc-login .card-header");
        jQuery("#opc-shipping .card-body, .registeropen").removeClass("show").hide();
        jQuery("#opc-login .card-body").show();
        setTimeout(function () {
            jQuery("html,body").animate({ scrollTop: step1scroll.offset().top }, "slow");
        }, 500);
        changeShipping();
    });
    jQuery(document).on("click", "#backstep5", function () {
        var step5scroll = jQuery("#opc-payment .card-header");
        jQuery("#opc-review .card-body").slideUp();
        jQuery("#opc-payment .card-body").slideDown();
        setTimeout(function () {
            jQuery("html,body").animate({ scrollTop: step5scroll.offset().top }, "slow");
        }, 500);
    });
    jQuery(document).on("click", "#gostep3", function () {
        var step3scroll = jQuery("#opc-shipping .card-header");
        jQuery("#opc-shipping_method .card-body").hide();
        jQuery("#opc-billing .card-body").hide();
        jQuery("#opc-shipping .card-body").addClass("show").show();
        setTimeout(function () {
            jQuery("html,body").animate({ scrollTop: step3scroll.offset().top }, "slow");
        }, 500);
    });
    jQuery(document).on("click", "#gostep4", function () {
        var step4scroll = jQuery("#opc-shipping_method .card-header");
        jQuery("#opc-shipping .card-body").hide();
        jQuery("#opc-shipping_method .card-body").addClass("show").slideDown();
        setTimeout(function () {
            jQuery("html,body").animate({ scrollTop: step4scroll.offset().top }, "slow");
        }, 500);
    });
    jQuery(document).on("click", "#backstep4", function () {
        var step5scroll = jQuery("#opc-shipping_method .card-header");
        jQuery("#opc-payment .card-body").slideUp();
        jQuery("#opc-shipping_method .card-body").slideDown();
        setTimeout(function () {
            jQuery("html,body").animate({ scrollTop: step5scroll.offset().top }, "slow");
        }, 500);
    });
    jQuery(document).on("click", "#gostep5", function () {
        var step5scroll = jQuery("#opc-payment .card-header");
        jQuery("#opc-shipping_method .card-body").slideUp();
        jQuery("#opc-payment .card-body").addClass("show").slideDown();
        var ship_price = jQuery(this).attr("data-shipcalc");
        var shiphtml = "<p>";
        shiphtml += "Priority Versand CHF ";
        shiphtml += ship_price.toString();
        shiphtml += "</p>";
        console.log(shiphtml);
        jQuery(".shipping_info .cart-info-box").empty().append(shiphtml).show();
        setTimeout(function () {
            jQuery("html,body").animate({ scrollTop: step5scroll.offset().top }, "slow");
        }, 500);
    });
    jQuery(document).on("click", "#gostep6", function () {
        var step6scroll = jQuery("#opc-review .card-header");
        jQuery("#opc-payment .card-body").slideUp();
        jQuery("#opc-review .card-body").addClass("show").slideDown();
        var payhtml = "<p>Die Zahlungsgebühr von 2.9% ist im Verkaufspreis enthalten.</p>";
        jQuery(".payment_info .cart-info-box").show();
        setTimeout(function () {
            jQuery("html,body").animate({ scrollTop: step6scroll.offset().top }, "slow");
        }, 500);
    });
    var paymenType = $("input[type='radio'][name='payment_type']");
    paymenType.click(function () {
        var rdoVal = jQuery(this).val();
        jQuery(".payment_info .cart-info-box").empty().append(rdoVal);
        console.log(jQuery(this).val());
    });
    jQuery(document).on("change", ".changeaddress", function () {
        var address = jQuery(this).find("option:selected");
        var active = parseInt(address.attr("data-active"));
        if (address.val() != "") {
            jQuery(".billing_fname").val(address.attr("data-fname"));
            jQuery(".billing_lname").val(address.attr("data-lname"));
            jQuery(".billing_company").val(address.attr("data-company"));
            jQuery(".billing_address_1").val(address.attr("data-address_1"));
            jQuery(".billing_address_2").val(address.attr("data-address_2"));
            jQuery(".billing_postcode").val(address.attr("data-postcode"));
            jQuery(".billing_city").val(address.attr("data-city"));
            jQuery(".billing_state").val(address.attr("data-state"));
            jQuery(".kanton-shipping").val(address.attr("data-stateshort"));
            jQuery(".billing_country").val(address.attr("data-country"));
            jQuery(".land-shipping").val(address.attr("data-countryshort"));
            jQuery(".billing_phone").val(address.attr("data-phone"));
            jQuery(".billing_mobile").val(address.attr("data-mobile"));
            jQuery("#sid").val(jQuery(this).val());
        } else {
            alertify.message("Already Address Update");
        }
    });
    jQuery(document).on("change", ".land-billing", function (event) {
        event.preventDefault();
        var states = jQuery(".chstates").html();
        var nostates = '<option val="">Keine Kantone verfügbar</option>';
        if (jQuery(this).val() == "CH") {
            jQuery(".kanton-billing").empty().append(states);
        } else {
            jQuery(".kanton-billing").empty().append(nostates);
        }
    });
    jQuery(document).on("change", ".land-shipping", function (event) {
        event.preventDefault();
        var states = jQuery(".chstates").html();
        var nostates = '<option val="">Keine Kantone verfügbar</option>';
        if (jQuery(this).val() == "CH") {
            jQuery(".kanton-shipping").empty().append(states);
        } else {
            jQuery(".kanton-shipping").empty().append(nostates);
        }
    });
    jQuery(document).on("click", ".schliessen, #trigfilterbtn", function (e) {
        e.preventDefault();
        var filters = [];
        var filteritems = [];
        var brand = new Array();
        var spezial = new Array();
        var grosse = new Array();
        var lebensphase = new Array();
        var bedurfnisse = new Array();
        var geschmack = new Array();
        var krankheit = new Array();
        var futterart = new Array();
        jQuery('input[name="brand"]:checked').each(function () {
            brand.push(parseInt(this.value));
            filteritems.push(jQuery(this).attr("data-label"));
        });
        jQuery('input[name="spezial"]:checked').each(function () {
            spezial.push(parseInt(this.value));
            filteritems.push(jQuery(this).attr("data-label"));
        });
        jQuery('input[name="grosse"]:checked').each(function () {
            grosse.push(parseInt(this.value));
            filteritems.push(jQuery(this).attr("data-label"));
        });
        jQuery('input[name="lebensphase"]:checked').each(function () {
            lebensphase.push(parseInt(this.value));
            filteritems.push(jQuery(this).attr("data-label"));
        });
        jQuery('input[name="bedurfnisse"]:checked').each(function () {
            bedurfnisse.push(parseInt(this.value));
            filteritems.push(jQuery(this).attr("data-label"));
        });
        jQuery('input[name="geschmack"]:checked').each(function () {
            geschmack.push(parseInt(this.value));
            filteritems.push(jQuery(this).attr("data-label"));
        });
        jQuery('input[name="krankheit"]:checked').each(function () {
            krankheit.push(parseInt(this.value));
            filteritems.push(jQuery(this).attr("data-label"));
        });
        jQuery('input[name="futterart"]:checked').each(function () {
            futterart.push(parseInt(this.value));
            filteritems.push(jQuery(this).attr("data-label"));
        });
        if (brand.length > 0) {
            filters.push({ brand: brand });
        }
        if (spezial.length > 0) {
            filters.push({ spezial: spezial });
        }
        if (grosse.length > 0) {
            filters.push({ grosse: grosse });
        }
        if (lebensphase.length > 0) {
            filters.push({ lebensphase: lebensphase });
        }
        if (bedurfnisse.length > 0) {
            filters.push({ bedurfnisse: bedurfnisse });
        }
        if (geschmack.length > 0) {
            filters.push({ geschmack: geschmack });
        }
        if (krankheit.length > 0) {
            filters.push({ krankheit: krankheit });
        }
        if (futterart.length > 0) {
            filters.push({ futterart: futterart });
        }
        if (filteritems.length > 0) {
            var fldshtml = "";
            filteritems.forEach(function (filteritem, el) {
                let splititem = filteritem.split("|");
                fldshtml += '<span class="c-f-item">' + splititem[0] + '<a href="javascript:void(0)" data-id="' + splititem[1] + '" class="o-i-close-applied-filter"><i class="fa fa-times"></i></a></span>';
                console.log(splititem);
            });
            fldshtml += '<a id="clearfilters" href="javascript:void(0)" class="inner-gradient-bg f-clear">löschen</a>';
            jQuery(".filter-applied").empty().append(fldshtml);
        }
        if (filters.length > 0) {
            jQuery(".taxomyfilters").val(JSON.stringify(filters));
            jQuery(".azflt").change();
            console.log(filters);
        } else {
            jQuery(".taxomyfilters").val(0);
            jQuery(".azflt").change();
        }
    });
    jQuery(document).on("click", ".filter-lebensphase", function () {
        var filters = [];
        var filteritems = [];
        var brand = new Array();
        var spezial = new Array();
        var grosse = new Array();
        var lebensphase = new Array();
        var bedurfnisse = new Array();
        var geschmack = new Array();
        var krankheit = new Array();
        var futterart = new Array();
        let urlStr = "?page=1";
        jQuery('input[name="brand"]:checked').each(function () {
            brand.push(parseInt(this.value));
            filteritems.push(jQuery(this).attr("data-label"));
        });
        jQuery('input[name="spezial"]:checked').each(function () {
            spezial.push(parseInt(this.value));
            filteritems.push(jQuery(this).attr("data-label"));
        });
        jQuery('input[name="grosse"]:checked').each(function () {
            grosse.push(parseInt(this.value));
            filteritems.push(jQuery(this).attr("data-label"));
        });
        jQuery('input[name="lebensphase"]:checked').each(function () {
            lebensphase.push(parseInt(this.value));
            filteritems.push(jQuery(this).attr("data-label"));
        });
        jQuery('input[name="bedurfnisse"]:checked').each(function () {
            bedurfnisse.push(parseInt(this.value));
            filteritems.push(jQuery(this).attr("data-label"));
        });
        jQuery('input[name="geschmack"]:checked').each(function () {
            geschmack.push(parseInt(this.value));
            filteritems.push(jQuery(this).attr("data-label"));
        });
        jQuery('input[name="krankheit"]:checked').each(function () {
            krankheit.push(parseInt(this.value));
            filteritems.push(jQuery(this).attr("data-label"));
        });
        jQuery('input[name="futterart"]:checked').each(function () {
            futterart.push(parseInt(this.value));
            filteritems.push(jQuery(this).attr("data-label"));
        });
        if (brand.length > 0) {
            urlStr += "&brand=" + brand.toString();
            filters.push({ brand: brand });
        }
        if (spezial.length > 0) {
            urlStr += "&spezial=" + spezial.toString();
            filters.push({ spezial: spezial });
        }
        if (grosse.length > 0) {
            urlStr += "&grosse=" + grosse.toString();
            filters.push({ grosse: grosse });
        }
        if (lebensphase.length > 0) {
            urlStr += "&lebensphase=" + lebensphase.toString();
            filters.push({ lebensphase: lebensphase });
        }
        if (bedurfnisse.length > 0) {
            urlStr += "&bedurfnisse=" + bedurfnisse.toString();
            filters.push({ bedurfnisse: bedurfnisse });
        }
        if (geschmack.length > 0) {
            urlStr += "&geschmack=" + geschmack.toString();
            filters.push({ geschmack: geschmack });
        }
        if (krankheit.length > 0) {
            urlStr += "&krankheit=" + krankheit.toString();
            filters.push({ krankheit: krankheit });
        }
        if (futterart.length > 0) {
            urlStr += "&futterart=" + futterart.toString();
            filters.push({ futterart: futterart });
        }
        console.log(urlStr);
        if (filteritems.length > 0) {
            var fldshtml = "";
            filteritems.forEach(function (filteritem, el) {
                let splititem = filteritem.split("|");
                fldshtml += '<span class="c-f-item">' + splititem[0] + '<a href="javascript:void(0)" data-id="' + splititem[1] + '" class="o-i-close-applied-filter"><i class="fa fa-times"></i></a></span>';
                console.log(splititem);
            });
            fldshtml += '<a id="clearfilters" href="javascript:void(0)" class="inner-gradient-bg f-clear">löschen</a>';
            jQuery(".filter-applied").empty().append(fldshtml);
        }
        if (filters.length > 0) {
            window.history.replaceState(null, null, urlStr);
            jQuery(".taxomyfilters").val(JSON.stringify(filters));
            jQuery(".azflt").change();
            console.log(filters);
        } else {
            window.history.replaceState(null, null, "");
            jQuery(".taxomyfilters").val(0);
            jQuery(".azflt").change();
        }
    });
    jQuery(document).on("click", ".o-i-close-applied-filter", function (e) {
        e.preventDefault();
        let removeid = jQuery(this).attr("data-id");
        let checkid = jQuery("#" + removeid);
        checkid.prop("checked", false);
        if (jQuery(".c-f-item").length == 1) {
            jQuery(this).closest("span").hide();
            jQuery("#clearfilters").hide();
        }
        jQuery("#trigfilterbtn").trigger("click");
        console.log(removeid);
    });
    jQuery(document).on("click", "#clearfilters", function (e) {
        e.preventDefault();
        document.getElementById("filters").reset();
        jQuery(".filter-applied").empty();
        jQuery("#trigfilterbtn").trigger("click");
        let urlStr = "?page=1";
        window.history.replaceState(null, null, urlStr);
    });
    jQuery(document).on("submit", "form#newsletterPost", function (e) {
        e.preventDefault();
        var formdata = jQuery(this).serialize();
        console.log(formdata);
        const url = "/newsletterPost";
        const inputdata = { method: "POST", data: { formdata: formdata } };
        postData(url, inputdata, "json")
            .then((json) => {
                console.log(json);
                if (json.status) {
                    document.getElementById("newsletterPost").reset();
                    alertify.success(json.message);
                } else {
                    alertify.error(json.message);
                }
            })
            .catch((error) => {
                console.log("Error:" + error);
            });
        return false;
    });
});
