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

const { src } = require('../../../../../helper/path');

jest.mock('../../../../../../../src/v5/models/projects');
const ProjectsModel = require(`${src}/models/projects`);
jest.mock('../../../../../../../src/v5/models/modelSettings');
const newContainerId = 'newContainerId';
const ModelSettings = require(`${src}/models/modelSettings`);
ModelSettings.addModel.mockImplementation(() => ({ insertedId: newContainerId }));
ModelSettings.deleteModel.mockImplementation((ts, model) => ({ deletedCount: model === 1 ? 1 : 0 }));
jest.mock('../../../../../../../src/v5/models/users');
const Users = require(`${src}/models/users`);
jest.mock('../../../../../../../src/v5/models/revisions');
const Revisions = require(`${src}/models/revisions`);
const Containers = require(`${src}/processors/teamspaces/projects/models/containers`);
const { templates } = require(`${src}/utils/responseCodes`);

const modelList = [
	{ _id: 1, name: 'model1', permissions: [{ user: 'user1', permission: 'collaborator' }, { user: 'user2', permission: 'collaborator' }] },
	{ _id: 2, name: 'model2', permissions: [{ user: 'user2', permission: 'commenter' }] },
	{ _id: 3, name: 'model3', permissions: [{ user: 'user1', permission: 'viewer' }] },
	{ _id: 4, name: 'model4', permissions: [] },
	{ _id: 4, name: 'model4' },
];

const containerSettings = {
	container1: {
		_id: 1,
		name: 'container 1',
		type: 'type 1',
		properties: {
			units: 'm',
			code: 'CTN1',
		},
		status: 'ok',
	},
	container2: {
		_id: 2,
		name: 'container 2',
		type: 'type 2',
		properties: {
			units: 'mm',
			code: 'CTN2',
		},
		status: 'processing',
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
ModelSettings.getModelByName.mockImplementation((ts, models, name) => (name === 'model1' ? modelList[0] : undefined));
ModelSettings.getModels.mockImplementation(() => modelList);
ModelSettings.getContainers.mockImplementation(() => modelList);
ModelSettings.getContainerById.mockImplementation((teamspace, container) => containerSettings[container]);
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

const formatToStats = (settings, revCount, latestRev) => ({
	type: settings.type,
	code: settings.properties.code,
	status: settings.status,
	units: settings.properties.unit,
	revisions: {
		total: revCount,
		lastUpdated: latestRev.timestamp,
		latestRevision: latestRev.tag || latestRev._id,
	},
});

const testGetContainerStats = () => {
	describe('Get container stats', () => {
		test('should return the stats if the container exists and have no revisions', async () => {
			const res = await Containers.getContainerStats('teamspace', 'project', 'container1');
			expect(res).toEqual(formatToStats(containerSettings.container1, 0, {}));
		});
		test('should return the stats if the container exists and have revisions', async () => {
			const res = await Containers.getContainerStats('teamspace', 'project', 'container2');
			expect(res).toEqual(formatToStats(containerSettings.container2, 10, container2Rev));
		});
	});
};

const testAddContainer = () => {
	describe('Add container', () => {
		test('should return the container ID on success for teamspace admin', async () => {
			const data = {
				name: 'container name',
				code: 'code99',
				unit: 'mm',
			};
			const res = await Containers.addContainer('teamspace', 'project', 'tsAdmin', data);
			expect(res).toEqual(newContainerId);
		});

		test('should return the container ID on success for project admin', async () => {
			const data = {
				name: 'container name',
				code: 'code99',
				unit: 'mm',
			};
			const res = await Containers.addContainer('teamspace', 'project', 'projAdmin', data);
			expect(res).toEqual(newContainerId);
		});

		test('should return not authorized error if user is not admin', async () => {
			const data = {
				name: 'container name',
				code: 'code99',
				unit: 'mm',
			};
			await expect(Containers.addContainer('teamspace', 'project', 'notAdmin', data))
				.rejects.toEqual(templates.notAuthorized);
		});

		test('should return error if model name exists', async () => {
			const data = {
				name: 'model1',
				code: 'code99',
				unit: 'mm',
			};
			await expect(Containers.addContainer('teamspace', 'project', 'tsAdmin', data))
				.rejects.toEqual(templates.duplicateModelName);
		});
	});
};

const testDeleteContainer = () => {
	describe('Delete container', () => {
		test('should succeed for teamspace admin', async () => {
			const res = await Containers.deleteContainer('teamspace', 'project', 1, 'tsAdmin');
			expect(res).toEqual(undefined);
		});

		test('should succeed for project admin', async () => {
			const res = await Containers.deleteContainer('teamspace', 'project', 1, 'projAdmin');
			expect(res).toEqual(undefined);
		});

		test('should return not authorized error if user not admin', async () => {
			await expect(Containers.deleteContainer('teamspace', 'project', 1, 'notAdmin'))
				.rejects.toEqual(templates.notAuthorized);
		});

		test('should return container not found error if container does not exist', async () => {
			await expect(Containers.deleteContainer('teamspace', 'project', 'badModel', 'tsAdmin'))
				.rejects.toEqual(templates.containerNotFound);
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
			expect(getRevisionsMock.mock.calls[idx][2]).toEqual(false);
			expect(res).toEqual(model1Revisions);
		});

		test('should return all revisions if the container exists', async () => {
			const idx = getRevisionsMock.mock.calls.length;
			const res = await Containers.getRevisions('teamspace', 1, true);
			expect(getRevisionsMock.mock.calls.length).toBe(idx + 1);
			expect(getRevisionsMock.mock.calls[idx][1]).toEqual(1);
			expect(getRevisionsMock.mock.calls[idx][2]).toEqual(true);
			expect(res).toEqual(model1Revisions);
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
});
