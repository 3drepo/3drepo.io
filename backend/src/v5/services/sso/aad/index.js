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

const aadLabel = require('../../../utils/logger').labels.aad;
const config = require('../../../utils/config');
const { errorCodes } = require('../sso.constants');
const logger = require('../../../utils/logger').logWithLabel(aadLabel);
const msal = require('@azure/msal-node');
const { templates } = require('../../../utils/responseCodes');

const Aad = {};

let clientApplication;

const cryptoProvider = new msal.CryptoProvider();

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

Aad.generateCryptoHash = cryptoProvider.base64Encode;
Aad.decryptCryptoHash = cryptoProvider.base64Decode;
Aad.getAuthenticationCodeUrl = (params) => {
	const clientApp = getClientApplication();
	return clientApp.getAuthCodeUrl(params);
};

Aad.getUserDetails = async (code, redirectUri, codeVerifier) => {
	const tokenRequest = { code, redirectUri, codeVerifier };
	const clientApp = getClientApplication();
	try {
		const { idTokenClaims: userInfo } = await clientApp.acquireTokenByCode(tokenRequest);
		return {
			firstName: userInfo.given_name,
			lastName: userInfo.family_name,
			id: userInfo.oid,
			email: userInfo.email,
		};
	} catch (err) {
		logger.logError(`Failed to fetch MS user details: ${err.message}`);
		throw errorCodes.UNKNOWN;
	}
};

module.exports = Aad;
