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

var config = require('app-config').config;
var frontend_scripts = require('../../common_public_files.js');

var default_http_port  = 80;
var default_https_port = 443;
var default_mongo_port = 27017;

var default_cookie_secret        = 'cookie secret';
var default_cookie_parser_secret = 'another cookie secret';

/*******************************************************************************
  * Coalesce function
  * @param {Object} variable - variable to coalesce
  * @param {Object} value - value to return if object is null or undefined
  *******************************************************************************/
var coalesce = function(variable, value)
{
	if (variable === null || variable === undefined)
		return value;
	else
		return variable;
}

/*******************************************************************************
  * Function to check whether or not a string is an IP address
  * @param {string} str - String to test
  *
  * http://stackoverflow.com/questions/4460586/javascript-regular-expression-to-check-for-ip-addresses
  *******************************************************************************/
var checkIP = function(str)
{
	if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(str))
		return true;
	else
		return false;
}

// TODO: Should do some checking of validity of config file here.
// TODO: Tidy up
// TODO: Generate vhost boolean, and add checks for port/hostnames etc. (Maybe default ports)

/*******************************************************************************
 * Fill in the details of a server
 * @param {Object} serverObject - The object to populate
 * @param {string} name - The name of the server (also populates sub-domain/sub-directory)
 * @param {boolean} usingIP - Are we using an IP address for the base host
 * @param {boolean} using_ssl - Are we using SSL encryption
 * @param {string} host - A string representing the base host name
 * @param {boolean} applyName - Do we want to use the name for sub-directory/sub-domain
 *******************************************************************************/
var fillInServerDetails = function(serverObject, name, usingIP, using_ssl, host, applyName)
{
	serverObject                   = coalesce(serverObject, {});
	serverObject.name              = coalesce(serverObject.name, name);
	serverObject.sub_domain_or_dir = coalesce(serverObject.sub_domain_or_dir, 1);
	serverObject.http_port         = coalesce(serverObject.http_port, default_http_port);
	serverObject.https_port        = coalesce(serverObject.https_port, default_https_port);
	serverObject.port              = coalesce(serverObject.port, using_ssl ? serverObject.https_port : serverObject.http_port);
	serverObject.public_port       = coalesce(serverObject.public_port, serverObject.port);
	serverObject.public_protocol   = coalesce(serverObject.public_protocol, using_ssl ? "https" : "http");

	// Have to use subdirectory with an IP address
	if (usingIP) {
		if (!config.api_server.sub_domain_or_dir)
		{
			console.log("WARNING: IP specified but tried to use sub-domain. Setting to sub-directory.");
			config.api_server.sub_domain_or_dir = 1;
		}
	}

	if (applyName)
	{
		// Is this a subdomain or a directory
		if (!serverObject.sub_domain_or_dir)
		{
			// Sub-domain
			if (!serverObject.hostname) {
				serverObject.hostname = serverObject.name + "." + host;
			}

			serverObject.host_dir = "";
		} else {
			// Sub-directory
			if (!serverObject.hostname) {
				serverObject.hostname = host;
			}

			serverObject.host_dir = serverObject.name;
		}
	} else {
		if (!serverObject.hostname) {
			serverObject.hostname = host;
		}

		serverObject.host_dir = "";
	}

	serverObject.base_url     = serverObject.public_protocol + "://" + serverObject.hostname + ":" + serverObject.public_port;
	serverObject.location_url = "function(path) { return \"//\" + window.location.host + \"/\" + \"" + serverObject.host_dir + "\" + \"/\" + path; }";
	serverObject.url          = serverObject.base_url + "/" + serverObject.host_dir;
}

// Check for hostname and ip here
config.host        = coalesce(config.host, "127.0.0.1");
default_http_port  = coalesce(config.http_port, default_http_port);
default_https_port = coalesce(config.https_port, default_https_port);

config.using_ip  = checkIP(config.host);
config.using_ssl = ('ssl' in config);

fillInServerDetails(config.api_server, "api", config.using_ip, config.using_ssl, config.host, true);
config.api_server.external     = coalesce(config.api_server.external, false); // Do we need to start an API server, or just link to an external one.
config.api_server.chat_subpath = coalesce(config.api_server.chat_subpath, 'chat');
config.api_server.chat_path    = '/' + config.api_server.host_dir + '/' + config.api_server.chat_subpath;
config.api_server.chat_host    = config.api_server.base_url;

config.disableCache            = coalesce(config.disableCache, false);

// Set up other servers
for(i in config.servers)
{
	fillInServerDetails(config.servers[i], "server_" + i, config.using_ip, config.using_ssl, config.host, false);
}

// If the API server is running on a subdirectory, config.subdirectory will be true
// If the API server is running different subdomain it will require virtual hosts
// If both these are set to false then you enter advanced mode (see 3drepo.js)
config.subdirectory = coalesce(config.subdirectory, config.api_server.sub_domain_or_dir === 1);
config.vhost        = coalesce(config.vhost, config.api_server.sub_domain_or_dir === 0);

// Database configuration
config.db          = coalesce(config.db, {});
config.db.host     = coalesce(config.db.host, config.host);
config.db.port     = coalesce(config.db.port, default_mongo_port);
config.db.username = coalesce(config.db.username, "username");
config.db.password = coalesce(config.db.password, "password");

// Other options
config.js_debug_level       = coalesce(config.js_debug_level, 'debug'); // Loading prod or debug scripts
config.cookie_secret        = coalesce(config.cookie_secret, config.default_cookie_secret);
config.cookie_parser_secret = coalesce(config.cookie_parser_secret, config.default_cookie_parser_secret);

// Check whether the secret have been set in the file or not
if ((config.cookie_secret === config.default_cookie_secret) || (config.cookie_parser_secret === config.default_cookie_parser_secret))
{
	console.log("Cookie secret phrase has the default value. Update the config");
	process.exit(1);
}

config.default_format = coalesce(config.default_format, "html");
config.external       = (config.js_debug_level === 'debug') ? frontend_scripts.debug_scripts : frontend_scripts.prod_scripts;

// Log file options
config.logfile               = coalesce(config.logfile, {});
config.logfile.filename      = coalesce(config.logfile.filename, "/var/log/3drepo.org");
config.logfile.console_level = coalesce(config.logfile.console_level, "info");
config.logfile.file_level    = coalesce(config.logfile.file_level, "info");

module.exports = config;
