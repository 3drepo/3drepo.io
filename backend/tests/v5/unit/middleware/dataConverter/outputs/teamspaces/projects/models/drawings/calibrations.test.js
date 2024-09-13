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

const { src } = require('../../../../../../../../helper/path');
const { determineTestGroup, generateRandomObject } = require('../../../../../../../../helper/services');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const { templates } = require(`${src}/utils/responseCodes`);

const CalibrationsOutputMiddlewares = require(`${src}/middleware/dataConverter/outputs/teamspaces/projects/models/drawings/calibrations`);

const testFormatCalibration = () => {
	describe('Format Calibration', () => {
		test('Should format calibration correctly', () => {
			const createdAt = new Date();
			const req = { calibration: { ...generateRandomObject(), createdAt } };

			expect(CalibrationsOutputMiddlewares.formatCalibration(req, {})).toBeUndefined();

			const formattedCalibration = { ...req.calibration, createdAt: createdAt.getTime() };
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(
				{ calibration: formattedCalibration }, {}, templates.ok, formattedCalibration);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testFormatCalibration();
});
