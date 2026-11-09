const { getAPMConfig, getChatConfig, getServerConfig, getUMask, isMaintenanceMode } = require('./v5/utils/config');
const APM = require('elastic-apm-node');
const Express = require('express');
const compression = require('compression');
const cors = require('cors');
const { createAppAsync: createAPIAppAsync } = require('./v4/services/api');
const { createApp: createChatApp } = require('./v4/services/chat');
const { createApp: createFrontendApp } = require('./v4/services/frontend');
const crypto = require('crypto');
const http = require('http');
const https = require('https');
const { logger } = require('./v5/utils/logger');
const { readFileSync } = require('fs');
const { sendSystemEmail } = require('./v5/services/mailer');
const { templates } = require('./v5/services/mailer/mailer.constants');

const vhost = require('vhost');

const initialiseAPM = () => {
	const apmConfig = getAPMConfig();
	if (apmConfig) {
		logger.logInfo('Initialising APM...');
		APM.start(apmConfig);
	}
};

const setup = () => {
	const umask = getUMask();
	if (umask) {
		logger.logInfo(`Setting umask: ${umask}`);
		process.umask(umask);
	}
	initialiseAPM();
};

const setupSSLOptions = (sslConfig) => {
	const sslOptions = {
		key: readFileSync(sslConfig.key, 'utf8'),
		cert: readFileSync(sslConfig.cert, 'utf8'),
		honorCipherOrder: true,
		ecdhCurve: 'secp384r1', // P-384 standardized NIST elliptic curve
		// eslint-disable-next-line no-bitwise
		secureOptions: crypto.constants.SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION
                                | crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_SSLv3,
	};

	if (sslConfig.ca) {
		sslOptions.ca = readFileSync(sslConfig.ca, 'utf8');
	}

	return sslOptions;
};

const setupHTTPSRedirect = (host, bindAddress, httpPort) => {
	const httpApp = Express();
	const redirect = Express();

	// If someone tries to access the site through http redirect to the encrypted site.
	httpApp.use(vhost(host, redirect));

	redirect.get('*', (req, res) => {
		// Do not redirect if user uses IE6 because it doesn"t suppotr TLS 1.2
		const isIe = req.headers['user-agent'].toLowerCase().indexOf('msie 6') === -1;
		if (!req.headers['user-agent'] || isIe) {
			res.redirect(`https://${req.headers.host}${req.url}`);
		} else {
			res.sendFile(`${__dirname}/resources/ie6.html`);
		}
	});

	// listen on hostname not working on ie6, therefore listen on 0.0.0.0, and use vhost lib instead
	http.createServer(httpApp).listen(httpPort, bindAddress, () => {
		logger.logInfo(`Starting routing HTTP direct for ${host} service on port ${httpPort}`);
	});
};

const initialiseServices = async (mainApp, sslOptions, host) => {
	const app = Express();

	logger.logInfo('Initialising frontend services...');
	const frontendApp = createFrontendApp({});
	app.use('/', frontendApp);

	if (isMaintenanceMode()) {
		logger.logInfo('Application is in maintenance mode');
	} else {
		logger.logInfo('Initialising backend services...');
		const backendApp = await createAPIAppAsync({}, false);
		app.use('/api', backendApp);

		const chatServer = sslOptions
			? https.createServer(sslOptions, app)
			: http.createServer(app);

		const chatConfig = getChatConfig();

		chatServer.listen(
			chatConfig.port,
			'0.0.0.0',
			() => {
				logger.logInfo(`Chat server listening on port ${chatConfig.port}`);
			},
		);
		createChatApp(chatServer, chatConfig);
	}

	mainApp.use(vhost(host, app));
};

const initialiseWebServer = async () => {
	const mainApp = Express();
	mainApp.use(compression());
	mainApp.use(cors({ origin: true, credentials: true }));

	const { host, sslConfig, bindAddress, port, isHTTPS, timeout, httpsRedirect, httpPort } = getServerConfig();

	if (isHTTPS && httpsRedirect) {
		setupHTTPSRedirect(host, bindAddress, httpPort);
	}

	let server;

	const sslOptions = isHTTPS ? setupSSLOptions(sslConfig) : undefined;

	if (isHTTPS) {
		server = https.createServer(sslOptions, mainApp);
	} else {
		server = http.createServer(mainApp);
	}

	server.setTimeout(timeout);
	server.listen(port, bindAddress, () => {
		logger.logInfo(`Main server listening on ${isHTTPS ? 'https' : 'http'}://${bindAddress}:${port}`);
	});

	await initialiseServices(mainApp, sslOptions, host);
};

// on unhandled promise rejection, log the error and send an email notification before exiting the process
process.on('unhandledRejection', async (err) => {
	logger.logError(`Unhandled promise rejection found with error: ${err?.message || err}`);
	await sendSystemEmail(templates.ERROR_NOTIFICATION.name, { err, title: 'Application exiting on unhandled promise rejection', message: 'Unhandled promise rejection found' }, undefined, true);
	// eslint-disable-next-line n/no-process-exit
	process.exit(-1);
});

setup();
initialiseWebServer();
