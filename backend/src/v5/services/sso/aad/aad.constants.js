const config = require('../../../utils/config');

const AadConstants = {};

AadConstants.authenticateRedirectEndpoint = 'authenticate-post';
AadConstants.authenticateRedirectUri = `${config.api_server.url}/v5/sso/aad/${AadConstants.authenticateRedirectEndpoint}`;
AadConstants.signupRedirectEndpoint = 'signup-post';
AadConstants.signupRedirectUri = `${config.api_server.url}/v5/sso/aad/${AadConstants.signupRedirectEndpoint}`;
AadConstants.msGraphUserDetailsUri = 'https://graph.microsoft.com/v1.0/me';

module.exports  = AadConstants;