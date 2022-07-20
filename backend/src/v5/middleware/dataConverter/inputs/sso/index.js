const { CryptoProvider } = require('@azure/msal-node');
const { getAuthenticationCodeUrl } = require('../../../../services/sso/aad');
const { authenticateRedirectUri, signupRedirectUri } = require('../../../../services/sso/aad/aad.constants');

const Sso = {};

Sso.addPkceProtection = async (req, res, next) => {
    const cryptoProvider = new CryptoProvider();
    const { verifier, challenge } = await cryptoProvider.generatePkceCodes();

    if (!req.session.pkceCodes) {
        req.session.pkceCodes = { challengeMethod: 'S256' };
    }

    req.session.pkceCodes.verifier = verifier;
    req.session.pkceCodes.challenge = challenge;

    await next();
};

Sso.setAuthenticateAuthParams = async (req, res, next) => {		
    const params = { 
        redirectUri: authenticateRedirectUri, 
        state: JSON.stringify({ redirecturi: req.query.signupUri }),
        codeChallenge: req.session.pkceCodes.challenge, 
        codeChallengeMethod: req.session.pkceCodes.challengeMethod 
    };   

    req.authParams = params;

    await next();
};

Sso.setSignupAuthParams = async (req, res, next) => {
    const { body } = req;
		
    const params = {
        redirectUri: signupRedirectUri,
        state: JSON.stringify({
            username: body.username,
            countryCode: body.countryCode,
            company: body.company,
            mailListAgreed: body.mailListAgreed,
        }),
        codeChallenge: req.session.pkceCodes.challenge, 
        codeChallengeMethod: req.session.pkceCodes.challengeMethod    
    };

    req.authParams = params;

    await next();
};

Sso.getAuthenticationCodeUrl = async (req, res, next) => {
    const authenticationCodeUrl = await getAuthenticationCodeUrl(req.authParams);
    req.authenticationCodeUrl = authenticationCodeUrl;

    await next();
}

module.exports = Sso;
