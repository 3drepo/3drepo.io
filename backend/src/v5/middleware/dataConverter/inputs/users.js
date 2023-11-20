/**
 *  Copyright (C) 2021 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const { authenticate, getUserByEmail, getUserByQuery, getUserByUsername, getUserByUsernameOrEmail, isSsoUser } = require('../../../models/users');
const { createResponseCode, templates } = require('../../../utils/responseCodes');
const Yup = require('yup');
const config = require('../../../utils/config');
const { formatPronouns } = require('../../../utils/helper/strings');
const { getUserFromSession } = require('../../../utils/sessions');
const { post } = require('../../../utils/webRequests');
const { respond } = require('../../../utils/responder');
const { singleImageUpload } = require('../multer');
const { types } = require('../../../utils/helper/yup');
const { validateMany } = require('../../common');

const Users = {};

Users.validateLoginData = async (req, res, next) => {
	const schema = Yup.object().shape({
		user: Yup.string().required(),
		password: Yup.string().required(),
	}).strict(true).noUnknown()
		.required();

	try {
		await schema.validate(req.body);

		const usernameOrEmail = req.body.user;
		const { user, customData: { sso } } = await getUserByUsernameOrEmail(usernameOrEmail, { user: 1, 'customData.sso': 1 });

		if (sso) {
			throw templates.userNotFound;
		}

		req.body.user = user;

		next();
	} catch (err) {
		if (err === templates.userNotFound) {
			respond(req, res, templates.incorrectUsernameOrPassword);
			return;
		}
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

const generateUpdateSchema = (isSSO, username) => {
	const ssoFieldUpdateCheck = (value) => !isSSO || value === undefined;

	const schema = Yup.object().shape({
		email: types.strings.email.test('checkEmailAvailable', 'Email already exists',
			async (value) => {
				if (value) {
					try {
						await getUserByQuery({ 'customData.email': value, user: { $ne: username } }, { _id: 1 });
						return false;
					} catch {
						// do nothing
					}
				}
				return true;
			}).test(
			'non-sso-field',
			'Email can only be updated for non Single sign on users',
			ssoFieldUpdateCheck,
		),
		oldPassword: Yup.string().optional().when('newPassword', {
			is: (newPass) => newPass?.length > 0,
			then: Yup.string().required(),
		}).test(
			'non-sso-field',
			'Password can only be updated for non Single sign on users',
			ssoFieldUpdateCheck,
		),
		newPassword: types.strings.password.optional().when('oldPassword', {
			is: (oldPass) => oldPass?.length > 0,
			then: types.strings.password.required(),
		}).test({
			name: 'notTheSameAsOldPassword',
			exclusive: false,
			params: {},
			message: 'New password must be different than the old one',
			test(value) {
				const { oldPassword } = this.parent;
				return !oldPassword || (value !== oldPassword);
			},
		}).test(
			'non-sso-field',
			'Password can only be updated for non Single sign on users',
			ssoFieldUpdateCheck,
		),
		firstName: types.strings.name.test(
			'non-sso-field',
			'First name can only be updated for non Single sign on users',
			ssoFieldUpdateCheck,
		),
		lastName: types.strings.name.test(
			'non-sso-field',
			'Last name can only be updated for non Single sign on users',
			ssoFieldUpdateCheck,
		),

		company: types.strings.title,
		countryCode: types.strings.countryCode.optional(),
	}, [['oldPassword', 'newPassword']]).strict(true).noUnknown()
		.test(
			'at-least-one-property',
			'You must provide at least one setting value',
			(value) => Object.keys(value).length,
		)
		.required();

	return schema;
};

Users.validateUpdateData = async (req, res, next) => {
	try {
		const username = getUserFromSession(req.session);
		const isSso = await isSsoUser(username);
		const schema = generateUpdateSchema(isSso, username);
		await schema.validate(req.body);

		if (req.body.oldPassword) {
			await authenticate(username, req.body.oldPassword);
		}

		await next();
	} catch (err) {
		if (err.code === templates.incorrectUsernameOrPassword.code) {
			respond(req, res, templates.incorrectPassword);
			return;
		}

		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

const validateAvatarData = async (req, res, next) => {
	try {
		if (!req.file) throw createResponseCode(templates.invalidArguments, 'A file must be provided');

		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Users.validateForgotPasswordData = async (req, res, next) => {
	const schema = Yup.object().shape({
		user: Yup.string().required(),
	}).strict(true).noUnknown()
		.required();

	try {
		await schema.validate(req.body);

		try {
			const usernameOrEmail = req.body.user;
			const { user, customData: { sso } } = await getUserByUsernameOrEmail(usernameOrEmail, { user: 1, _id: 0, 'customData.sso': 1 });

			if (sso) {
				throw templates.unknown;
			}

			req.body.user = user;
			next();
		} catch {
			respond(req, res, templates.ok);
		}
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Users.validateResetPasswordData = async (req, res, next) => {
	const schema = Yup.object().shape({
		token: Yup.string().required(),
		newPassword: types.strings.password.required(),
		user: Yup.string().required(),
	}).strict(true).noUnknown()
		.required()
		.test('token-validity', 'Token is invalid or expired', async () => {
			try {
				await getUserByQuery({
					user: req.body.user,
					'customData.resetPasswordToken.token': req.body.token,
					'customData.resetPasswordToken.expiredAt': { $gt: new Date() },
				});

				return true;
			} catch {
				return false;
			}
		});

	try {
		await schema.validate(req.body);
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

const generateSignUpSchema = (isSSO) => {
	const captchaEnabled = config.auth.captcha;

	const nonSSOFields = {
		email: types.strings.email.test('checkEmailAvailable', 'Email already exists',
			async (value) => {
				if (value) {
					try {
						await getUserByEmail(value, { _id: 1 });
						return false;
					} catch {
						// do nothing
					}
				}
				return true;
			}).required(),
		password: types.strings.password.required(),
		firstName: types.strings.name.transform(formatPronouns).required(),
		lastName: types.strings.name.transform(formatPronouns).required(),
	};
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
		...(isSSO ? {} : nonSSOFields),
	}).noUnknown().required();

	return captchaEnabled
		? schema.test('check-captcha', 'Invalid captcha', async (body) => {
			const reqConfig = {
				params: {
					secret: config.captcha.secretKey,
					response: body.captcha,
				},
			};

			const checkCaptcha = post(config.captcha.validateUrl, undefined, reqConfig);
			const { data } = await checkCaptcha;

			return data.success;
		})
		: schema;
};

const validateSignUpData = (isSSO) => async (req, res, next) => {
	try {
		const schema = generateSignUpSchema(isSSO);
		req.body = await schema.validate(req.body);
		delete req.body.captcha;
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Users.validateSignUpData = validateSignUpData(false);
Users.validateSsoSignUpData = validateSignUpData(true);

Users.validateVerifyData = async (req, res, next) => {
	const schema = Yup.object().shape({
		username: types.strings.username.required(),
		token: Yup.string().required(),
	}).strict(true).noUnknown()
		.required()
		.test('token-validity', 'Token is invalid or expired', async () => {
			try {
				await getUserByQuery({
					user: req.body.username,
					'customData.emailVerifyToken.token': req.body.token,
					'customData.emailVerifyToken.expiredAt': { $gt: new Date() },
					'customData.inactive': true,
				}, { _id: 1 });

				return true;
			} catch {
				return false;
			}
		});

	try {
		req.body = await schema.validate(req.body);

		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Users.validateAvatarFile = validateMany([singleImageUpload('file'), validateAvatarData]);

module.exports = Users;
