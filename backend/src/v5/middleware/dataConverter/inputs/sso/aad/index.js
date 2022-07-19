/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { createResponseCode, templates } = require('../../../../../utils/responseCodes');
const { getUserDetails } = require('../../../../../services/sso/aad');
const { respond } = require('../../../../../utils/responder');
const { signupRedirectUri } = require('../../../../../services/sso/aad/aad.constants');
const { aad } = require('../../../../../services/sso/sso.constants');
const { getUserByQuery } = require('../../../../../models/users');

const Aad = {};

Aad.getUserDetailsAndCheckEmailAvailability = async (req, res, next) => {
	const { data: { mail, givenName, surname, id } } =
		await getUserDetails(req.query.code, signupRedirectUri);

	try {
		await getUserByQuery({ 'customData.email': mail }, { _id: 1 });
		return respond(req, res, createResponseCode(templates.invalidArguments, 'Email already exists'));
	} catch {
		//do nothing
	}

	req.body = {
		...JSON.parse(req.query.state),
		email: mail,
		firstName: givenName,
		lastName: surname,
		sso: { type: aad, id, },
	};

	await next();
};

module.exports = Aad;
