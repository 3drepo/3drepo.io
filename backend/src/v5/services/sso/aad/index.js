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
const aadLabel = require('../../../utils/logger').labels.aad;
const logger = require('../../../utils/logger').logWithLabel(aadLabel);
const { msGraphUserDetailsUri } = require('./aad.constants');
const msal = require('@azure/msal-node');
const { templates } = require('../../../utils/responseCodes');
const { errorCodes } = require('../sso.constants');

const Aad = {};

let clientApplication;

const checkAadConfig = () => {
	if (!config.sso?.aad?.clientId || !config.sso?.aad?.clientSecret || !config.sso?.aad?.authority) {
		throw templates.ssoNotAvailable;
	}
};

const getClientApplication = () => {
	if (!clientApplication) {
		checkAadConfig();

		const loggerOptions = {
			loggerCallback: (loglevel, message) => {
				logger.logDebug(message);
			},
			logLevel: msal.LogLevel.Verbose,
		};
		const clientAppConfig = { auth: config.sso.aad, system: { loggerOptions } };
		clientApplication = new msal.ConfidentialClientApplication(clientAppConfig);
	}

	return clientApplication;
};

Aad.getAuthenticationCodeUrl = (params) => {
	const clientApp = getClientApplication();
	return clientApp.getAuthCodeUrl(params);
};

Aad.getUserDetails = async (code, redirectUri, codeVerifier) => {
	const tokenRequest = { code, redirectUri, codeVerifier };
	const clientApp = getClientApplication();
	try{
		const token = await clientApp.acquireTokenByCode(tokenRequest);
		const response = await get(msGraphUserDetailsUri, { Authorization: `Bearer ${token.accessToken}`, });
		return response;
	} catch {
		throw errorCodes.failedToFetchDetails;
	}
};

module.exports = Aad;
