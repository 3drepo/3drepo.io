const { CryptoProvider } = require('@azure/msal-node');

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

module.exports = Sso;
