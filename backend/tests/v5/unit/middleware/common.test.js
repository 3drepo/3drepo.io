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

const Common = require(`${src}/middleware/common`);

jest.mock('../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

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

	describe('Route Deprecated', () => {
		test('with no newEndpoint suggestion should respond with endpointDecomissioned', async () => {
			Responder.respond.mockResolvedValueOnce(undefined);

			await Common.routeDeprecated()({}, {});
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond.mock.calls[0][2].code).toEqual(templates.endpointDecomissioned.code);
			expect(Responder.respond.mock.calls[0][2].message).toEqual('This route is deprecated.');
		});

		test('with newEndpoint suggestion should respond with endpointDecomissioned and custom message', async () => {
			Responder.respond.mockResolvedValueOnce(undefined);
			const httpVerb = generateRandomString();
			const newEndpoint = generateRandomString();

			await Common.routeDeprecated(httpVerb, newEndpoint)({}, {});
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond.mock.calls[0][2].code).toEqual(templates.endpointDecomissioned.code);
			expect(Responder.respond.mock.calls[0][2].message).toEqual(`This route is deprecated, please use ${httpVerb}: ${newEndpoint} instead.`);
		});
	});
};

describe('middleware/common', () => {
	testValidateMany();
});
