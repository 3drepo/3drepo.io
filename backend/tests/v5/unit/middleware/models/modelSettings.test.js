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

const { src } = require('../../../helper/path');

jest.mock('../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);
jest.mock('../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
const ModelSettingsMiddleware = require(`${src}/middleware/models/modelSettings`);
const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const existingContainerId = 'someContainer';
ModelSettings.getContainerById.mockImplementation((ts, container) => {
	if (container !== existingContainerId) {
		throw templates.containerNotFound;
	}
});

const testIsContainer = () => {
	const mockValidatorTruthy = jest.fn((req, res, next) => { next(); });
	const mockValidatorFalsey = jest.fn(() => {});
	const mockCBNext = jest.fn(() => {});

	describe('Is container', () => {
		test('should call next if it is a container', async () => {
			const mockCB = jest.fn(() => {});
			await ModelSettingsMiddleware.isContainer(
				{ params: { teamspace: 'someTS', container: existingContainerId } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should fail if container is not found', async () => {
			const mockCB = jest.fn(() => {});
			await ModelSettingsMiddleware.isContainer(
				{ params: { teamspace: 'someTS', container: 'notContainer' } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.containerNotFound.code);
		});
	});
};

describe('middleware/models/modelSettings', () => {
	testIsContainer();
});
