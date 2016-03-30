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

(function() {
	"use strict";

	const VERSION="1.0.0rc2";

	var config = require("app-config").config;
	var frontend_scripts = require("../common_public_files.js");
	var sessionFactory = require("./services/session.js");

	/*******************************************************************************
	  * Coalesce function
	  * @param {Object} variable - variable to coalesce
	  * @param {Object} value - value to return if object is null or undefined
	  *******************************************************************************/
	var coalesce = function(variable, value)
	{
		if (variable === null || variable === undefined) {
			return value;
		} else {
			return variable;
		}
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
	var fillInServerDetails = function(serverObject, name, using_ssl, host, default_http_port, default_https_port)
	{
		serverObject                   = coalesce(serverObject, {});
		serverObject.name              = coalesce(serverObject.name, name);
		serverObject.http_port         = coalesce(serverObject.http_port, default_http_port);
		serverObject.https_port        = coalesce(serverObject.https_port, default_https_port);
		serverObject.port              = coalesce(serverObject.port, using_ssl ? serverObject.https_port : serverObject.http_port);
		serverObject.public_port       = coalesce(serverObject.public_port, serverObject.port);
		serverObject.public_protocol   = coalesce(serverObject.public_protocol, using_ssl ? "https" : "http");

		serverObject.hostname = serverObject.subdomain ? (serverObject.subdomain + "." + host) : host;
		serverObject.host_dir = serverObject.subdirectory ? ("/" + serverObject.subdirectory) : "/";

		serverObject.base_url     = serverObject.public_protocol + "://" + serverObject.hostname + ":" + serverObject.public_port;
		serverObject.location_url = "function(path) { return \"//\" + window.location.host + \"" + serverObject.host_dir + "\" + path; }";
		serverObject.url          = serverObject.base_url + serverObject.host_dir;
	};

	// Check for hostname and ip here
	config.host        = coalesce(config.host, "127.0.0.1");

	// Global config variable used in the function above
	let default_http_port  = coalesce(config.http_port, 80); // Default http port
	let default_https_port = coalesce(config.https_port, 443); // Default https port

	config.using_ssl = config.hasOwnProperty("ssl");
	config.port      = coalesce(config.port, config.using_ssl ? default_https_port : default_http_port);

	config.cookie               = coalesce(config.cookie, {});
	config.cookie.secret        = coalesce(config.cookie.secret, config.default_cookie_secret);
	config.cookie.parser_secret = coalesce(config.cookie.parser_secret, config.default_cookie_parser_secret);

	// Check whether the secret have been set in the file or not
	if ((config.cookie.secret === config.default_cookie_secret) || (config.cookie.parser_secret === config.default_cookie_parser_secret))
	{
		console.log("Cookie secret phrase has the default value. Update the config");
		process.exit(1);
	}

	config.subdomains = {};

	for (var i = 0; i < config.servers.length; i++)
	{
		var server = config.servers[i];
		var serverSubDomain = server.subdomain ? server.subdomain : null;

		if (!config.subdomains.hasOwnProperty(serverSubDomain))
		{
			config.subdomains[serverSubDomain] = [];
		}

		config.subdomains[serverSubDomain].push(server);

		if (config.servers[i].service === "api")
		{
			config.api_server = server;

			fillInServerDetails(config.api_server, "api", config.using_ssl, config.host, default_http_port, default_https_port);
			config.api_server.external     = coalesce(config.api_server.external, false); // Do we need to start an API server, or just link to an external one.
			config.api_server.chat_subpath = coalesce(config.api_server.chat_subpath, "chat");
			config.api_server.chat_path    = "/" + config.api_server.host_dir + "/" + config.api_server.chat_subpath;
			config.api_server.chat_host    = config.api_server.base_url;

			config.api_server.session = sessionFactory.session(config);
		} else {
			fillInServerDetails(server, "server_" + i, config.using_ssl, config.host, default_http_port, default_https_port);
		}
	}

	config.disableCache            = coalesce(config.disableCache, false);

	// Database configuration
	config.db          = coalesce(config.db, {});
	config.db.host     = coalesce(config.db.host, config.host);
	config.db.port     = coalesce(config.db.port, 27017); // Default mongo port

	config.db.username = coalesce(config.db.username, "username");
	config.db.password = coalesce(config.db.password, "password");

	// Other options
	config.js_debug_level       = coalesce(config.js_debug_level, 'debug'); // Loading prod or debug scripts

	config.backgroundImage = coalesce(config.backgroundImage, "public/images/dummies/login-background.jpg");

	config.default_format = coalesce(config.default_format, "html");
	config.external       = (config.js_debug_level === "debug") ? frontend_scripts.debug_scripts : frontend_scripts.prod_scripts;

	// Log file options
	config.logfile               = coalesce(config.logfile, {});
	config.logfile.filename      = coalesce(config.logfile.filename, "/var/log/3drepo.org");
	config.logfile.console_level = coalesce(config.logfile.console_level, "info");
	config.logfile.file_level    = coalesce(config.logfile.file_level, "info");

	config.version = VERSION;

	module.exports = config;
})();
