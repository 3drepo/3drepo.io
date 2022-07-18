const config = require('../../../utils/config');

const AadConstants = {};

AadConstants.authenticateRedirectUri = `${config.api_server.url}/v5/sso/aad/authenticate-post`;
AadConstants.signupRedirectUri = `${config.api_server.url}/v5/sso/aad/signup-post`;
AadConstants.msGraphUserDetailsUri = 'https://graph.microsoft.com/v1.0/me';

module.exports  = AadConstants;