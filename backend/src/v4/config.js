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

"use strict";
const VERSION = require("../../VERSION.json").VERSION;

const config = require("app-config").config;
const utils = require("./utils");

/** *****************************************************************************
 * Coalesce function
 * @param {Object} variable - variable to coalesce
 * @param {Object} value - value to return if object is null or undefined
 *******************************************************************************/
const coalesce = function (variable, value) {
	if (variable === null || variable === undefined) {
		return value;
	} else {
		return variable;
	}
};

/** *****************************************************************************
 * Round robin API ClientConfiguration
 * @param {Object} variable - variable to coalesce
 * @param {Object} value - value to return if object is null or undefined
 *******************************************************************************/

function createRoundRobinAlgorithm(algoConfig) {

	const roundRobin = {
		apiUrls : algoConfig.apiUrls,
		apiUrlCounter: {},
		apiUrl : function(type, path) {
			const typeFunctions = this.apiUrls[type];
			const functionIndex = this.apiUrlCounter[type] % Object.keys(typeFunctions).length;

			this.apiUrlCounter[type] += 1;

			return this.apiUrls[type][functionIndex] + "/" + path;
		}
	};

	for (const k in algoConfig.apiUrls) {
		if(utils.hasField(algoConfig.apiUrls,k)) {
			roundRobin.apiUrlCounter[k] = 0;
		}
	}

	return roundRobin;
}

/** *****************************************************************************
 * Fill in the details of a server
 * @param {Object} serverObject - The object to populate
 * @param {string} name - The name of the server (also populates sub-domain/sub-directory)
 *******************************************************************************/
const fillInServerDetails = function (serverObject, name) {
	serverObject = coalesce(serverObject, {});
	serverObject.name = coalesce(serverObject.name, name);
	serverObject.port = serverObject.port || config.port;
	serverObject.chatOnPublicPort = serverObject.chatOnPublicPort || false; // used for chat only
	serverObject.hostname = `${serverObject.subdomain ? serverObject.subdomain + "." : ""}${serverObject.hostname || config.host}`;
	serverObject.host_dir = serverObject.subdirectory ? ("/" + serverObject.subdirectory) : "/";

	serverObject.base_url_no_port = `${config.public_protocol + "://"}${serverObject.hostname}`;
	serverObject.base_url = `${serverObject.base_url_no_port}:${config.public_port}`;
	serverObject.url = serverObject.base_url + serverObject.host_dir;

	serverObject.location_url = serverObject.url;

};

if (config === undefined) {
	console.error("Config is undefined. Is it in a subfolder of the config directory, " +
	"well formed and named config.js?");
	// eslint-disable-next-line no-process-exit
	process.exit(1);
}

config.consoleLogging = coalesce(config.consoleLogging, true);
config.maintenanceMode = coalesce(config.maintenanceMode, false);

// Check for hostname and ip here
config.host = coalesce(config.host, "127.0.0.1");
config.numThreads = coalesce(config.numThreads, 1);
config.HTTPSredirect = coalesce(config.HTTPSredirect, false);

// Global config variable used in the function above
const default_http_port = coalesce(config.http_port, 80); // Default http port
const default_https_port = coalesce(config.https_port, 443); // Default https port

// Check for hostname and ip here
config.host = coalesce(config.host, "127.0.0.1");
config.numThreads = coalesce(config.numThreads, 1);
config.HTTPSredirect = coalesce(config.HTTPSredirect, false);

config.using_ssl = utils.hasField(config, "ssl");
config.port = coalesce(config.port, config.using_ssl ? default_https_port : default_http_port);

config.public_protocol = config.public_protocol || (config.using_ssl ? "https" : "http");
config.public_using_ssl = config.public_protocol === "https";
config.public_port = config.public_port || config.port;

config.timeout = coalesce(config.timeout, 30 * 60); // Timeout in seconds

const threeHours = (1000 * 60 * 60) * 3 ;
config.cookie = coalesce(config.cookie, {});
config.cookie.maxAge = coalesce(config.cookie.maxAge, threeHours);
config.cookie.secret = coalesce(config.cookie.secret, config.default_cookie_secret);
config.cookie.parser_secret = coalesce(config.cookie.parser_secret, config.default_cookie_parser_secret);
config.cookie_domain = coalesce(config.cookie.domain, config.host);

config.chat_reconnection_attempts = coalesce(config.chat_reconnection_attempts, 5);

// Check user login interval
config.login_check_interval = coalesce(config.login_check_interval, 8); // seconds

// Check whether the secret have been set in the file or not
if ((config.cookie.secret === config.default_cookie_secret) || (config.cookie.parser_secret === config.default_cookie_parser_secret)) {
	console.error("Cookie secret phrase has the default value. Update the config");
	// eslint-disable-next-line no-process-exit
	process.exit(1);
}

config.subdomains = {};
config.apiUrls = {};

// Database configuration
config.db = coalesce(config.db, {});
config.db.host = coalesce(config.db.host, config.host);
config.db.host = (config.db.host.constructor === Array) ? config.db.host : [config.db.host];

config.db.port = coalesce(config.db.port, 27017); // Default mongo port
config.db.port = (config.db.port.constructor === Array) ? config.db.port : [config.db.port];

config.db.authSource = config.db.authSource || "";

if (config.db.port.length !== config.db.host.length) {
	console.error("Incorrect number of hosts and ports");
	// eslint-disable-next-line no-process-exit
	process.exit(1);
}

if (config.db.host.length > 1 && !config.db.replicaSet) {
	console.error("You must specify the replica set name");
	// eslint-disable-next-line no-process-exit
	process.exit(1);
}

config.defaultStorage = config.defaultStorage || (config.fs ? "fs" : "gridfs");

let multipleAPIServer = false;

for (let i = 0; i < config.servers.length; i++) {
	const server = config.servers[i];

	if (!utils.hasField(config.subdomains, server.subdomain)) {
		config.subdomains[server.subdomain] = [];
	}

	config.subdomains[server.subdomain].push(server);

	if (server.service === "api") {
		fillInServerDetails(server, "api");

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

		const hasSubdomainArr = utils.hasField(config.subdomains, server.subdomain);
		if (!hasSubdomainArr) {
			// Create empty array for the subdomain to hold servers
			config.subdomains[server.subdomain] = [];
		}

		if (!utils.hasField(config.apiUrls, server.type)) {
			config.apiUrls[server.type] = [];
		}

		if(!server.subdomain) {
			config.apiUrls[server.type].push(server.location_url);
		}

	} else if (server.service === "chat") {

		fillInServerDetails(server, "chat");
		server.chat_host = server.chatOnPublicPort ? server.base_url : server.base_url_no_port + ":" + server.port;
		config.chat_server = server;
		config.chat_reconnection_attempts = (typeof server.reconnection_attempts !== "undefined" ? server.reconnection_attempts : config.chat_reconnection_attempts);

	} else if (server.service === "frontend") {
		fillInServerDetails(server, "server_" + i);
	} else {
		fillInServerDetails(server, "server_" + i);
	}
}

// Change the algorithm for choosing an API server
config.apiAlgorithm = createRoundRobinAlgorithm(config);

// Subscription info
config.subscriptions = coalesce(config.subscriptions, {});
config.subscriptions.basic = coalesce(config.subscriptions.basic, {collaborator : 0, data: 200});

// Terms & Conditions update date
config.termsUpdatedAt = coalesce(config.termsUpdatedAt, 0);

// Other options
config.js_debug_level = coalesce(config.js_debug_level, "debug"); // Loading prod or debug scripts

config.backgroundImage = coalesce(config.backgroundImage, "public/images/dummies/login-background.jpg");

config.default_format = coalesce(config.default_format, "html");
// config.external = (config.js_debug_level === "debug") ? frontend_scripts.debug_scripts : frontend_scripts.prod_scripts;

// Log file options
config.logfile = config.logfile || {};

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

// captcha
config.captcha = coalesce(config.captcha, null);

// default auth settings
config.auth = coalesce(config.auth, {});
config.auth.captcha = coalesce(config.auth.captcha, false);
config.auth.register = coalesce(config.auth.register,true);

config.cn_queue = { maxRetries: 3, ...config.cn_queue};

// upload size limit
config.uploadSizeLimit = coalesce(config.uploadSizeLimit, 209715200);
config.resourceUploadSizeLimit =  config.resourceUploadSizeLimit || 104857600;
config.drawingSizeLimit = coalesce(config.drawingSizeLimit, 524288000);

// upload configurations (v5)
config.fileUploads = {
	modelSizeLimit: config.uploadSizeLimit,
	drawingSizeLimit: config.drawingSizeLimit,
	resourceSizeLimit:config.resourceUploadSizeLimit,
	imageSizeLimit: 1048576,
	imageExtensions: ["png", "jpg", "jpeg", "gif"],
	uploadDir: config.cn_queue.upload_dir

};

config.version = VERSION;
config.userNotice = coalesce(config.userNotice, "");

config.contact = config.contact || {};
config.contact.support = "support@3drepo.com";

// default vat validation url
config.vat = coalesce(config.vat, {});
config.vat.checkUrl = coalesce(config.vat.checkUrl, "http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl");

// get frontend base url
config.getBaseURL = function (internalAccess) {
	const ssl = internalAccess ? config.using_ssl : config.public_using_ssl;

	const port = internalAccess ? config.port : config.public_port;

	const showPort = !(ssl && port === 443 || !ssl && port === 80);

	return `${ssl ? "https://" : "http://"}${config.host}${showPort ? ":" + port : ""}`;
};

// avatar size limit
config.imageSizeLimit = coalesce(config.imageSizeLimit, 1048576);

config.liveChatLicense = config.liveChatLicense || 0;

config.cachePolicy = config.cachePolicy || {maxAge: 60 * 60 * 24 * 30};

module.exports = config;
