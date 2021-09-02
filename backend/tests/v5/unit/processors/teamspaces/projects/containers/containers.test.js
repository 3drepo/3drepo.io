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
const ModelSettings = require(`${src}/models/modelSettings`);
jest.mock('../../../../../../../src/v5/models/users');
const Users = require(`${src}/models/users`);
jest.mock('../../../../../../../src/v5/models/revisions');
const Revisions = require(`${src}/models/revisions`);
const Containers = require(`${src}/processors/teamspaces/projects/containers/containers`);
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

ProjectsModel.getProjectById.mockImplementation(() => project);
ModelSettings.getContainers.mockImplementation(() => modelList);
ModelSettings.getContainerById.mockImplementation((teamspace, container) => containerSettings[container]);
Revisions.getRevisionCount.mockImplementation((teamspace, container) => (container === 'container2' ? 10 : 0));
Revisions.getLatestRevision.mockImplementation((teamspace, container) => {
	if (container === 'container2') return container2Rev;
	throw templates.revisionNotFound;
});
Users.getFavourites.mockImplementation((user) => (user === 'user1' ? user1Favourites : []));

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

const formatToStats = (settings, revCount, latestRev) => ({
	type: settings.type,
	code: settings.properties.code,
	status: settings.status,
	units: settings.properties.unit,
	revision: {
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

describe('processors/teamspaces/projects/containers', () => {
	testGetContainerList();
	testGetContainerStats();
});
