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

const { createResponseCode, templates } = require('../../../../../../utils/responseCodes');
const Yup = require('yup');
const YupHelper = require('../../../../../../utils/helper/yup');
const { getContainers } = require('../../../../../../models/modelSettings');
const { isString } = require('../../../../../../utils/helper/typeCheck');
const { modelsExistInProject } = require('../../../../../../models/projectSettings');
const { respond } = require('../../../../../../utils/responder');

const Federations = {};

Federations.validateNewRevisionData = async (req, res, next) => {
	const containerEntry = Yup.object({
		_id: YupHelper.types.id.required(),
		group: YupHelper.types.strings.title,
	}).transform((v, oldVal) => {
		if (isString(oldVal)) {
			return { _id: oldVal };
		}
		return v;
	});

	const schemaBase = {
		containers: Yup.array().of(containerEntry).min(1).required()
			.test('containers-validation', 'Containers must exist within the same project', (value) => {
				const { teamspace, project } = req.params;
				return value?.length
					&& modelsExistInProject(teamspace, project, value.map((v) => v?._id)).catch(() => false);
			})
			.test('containers-validation', 'IDs provided cannot be of type federation', async (value) => {
				if (value?.length) {
					const { teamspace } = req.params;
					const foundContainers = await getContainers(teamspace, value.map((v) => v?._id), { _id: 1 });
					return foundContainers?.length === value?.length;
				}
				return false;
			}),
	};

	const schema = Yup.object().noUnknown().required().shape(schemaBase);

	try {
		req.body = await schema.validate(req.body);
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Federations;
