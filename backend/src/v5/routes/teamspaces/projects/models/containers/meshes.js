/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { respond, writeStreamRespond } = require('../../../../../utils/responder');
const ModelHelper = require('../../../../../utils/helper/models');
const { Router } = require('express');
const { hasReadAccessToContainer } = require('../../../../../middleware/permissions/permissions');
const { templates } = require('../../../../../utils/responseCodes');

const getMesh = async (req, res) => {
	const { teamspace, model, meshId } = req.params;

	try {
		const { readStream, size, mimeType, encoding } = await ModelHelper.getMeshById(teamspace, model, meshId);
		writeStreamRespond(req, res, templates.ok, readStream, undefined, size, { mimeType, encoding });
	} catch (err) {
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	router.get('/:meshId', hasReadAccessToContainer, getMesh);

	return router;
};

module.exports = establishRoutes();
