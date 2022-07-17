const AadConstants = {};

AadConstants.authenticateRedirectUri = 'http://localhost/api/v5/sso/aad/authenticate-post';
AadConstants.signupRedirectUri = 'http://localhost/api/v5/sso/aad/signup-post';
AadConstants.msGraphUserDetailsUri = 'https://graph.microsoft.com/v1.0/me';

module.exports  = AadConstants;