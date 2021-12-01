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

const db = require(`${src}/handler/db`);

jest.mock('../../../../../../../src/v5/models/projects');
const ProjectsModel = require(`${src}/models/projects`);
jest.mock('../../../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);
jest.mock('../../../../../../../src/v5/models/issues');
const Issues = require(`${src}/models/issues`);
jest.mock('../../../../../../../src/v5/models/risks');
const Risks = require(`${src}/models/risks`);
jest.mock('../../../../../../../src/v5/models/users');
const Users = require(`${src}/models/users`);
jest.mock('../../../../../../../src/v5/models/revisions');
const Revisions = require(`${src}/models/revisions`);
const Federations = require(`${src}/processors/teamspaces/projects/models/federations`);
const Views = require(`${src}/models/views`);
jest.mock('../../../../../../../src/v5/models/views');
const Legends = require(`${src}/models/legends`);
jest.mock('../../../../../../../src/v5/models/legends');
const { templates } = require(`${src}/utils/responseCodes`);

const newFederationId = 'newFederationId';
ModelSettings.addModel.mockImplementation(() => newFederationId);
ModelSettings.deleteModel.mockImplementation(async (ts, model) => {
	if (Number.isInteger(model)) {
		return undefined;
	}
	throw templates.federationNotFound;
});

const federationList = [
	{ _id: 1, name: 'federation 1', permissions: [{ user: 'user1', permission: 'collaborator' }, { user: 'user2', permission: 'collaborator' }] },
	{ _id: 2, name: 'federation 2', permissions: [{ user: 'user2', permission: 'commenter' }] },
	{ _id: 3, name: 'federation 3', permissions: [{ user: 'user1', permission: 'viewer' }] },
	{ _id: 4, name: 'federation 4', permissions: [] },
	{ _id: 5, name: 'federation 5' },
];

const federationSettings = {
	federation1: {
		_id: 1,
		name: 'federation 1',
		type: 'type 1',
		properties: {
			units: 'm',
			code: 'FED1',
		},
		status: 'ok',
		subModels: [{ model: 'container1' }, { model: 'container2' }],
		category: 'category 1',
		defaultView: 2,
		defaultLegend: 3,
		permissions: [1, 2, 3],
		angleFromNorth: 10,
		timestamp: new Date(),
		surveyPoints: [123],
		errorReason: {
			message: 'error reason',
			timestamp: 123,
			errorCode: 1,
		},
	},
	federation2: {
		_id: 2,
		name: 'federation 2',
		type: 'type 2',
		properties: {
			units: 'mm',
			code: 'FED2',
		},
		status: 'processing',
		subModels: [{ model: 'container3' }],
		category: 'category 2',
	},
	federation3: {
		_id: 3,
		name: 'federation 3',
		type: 'type 3',
		properties: {
			units: 'mm',
			code: 'FED3',
		},
		status: 'processing',
		category: 'category 3',
	},
};

const user1Favourites = [1];
const project = { _id: 1, name: 'project', models: federationList.map(({ _id }) => _id) };

ProjectsModel.getProjectById.mockImplementation(() => project);
ModelSettings.getFederations.mockImplementation(() => federationList);
const getFederationByIdMock = ModelSettings.getFederationById.mockImplementation((teamspace,
	federation) => federationSettings[federation]);
Issues.getIssuesCount.mockImplementation((teamspace, federation) => {
	if (federation === 'federation1') return 1;
	if (federation === 'federation2') return 2;
	return 0;
});

Risks.getRisksCount.mockImplementation((teamspace, federation) => {
	if (federation === 'federation1') return 1;
	if (federation === 'federation2') return 2;
	return 0;
});

Users.getFavourites.mockImplementation((user) => (user === 'user1' ? user1Favourites : []));
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

Revisions.getLatestRevision.mockImplementation((teamspace, container) => {
	if (container === 'container1') return { timestamp: 1234 };
	if (container === 'container2') return { timestamp: 5678 };
	throw templates.revisionNotFound;
});

// Permissions mock
jest.mock('../../../../../../../src/v5/utils/permissions/permissions', () => ({
	...jest.requireActual('../../../../../../../src/v5/utils/permissions/permissions'),
	isTeamspaceAdmin: jest.fn().mockImplementation((teamspace, user) => user === 'tsAdmin'),
	hasProjectAdminPermissions: jest.fn().mockImplementation((perm, user) => user === 'projAdmin'),
}));

const determineResults = (username) => federationList.flatMap(({ permissions, _id, name }) => {
	const isAdmin = username === 'projAdmin' || username === 'tsAdmin';
	const hasModelPerm = permissions && permissions.find((entry) => entry.user === username);
	const isFavourite = username === 'user1' && user1Favourites.includes(_id);
	return isAdmin || hasModelPerm ? { _id, name, role: isAdmin ? 'admin' : hasModelPerm.permission, isFavourite } : [];
});

const testGetFederationList = () => {
	describe('Get federation list by user', () => {
		test('should return the whole list if the user is a teamspace admin', async () => {
			const res = await Federations.getFederationList('teamspace', 'xxx', 'tsAdmin');
			expect(res).toEqual(determineResults('tsAdmin'));
		});
		test('should return the whole list if the user is a project admin', async () => {
			const res = await Federations.getFederationList('teamspace', 'xxx', 'projAdmin');
			expect(res).toEqual(determineResults('projAdmin'));
		});
		test('should return a partial list if the user has model access in some federations', async () => {
			const res = await Federations.getFederationList('teamspace', 'xxx', 'user1');
			expect(res).toEqual(determineResults('user1'));
		});
		test('should return a partial list if the user has model access in some federations (2)', async () => {
			const res = await Federations.getFederationList('teamspace', 'xxx', 'user2');
			expect(res).toEqual(determineResults('user2'));
		});
		test('should return empty array if the user has no access', async () => {
			const res = await Federations.getFederationList('teamspace', 'xxx', 'nobody');
			expect(res).toEqual([]);
		});
	});
};

const testAppendFavourites = () => {
	describe('Add federations to favourites', () => {
		test('new federations should be added to favourites if user has all permissions', async () => {
			await expect(Federations.appendFavourites('user1', 'teamspace', 'project', [3])).resolves.toEqual(undefined);
		});

		test('should return error if one or more federations are not found', async () => {
			await expect(Federations.appendFavourites('user1', 'teamspace', 'project', [1, -1]))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The action cannot be performed on the following models: -1' });
		});

		test('should return error if the federations list provided is empty', async () => {
			await expect(Federations.appendFavourites('user1', 'teamspace', 'project', []))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The favourites list provided is empty' });
		});

		test('should return error if user has no permissions on one or more models', async () => {
			await expect(Federations.appendFavourites('user1', 'teamspace', 'project', [1, 2]))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The action cannot be performed on the following models: 2' });
		});
	});
};

const testDeleteFavourites = () => {
	describe('Remove federations from favourites', () => {
		test('federations should be removed from favourites if user has all permissions', async () => {
			await expect(Federations.deleteFavourites('tsAdmin', 'teamspace', 'project', [1])).resolves.toEqual(undefined);
		});

		test('should return error if one or more federations are not found', async () => {
			await expect(Federations.deleteFavourites('tsAdmin', 'teamspace', 'project', [1, -1]))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The action cannot be performed on the following models: -1' });
		});

		test('should return error if the federations list provided is empty', async () => {
			await expect(Federations.deleteFavourites('user1', 'teamspace', 'project', []))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The favourites list provided is empty' });
		});

		test('should return error if user has no permissions on one or more models', async () => {
			await expect(Federations.deleteFavourites('user1', 'teamspace', 'project', [2]))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The action cannot be performed on the following models: 2' });
		});
	});
};

const formatToStats = (settings, issueCount, riskCount, lastUpdated) => ({
	code: settings.properties.code,
	status: settings.status,
	subModels: settings.subModels,
	category: settings.category,
	lastUpdated,
	tickets: {
		issues: issueCount ?? 0,
		risks: riskCount ?? 0,
	},
});

const testGetFederationStats = () => {
	describe('Get federation stats', () => {
		test('should return the stats if the federation exists and has subModels with revisions', async () => {
			const res = await Federations.getFederationStats('teamspace', 'federation1');
			expect(res).toEqual(formatToStats(federationSettings.federation1, 1, 1, 5678));
		});
		test('should return the stats if the federation exists and has subModels with no revisions', async () => {
			const res = await Federations.getFederationStats('teamspace', 'federation2');
			expect(res).toEqual(formatToStats(federationSettings.federation2, 2, 2));
		});
		test('should return the stats if the federation exists and has no subModels', async () => {
			const res = await Federations.getFederationStats('teamspace', 'federation3');
			expect(res).toEqual(formatToStats(federationSettings.federation3));
		});
	});
};

const testAddFederation = () => {
	describe('Add federation', () => {
		test('should return the federation ID on success', async () => {
			const data = {
				name: 'federation name',
				code: 'code99',
				unit: 'mm',
				federate: true,
			};
			const res = await Federations.addFederation('teamspace', 'project', 'tsAdmin', data);
			expect(res).toEqual(newFederationId);
			expect(ProjectsModel.addModelToProject.mock.calls.length).toBe(1);
		});
	});
};

const testDeleteFederation = () => {
	describe('Delete federation', () => {
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
			await Federations.deleteFederation(teamspace, 'project', modelId, 'tsAdmin');

			expect(fnList.mock.calls.length).toBe(2);
			expect(fnList.mock.calls[0][0]).toEqual(teamspace);

			expect(fnDrop.mock.calls.length).toBe(2);
			expect(fnDrop.mock.calls[0][0]).toEqual(teamspace);
			expect(fnDrop.mock.calls[0][1]).toEqual(collectionList[0]);
			expect(fnDrop.mock.calls[1][0]).toEqual(teamspace);
			expect(fnDrop.mock.calls[1][1]).toEqual(collectionList[1]);
		});

		test('should succeed if file removal fails', async () => {
			await Federations.deleteFederation('teamspace', 'project', 3, 'tsAdmin');
		});
	});
};

const testGetSettings = () => {
	describe('Get federation settings', () => {
		test('should return the federation settings', async () => {
			const projection = { corID: 0, account: 0, permissions: 0, subModels: 0, federate: 0 };
			const res = await Federations.getSettings('teamspace', 'federation1');
			expect(res).toEqual(federationSettings.federation1);
			expect(getFederationByIdMock.mock.calls.length).toBe(1);
			expect(getFederationByIdMock.mock.calls[0][2]).toEqual(projection);
		});
	});
};

describe('processors/teamspaces/projects/federations', () => {
	testGetFederationList();
	testAppendFavourites();
	testDeleteFavourites();
	testGetFederationStats();
	testAddFederation();
	testDeleteFederation();
	testGetSettings();
});
