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

"use strict";

const express = require("express");
const fs = require("fs");
const constants = require("constants");

const logger = require("./logger.js");
const systemLogger = logger.systemLogger;

const config = require("./config.js");

const https = require("https");
const http = require("http");
const tls  = require("tls");
const vhost = require("vhost");

let certs = {};
let certMap = {};
let sslOptions = {};

function setupSSL() {
	if ("ssl" in config) {

		for (let certGroup in config.ssl) {
	
			if (config.ssl.hasOwnProperty(certGroup)) {
				let certGroupOptions = {};
	
				certGroupOptions.key = fs.readFileSync(config.ssl[certGroup].key, "utf8");
				certGroupOptions.cert = fs.readFileSync(config.ssl[certGroup].cert, "utf8");
	
				if (config.ssl[certGroup].ca) {
					certGroupOptions.ca = fs.readFileSync(config.ssl[certGroup].ca, "utf8");
				}
	
				certs[certGroup] = tls.createSecureContext(certGroupOptions);
				
			}
	
		}
	
		sslOptions = {
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
			secureOptions: constants.SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION | 
						constants.SSL_OP_NO_SSLv2 | 
						constants.SSL_OP_NO_SSLv3
		};
	
		// This is the optional certificate authority
		if (config.ssl["default"].ca) {
			sslOptions.ca = fs.readFileSync(config.ssl["default"].ca, "utf8");
		}
	}
}


function handleHTTPSRedirect() {
	if (config.HTTPSredirect) {

		let http_app = express();
		let redirect = express();

		// If someone tries to access the site through http redirect to the encrypted site.
		http_app.use(vhost(config.host, redirect));
		redirect.get("*", function(req, res) {
			//Do not redirect if user uses IE6 because it doesn"t suppotr TLS 1.2
			const isIe = req.headers["user-agent"].toLowerCase().indexOf("msie 6") === -1;
			if(!req.headers["user-agent"] || isIe){
				res.redirect("https://" + req.headers.host + req.url);
			} else {
				res.sendFile(__dirname + "/pug/ie6.html");
			}
		});

		// listen on hostname not working on ie6, therefore listen on 0.0.0.0, and use vhost lib instead
		http.createServer(http_app).listen(config.http_port, "0.0.0.0", function() {
			systemLogger.logInfo("Starting routing HTTP for " + config.host + " service on port " + config.http_port);
		});

	}
}

function runServer() {
	// The core express application
	const mainApp = express();

	// Peform setup for various parts of the server
	// setupSSL();
	// handleHTTPSRedirect();
	// handleSubdomains(mainApp);
	
	const server = config.using_ssl ? 
					https.createServer(sslOptions, mainApp) : 
					http.createServer(mainApp);

	const startFunc = serverStartFunction("0.0.0.0", config.port);

	server.setTimeout(config.timeout * 1000);
	server.listen(config.port, "0.0.0.0", startFunc)
		// .on('error', function(error) { 
		// 	systemLogger.logInfo(error);
		// });

}

function handleSubdomains(mainApp) {
	if (config.hasOwnProperty("subdomains")) {
		for (let subdomain in config.subdomains) {
			if (config.subdomains.hasOwnProperty(subdomain)) {
				setupSubdomain(mainApp, subdomain);
			}
		}
	}
}

function setupSubdomain(mainApp, subdomain) {
	let subDomainApp = express();
	
	let subdomainServers = config.subdomains[subdomain];

	for (let subId = 0; subId < subdomainServers.length; subId++) {

		let serverConfig = subdomainServers[subId];

		// Certificate group
		let certGroup = serverConfig.certificate ? serverConfig.certificate : "default";
		certMap[serverConfig.hostname] = certGroup;

		logCreateService(serverConfig);

		if (!serverConfig.external) {

			if(serverConfig.service === "chat"){
				//chat server has its own port and can't attach to express
				createChat(serverConfig);
				
			} else {
				
				createService(subDomainApp, serverConfig);

			}

		}
		// If the configuration specifies a redirect then apply
		// it at this point
		if (serverConfig.redirect) {
			configRedirect(serverConfig, mainApp);
		}
	}

	if (subdomain !== "undefined") {
		let subdomainHost = subdomain + "." + config.host;
		mainApp.use(vhost(subdomainHost, subDomainApp));
	} else {
		mainApp.use(vhost(config.host, subDomainApp));
	}
}

function logCreateService(serverConfig) {
	systemLogger.logInfo(
		"Loading " + 
		serverConfig.service + 
		" on " + serverConfig.hostname + ":" +
		serverConfig.port, 
		serverConfig.host_dir
	);
}

function createChat(serverConfig) {
	let server = config.using_ssl ? 
		https.createServer(sslOptions) : 
		http.createServer();

	server.listen(
		serverConfig.port, 
		"0.0.0.0", 
		serverStartFunction("0.0.0.0", serverConfig.port)
	);
	
	let service = `./services/${serverConfig.service}.js`;
	require(service).createApp(server, serverConfig);
}

function createService(subDomainApp, serverConfig) {
	let service = `./services/${serverConfig.service}.js`;
	let app = require(service).createApp(serverConfig);

	subDomainApp.use(serverConfig.host_dir, app);
}

function serverStartFunction(serverHost, serverPort) {
	return function() {
		systemLogger.logInfo("Starting server on " + serverHost + " port " + serverPort);
	};
}

function configRedirect(serverConfig, app) {

	app.all(/.*/, function(req, res, next) {
		const host = req.header("host");
		const redirectArr = Array.isArray(serverConfig.redirect);
		const redirect = (redirectArr) ? serverConfig.redirect : [serverConfig.redirect];

		for(let i = 0; i < redirect.length; i++) {

			if (host.match(redirect[i])) {
				res.redirect(301, serverConfig.base_url);
			} else {
				next();
			}

		}
	});

}

runServer();