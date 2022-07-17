 const config = require('../config');
 const msal = require('@azure/msal-node');
const { templates } = require('../../../utils/responseCodes');
 
 const Aad = {};
 
 let clientApplication;
 
 Aad.getClientApplication = () => {
     const clientAppConfig = { auth: config.sso.aad };
 
     if (!clientApplication) {
         clientApplication = new msal.ConfidentialClientApplication(clientAppConfig);
     }
 
     return clientApplication;
 };
 
 Aad.getAuthenticationCodeUrl = (params) => {
     const clientApp = Aad.getClientApplication();
     return clientApp.getAuthCodeUrl(params);
 };
 
 Aad.checkAadConfig = () => {
    if (!config.sso?.aad?.authority || !config.sso?.aad?.clientId || !config.sso?.aad?.clientSecret) {
		throw templates.ssoNotAvailable;
	}
};

 module.exports = Aad;
 