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

const { templates, createResponseCode } = require('../../../../../src/v5/utils/responseCodes');
const { src } = require('../../../helper/path');

const PathParams = require(`${src}/middleware/dataConverter/pathParams`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { generateRandomString, determineTestGroup } = require('../../../helper/services');
const { times } = require('lodash');

jest.mock('../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const testConvertAllUUIDs = () => {
	describe('Convert UUIDs in params', () => {
		test('next() should be called with no changes to the params if there are no params', () => {
			const mockCB = jest.fn(() => {});
			PathParams.convertAllUUIDs({}, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('next() should be called with relevant params changed', () => {
			const mockCB = jest.fn(() => {});
			const params = {
				a: 1,
				b: '',
				c: null,
				d: 'abc',
				e: '7591fbdb-52b9-490a-8a77-fdb57c57dbc8',
				f: '120965d4-dd6e-4505-a2d2-e9a5cdcaad81',
				container: '120965d4-dd6e-4505-a2d2-e9a5cdcaad81',
				federation: '120965d4-dd6e-4505-a2d2-e9a5cdcaad81',
				drawing: '120965d4-dd6e-4505-a2d2-e9a5cdcaad81',
			};
			const expectedResult = {
				...params,
				e: stringToUUID(params.e),
				f: stringToUUID(params.f),
			};
			PathParams.convertAllUUIDs({ params }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
			expect(params).toEqual(expectedResult);
		});

		test('next() should copy model param to container and def', () => {
			const mockCB = jest.fn(() => {});
			const params = {
				model: '120965d4-dd6e-4505-a2d2-e9a5cdcaad81',
			};
			const expectedResult = {
				...params,
				container: params.model,
				federation: params.model,
				drawing: params.model,
			};
			PathParams.convertAllUUIDs({ params }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
			expect(params).toEqual(expectedResult);
		});
	});
};

const testGetModelIdFromParam = () => {
	describe('Get Model Id from req params', () => {
		test('next() should be called with no changes to the params if model is already populated', () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { model: generateRandomString() } };
			PathParams.getModelIdFromParam(modelTypes.CONTAINER)(req, {}, mockCB);

			expect(mockCB).toHaveBeenCalledTimes(1);
		});

		test('next() should be called with model populated from container', () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { container: generateRandomString() } };
			PathParams.getModelIdFromParam(modelTypes.CONTAINER)(req, {}, mockCB);

			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(req.params.model).toEqual(req.params.container);
		});

		test('next() should be called with model populated from federation', () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { federation: generateRandomString() } };
			PathParams.getModelIdFromParam(modelTypes.FEDERATION)(req, {}, mockCB);

			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(req.params.model).toEqual(req.params.federation);
		});

		test('next() should be called with model populated from drawing', () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { drawing: generateRandomString() } };
			PathParams.getModelIdFromParam(modelTypes.DRAWING)(req, {}, mockCB);

			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(req.params.model).toEqual(req.params.drawing);
		});
	});
};

const testGetModelIdsFromQuery = () => {
	const modelList = times(3, () => generateRandomString());
	const modelListString = modelList.join(',');
	describe.each([
		['federation array is provided', true, { federations: modelListString }, modelTypes.FEDERATION, modelList],
		['container array is provided', true, { containers: modelListString }, modelTypes.CONTAINER, modelList],
		['drawing array is provided', true, { drawings: modelListString }, modelTypes.DRAWING, modelList],
		['models is not provided', false, {}, modelTypes.DRAWING],
		['the wrong model type is provided', false, { containers: modelListString }, modelTypes.DRAWING],
		['model array is provided instead', true, { models: modelListString }, modelTypes.DRAWING, modelList],

	])('Get Model Ids from req query', (desc, success, query, modelType, parsedParams) => {
		test(`Should ${success ? 'call next()' : `respond with ${templates.invalidArguments.code}`} if ${desc}`, async () => {
			const mockCB = jest.fn();
			const req = { query };
			const res = { };
			await PathParams.getModelIdsFromQuery(modelType)(req, res, mockCB);

			if (success) {
				expect(mockCB).toHaveBeenCalledTimes(1);
				expect(req.models).toEqual(parsedParams);
			} else {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledWith(req, res, createResponseCode(templates.invalidArguments, '"models" is missing from query string'));
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testConvertAllUUIDs();
	testGetModelIdFromParam();
	testGetModelIdsFromQuery();
});
