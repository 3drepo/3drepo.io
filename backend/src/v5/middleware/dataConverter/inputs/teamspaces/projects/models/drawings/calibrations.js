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

const { createResponseCode, templates } = require('../../../../../../../utils/responseCodes');
const Yup = require('yup');
const YupHelper = require('../../../../../../../utils/helper/yup');
const { calibrationStatuses } = require('../../../../../../../models/calibrations.constants');
const { getCalibration } = require('../../../../../../../processors/teamspaces/projects/models/drawings/calibrations');
const { respond } = require('../../../../../../../utils/responder');

const Calibrations = {};

const validateConfirmCalibration = async (req, res, next) => {
	try {
		const { teamspace, project, drawing, revision } = req.params;
		const calibration = await getCalibration(teamspace, project, drawing, revision);

		if (calibration.status !== calibrationStatuses.UNCONFIRMED) {
			throw templates.calibrationNotFound;
		}

		req.body = calibration.calibration;

		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

const arePositionsDifferent = (positions) => {
	const pos1 = positions[0];

	for (let i = 1; i < positions.length; i++) {
		for (let j = 0; j < pos1.length; j++) {
			if (pos1[j] !== positions[i][j]) {
				return true;
			}
		}
	}
	return false;
};

const validateNewCalibrationData = async (req, res, next) => {
	const schema = Yup.object({
		horizontal: Yup.object({
			model: Yup.array().of(YupHelper.types.position).length(2)
			// eslint-disable-next-line no-template-curly-in-string
				.test('not-identical-positions', 'The positions of ${path} cannot be identical',
					(value) => !value || arePositionsDifferent(value))
				.required(),
			drawing: Yup.array().of(YupHelper.types.position2d).length(2)
			// eslint-disable-next-line no-template-curly-in-string
				.test('not-identical-positions', 'The positions of ${path} cannot be identical',
					(value) => !value || arePositionsDifferent(value))
				.required(),
		}).required(),
		verticalRange: Yup.array().of(Yup.number()).length(2).required()
			.test('valid-verticalRange', 'The second number of the range must be larger than the first', (value) => value[0] <= value[1]),
		units: YupHelper.types.strings.unit.required(),
	}).required().noUnknown();

	try {
		req.body = await schema.validate(req.body);
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Calibrations.validateNewCalibration = (req, res, next) => (req.query.usePrevious === 'true'
	? validateConfirmCalibration(req, res, next)
	: validateNewCalibrationData(req, res, next));

module.exports = Calibrations;
