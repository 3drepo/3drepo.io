const { Router } = require('express');
const { respond } = require('../../../utils/responder');
const { validateSignUpData, getUserDetailsAndValidateEmail } = require('../../../middleware/dataConverter/inputs/sso/aad');
const Users = require('../../../processors/users');
const { getClientApplication } = require('../../../utils/sso/aad');


const authenticateRedirectUri = 'http://localhost/api/v5/sso/aad/authenticate-post';
const signupRedirectUri = 'http://localhost/api/v5/sso/aad/signup-post';
const sigupUri = 'https://www.google.com';
const homepageUri = 'https://www.google.com';

const authenticate = async (req, res) => {
    try {
        const params = { redirectUri: authenticateRedirectUri, state: sigupUri };
        const clientApplication = getClientApplication();
        const authCodeUrl = await clientApplication.getAuthCodeUrl(params);
        res.redirect(authCodeUrl);
    } catch (err) {
        /* istanbul ignore next */
        respond(req, res, err);
    }
};

const authenticatePost = async (req, res) => {
    try {
        res.redirect(req.query.state);
    } catch (err) {
        /* istanbul ignore next */
        respond(req, res, err);
    }
};

const signup = async (req, res) => {
    try {
        const { body } = req;
        const params = {
            redirectUri: signupRedirectUri,
            state: JSON.stringify({
                username: body.username,
                country: body.countryCode,
                company: body.company,
                mailListAgreed: body.mailListAgreed,
            })
        };
        const clientApplication = getClientApplication();
        const authCodeUrl = await clientApplication.getAuthCodeUrl(params);
        res.redirect(authCodeUrl);
    } catch (err) {
        /* istanbul ignore next */
        respond(req, res, err);
    }
};

const signupPost = async (req, res) => {
    try {       
        await Users.signUp(req.body);
        res.redirect(homepageUri);
    } catch (err) {
        /* istanbul ignore next */
        respond(req, res, err);
    }
};

const establishRoutes = () => {
    const router = Router({ mergeParams: true });

    router.get('/authenticate', authenticate);

    router.get('/authenticate-post', authenticatePost);

    //Middleware change... validateSignUpData & getUserDetailsAndValidateEmail should be merged and 
    //should take place on last endpoint
    //I should reuse the existing middleware for signing in
    router.post('/signup', validateSignUpData, signup);

    router.get('/signup-post', getUserDetailsAndValidateEmail, signupPost);

    return router;
};

module.exports = establishRoutes();
