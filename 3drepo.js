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

	const express = require("express"),
		fs = require("fs"),
		constants = require("constants");

	const cluster = require("cluster");

	const log_iface = require("./backend/logger.js");
	const systemLogger = log_iface.systemLogger;

	const config = require("./backend/config.js");

	const https = require("https");
	const http = require("http");
	const tls  = require("tls");
	const vhost = require("vhost");

	let certs   = {};
	let certMap = {};
	let ssl_options = {};

	if ("ssl" in config) {
		let ssl_certs = {};

		for (let certGroup in config.ssl)
		{
			let certGroupOptions = {};

			certGroupOptions.key = fs.readFileSync(config.ssl[certGroup].key, "utf8");
			certGroupOptions.cert = fs.readFileSync(config.ssl[certGroup].cert, "utf8");

			if (config.ssl[certGroup].ca)
			{
				certGroupOptions.ca = fs.readFileSync(config.ssl[certGroup].ca, "utf8");
			}

			certs[certGroup] = tls.createSecureContext(certGroupOptions);
		}

		ssl_options = {
			SNICallback: function(domain, callback)
			{
				let certGroup = certMap[domain];
				callback(null, certs[certGroup]);
			},
			key: fs.readFileSync(config.ssl["default"].key, "utf8"),
			cert: fs.readFileSync(config.ssl["default"].cert, "utf8"),
			ciphers: "ECDHE-ECDSA-AES128-GCM-SHA256|ECDHE-ECDSA-AES256-SHA:!RC4:!aNULL",
			//ciphers: "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PS:!SSLv3",
			honorCipherOrder: true,
			ecdhCurve: "secp384r1",
			secureOptions: constants.SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION|constants.SSL_OP_NO_SSLv2|constants.SSL_OP_NO_SSLv3
		};

		// This is the optional certificate authority
		if (config.ssl["default"].ca) {
			ssl_options.ca = fs.readFileSync(config.ssl["default"].ca, "utf8");
		}

		if (config.HTTPSredirect)
		{
			let http_app = express();

			// If someone tries to access the site through http redirect to the encrypted site.
			http_app.get("*", function(req, res) {
				res.redirect("https://" + req.headers.host + req.url);
			});

			http.createServer(http_app).listen(config.servers[0].http_port, config.servers[0].hostname, function() {
				systemLogger.logInfo("Starting routing HTTP for " + config.servers[0].hostname + " service on port " + config.servers[0].http_port);
			});
		}
	}

	let serverStartFunction = function(serverHost, serverPort) {
		return function() {
			systemLogger.logInfo("Starting server on " + serverHost + " port " + serverPort);
		};
	};

	let mainApp = express();

	if (cluster.isMaster) {
		for(let i = 0; i < config.numThreads; i++)
		{
			cluster.fork();
		}
	} else {
		for(let subdomain in config.subdomains)
		{
			if (config.subdomains.hasOwnProperty(subdomain))
			{
				let subDomainApp = express();

				let subdomainServers = config.subdomains[subdomain];

				for(let s_idx = 0; s_idx < subdomainServers.length; s_idx++)
				{
					let serverConfig = subdomainServers[s_idx];

					// My certificate group
					let myCertGroup = serverConfig.certificate ? serverConfig.certificate : "default";
					certMap[serverConfig.hostname] = myCertGroup;

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
							let host = req.header("host");
							let redirect = Array.isArray(serverConfig.redirect) ? serverConfig.redirect : [serverConfig.redirect];

							for(let i = 0; i < redirect.length; i++)
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

				if (subdomain !== "undefined")
				{
					mainApp.use(vhost(subdomain + "." + config.host, subDomainApp));
				} else {
					mainApp.use(vhost(config.host, subDomainApp));
				}
			}
		}

		let server = config.using_ssl ? https.createServer(ssl_options, mainApp) : http.createServer(mainApp);
		server.listen(config.port, "0.0.0.0", serverStartFunction("0.0.0.0", config.port));
	}
}());
