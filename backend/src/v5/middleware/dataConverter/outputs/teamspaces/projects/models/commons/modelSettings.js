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

const { UUIDToString } = require('../../../../../../../utils/helper/uuids');
const { respond } = require('../../../../../../../utils/responder');
const { templates } = require('../../../../../../../utils/responseCodes');

const ModelSettings = {};

ModelSettings.formatModelSettings = (req, res) => {
	const { defaultView, defaultLegend, ...settings } = req.outputData;
	const formattedSettings = {
		...settings,
		timestamp: settings.timestamp ? settings.timestamp.getTime() : undefined,
		code: settings.properties.code,
		unit: settings.properties.unit,
		...(defaultView ? { defaultView: UUIDToString(defaultView) } : {}),
		...(defaultLegend ? { defaultLegend: UUIDToString(defaultLegend) } : {}),
		errorReason: settings.errorReason ? {
			message: settings.errorReason.message,
			timestamp: settings.errorReason.timestamp ? settings.errorReason.timestamp.getTime() : undefined,
			errorCode: settings.errorReason.errorCode,
		} : undefined,
	};

	delete formattedSettings.properties;

	respond(req, res, templates.ok, formattedSettings);
};

ModelSettings.formatModelStats = (isFed) => (req, res) => {
	const { outputData } = req;

	if (isFed) {
		if (outputData.lastUpdated) outputData.lastUpdated = outputData.lastUpdated.getTime();
	} else {
		outputData.revisions.lastUpdated = outputData.revisions.lastUpdated
			? outputData.revisions.lastUpdated.getTime() : undefined;
		if (outputData.errorReason?.timestamp) {
			outputData.errorReason.timestamp = outputData.errorReason.timestamp.getTime();
		}
		outputData.revisions.latestRevision = UUIDToString(outputData.revisions.latestRevision);
	}

	respond(req, res, templates.ok, outputData);
};

module.exports = ModelSettings;
