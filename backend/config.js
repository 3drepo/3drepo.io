/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(() => {
	"use strict";

	const VERSION="1.7.3";

	let config = require("app-config")
		.config;
	const frontend_scripts = require("../common_public_files.js");
	const sessionFactory = require("./services/session.js");

	/*******************************************************************************
	 * Coalesce function
	 * @param {Object} variable - variable to coalesce
	 * @param {Object} value - value to return if object is null or undefined
	 *******************************************************************************/
	let coalesce = function (variable, value) {
		if (variable === null || variable === undefined) {
			return value;
		} else {
			return variable;
		}
	};

	/*******************************************************************************
	 * Round robin API configuration
	 * @param {Object} variable - variable to coalesce
	 * @param {Object} value - value to return if object is null or undefined
	 *******************************************************************************/
	let createRoundRobinAlgorithm = function()
	{
			let roundRobin = {
				apiUrls : config.apiUrls,
				apiUrlCounter: {}
			};

			/*
			params.config_js += "server_config.apiUrls = {";

			for (let k in config.apiUrls) {
				if (config.apiUrls.hasOwnProperty(k)) {
					params.config_js += "\"" + k + "\" : [";
					params.config_js += config.apiUrls[k].join(",");
					params.config_js += "],";
				}
			}

			params.config_js += "};\n";

			params.config_js += "server_config.apiUrlCounter = {";
			*/

			for (let k in config.apiUrls) {
				if(config.apiUrls.hasOwnProperty(k)){
					roundRobin.apiUrlCounter[k] = 0;
				}
			}

			//params.config_js += "};\n";

			// self variable will be filled in by frontend
			roundRobin.apiUrl = function(type, path) {
				let typeFunctions = self.apiUrls[type];
				let functionIndex = self.apiUrlCounter[type] % Object.keys(typeFunctions).length;

				self.apiUrlCounter[type] += 1;

				return self.apiUrls[type][functionIndex](path);
			};

			return roundRobin;
	};

	/*******************************************************************************
	 * Fill in the details of a server
	 * @param {Object} serverObject - The object to populate
	 * @param {string} name - The name of the server (also populates sub-domain/sub-directory)
	 * @param {boolean} using_ssl - Are we using SSL encryption
	 * @param {string} host - A string representing the base host name
	 * @param {number} default_http_port - Default HTTP port for the server is none is configured
	 * @param {number} default_https_port - Default HTTPS port for the server is none in configured
	 *******************************************************************************/
	let fillInServerDetails = function (serverObject, name, using_ssl, host, default_http_port, default_https_port) {
		serverObject = coalesce(serverObject, {});
		serverObject.name = coalesce(serverObject.name, name);
		serverObject.http_port = coalesce(serverObject.http_port, default_http_port);
		serverObject.https_port = coalesce(serverObject.https_port, default_https_port);
		serverObject.port = coalesce(serverObject.port, using_ssl ? serverObject.https_port : serverObject.http_port);
		serverObject.public_port = coalesce(serverObject.public_port, serverObject.port);
		serverObject.public_protocol = coalesce(serverObject.public_protocol, using_ssl ? "https" : "http");

		serverObject.hostname = coalesce(serverObject.hostname, serverObject.subdomain ? (serverObject.subdomain + "." + host) : host);
		serverObject.host_dir = serverObject.subdirectory ? ("/" + serverObject.subdirectory) : "/";

		serverObject.base_url = serverObject.public_protocol + "://" + serverObject.hostname + ":" + serverObject.public_port;
		serverObject.base_url_no_port = serverObject.public_protocol + "://" + serverObject.hostname;
		//serverObject.location_url = "function(path) { return \"//\" + window.location.host + \"" + serverObject.host_dir + "/\" + path; }";
		serverObject.url = serverObject.base_url + serverObject.host_dir;

		if (serverObject.use_location) {
			/*jslint evil: true */
			serverObject.location_url = new Function("path", "return \"//\" + window.location.host + \"" + serverObject.host_dir + "/\" + path;");
		} else {
			/*jslint evil: true */
			serverObject.location_url = new Function("path", "return '" + serverObject.url + "/' + path;");
		}

		serverObject.location_url = serverObject.location_url.toString();
	};

	// Check for hostname and ip here
	config.host = coalesce(config.host, "127.0.0.1");
	config.numThreads = coalesce(config.numThreads, 1);
	config.HTTPSredirect = coalesce(config.HTTPSredirect, false);

	// Global config variable used in the function above
	let default_http_port = coalesce(config.http_port, 80); // Default http port
	let default_https_port = coalesce(config.https_port, 443); // Default https port

	config.using_ssl = config.hasOwnProperty("ssl");
	config.port = coalesce(config.port, config.using_ssl ? default_https_port : default_http_port);

	config.cookie = coalesce(config.cookie, {});
	config.cookie.secret = coalesce(config.cookie.secret, config.default_cookie_secret);
	config.cookie.parser_secret = coalesce(config.cookie.parser_secret, config.default_cookie_parser_secret);
	config.cookie_domain = coalesce(config.cookie.domain, config.host);

	// Check whether the secret have been set in the file or not
	if ((config.cookie.secret === config.default_cookie_secret) || (config.cookie.parser_secret === config.default_cookie_parser_secret)) {
		console.log("Cookie secret phrase has the default value. Update the config");
		process.exit(1);
	}

	config.subdomains = {};
	config.apiUrls = {};

	let multipleAPIServer = false;

	for (let i = 0; i < config.servers.length; i++) {
		let server = config.servers[i];

		if (!config.subdomains.hasOwnProperty(server.subdomain)) {
			config.subdomains[server.subdomain] = [];
		}

		config.subdomains[server.subdomain].push(server);

		if (server.service === "api") {
			fillInServerDetails(server, "api", config.using_ssl, config.host, default_http_port, default_https_port);

			if (!server.type) {
				server.type = "all";
				config.api_server = server;

				if (!multipleAPIServer) {
					multipleAPIServer = true;
				} else {
					config.api_server.url = "{3drepo_api}";
				}

				server.external = coalesce(server.external, false); // Do we need to start an API server, or just link to an external one.
			}

			server.session = sessionFactory.session(config);

			if (!config.apiUrls.hasOwnProperty(server.type)) {
				config.apiUrls[server.type] = [];
			}

			config.apiUrls[server.type].push(server.location_url);
		} else if (server.service === "chat") {

			fillInServerDetails(server, "chat", config.using_ssl, config.host, server.http_port, server.https_port);
			server.chat_host = server.base_url_no_port + ":" + server.port;
			config.chat_server = server;

		} else {
			fillInServerDetails(server, "server_" + i, config.using_ssl, config.host, default_http_port, default_https_port);
		}
	}

	// Change the algorithm for choosing an API server
	config.apiAlgorithm = createRoundRobinAlgorithm();

	config.disableCache = coalesce(config.disableCache, false);

	// Database configuration
	config.db = coalesce(config.db, {});
	config.db.host = coalesce(config.db.host, config.host);
	config.db.host = (config.db.host.constructor === Array) ? config.db.host : [config.db.host];

	config.db.port = coalesce(config.db.port, 27017); // Default mongo port
	config.db.port = (config.db.port.constructor === Array) ? config.db.port : [config.db.port];

	if (config.db.port.length !== config.db.host.length) {
		console.log("Incorrect number of hosts and ports");
		process.exit(1);
	}

	config.db.username = coalesce(config.db.username, "username");
	config.db.password = coalesce(config.db.password, "password");

	// Other options
	config.js_debug_level = coalesce(config.js_debug_level, "debug"); // Loading prod or debug scripts

	config.backgroundImage = coalesce(config.backgroundImage, "public/images/dummies/login-background.jpg");

	config.default_format = coalesce(config.default_format, "html");
	config.external = (config.js_debug_level === "debug") ? frontend_scripts.debug_scripts : frontend_scripts.prod_scripts;

	// Log file options
	config.logfile = coalesce(config.logfile, {});

	if (!config.logfile.filename) {
		config.logfile.logDirectory = coalesce(config.logfile.logDirectory, "/var/log");
	} else {
		config.logfile.filename = coalesce(config.logfile.filename, "/var/log/3drepo.org");
	}

	config.logfile.console_level = coalesce(config.logfile.console_level, "info");
	config.logfile.file_level = coalesce(config.logfile.file_level, "info");

	// Token expiry length
	config.tokenExpiry = coalesce(config.tokenExpiry, {});
	config.tokenExpiry.emailVerify = coalesce(config.tokenExpiry.emailVerify, 14 * 24); // 2 weeks
	config.tokenExpiry.forgotPassword = coalesce(config.tokenExpiry.forgotPassword, 24); // 24 hours

	//captcha
	config.captcha = coalesce(config.captcha, {});
	config.captcha.validateUrl = coalesce(config.captcha.validateUrl, "https://www.google.com/recaptcha/api/siteverify");
	config.captcha.secretKey = coalesce(config.captcha.secretKey, "");

	//default auth settings
	config.auth = coalesce(config.auth, {});
	config.auth.captcha = coalesce(config.auth.captcha, {});
	config.auth.register = coalesce(config.auth.register, {});

	//paypal
	config.paypal = coalesce(config.paypal, {});
	config.paypal.validateIPN = coalesce(config.paypal.validateIPN, true);

	//upload size limit
	config.uploadSizeLimit = coalesce(config.uploadSizeLimit, 209715200);
	config.version = VERSION;

	//default vat validation url
	config.vat = coalesce(config.vat, {});
	config.vat.checkUrl = coalesce(config.vat.checkUrl, "http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl");

	//get frontend base url
	config.getBaseURL = function (useNonPublicPort) {

		let frontEndServerConfig = config.servers.find(server => server.service === 'frontend');

		let port = "";

		if (useNonPublicPort) {
			//use non public port, for html templates generated for phamtom to generate pdf
			port = ":" + (config.using_ssl ? default_https_port : default_http_port);

		} else if (config.using_ssl && frontEndServerConfig.public_port !== 443 || !config.using_ssl && frontEndServerConfig.public_port !== 80) {
			//do not show :port in url if port is 80 for http or 443 for https to make the url in email looks pretty
			port = ":" + frontEndServerConfig.public_port;
		}

		let baseUrl = (config.using_ssl ? "https://" : "http://") + config.host + port;

		return baseUrl;
	};

	//avatar size limit
	config.avatarSizeLimit = coalesce(config.avatarSizeLimit, 1048576);

	module.exports = config;
})();
