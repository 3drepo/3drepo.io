const axios = require('axios');
const config = require('../../../utils/config');
const msal = require('@azure/msal-node');
const { msGraphUserDetailsUri } = require('./aad.constants');
const ssoLabel = require('../../../utils/logger').labels.sso;
const logger = require('../../../utils/logger').logWithLabel(ssoLabel);
const { templates } = require('../../../utils/responseCodes');
const { get } = require('../../../utils/webRequests');

const Aad = {};

let clientApplication;

const checkAadConfig = () => {
    if (!config.sso?.aad?.authority || !config.sso?.aad?.clientId || !config.sso?.aad?.clientSecret) {
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
        }
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

    const tokenRequest = {
        code: authCode,
        redirectUri,
        codeVerifier
    };

    const clientApplication = getClientApplication();
    const response = await clientApplication.acquireTokenByCode(tokenRequest);

    const user = await get(msGraphUserDetailsUri, {
        Authorization: `Bearer ${response.accessToken}`,
    });

    return user;
};



module.exports = Aad;
