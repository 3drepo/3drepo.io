 const { createResponseCode, templates } = require('../../../utils/responseCodes');
 const Yup = require('yup');
 const { respond } = require('../../../utils/responder');
 const { checkUserExists } = require('../../../models/users');
 const Auth = {};
 
 Auth.validateLoginData = async (req, res, next) => {
    const schema = Yup.object().shape({
      username: Yup.string().required(),
      password: Yup.string().required()
    }).strict(true).noUnknown();
 
    try {
		await schema.validate(req.body);
    await checkUserExists(req.body.username);
		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
 };

 Auth.validateLogoutData = async (req, res, next) => {
  try {
    await checkUserExists(req.body.username);
		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
}
 
 module.exports = Auth;
 