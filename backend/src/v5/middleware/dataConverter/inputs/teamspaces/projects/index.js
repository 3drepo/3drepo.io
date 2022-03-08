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
const Yup = require('yup');
const { getProjectByQuery } = require('../../../../../models/projectSettings');
const { respond } = require('../../../../../utils/responder');
const { types } = require('../../../../../utils/helper/yup');

const Projects = {};

Projects.validateProjectData = async (req, res, next) => {
	const schema = Yup.object().shape({
		name: types.strings.title.required().test('check-name-is-unique', 'Project with the same name already exists', async (value) => {
			try {
				await getProjectByQuery(req.params.teamspace, { _id: { $ne: req.params.project }, name: value },
					{ _id: 1 });				
				return false;
			} catch {
				return true;
			}
		}),
	}).strict(true).noUnknown();

	try {
		await schema.validate(req.body);
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Projects;
