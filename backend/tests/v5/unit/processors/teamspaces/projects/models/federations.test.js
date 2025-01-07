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
const { generateRandomString, generateRandomObject, determineTestGroup, generateRandomNumber, outOfOrderArrayEqual } = require('../../../../../helper/services');

const UUIDParse = require('uuid-parse');
const CryptoJs = require('crypto-js');

jest.mock('../../../../../../../src/v5/models/projectSettings');
const ProjectSettings = require(`${src}/models/projectSettings`);
jest.mock('../../../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);
jest.mock('../../../../../../../src/v5/models/users');
const Users = require(`${src}/models/users`);
jest.mock('../../../../../../../src/v5/models/revisions');
const Revisions = require(`${src}/models/revisions`);
const TicketGroup = require(`${src}/processors/teamspaces/projects/models/commons/tickets.groups`);
const Federations = require(`${src}/processors/teamspaces/projects/models/federations`);
const Views = require(`${src}/models/views`);
jest.mock('../../../../../../../src/v5/models/views');
const Tickets = require(`${src}/processors/teamspaces/projects/models/commons/tickets`);
jest.mock('../../../../../../../src/v5/processors/teamspaces/projects/models/commons/tickets');
const Legends = require(`${src}/models/legends`);
jest.mock('../../../../../../../src/v5/models/legends');
const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);
jest.mock('../../../../../../../src/v5/models/fileRefs');
const FilesRef = require(`${src}/models/fileRefs`);

jest.mock('../../../../../../../src/v5/utils/helper/models');
const ModelHelper = require(`${src}/utils/helper/models`);

const newFederationId = 'newFederationId';
ModelSettings.addModel.mockImplementation(() => newFederationId);
ModelSettings.deleteModel.mockImplementation((ts, project, model) => {
	if (Number.isInteger(model)) {
		return Promise.resolve(undefined);
	}
	return Promise.reject(templates.federationNotFound);
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
			unit: 'm',
			code: 'FED1',
		},
		status: 'ok',
		subModels: [{ _id: 'container1', group: generateRandomString() }, { _id: 'container2' }],
		defaultView: 2,
		defaultLegend: 3,
		permissions: [1, 2, 3],
		angleFromNorth: 10,
		timestamp: new Date(),
		surveyPoints: [123],
		desc: 'This is a fed',
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
			unit: 'mm',
			code: 'FED2',
		},
		status: 'processing',
		subModels: ['container3'],
	},
	federation3: {
		_id: 3,
		name: 'federation 3',
		type: 'type 3',
		properties: {
			unit: 'mm',
			code: 'FED3',
		},
		status: 'processing',
	},
};

const user1Favourites = [1];
const project = { _id: 1, name: 'project', models: federationList.map(({ _id }) => _id) };

ProjectSettings.getProjectById.mockImplementation(() => project);
ModelSettings.getFederations.mockImplementation(() => federationList);
const getFederationByIdMock = ModelSettings.getFederationById.mockImplementation((teamspace,
	federation) => federationSettings[federation]);

Users.getFavourites.mockImplementation((user) => (user === 'user1' ? user1Favourites : []));
Views.getViewById.mockImplementation((teamspace, model, view) => {
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
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The following models were not found: -1' });
		});

		test('should return error if the federations list provided is empty', async () => {
			await expect(Federations.appendFavourites('user1', 'teamspace', 'project', []))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The favourites list provided is empty' });
		});

		test('should return error if user has no permissions on one or more models', async () => {
			await expect(Federations.appendFavourites('user1', 'teamspace', 'project', [1, 2]))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The following models were not found: 2' });
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
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The following models were not found: -1' });
		});

		test('should return error if the federations list provided is empty', async () => {
			await expect(Federations.deleteFavourites('user1', 'teamspace', 'project', []))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The favourites list provided is empty' });
		});

		test('should return error if user has no permissions on one or more models', async () => {
			await expect(Federations.deleteFavourites('user1', 'teamspace', 'project', [2]))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The following models were not found: 2' });
		});
	});
};

const formatToStats = (settings, ticketsCount, lastUpdated) => ({
	...(settings.desc ? { desc: settings.desc } : {}),
	...(settings.subModels ? { containers: settings.subModels } : {}),
	code: settings.properties.code,
	unit: settings.properties.unit,
	status: settings.status,
	lastUpdated,
	tickets: ticketsCount,
});

const testGetFederationStats = () => {
	describe('Get federation stats', () => {
		test('should return the stats if the federation exists and has subModels with revisions', async () => {
			const ticketsCount = generateRandomNumber();
			Tickets.getOpenTicketsCount.mockResolvedValueOnce(ticketsCount);
			const res = await Federations.getFederationStats('teamspace', 'project', 'federation1');
			expect(res).toEqual(formatToStats(federationSettings.federation1, ticketsCount, 5678));
		});
		test('should return the stats if the federation exists and has subModels with no revisions', async () => {
			const ticketsCount = generateRandomNumber();
			Tickets.getOpenTicketsCount.mockResolvedValueOnce(ticketsCount);
			const res = await Federations.getFederationStats('teamspace', 'project', 'federation2');
			expect(res).toEqual(formatToStats(federationSettings.federation2, ticketsCount));
		});
		test('should return the stats if the federation exists and has no subModels', async () => {
			const res = await Federations.getFederationStats('teamspace', 'project', 'federation3');
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
			expect(ProjectSettings.addModelToProject.mock.calls.length).toBe(1);
		});
	});
};

const testDeleteFederation = () => {
	describe('Delete federation', () => {
		test('should succeed', async () => {
			ModelHelper.removeModelData.mockResolvedValueOnce();
			ProjectSettings.removeModelFromProject.mockResolvedValueOnce();

			const teamspace = generateRandomString();
			const projectId = generateRandomString();
			const model = generateRandomString();
			await Federations.deleteFederation(teamspace, projectId, model);

			expect(ModelHelper.removeModelData).toHaveBeenCalledTimes(1);
			expect(ModelHelper.removeModelData).toHaveBeenCalledWith(teamspace, projectId, model);
			expect(ProjectSettings.removeModelFromProject).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.removeModelFromProject).toHaveBeenCalledWith(teamspace, projectId, model);
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

const testGetTicketGroupById = () => {
	describe('Get ticket group by Id', () => {
		const teamspace = generateRandomString();
		const projectId = generateRandomString();
		const federation = generateRandomString();
		const revId = generateRandomString();
		const ticket = generateRandomString();
		const groupId = generateRandomString();

		test('Should retrieve containers then call the general getTicketGroupById', async () => {
			const containers = [generateRandomString(), generateRandomString()];

			ModelSettings.getFederationById.mockResolvedValueOnce({ subModels: containers.map((_id) => ({ _id })) });

			const expectedData = generateRandomObject();
			const fn = jest.spyOn(TicketGroup, 'getTicketGroupById').mockResolvedValueOnce(expectedData);

			await expect(Federations.getTicketGroupById(teamspace, projectId, federation, revId, ticket, groupId, true))
				.resolves.toEqual(expectedData);

			expect(ModelSettings.getFederationById).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getFederationById).toHaveBeenCalledWith(teamspace, federation,
				{ subModels: 1 });

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, projectId, federation, revId, ticket, groupId, true, containers);
		});

		test('Should retrieve containers then call the general getTicketGroupById even if there\'s no containers', async () => {
			ModelSettings.getFederationById.mockResolvedValueOnce({ });

			const expectedData = generateRandomObject();
			const fn = jest.spyOn(TicketGroup, 'getTicketGroupById').mockResolvedValueOnce(expectedData);

			await expect(Federations.getTicketGroupById(teamspace, projectId, federation, revId, ticket,
				groupId, false)).resolves.toEqual(expectedData);

			expect(ModelSettings.getFederationById).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getFederationById).toHaveBeenCalledWith(teamspace, federation,
				{ subModels: 1 });

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, projectId, federation, revId, ticket, groupId, false, undefined);
		});
	});
};

const testGetMD5Hash = () => {
	describe('Get MD5 hashes for each container in the federation', () => {
		const revisionMock = { _id: Buffer.from('testBuffer'), rFile: ['success!'], timestamp: new Date() };
		const fileEntry = { size: 100, type: 'fs', link: generateRandomString() };
		const mockConatiners = [{ _id: '1', name: 'test1', permissions: [{ user: 'user1' }] }, { _id: '2', name: 'test2', permissions: [] }, { _id: '3', name: 'test3' }];
		ModelSettings.getContainers.mockImplementation((teamspace, containers) => {
			if (containers.length > 1) {
				return mockConatiners;
			}

			return mockConatiners.filter((container) => container._id === containers[0]);
		});

		// it should get an empty array if user doesn't have rights to the container
		test('should get an empty array if user does not have rights to the container', async () => {
			// given
			ModelSettings.getFederationById.mockResolvedValueOnce({ subModels: [{ _id: '1' }, { _id: '2' }, { _id: '3' }] });

			// it should
			await expect(Federations.getMD5Hash('teamspace', 'federation', 'NoAcessUser')).resolves.toEqual([]);

			expect(ModelSettings.getContainers).toHaveBeenCalledTimes(4);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(0);
			expect(Revisions.getLatestRevision).toHaveBeenCalledTimes(0);
		});
		// it should return just the containers the user has access to
		test('it should return just the containers users have access to', async () => {
			// given
			ModelSettings.getFederationById.mockResolvedValueOnce({ subModels: [{ _id: '1' }, { _id: '2' }, { _id: '3' }] });
			FilesManager.getFile.mockImplementation(() => revisionMock._id);
			Revisions.getLatestRevision.mockResolvedValueOnce(revisionMock);
			FilesRef.getRefEntry.mockResolvedValueOnce(fileEntry);

			// it should
			await expect(Federations.getMD5Hash('teamspace', 'federation', 'user1')).resolves.toEqual([{ container: '1',
				code: UUIDParse.unparse(revisionMock._id.buffer),
				uploadedAt: new Date(revisionMock.timestamp).getTime(),
				hash: CryptoJs.MD5(revisionMock._id).toString(),
				filename: revisionMock.rFile[0],
				size: fileEntry.size }]);

			expect(ModelSettings.getFederationById).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getContainers).toHaveBeenCalledTimes(4);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(0);
			expect(Revisions.getLatestRevision).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFile).toHaveBeenCalledTimes(1);
			expect(FilesRef.getRefEntry).toHaveBeenCalledTimes(1);
		});

		// it should return an array with all the containers if admin
		test('it should return an array with all the containers if admin', async () => {
			// given
			ModelSettings.getFederationById.mockResolvedValueOnce({ subModels: [{ _id: '1' }, { _id: '2' }, { _id: '3' }] });
			FilesManager.getFile.mockImplementation(() => revisionMock._id);
			Revisions.getLatestRevision.mockResolvedValue(revisionMock);
			FilesRef.getRefEntry.mockResolvedValue(fileEntry);
			
			// it should
			outOfOrderArrayEqual(await Federations.getMD5Hash('teamspace', 'federation', 'tsAdmin'), [
				{
					container: '1',
					code: UUIDParse.unparse(revisionMock._id.buffer),
					uploadedAt: new Date(revisionMock.timestamp).getTime(),
					hash: CryptoJs.MD5(revisionMock._id).toString(),
					filename: revisionMock.rFile[0],
					size: fileEntry.size,
				}, {
					container: '2',
					code: UUIDParse.unparse(revisionMock._id.buffer),
					uploadedAt: new Date(revisionMock.timestamp).getTime(),
					hash: CryptoJs.MD5(revisionMock._id).toString(),
					filename: revisionMock.rFile[0],
					size: fileEntry.size,
				}, {
					container: '3',
					code: UUIDParse.unparse(revisionMock._id.buffer),
					uploadedAt: new Date(revisionMock.timestamp).getTime(),
					hash: CryptoJs.MD5(revisionMock._id).toString(),
					filename: revisionMock.rFile[0],
					size: fileEntry.size,
				}]);
			expect(ModelSettings.getFederationById).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getContainers).toHaveBeenCalledTimes(4);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(0);
			expect(Revisions.getLatestRevision).toHaveBeenCalledTimes(3);
			expect(FilesManager.getFile).toHaveBeenCalledTimes(3);
			expect(FilesRef.getRefEntry).toHaveBeenCalledTimes(3);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetFederationList();
	testAppendFavourites();
	testDeleteFavourites();
	testGetFederationStats();
	testAddFederation();
	testDeleteFederation();
	testGetSettings();
	testGetTicketGroupById();
	testGetMD5Hash();
});
