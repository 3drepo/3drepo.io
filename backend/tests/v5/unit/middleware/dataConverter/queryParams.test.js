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

const { src } = require('../../../helper/path');

const QueryParams = require(`${src}/middleware/dataConverter/queryParams`);
const { templates } = require(`${src}/utils/responseCodes`);
const { determineTestGroup } = require('../../../helper/services');

jest.mock('../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const testValidateMapsCoordinates = () => {
	describe('validateMapsCoordinates', () => {
		test('should call next() and cast query values to numbers if query is valid', async () => {
			const req = {
				query: {
					zoomLevel: '3',
					x: '10',
					y: '20',
				},
			};
			const res = {};
			const next = jest.fn(async () => {});

			await QueryParams.validateMapsCoordinates(req, res, next);

			expect(next).toHaveBeenCalledTimes(1);
			expect(req.query).toEqual({
				zoomLevel: 3,
				x: 10,
				y: 20,
			});
			expect(Responder.respond).not.toHaveBeenCalled();
		});

		test('should respond with invalidArguments and not call next() if required parameter is missing', async () => {
			Responder.respond.mockResolvedValueOnce();
			const req = {
				query: {
					zoomLevel: 3,
					x: 10,
				},
			};
			const res = {};
			const next = jest.fn(async () => {});

			await QueryParams.validateMapsCoordinates(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(
				req,
				res,
				expect.objectContaining({ code: templates.invalidArguments.code }),
			);
		});

		test('should respond with invalidArguments and not call next() if values are not numbers', async () => {
			Responder.respond.mockResolvedValueOnce();
			const req = {
				query: {
					zoomLevel: 'abc',
					x: 10,
					y: 20,
				},
			};
			const res = {};
			const next = jest.fn(async () => {});

			await QueryParams.validateMapsCoordinates(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(
				req,
				res,
				expect.objectContaining({
					code: templates.invalidArguments.code,
					message: expect.any(String),
				}),
			);
		});
		test('should respond with invalidArguments and not call next() if values are negative', async () => {
			Responder.respond.mockResolvedValueOnce();
			const req = {
				query: {
					zoomLevel: -1,
					x: 10,
					y: 20,
				},
			};
			const res = {};
			const next = jest.fn(async () => {});

			await QueryParams.validateMapsCoordinates(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(
				req,
				res,
				expect.objectContaining({
					code: templates.invalidArguments.code,
					message: expect.any(String),
				}),
			);
		});
		test('should respond with invalidArguments and not call next() if values are not integers', async () => {
			Responder.respond.mockResolvedValueOnce();
			const req = {
				query: {
					zoomLevel: 3.5,
					x: 10,
					y: 20,
				},
			};
			const res = {};
			const next = jest.fn(async () => {});

			await QueryParams.validateMapsCoordinates(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(
				req,
				res,
				expect.objectContaining({
					code: templates.invalidArguments.code,
					message: expect.any(String),
				}),
			);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateMapsCoordinates();
});
