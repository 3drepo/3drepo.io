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

const { src, modelFolder, objModel } = require('../../../../../helper/path');
const ServiceHelper = require('../../../../../helper/services');

const db = require(`${src}/handler/db`);
const fs = require('fs/promises');
const path = require('path');

jest.mock('../../../../../../../src/v5/models/projects');
const ProjectsModel = require(`${src}/models/projects`);
jest.mock('../../../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);
jest.mock('../../../../../../../src/v5/models/users');
const Users = require(`${src}/models/users`);
jest.mock('../../../../../../../src/v5/models/revisions');
const Revisions = require(`${src}/models/revisions`);
const Containers = require(`${src}/processors/teamspaces/projects/models/containers`);
const Views = require(`${src}/models/views`);
jest.mock('../../../../../../../src/v5/models/views');
const Legends = require(`${src}/models/legends`);
jest.mock('../../../../../../../src/v5/models/legends');
const { templates } = require(`${src}/utils/responseCodes`);

const newContainerId = 'newContainerId';
ModelSettings.addModel.mockImplementation(() => newContainerId);
ModelSettings.deleteModel.mockImplementation(async (ts, model) => {
	if (Number.isInteger(model)) {
		return undefined;
	}
	throw templates.containerNotFound;
});

const modelList = [
	{ _id: 1, name: 'model1', permissions: [{ user: 'user1', permission: 'collaborator' }, { user: 'user2', permission: 'collaborator' }] },
	{ _id: 2, name: 'model2', permissions: [{ user: 'user2', permission: 'commenter' }] },
	{ _id: 3, name: 'model3', permissions: [{ user: 'user1', permission: 'viewer' }] },
	{ _id: 4, name: 'model4', permissions: [] },
	{ _id: 4, name: 'model4' },
];

ModelSettings.getModelById.mockImplementation(async (ts, model) => {
	if (Number.isInteger(model)) {
		return modelList[model - 1];
	}
	throw templates.containerNotFound;
});

const containerSettings = {
	container1: {
		_id: 1,
		name: 'container 1',
		type: 'type 1',
		properties: {
			unit: 'm',
			code: 'CTN1',
		},
		status: 'ok',
		defaultView: 2,
		defaultLegend: 3,
		timestamp: new Date(),
		surveyPoints: [123],
		angleFromNorth: 10,
		desc: 'One description',
		errorReason: {
			message: 'error reason',
			timestamp: 123,
			errorCode: 1,
		},
	},
	container2: {
		_id: 2,
		name: 'container 2',
		type: 'type 2',
		properties: {
			unit: 'mm',
			code: 'CTN2',
		},
		status: 'processing',
	},
	container3: {
		_id: 3,
		name: 'container 3',
		type: 'type 2',
		properties: {
			units: 'mm',
			code: 'CTN2',
		},
		status: 'failed',
		errorReason: {
			message: 'abc',
			bouncerValue: 1,
			timestamp: new Date(),
		},
	},
	container4: {
		_id: 4,
		name: 'container 4',
		type: 'type 2',
		properties: {
			units: 'mm',
			code: 'CTN2',
		},
		status: 'processing',
		errorReason: {
			message: 'abc',
			bouncerValue: 1,
			timestamp: new Date(),
		},
	},
};

const user1Favourites = [1];

const project = { _id: 1, name: 'project', models: modelList.map(({ _id }) => _id) };

const container2Rev = {
	_id: 12,
	tag: 'revTag',
	timestamp: 1630606846000,
};

const model1Revisions = [
	{ _id: 1, author: 'user1', timestamp: new Date() },
	{ _id: 2, author: 'user1', timestamp: new Date() },
	{ _id: 3, author: 'user1', timestamp: new Date(), void: true },
];

ProjectsModel.getProjectById.mockImplementation(() => project);
ProjectsModel.addModelToProject.mockResolvedValue();
ModelSettings.getModelByQuery.mockImplementation((ts, query) => {
	if (query.name === 'model1') Promise.resolve(modelList[0]);
	else throw templates.modelNotFound;
});
ModelSettings.getContainers.mockImplementation(() => modelList);
const getContainerByIdMock = ModelSettings.getContainerById.mockImplementation((teamspace,
	container) => containerSettings[container]);
Views.checkViewExists.mockImplementation((teamspace, model, view) => {
	if (view === 1) {
		return 1;
	}
	throw templates.viewNotFound;
});

Legends.checkLegendExists.mockImplementation((teamspace, model, legend) => {
	if (legend === 1) {
		return 1;
	}
	throw templates.legendNotFound;
});

Revisions.getRevisionCount.mockImplementation((teamspace, container) => (container === 'container2' ? 10 : 0));
Revisions.getLatestRevision.mockImplementation((teamspace, container) => {
	if (container === 'container2') return container2Rev;
	throw templates.revisionNotFound;
});

const getRevisionsMock = Revisions.getRevisions.mockImplementation(() => model1Revisions);

Users.getFavourites.mockImplementation((user) => (user === 'user1' ? user1Favourites : []));
Users.appendFavourites.mockImplementation((username, teamspace, favouritesToAdd) => {
	for (const favourite of favouritesToAdd) {
		if (user1Favourites.indexOf(favourite) === -1) {
			user1Favourites.push(favourite);
		}
	}
});

Users.deleteFavourites.mockImplementation((username, teamspace, favouritesToAdd) => {
	for (const favourite of favouritesToAdd) {
		const index = user1Favourites.indexOf(favourite);
		if (index !== -1) {
			user1Favourites.splice(index, 1);
		}
	}
});

// Permissions mock
jest.mock('../../../../../../../src/v5/utils/permissions/permissions', () => ({
	...jest.requireActual('../../../../../../../src/v5/utils/permissions/permissions'),
	isTeamspaceAdmin: jest.fn().mockImplementation((teamspace, user) => user === 'tsAdmin'),
	hasProjectAdminPermissions: jest.fn().mockImplementation((perm, user) => user === 'projAdmin'),
}));

const determineResults = (username) => modelList.flatMap(({ permissions, _id, name }) => {
	const isAdmin = username === 'projAdmin' || username === 'tsAdmin';
	const hasModelPerm = permissions && permissions.find((entry) => entry.user === username);
	const isFavourite = username === 'user1' && user1Favourites.includes(_id);
	return isAdmin || hasModelPerm ? { _id, name, role: isAdmin ? 'admin' : hasModelPerm.permission, isFavourite } : [];
});

const testGetContainerList = () => {
	describe('Get container list by user', () => {
		test('should return the whole list if the user is a teamspace admin', async () => {
			const res = await Containers.getContainerList('teamspace', 'xxx', 'tsAdmin');
			expect(res).toEqual(determineResults('tsAdmin'));
		});
		test('should return the whole list if the user is a project admin', async () => {
			const res = await Containers.getContainerList('teamspace', 'xxx', 'projAdmin');
			expect(res).toEqual(determineResults('projAdmin'));
		});
		test('should return a partial list if the user has model access in some containers', async () => {
			const res = await Containers.getContainerList('teamspace', 'xxx', 'user1');
			expect(res).toEqual(determineResults('user1'));
		});
		test('should return a partial list if the user has model access in some containers (2)', async () => {
			const res = await Containers.getContainerList('teamspace', 'xxx', 'user2');
			expect(res).toEqual(determineResults('user2'));
		});
		test('should return empty array if the user has no access', async () => {
			const res = await Containers.getContainerList('teamspace', 'xxx', 'nobody');
			expect(res).toEqual([]);
		});
	});
};

const testAppendFavourites = () => {
	describe('Add containers to favourites', () => {
		test('new containers should be added to favourites if user has all permissions', async () => {
			await expect(Containers.appendFavourites('user1', 'teamspace', 'project', [3])).resolves.toEqual(undefined);
		});

		test('should return error if one or more containers are not found', async () => {
			await expect(Containers.appendFavourites('user1', 'teamspace', 'project', [1, -1]))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The action cannot be performed on the following models: -1' });
		});

		test('should return error if the containers list provided is empty', async () => {
			await expect(Containers.appendFavourites('user1', 'teamspace', 'project', []))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The favourites list provided is empty' });
		});

		test('should return error if user has no permissions on one or more models', async () => {
			await expect(Containers.appendFavourites('user1', 'teamspace', 'project', [1, 2]))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The action cannot be performed on the following models: 2' });
		});
	});
};

const testDeleteFavourites = () => {
	describe('Remove containers from favourites', () => {
		test('containers should be removed from favourites if user has all permissions', async () => {
			await expect(Containers.deleteFavourites('tsAdmin', 'teamspace', 'project', [1])).resolves.toEqual(undefined);
		});

		test('should return error if one or more containers are not found', async () => {
			await expect(Containers.deleteFavourites('tsAdmin', 'teamspace', 'project', [1, -1]))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The action cannot be performed on the following models: -1' });
		});

		test('should return error if the containers list provided is empty', async () => {
			await expect(Containers.deleteFavourites('user1', 'teamspace', 'project', []))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The favourites list provided is empty' });
		});

		test('should return error if user has no permissions on one or more models', async () => {
			await expect(Containers.deleteFavourites('user1', 'teamspace', 'project', [2]))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The action cannot be performed on the following models: 2' });
		});
	});
};

const formatToStats = (settings, revCount, latestRev) => {
	const res = {
		type: settings.type,
		code: settings.properties.code,
		status: settings.status,
		units: settings.properties.unit,
		revisions: {
			total: revCount,
			lastUpdated: latestRev.timestamp,
			latestRevision: latestRev.tag || latestRev._id,
		},
	};

	if (settings.status === 'failed') {
		res.errorReason = { message: settings.errorReason.message, timestamp: settings.errorReason.timestamp };
	}
	return res;
};

const testGetContainerStats = () => {
	describe.each([
		['the container exists and have no revisions', 'container1'],
		['the container exists and have revisions', 'container2'],
		['the container exists and latest revision processing have failed', 'container3'],
		['the container exists and some previous revision processing have failed', 'container4'],
	])('Get container stats', (desc, container) => {
		test(`should return the stats if ${desc}[${container}]`, async () => {
			const res = await Containers.getContainerStats('teamspace', 'project', container);
			expect(res).toEqual(formatToStats(containerSettings[container], container === 'container2' ? 10 : 0, container === 'container2' ? container2Rev : {}));
		});
	});
};

const testAddContainer = () => {
	describe('Add container', () => {
		test('should return the container ID on success', async () => {
			const data = {
				name: 'container name',
				code: 'code99',
				unit: 'mm',
			};
			const res = await Containers.addContainer('teamspace', 'project', 'tsAdmin', data);
			expect(res).toEqual(newContainerId);
			expect(ProjectsModel.addModelToProject.mock.calls.length).toBe(1);
		});
	});
};

const testDeleteContainer = () => {
	describe('Delete container', () => {
		test('should succeed', async () => {
			const modelId = 1;
			const collectionList = [
				{ name: `${modelId}.collA` },
				{ name: `${modelId}.collB` },
				{ name: 'otherModel.collA' },
				{ name: 'otherModel.collB' },
			];

			const fnList = jest.spyOn(db, 'listCollections').mockResolvedValue(collectionList);
			const fnDrop = jest.spyOn(db, 'dropCollection').mockResolvedValue(true);

			const teamspace = 'teamspace';
			await Containers.deleteContainer(teamspace, 'project', modelId, 'tsAdmin');

			expect(fnList.mock.calls.length).toBe(2);
			expect(fnList.mock.calls[0][0]).toEqual(teamspace);

			expect(fnDrop.mock.calls.length).toBe(2);
			expect(fnDrop.mock.calls[0][0]).toEqual(teamspace);
			expect(fnDrop.mock.calls[0][1]).toEqual(collectionList[0]);
			expect(fnDrop.mock.calls[1][0]).toEqual(teamspace);
			expect(fnDrop.mock.calls[1][1]).toEqual(collectionList[1]);
		});

		test('should succeed if file removal fails', async () => {
			await Containers.deleteContainer('teamspace', 'project', 3, 'tsAdmin');
		});
	});
};

const testGetRevisions = () => {
	describe('Get container revisions', () => {
		test('should return non-void revisions if the container exists', async () => {
			const idx = getRevisionsMock.mock.calls.length;
			const res = await Containers.getRevisions('teamspace', 1, false);
			expect(getRevisionsMock.mock.calls.length).toBe(idx + 1);
			expect(getRevisionsMock.mock.calls[idx][1]).toEqual(1);
			expect(getRevisionsMock.mock.calls[idx][2]).toBe(false);
			expect(res).toEqual(model1Revisions);
		});

		test('should return all revisions if the container exists', async () => {
			const idx = getRevisionsMock.mock.calls.length;
			const res = await Containers.getRevisions('teamspace', 1, true);
			expect(getRevisionsMock.mock.calls.length).toBe(idx + 1);
			expect(getRevisionsMock.mock.calls[idx][1]).toEqual(1);
			expect(getRevisionsMock.mock.calls[idx][2]).toBe(true);
			expect(res).toEqual(model1Revisions);
		});
	});
};

const fileExists = (file) => fs.access(file).then(() => true).catch(() => false);

const testNewRevision = () => {
	const fileCreated = path.join(modelFolder, 'toRemove.obj');
	describe('New container revisions', () => {
		const teamspace = 'teamspace';
		const model = '123';
		const data = {};
		const file = { path: fileCreated, originalname: 'hello.obj' };
		test('should execute successfully if queueModelUpload returns', async () => {
			await fs.copyFile(objModel, fileCreated);
			await expect(Containers.newRevision(teamspace, model, data, file)).resolves.toBe(undefined);
			await expect(fileExists(fileCreated)).resolves.toBe(false);
		});

		test('should return whatever error queueModelUpload returns should it fail', async () => {
			await expect(Containers.newRevision(teamspace, model, data, file))
				.rejects.toEqual(templates.queueInsertionFailed);
			await expect(fileExists(fileCreated)).resolves.toBe(false);
		});
		afterAll(ServiceHelper.queue.purgeQueues);
	});
};

const testGetSettings = () => {
	describe('Get container settings', () => {
		test('should return the container settings', async () => {
			const projection = { corID: 0, account: 0, permissions: 0 };
			const res = await Containers.getSettings('teamspace', 'container1');
			expect(res).toEqual(containerSettings.container1);
			expect(getContainerByIdMock.mock.calls.length).toBe(1);
			expect(getContainerByIdMock.mock.calls[0][2]).toEqual(projection);
		});
	});
};

describe('processors/teamspaces/projects/containers', () => {
	testGetContainerList();
	testGetContainerStats();
	testAddContainer();
	testDeleteContainer();
	testAppendFavourites();
	testDeleteFavourites();
	testGetRevisions();
	testNewRevision();
	testGetSettings();
});
