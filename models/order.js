Order = {

    async lists(req) {

        let userdata = req.session.auth;

        console.log(userdata);

        var orders = [];
        var vData = {
          email: userdata.email
        }
        //console.log(userdata);
        console.log("vdata");
        console.log(vData);
        zcustomer = await getWCApiAsync("customers", vData);
        console.log("---------------getzcustomer-------------------");
        console.log(zcustomer[0].id);
        console.log(zcustomer);
        console.log("---------------getzcustomer-------------------");
        const inputdata = {
        customer: zcustomer[0].id
       }
        let creqdata = {
            per_page: 50,
            page: 1
        };

        let categories = await getWCApiAsync("products/categories", creqdata);
        orders = await getWCApiAsync("orders", inputdata);
        
        console.log(orders);  

         var data = {
             status: true,
             categories: utls.getNestedChildren(categories, 0),
             orders: orders,
             userdata: userdata,
         }
         
        return data;
    },
    async orderSuccess(req) {

        var orderid = parseInt(req.params.orderid);
        var payment_status = req.query.state;
        var payment_type = "";
        var transaction_id = req.session.transaction_id != undefined ? req.session.transaction_id : "";
        
        var mwst_2_5 = 0;
        var mwst_7_7 = 0;
        var total_2_5 = 0;
        var total_7_7 = 0;
        var vat_plustotal_2_5 = 0;
        var vat_plustotal_7_7 = 0;
        var remiAvail = false;

        var orderdetails = await getWCApiAsync("orders/" + orderid);

        if(req.query.hasOwnProperty('paymenttype')) {
          payment_type = req.query.paymenttype;
        } else {
          if(orderdetails.hasOwnProperty('transaction_id') && orderdetails.transaction_id != "") {
            console.log(orderdetails.transaction_id);
            var options = {
              url: "https://postfinance.zoocial.ch/shopstatus.php?id="+orderdetails.transaction_id,
              qs: { id: orderdetails.transaction_id },
              data: {},
            }
            var reqData = await utls.requestGetData(options);
            var payres = await reqData;
            payment_type = payres.response.payment_status
          } else {
            payment_type = "VISA";
          }
        }

        orderdetails.line_items.forEach(function(item, el) {
            if(item.tax_class == "mwst-2-5") {
              mwst_2_5 += ((parseFloat(item.total_tax) + parseFloat(item.total)) / 102.5) * 2.5;
              total_2_5 += parseFloat(item.total);
              vat_plustotal_2_5 += (parseFloat(item.total) + parseFloat(item.total_tax));
            }
            if(item.tax_class == "mwst-7-7") {
              mwst_7_7 += ((parseFloat(item.total_tax) + parseFloat(item.total)) / 107.7) * 7.7;
              total_7_7 += parseFloat(item.total);
              vat_plustotal_7_7 += (parseFloat(item.total) + parseFloat(item.total_tax));
            }

            item.meta_data.forEach((meta, el)=> {
              if(meta.key == "remi") {
                remiAvail = true;
                return false;
              }				
            });

          });

          if(parseFloat(orderdetails.shipping_total) > 0 && !remiAvail) {
              if(mwst_7_7 > 0) {
                  mwst_7_7 += (7.50/107.7) * 7.7;
              } else {
                  mwst_2_5 += (7.50/102.5) * 2.5;
              }
          }
      
        console.log(remiAvail);
        console.log(mwst_2_5);
        console.log(mwst_7_7);
        
        if(orderdetails.status == "pending" && payment_status == "SUCCESSFUL") {

            var transporter = nodemailer.createTransport({
                host: "asmtp.mail.hostpoint.ch",
                auth: {
                    user: "no-reply@zoocial.ch",
                    pass: "NoBes2019Mail!",
                },
            });
          
            let orderData = {
                order: orderdetails,
                mwst_2_5: mwst_2_5,
                total_2_5: total_2_5,
                vat_plustotal_2_5: vat_plustotal_2_5,
                mwst_7_7: mwst_7_7,
                total_7_7: total_7_7,
                vat_plustotal_7_7: vat_plustotal_7_7,
                userdata: req.session.auth,
                payment_type: payment_type,
            };
          
            const invoice_pdf_template = "views/shop/etemplates/invoice.ejs";
            const invoice_template = "views/shop/etemplates/invoice_template.ejs";

            let invoicehtml = await utls.renderEjsFile(invoice_pdf_template, orderData);
            let invoice_tmphtml = await utls.renderEjsFile(invoice_template, orderData);
          
            var invoicepdfname = orderdetails.number+"_Rechnung.pdf";
            var config = {format: 'a4'};
            
            pdf.create(invoicehtml, config).toFile('assets/orders/'+invoicepdfname, function (error, response) {
                if (error){
                    console.log(error);
                } else {
                    console.log(response);  
          
                    var usermailOptions = {
                      from: 'info@zoocialshop.ch',
                      to: orderdetails.billing.email,
                      subject: "Zoocialshop.ch - Deine Bestellung / Votre commande #"+ orderdetails.number,
                      attachments: [{
                        filename: invoicepdfname,
                        path: sitePath+'/assets/orders/'+invoicepdfname,
                        contentType: 'application/pdf'
                      }],
                      generateTextFromHtml: true,
                      html: invoice_tmphtml,
                    };
          
                    transporter.sendMail(usermailOptions, function (error, info) {
                      if (error) console.log(error);
                      else console.log("Email sent: " + info.response);
                    });
          
                }
            });

          const admin_pdf_template = "views/shop/etemplates/order.ejs";
          const admin_template = "views/shop/etemplates/order_template.ejs";

            let orderhtml = await utls.renderEjsFile(admin_pdf_template, orderData);
            let order_tmphtml = await utls.renderEjsFile(admin_template, orderData);
          
            var orderpdfname = orderdetails.number+"_Bestellung.pdf";
            var config = {format: 'a4'};  

            pdf.create(orderhtml, config).toFile('assets/orders/'+orderpdfname, function (error, response) {
              if (error){
                  console.log(error);
              } else {
                  console.log(response);  
        
                  var adminmailOptions = {
                    from: 'info@zoocialshop.ch',
                    to: 'orders@covetrus.ch',
                    //to: 'info@zoocialshop.ch',
                    cc: 'info@zoocialshop.ch',
                    subject: "Bestellung / Commander #"+ orderdetails.number,
                    attachments: [{
                      filename: orderpdfname,
                      path: sitePath+'/assets/orders/'+orderpdfname,
                      contentType: 'application/pdf'
                    }],
                    generateTextFromHtml: true,
                    html: order_tmphtml,
                  };
                 
                  transporter.sendMail(adminmailOptions, function (error, info) {
                    if (error) console.log(error);
                    else console.log("Email sent: " + info.response);
                  });

              }
          });

          console.log("Transaction ID " + req.session.transaction_id);

          const updatedata = {
            status: "processing",
            transaction_id: (req.session.transaction_id != "") ? req.session.transaction_id.toString() : "0"
          };
    
          var updateorder = await postWCApiAsync("orders/" + orderid, updatedata);
          console.log(updateorder);

        }

        req.session.cartitems = [];
        req.session.transaction_id = "";

        var data = {};
        let creqdata = {
            per_page: 50,
            page: 1
        };
        let categories = await getWCApiAsync("products/categories", creqdata);
        
        //console.log(orderdetails);
        if(orderdetails.code === 'woocommerce_rest_shop_order_invalid_id') {
            data = {
                status:false,
                orderdetails: orderdetails,
                categories: utls.getNestedChildren(categories, 0),
            }
        } else {
            data = {
                status:true,
                orderdetails: orderdetails,
                categories: utls.getNestedChildren(categories, 0),
                mwst_2_5: mwst_2_5,
                total_2_5: total_2_5,
                vat_plustotal_2_5: vat_plustotal_2_5,
                mwst_7_7: mwst_7_7,
                total_7_7: total_7_7,
                vat_plustotal_7_7: vat_plustotal_7_7,
                payment_type: payment_type,
                userdata: req.session.auth,
            }
        }

        return data;
    },
    async orderPdfs(req) {

      var orderid = parseInt(req.params.orderid);
      var payment_type = "";
      var data = {};
      
      var mwst_2_5 = 0;
      var mwst_7_7 = 0;
      var total_2_5 = 0;
      var total_7_7 = 0;
      var vat_plustotal_2_5 = 0;
      var vat_plustotal_7_7 = 0;
      var remiAvail = false;

      var orderdetails = await getWCApiAsync("orders/" + orderid);

      if(req.query.hasOwnProperty('paymenttype')) {
        payment_type = req.query.paymenttype;
      } else {
        if(orderdetails.hasOwnProperty('transaction_id') && orderdetails.transaction_id != "") {
          console.log(orderdetails.transaction_id);
          var options = {
            url: "https://postfinance.zoocial.ch/shopstatus.php?id="+orderdetails.transaction_id,
            qs: { id: orderdetails.transaction_id },
            data: {},
          }
          var reqData = await utls.requestGetData(options);
          var payres = await reqData;
          payment_type = payres.response.payment_status
        } else {
          payment_type = "VISA";
        }
      }

      orderdetails.line_items.forEach(function(item, el) {
          if(item.tax_class == "mwst-2-5") {
            mwst_2_5 += ((parseFloat(item.total_tax) + parseFloat(item.total)) / 102.5) * 2.5;
            total_2_5 += parseFloat(item.total);
            vat_plustotal_2_5 += (parseFloat(item.total) + parseFloat(item.total_tax));
          }
          if(item.tax_class == "mwst-7-7") {
            mwst_7_7 += ((parseFloat(item.total_tax) + parseFloat(item.total)) / 107.7) * 7.7;
            total_7_7 += parseFloat(item.total);
            vat_plustotal_7_7 += (parseFloat(item.total) + parseFloat(item.total_tax));
          }

          item.meta_data.forEach((meta, el)=> {
            if(meta.key == "remi") {
              remiAvail = true;
              return false;
            }				
          });

        });

        if(parseFloat(orderdetails.shipping_total) > 0 && !remiAvail) {
            if(mwst_7_7 > 0) {
                mwst_7_7 += (7.50/107.7) * 7.7;
            } else {
                mwst_2_5 += (7.50/102.5) * 2.5;
            }
        }
    
      console.log(remiAvail);
      console.log(mwst_2_5);
      console.log(mwst_7_7);
      
      if(orderdetails.status == "processing") {

          var transporter = nodemailer.createTransport({
              host: "asmtp.mail.hostpoint.ch",
              auth: {
                  user: "no-reply@zoocial.ch",
                  pass: "NoBes2019Mail!",
              },
          });
        
          let orderData = {
              order: orderdetails,
              mwst_2_5: mwst_2_5,
              total_2_5: total_2_5,
              vat_plustotal_2_5: vat_plustotal_2_5,
              mwst_7_7: mwst_7_7,
              total_7_7: total_7_7,
              vat_plustotal_7_7: vat_plustotal_7_7,
              userdata: req.session.auth,
              payment_type: payment_type,
          };
        
          const invoice_pdf_template = "views/shop/etemplates/invoice.ejs";
          const invoice_template = "views/shop/etemplates/invoice_template.ejs";

          let invoicehtml = await utls.renderEjsFile(invoice_pdf_template, orderData);
          let invoice_tmphtml = await utls.renderEjsFile(invoice_template, orderData);
        
          var invoicepdfname = orderdetails.number+"_Rechnung.pdf";
          var config = {format: 'a4'};
          
          pdf.create(invoicehtml, config).toFile('assets/orders/'+invoicepdfname, function (error, response) {
              if (error){
                  console.log(error);
              } else {
                  console.log(response);  
        
                  var usermailOptions = {
                    from: 'info@zoocialshop.ch',
                    to: orderdetails.billing.email,
                    subject: "Zoocialshop.ch - Deine Bestellung / Votre commande #"+ orderdetails.number,
                    attachments: [{
                      filename: invoicepdfname,
                      path: sitePath+'/assets/orders/'+invoicepdfname,
                      contentType: 'application/pdf'
                    }],
                    generateTextFromHtml: true,
                    html: invoice_tmphtml,
                  };
        
                  transporter.sendMail(usermailOptions, function (error, info) {
                    if (error) console.log(error);
                    else console.log("Email sent: " + info.response);
                  });
        
              }
          });

        const admin_pdf_template = "views/shop/etemplates/order.ejs";
        const admin_template = "views/shop/etemplates/order_template.ejs";

          let orderhtml = await utls.renderEjsFile(admin_pdf_template, orderData);
          let order_tmphtml = await utls.renderEjsFile(admin_template, orderData);
        
          var orderpdfname = orderdetails.number+"_Bestellung.pdf";
          var config = {format: 'a4'};  

          pdf.create(orderhtml, config).toFile('assets/orders/'+orderpdfname, function (error, response) {
            if (error){
                console.log(error);
            } else {
                console.log(response);  
      
                var adminmailOptions = {
                  from: 'info@zoocialshop.ch',
                  //to: 'orders@covetrus.ch',
                  //to: 'info@zoocialshop.ch',
                  cc: 'info@zoocialshop.ch',
                  subject: "Bestellung / Commander #"+ orderdetails.number,
                  attachments: [{
                    filename: orderpdfname,
                    path: sitePath+'/assets/orders/'+orderpdfname,
                    contentType: 'application/pdf'
                  }],
                  generateTextFromHtml: true,
                  html: order_tmphtml,
                };
               
                transporter.sendMail(adminmailOptions, function (error, info) {
                  if (error) console.log(error);
                  else console.log("Email sent: " + info.response);
                });
            }
        });

        data = { status: true, message: "pdfs Generates" };

      } else {

        data = { status: false, message: "Not Valid Order Statuc" };

      }

      return data;

  },
    async orderPending(req) {

      var orderid = parseInt(req.params.orderid);
      
      console.log(req.session.auth);
      console.log(orderid);

      var mwst_2_5 = 0;
      var mwst_7_7 = 0;
      var total_2_5 = 0;
      var total_7_7 = 0;
      var vat_plustotal_2_5 = 0;
      var vat_plustotal_7_7 = 0;
      var remiAvail = false;

      var orderdetails = await getWCApiAsync("orders/" + orderid);

      orderdetails.line_items.forEach(function(item, el) {
          console.log(item);
          if(item.tax_class == "mwst-2-5") {
            mwst_2_5 += ((parseFloat(item.total_tax) + parseFloat(item.total)) / 102.5) * 2.5;
            total_2_5 += parseFloat(item.total);
            vat_plustotal_2_5 += (parseFloat(item.total) + parseFloat(item.total_tax));
          }
          if(item.tax_class == "mwst-7-7") {
            mwst_7_7 += ((parseFloat(item.total_tax) + parseFloat(item.total)) / 107.7) * 7.7;
            total_7_7 += parseFloat(item.total);
            vat_plustotal_7_7 += (parseFloat(item.total) + parseFloat(item.total_tax));
          }

          item.meta_data.forEach((meta, el)=> {
            if(meta.key == "remi") {
              remiAvail = true;
              return false;
            }				
          });

        });
      
        if(parseFloat(orderdetails.shipping_total) > 0 && !remiAvail) {
          if(mwst_7_7 > 0) {
            mwst_7_7 += (7.50/107.7) * 7.7;
          } else {
            mwst_2_5 += (7.50/102.5) * 2.5;
          }
      }

      var data = {};
      let creqdata = {
          per_page: 50,
          page: 1
      };
      let categories = await getWCApiAsync("products/categories", creqdata);
      
      //console.log(orderdetails);
      if(orderdetails.code === 'woocommerce_rest_shop_order_invalid_id') {
          data = {
              status:false,
              orderdetails: orderdetails,
              categories: utls.getNestedChildren(categories, 0),
          }
      } else {
          data = {
              status:true,
              orderdetails: orderdetails,
              categories: utls.getNestedChildren(categories, 0),
              mwst_2_5: mwst_2_5,
              total_2_5: total_2_5,
              vat_plustotal_2_5: vat_plustotal_2_5,
              mwst_7_7: mwst_7_7,
              total_7_7: total_7_7,
              vat_plustotal_7_7: vat_plustotal_7_7,
          }
      }

      return data;
    },
  async orderCancel(req) {

    var orderid = parseInt(req.params.orderid);
    
    console.log(req.session.auth);
    console.log(orderid);

    var mwst_2_5 = 0;
    var mwst_7_7 = 0;
    var total_2_5 = 0;
    var total_7_7 = 0;
    var vat_plustotal_2_5 = 0;
    var vat_plustotal_7_7 = 0;
    var remiAvail = false;

    var orderdetails = await getWCApiAsync("orders/" + orderid);

    orderdetails.line_items.forEach(function(item, el) {
        console.log(item);
        if(item.tax_class == "mwst-2-5") {
          mwst_2_5 += ((parseFloat(item.total_tax) + parseFloat(item.total)) / 102.5) * 2.5;
          total_2_5 += parseFloat(item.total);
          vat_plustotal_2_5 += (parseFloat(item.total) + parseFloat(item.total_tax));
        }
        if(item.tax_class == "mwst-7-7") {
          mwst_7_7 += ((parseFloat(item.total_tax) + parseFloat(item.total)) / 107.7) * 7.7;
          total_7_7 += parseFloat(item.total);
          vat_plustotal_7_7 += (parseFloat(item.total) + parseFloat(item.total_tax));
        }

        item.meta_data.forEach((meta, el)=> {
          if(meta.key == "remi") {
            remiAvail = true;
            return false;
          }				
        });

      });
    
      if(parseFloat(orderdetails.shipping_total) > 0 && !remiAvail) {
        if(mwst_7_7 > 0) {
          mwst_7_7 += (7.50/107.7) * 7.7;
        } else {
          mwst_2_5 += (7.50/102.5) * 2.5;
        }
    }

    if(orderdetails.status == "pending") {
      const updatedata = {
        status: "cancelled"
      };
      var updateorder = await postWCApiAsync("orders/" + orderid, updatedata);
      console.log(updateorder);
    }

    var data = {};
    let creqdata = {
        per_page: 50,
        page: 1
    };
    let categories = await getWCApiAsync("products/categories", creqdata);
    
    //console.log(orderdetails);
    if(orderdetails.code === 'woocommerce_rest_shop_order_invalid_id') {
        data = {
            status:false,
            orderdetails: orderdetails,
            categories: utls.getNestedChildren(categories, 0),
        }
    } else {
        data = {
            status:true,
            orderdetails: orderdetails,
            categories: utls.getNestedChildren(categories, 0),
            mwst_2_5: mwst_2_5,
            total_2_5: total_2_5,
            vat_plustotal_2_5: vat_plustotal_2_5,
            mwst_7_7: mwst_7_7,
            total_7_7: total_7_7,
            vat_plustotal_7_7: vat_plustotal_7_7,
        }
    }

    return data;
},
  async pendingPaymentProcess(req) {
    var formdata = utls.parseQuery(req.body.formdata);
    var orderID = formdata.orderid;

    var order = await getWCApiAsync("orders/" + orderID);

    if (order.hasOwnProperty('message')) {
      return { "status": false, "code": order.data.status, "error": order.message, "message": order.message };
    }
    
    if(order.status == "pending") {
      var options = {
          url: "https://postfinance.zoocial.ch/pendingshop.php",
          data: { amount: parseFloat(order.total), order_id: order.id, order_key: order.order_key },
      }
      var reqData = await utls.requestPostData(options);
      var payres = await reqData;
      var paymentUrl = payres.response.url + '&amount=' + payres.response.amount + '&transaction_id=' + payres.response.transaction_id + '&order_id=' + payres.response.order_id + '&order_key=' + payres.response.order_key;
      payres.paymentUrl = paymentUrl;
      payres.message = "Zahlungsabwicklung, du wirst gleich weitergeleitet";
      req.session.transaction_id = payres.response.transaction_id != undefined ? (payres.response.transaction_id != "" ? payres.response.transaction_id : '') : '';
      app.locals.transaction_id = payres.response.transaction_id != undefined ? (payres.response.transaction_id != "" ? payres.response.transaction_id : '') : '';
    }
    
    if(payres.status) {
      return payres;
    } else {
      return { "status": false, "message": "Etwas ist schief gelaufen" };
    }
  }

}

module.exports = Order;
