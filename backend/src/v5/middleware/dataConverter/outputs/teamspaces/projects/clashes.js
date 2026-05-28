/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { isArray, isDate, isObject, isUUID } = require('../../../../../utils/helper/typeCheck');
const { CLASH_RUN_STATUS } = require('../../../../../models/clashes.constants');
const { UUIDToString } = require('../../../../../utils/helper/uuids');
const { respond } = require('../../../../../utils/responder');
const { templates } = require('../../../../../utils/responseCodes');

const Clashes = {};

const serialiseData = (value) => {
	if (isDate(value)) {
		return value.getTime();
	}

	if (isUUID(value)) {
		return UUIDToString(value);
	}

	if (isArray(value)) {
		return value.map((entry) => serialiseData(entry));
	}

	if (isObject(value)) {
		const output = {};
		for (const [key, val] of Object.entries(value)) {
			output[key] = serialiseData(val);
		}
		return output;
	}

	return value;
};

const formatRun = ({ _id, status, triggeredAt, triggeredBy, completedAt, result, errorCode, message }) => {
	const base = { _id, status, triggeredAt, triggeredBy };
	if (status === CLASH_RUN_STATUS.COMPLETED) {
		return serialiseData({ ...base, completedAt, result: { stats: result?.stats } });
	}

	if (status === CLASH_RUN_STATUS.FAILED) {
		return serialiseData({ ...base, result: { error: { code: errorCode, reason: message } } });
	}

	return serialiseData(base);
};

Clashes.serialiseClashPlans = (req, res) => {
	respond(req, res, templates.ok, serialiseData(req.outputData));
};

Clashes.serialiseClashPlan = (req, res) => {
	respond(req, res, templates.ok, serialiseData(req.outputData));
};

Clashes.serialiseClashRuns = (req, res) => {
	const { runs } = req.outputData;
	respond(req, res, templates.ok, { runs: runs.map(formatRun) });
};

module.exports = Clashes;
