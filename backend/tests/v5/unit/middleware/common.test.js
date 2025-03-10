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

const { src } = require('../../helper/path');
const { generateRandomString } = require('../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);
jest.mock('../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const Common = require(`${src}/middleware/common`);

const testValidateMany = () => {
	const mockValidatorTruthy = jest.fn((req, res, next) => { next(); });
	const mockValidatorFalsey = jest.fn(() => {});
	const mockCBNext = jest.fn(() => {});

	describe('Validate Many', () => {
		test('with no validators should simply call next', async () => {
			const func = Common.validateMany([]);
			await func(undefined, undefined, mockCBNext);
			expect(mockCBNext.mock.calls.length).toBe(1);
		});

		test('with 1 validator that succeeds should call next', async () => {
			const func = Common.validateMany([mockValidatorTruthy]);
			await func(undefined, undefined, mockCBNext);
			expect(mockCBNext.mock.calls.length).toBe(1);
			expect(mockValidatorTruthy.mock.calls.length).toBe(1);
		});

		test('with 2 validators that succeed should call next', async () => {
			const func = Common.validateMany([mockValidatorTruthy, mockValidatorTruthy]);
			await func(undefined, undefined, mockCBNext);
			expect(mockCBNext.mock.calls.length).toBe(1);
			expect(mockValidatorTruthy.mock.calls.length).toBe(2);
		});

		test('with 1 success -> 1 fail should never call next', async () => {
			const func = Common.validateMany([mockValidatorTruthy, mockValidatorFalsey]);
			await func(undefined, undefined, mockCBNext);
			expect(mockCBNext.mock.calls.length).toBe(0);
			expect(mockValidatorTruthy.mock.calls.length).toBe(1);
			expect(mockValidatorFalsey.mock.calls.length).toBe(1);
		});

		test('with 1 fail -> 1 success should never call next', async () => {
			const func = Common.validateMany([mockValidatorFalsey, mockValidatorTruthy]);
			await func(undefined, undefined, mockCBNext);
			expect(mockCBNext.mock.calls.length).toBe(0);
			expect(mockValidatorTruthy.mock.calls.length).toBe(0);
			expect(mockValidatorFalsey.mock.calls.length).toBe(1);
		});
	});
};

const testRouteDecommissioned = () => {
	describe('Route Decommissioned', () => {
		const req = {};
		const res = {};
		test('with no newEndpoint suggestion should respond with standard message', async () => {
			await Common.routeDecommissioned()(req, res);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.endpointDecommissioned);
		});

		test('with newEndpoint suggestion should respond with endpointDecommissioned and custom message', async () => {
			const newEndpoint = generateRandomString();
			const verb = generateRandomString();

			await Common.routeDecommissioned(verb, newEndpoint)(req, res);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, expect.objectContaining({
				code: templates.endpointDecommissioned.code,
				message: `This endpoint is no longer available. Please use ${verb} ${newEndpoint} instead.`,
			}));
		});
	});
};

describe('middleware/common', () => {
	testValidateMany();
	testRouteDecommissioned();
});
