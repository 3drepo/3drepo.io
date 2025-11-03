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

const { modelTypes } = require('../../models/modelSettings.constants');
const { stringToUUID } = require('../../utils/helper/uuids');

const PathParams = {};

const paramsToIgnore = ['container', 'federation', 'model', 'drawing', 'user', 'member', 'teamspace'];

PathParams.getModelIdFromParam = (modelType) => (req, res, next) => {
	if (!req.params.model) {
		const modelParams = {
			[modelTypes.CONTAINER]: req.params.container,
			[modelTypes.FEDERATION]: req.params.federation,
			[modelTypes.DRAWING]: req.params.drawing,
		};

		req.params.model = modelParams[modelType];
	}

	next();
};

PathParams.convertAllUUIDs = (req, res, next) => {
	if (req.params) {
		Object.keys(req.params).forEach((key) => {
			if (!paramsToIgnore.includes(key)) {
				req.params[key] = stringToUUID(req.params[key]);
			}

			if (key === 'model') {
				req.params.container = req.params[key];
				req.params.federation = req.params[key];
				req.params.drawing = req.params[key];
			}
		});
	}

	next();
};

module.exports = PathParams;
