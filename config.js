var mysql = require('mysql');

var config = {
	db: {
		host: '192.168.1.134', 	// database host
		user: 'root', 		// your database username
		password: "", 		// your database password
		port: 3306, 		// default MySQL port
		db: 'at_zoocialshop', 		// your database name
		charset: 'utf8_general_ci' // charset
	},
	server: {
		host: '127.0.0.1',
		port: '4005'
	},

	wcsettings: {
		url: "https://zshop.dev/",
   		consumerKey: "ck_3d130cd0b8d6f3046edd788ff006122cd3fc1fdd",
   		consumerSecret: "cs_299b25bf2380edc21c6a73fd379001eda41fd2c0",
		version: "wc/v3",
		queryStringAuth: true
	},

	/*wcsettings: {
		url: "http://192.168.1.134/athavullah/wordpress/project1/",
   		consumerKey: "ck_94e2539e4f538474ba407e58593e0c7bb59cca37",
   		consumerSecret: "cs_dd0e503faf984fe237f376c0d883188e1095c341",
   		version: "wc/v3"
	}*/
}

module.exports = config;
