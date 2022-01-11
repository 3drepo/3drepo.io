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

const { authenticate, getUserByQuery } = require('../../../models/users');
const { createResponseCode, templates } = require('../../../utils/responseCodes');
const Path = require('path');
const Yup = require('yup');
const { respond } = require('../../../utils/responder');
const { singleFileUpload } = require('../multer');
const { types } = require('../../../utils/helper/yup');
const { validateMany } = require('../../common');
const zxcvbn = require('zxcvbn');

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
		const { user } = await getUserByQuery({ $or: [{ user: usernameOrEmail }, { 'customData.email': usernameOrEmail }] });
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
		firstName: Yup.string(),
		lastName: Yup.string(),
		email: types.strings.email.test('checkEmailAvailable', 'Email already exists',
			async (value) => {
				if (value) {
					try {
						await getUserByQuery({ 'customData.email': value });
						return false;
					} catch {
						// do nothing
					}
				}
				return true;
			}),
		oldPassword: types.strings.password.optional().when('newPassword', {
			is: (newPass) => newPass?.length > 0,
			then: types.strings.password.required(),
		}),
		newPassword: types.strings.password.optional().when('oldPassword', {
			is: (oldPass) => oldPass?.length > 0,
			then: types.strings.password.required(),
		}).test('checkPasswordStrength', 'Password is too weak',
			(value) => {
				if (value) {
					if (value.length < 8) return false;
					const passwordScore = zxcvbn(value).score;
					return passwordScore >= 2;
				}
				return true;
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
	}, [['oldPassword', 'newPassword']]).strict(true).noUnknown().test(
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

const fileFilter = async (req, file, cb) => {
	const format = Path.extname(file.originalname).toLowerCase();
	const acceptedFormats = ['.png', '.jpg', '.gif'];
	if (!acceptedFormats.includes(format)) {
		const err = createResponseCode(templates.unsupportedFileFormat, `${format} is not a supported model format`);
		cb(err, false);
	}

	const maxAvatarSize = 1048576;
	const size = parseInt(req.headers['content-length'], 10);
	if (size > maxAvatarSize) {
		cb(templates.maxSizeExceeded, false);
	}

	cb(null, true);
};

const validateAvatarData = async (req, res, next) => {
	const schema = Yup.object().shape({	}).strict(true).noUnknown().required();

	try {
		await schema.validate(req.body);
		if (!req.file) throw createResponseCode(templates.invalidArguments, 'A file must be provided');
		if (!req.file.size) throw createResponseCode(templates.invalidArguments, 'File cannot be empty');

		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Users.validateAvatarFile = validateMany([singleFileUpload('file', fileFilter, true), validateAvatarData]);

module.exports = Users;
