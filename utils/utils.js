var crypto = require('crypto');
var probe = require('probe-image-size');

utls = {
    isEmpty: function (val) {
        if (val != '' && val != 0 && typeof (val) != 'undefined' && typeof (val) != 'null' && val != null) {
            return true;
        } else {
            return false;
        }
    },
    isNotEmpty: function (val) {
        if (val != '' && val !== 0 && typeof (val) != 'undefined' && typeof (val) != 'null' && val != null) {
            return true;
        } else {
            return false;
        }
    },
    isNotdefined: function (val) {
        if (val == '' || typeof (val) == 'undefined' || typeof (val) == 'null' && val || null) {
            return false;
        } else {
            return true;
        }
    },
    checkEmpty: function (val) {
        if (val == '' || val == 0 || typeof (val) == 'undefined' || typeof (val) == 'null' || val == null) {
            return true;
        } else {
            return false;
        }
    },
    saltHashPassword: function (password, pslt = '', slt = true) {
        var pswd = '';
        var slth = [];
        let Salt = crypto.randomBytes(16).toString('base64');
        //let Hash = crypto.createHmac('sha512', Salt).update(password).digest("base64");
        let Hash = crypto.createHmac('sha512', Salt).update(password).digest("base64");

        if (slt) {
            slth.push(Salt);
            slth.push(Salt + "$" + Hash);
        } else {
            if (pslt == '' || pslt == null || typeof (pslt) == 'undefined') {
                var splt = password.split('$');
                slth.push(splt[0]);
                slth.push(splt[1]);
            } else {
                Hash = crypto.createHmac('sha512', pslt).update(password).digest("base64");
                slth.push(pslt);
                slth.push(pslt + "$" + Hash);
            }
        }
        return slth;
    },
    getToken: function () {
        return crypto.randomBytes(16).toString('base64');
    },
    getNestedChildren: function (arr, parent) {
        var children = [];
        for (var i = 0; i < arr.length; ++i) {
            if (arr[i].parent == parent) {
                var grandChildren = this.getNestedChildren(arr, arr[i].id)

                if (grandChildren.length) {
                    arr[i].children = grandChildren;
                }
                children.push(arr[i]);
            }
        }
        return children;
    },
    getCategories: function (callback) {
        // List products
        wcapi.get("products/categories").then((response) => {
            callback(true, this.getNestedChildren(response.data, 0));
        }).catch((error) => {
            callback(false, error);
        });

    },
    joinObjects: function () {
        var idMap = {};
        for (let i = 0; i < arguments.length; i++) {
            for (let j = 0; j < arguments[i].length; j++) {
                let currentID = arguments[i][j]['id'];
                if (!idMap[currentID]) {
                    idMap[currentID] = {};
                }
                // Iterate over properties of objects in arrays
                for (key in arguments[i][j]) {
                    idMap[currentID][key] = arguments[i][j][key];
                }
            }
        }

        // push properties of idMap into an array
        let newArray = [];
        for (property in idMap) {
            newArray.push(idMap[property]);
        }
        return newArray;
    },
    parseQuery: function (queryString) {
        var query = {};
        //var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
        var pairs = queryString.split('&');
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            var pname = decodeURIComponent(pair[0]);
            var pval = pair[1].replace(/\+/g, '%20');
            query[pname] = decodeURIComponent(pval || '');
        }
        return query;
    },
    strToLowerCase: function (str) {
        return str.toLowerCase();
    },
    strToUpperCase: function (str) {
        return str.toUpperCase();
    },
    async postData(url, inputData = {}) {

        var method = inputData.method;
        try {
            const response = await fetch(url, {
                method: method, // or 'PUT'
                //"rejectUnauthorized": false, 
                body: JSON.stringify(inputData.data), // data can be `string` or {object}!
                headers: {
                    'Content-Type': 'application/json'
                    
                }
            });

            const jsondata = await response.json();
            return jsondata;

        } catch (error) {
            console.error('Error:', error);
        }
    },
    async fetchData(url, inputData = {}) {
        console.log("check");
        console.log(url);
        console.log("check");
        try {
            const response = await fetch(url, {
                method: inputData.method, 
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const jsondata = await response.json();
            return jsondata;

        } catch (error) {
            console.error('Error:', error);
        }
    },
    requestPost(options) {
        return new Promise((resolve, reject) => {
            request(options, function(error, response, body) {
                if (error) {
                    console.error('error', error);
                    return reject(error);
                } 
                resolve(body);
              });
        });
    },
    async requestPostData (options) {

        var params = {
            method: 'POST',
            "rejectUnauthorized": false, 
            url: options.url,
            headers: { 'postman-token': '7dd2cdb5-f34d-bcd0-14ed-a0767c4fcd42',
                        'cache-control': 'no-cache',
                        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' 
                    },
            formData: options.data 
        };

        try {
            let items = await this.requestPost(params);
            let result = await items;
            console.log(result);
            return { "status": true, "error": null, "response": JSON.parse(result) };
        } catch (error) {
            console.log(error);
            return { "status": false, "error": error };
        }
    },
    async requestDeleteData (options) {

        var params = {
            method: 'DELETE',
            "rejectUnauthorized": false, 
            url: options.url,
            headers: { 'postman-token': '7dd2cdb5-f34d-bcd0-14ed-a0767c4fcd42',
                        'cache-control': 'no-cache',
                        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
                        'Authorization': options.authtoken,
                    }
        };

        try {
            let items = await this.requestPost(params);
            //console.log("Request params++++++++++", params);
            //let result = await items;
            console.log("Request Delete data++++++++++", items);
            return { "status": true, "error": null, "response": JSON.parse(items) };
        } catch (error) {
            console.log(error);
            return { "status": false, "error": error };
        }
    },
    async requestPostDataCommon(options) {

        var params = {
            method: 'POST',
            "rejectUnauthorized": false, 
            url: options.url,
            headers: { 'postman-token': '7dd2cdb5-f34d-bcd0-14ed-a0767c4fcd42',
                        'cache-control': 'no-cache',
                        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' 
                    },
            formData: options.data 
        };

        try {
            let items = await this.requestPost(params);
            let result = await items;
            //return { "status": true, "error": null, "response": result };
            console.log(result);
            return JSON.parse(result);
        } catch (error) {
            console.log(error);
            return { "status": false, "error": error };
        }
    },
    async newsletterPost(options) {
        var params = {
            method: 'POST',
            "rejectUnauthorized": false, 
            url: options.hasOwnProperty('url') ? options.url : "",
            headers: { 'postman-token': '31f8ab02-9fba-a8bf-d0e6-4a7797954796',
              'cache-control': 'no-cache',
              'content-type': 'application/json' },
            formData: options.hasOwnProperty('data') ? options.data : "",
            body: options.hasOwnProperty('body') ? options.body : "",
            json: true
        };

        try {
            let items = await this.requestPost(params);
            let result = await items;
            if(result == undefined || result == "undefined") {
                return { "status": true, "message": "send successful", response: result };
            } else {
                return { "status": false, "message": "send failed", response: result };
            }
        } catch (error) {
            console.log(error);
            return { "status": false, "error": error };
        }

    },
    async requestGetData (options) {

        var params = {
            method: 'GET',
            "rejectUnauthorized": false,
            qs: options.qs,
            url: options.url,
            headers: { 'postman-token': '23508ded-2f19-7acf-7ee1-5ff4eb411b1b',
                        'cache-control': 'no-cache',
                        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
            formData: options.data 
        };

        try {
            let items = await this.requestPost(params);
            let result = await items;
            return { "response": JSON.parse(result) };
        } catch (error) {
            console.log(error);
            return { "status": false, "error": error };
        }
    },
    async requestGetDataCommon (options) {

        var params = {
            method: 'GET',
            "rejectUnauthorized": false, 
            url: options.url,
            headers: { 'postman-token': '7dd2cdb5-f34d-bcd0-14ed-a0767c4fcd42',
                        'cache-control': 'no-cache',
                        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' 
                    },
            formData: options.data 
        };

        try {
            let items = await this.requestPost(params);
            let result = await items;
            return { "status": true, "error": null, "response": JSON.parse(result) };
        } catch (error) {
            console.log(error);
            return { "status": false, "error": error };
        }
    },
    async navisionGetData (options) {
        var params = {
            method: 'GET',
            "rejectUnauthorized": false,
            url: options.url,
            headers: {
                        'postman-token': 'b4ce94b3-4389-aef0-a5a3-f2e54dc28fda',
                        'cache-control': 'no-cache',
                        'Authorization' : options.key,
                        'content-type': 'application/json' 
                    },
        };

        try {
            let items = await this.requestPost(params);
            let result = await items;
            return JSON.parse(result);
        } catch (error) {
            console.log(error);
            return { "status": false, "error": error };
        }
    },
    swissStates() {
        return {
            "AG": "Aargau",
            "AR": "Appenzell Ausserrhoden",
            "AI": "Appenzell Innerrhoden",
            "BL": "Basel-Landschaft",
            "BS": "Basel-Stadt",
            "BE": "Bern",
            "FR": "Fribourg",
            "GE": "Geneva",
            "GL": "Glarus",
            "GR": "Graubünden",
            "JU": "Jura",
            "LU": "Luzern",
            "NE": "Neuchâtel",
            "NW": "Nidwalden",
            "OW": "Obwalden",
            "SH": "Schaffhausen",
            "SZ": "Schwyz",
            "SO": "Solothurn",
            "SG": "St. Gallen",
            "TG": "Thurgau",
            "TI": "Ticino",
            "UR": "Uri",
            "VS": "Valais",
            "VD": "Vaud",
            "ZG": "Zug",
            "ZH": "Zürich",
        };
    },
    countries() {
        return {"BD": "Bangladesh", "BE": "Belgium", "BF": "Burkina Faso", "BG": "Bulgaria", "BA": "Bosnia and Herzegovina", 
        "BB": "Barbados", "WF": "Wallis and Futuna", "BL": "Saint Barthelemy", "BM": "Bermuda", "BN": "Brunei", "BO": "Bolivia", 
        "BH": "Bahrain", "BI": "Burundi", "BJ": "Benin", "BT": "Bhutan", "JM": "Jamaica", "BV": "Bouvet Island", "BW": "Botswana", 
        "WS": "Samoa", "BQ": "Bonaire, Saint Eustatius and Saba ", "BR": "Brazil", "BS": "Bahamas", "JE": "Jersey", "BY": "Belarus", 
        "BZ": "Belize", "RU": "Russia", "RW": "Rwanda", "RS": "Serbia", "TL": "East Timor", "RE": "Reunion", "TM": "Turkmenistan", 
        "TJ": "Tajikistan", "RO": "Romania", "TK": "Tokelau", "GW": "Guinea-Bissau", "GU": "Guam", "GT": "Guatemala", "GS": "South Georgia and the South Sandwich Islands", 
        "GR": "Greece", "GQ": "Equatorial Guinea", "GP": "Guadeloupe", "JP": "Japan", "GY": "Guyana", "GG": "Guernsey", "GF": "French Guiana", "GE": "Georgia", "GD": "Grenada", 
        "GB": "United Kingdom", "GA": "Gabon", "SV": "El Salvador", "GN": "Guinea", "GM": "Gambia", "GL": "Greenland", "GI": "Gibraltar", "GH": "Ghana", "OM": "Oman", "TN": "Tunisia", 
        "JO": "Jordan", "HR": "Croatia", "HT": "Haiti", "HU": "Hungary", "HK": "Hong Kong", "HN": "Honduras", "HM": "Heard Island and McDonald Islands", "VE": "Venezuela", 
        "PR": "Puerto Rico", "PS": "Palestinian Territory", "PW": "Palau", "PT": "Portugal", "SJ": "Svalbard and Jan Mayen", "PY": "Paraguay", "IQ": "Iraq", "PA": "Panama", 
        "PF": "French Polynesia", "PG": "Papua New Guinea", "PE": "Peru", "PK": "Pakistan", "PH": "Philippines", "PN": "Pitcairn", "PL": "Poland", "PM": "Saint Pierre and Miquelon", 
        "ZM": "Zambia", "EH": "Western Sahara", "EE": "Estonia", "EG": "Egypt", "ZA": "South Africa", "EC": "Ecuador", "IT": "Italy", "VN": "Vietnam", "SB": "Solomon Islands", 
        "ET": "Ethiopia", "SO": "Somalia", "ZW": "Zimbabwe", "SA": "Saudi Arabia", "ES": "Spain", "ER": "Eritrea", "ME": "Montenegro", "MD": "Moldova", "MG": "Madagascar", 
        "MF": "Saint Martin", "MA": "Morocco", "MC": "Monaco", "UZ": "Uzbekistan", "MM": "Myanmar", "ML": "Mali", "MO": "Macao", "MN": "Mongolia", "MH": "Marshall Islands", 
        "MK": "Macedonia", "MU": "Mauritius", "MT": "Malta", "MW": "Malawi", "MV": "Maldives", "MQ": "Martinique", "MP": "Northern Mariana Islands", "MS": "Montserrat", 
        "MR": "Mauritania", "IM": "Isle of Man", "UG": "Uganda", "TZ": "Tanzania", "MY": "Malaysia", "MX": "Mexico", "IL": "Israel", "FR": "France", 
        "IO": "British Indian Ocean Territory", "SH": "Saint Helena", "FI": "Finland", "FJ": "Fiji", "FK": "Falkland Islands", "FM": "Micronesia", "FO": "Faroe Islands", 
        "NI": "Nicaragua", "NL": "Netherlands", "NO": "Norway", "NA": "Namibia", "VU": "Vanuatu", "NC": "New Caledonia", "NE": "Niger", "NF": "Norfolk Island", 
        "NG": "Nigeria", "NZ": "New Zealand", "NP": "Nepal", "NR": "Nauru", "NU": "Niue", "CK": "Cook Islands", "XK": "Kosovo", "CI": "Ivory Coast", "CH": "Switzerland", 
        "CO": "Colombia", "CN": "China", "CM": "Cameroon", "CL": "Chile", "CC": "Cocos Islands", "CA": "Canada", "CG": "Republic of the Congo", "CF": "Central African Republic", 
        "CD": "Democratic Republic of the Congo", "CZ": "Czech Republic", "CY": "Cyprus", "CX": "Christmas Island", "CR": "Costa Rica", "CW": "Curacao", "CV": "Cape Verde", 
        "CU": "Cuba", "SZ": "Swaziland", "SY": "Syria", "SX": "Sint Maarten", "KG": "Kyrgyzstan", "KE": "Kenya", "SS": "South Sudan", "SR": "Suriname", "KI": "Kiribati", 
        "KH": "Cambodia", "KN": "Saint Kitts and Nevis", "KM": "Comoros", "ST": "Sao Tome and Principe", "SK": "Slovakia", "KR": "South Korea", "SI": "Slovenia", 
        "KP": "North Korea", "KW": "Kuwait", "SN": "Senegal", "SM": "San Marino", "SL": "Sierra Leone", "SC": "Seychelles", "KZ": "Kazakhstan", "KY": "Cayman Islands", "SG": "Singapore", 
        "SE": "Sweden", "SD": "Sudan", "DO": "Dominican Republic", "DM": "Dominica", "DJ": "Djibouti", "DK": "Denmark", "VG": "British Virgin Islands", "DE": "Germany", "YE": "Yemen", 
        "DZ": "Algeria", "US": "United States", "UY": "Uruguay", "YT": "Mayotte", "UM": "United States Minor Outlying Islands", "LB": "Lebanon", "LC": "Saint Lucia", "LA": "Laos", 
        "TV": "Tuvalu", "TW": "Taiwan", "TT": "Trinidad and Tobago", "TR": "Turkey", "LK": "Sri Lanka", "LI": "Liechtenstein", "LV": "Latvia", "TO": "Tonga", "LT": "Lithuania", 
        "LU": "Luxembourg", "LR": "Liberia", "LS": "Lesotho", "TH": "Thailand", "TF": "French Southern Territories", "TG": "Togo", "TD": "Chad", "TC": "Turks and Caicos Islands", 
        "LY": "Libya", "VA": "Vatican", "VC": "Saint Vincent and the Grenadines", "AE": "United Arab Emirates", "AD": "Andorra", "AG": "Antigua and Barbuda", "AF": "Afghanistan", 
        "AI": "Anguilla", "VI": "U.S. Virgin Islands", "IS": "Iceland", "IR": "Iran", "AM": "Armenia", "AL": "Albania", "AO": "Angola", "AQ": "Antarctica", "AS": "American Samoa", 
        "AR": "Argentina", "AU": "Australia", "AT": "Austria", "AW": "Aruba", "IN": "India", "AX": "Aland Islands", "AZ": "Azerbaijan", "IE": "Ireland", "ID": "Indonesia", "UA": "Ukraine", 
        "QA": "Qatar", "MZ": "Mozambique"};
    },
    shippingCountries() {
        return { "CH": "Schweiz", "LI": "Liechtenstein" }
    },
    getCountry(cnt) {
        var country = null;
        var shippingCountry = this.shippingCountries();
        console.log(cnt);
        Object.keys(shippingCountry).forEach((cn, el) => {
            if(cn == cnt) {
                country = shippingCountry[cn];
                return false;
            }
        });
        return country;
    },
    getState(st) {
        var state = null;
        var shippingStates = this.swissStates();
        console.log(st);
        Object.keys(shippingStates).forEach((cn, el) => {
            if(cn == st) {
                state = shippingStates[cn];
                return false;
            }
        });
        return state;
    },
    priceFormat(amount, decimalCount = 2, decimal = ".", thousands = "'") {
        //price = parseFloat(price);
        //return price.toFixed(2);
        try {
            decimalCount = Math.abs(decimalCount);
            decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
        
            const negativeSign = amount < 0 ? "-" : "";
        
            let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
            let j = (i.length > 3) ? i.length % 3 : 0;
        
            return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
          } catch (e) {
            console.log(e)
          }
    },
    priceFormat2(amount, decimalCount = 3, decimal = ".", thousands = "'") {
        //price = parseFloat(price);
        //return price.toFixed(2);
        try {
            decimalCount = Math.abs(decimalCount);
            decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
        
            const negativeSign = amount < 0 ? "-" : "";
        
            let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
            let j = (i.length > 3) ? i.length % 3 : 0;
        
            return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
          } catch (e) {
            console.log(e)
          }
    },
    discountPrice(price, discount) {
        price = parseFloat(price - ((price / 100) * discount));
        return price.toFixed(2);
    },
    discountPercentageValue(price, discount) {
        price = parseFloat((price / 100) * discount);
        return price.toFixed(2);
    },
    imageOptimize(name, size = "m") {
        var filename = path.parse(name);
        var mg = null;
        switch (size) {
            case "t":
                mg = filename.dir + "/" + filename.name.replace(/-scaled/g, "") + "-100x100" + filename.ext;
                break;
            case "s":
                mg = filename.dir + "/" + filename.name + "-150x150" + filename.ext;
                break;
            case "m":
                mg = filename.dir + "/" + filename.name + "-200x300" + filename.ext;
                break;
            case "l":
                mg = filename.dir + "/" + filename.name + "-324x324" + filename.ext;
                break;
            case "xl":
                mg = filename.dir + "/" + filename.name + "-416x624" + filename.ext;
                break;
            case "o":
                mg = name;
                break;
            default:
                mg = name;
        }

        return mg;
    },
    formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
        try {
          decimalCount = Math.abs(decimalCount);
          decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
      
          const negativeSign = amount < 0 ? "-" : "";
      
          let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
          let j = (i.length > 3) ? i.length % 3 : 0;
      
          return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
        } catch (e) {
          console.log(e)
        }
    },
    dateFormat(date) {
        var at = date.split('T');
        var dt = at[0].split('-');
        var dto = {"date": dt[2] + '.' + dt[1] + '.' +dt[0], "time": at[1]};
        return dto;
    },
    dateFormatm(date) {
        var at = date.split(' ');
        var dt = at[0].split('-');
        var dto = {"date": dt[2] + '.' + dt[1] + '.' +dt[0], "time": at[1]};
        return dto;
    },
    async ejsRenderPromise(filename, data={}) {
        return new Promise((resolve, reject) => {
            ejs.renderFile(filename, data, (error, html) => {
                if (error) {
                    console.error('error', error);
                    return reject(error);
                } 
                resolve(html);
              });
        });
    },
    async imageSizePromise(imageUrl) {
        return new Promise((resolve, reject) => {
            probe(imageUrl, (error, result) => {
                if (error) {
                    console.error('error', error);
                    return reject(error);
                } 
                resolve(result);
              });
        });
    },
    async imageSize(imageUrl) {
        try {
            let imageProbe = await this.imageSizePromise(imageUrl);
            return imageProbe;
        } catch (error) {
            console.log("Error occured on EnderFile: ", error);
        }
    },
    async renderEjsFile(filename, data={}) {
        try {
            let htmlcontent = await this.ejsRenderPromise(filename, data);
            return htmlcontent;
        } catch (error) {
            console.log("Error occured on EnderFile: ", error);
        }
    },
    async productReview(id) {
        /* # GET /products/<id>/reviews */
        let reviewsData = {
            product: parseInt(id)
        }
        var reviews = await getWCApiAsync("products/reviews/", reviewsData);
        return reviews;
    },
    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    },
    swissMonths() {
        return {
            "01": "Januar",
            "02": "Februar",
            "03": "März",
            "04": "April",
            "05": "Mai",
            "06": "Juni",
            "07": "Juli",
            "08": "August",
            "09": "September",
            "10": "Oktober",
            "11": "November",
            "12": "Dezember",
        }
    },
    unicodeToChar(text) {
        return text.replace(/\\u[\dA-F]{4}/gi, 
               function (match) {
                    return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
               });
    },
    unicodeToChar1(str) {
        var _escape_overrides = { 0x00:'\uFFFD',0x80:'\u20AC',0x82:'\u201A',0x83:'\u0192',0x84:'\u201E',0x85:'\u2026',0x86:'\u2020',0x87:'\u2021',0x88:'\u02C6',0x89:'\u2030',0x8A:'\u0160',0x8B:'\u2039',0x8C:'\u0152',0x8E:'\u017D',0x91:'\u2018',0x92:'\u2019',0x93:'\u201C',0x94:'\u201D',0x95:'\u2022',0x96:'\u2013',0x97:'\u2014',0x98:'\u02DC',0x99:'\u2122',0x9A:'\u0161',0x9B:'\u203A',0x9C:'\u0153',0x9E:'\u017E',0x9F:'\u0178' };
            return str.replace(/([\u0000-\uD799]|[\uD800-\uDBFF][\uDC00-\uFFFF])/g, function(c) {
                var c1 = c.charCodeAt(0);
                // ascii character, use override or escape
                if( c1 <= 0xFF ) return (c1=_escape_overrides[c1])?c1:escape(c).replace(/%(..)/g,"&#x$1;");
                // utf8/16 character
                else if( c.length == 1 ) return "&#" + c1 + ";"; 
                // surrogate pair
                else if( c.length == 2 && c1 >= 0xD800 && c1 <= 0xDBFF ) return "&#" + ((c1-0xD800)*0x400 + c.charCodeAt(1) - 0xDC00 + 0x10000) + ";"
                // no clue .. 
                else return "";
            });
    }
}

module.exports = utls;