const { base64encode, base64decode } = require('nodejs-base64');

Authorization = {
    async create(req) {

        var formdata = utls.parseQuery(req.body.formdata);
        
        //console.log(formdata); 
        //return false;

        if(!formdata.hasOwnProperty('terms')) {
            return { "status": false, "message": "Bitte AGB lesen und akzeptieren" };
        }

        var personal_info = {
            first_name: formdata.first_name,
            last_name: formdata.last_name,
            company: formdata.company,
            address_1: formdata.address_1,
            address_2: formdata.address_2,
            city: formdata.city,
            state: (formdata.billing_stateshort != "") ? formdata.billing_stateshort : "JU",
            postcode: formdata.postcode,
            country: (formdata.billing_countryshort != "") ? formdata.billing_countryshort : "CH",
            email: formdata.email,
            phone: formdata.phone
        }

        var ship1 = {
            first_name: formdata.first_name,
            last_name: formdata.last_name,
            company: formdata.company,
            address_1: formdata.address_1,
            address_2: formdata.address_2,
            city: formdata.city,
            state: (formdata.billing_stateshort != "") ? formdata.billing_stateshort : "JU",
            postcode: formdata.postcode,
            country: (formdata.billing_countryshort != "") ? formdata.billing_countryshort : "CH"
        };

        var ship2 = {
            first_name: formdata.b2_first_name,
            last_name: formdata.b2_last_name,
            company: formdata.b2_company,
            address_1: formdata.b2_address_1,
            address_2: formdata.b2_address_2,
            city: formdata.b2_city,
            state: formdata.b2_state,
            postcode: formdata.b2_postcode,
            country: "CH"
        };

        const data = {
            email: formdata.email,
            first_name: formdata.first_name,
            last_name: formdata.last_name,
            //username: formdata.email,
            password: formdata.password,
            billing: personal_info,
            shipping: (formdata.diffshipping && formdata.diffshipping !== 'undefined') ? ship2 : ship1
        };


        // shipping data stored in meta data for default shpping address active 1
        var metaship = {
            first_name: formdata.first_name,
            last_name: formdata.last_name,
            company: formdata.company,
            address_1: formdata.address_1,
            address_2: formdata.address_2,
            city: formdata.city,
            state: (formdata.billing_stateshort != "") ? formdata.billing_stateshort : "JU",
            postcode: formdata.postcode,
            country: (formdata.billing_countryshort != "") ? formdata.billing_countryshort : "CH",
            phone : formdata.phone,
            mobile : formdata.mobile,
            active : '1',
        }

        data.meta_data = [{ key: 'shipaddresses', value: [metaship] }];
        
        //console.log(metaship);
        //console.log(data.meta_data);
        //console.log(data);
        //return false;

        let customer = await postWCApiAsync("customers", data);

        if (customer.hasOwnProperty('message')) {
            return { "status": false, "code": customer.data.status, "error": customer.code, "message": customer.message };
        }

        console.log(customer);

        if(customer.hasOwnProperty('id')) {
            var transporter = nodemailer.createTransport({
                host: "asmtp.mail.hostpoint.ch",
                auth: {
                    user: "no-reply@zoocial.ch",
                    pass: "NoBes2019Mail!",
                },
            });
    
            edata = {
                userName: customer.first_name
            }
    
            const welcome_etempate = "views/shop/etemplates/welcome.ejs";
            let welcome_html = await utls.renderEjsFile(welcome_etempate, edata);

            var usermailOptions = {
                from: 'info@zoocialshop.ch',
                to: customer.email,
                subject: "Zoocialshop.ch - Anmeldebestätigung",
                generateTextFromHtml: true,
                html: welcome_html,
            };
    
              transporter.sendMail(usermailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
              });        

        }

        return { "status": true, "code": 200, "error": null, "message": "Your Account is Created, Please Continue to login..." };
    },
    async createCommonReg(req) {
        var formdata = utls.parseQuery(req.body.formdata);
        var options = {
            url: "https://www.zoocial.ch/user-register",
            data: {authkey: "HE612533629606",email: formdata.email,password: formdata.password,firstname: formdata.first_name,lastname: formdata.last_name,dob: "",gender: "",address: formdata.address_1,address_2: formdata.address_2,plz: formdata.postcode,ort: formdata.city,state: (formdata.billing_stateshort != "") ? formdata.billing_stateshort : "JU",country: (formdata.billing_countryshort != "") ? formdata.billing_countryshort : "CH",telephone: formdata.phone,mobile: formdata.mobile,company_name: formdata.company},
          }
        var reqData = await utls.requestPostDataCommon(options);
        var customer = await reqData;
        if(customer.status == true)
        {
            const data = {
                email: formdata.email,
                password: formdata.password,
            };
         let zcustomer = await postWCApiAsync("customers", data);
            //console.log(zcustomer);
            var transporter = nodemailer.createTransport({
                host: "asmtp.mail.hostpoint.ch",
                auth: {
                    user: "no-reply@zoocial.ch",
                    pass: "NoBes2019Mail!",
                },
            });
    
            edata = {
                userName: formdata.first_name
            }
    
            const welcome_etempate = "views/shop/etemplates/welcome.ejs";
            let welcome_html = await utls.renderEjsFile(welcome_etempate, edata);

            var usermailOptions = {
                from: 'info@zoocialshop.ch',
                to: formdata.email,
                subject: "Zoocialshop.ch - Anmeldebestätigung",
                generateTextFromHtml: true,
                html: welcome_html,
            };
    
              transporter.sendMail(usermailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
              });      
            return customer;
        }
        else{
            console.log(customer.message);
            return { "status": false, "code": "", "error": "", "message": customer.message };
        }
        
    },
    async commononeguestregister(req) {

        var formdata = utls.parseQuery(req.body.formdata);
        var billing_info = "";
        var shipping_info = "";
        var userdata = req.session.auth;
        var shipaddresses = [];
        var metasave = [];
        var sval="";

        var billcn = utls.getCountry(formdata.billing_countryshort);

        if(billcn == null) {
            return { "status": false, "message":"Versand nur verfügbar Schweiz und Liechtenstein" };
        }   
        
        if(formdata.shipaddress == "2") {
            var shipcn = utls.getCountry(formdata.b2_countryshort);
            if(shipcn == null) {
                return { "status": false, "message":"Versand nur verfügbar Schweiz und Liechtenstein" };
            }
        }

        //console.log(formdata);
        //return false;

        var personal_info = {
            first_name: formdata.first_name,
            last_name: formdata.last_name,
            company: formdata.company,
            address_1: formdata.address_1,
            address_2: formdata.address_2,
            city: formdata.city,
            state: (formdata.billing_stateshort != "") ? formdata.billing_stateshort : "ZH",
            postcode: formdata.postcode,
            country: formdata.billing_countryshort,
            email: formdata.email,
            phone: formdata.phone
        }

        var ship1 = {
            first_name: formdata.first_name,
            last_name: formdata.last_name,
            company: formdata.company,
            address_1: formdata.address_1,
            address_2: formdata.address_2,
            city: formdata.city,
            state: (formdata.billing_stateshort != "") ? formdata.billing_stateshort : "ZH",
            postcode: formdata.postcode,
            country: formdata.billing_countryshort,
        };

        var ship2 = {
            first_name: formdata.b2_first_name,
            last_name: formdata.b2_last_name,
            company: formdata.b2_company,
            address_1: formdata.b2_address_1,
            address_2: formdata.b2_address_2,
            city: formdata.b2_city,
            state: (formdata.b2_stateshort != "") ? formdata.b2_stateshort : "ZH",
            postcode: formdata.b2_postcode,
            country: formdata.b2_countryshort,
        };

        const data = {
            email: formdata.email,
            first_name: formdata.first_name,
            last_name: formdata.last_name
        }
        if(formdata.formtype == '1') {
            if(formdata.hasOwnProperty('username')) {
                data.username = formdata.username;
            }
            if(formdata.hasOwnProperty('password')) {
                data.password = formdata.password;
            }            
        }
        data.billing = personal_info;
        data.shipping = (formdata.shipaddress == '2') ? ship2 : ship1;
        //shipping: (formdata.diffshipping && formdata.diffshipping !== 'undefined') ? ship2 : ship1


        var shipmentactive = {
            first_name: data.shipping.first_name,
            last_name: data.shipping.last_name,
            company: data.shipping.company,
            address_1: data.shipping.address_1,
            address_2: data.shipping.address_2,
            city: data.shipping.city,
            state: data.shipping.state,
            postcode: data.shipping.postcode,
            country: data.shipping.country,
            phone: (formdata.shipaddress == '2') ? formdata.b2_phone : formdata.phone,
            mobile: (formdata.shipaddress == '2') ? formdata.b2_mobile : formdata.mobile,
            active: "1"      
        }

        //console.log(data);
        //return false;
        console.log(formdata);
        var userinfo = {};
        var u_id = "";
        var pass = "";
        if(userdata.hasOwnProperty('id')) {
            u_id = userdata.id;
            pass = "";
        } else {
            u_id = "";
            pass = formdata.password;
        }
        if(formdata.shipaddress == '2') {
           sval = { 
                authkey: "HE612533629606",
                email: formdata.email,
                password: pass,
                firstname: formdata.first_name,
                lastname: formdata.last_name,
                dob: "",
                gender: "",
                address: formdata.address_1,
                address_2: formdata.address_2,
                plz: formdata.postcode,
                ort: formdata.city,
                state: (formdata.billing_stateshort != "") ? formdata.billing_stateshort : "JU",
                country: (formdata.billing_countryshort != "") ? formdata.billing_countryshort : "CH",
                telephone: formdata.phone,
                mobile: formdata.mobile,
                company_name: formdata.company,
                user_id:u_id,
                s_firstname:formdata.b2_first_name,
                s_lastname:formdata.b2_last_name,
                s_address:formdata.b2_address_1,
                s_address_2:formdata.b2_address_2,
                s_plz:formdata.b2_postcode,
                s_ort:formdata.b2_city,
                s_state: (formdata.b2_stateshort != "") ? formdata.b2_stateshort : "ZH",
                s_country:formdata.b2_countryshort,
                s_company_name:formdata.b2_company,
                s_telephone: formdata.b2_phone,
                s_mobile: formdata.b2_mobile,
                shipping_id:formdata.sid,
                shippingaddress:formdata.shipaddress 
            }
        }
        else {
            sval = {
                authkey: "HE612533629606",
                email: formdata.email,
                password: pass,
                firstname: formdata.first_name,
                lastname: formdata.last_name,
                dob: "",
                gender: "",
                address: formdata.address_1,
                address_2: formdata.address_2,
                plz: formdata.postcode,
                ort: formdata.city,
                state: (formdata.billing_stateshort != "") ? formdata.billing_stateshort : "JU",
                country: (formdata.billing_countryshort != "") ? formdata.billing_countryshort : "CH",
                telephone: formdata.phone,
                mobile: formdata.mobile,
                company_name: formdata.company,
                user_id:u_id,
                s_firstname:formdata.first_name,
                s_lastname:formdata.last_name,
                s_address:formdata.address_1,
                s_address_2:formdata.address_2,
                s_plz:formdata.postcode,
                s_ort:formdata.city,
                s_state:(formdata.billing_stateshort != "") ? formdata.billing_stateshort : "JU",
                s_country: (formdata.billing_countryshort != "") ? formdata.billing_countryshort : "CH",
                s_company_name:formdata.company,
                s_telephone: formdata.phone,
                s_mobile: formdata.mobile,
                shipping_id:formdata.sid,
                shippingaddress:formdata.shipaddress
            }
        }

        if(formdata.formtype == '1') {

            //console.log('Login User ++++++++++++++++++++++++++++');
            //console.log(sval);
            //return false;

            if(userdata.hasOwnProperty('id')) {
                var options = {
                    url: "https://www.zoocial.ch/update-profile-shipping-active",
                    data: sval
                }
                console.log(options);
                console.log("data check1");
                var reqData = await utls.requestPostDataCommon(options);
                var customer = await reqData;
                console.log("customer data check 1 ----------------");
                console.log(customer);
                //Customer Update Error Message
                if (customer.status == false) {
                    console.log("jkhuihioh8");
                   return { "status": false, "code": "", "error": "", "message": customer.message };
                }

                if(customer.status == true) {

                    userinfo = {
                        id: customer.id,
                        username: customer.username,
                        email: customer.email,
                        role: customer.user_role,
                        displayname: customer.first_name,
                        billing: customer.billing_address,
                        shipping: customer.shipping_address,
                        meta_data: customer.meta_data, 
                        dob: customer.dob,
                        gender: customer.gender
                    }

                }

            } else {
                
                console.log('register user');
                var options = {
                    url: "https://www.zoocial.ch/guestuser-register",
                    data: sval
                }
                console.log(options);
                console.log("data check2");
                var reqData = await utls.requestPostDataCommon(options);
                var customer = await reqData;
                //console.log("customer-------------------------------");
                console.log(customer);
                //console.log("customer-------------------------------");
                if (customer.status == false) {
                   return { "status": false, "code": "", "error": "", "message": customer.message };
                }
                if(customer.status == true) {
                    const cdata = {
                        email: formdata.email,
                        password: formdata.password,
                    };
                    let zcustomer = await postWCApiAsync("customers", cdata);
                   // console.log(zcustomer);
                   var transporter = nodemailer.createTransport({
                            host: "asmtp.mail.hostpoint.ch",
                            auth: {
                                user: "no-reply@zoocial.ch",
                                pass: "NoBes2019Mail!",
                            },
                        });    
                
                        edata = {
                            userName: customer.first_name
                        }
                
                        const welcome_etempate = "views/shop/etemplates/welcome.ejs";
                        let welcome_html = await utls.renderEjsFile(welcome_etempate, edata);
            
                        var usermailOptions = {
                            from: 'info@zoocialshop.ch',
                            to: customer.email,
                            subject: "Zoocialshop.ch - Anmeldebestätigung",
                            generateTextFromHtml: true,
                            html: welcome_html,
                        };
                
                        transporter.sendMail(usermailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log("Email sent: " + info.response);
                            }
                        });    

                        userinfo = {
                            id: customer.id,
                            username: customer.username,
                            email: customer.email,
                            role: customer.user_role,
                            displayname: customer.first_name,
                            billing: customer.billing_address,
                            shipping: customer.shipping_address,
                            meta_data: customer.meta_data, 
                            dob: customer.dob,
                            gender: customer.gender
                        }
                    }
               
        } 
    }
        if(formdata.formtype == '2') {

            console.log('guest');

            userinfo = {
                email: formdata.email,
                displayname: formdata.first_name,
                role: "guest",
                billing: personal_info,
                shipping: (formdata.shipaddress == '2') ? ship2 : ship1
            }
        }

        console.log("Reaching", userinfo.shipping); 

        if(userinfo.hasOwnProperty('billing')) {
            //billing_info = "<p>"+ userinfo.billing.first_name + " " + userinfo.billing.last_name + "<br />"+ userinfo.billing.address_1.toString() + "<br />" + userinfo.billing.postcode.toString() + " " + userinfo.billing.city + "<br >" + userinfo.billing.country +"</p>";
            //billing_info = "<p>"+ userinfo.billing.first_name + " " + userinfo.billing.last_name + "<br />"+ userinfo.billing.address_1.toString() + "<br />" + userinfo.billing.postcode.toString() + " " + userinfo.billing.city + "<br >" + utls.getCountry(userinfo.billing.country) +"</p>";
            billing_info = "<p>";
            if(userinfo.billing.company != "") {
                billing_info += userinfo.billing.company.toString() + "<br />";
            }
            billing_info += userinfo.billing.first_name + " " + userinfo.billing.last_name + "<br />";
            billing_info += userinfo.billing.address_1.toString() + "<br />";
            if(userinfo.billing.address_2 !== null && userinfo.billing.address_2 !== "") {
                billing_info += userinfo.billing.address_2.toString() + "<br />";
            }
            billing_info += userinfo.billing.postcode.toString() + " " + userinfo.billing.city + "<br />";
            billing_info += utls.getCountry(userinfo.billing.country);
            billing_info += "</p>";
        }

        if(userinfo.hasOwnProperty('shipping')) {
            //shipping_info = "<p>"+ userinfo.shipping.first_name + " " + userinfo.shipping.last_name + "<br />"+ userinfo.shipping.address_1.toString() + "<br />" + userinfo.shipping.postcode.toString() + " " + userinfo.shipping.city + "<br >" + userinfo.shipping.country +"</p>";
            //shipping_info = "<p>"+ userinfo.shipping.first_name + " " + userinfo.shipping.last_name + "<br />"+ userinfo.shipping.address_1.toString() + "<br />" + userinfo.shipping.postcode.toString() + " " + userinfo.shipping.city + utls.getCountry(userinfo.shipping.country) +"</p>";
            shipping_info = "<p>";
            if(userinfo.shipping.company != "") {
                shipping_info += userinfo.shipping.company.toString() + "<br />";
            }
            shipping_info += userinfo.shipping.first_name + " " + userinfo.shipping.last_name + "<br />";
            shipping_info += userinfo.shipping.address_1.toString() + "<br />";
            if(userinfo.shipping.address_2 !== null && userinfo.shipping.address_2 !== "") {
                shipping_info += userinfo.shipping.address_2.toString() + "<br />";
            }
            shipping_info += userinfo.shipping.postcode.toString() + " " + userinfo.shipping.city + "<br />";
            shipping_info += utls.getCountry(userinfo.shipping.country);
            shipping_info += "</p>";
        }

        req.session.auth = userinfo;

        var resdata = {
            "status": true, 
            "code": 200,
            "error": null,
            "formtype": formdata.formtype,
            "billing_info": billing_info,
            "shipping_info": shipping_info,
            "shiptype": formdata.shipaddress,
        };

        console.log(resdata);

        //return { "status": true, "code": 200, "error": null, "message": "Your Account is Created, Please Continue to login..." };

        return resdata;
    },
    async oneguestregister(req) {

        var formdata = utls.parseQuery(req.body.formdata);
        var billing_info = "";
        var shipping_info = "";
        var userdata = req.session.auth;
        var shipaddresses = [];
        var metasave = [];

        var billcn = utls.getCountry(formdata.billing_countryshort);

        if(billcn == null) {
            return { "status": false, "message":"Versand nur verfügbar Schweiz und Liechtenstein" };
        }   
        
        if(formdata.shipaddress == "2") {
            var shipcn = utls.getCountry(formdata.b2_countryshort);
            if(shipcn == null) {
                return { "status": false, "message":"Versand nur verfügbar Schweiz und Liechtenstein" };
            }
        }

        //console.log(formdata);
        //return false;

        var personal_info = {
            first_name: formdata.first_name,
            last_name: formdata.last_name,
            company: formdata.company,
            address_1: formdata.address_1,
            address_2: formdata.address_2,
            city: formdata.city,
            state: (formdata.billing_stateshort != "") ? formdata.billing_stateshort : "ZH",
            postcode: formdata.postcode,
            country: formdata.billing_countryshort,
            email: formdata.email,
            phone: formdata.phone
        }

        var ship1 = {
            first_name: formdata.first_name,
            last_name: formdata.last_name,
            company: formdata.company,
            address_1: formdata.address_1,
            address_2: formdata.address_2,
            city: formdata.city,
            state: (formdata.billing_stateshort != "") ? formdata.billing_stateshort : "ZH",
            postcode: formdata.postcode,
            country: formdata.billing_countryshort,
        };

        var ship2 = {
            first_name: formdata.b2_first_name,
            last_name: formdata.b2_last_name,
            company: formdata.b2_company,
            address_1: formdata.b2_address_1,
            address_2: formdata.b2_address_2,
            city: formdata.b2_city,
            state: (formdata.b2_stateshort != "") ? formdata.b2_stateshort : "ZH",
            postcode: formdata.b2_postcode,
            country: formdata.b2_countryshort,
        };

        const data = {
            email: formdata.email,
            first_name: formdata.first_name,
            last_name: formdata.last_name
        }
        if(formdata.formtype == '1') {
            if(formdata.hasOwnProperty('username')) {
                data.username = formdata.username;
            }
            if(formdata.hasOwnProperty('password')) {
                data.password = formdata.password;
            }            
        }
        data.billing = personal_info;
        data.shipping = (formdata.shipaddress == '2') ? ship2 : ship1;
        //shipping: (formdata.diffshipping && formdata.diffshipping !== 'undefined') ? ship2 : ship1


        var shipmentactive = {
            first_name: data.shipping.first_name,
            last_name: data.shipping.last_name,
            company: data.shipping.company,
            address_1: data.shipping.address_1,
            address_2: data.shipping.address_2,
            city: data.shipping.city,
            state: data.shipping.state,
            postcode: data.shipping.postcode,
            country: data.shipping.country,
            phone: (formdata.shipaddress == '2') ? formdata.b2_phone : formdata.phone,
            mobile: (formdata.shipaddress == '2') ? formdata.b2_mobile : formdata.mobile,
            active: "1"      
        }

        //console.log(data);
        //return false;

        var userinfo = {};
        if(formdata.formtype == '1') {

            if(userdata.hasOwnProperty('id')) {
                
                userdata.meta_data.forEach((meta, idx) => {
                    if(meta.key == 'shipaddresses') {
                        shipaddresses = meta.value;
                    }
                });

                shipaddresses.forEach((meta, idx)=> {
                    if(idx == parseInt(formdata.changeaddress)) {
                        metasave.push(shipmentactive);
                    } else {
                        meta.active = "0";
                        metasave.push(meta);
                    }
                });

                data.meta_data = [{ key: 'shipaddresses', value: metasave }];

                //console.log("update User");
                //console.log(metasave);
                //console.log(data);
                //return false;

                let customer = await putWCApiAsync("customers/" + userdata.id, data);

                //Customer Update Error Message
                if (customer.hasOwnProperty('message')) {
                    return { "status": false, "code": customer.data.status, "error": customer.code, "message": customer.message };
                }

                if(customer.hasOwnProperty('id')) {
                    userinfo = {
                        id: customer.id,
                        username: customer.username,
                        email: customer.email,
                        role: customer.role,
                        displayname: customer.first_name,
                        billing: customer.billing,
                        shipping: customer.shipping,
                        meta_data: customer.meta_data, 
                    }               
                }

            } else {
                
                console.log('register user');

                data.meta_data = [{ key: 'shipaddresses', value: [shipmentactive] }];
                
                //console.log(data);
                //return false;

                let customer = await postWCApiAsync("customers", data);
                
                // Customer Registration Error
                if (customer.hasOwnProperty('message')) {
                    return { "status": false, "code": customer.data.status, "error": customer.code, "message": customer.message };
                }

                // Customer Created response from shop
                if(customer.hasOwnProperty('id')) {
                    
                        var transporter = nodemailer.createTransport({
                            host: "asmtp.mail.hostpoint.ch",
                            auth: {
                                user: "no-reply@zoocial.ch",
                                pass: "NoBes2019Mail!",
                            },
                        });    
                
                        edata = {
                            userName: customer.first_name
                        }
                
                        const welcome_etempate = "views/shop/etemplates/welcome.ejs";
                        let welcome_html = await utls.renderEjsFile(welcome_etempate, edata);
            
                        var usermailOptions = {
                            from: 'info@zoocialshop.ch',
                            to: customer.email,
                            subject: "Zoocialshop.ch - Anmeldebestätigung",
                            generateTextFromHtml: true,
                            html: welcome_html,
                        };
                
                        transporter.sendMail(usermailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log("Email sent: " + info.response);
                            }
                        });        

                        userinfo = {
                            id: customer.id,
                            username: customer.username,
                            email: customer.email,
                            role: customer.role,
                            displayname: customer.first_name,
                            billing: customer.billing,
                            shipping: customer.shipping,
                            meta_data: customer.meta_data,
                        }
                }

            }
        }

        if(formdata.formtype == '2') {

            console.log('guest');

            userinfo = {
                email: formdata.email,
                displayname: formdata.first_name,
                role: "guest",
                billing: personal_info,
                shipping: (formdata.shipaddress == '2') ? ship2 : ship1
            }
        }

        if(userinfo.hasOwnProperty('billing')) {
            //billing_info = "<p>"+ userinfo.billing.first_name + " " + userinfo.billing.last_name + "<br />"+ userinfo.billing.address_1.toString() + "<br />" + userinfo.billing.postcode.toString() + " " + userinfo.billing.city + "<br >" + userinfo.billing.country +"</p>";
            //billing_info = "<p>"+ userinfo.billing.first_name + " " + userinfo.billing.last_name + "<br />"+ userinfo.billing.address_1.toString() + "<br />" + userinfo.billing.postcode.toString() + " " + userinfo.billing.city + "<br >" + utls.getCountry(userinfo.billing.country) +"</p>";
            billing_info = "<p>";
            if(userinfo.billing.company != "") {
                billing_info += userinfo.billing.company.toString() + "<br />";
            }
            billing_info += userinfo.billing.first_name + " " + userinfo.billing.last_name + "<br />";
            billing_info += userinfo.billing.address_1.toString() + "<br />";
            if(userinfo.billing.address_2 != "") {
                billing_info += userinfo.billing.address_2.toString() + "<br />";
            }
            billing_info += userinfo.billing.postcode.toString() + " " + userinfo.billing.city + "<br />";
            billing_info += utls.getCountry(userinfo.billing.country);
            billing_info += "</p>";
        }

        if(userinfo.hasOwnProperty('shipping')) {
            //shipping_info = "<p>"+ userinfo.shipping.first_name + " " + userinfo.shipping.last_name + "<br />"+ userinfo.shipping.address_1.toString() + "<br />" + userinfo.shipping.postcode.toString() + " " + userinfo.shipping.city + "<br >" + userinfo.shipping.country +"</p>";
            //shipping_info = "<p>"+ userinfo.shipping.first_name + " " + userinfo.shipping.last_name + "<br />"+ userinfo.shipping.address_1.toString() + "<br />" + userinfo.shipping.postcode.toString() + " " + userinfo.shipping.city + utls.getCountry(userinfo.shipping.country) +"</p>";
            shipping_info = "<p>";
            if(userinfo.shipping.company != "") {
                shipping_info += userinfo.shipping.company.toString() + "<br />";
            }
            shipping_info += userinfo.shipping.first_name + " " + userinfo.shipping.last_name + "<br />";
            shipping_info += userinfo.shipping.address_1.toString() + "<br />";
            if(userinfo.shipping.address_2 != "") {
                shipping_info += userinfo.shipping.address_2.toString() + "<br />";
            }
            shipping_info += userinfo.shipping.postcode.toString() + " " + userinfo.shipping.city + "<br />";
            shipping_info += utls.getCountry(userinfo.shipping.country);
            shipping_info += "</p>";
        }

        req.session.auth = userinfo;

        var resdata = {
            "status": true, 
            "code": 200,
            "error": null,
            "formtype": formdata.formtype,
            "billing_info": billing_info,
            "shipping_info": shipping_info,
            "shiptype": formdata.shipaddress,
        };

        //return { "status": true, "code": 200, "error": null, "message": "Your Account is Created, Please Continue to login..." };

        return resdata;
    },
    async register(req) {

        let creqdata = {
            per_page: 50,
            page: 1
        };
        
        let products = await getWCApiAsync("products");
        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            products: products,
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "register"},
        }

        return data;
        //res.setHeader('Content-Type', 'application/json');
        //res.send(JSON.stringify({ "status": 200, "method": 'lists', 'items': req.session.cartitems }));
    },
    async login(req) {

        let creqdata = {
            per_page: 50,
            page: 1
          };

        let products = await getWCApiAsync("products");
        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            products: products,
            categories: utls.getNestedChildren(categories, 0),
            metaInfo: {page: "login"},
        }

        return data;
    },
    async authorize(req) {
        var formdata = utls.parseQuery(req.body.formdata);
        var userinput = {};
        var userinfo = {};

        //console.log(formdata);
        //return false;

        const url = await config.wcsettings.url + "wp-json/jwt-auth/v1/token";

        const inputData = {
            method: 'POST',
            data: formdata
        };

        let jwtres = await utls.postData(url, inputData);
        console.log(jwtres);
        if (jwtres.hasOwnProperty('code')) {
            if (jwtres.code == '[jwt_auth] invalid_username' || jwtres.code == '[jwt_auth] invalid_email') {
                return {
                    "status": false,
                    "error": true,
                    "message": "Überprüfe deine Emailadresse noch einmal"
                };
            }
            if (jwtres.code == '[jwt_auth] incorrect_password') {
                return {
                    "status": false,
                    "error": true,
                    "message": "Das von dir eingegebene Passwort stimmt nicht. Bitte versuch es noch einmal"
                }
            }
        }

        if (jwtres.user_email) {
            userinput = {
                email: jwtres.user_email
            }
            userdata = await getWCApiAsync("customers", userinput);
            userinfo = {
                id: userdata[0].id,
                username: userdata[0].username,
                email: userdata[0].email,
                role: userdata[0].role,
                displayname: jwtres.user_display_name,
                billing: userdata[0].billing,
                shipping: userdata[0].shipping,
                meta_data: userdata[0].meta_data
            }
            //req.session.loguser = userinfo;
            req.session.auth = userinfo;
        }

        return { "status": true, "error": null, "message": "erfolgreich angemeldet", "redirect": formdata.redirect };
    },
    async commonAuthorize(req){
        var formdata = utls.parseQuery(req.body.formdata);
        var userinput = {};
        var userinfo = {};
        console.log("login newcode");
        console.log(formdata);
        var options = {
            url: "https://www.zoocial.ch/user-login",
            data: {authkey: "HE612533629606",email: formdata.username,password: formdata.password},
          }
        var reqData = await utls.requestPostDataCommon(options);
        var result = await reqData;
        var data = JSON.parse(JSON.stringify(result));
        //console.log(data);
         if(data.status == true)
        {
            var vData = {
                email: formdata.username
              }
              //console.log(userdata);
              Checkzcustomer = await getWCApiAsync("customers", vData);
              //console.log(Checkzcustomer);
              console.log("-------------zcustomer check-------------");
              if(Checkzcustomer == "")
              {
                console.log("zshop new");
                const cdata = {
                    email: formdata.username,
                    password: formdata.password,
                };
                console.log(cdata);
                let zcustomer = await postWCApiAsync("customers", cdata);
              }
              else{
                console.log("zshop old");
              }
              console.log("-------------zcustomer check-------------");
            var email = data.email;
            if (email) {
                userinput = {
                    email: email
                }
                userinfo = {
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    role: data.user_role,
                    displayname: "",
                    billing: data.billing_address,
                    shipping: data.shipping_address,
                    meta_data: data.meta_data,
                    dob: data.dob,
                    gender: data.gender
                }
                //req.session.loguser = userinfo;
                req.session.auth = userinfo;
            }
            return { "status": true, "error": null, "message": "erfolgreich angemeldet", "redirect": formdata.redirect };
        }
        if(data.status == false && data.type=="email")
        {
            return {
                "status": false,
                "error": true,
                "message": "Überprüfe deine Emailadresse noch einmal"
            };
        }
        if(data.status == false && data.type=="password")
        {
            return {
                "status": false,
                "error": true,
                "message": "Das von dir eingegebene Passwort stimmt nicht. Bitte versuch es noch einmal"
            };
        }
        if(data.status == false && data.type=="profilestatus")
        {
            return {
                "status": false,
                "error": true,
                "message": data.message
            };
        }
        if(data.status == false && data.type=="emailvarify")
        {
            return {
                "status": false,
                "error": true,
                "message": data.message
            };
        }
    },
    async myAccount(req) {
        let creqdata = {
            per_page: 50,
            page: 1
        };
        let categories = await getWCApiAsync("products/categories", creqdata);
        data = {
            categories: utls.getNestedChildren(categories, 0),
            userdata: req.session.auth,
        }
        return data;
    },
    async updateAccount(req) {

        var userdata = req.session.auth;
        var formdata = utls.parseQuery(req.body.formdata);
        var data = {};

        //console.log(formdata);
        //return false;

        var billing = {
            first_name: formdata.first_name,
            last_name: formdata.last_name,
            company: formdata.company,
            address_1: formdata.address_1,
            address_2: formdata.address_2,
            city: formdata.city,
            state: (formdata.countryshort == "CH") ? (formdata.stateshort != "") ? formdata.stateshort : "ZH" : formdata.state,
            postcode: formdata.postcode,
            country: formdata.countryshort,
            email: formdata.email,
            phone: formdata.phone
        }

        var shipping = {
            first_name: formdata.b2_first_name,
            last_name: formdata.b2_last_name,
            company: formdata.b2_company,
            address_1: formdata.b2_address_1,
            address_2: formdata.b2_address_2,
            city: formdata.b2_city,
            state: (formdata.b2_countryshort == "CH") ? (formdata.b2_stateshort != "") ? formdata.b2_stateshort : "ZH" : formdata.b2_state,
            postcode: formdata.b2_postcode,
            country: formdata.b2_countryshort,
        };

        const rqdata = {
            email: formdata.email,
            first_name: formdata.first_name,
            last_name: formdata.last_name,
            billing: billing,
            shipping: shipping
        };

        let bdate = formdata.hasOwnProperty('bdate') && formdata.bdate != "" ? formdata.bdate : "";
        let bmonth = formdata.hasOwnProperty('bmonth') && formdata.bmonth != "" ? formdata.bmonth : "";
        let byear = formdata.hasOwnProperty('byear') && formdata.byear != "" ? formdata.byear : "";
        let bsep = formdata.hasOwnProperty('byear') && formdata.byear != "" ? "-" : ""

        let birth_date = {
            "key": "birth_date",
            "value": bdate + bsep + bmonth + bsep + byear
        }

        let gender = {
            "key": "gender",
            "value": formdata.gender
        };

        let shipmeta = { key: "shipaddresses", value: [shipping] }; 

        rqdata.meta_data = [birth_date, gender];
       
        /*if(userdata.hasOwnProperty('meta_data')) {
            userdata.meta_data.forEach((meta, indx) => {
                if(meta.key == 'shipaddresses') {

                }
            });
        } else {
            let shipmeta = { key: "shipaddresses", value: [shipping] }; 
            rqdata.meta_data.push(shipmeta);
        }*/

        //console.log(rqdata);
        //return false;

        if (userdata.hasOwnProperty('id')) {

            let customer = await putWCApiAsync("customers/" + userdata.id, rqdata);

            console.log(customer);

            userdata.id = customer.id;
            userdata.username = customer.username;
            userdata.email = customer.email;
            userdata.role = customer.role;
            userdata.displayname = customer.username;
            userdata.billing = customer.billing;
            userdata.shipping = customer.shipping;
            userdata.meta_data = customer.meta_data;

            data = {
                status: true,
                customer: customer,
                message: "Kontoinformationen erfolgreich aktualisiert",
            }

        } else {
            data = {
                status: false,
                message: "Aktualisierung nicht erfolgreich",
            }
        }
        return data;
    },
    async commonupdateAccount(req) {

        var userdata = req.session.auth;
        var formdata = utls.parseQuery(req.body.formdata);
        var data = {};
        var customer = {};
        console.log("----------------CHECK DATE UPDATE----------------------------");
        console.log(formdata);
        console.log("----------------CHECK DATE UPDATE----------------------------");
        let bdate = formdata.hasOwnProperty('bdate') && formdata.bdate != "" ? formdata.bdate : "";
        let bmonth = formdata.hasOwnProperty('bmonth') && formdata.bmonth != "" ? formdata.bmonth : "";
        let byear = formdata.hasOwnProperty('byear') && formdata.byear != "" ? formdata.byear : "";
        let bsep = formdata.hasOwnProperty('byear') && formdata.byear != "" ? "." : ""
        let bbdate = bdate + bsep + bmonth + bsep + byear;
        //console.log(userdata);
        var options = {
            url: "https://www.zoocial.ch/update-profile-shipping-active",
            data: {authkey: "HE612533629606",user_id:userdata.id,firstname: formdata.first_name,lastname: formdata.last_name,dob: formdata.geburtsdatum,gender: formdata.gender,address: formdata.address_1,address_2: formdata.address_2,plz: formdata.postcode,ort: formdata.city,state: (formdata.billing_stateshort != "") ? formdata.billing_stateshort : "JU",country: (formdata.billing_countryshort != "") ? formdata.billing_countryshort : "CH",telephone: formdata.phone,mobile: formdata.mobile,company_name: formdata.company,shipping_id:"0"},
          }
        var reqData = await utls.requestPostDataCommon(options);
        var result = await reqData;
        if (result.status == true) {
            //let customer = await putWCApiAsync("customers/" + userdata.id, rqdata);
           // console.log(customer);
           /*console.log(result);
           console.log(result.id);
           console.log(result.username);
           console.log(result.email);*/
            userdata.id = result.id;
            userdata.username = result.username;
            userdata.email = result.email;
            userdata.role = result.user_role;
            userdata.displayname = result.username;
            userdata.billing = result.billing_address;
            userdata.shipping = result.shipping_address;
            userdata.meta_data = result.meta_data;
            userdata.dob = result.dob;
            userdata.gender = result.gender;
            customer.id = result.id;
            customer.email = result.email;

            data = {
                status: true,
                customer: customer,
                message: "Kontoinformationen erfolgreich aktualisiert",
            }
            console.log(data);

        } else {
            data = {
                status: false,
                message: "Aktualisierung nicht erfolgreich",
            }
        }
       return data;
    },
    async userMenus(req) {
        var userdata = req.session.auth;
        var data = {};

        if (userdata.hasOwnProperty('id')) {
            data = { "status": true, "userdata": userdata };
        } else {
            data = { "status": false };
        }
        return data;
    },
    async userMenusn(req) {
        var userdata = req.session.auth;
        var data = {};

        var fdlinks = '<li><a class="text-gray" href="https://www.zoocial.ch/" target="_blank">ZOOCIAL</a></li>';
        if (userdata.hasOwnProperty('id')) {
            fdlinks += '<li><a class="text-gray" href="/mein_ubersicht">Meine Übersicht</a></li>';
            fdlinks += '<li><a class="text-gray" href="/cart">Mein Warenkorb</a></li>';
        }
        fdlinks += '<li><a class="text-gray" href="/meine_bestellungen">Meine Bestellungen</a></li>';

        if (userdata.hasOwnProperty('id')) {
            data = { "status": true, "user": userdata, "fdlinks": fdlinks };
        } else {
            data = { "status": false };
        }
        return data;
    },
    async benutzerdaten(req, res) {
        let creqdata = {
            per_page: 50,
            page: 1
        };

        let birth_date = "";
        let gender = "";
        console.log(req.session.auth);
        var userdata = (req.session.auth.hasOwnProperty('id')) ? req.session.auth : {};
        let categories = await getWCApiAsync("products/categories", creqdata);

       /* if(userdata.hasOwnProperty('meta_data')) {
            userdata.meta_data.forEach((meta, idx) => {
                if(meta.key == "birth_date" && meta.value != "") {
                    birth_date = meta.value.split("-");
                }
                if(meta.key == "gender") {
                    gender = meta.value;
                }
            });
        }*/
        console.log("----------------CHECK DATE render----------------------------");
        console.log(userdata.dob);
        console.log("----------------CHECK DATE render----------------------------");
        if(userdata.dob != "" && userdata.dob != null && userdata.dob != undefined)  {
            /*var dob_data = userdata.dob.split(".");
            birth_date.push(dob_data[0]);
            birth_date.push(dob_data[1]);
            birth_date.push(dob_data[2]);*/
            birth_date=userdata.dob;
        }
        if(userdata.gender != "" && userdata.gender != null && userdata.gender != undefined) {
            
            if(userdata.gender == "1" || userdata.gender == "Männlich")
            {
                gender = 1;
            }
            else if(userdata.gender == "2" || userdata.gender == "Weiblich")
            {
                gender = 2;
            }
        }
        
        //var user = await getWCApiAsync("customers/"+userdata.id);
        //console.log(user);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            userdata: userdata,
            birth_date : birth_date,
            gender: gender,
            metaInfo: {page: "profile"},
        }
        return data;
        //res.render("shop/pages/benutzerdaten", data);
    },
    async passwortandern(req, res) {
        let creqdata = {
            per_page: 50,
            page: 1
          };  
        var userdata = (req.session.auth.hasOwnProperty('id')) ? req.session.auth : {};
        let categories = await getWCApiAsync("products/categories", creqdata);
        data = {
            categories: utls.getNestedChildren(categories, 0),
            userdata: userdata,
            metaInfo: {page: "passwordchange"},
        }
        return data;
        //res.render("shop/pages/passwortandern", data);
    },
    async passwordUpdate(req) {
        var userdata = req.session.auth;
        var formdata = utls.parseQuery(req.body.formdata);
        var data = {};
        console.log(formdata);
        //return false;    
        var rqData = {
            password: formdata.password
        }

        if (userdata.hasOwnProperty('id')) {

            let customer = await putWCApiAsync("customers/" + userdata.id, rqData);
    

            if(customer.hasOwnProperty('id')) {
                var transporter = nodemailer.createTransport({
                    host: "asmtp.mail.hostpoint.ch",
                    auth: {
                        user: "no-reply@zoocial.ch",
                        pass: "NoBes2019Mail!",
                    },
                });
        
                edata = {
                    userName: customer.first_name,
                    userEmail: customer.email
                }
        
                const change_password = "views/shop/etemplates/change_password.ejs";
                let password_html = await utls.renderEjsFile(change_password, edata);

                var usermailOptions = {
                    from: 'info@zoocialshop.ch',
                    to: customer.email,
                    subject: "Zoocialshop.ch - Passwort wurde aktualisiert",
                    generateTextFromHtml: true,
                    html: password_html,
                };
        
                  transporter.sendMail(usermailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Email sent: " + info.response);
                    }
                  });
            }
            data = {
                status: true,
                customer: customer,
                message: "Passwort erfolgreich aktualisiert",
            }
        } else {
            data = {
                status: false,
                message: "Entschuldigung!, Etwas ist falsch gelaufen",
            }
        }
        
        return data;
        //res.render("shop/pages/passwortandern", data);
    },
    async commonpasswordUpdate(req) {
        var userdata = req.session.auth;
        var formdata = utls.parseQuery(req.body.formdata);
        var data = {};
        var rqData = {
            password: formdata.password
        }
        if (userdata.hasOwnProperty('id')) {

            var options = {
            url: "https://www.zoocial.ch/update-password",
            data: {authkey: 'HE612533629606',email: userdata.email,password: formdata.password},
        }
        var reqData = await utls.requestPostDataCommon(options);
          let customer = await reqData;
          if(customer.status == true) {
               var transporter = nodemailer.createTransport({
                    host: "asmtp.mail.hostpoint.ch",
                    auth: {
                        user: "no-reply@zoocial.ch",
                        pass: "NoBes2019Mail!",
                    },
                });
        
                edata = {
                    userName: customer.first_name,
                    userEmail: customer.email
                }
        
                const change_password = "views/shop/etemplates/change_password.ejs";
                let password_html = await utls.renderEjsFile(change_password, edata);

                var usermailOptions = {
                    from: 'info@zoocialshop.ch',
                    to: customer.email,
                    subject: "Zoocialshop.ch - Passwort wurde aktualisiert",
                    generateTextFromHtml: true,
                    html: password_html,
                };
        
                  transporter.sendMail(usermailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Email sent: " + info.response);
                    }
                  });
            }
                        

            data = {
                status: true,
                customer: customer,
                message: "Passwort erfolgreich aktualisiert",
            }
        } else {
            data = {
                status: false,
                message: "Entschuldigung!, Etwas ist falsch gelaufen",
            }
        }
        
        return data;
        //res.render("shop/pages/passwortandern", data);
    },
    async passwortvergessen(req) {
        
        let creqdata = {
            per_page: 50,
            page: 1
          };  

        let categories = await getWCApiAsync("products/categories", creqdata);

        var vtoken = req.query.vtoken;
        var dcodeEmail = 0;
        var customer = {};
        var activeUser = 0;
        
        if(vtoken) {
            var dcodeEmail = base64decode(vtoken);
            console.log(vtoken);
            console.log(dcodeEmail);
            var rqData = {
                email: dcodeEmail
            }
            customer = await getWCApiAsync("customers", rqData);
            if(customer.length > 0 && (customer[0].email == dcodeEmail)) {
                activeUser = 1;
            }
        }

        data = {
            categories: utls.getNestedChildren(categories, 0),
            customer: customer,
            activeUser: activeUser
        }
        return data;
    },
    async commonpasswortvergessen(req) {
        let creqdata = {
            per_page: 50,
            page: 1
          };  

        let categories = await getWCApiAsync("products/categories", creqdata);

        var vtoken = req.query.vtoken;
        var dcodeEmail = 0;
        var customer = {};
        var activeUser = 0;
        console.log("vtoken");
        console.log(vtoken);
        if(vtoken) {
            var dcodeEmail = base64decode(vtoken);
            console.log(vtoken);
            console.log(dcodeEmail);
            var rqData = {
                email: dcodeEmail
            }
            var options = {
                url: "https://www.zoocial.ch/check-user-email",
                data: {authkey: 'HE612533629606',email: dcodeEmail},
            }
            var data = await utls.requestPostDataCommon(options);
            customer = await data;
            console.log(customer);
            if(customer.email == dcodeEmail)
            {
                activeUser = 1;
            }
        }

        data = {
            categories: utls.getNestedChildren(categories, 0),
            customer: customer,
            activeUser: activeUser,
            metaInfo: {page: "password_chn"},
        }
        return data;
    },
    async commonpasswortzuruecksetzen(req) {

        let creqdata = {
            per_page: 50,
            page: 1
        };  

        let categories = await getWCApiAsync("products/categories", creqdata);
        var vtoken = req.query.vtoken;
        var dcodeEmail = 0;
        var customer = {};
        var activeUser = 0;
        if(vtoken) {
            var dcodeEmail = base64decode(vtoken);
            console.log("forgot dcodeEmail= "+dcodeEmail);
            var rqData = {
                email: dcodeEmail
            }
            //customer = await getWCApiAsync("customers", rqData);
            var options = {
                url: "https://www.zoocial.ch/check-user-email",
                data: {authkey: 'HE612533629606',email: dcodeEmail},
            }
            var vcdata = await utls.requestPostDataCommon(options);
            result = await vcdata;
            customer.id=result.id;
            customer.email=result.email;
            if(result.email == dcodeEmail)
            {
                activeUser = 1;
            }
        }
        data = {
            categories: utls.getNestedChildren(categories, 0),
            customer: customer,
            activeUser: activeUser,
            metaInfo: {page: "password_change"},
        }
        return data;
    },
    async passwortzuruecksetzen(req) {

        let creqdata = {
            per_page: 50,
            page: 1
        };  

        let categories = await getWCApiAsync("products/categories", creqdata);

        var vtoken = req.query.vtoken;
        var dcodeEmail = 0;
        var customer = {};
        var activeUser = 0;
        
        if(vtoken) {
            var dcodeEmail = base64decode(vtoken);
            console.log(vtoken);
            console.log(dcodeEmail);
            var rqData = {
                email: dcodeEmail
            }
            customer = await getWCApiAsync("customers", rqData);
            if(customer.length > 0 && (customer[0].email == dcodeEmail)) {
                activeUser = 1;
            }
        }

        data = {
            categories: utls.getNestedChildren(categories, 0),
            customer: customer,
            activeUser: activeUser,
            metaInfo: {page: "password_chn"},
        }
        return data;
    },
    async tokengenerate(req, res) {
        var formdata = utls.parseQuery(req.body.formdata);
        var edata = {};
        var data = {};

        var formEMail = formdata.email;

        var rqData = {
            email: formEMail
        }

        let customer = await getWCApiAsync("customers", rqData);

        if(customer.length > 0 ) {
            var userID = customer[0].id;
            var userEmail = customer[0].email;
            var userName = customer[0].first_name;
            var encodeEmail = base64encode(userEmail);
            console.log(encodeEmail);
            var decodeEmail = base64decode(encodeEmail);
            console.log(decodeEmail);

            var transporter = nodemailer.createTransport({
                host: "asmtp.mail.hostpoint.ch",
                //port: 465,
                //secure: true, // true for 465, false for other ports
                auth: {
                    user: "no-reply@zoocial.ch",
                    pass: "NoBes2019Mail!",
                },
            });

            edata = {
                userEmail: userEmail,
                userName: userName,
                encodeEmail: encodeEmail
            }

            const forgot_password = "views/shop/etemplates/forgot_password.ejs";
            let eforgot_password = await utls.renderEjsFile(forgot_password, edata);

            var usermailOptions = {
                from: 'info@zoocialshop.ch',
                to: userEmail,
                subject: "Zoocialshop.ch - Bitte ändere dein Passwort über den angegebenen Link in der E-Mail",
                generateTextFromHtml: true,
                html: eforgot_password,
              };
    
              transporter.sendMail(usermailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
              });

              data = { status: true, message: "Gesendete Token-Bestätigung, bitte überprüfen Sie Ihre angegebene E-Mail-Adresse", email: userEmail };
        } else {
            data = { status: false, message: "Diese E-Mail Adresse ist ungültig oder wird nicht unterstützt." };
        }
        return data;
    },
    async commontokengenerate(req, res) {
        var formdata = utls.parseQuery(req.body.formdata);
        var edata = {};
        var data = {};

        var formEMail = formdata.email;

        var rqData = {
            email: formEMail
        }
        console.log(rqData);
        //let customer = await getWCApiAsync("customers", rqData);
        var options = {
                url: "https://www.zoocial.ch/check-user-email",
                data: {authkey: 'HE612533629606',email: formEMail},
            }
            var data = await utls.requestPostDataCommon(options);
            var customer = await data;
        if(customer.status == true ) {
            console.log("emailfunction");
            console.log(customer.email);
            var userID = customer.id;
            var userEmail = customer.email;
            var userName = customer.first_name;
            var encodeEmail = base64encode(userEmail);
            console.log(encodeEmail);
            var decodeEmail = base64decode(encodeEmail);
            console.log(decodeEmail);

            var transporter = nodemailer.createTransport({
                host: "asmtp.mail.hostpoint.ch",
                //port: 465,
                //secure: true, // true for 465, false for other ports
                auth: {
                    user: "no-reply@zoocial.ch",
                    pass: "NoBes2019Mail!",
                },
            });

            edata = {
                userEmail: userEmail,
                userName: userName,
                encodeEmail: encodeEmail
            }

            const forgot_password = "views/shop/etemplates/forgot_password.ejs";
            let eforgot_password = await utls.renderEjsFile(forgot_password, edata);

            var usermailOptions = {
                from: 'info@zoocialshop.ch',
                to: userEmail,
                subject: "Zoocialshop.ch - Bitte ändere dein Passwort über den angegebenen Link in der E-Mail",
                generateTextFromHtml: true,
                html: eforgot_password,
              };
    
              transporter.sendMail(usermailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
              });

              data = { status: true, message: "Gesendete Token-Bestätigung, bitte überprüfen Sie Ihre angegebene E-Mail-Adresse", email: userEmail };
        } else {
            data = { status: false, message: "Diese E-Mail Adresse ist ungültig oder wird nicht unterstützt." };
        }
        return data;
    },
    async forgotpassword(req, res) {
        var userdata = req.session.auth;
        var formdata = utls.parseQuery(req.body.formdata);
        var data = {};
        
        var rqData = {
            password: formdata.password
        }

        if (formdata.hasOwnProperty('id')) {
            let customer = await putWCApiAsync("customers/" + formdata.id, rqData);

            //console.log(customer);
            
            var transporter = nodemailer.createTransport({
                host: "asmtp.mail.hostpoint.ch",
                auth: {
                    user: "no-reply@zoocial.ch",
                    pass: "NoBes2019Mail!",
                },
            });
    
            edata = {
                userName: customer.first_name,
                userEmail: customer.email
            }
    
            const change_password = "views/shop/etemplates/change_password.ejs";
            let password_html = await utls.renderEjsFile(change_password, edata);

            var usermailOptions = {
                from: 'info@zoocialshop.ch',
                to: customer.email,
                subject: "Zoocialshop.ch - Passwort wurde aktualisiert",
                generateTextFromHtml: true,
                html: password_html,
            };
    
              transporter.sendMail(usermailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
              });

            data = {
                status: true,
                customer: customer,
                message: "Passwort erfolgreich aktualisiert",
            }
        } else {
            data = {
                status: false,
                message: "Entschuldigung!, Etwas ist falsch gelaufen",
            }
        }
        
        return data;
    },
    async commonforgotpassword(req, res) {
        var userdata = req.session.auth;
        var formdata = utls.parseQuery(req.body.formdata);
        var data = {};
        
        var rqData = {
            password: formdata.password
        }
        if (formdata.hasOwnProperty('id')) {
            //let customer = await putWCApiAsync("customers/" + formdata.id, rqData);
            var options = {
                url: "https://www.zoocial.ch/update-password",
            data: {authkey: 'HE612533629606',email: formdata.email,password: formdata.password},
            }
            var data = await utls.requestPostDataCommon(options);
            var customer = await data;
            var transporter = nodemailer.createTransport({
                host: "asmtp.mail.hostpoint.ch",
                auth: {
                    user: "no-reply@zoocial.ch",
                    pass: "NoBes2019Mail!",
                },
            });
    
            edata = {
                userName: customer.first_name,
                userEmail: customer.email
            }
            const change_password = "views/shop/etemplates/change_password.ejs";
            let password_html = await utls.renderEjsFile(change_password, edata);

            var usermailOptions = {
                from: 'info@zoocialshop.ch',
                to: customer.email,
                subject: "Zoocialshop.ch - Passwort wurde aktualisiert",
                generateTextFromHtml: true,
                html: password_html,
            };
    
              transporter.sendMail(usermailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
              });

            data = {
                status: true,
                customer: customer,
                message: "Passwort erfolgreich aktualisiert",
            }
        } else {
            data = {
                status: false,
                message: "Entschuldigung!, Etwas ist falsch gelaufen",
            }
        }
        
        return data;
    },
    async adressen_verwalten(req, res) {
        var userdata = req.session.auth;
        var shipaddresses = [];
        
        let customer = await getWCApiAsync("customers/"+ userdata.id);

        customer.meta_data.forEach((meta, idx) => {
            if(meta.key == 'shipaddresses' ) {
                shipaddresses = meta.value
            }
        });

        console.log(shipaddresses);
        console.log(customer.meta_data);

        let creqdata = {
            per_page: 50,
            page: 1
        };
        
        let categories = await getWCApiAsync("products/categories", creqdata);

        data = {
            categories: utls.getNestedChildren(categories, 0),
            userdata: req.session.auth,
            shipaddresses: shipaddresses,
        }
       // console.log(data);
        return data;
    },
    async commonadressen_verwalten(req, res) {
        var userdata = req.session.auth;
        var shipaddresses = [];
        var options = {
            url: "https://www.zoocial.ch/retrieve-all-shipping",
        
            data: {authkey: 'HE612533629606',user_id: userdata.id},
        }
        var reqData = await utls.requestPostDataCommon(options);
        let customer = await reqData;
        let creqdata = {
            per_page: 50,
            page: 1
        };
        let categories = await getWCApiAsync("products/categories", creqdata);
        data = {
            categories: utls.getNestedChildren(categories, 0),
            userdata: req.session.auth,
            shipaddresses: customer.shipping_address,
            metaInfo: {page: "shippingaddresses"},

        }
        //console.log(data);
        return data;
    },
    async newshipaddress(req) {
        var userdata = req.session.auth;
        var formdata = utls.parseQuery(req.body.formdata);
        var metasave = [];
        var shipaddresses = [];
        let customer = await getWCApiAsync("customers/"+ userdata.id);
        var shipping = {
            first_name: formdata.first_name,
            last_name: formdata.last_name,
            company: formdata.company,
            address_1: formdata.address_1,
            address_2: formdata.address_2,
            city: formdata.city,
            state: (formdata.stateshort != "") ? formdata.stateshort : "ZH",
            postcode: formdata.postcode,
            country: formdata.countryshort,
            phone: formdata.phone,
            mobile: formdata.mobile,
            active: formdata.active,
        };
        
        customer.meta_data.forEach((meta, idx) => {
            if(meta.key == 'shipaddresses') {
                shipaddresses = meta.value;
            }
        });

        console.log(formdata);
        console.log(shipping);
        console.log(shipaddresses);
        shipaddresses[parseInt(shipaddresses.length)] = shipping;
        console.log(shipaddresses);

        //return false;

        const rqdata = {
            meta_data: [{ key: 'shipaddresses', value: shipaddresses }],
        }
        let updcustomer = await putWCApiAsync("customers/" + customer.id, rqdata);
        console.log(updcustomer);
        var data = {};
        if (updcustomer.hasOwnProperty('message')) {
            data = { "status": false, "code": updcustomer.data.status, "error": updcustomer.code, "message": updcustomer.message };
        } else {
            var shipData = {
                shipaddresses: shipaddresses
            }
            const shipTemplate = "views/shop/modules/editshipaddress.ejs";
            let updhtml = await utls.renderEjsFile(shipTemplate, shipData);
            data = {"status": true, "message": "Lieferadresse erfolgreich erstellt", "updhtml": updhtml}
        }
        //return false;
        return data;
    },
    async commonnewshipaddress(req) {
        var userdata = req.session.auth;
        var formdata = utls.parseQuery(req.body.formdata);
        var metasave = [];
        var shipaddresses = [];
        var options = {
            url: "https://www.zoocial.ch/insert-new-shipping",
        
            data: {authkey:'HE612533629606',user_id:userdata.id,email:userdata.email,firstname:formdata.first_name,lastname:formdata.last_name,address:formdata.address_1,address_2:formdata.address_2,plz:formdata.postcode,ort:formdata.city,state:(formdata.stateshort != "") ? formdata.stateshort : "ZH",country:formdata.countryshort,telephone:formdata.phone,mobile:formdata.mobile,company_name:formdata.company,active:formdata.active},
        }
       // console.log("data check");
        var reqData = await utls.requestPostDataCommon(options);
        let updcustomer = await reqData;
        //console.log(updcustomer);
         var data = {};
        if (updcustomer.status == false) {
            data = { "status": false, "code": "", "error": "", "message": updcustomer.message };
        } else {
            var shipData = {
                shipaddresses: updcustomer.shipping_address
            }
            const shipTemplate = "views/shop/modules/editshipaddress.ejs";
            let updhtml = await utls.renderEjsFile(shipTemplate, shipData);
            data = {"status": true, "message": "Lieferadresse erfolgreich erstellt", "updhtml": updhtml}
        }
        
        return data;
    },
    async editshipaddress(req) {
        var userdata = req.session.auth;
        var formdata = utls.parseQuery(req.body.formdata);

        var metasave = [];
        var shipaddresses = [];

        let customer = await getWCApiAsync("customers/"+ userdata.id);

        var shipping = {
            first_name: formdata.first_name,
            last_name: formdata.last_name,
            company: formdata.company,
            address_1: formdata.address_1,
            address_2: formdata.address_2,
            city: formdata.city,
            state: (formdata.stateshort != "") ? formdata.stateshort : "ZH",
            postcode: formdata.postcode,
            country: formdata.countryshort,
            phone: formdata.phone,
            mobile: formdata.mobile,
            active: formdata.active,
        };

        customer.meta_data.forEach((meta, idx) => {
            if(meta.key == 'shipaddresses') {
                shipaddresses = meta.value;
            }
        });

        shipaddresses[parseInt(formdata.itemkey)] = shipping;

        console.log(formdata);
        console.log("++++++ Shipping ++++++");
        console.log(shipping);
        console.log("++++++ Shipping Addresses++++++");
        console.log(shipaddresses);

        //return false;

        const rqdata = {
            meta_data: [{ key: 'shipaddresses', value: shipaddresses }],
        }
        let updcustomer = await putWCApiAsync("customers/" + customer.id, rqdata);
        //console.log(updcustomer);
        var data = {};
        if (updcustomer.hasOwnProperty('message')) {
            data = { "status": false, "code": updcustomer.data.status, "error": updcustomer.code, "message": updcustomer.message };
        } else {
            var shipData = {
                shipaddresses: shipaddresses
            }
            const shipTemplate = "views/shop/modules/editshipaddress.ejs";
            let updhtml = await utls.renderEjsFile(shipTemplate, shipData);
            data = {"status": true, "message": "Lieferadresse Erfolgreich aktualisiert", "updhtml": updhtml}
        }
        //return false;
        return data;
    },
    async commoneditshipaddress(req) {
        var userdata = req.session.auth;
        var formdata = utls.parseQuery(req.body.formdata);

        var metasave = [];
        var shipaddresses = [];
        var options = {
            url: "https://www.zoocial.ch/update-shipping-details",
        
            data: {authkey:'HE612533629606',shipping_id:formdata.itemkey,user_id:userdata.id,email:userdata.email,firstname:formdata.first_name,lastname:formdata.last_name,address:formdata.address_1,address_2:formdata.address_2,plz:formdata.postcode,ort:formdata.city,state:(formdata.stateshort != "") ? formdata.stateshort : "ZH",country:formdata.countryshort,telephone:formdata.phone,mobile:formdata.mobile,company_name:formdata.company,active:formdata.active},
        }
        var reqData = await utls.requestPostDataCommon(options);
        let updcustomer = await reqData;
        var data = {};
        if (updcustomer.status == false) {
            data = { "status": false, "code": "", "error": "", "message": updcustomer.message };
        } else {
            var shipData = {
                shipaddresses: updcustomer.shipping_address
            }
            const shipTemplate = "views/shop/modules/editshipaddress.ejs";
            let updhtml = await utls.renderEjsFile(shipTemplate, shipData);
            data = {"status": true, "message": "Lieferadresse Erfolgreich aktualisiert", "updhtml": updhtml}
        }
        return data;
    },
    async removeshipaddress(req) {
        var userdata = req.session.auth;
        var deletekey = parseInt(req.body.key);
        var shipaddresses = [];
        var finalmeta = [];

        let customer = await getWCApiAsync("customers/"+ userdata.id);

        customer.meta_data.forEach((meta, idx) => {
            if(meta.key == 'shipaddresses') {
                shipaddresses = meta.value;
            }
        });

        shipaddresses.forEach((meta, idx) => {
            if(deletekey != idx) {
                finalmeta.push(meta);
            }
        });

        //console.log(deletekey);
        //console.log("++++++ Shipping Addresses++++++");
        //console.log(shipaddresses);
        //console.log(finalmeta);
        //return false;

        const rqdata = {
            meta_data: [{ key: 'shipaddresses', value: finalmeta }],
        }
        let updcustomer = await putWCApiAsync("customers/" + customer.id, rqdata);
        console.log(updcustomer);
        var data = {};
        if (updcustomer.hasOwnProperty('message')) {
            data = { "status": false, "code": updcustomer.data.status, "error": updcustomer.code, "message": updcustomer.message };
        } else {
            var shipData = {
                shipaddresses: finalmeta
            }
            const shipTemplate = "views/shop/modules/editshipaddress.ejs";
            let updhtml = await utls.renderEjsFile(shipTemplate, shipData);

            console.log(updhtml);

            data = {"status": true, "message": "Lieferadresse erfolgreich entfernt", "updhtml": updhtml}
        }
        //return false;
        return data;
    },
    async zoocialanmelden(req) {
        var userinput = {};
        var userinfo = {};
        console.log("zoociallogin");
        
        var options = {
            url: "https://www.zoocial.ch/check-zoocial-login",
            data: {authkey: "HE612533629606"},
          }
        var reqData = await utls.requestPostDataCommon(options);
        var data = await reqData;
        //console.log(options);
        //console.log(data);
       // var data = JSON.parse(JSON.stringify(result));
        //console.log(data);
         if(data.status == true) {
            var cpass = Math.floor(100000 + Math.random() * 900000)
            cpass = cpass.toString().substring(0, 4);
            var vData = {
                email: data.email
              }
            Checkzcustomer = await getWCApiAsync("customers", vData);
              console.log("-------------zcustomer check Admelden-------------");
              if(Checkzcustomer == "")
              {
                console.log("Admelden zshop new");
                const cdata = {
                    email: data.email,
                    password: cpass,
                };
                let zcustomer = await postWCApiAsync("customers", cdata);
              }
              else{
                console.log("Admelden zshop old ");
              }
              console.log("-------------zcustomer check Admelden-------------");
           userinfo = {
                id: data.id,
                username: data.username,
                email: data.email,
                role: data.user_role,
                displayname: "",
                billing: data.billing_address,
                shipping: data.shipping_address,
                meta_data: data.meta_data
                }
                //req.session.loguser = userinfo;
                req.session.auth = userinfo;
            
            return { "status": true, "error": null, "message": "erfolgreich angemeldet", "redirect": "/mein_ubersicht" };
        }
        if(data.status == false && data.type=="profilestatus")
        {
            return {
                "status": false,
                "error": true,
                "message": data.message
            };
        }
        if(data.status == false && data.type=="emailvarify")
        {
            return {
                "status": false,
                "error": true,
                "message": data.message
            };
        }
        if(data.status == false && data.type=="usernotlogin")
        {
            return {
                "status": false,
                "error": true,
                "message": "Überprüfe deine Emailadresse noch einmal"
            };
        }
       /* var data = {};
        data = {"status": false, "message": "testing"}
        return data;*/
    },
    async commonremoveshipaddress(req) {
        var userdata = req.session.auth;
        var deletekey = parseInt(req.body.key);
        var shipaddresses = [];
        var finalmeta = [];
        console.log("deletekey"+deletekey);
        var options = {
            url: "https://www.zoocial.ch/delete-shipping-info",
        
            data: {authkey:'HE612533629606',shipping_id:deletekey,user_id:userdata.id},
        }
        
        //console.log(options);
        //console.log("data check");
        var reqData = await utls.requestPostDataCommon(options);
        let updcustomer = await reqData;
        //console.log(updcustomer);
        var data = {};
        if (updcustomer.status == false) {
            data = { "status": false, "code": "", "error": "", "message": updcustomer.message };
        } else {
            var shipData = {
                shipaddresses: updcustomer.shipping_address
            }
            const shipTemplate = "views/shop/modules/editshipaddress.ejs";
            let updhtml = await utls.renderEjsFile(shipTemplate, shipData);

            data = {"status": true, "message": "Lieferadresse erfolgreich entfernt", "updhtml": updhtml}
        }
        //return false;
        return data;
    },
    
    async newsletterPost(req) {

        var data = {};
        let formdata = utls.parseQuery(req.body.formdata);
        var mailformat = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if(formdata.email == "") {
            data = { status: false, message: "E-Mail überprüfen Kann nicht leer sein" }
            return data;
        }
        if(!mailformat.test(formdata.email)) {
            data = { status: false, message: "Bitte geben Sie die richtige E-Mail" }
            return data;
        }
        let options = {
            url: "https://zshop.dev/wp-json/newsletter/v1/subscribe",
            body: formdata,
        }
        let newsletter = await utls.newsletterPost(options);
        if(newsletter.status) {
            data = {status:true, message: "Vielen Dank für deine Newsletteranmeldung"};
        } else {
            data = {status:false, message: "Deine E-Mail Adresse ist bereits registriert"};
        }
        return data;
    },
}

module.exports = Authorization;