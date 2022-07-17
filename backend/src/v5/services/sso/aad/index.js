const axios = require('axios');
const config = require('../config');
const msal = require('@azure/msal-node');
const { templates } = require('../../../utils/responseCodes');

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
        const clientAppConfig = { auth: config.sso.aad };
        clientApplication = new msal.ConfidentialClientApplication(clientAppConfig);
    }

    return clientApplication;
};

Aad.getAuthenticationCodeUrl = (params) => {
    checkAadConfig();

    const clientApp = getClientApplication();
    return clientApp.getAuthCodeUrl(params);
};

Aad.getUserDetails = async (authCode, redirectUri) => {
    checkAadConfig();
    
    const tokenRequest = { code: authCode, redirectUri };
    const clientApplication = getClientApplication();
    const response = await clientApplication.acquireTokenByCode(tokenRequest);

    const user = await axios.default.get(msGraphUserDetailsUri, {
        headers: {
            Authorization: `Bearer ${response.accessToken}`,
        },
    });

    return user;
};



module.exports = Aad;
