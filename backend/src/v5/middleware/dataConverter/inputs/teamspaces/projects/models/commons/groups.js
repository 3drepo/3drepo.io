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

const { createResponseCode, templates } = require('../../../../../../../utils/responseCodes');
const Yup = require('yup');
const { respond } = require('../../../../../../../utils/responder');
const { stringToUUID } = require('../../../../../../../utils/helper/uuids');
const { validators } = require('../../../../../../../utils/helper/yup');

const Groups = {};

Groups.validateGroupExportData = async (req, res, next) => {
	const schema = Yup.object().shape({
		groups: Yup.array('groups must be of type array')
			.of(validators.uuid)
			.min(1, 'groups array must have at least 1 id')
			.strict(true)
			.required(),
	});

	try {
		const output = await schema.validate(req.body);
		output.groups = output.groups.map(stringToUUID);
		req.body = output;
		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err));
	}
};

module.exports = Groups;
