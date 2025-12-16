/**
 *  Copyright (C) 2025 3D Repo Ltd
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

const { src } = require('../../../../../../../../../helper/path');
const { determineTestGroup, generateUUID, generateRandomNumber, generateRandomString } = require('../../../../../../../../../helper/services');
const { times } = require('lodash');
const { modelTypes } = require('../../../../../../../../../../../src/v5/models/modelSettings.constants');

jest.mock('../../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);
const { templates } = require(`${src}/utils/responseCodes`);

const BundlesMiddleware = require(`${src}/middleware/dataConverter/outputs/teamspaces/projects/models/commons/assets/bundles`);

const generateTestData = (withDefaults = false) => {
	const input = {};
	const output = { superMeshes: [] };

	input.superMeshes = times(3, () => {
		const baseData = {
			primitive: generateRandomNumber(),
		};

		const superMesh = { ...baseData };
		const superMeshOut = { ...baseData };

		if (withDefaults) {
			superMeshOut.nFaces = 0;
			superMeshOut.nVertices = 0;
			superMeshOut.nUVChannels = 0;
			superMeshOut.min = [0, 0, 0];
			superMeshOut.max = [0, 0, 0];
		} else {
			const nFaces = generateRandomNumber();
			const nVertices = generateRandomNumber();
			const nUVChannels = generateRandomNumber();
			const max = [generateRandomNumber(), generateRandomNumber(), generateRandomNumber()];
			const min = [generateRandomNumber(), generateRandomNumber(), generateRandomNumber()];

			superMesh.faces_count = nFaces;
			superMesh.vertices_count = nVertices;
			superMesh.uv_channels_count = nUVChannels;
			superMesh.bounding_box = [min, max];

			superMeshOut.nFaces = nFaces;
			superMeshOut.nVertices = nVertices;
			superMeshOut.nUVChannels = nUVChannels;
			superMeshOut.min = min;
			superMeshOut.max = max;
		}

		superMesh._id = generateUUID();
		superMeshOut._id = UUIDToString(superMesh._id);

		output.superMeshes.push(superMeshOut);
		return superMesh;
	});

	return { input, output };
};

const testSerialiseUnityMeta = () => {
	describe('Serialise unity meta', () => {
		test('Should work for container model', () => {
			const { input, output } = generateTestData();
			const req = { supermeshData: input };
			const res = {};

			BundlesMiddleware.serialiseUnityMeta(modelTypes.CONTAINER)(req, res);

			expect(Responder.respond).toHaveBeenCalledWith(
				req,
				res,
				templates.ok,
				output,
			);
		});

		test('Should work for federations', () => {
			const nSubModels = 3;
			const input = { subModels: [] };
			const output = { subModels: [] };

			for (let i = 0; i < nSubModels; i++) {
				const { input: subInput, output: subOutput } = generateTestData();
				const teamspace = generateRandomString();
				const model = generateRandomString();
				input.subModels.push({ superMeshes: subInput, teamspace, model });
				output.subModels.push({ superMeshes: subOutput, teamspace, model });
			}

			const req = { supermeshData: input };
			const res = {};

			BundlesMiddleware.serialiseUnityMeta(modelTypes.FEDERATION)(req, res);
			expect(Responder.respond).toHaveBeenCalledWith(
				req,
				res,
				templates.ok,
				output,
			);
		});

		test('Should work for federations (with defaults)', () => {
			const nSubModels = 3;
			const input = { subModels: [] };
			const output = { subModels: [] };

			for (let i = 0; i < nSubModels; i++) {
				const { input: subInput, output: subOutput } = generateTestData(true);
				const teamspace = generateRandomString();
				const model = generateRandomString();
				input.subModels.push({ superMeshes: subInput, teamspace, model });
				output.subModels.push({ superMeshes: subOutput, teamspace, model });
			}

			const req = { supermeshData: input };
			const res = {};

			BundlesMiddleware.serialiseUnityMeta(modelTypes.FEDERATION)(req, res);
			expect(Responder.respond).toHaveBeenCalledWith(
				req,
				res,
				templates.ok,
				output,
			);
		});

		test(`Should respond with ${templates.unknown.code} if an error occured`, () => {
			const req = { supermeshData: [] };
			const res = {};

			BundlesMiddleware.serialiseUnityMeta(modelTypes.CONTAINER)(req, res);

			expect(Responder.respond).toHaveBeenCalledWith(
				req,
				res,
				templates.unknown,
			);
		});

		test('Should respond with empty array if no object was provided', () => {
			const req = { };
			const res = {};

			BundlesMiddleware.serialiseUnityMeta(modelTypes.CONTAINER)(req, res);

			expect(Responder.respond).toHaveBeenCalledWith(
				req,
				res,
				templates.ok,
				{ superMeshes: [] },
			);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testSerialiseUnityMeta();
});
