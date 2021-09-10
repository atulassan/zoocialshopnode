var session = require("express-session");
var cookieSession = require("cookie-session");
var express = require("express");
var app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const flash = require("express-flash-messages");
const compression = require("compression");
const { base64encode, base64decode } = require('nodejs-base64');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const compress_images = require("compress-images");
var UAParser = require('ua-parser-js');
global._ = require("lodash");
global.fetch = require("node-fetch");
global.qs = require("querystrings");
global.path = require("path");
global.os = require("os");
global.request = require("request");
global.https = require("https");
global.httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});
global.ejs = require('ejs');
global.nodemailer = require("nodemailer");
global.pdf = require('html-pdf');
global.fs = require('fs');
global.sitePath=__dirname;

app.use(
  cookieSession({
    name: "session",
    keys: ["secret"],
    httpOnly: false,
    // Cookie Options
    //maxAge: 1000 * 3600 * 24 * 30 * 2, //1000(milsecs) * 3600(mins) * 24(hours) * 30(days) * 2(months)
    maxAge: 1000 * 3600 * 2,
  })
);

//console.log(os);
//console.log(os.hostname());

app.use(function (req, res, next) {

  /*var parser = new UAParser();
  var browserName = parser.setUA(req.headers['user-agent']).getBrowser().name;

  if (browserName === 'IE') {
    res.redirect('/browser-check');
    res.end();
  }*/

  //req.session = null;
  // session id
  if (!req.session.user_uniqid) {
    req.session.user_uniqid = utls.getToken();
  }
  // favourite items
  //req.session.favitems = [];
  if (req.session.user_uniqid && !utls.isEmpty(req.session.favitems)) {
    req.session.favitems = [];
  }
  // create cart items
  //req.session.cartitems = [];
  if (req.session.user_uniqid && !utls.isEmpty(req.session.cartitems)) {
    req.session.cartitems = [];
  }

  if (typeof req.session.auth == "undefined") {
    req.session.auth = {};
  }

  if (typeof req.session.order_id == "undefined") {
    req.session.order_id = "";
  }

  if (typeof req.session.transaction_id == "undefined") {
    req.session.transaction_id = "";
  }

  if (typeof req.session.coupon == "undefined") {
    req.session.coupon = {};
  }

  if (typeof req.session.ptype == "undefined") {
    req.session.ptype = "";
  }

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE,GET,PATCH,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  next();
});

app.use(flash());

//app.locals.favitems = req.session.favitems;

/**
 * Store database credentials in a separate config.js file
 * Load the file/module and its values
 */
global.config = require("./config");
global.utls = require("./utils/utils");

/*var dbOptions = {
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  port: config.db.port,
  database: config.db.db,
  charset: config.db.charset,
};*/

/*var dbOptions = {
  host: 'localhost', 	// database host
	user: 'root', 		// your database username
	password: "", 		// your database password
	port: 3306, 		// default MySQL port
	database: 'bk_4bees', 		// your database name
	charset: 'utf8_general_ci' // charset
};

global.conn = mysql.createConnection(dbOptions);

//connect to database
conn.connect((err) => {
   if (err) {
      throw err;
   }
   console.log('Mysql Connected...');
});*/

// port number
var port = process.env.PORT || config.server.port;

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));
// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

var jsondata = { test: "testingnew" };

global.wcapi = new WooCommerceRestApi({
  url: config.wcsettings.url,
  consumerKey: config.wcsettings.consumerKey,
  consumerSecret: config.wcsettings.consumerSecret,
  version: config.wcsettings.version,
  queryStringAuth: true,
});

global.devWcapi = new WooCommerceRestApi({
  url: "https://zshopdev.ch/",
  consumerKey: "ck_fcccb2eb854ab2d3eab6845dac30458cf4c9bd17",
  consumerSecret: "cs_a8a9ee8c6679d97aa457333c260a736411bd1894",
	version: "wc/v3",
	queryStringAuth: true
});

const oneYear = 1 * 365 * 24 * 60 * 60 * 1000;
app.use(compression()); // Compress all Responses
app.use(express.static(__dirname + "/assets", { maxAge: oneYear })); //dirname gives the current directory
app.set("view engine", "ejs"); // set the view engine to ejs

app.get("/", async function (req, res) {
  
  //let wcProduct = await getWCApiAsync("products", { sku:'629526', images:  "both" });
  //console.log('NO Image Prodcct++++++++++', wcProduct);

  if (req.session.auth.hasOwnProperty("id")) {
    console.log("user data avail");
  }
  
  console.log("+++++++++++++++");
  console.log(req.session.user_uniqid);
  console.log(req.session.favitems);
  console.log(req.session.cartitems);
  console.log(req.session.auth);
  console.log(req.session.transaction_id);
  console.log(req.session.coupon);
  console.log("+++++++++++++++");

  let creqdata = {
    per_page: 10,
    //orderby: "menu_order",
    //menu_order:1,
    page: 1,
    hide_empty: true,
  };

  //let imgSize = await utls.imageSize('https://zoocialshop.ch/images/hund-1.jpg');
  //console.log(imgSize);

  let categories = await getWCApiAsync("products/categories", creqdata);

  console.log('Categories', categories);

  data = {
    //categories: utls.getNestedChildren(categories, 0),
    categories: "",
    metaInfo: {page: "home"},
  };
  req.flash("notify", "Redirect successful!");

  var parser = new UAParser();
  var browserName = parser.setUA(req.headers['user-agent']).getBrowser().name;
  
  if (browserName === 'IE') {
      res.redirect("/browser-not-support");
  } else {
      res.render("shop/pages/homepage", data);
  }
  
});

app.get('/browser-not-support', function(req, res) {
  res.render('shop/pages/browser-check', {
      tabtitle: 'Zoocial shop | Browser check'
  });
});


app.get("/payment-check", function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader("Access-Control-Allow-Origin", "*");
  console.log(req.query);
  payment_url = req.query.data != undefined ? req.query.data != "" ? req.query.data : "" : "";
  transac_id = req.query.transaction_id != undefined ? req.query.transaction_id != "" ? req.query.transaction_id : "" : "";
  order_id = req.query.order_id != undefined ? req.query.order_id != "" ? req.query.order_id : "" : "";
  req.session.transaction_id = transac_id;
  app.locals.transaction_id = transac_id;
  req.session.order_id = order_id;
  app.locals.order_id = order_id;
  console.log(req.session.transaction_id);
  console.log(req.session.order_id);
  res.redirect(payment_url);
});

app.get("/payment-state-check", function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader("Access-Control-Allow-Origin", "*");
  var transaction_id = req.session.transaction_id != undefined ? req.session.transaction_id : app.locals.transaction_id;
  var order_id = req.session.order_id != undefined ? req.session.order_id : app.locals.order_id;
  var url = "https://postfinance.zoocial.ch/shop.php?id=" + transaction_id + "&order_id=" + order_id;
  res.redirect(url);
});

app.get("/payment-state", function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader("Access-Control-Allow-Origin", "*");
  console.log(req.query);
  var order_id = req.query.order_id;
  var order_key = req.query.order_key;
  //var transaction_id = req.session.transaction_id;
  var transaction_id = req.session.transaction_id != undefined ? req.session.transaction_id : app.locals.transaction_id;
  console.log(transaction_id);
  var url = "https://postfinance.zoocial.ch/shop.php?id=" + transaction_id + "&order_id=" + order_id;
  res.redirect(url);
});

app.get("/pending-state", function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader("Access-Control-Allow-Origin", "*");
  console.log(req.query);
  var order_id = req.query.order_id;
  var order_key = req.query.order_key;
  //var transaction_id = req.session.transaction_id;
  var transaction_id = req.session.transaction_id != undefined ? req.session.transaction_id : app.locals.transaction_id;
  console.log(transaction_id);
  var url = "https://postfinance.zoocial.ch/pendingshop.php?id=" + transaction_id + "&order_id=" + order_id;
  res.redirect(url);
});

app.get("/imageProcess", async (req, res) => {
  //var itemUrl = "https://navshop.provet.ch/api/v1/item/HE6140";
  //let reqData = await utls.navisionGetData({ url: itemUrl, key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' });

  let imgUrl = 'https://covetrus.ixapi.ch/629526.jpg';
  let imgName = imgUrl.split('/').pop();
  console.log(imgName);

  const response = await fetch(imgUrl);
  const buffer = await response.buffer();
  fs.writeFile(`assets/temp/${imgName}`, buffer, async () => {
    console.log('finished downloading!');
    const file = await imagemin([`assets/temp/${imgName}`], { 
      destination: 'assets/temp',
      plugins: [
          imageminJpegtran(),
          imageminPngquant({
              quality: [0.6, 0.8]
          })
      ]
  });
    if(file.length > 0) {
      console.log(file);
      fs.unlink(`assets/temp/${imgName}`, (err)=> {
        if (err) {
          console.error(err)
        } else {
          console.log("removed Successfully");
        }
      });
    }
  });
  
    /*(async () => {
      const files = await imagemin(['assets/orgimages/*.{jpg,png}'], {
          destination: 'assets/compress',
          plugins: [
              imageminJpegtran(),
              imageminPngquant({
                  quality: [0.6, 0.8]
              })
          ]
      });
   
      console.log(files);
      //=> [{data: <Buffer 89 50 4e …>, destinationPath: 'build/images/foo.jpg'}, …]
  })();*/

  res.send("testing");
});

app.get("/sandbox", async function (req, res) {
  res.setHeader("Content-Type", "application/json");

  /*var options = { method: 'POST',
                  "rejectUnauthorized": false, 
                  url: 'https://postfinance.zoocial.ch/shop.php',
  headers:  { 'postman-token': '7dd2cdb5-f34d-bcd0-14ed-a0767c4fcd42',
     'cache-control': 'no-cache',
     'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
  formData: { amount: '20', order_id: '1234', order_key: '8457WT' } };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);
  });*/

  var options = {
    url: "https://postfinance.zoocial.ch/shop.php",
    data: { amount: "20", order_id: "1234", order_key: "8457WT" },
  };

  var reqData = await utls.requestPostData(options);
  var result = await reqData;
  console.log(typeof result.response);
  console.log(result.response);
  res.send({ test: 123 });
});

//async function getWCApiAsync(endpoint, data = {}) {
global.getWCApiAsync = async function (endpoint, data = {}) {
  try {
    let items = await wcapi.get(endpoint, data);
    let results = await items;
    return results.data;
  } catch (error) {
    console.log(error.response);
    return error.response?error.response.data:error.response;
  }
};

global.getDevWCApiAsync = async function (endpoint, data = {}) {
  try {
    let items = await devWcapi.get(endpoint, data);
    let results = await items;
    return results.data;
  } catch (error) {
    console.log(error.response.data);
    return error.response.data;
  }
};

//async function postWCApiAsync(endpoint, data = {}) {
global.postWCApiAsync = async function (endpoint, data = {}) {
  try {
    let items = await wcapi.post(endpoint, data);
    let results = await items;
    return results.data;
  } catch (error) {
    //console.log(error.response.data);
    return error.response.data;
  }
};

global.postDevWCApiAsync = async function (endpoint, data = {}) {
  try {
    let items = await devWcapi.post(endpoint, data);
    let results = await items;
    return results.data;
  } catch (error) {
    //console.log(error.response.data);
    return error.response.data;
  }
};

//async function putWCApiAsync(endpoint, data = {}) {
global.putWCApiAsync = async function (endpoint, data = {}) {
  try {
    let items = await wcapi.post(endpoint, data);
    let results = await items;
    return results.data;
  } catch (error) {
    //console.log(error.response.data);
    return error.response.data;
  }
};

global.putDevWCApiAsync = async function (endpoint, data = {}) {
  try {
    let items = await devWcapi.post(endpoint, data);
    let results = await items;
    return results.data;
  } catch (error) {
    //console.log(error.response.data);
    return error.response.data;
  }
};

//async function deleteWCApiAsync(endpoint, data = {}) {
global.deleteWCApiAsync = async function (endpoint, data = {}) {
    try {
      let items = await wcapi.delete(endpoint, data);
      let results = await items;
      return results.data;
    } catch (error) {
      return error.response.data;
    }
};

global.deleteDevWCApiAsync = async function (endpoint, data = {}) {
    try {
      let items = await devWcapi.delete(endpoint, data);
      let results = await items;
      return results.data;
    } catch (error) {
      return error.response.data;
    }
};

app.get("/test", async function (req, res) {
  
  res.setHeader("Content-Type", "application/json");
  
  let updData = {
    sku: "604333CV",
    title: "Can Ad Lamm Reis 4x800g, Hills Science Plan",
    shipping_class: ""
  }
  
  let updResult = await putWCApiAsync("products/81192", updData);

  res.json(updResult);

});

//Get all products with filter
app.get("/get_all_product",(req,res)=>{
	wcapi.get("products", {spezial: [748], grosse : [743,758]})
  		.then((response) => {
		res.send(response.data); 
  	})
  	.catch((error) => {
    	console.log(error.response.data);
    	res.send("Oops..! something went wrong.");
 	});
});

app.get("/devtestn", async function (req, res) {
  
  res.setHeader("Content-Type", "application/json");

  let creqdata = {
    per_page: 100, 
    page: 1,
    orderby: "id",
    order: "asc",
  }

  let categories = await getDevWCApiAsync("products/categories", creqdata);
  console.log(categories.length);
  res.send(categories);

});



app.get("/updateproduct", async function(req, res) {
  res.setHeader("Content-Type", "application/json");

  let creqdata = {
    per_page: 50,
    page: 1,
  };
  
  let categories = await getWCApiAsync("products/categories", creqdata);

//var options = { url: "https://navision.oneix.dev/api/v1/item/all", key: 'YMv7wakenwoJlN2wrUDa4QM8-Adj28' }
var options = { url: "https://navision.oneix.dev/api/v1/item/getItems", key: 'YMv7wakenwoJlN2wrUDa4QM8-Adj28' }
//var options = { url: "https://navshop.provet.ch/api/v1/item/getItems", key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' }
//var options = { url: "https://navshop.provet.ch/api/v1/item/all", key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' }

//var options = { url: "https://navshop.provet.ch/api/v1/item/HE5670", key: 'szYITNzF1WPzBf61SKW9pYwT-3K2RY' };

//var reqData = await utls.navisionGetData(options);
var cData = [];

/*for (const [indx, apiData] of reqData.response.data.entries()) {
     //console.log("NO:"+apiData.No +", Parent:" + apiData.species + ", Child:" + apiData['Of feed 2']);
     //cData.push({ NO: apiData.No, parent: apiData.species, child: apiData['Of feed 2'] });
     cData.push({ No: apiData.No, Brand: apiData.brand });               
}*/

//52 = Hundefutter or Katzenfutter
//50 = Hundezubehör or katzenzubehör

var cats = [];
var productData = {
    stock_quantity: 11,
    manage_stock: true,  
}
var species = "katze";
var feed2 = "Snack";
var ItemCategoryCode = "52";
var parentID = null;
var VariantCode = "REMI";

/*if(species != null && species != "") {
  if(species.trim().toLowerCase() === "katze") {
      cats.push({id: 15});
      if(ItemCategoryCode == '52') {
        parentID = 17;
        cats.push({id: parentID});
      }
      if(ItemCategoryCode == '50') {
        parentID = 231;
        cats.push({id: parentID});
      }
  }
  if(species.trim().toLowerCase() === "hund") {
      cats.push({id: 24});
      if(ItemCategoryCode == '52') {
        parentID = 25;
        cats.push({id: parentID});
      }
      if(ItemCategoryCode == '50') {
        parentID = 207;
        cats.push({id: parentID});
      }
  }
}

if(feed2 != null && feed2 != "") {
  var category = categories.filter(function(category) {
      return feed2.trim().toLowerCase() == category.name.toLowerCase() && parentID == category.parent;
  });
  console.log(category);
  if(category.length > 0) {
      cats.push({id: category[0].id});                                                                                                                               
  }
}

//i20 -> category
if(cats.length > 0) {
  productData.categories = cats;
}

productData.tax_class = (ItemCategoryCode == '52') ? "mwst-2-5" : "mwst-7-7";


if(VariantCode != null && VariantCode != "" && VariantCode == "REMI") {
  productData.shipping_class = "remi";
} */

productData.custom_taxonomy = [
    {
      name: "spezial",
      values: ["special1_1","special1_2"]
    },
    {
      name: "grosse",
      values: ["grosse1_1","grosse1_2"]
    },                                       
];

//console.log(productData);

var updProduct = await putWCApiAsync("products/12878", productData);

res.send(updProduct);

});


app.get("/corder", async function (req, res) {
  
  res.setHeader("Content-Type", "application/json");

  const data = {
    payment_method: "bacs",
    payment_method_title: "Direct Bank Transfer",
    set_paid: false,
    status: "pending",
    billing: {
      first_name: "John",
      last_name: "Doe",
      address_1: "969 Market",
      address_2: "",
      city: "Aargau",
      state: "AG",
      postcode: "2222",
      country: "CH",
      email: "alex@one-x.ch",
      phone: "(555) 555-5555",
    },
    shipping: {
      first_name: "John",
      last_name: "Doe",
      address_1: "969 Market",
      address_2: "",
      city: "Aargau",
      state: "AG",
      postcode: "2222",
      country: "CH",
    },
    line_items: [
      { 
        product_id: 3433, 
        quantity: 1, 
        meta_data: [
          {
            "key": "remi",
            "value": "avialable"
          }
        ] 
      },
      { 
        product_id: 3963, 
        quantity: 1, 
        meta_data: [
          {
            "key": "remi",
            "value": "avialable"
          }
        ] 
      }
    ],
    shipping_lines: [
      {
        method_id: "flat_rate",
        method_title: "Flat Rate",
        total: "7.50"
      },
    ],
    coupon_lines: [
      {
        code: "zooshop10",
        discount_tax: '0'
      },
    ],
  };

  var order = await postWCApiAsync("orders", data);
  res.json(order);

});


app.get("/getorder/:id", async (req, res) => {

  res.setHeader("Content-Type", "application/json");
  console.log(req.params.id);
  let id = req.params.id;
  console.log(id);
  let orderdetails = await getWCApiAsync("orders/"+ id);
  res.json(orderdetails);
  
});

app.get("/log-check", async (req, res) => {
  res.setHeader("Content-Type", "application/json");

	fs.readFile("temp.txt", "utf-8", (err, data) => {
		console.log(data);
	});
	let ts = Date.now();

	let date_ob = new Date(ts);
	let date = date_ob.getDate();
	let month = date_ob.getMonth() + 1;
	let year = date_ob.getFullYear();
	let hours = date_ob.getHours();
	let mintus =date_ob.getMinutes()
	var data = "Corn Updated "+ year + "-" + month + "-" + date +" "+ hours+":"+mintus;
	fs.writeFile("temp.txt", data, (err) => {
	  if (err) console.log(err);
	  console.log("Successfully Written to File.");
	});
	res.send({ "status": false, "message": "Message Not send" });
});

app.get("/mailpdf", async function (req, res) {
  
  //res.setHeader('Content-Type', 'text/html');

  res.setHeader("Content-Type", "application/json");

  var mwst_2_5 = 0;
  var mwst_7_7 = 0;
  var total_2_5 = 0;
  var total_7_7 = 0;
  var vat_plustotal_2_5 = 0;
  var vat_plustotal_7_7 = 0;
  var remiAvail = false;
  var payment_type = "";

  var orderdetails = await getWCApiAsync("orders/13002");

  //var settings = await getWCApiAsync("settings");

  //console.log(utls.dateFormat(order.date_created).time);
  //return false;

  orderdetails.line_items.forEach(function(item, el) {
    //console.log(item);

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
  console.log(utls.priceFormat(1.0853658536585364));
  console.log(mwst_2_5);
  console.log(mwst_7_7);

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


   var transporter = nodemailer.createTransport({
      host: "asmtp.mail.hostpoint.ch",
      auth: {
          user: "no-reply@zoocial.ch",
          pass: "NoBes2019Mail!",
      },
  });
  const invoice_pdf_template = "views/shop/etemplates/invoice.ejs";
  const invoice_template = "views/shop/etemplates/invoice_template.ejs";  

  let invoicehtml = await utls.renderEjsFile(invoice_pdf_template, orderData);
  let invoice_tmphtml = await utls.renderEjsFile(invoice_template, orderData);

   var invoicepdfname = orderdetails.number+"_Rechnung.pdf";
    var config = {format: 'a4'};
  
         pdf.create(invoicehtml, config).toFile('assets/orders/'+invoicepdfname, function (error, response) {
              if (error) {
                  console.log(error);
              } else {
                  console.log(response);  

                  var usermailOptions = {
                      from: 'info@zoocial.ch',
                      to: 'alex@one-x.ch',
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
                    from: 'info@zoocial.ch',
                    to: 'alex@one-x.ch',
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

  //res.render("shop/etemplates/order", orderData);
  res.json(orderData);
  
});

// router connection
var apiroutes = require("./routes/index");
const { Console } = require("console");
app.use(apiroutes); // Routes initiate in middleware

/* catch 404 and forward to error handler */
app.use(function (req, res, next) {
   var err = new Error('Sorry Your Request Is Not Found!.....');
   err.status = 404;
   next(err);
});

/* error handler */
app.use(async function (err, req, res, next) {
   // set locals, only providing error in development
   res.locals.message = err.message;
   res.locals.error = req.app.get('env') === 'development' ? err : {};

   //console.log(err);

   // render the error page
   res.status(err.status || 500);
   //let products = await getWCApiAsync("products");
   let creqdata = {
    per_page: 50,
    page: 1,
  };
  let categories = await getWCApiAsync("products/categories", creqdata);
   data = {
      products: null,
      categories: utls.getNestedChildren(categories, 0),
   }
   res.render("shop/pages/404", data);
});

// Assigning Port
app.listen(port, function () {
  console.log("Server listening on port " + port + "...");
});
