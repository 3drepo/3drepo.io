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
const { types } = require('../../../../../../../utils/helper/yup');
const { validateSchema } = require('../../../../../schemas/groups');

const Groups = {};

Groups.validateGroupsExportData = async (req, res, next) => {
	const schema = Yup.object().shape({
		groups: Yup.array('groups must be of type array')
			.of(types.id)
			.min(1, 'groups array must have at least 1 id')
			.strict(true)
			.required(),
	}).strict(true).noUnknown();

	try {
		const output = await schema.validate(req.body);
		output.groups = output.groups.map(stringToUUID);
		req.body = output;
		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Groups.validateGroupsImportData = async (req, res, next) => {
	try {
		const { groups } = req.body;
		if (!groups.length) throw createResponseCode(templates.invalidArguments, 'Groups array cannot be empty');
		await Promise.all(groups.map(validateSchema));
		for (let i = 0; i < groups.length; ++i) {
			const group = groups[i];
			group._id = stringToUUID(group._id);
			if (group.objects) {
				for (let j = 0; j < group.objects.length; ++j) {
					if (group.objects[j].shared_ids) {
						group.objects[j].shared_ids = group.objects[j].shared_ids.map(stringToUUID);
					}
				}
			}
		}

		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Groups;
