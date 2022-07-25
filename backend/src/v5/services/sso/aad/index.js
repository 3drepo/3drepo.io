/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const config = require('../../../utils/config');
const { get } = require('../../../utils/webRequests');
const ssoLabel = require('../../../utils/logger').labels.sso;
const logger = require('../../../utils/logger').logWithLabel(ssoLabel);
const { msGraphUserDetailsUri } = require('./aad.constants');
const msal = require('@azure/msal-node');
const { templates } = require('../../../utils/responseCodes');

const Aad = {};

let clientApplication;

const checkAadConfig = () => {
	if (!config.sso?.aad?.clientId || !config.sso?.aad?.clientSecret) {
		throw templates.ssoNotAvailable;
	}
};

const getClientApplication = () => {
	checkAadConfig();

	if (!clientApplication) {
		const loggerOptions = {
			loggerCallback: (loglevel, message) => {
				logger.logInfo(message);
			},
			logLevel: msal.LogLevel.Verbose,
		};
		const clientAppConfig = { auth: config.sso.aad, system: { loggerOptions } };
		clientApplication = new msal.ConfidentialClientApplication(clientAppConfig);
	}

	return clientApplication;
};

Aad.getAuthenticationCodeUrl = (params) => {
	checkAadConfig();

	const clientApp = getClientApplication();
	return clientApp.getAuthCodeUrl(params);
};

Aad.getUserDetails = async (authCode, redirectUri, codeVerifier) => {
	checkAadConfig();

	const tokenRequest = { code: authCode, redirectUri, codeVerifier };
	const clientApp = getClientApplication();
	const response = await clientApp.acquireTokenByCode(tokenRequest);

	const user = await get(msGraphUserDetailsUri, {
		Authorization: `Bearer ${response.accessToken}`,
	});

	return user;
};

module.exports = Aad;
