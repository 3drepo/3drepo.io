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

/*
const { convertAllUUIDs } = require('../dataConverter/pathParams');
*/
const { isString, isUUIDString } = require('../../../../utils/helper/typeCheck');
const { respond } = require('../../../../utils/responder');
const { stringToUUID } = require('../../../../utils/helper/uuids');
const { templates } = require('../../../../utils/responseCodes');
const { validateMany } = require('../../../common');

const Containers = {};

Containers.filterContainerData = (req, res, next) => {
	if (req.body) {
		const whitelist = [
			'name',
			'unit',
			'desc',
			'code',
			'type',
			'defaultView',
			'defaultLegend',
			'subModels',
			'surveyPoints',
			'angleFromNorth',
			'elevation',
		];

		Object.keys(req.body).forEach((key) => {
			if (!whitelist.includes(key)) {
				delete req.body[key];
			}
		});
	}

	next();
};

Containers.validContainerName = (req, res, next) => {
	if (req.body && req.body.name) {
		const modelNameRegExp = /^[\x00-\x7F]{1,120}$/;

		if (req.body.name.match(modelNameRegExp)) {
			next();
		} else {
			respond(req, res, templates.invalidContainerName);
		}
	} else {
		respond(req, res, templates.missingContainerName);
	}
};

Containers.validContainerCode = (req, res, next) => {
	if (req.body && req.body.code) {
		const modelCodeRegExp = /^[a-zA-Z0-9]{0,50}$/;

		if (modelCodeRegExp.test(req.body.code)) {
			next();
		} else {
			respond(req, res, templates.invalidContainerCode);
		}
	} else {
		next();
	}
};

Containers.validContainerUnit = (req, res, next) => {
	if (req.body && req.body.unit) {
		if (isString(req.body.unit)) {
			next();
		} else {
			respond(req, res, templates.invalidContainerUnit);
		}
	} else {
		respond(req, res, templates.missingContainerUnit);
	}
};

Containers.validContainerDefaultView = (req, res, next) => {
	if (req.body && req.body.defaultView) {
		if (isUUIDString(req.body.defaultView)) {
			next();
		} else {
			respond(req, res, templates.invalidContainerDefaultView);
		}
	} else {
		next();
	}
};

Containers.validContainerDefaultLegend = (req, res, next) => {
	if (req.body && req.body.defaultLegend) {
		if (isUUIDString(req.body.defaultLegend)) {
			req.body.defaultLegend = stringToUUID(req.body.defaultLegend);
			next();
		} else {
			respond(req, res, templates.invalidContainerDefaultLegend);
		}
	} else {
		next();
	}
};

Containers.validateContainer = validateMany([
	Containers.filterContainerData,
	Containers.validContainerName,
	Containers.validContainerCode,
	Containers.validContainerUnit,
	Containers.validContainerDefaultView,
	Containers.validContainerDefaultLegend,
]);

module.exports = Containers;
