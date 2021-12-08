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

const { createResponseCode, templates } = require('../../../utils/responseCodes');
const { getUserByEmail, getUserByUsername } = require('../../../models/users');
const Yup = require('yup');
const { hasEmailFormat } = require('../../../utils/helper/strings');
const { respond } = require('../../../utils/responder');

const Auth = {};

Auth.validateLoginData = async (req, res, next) => {
	const schema = Yup.object().shape({
		user: Yup.string().required(),
		password: Yup.string().required(),
	}).strict(true).noUnknown()
		.required();

	try {
		await schema.validate(req.body);

		const usernameOrEmail = req.body.user;
		if (hasEmailFormat(usernameOrEmail)) {
			const { user } = await getUserByEmail(usernameOrEmail);
			req.body.user = user;
		} else {
			await getUserByUsername(usernameOrEmail);
		}

		next();
	} catch (err) {
		if (err === templates.userNotFound) {
			respond(req, res, templates.incorrectUsernameOrPassword);
			return;
		}
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Auth;
