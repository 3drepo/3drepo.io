const axios = require('axios');
const { getUserByUsername, getUserByQuery } = require('../../../../../models/users');
const { createResponseCode, templates } = require('../../../../../utils/responseCodes');
const Yup = require('yup');
const config = require('../../../../../utils/config');
const httpsPost = require('../../../../../utils/httpsReq').post;
const { respond } = require('../../../../../utils/responder');
const { types } = require('../../../../../utils/helper/yup');
const { getClientApplication } = require('../../../../../utils/sso/aad');
const { generateHashString } = require('../../../../../utils/helper/strings');

const Aad = {};

const signupRedirectUri = 'http://localhost/api/v5/sso/aad/signup-post';
const msGraphUserDetailsUri = 'https://graph.microsoft.com/v1.0/me';

const generateSignUpSchema = () => {
    const captchaEnabled = config.auth.captcha;
    const schema = Yup.object().shape({
        username: types.strings.username.test('checkUsernameAvailable', 'Username already exists',
            async (value) => {
                if (value) {
                    try {
                        await getUserByUsername(value, { _id: 1 });
                        return false;
                    } catch {
                        // do nothing
                    }
                }
                return true;
            }).required(),

        countryCode: types.strings.countryCode.required(),
        company: types.strings.title.optional(),
        mailListAgreed: Yup.bool().required(),
        ...(captchaEnabled ? { captcha: Yup.string().required() } : {}),
    }).noUnknown().required();

    return captchaEnabled
        ? schema.test('check-captcha', 'Invalid captcha', async (body) => {
            const checkCaptcha = httpsPost(config.captcha.validateUrl, {
                secret: config.captcha.secretKey,
                response: body.captcha,
            });

            const result = await checkCaptcha;
            return result.success;
        })
        : schema;
};

Aad.validateSignUpData = async (req, res, next) => {
    try {
        const schema = generateSignUpSchema();
        req.body = await schema.validate(req.body);
        await next();
    } catch (err) {
        respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
    }
};

Aad.getUserDetailsAndValidateEmail = async (req, res, next) => {
    try {
        const schema = Yup.object().shape({
            givenName: types.strings.name,
            surname: types.strings.name,
            mail: types.strings.email.test('checkEmailAvailable', 'Email already exists',
                async (value) => {
                    if (value) {
                        try {
                            await getUserByQuery({ 'customData.email': value }, { _id: 1 });
                            return false;
                        } catch {
                            // do nothing
                        }
                    }
                    return true;
                })
        }
        ).strict(true).required();

        const tokenRequest = { redirectUri: signupRedirectUri, code: req.query.code };
        const clientApplication = getClientApplication();
        const response = await clientApplication.acquireTokenByCode(tokenRequest);

        const user = await axios.default.get(msGraphUserDetailsUri, {
            headers: {
                Authorization: `Bearer ${response.accessToken}`
            }
        });

        await schema.validate(user.data);

        req.body = {
            ...JSON.parse(req.query.state),
            email: user.data.mail,
            firstName: user.data.givenName,
            lastName: user.data.surname,
            password: generateHashString()
        }

        await next();
    } catch (err) {
        respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
    }
};

module.exports = Aad;
