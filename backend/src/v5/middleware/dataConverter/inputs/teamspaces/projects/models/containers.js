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
const { getModelByQuery } = require('../../../../../../models/modelSettings');
const { respond } = require('../../../../../../utils/responder');
const { validateNewRevisionData } = require('./commons/revisions');

const Containers = {};

Containers.canDeleteContainer = async (req, res, next) => {
	try {
		const { teamspace, container } = req.params;

		const query = {
			'subModels._id': container,
		};

		const fed = await getModelByQuery(teamspace, query, { _id: 1, name: 1 }).catch(() => {});
		if (fed) {
			respond(req, res, createResponseCode(templates.containerIsSubModel, `Container is an active sub model of ${fed.name}(${fed._id})`));
		} else {
			next();
		}
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Containers.validateNewRevisionData = validateNewRevisionData(MODEL_TYPES.container);

module.exports = Containers;
