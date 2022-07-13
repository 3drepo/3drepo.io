const config = require('../config');
const msal = require('@azure/msal-node');

const Aad = {};

const clientAppConfig = { auth: config.sso.aad.authOptions };
let clientApplication

Aad.getClientApplication = () => {
    if (!clientApplication) {
        clientApplication = new msal.ConfidentialClientApplication(clientAppConfig);
    }

    return clientApplication;
};

module.exports = Aad;
