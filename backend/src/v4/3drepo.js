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
const config = require("./config.js");
const express = require("express");
const compression = require("compression");
const fs = require("fs");

const logger = require("./logger.js");
const systemLogger = logger.systemLogger;

const https = require("https");
const http = require("http");
const tls  = require("tls");
const vhost = require("vhost");
const crypto = require("crypto");
const utils = require("./utils");

const { v5Path } = require("../interop");
const { sendSystemEmail } = require(`${v5Path}/services/mailer`);
const { templates } = require(`${v5Path}/services/mailer/mailer.constants`);

const certs = {};
const certMap = {};
let sslOptions = {};

process.on("unhandledRejection", async (err) => {
	try {
		systemLogger.logError(`Unhandled promise rejection found with error: ${err?.message || err}`);
		await sendSystemEmail(templates.ERROR_NOTIFICATION.name, {err, title: "Application exiting on unhandled promise rejection", message: "Unhandled promise rejection found"});
	} catch(mailErr) {
		systemLogger.logError(`Failed to send email: ${mailErr.message}`);
	}

	// eslint-disable-next-line no-process-exit
	process.exit(-1);
});

function initAPM() {
	systemLogger.logInfo("Initialising APM:");
	// Any option not supplied via the options object can instead be configured using environment variables, however an empty elastic array required to initialise in the app
	const apm = require("elastic-apm-node");
	apm.start({
		// Override service name from package.json
		// Allowed characters: a-z, A-Z, 0-9, -, _, and space
		serviceName: config.apm.serviceName || "",
		// Use if APM Server requires a token
		secretToken: config.apm.secretToken || "",
		// Set custom APM Server URL (default: http://localhost:8200)
		serverUrl: config.apm.serverUrl || "",
		logLevel: config.apm.logLevel || ""
	});
}

function setupSSL() {
	if ("ssl" in config) {

		for (const certGroup in config.ssl) {

			if (utils.hasField(config.ssl, certGroup)) {
				const certGroupOptions = {};

				certGroupOptions.key = fs.readFileSync(config.ssl[certGroup].key, "utf8");
				certGroupOptions.cert = fs.readFileSync(config.ssl[certGroup].cert, "utf8");

				if (config.ssl[certGroup].ca) {
					certGroupOptions.ca = fs.readFileSync(config.ssl[certGroup].ca, "utf8");
				}

				certs[certGroup] = tls.createSecureContext(certGroupOptions);

			}

		}

		sslOptions = {
			SNICallback: function(domain, callback) {
				const certGroup = certMap[domain];
				callback(null, certs[certGroup]);
			},
			key: fs.readFileSync(config.ssl["default"].key, "utf8"),
			cert: fs.readFileSync(config.ssl["default"].cert, "utf8"),
			// ciphers: "ECDHE-ECDSA-AES128-GCM-SHA256|ECDHE-ECDSA-AES256-SHA:!RC4:!aNULL",
			// ciphers: "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PS:!SSLv3",
			honorCipherOrder: true,
			ecdhCurve: "secp384r1",
			secureOptions: crypto.constants.SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION |
						crypto.constants.SSL_OP_NO_SSLv2 |
						crypto.constants.SSL_OP_NO_SSLv3
		};

		// This is the optional certificate authority
		if (config.ssl["default"].ca) {
			sslOptions.ca = fs.readFileSync(config.ssl["default"].ca, "utf8");
		}
	}
}

function handleHTTPSRedirect() {
	if (config.HTTPSredirect) {
		const http_app = express();
		const redirect = express();

		// If someone tries to access the site through http redirect to the encrypted site.
		http_app.use(vhost(config.host, redirect));
		config.servers.forEach((server) => {
			if (server.service === "frontend" && server.subdomain) {
				http_app.use(vhost(server.subdomain + "." + config.host, redirect));
			}
		});
		redirect.get("*", function(req, res) {
			// Do not redirect if user uses IE6 because it doesn"t suppotr TLS 1.2
			const isIe = req.headers["user-agent"].toLowerCase().indexOf("msie 6") === -1;
			if(!req.headers["user-agent"] || isIe) {
				res.redirect("https://" + req.headers.host + req.url);
			} else {
				res.sendFile(__dirname + "/resources/ie6.html");
			}
		});

		// listen on hostname not working on ie6, therefore listen on 0.0.0.0, and use vhost lib instead
		http.createServer(http_app).listen(config.http_port, "0.0.0.0", function() {
			systemLogger.logInfo("Starting routing HTTP for " + config.host + " service on port " + config.http_port);
		});

	}
}

function runServer() {

	if (config.apm) {
		initAPM();
	}

	// The core express application
	const mainApp = express();
	mainApp.use(compression());

	const cors = require("cors");
	mainApp.use(cors({origin: true, credentials: true}));

	if(utils.hasField(config, "umask")) {
		systemLogger.logInfo("Setting umask: " + config.umask);
		process.umask(config.umask);
	}

	// Peform setup for various parts of the server
	setupSSL();
	handleHTTPSRedirect();
	handleSubdomains(mainApp);

	const server = config.using_ssl ?
		https.createServer(sslOptions, mainApp) :
		http.createServer(mainApp);

	const startFunc = serverStartFunction("0.0.0.0", config.port);

	server.setTimeout(config.timeout * 1000);
	server.listen(config.port, "0.0.0.0", startFunc);
	// .on('error', function(error) {
	// 	systemLogger.logInfo(error);
	// });

}

function handleSubdomains(mainApp) {
	if (utils.hasField(config, "subdomains")) {
		for (const subdomain in config.subdomains) {
			if (utils.hasField(config.subdomains, subdomain)) {
				setupSubdomain(mainApp, subdomain);
			}
		}
	}
}

function setupSubdomain(mainApp, subdomain) {
	const subDomainApp = express();

	const subdomainServers = config.subdomains[subdomain];

	for (let subId = 0; subId < subdomainServers.length; subId++) {

		const serverConfig = { ...subdomainServers[subId], using_ssl: config.using_ssl, public_protocol: config.public_protocol };

		// Certificate group
		const certGroup = serverConfig.certificate ? serverConfig.certificate : "default";
		certMap[serverConfig.hostname] = certGroup;

		if (!serverConfig.external) {

			// Only load frontend server in maintenance mode
			if(!config.maintenanceMode || serverConfig.service === "frontend") {
				logCreateService(serverConfig);
				// chat server has its own port and can't attach to express
				serverConfig.service === "chat" ? createChat(serverConfig) : createService(subDomainApp, serverConfig);
			}

		}
		// If the configuration specifies a redirect then apply
		// it at this point
		if (serverConfig.redirect) {
			configRedirect(serverConfig, mainApp);
		}
	}

	if (subdomain !== "undefined") {
		const subdomainHost = subdomain + "." + config.host;
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
		serverConfig.port
	);
}

function createChat(serverConfig) {
	const server = config.using_ssl ?
		https.createServer(sslOptions) :
		http.createServer();

	server.listen(
		serverConfig.port,
		"0.0.0.0",
		serverStartFunction("0.0.0.0", serverConfig.port)
	);

	const service = `./services/${serverConfig.service}.js`;
	require(service).createApp(server, serverConfig);
}

let firstAPIServer = true;

async function createService(subDomainApp, serverConfig) {
	const service = `./services/${serverConfig.service}.js`;
	// This is a dirty hack to ensure we don't init v5 multiple times.
	// But we need v5 to be initialised on the api server for testing.
	// We should rethink this when we migrate this file to v5.
	const isAPI = serverConfig.service === "api";

	const appService = require(service);
	let app;
	if(isAPI) {
		app = await appService.createAppAsync(serverConfig, firstAPIServer);
		firstAPIServer = false;

	} else {
		app = appService.createApp(serverConfig);
	}
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
