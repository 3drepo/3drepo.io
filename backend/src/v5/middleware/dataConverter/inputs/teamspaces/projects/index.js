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
const { UUIDToString } = require('../../../../../utils/helper/uuids');
const Yup = require('yup');
const { getProjectByQuery } = require('../../../../../models/projectSettings');
const { respond } = require('../../../../../utils/responder');
const { types } = require('../../../../../utils/helper/yup');

const Projects = {};

Projects.validateProjectData = async (req, res, next) => {
	const schema = Yup.object().shape({
		name: types.strings.title.required(),
	}).strict(true).noUnknown();

	try {
		const { body, params } = req;
		await schema.validate(body);

		try {
			const existingProject = await getProjectByQuery(params.teamspace, { name: body.name }, { _id: 1 });

			// If a project is being edited we only want to throw error if the new name belongs to a different project
			if (UUIDToString(existingProject._id) !== UUIDToString(params.project)) {
				return respond(req, res, createResponseCode(templates.invalidArguments, 'Project with the same name already exists.'));
			}
		} catch {
			// do nothing, the project name is unique
		}

		await next();
	} catch (err) {
		return respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Projects;
