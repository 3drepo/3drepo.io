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

const { authenticate, getUserByQuery, getUserByUsername, getUserByUsernameOrEmail } = require('../../../models/users');
const { createResponseCode, templates } = require('../../../utils/responseCodes');
const Yup = require('yup');
const config = require('../../../utils/config');
const httpsPost = require('../../../utils/httpsReq').post;
const { respond } = require('../../../utils/responder');
const { singleImageUpload } = require('../multer');
const { types } = require('../../../utils/helper/yup');
const { validateMany } = require('../../common');
const { formatPronouns } = require('../../../utils/helper/strings');

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
		const { user } = await getUserByUsernameOrEmail(usernameOrEmail);
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

Users.validateUpdateData = async (req, res, next) => {
	const schema = Yup.object().shape({
		firstName: types.strings.name,
		lastName: types.strings.name,
		email: types.strings.email.test('checkEmailAvailable', 'Email already exists',
			async (value) => {
				if (value) {
					try {
						await getUserByQuery({ 'customData.email': value, user: { $ne: req.session?.user?.username } }, { _id: 1 });
						return false;
					} catch {
						// do nothing
					}
				}
				return true;
			}),
		company: types.strings.title,
		countryCode: types.strings.countryCode.optional(),
		oldPassword: Yup.string().optional().when('newPassword', {
			is: (newPass) => newPass?.length > 0,
			then: Yup.string().required(),
		}),
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
		}),
	}, [['oldPassword', 'newPassword']]).strict(true).noUnknown()
		.test(
			'at-least-one-property',
			'You must provide at least one setting value',
			(value) => Object.keys(value).length,
		)
		.required();

	try {
		await schema.validate(req.body);

		if (req.body.oldPassword) {
			await authenticate(req.session.user.username, req.body.oldPassword);
		}

		next();
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
			const { user } = await getUserByUsernameOrEmail(usernameOrEmail, { user: 1, _id: 0 });
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
					'customData.resetPasswordToken.expiredAt': { $gt: new Date() }
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

const generateSignUpSchema = (captchaEnabled, captcha) => {
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
		email: types.strings.email.test('checkEmailAvailable', 'Email already exists',
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
			}).required(),
		password: types.strings.password.required(),
		firstName: types.strings.name.required(),
		lastName: types.strings.name.required(),
		countryCode: types.strings.countryCode.required(),
		company: types.strings.title.optional(),
		mailListAgreed: Yup.bool().required(),
		...(captchaEnabled ? { captcha: Yup.string().required() }: {}),
	}).strict(true).noUnknown().required();

	return captchaEnabled
		? schema.test('check-captcha', 'Invalid captcha', async () => {
			const checkCaptcha = httpsPost(config.captcha.validateUrl, {
				secret: config.captcha.secretKey,
				response: captcha,
			});

			const result = await checkCaptcha;
			return result.success;
		})
		: schema;
};

Users.validateSignUpData = async (req, res, next) => {
	try {
		const schema = generateSignUpSchema(config.auth.captcha, req.body.captcha);
		await schema.validate(req.body);

		req.body.firstName = formatPronouns(req.body.firstName);
		req.body.lastName = formatPronouns(req.body.lastName);

		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

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
		await schema.validate(req.body);

		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Users.validateAvatarFile = validateMany([singleImageUpload('file'), validateAvatarData]);

module.exports = Users;
