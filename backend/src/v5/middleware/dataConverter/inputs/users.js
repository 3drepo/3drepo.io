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
const Yup = require('yup');
const { deleteIfUndefined } = require('../../../utils/helper/objects');
const { respond } = require('../../../utils/responder');
const { types } = require('../../../utils/helper/yup');

const Users = {};

const schema = Yup.object().shape({
	firstName: types.strings.name,
	lastName: types.strings.name,

	company: types.strings.title,
	countryCode: types.strings.countryCode.optional(),
}).required();

Users.validateUpdateData = async (req, res, next) => {
	try {
		req.body = deleteIfUndefined(await schema.validate(req.body, { stripUnknown: true }));

		if (!Object.keys(req.body).length) throw new Error('Nothing to update');
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Users;
