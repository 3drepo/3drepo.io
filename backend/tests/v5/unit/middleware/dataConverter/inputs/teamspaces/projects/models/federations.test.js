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

const { times } = require('lodash');
const { src } = require('../../../../../../../helper/path');
const { generateUUIDString, generateRandomString, determineTestGroup } = require('../../../../../../../helper/services');
const { modelTypes } = require('../../../../../../../../../src/v5/models/modelSettings.constants');

jest.mock('../../../../../../../../../src/v5/utils/permissions');
const PermUtils = require(`${src}/utils/permissions`);

jest.mock('../../../../../../../../../src/v5/models/revisions');
const Revisions = require(`${src}/models/revisions`);

jest.mock('../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

jest.mock('../../../../../../../../../src/v5/models/projectSettings');
const Projects = require(`${src}/models/projectSettings`);

const Federations = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/federations`);
const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const modelNotInProject = generateUUIDString();

Projects.modelsExistInProject.mockImplementation(
	(teamspace, project, models) => {
		if (project === 'throw') return Promise.reject(templates.projectNotFound);
		return Promise.resolve(!models.includes(modelNotInProject));
	},
);

ModelSettings.getContainers.mockImplementation(
	(teamspace, models) => (teamspace === 'Error' ? Promise.resolve([]) : Promise.resolve(models)),
);

const testValidateNewRevisionData = () => {
	const createBody = (containers) => ({
		containers,
	});
	describe.each([
		['Request with valid data (old schema)', createBody(times(3, () => generateUUIDString()))],
		['Request with valid data (new schema)', createBody(times(3, () => ({ _id: generateUUIDString() })))],
		['Request with valid data (new schema with groups)', createBody(times(3, () => ({
			_id: generateUUIDString(),
			group: generateRandomString(),
		})))],
		['Request with invalid model Ids (wrong type)', createBody([1, 2, 3]), true],
		['Request with invalid model Ids (not uuid format', createBody(['model 1']), true],
		['Request with empty container array', createBody([]), true],
		['Request with container id that doesn\'t exist in the project', createBody([modelNotInProject]), true],
		['Request with project that does not exist', createBody([generateUUIDString()]), true, 'ts', 'throw'],
		['Request with container ids that is of federation', createBody([generateUUIDString()]), true, 'Error'],
		['Request with empty body', {}, true],
	])('Check new revision data', (desc, body, shouldFail, teamspace = 'a', project = 'b') => {
		test(`${desc} should ${shouldFail ? 'fail' : ' succeed and next() should be called'}`, async () => {
			const params = { teamspace, project, federation: 'c' };
			const mockCB = jest.fn(() => {});
			await Federations.validateNewRevisionData({ params, body }, {}, mockCB);
			if (shouldFail) {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
			} else {
				expect(mockCB.mock.calls.length).toBe(1);
			}
		});
	});
};

const testGetAccessibleContainers = () => {
	describe('Get accessible containers', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const federationId = generateUUIDString();
		const username = generateRandomString();
		const reqBase = {
			params: { teamspace, project, model: federationId },
			app: { get: () => false },
			session: { user: { username } },
		};
		const res = {};
		test('Should call next() if model type is not federation', async () => {
			const mockCB = jest.fn(() => {});
			const req = { ...reqBase };
			await Promise.all(Object.values(modelTypes).map(async (type) => {
				if (type !== modelTypes.FEDERATION) {
					const fn = Federations.getAccessibleContainers(type);
					await fn(req, res, mockCB);
				}
			}));

			expect(mockCB).toHaveBeenCalledTimes(2);
			expect(ModelSettings.getFederationById).not.toHaveBeenCalled();
		});

		const testFn = Federations.getAccessibleContainers(modelTypes.FEDERATION);

		test('Should respond with error if an error occured', async () => {
			const mockCB = jest.fn(() => {});
			const req = {
				...reqBase,
			};

			const err = templates.invalidArguments;
			ModelSettings.getFederationById.mockRejectedValueOnce(err);

			await testFn(req, res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();

			expect(ModelSettings.getFederationById).toHaveBeenCalledWith(teamspace, federationId, { subModels: 1 });
			expect(Revisions.getLatestRevision).not.toHaveBeenCalled();

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, err);
		});

		test('Should return all containers if BYPASS_AUTH is set', async () => {
			const mockCB = jest.fn(() => {});
			const reqBypass = {
				...reqBase,
				app: { get: () => true },
			};
			const nSubModels = 3;
			const containers = times(nSubModels, () => ({ _id: generateUUIDString() }));
			const revisions = times(nSubModels, () => ({ _id: generateUUIDString() }));

			ModelSettings.getFederationById.mockResolvedValueOnce({ subModels: containers });
			revisions.forEach((revision) => {
				Revisions.getLatestRevision.mockResolvedValueOnce(revision);
			});

			await testFn(reqBypass, res, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(reqBypass.containers).toEqual(containers.map((container, i) => ({
				container: container._id,
				revision: revisions[i]._id,
			})));

			expect(ModelSettings.getFederationById).toHaveBeenCalledWith(teamspace, federationId, { subModels: 1 });
			expect(Revisions.getLatestRevision).toHaveBeenCalledTimes(nSubModels);
			containers.forEach((container) => {
				expect(Revisions.getLatestRevision).toHaveBeenCalledWith(
					teamspace, container._id, modelTypes.CONTAINER, { _id: 1 });
			});
		});

		test('Should only return containers with access', async () => {
			const mockCB = jest.fn(() => {});
			const req = { ...reqBase };

			const nSubModels = 3;
			const containers = times(nSubModels, () => ({ _id: generateUUIDString() }));
			const revisions = times(nSubModels, () => ({ _id: generateUUIDString() }));

			ModelSettings.getFederationById.mockResolvedValueOnce({ subModels: containers });

			revisions.forEach((revision, i) => {
				if (i > 1) return;
				PermUtils.hasReadAccessToContainer.mockResolvedValueOnce(true);
				Revisions.getLatestRevision.mockResolvedValueOnce(revision);
			});

			const expectedResults = containers.slice(0, 2).map((container, i) => ({
				container: container._id,
				revision: revisions[i]._id,
			}));

			await testFn(req, res, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(req.containers).toEqual(expectedResults);

			expect(ModelSettings.getFederationById).toHaveBeenCalledWith(teamspace, federationId, { subModels: 1 });
			expect(PermUtils.hasReadAccessToContainer).toHaveBeenCalledTimes(nSubModels);
			expect(Revisions.getLatestRevision).toHaveBeenCalledTimes(2);
			containers.slice(0, 2).forEach((container) => {
				expect(Revisions.getLatestRevision).toHaveBeenCalledWith(
					teamspace, container._id, modelTypes.CONTAINER, { _id: 1 });
			});
		});

		test('Should skip containers which threw error', async () => {
			const mockCB = jest.fn(() => {});
			const req = { ...reqBase };

			const nSubModels = 3;
			const containers = times(nSubModels, () => ({ _id: generateUUIDString() }));
			const revisions = times(nSubModels, () => ({ _id: generateUUIDString() }));

			ModelSettings.getFederationById.mockResolvedValueOnce({ subModels: containers });

			revisions.forEach((revision, i) => {
				if (i > 1) {
					PermUtils.hasReadAccessToContainer.mockRejectedValueOnce(new Error('Test error'));
				} else {
					PermUtils.hasReadAccessToContainer.mockResolvedValueOnce(true);
					Revisions.getLatestRevision.mockResolvedValueOnce(revision);
				}
			});

			const expectedResults = containers.slice(0, 2).map((container, i) => ({
				container: container._id,
				revision: revisions[i]._id,
			}));

			await testFn(req, res, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(req.containers).toEqual(expectedResults);

			expect(ModelSettings.getFederationById).toHaveBeenCalledWith(teamspace, federationId, { subModels: 1 });
			expect(PermUtils.hasReadAccessToContainer).toHaveBeenCalledTimes(nSubModels);
			expect(Revisions.getLatestRevision).toHaveBeenCalledTimes(2);
			containers.slice(0, 2).forEach((container) => {
				expect(Revisions.getLatestRevision).toHaveBeenCalledWith(
					teamspace, container._id, modelTypes.CONTAINER, { _id: 1 });
			});
		});

		test('Should skip containers which get latest revision threw error', async () => {
			const mockCB = jest.fn(() => {});
			const req = { ...reqBase };

			const nSubModels = 3;
			const containers = times(nSubModels, () => ({ _id: generateUUIDString() }));
			const revisions = times(nSubModels, () => ({ _id: generateUUIDString() }));

			ModelSettings.getFederationById.mockResolvedValueOnce({ subModels: containers });

			revisions.forEach((revision, i) => {
				if (i > 1) {
					Revisions.getLatestRevision.mockRejectedValueOnce(new Error('Test error'));
				} else {
					PermUtils.hasReadAccessToContainer.mockResolvedValueOnce(true);
					Revisions.getLatestRevision.mockResolvedValueOnce(revision);
				}
			});

			const expectedResults = containers.slice(0, 2).map((container, i) => ({
				container: container._id,
				revision: revisions[i]._id,
			}));

			await testFn(req, res, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(req.containers).toEqual(expectedResults);

			expect(ModelSettings.getFederationById).toHaveBeenCalledWith(teamspace, federationId, { subModels: 1 });
			expect(PermUtils.hasReadAccessToContainer).toHaveBeenCalledTimes(nSubModels);
			expect(Revisions.getLatestRevision).toHaveBeenCalledTimes(2);
			containers.slice(0, 2).forEach((container) => {
				expect(Revisions.getLatestRevision).toHaveBeenCalledWith(
					teamspace, container._id, modelTypes.CONTAINER, { _id: 1 });
			});
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateNewRevisionData();
	testGetAccessibleContainers();
});
