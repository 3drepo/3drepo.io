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
const { getContainers, getFederationById } = require('../../../../../../models/modelSettings');
const { hasReadAccessToContainer, hasReadAccessToFederation } = require('../../../../../../utils/permissions');
const { BYPASS_AUTH } = require('../../../../../../utils/config.constants');
const Yup = require('yup');
const YupHelper = require('../../../../../../utils/helper/yup');
const { getUserFromSession } = require('../../../../../../utils/sessions');
const { isString } = require('../../../../../../utils/helper/typeCheck');
const { modelTypes } = require('../../../../../../models/modelSettings.constants');
const { modelsExistInProject } = require('../../../../../../models/projectSettings');
const { respond } = require('../../../../../../utils/responder');
const { getLatestRevision } = require('../../../../../../models/revisions');

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

Federations.getAccessibleContainers = (modelType) => async (req, res, next) => {
	if (modelType !== modelTypes.FEDERATION) {
		await next();
	} else {
		const { teamspace, project, model } = req.params;
		const { subModels: containers } = await getFederationById(teamspace, model, { subModels: 1 });

		if (req.app.get(BYPASS_AUTH)) {
			req.containers = containers;
		} else {
			const user = getUserFromSession(req.session);
			const result = [];
			await Promise.all(containers.map(async ({ _id: containerId }) => {
				try {
					if (await hasReadAccessToContainer(teamspace, project, containerId, user)) {
						const containerRev = await getLatestRevision(
							teamspace, containerId, modelTypes.CONTAINER, { _id: 1 });
						result.push({ container: containerId, revision: containerRev._id });
					}
				} catch (err) {
					// do nothing. Container might have no revisions
				}
			}));
			req.containers = result;
		}
		await next();
	}
};

module.exports = Federations;
