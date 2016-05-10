/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function() {
	"use strict";

	var express = require("express"),
		fs = require("fs"),
		constants = require("constants");

	var cluster = require("cluster");

	var log_iface = require("./backend/logger.js");
	var systemLogger = log_iface.systemLogger;

	var config = require("./backend/config.js");

	var https = require("https");
	var http = require("http");

	var vhost = require("vhost");

	if ("ssl" in config) {
		var ssl_options = {
			key: fs.readFileSync(config.ssl.key, "utf8"),
			cert: fs.readFileSync(config.ssl.cert, "utf8"),
			ciphers: "ECDHE-ECDSA-AES128-GCM-SHA256|ECDHE-ECDSA-AES256-SHA:!RC4:!aNULL",
			//ciphers: "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PS:!SSLv3",
			honorCipherOrder: true,
			ecdhCurve: "secp384r1",
			secureOptions: constants.SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION|constants.SSL_OP_NO_SSLv2|constants.SSL_OP_NO_SSLv3
		};

		// This is the optional certificate authority
		if (config.ssl.ca) {
			ssl_options.ca = fs.readFileSync(config.ssl.ca, "utf8");
		}

		var http_app = express();

		// If someone tries to access the site through http redirect to the encrypted site.
		http_app.get("*", function(req, res) {
			res.redirect("https://" + req.headers.host + req.url);
		});

		http.createServer(http_app).listen(config.servers[0].http_port, config.servers[0].hostname, function() {
			systemLogger.logInfo("Starting routing HTTP for " + config.servers[0].hostname + " service on port " + config.servers[0].http_port);
		});
	}

	var serverStartFunction = function(serverHost, serverPort) {
		return function() {
			systemLogger.logInfo("Starting server on " + serverHost + " port " + serverPort);
		};
	};

	var mainApp = express();

	if (cluster.isMaster) {
		for(var i = 0; i < config.numThreads; i++)
		{
			cluster.fork();
		}

		cluster.on("exit", function(worker, code, signal) {
			console.log("EXIT!!!!!");
		});
	} else {
		for(let subdomain in config.subdomains)
		{
			if (config.subdomains.hasOwnProperty(subdomain))
			{
				var subDomainApp = express();

				let subdomainServers = config.subdomains[subdomain];

				for(let s_idx = 0; s_idx < subdomainServers.length; s_idx++)
				{
					let serverConfig = subdomainServers[s_idx];

					systemLogger.logInfo("Loading " + serverConfig.service + " on " + serverConfig.hostname + serverConfig.host_dir);

					if (!serverConfig.external)
					{
						let app = require("./backend/services/" + serverConfig.service + ".js").createApp(serverConfig);

						subDomainApp.use(serverConfig.host_dir, app);
					}

					// If the configuration specifies a redirect then apply
					// it at this point
					if (serverConfig.redirect)
					{
						mainApp.all(/.*/, function(req, res, next) {
							var host = req.header("host");
							var redirect = Array.isArray(serverConfig.redirect) ? serverConfig.redirect : [serverConfig.redirect];

							for(var i = 0; i < redirect.length; i++)
							{
								if (host.match(redirect[i]))
								{
									res.redirect(301, serverConfig.base_url);
								} else {
									next();
								}
							}
						});
					}
				}

				console.log("SD: " + subdomain);

				if (subdomain !== "undefined")
				{
					mainApp.use(vhost(subdomain + "." + config.host, subDomainApp));
				} else {
					mainApp.use(vhost(config.host, subDomainApp));
				}
			}
		}

		var server = config.using_ssl ? https.createServer(ssl_options, mainApp) : http.createServer(mainApp);
		server.listen(config.port, "0.0.0.0", serverStartFunction("0.0.0.0", config.port));
	}
}());
