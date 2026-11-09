/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { apmSchema, chatSchema, dataLimitsSchema, serverSchema, sslSchema } = require('./config.schema');
const { FileStorageTypes, acceptedImageFormats, acceptedModelFormats, countryListing } = require('./config.constants');
const { VERSION } = require('../../../VERSION.json');
const Yup = require('yup');
const { deleteIfUndefined } = require('./helper/objects');

const ConfigObject = {};

const getEnv = (envName) => {
	const value = process.env[envName];

	// Sometimes it's being set as empty string, treat it as undefined
	return value?.length ? value : undefined;
};

ConfigObject.getAPMConfig = () => {
	if (getEnv('APP_WEB_APM_ENABLED')) {
		return apmSchema.validateSync({});
	}
	return undefined;
};

const getSSLConfig = () => {
	if (getEnv('APP_WEB_SSL_KEY')) {
		return sslSchema.validateSync({});
	}

	return undefined;
};

ConfigObject.getUMask = () => {
	const umask = getEnv('APP_WEB_UMASK');

	const umaskValidator = Yup.string().test('valid-umask', 'Invalid umask value', (value) => {
		if (!value) return false;

		// Accept: 0o002, 002, 077, 777
		if (!/^(?:0o)?[0-7]{1,4}$/.test(value)) {
			return false;
		}

		const parsed = Number(value.startsWith('0o') ? value : `0o${value}`);

		return parsed >= 0 && parsed <= 0o777;
	});

	return Yup.validateSync(umask, umaskValidator);
};

ConfigObject.getServerConfig = () => {
	const sslConfig = getSSLConfig();
	const isHTTPS = !!sslConfig;
	const httpPort = Number(getEnv('APP_WEB_HTTP_PORT') ?? 80);
	const serverConfig = {
		bindAddress: getEnv('APP_WEB_SERVER_BIND_ADDRESS'),
		port: isHTTPS ? Number(getEnv('APP_WEB_SERVER_HTTPS_PORT') ?? 443) : httpPort,
		httpPort,
		timeout: getEnv('APP_WEB_SERVER_TIMEOUT'),
		isHTTPS,
		sslConfig,
	};
	const config = serverSchema.validateSync(serverConfig);

	let publicProtocol = getEnv('APP_WEB_PUBLIC_PROTOCOL');

	if (!publicProtocol) {
		publicProtocol = isHTTPS ? 'https' : 'http';
	}

	config.publicProtocol = publicProtocol;

	return config;
};

ConfigObject.getChatConfig = () => {
	const chatConfig = chatSchema.validateSync({
		chatOnPublicPort: getEnv('APP_WEB_CHATONPUBLICPORT'),
		port: Number(getEnv('APP_WEB_CHAT_PORT') ?? 3000),
		subDomain: getEnv('APP_WEB_CHAT_SUBDOMAIN'),
	});

	const { host, publicProtocol, port } = ConfigObject.getServerConfig();

	const hostname = chatConfig.chatOnPublicPort ? host : `${host}:${chatConfig.port}`;

	chatConfig.host = `${publicProtocol}://${hostname}:${chatConfig.chatOnPublicPort ? port : chatConfig.port}`;

	return chatConfig;
};

ConfigObject.isMaintenanceMode = () => getEnv('APP_WEB_MAINTENANCEMODE') === 'true';
ConfigObject.isDevelopmentMode = () => getEnv('APP_WEB_DEVELOPMENT') === 'true';
ConfigObject.isBypassAuth = () => getEnv('APP_BYPASS_AUTH') === 'true';

ConfigObject.getElasticConfig = () => {
	if (!getEnv('APP_WEB_ELASTIC_ENABLED')) return undefined;

	const elasticConfig = deleteIfUndefined({
		reload_connections: true,
		maxRetries: 5,
		request_timeout: 60,
		namespace: getEnv('APP_WEB_ELASTIC_NAMESPACE'),
		cloud: getEnv('APP_WEB_ELASTIC_CLOUD_ID') ? {
			id: getEnv('APP_WEB_ELASTIC_CLOUD_ID'),
		} : undefined,
		node: getEnv('APP_WEB_ELASTIC_NODE') ? getEnv('APP_WEB_ELASTIC_NODE') : undefined,
		auth: deleteIfUndefined({
			username: getEnv('APP_WEB_ELASTIC_USERNAME'),
			password: getEnv('APP_WEB_ELASTIC_PASSWORD'),
			apiKey: getEnv('APP_WEB_ELASTIC_CLOUD_APIKEY'),
		}),

	});

	return elasticConfig;
};

ConfigObject.getLogConfig = () => {
	const logConfig = {
		consoleLevel: getEnv('APP_WEB_LOGFILE_CONSOLE_LEVEL'),
		jsonOutput: getEnv('APP_WEB_LOGFILE_JSONOUTPUT') === 'true',
		noColors: getEnv('APP_WEB_LOGFILE_NOCOLORS') === 'true',
		silent: getEnv('APP_WEB_LOGFILE_SILENT') === 'true',
	};

	return logConfig;
};

ConfigObject.getDataLimits = () => {
	const dataLimits = {
		modelUploadSize: Number(getEnv('APP_WEB_UPLOADSIZELIMIT')),
		resourceUploadSize: Number(getEnv('APP_WEB_RESOURCEUPLOADSIZELIMIT')),
		imageSizeLimit: Number(getEnv('APP_WEB_IMAGESIZELIMIT')),
	};

	return dataLimitsSchema.validateSync(dataLimits);
};

ConfigObject.getHereKey = () => getEnv('APP_WEB_HERE_APIKEY');

ConfigObject.getRepoLicense = () => getEnv('REPOLICENSE');

ConfigObject.getApryseLicense = () => getEnv('APP_WEB_APRYSE_WEBVIEWERLICENSEKEY');

ConfigObject.getAppVersion = () => VERSION;

ConfigObject.getInterComConfig = () => ({
	license: getEnv('APP_WEB_INTERCOMLICENSE'),
	secretKey: getEnv('APP_WEB_INTERCOMSECRETKEY'),
	accessToken: getEnv('APP_WEB_INTERCOMACCESSTOKEN'),
});

ConfigObject.getCachePolicy = () => ({
	maxAge: Number(getEnv('APP_WEB_CACHE_MAXAGE')) ?? 3600,
});

ConfigObject.getImageExtensions = () => acceptedImageFormats;

ConfigObject.getModelFileExtensions = () => acceptedModelFormats;

ConfigObject.getCountriesListing = () => countryListing;

module.exports = ConfigObject;
