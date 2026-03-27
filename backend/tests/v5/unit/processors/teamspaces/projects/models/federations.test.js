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
const { src } = require('../../../../../helper/path');
const { generateRandomString, generateRandomObject, determineTestGroup, generateRandomNumber, generateUUIDString } = require('../../../../../helper/services');

const Federations = require(`${src}/processors/teamspaces/projects/models/federations`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);

jest.mock('../../../../../../../src/v5/processors/teamspaces/projects/models/containers');
const ContainersProcessor = require(`${src}/processors/teamspaces/projects/models/containers`);
jest.mock('../../../../../../../src/v5/processors/teamspaces/projects/models/commons/favourites');
const Favourites = require(`${src}/processors/teamspaces/projects/models/commons/favourites`);
jest.mock('../../../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);
jest.mock('../../../../../../../src/v5/processors/teamspaces/projects/models/commons/modelList');
const ModelList = require(`${src}/processors/teamspaces/projects/models/commons/modelList`);
jest.mock('../../../../../../../src/v5/models/projectSettings');
const ProjectSettings = require(`${src}/models/projectSettings`);
jest.mock('../../../../../../../src/v5/models/revisions');
const Revisions = require(`${src}/models/revisions`);
jest.mock('../../../../../../../src/v5/processors/teamspaces/projects/models/commons/tickets');
const Tickets = require(`${src}/processors/teamspaces/projects/models/commons/tickets`);
jest.mock('../../../../../../../src/v5/processors/teamspaces/projects/models/commons/tickets.groups');
const TicketGroup = require(`${src}/processors/teamspaces/projects/models/commons/tickets.groups`);

const testGetTicketGroupById = () => {
	describe('Get ticket group by Id', () => {
		const teamspace = generateRandomString();
		const projectId = generateRandomString();
		const federation = generateRandomString();
		const revId = generateRandomString();
		const ticket = generateRandomString();
		const groupId = generateRandomString();

		test('Should retrieve containers then call the general getTicketGroupById', async () => {
			const containers = times(2, () => ({ container: generateRandomString() }));
			TicketGroup.getTicketGroupById.mockResolvedValueOnce();

			await Federations.getTicketGroupById(
				teamspace, projectId, federation, revId, ticket, groupId, true, containers,
			);

			expect(TicketGroup.getTicketGroupById).toHaveBeenCalledTimes(1);
			expect(TicketGroup.getTicketGroupById).toHaveBeenCalledWith(
				teamspace, projectId, federation, revId, ticket, groupId, true, containers.map((c) => c.container));
		});

		test('Should retrieve containers then call the general getTicketGroupById even if there\'s no containers', async () => {
			TicketGroup.getTicketGroupById.mockResolvedValueOnce();

			await Federations.getTicketGroupById(teamspace, projectId, federation, revId, ticket, groupId, false, []);

			expect(TicketGroup.getTicketGroupById).toHaveBeenCalledTimes(1);
			expect(TicketGroup.getTicketGroupById).toHaveBeenCalledWith(
				teamspace, projectId, federation, revId, ticket, groupId, false, undefined);
		});
	});
};

const testAddFederation = () => {
	describe('Add federation', () => {
		const teamspace = generateRandomString();
		const projectId = generateRandomString();
		const federation = generateRandomString();
		test('should call addModel', async () => {
			ModelList.addModel.mockResolvedValueOnce();

			await Federations.addFederation(teamspace, projectId, federation);

			expect(ModelList.addModel).toHaveBeenCalledTimes(1);
			expect(ModelList.addModel).toHaveBeenCalledWith(teamspace, projectId, { ...federation, federate: true });
		});
	});
};

const testGetFederationList = () => {
	describe('Get federation list by user', () => {
		const teamspace = generateRandomString();
		const projectId = generateRandomString();
		const user = generateRandomString();
		const project = { _id: generateRandomString(), models: times(5, () => generateRandomString()) };

		test('should call all dependent functions inside.', async () => {
			const result = generateRandomObject();
			ProjectSettings.getProjectById.mockResolvedValueOnce(project);
			ModelSettings.getFederations.mockResolvedValueOnce(project.models);
			ModelList.getModelList.mockResolvedValueOnce(result);

			await expect(Federations.getFederationList(teamspace, projectId, user))
				.resolves.toEqual(result);

			expect(ProjectSettings.getProjectById).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.getProjectById)
				.toHaveBeenCalledWith(teamspace, projectId, { permissions: 1, models: 1 });

			expect(ModelSettings.getFederations).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getFederations)
				.toHaveBeenCalledWith(teamspace, project.models, { _id: 1, name: 1, permissions: 1 });

			expect(ModelList.getModelList).toHaveBeenCalledTimes(1);
			expect(ModelList.getModelList).toHaveBeenCalledWith(teamspace, projectId, user, project.models);
		});
	});
};

const testAppendFavourites = () => {
	describe('Add federations to favourites', () => {
		const username = generateRandomString();
		const teamspace = generateRandomString();
		const projectId = generateRandomString();
		const favouritesToAdd = times(5, () => generateRandomString());
		const accessibleFederations = times(5, () => generateRandomString());

		test('should call all dependent functions inside.', async () => {
			const fn = jest.spyOn(Federations, 'getFederationList').mockResolvedValueOnce(accessibleFederations);
			await Federations.appendFavourites(username, teamspace, projectId, favouritesToAdd);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, projectId, username);

			expect(Favourites.appendFavourites).toHaveBeenCalledTimes(1);
			expect(Favourites.appendFavourites)
				.toHaveBeenCalledWith(username, teamspace, accessibleFederations, favouritesToAdd);
		});
	});
};

const testDeleteFavourites = () => {
	describe('Remove federations from favourites', () => {
		const username = generateRandomString();
		const teamspace = generateRandomString();
		const projectId = generateRandomString();
		const favouritesToRemove = times(5, () => generateRandomString());
		const accessibleFederations = times(5, () => generateRandomString());

		test('should call all dependent functions inside.', async () => {
			const fn = jest.spyOn(Federations, 'getFederationList').mockResolvedValueOnce(accessibleFederations);
			await Federations.deleteFavourites(username, teamspace, projectId, favouritesToRemove);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, projectId, username);

			expect(Favourites.deleteFavourites).toHaveBeenCalledTimes(1);
			expect(Favourites.deleteFavourites)
				.toHaveBeenCalledWith(username, teamspace, accessibleFederations, favouritesToRemove);
		});
	});
};

const testNewRevision = () => {
	describe('Add new federation revision', () => {
		const teamspace = generateRandomString();
		const projectId = generateRandomString();
		const federation = generateRandomString();
		const info = {
			owner: generateRandomString(),
			containers: times(2, () => generateRandomObject()),
		};
		const revisionId = generateUUIDString();

		test('should call addRevision and updateModelSubModels', async () => {
			Revisions.addRevision.mockResolvedValueOnce(revisionId);
			ModelSettings.updateModelSubModels.mockResolvedValueOnce();

			await Federations.newRevision(teamspace, projectId, federation, info);

			expect(Revisions.addRevision).toHaveBeenCalledTimes(1);
			expect(Revisions.addRevision)
				.toHaveBeenCalledWith(
					teamspace,
					projectId,
					federation,
					modelTypes.FEDERATION,
					{ containers: info.containers, author: info.owner },
				);

			expect(ModelSettings.updateModelSubModels).toHaveBeenCalledTimes(1);
			expect(ModelSettings.updateModelSubModels).toHaveBeenCalledWith(
				teamspace,
				projectId,
				federation,
				info.owner,
				revisionId,
				info.containers,
			);
		});
	});
};

const testGetFederationStats = () => {
	describe('Get federation stats', () => {
		const teamspace = generateRandomString();
		const projectId = generateRandomString();
		const federationId = generateRandomString();
		const ticketsCount = generateRandomNumber();
		const federation = {
			desc: generateRandomString(),
			status: generateRandomString(),
			properties: {
				unit: generateRandomString(),
				code: generateRandomString(),
			},
			subModels: times(2, () => ({ _id: generateRandomString() })),
			timestamp: new Date(),
		};

		const firstTimestamp = 1234;
		const lastTimestamp = 5678;

		test('should return the stats if the federation exists and has subModels with revisions', async () => {
			ModelSettings.getFederationById.mockResolvedValueOnce(federation);
			Tickets.getOpenTicketsCount.mockResolvedValueOnce(ticketsCount);
			Revisions.getLatestRevision
				.mockResolvedValueOnce({ timestamp: firstTimestamp })
				.mockResolvedValueOnce({ timestamp: lastTimestamp });

			const res = await Federations.getFederationStats(teamspace, projectId, federationId);

			expect(res).toEqual({
				code: federation.properties.code,
				unit: federation.properties.unit,
				status: federation.status,
				containers: federation.subModels,
				desc: federation.desc,
				lastUpdated: lastTimestamp,
				tickets: ticketsCount,
			});

			expect(ModelSettings.getFederationById).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getFederationById)
				.toHaveBeenCalledWith(teamspace, federationId, { properties: 1, status: 1, subModels: 1, desc: 1 });

			expect(Tickets.getOpenTicketsCount).toHaveBeenCalledTimes(1);
			expect(Tickets.getOpenTicketsCount).toHaveBeenCalledWith(teamspace, projectId, federationId);

			expect(Revisions.getLatestRevision).toHaveBeenCalledTimes(2);
			expect(Revisions.getLatestRevision).toHaveBeenCalledWith(teamspace, federation.subModels[0]._id,
				modelTypes.FEDERATION, { timestamp: 1 });
			expect(Revisions.getLatestRevision).toHaveBeenCalledWith(teamspace, federation.subModels[1]._id,
				modelTypes.FEDERATION, { timestamp: 1 });
		});

		test('should return the stats if the federation exists and has subModels with no revisions', async () => {
			ModelSettings.getFederationById.mockResolvedValueOnce(federation);
			Tickets.getOpenTicketsCount.mockResolvedValueOnce(ticketsCount);
			Revisions.getLatestRevision
				.mockRejectedValueOnce()
				.mockRejectedValueOnce();

			const res = await Federations.getFederationStats(teamspace, projectId, federation);

			expect(res).toEqual({
				code: federation.properties.code,
				unit: federation.properties.unit,
				status: federation.status,
				desc: federation.desc,
				containers: federation.subModels,
				lastUpdated: undefined,
				tickets: ticketsCount,
			});

			expect(ModelSettings.getFederationById).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getFederationById)
				.toHaveBeenCalledWith(teamspace, federation, { properties: 1, status: 1, subModels: 1, desc: 1 });

			expect(Tickets.getOpenTicketsCount).toHaveBeenCalledTimes(1);
			expect(Tickets.getOpenTicketsCount).toHaveBeenCalledWith(teamspace, projectId, federation);

			expect(Revisions.getLatestRevision).toHaveBeenCalledTimes(2);
			expect(Revisions.getLatestRevision).toHaveBeenCalledWith(teamspace, federation.subModels[0]._id,
				modelTypes.FEDERATION, { timestamp: 1 });
			expect(Revisions.getLatestRevision).toHaveBeenCalledWith(teamspace, federation.subModels[0]._id,
				modelTypes.FEDERATION, { timestamp: 1 });
		});

		test('should return the stats if the federation exists and has no subModels', async () => {
			ModelSettings.getFederationById.mockResolvedValueOnce({ ...federation, subModels: undefined });
			Tickets.getOpenTicketsCount.mockResolvedValueOnce(ticketsCount);
			Revisions.getLatestRevision.mockRejectedValueOnce();

			const res = await Federations.getFederationStats(teamspace, projectId, federation);

			expect(res).toEqual({
				code: federation.properties.code,
				unit: federation.properties.unit,
				status: federation.status,
				desc: federation.desc,
				containers: undefined,
				lastUpdated: undefined,
				tickets: ticketsCount,
			});

			expect(ModelSettings.getFederationById).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getFederationById)
				.toHaveBeenCalledWith(teamspace, federation, { properties: 1, status: 1, subModels: 1, desc: 1 });

			expect(Tickets.getOpenTicketsCount).toHaveBeenCalledTimes(1);
			expect(Tickets.getOpenTicketsCount).toHaveBeenCalledWith(teamspace, projectId, federation);

			expect(Revisions.getLatestRevision).not.toHaveBeenCalled();
		});
	});
};

const testGetSettings = () => {
	describe('Get federation settings', () => {
		const teamspace = generateRandomString();
		const federation = generateRandomString();

		test('should call getFederationById', async () => {
			ModelSettings.getFederationById.mockResolvedValueOnce();

			await Federations.getSettings(teamspace, federation);

			expect(ModelSettings.getFederationById).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getFederationById)
				.toHaveBeenCalledWith(
					teamspace,
					federation,
					{ corID: 0, account: 0, permissions: 0, subModels: 0, federate: 0 },
				);
		});
	});
};

const testGetMD5Hash = () => {
	describe('Get MD5 hashes for each container in the federation', () => {
		const teamspace = generateRandomString();

		test('it should call getModelMD5Hash for each container passed', async () => {
			const nContainers = 3;
			const containers = times(nContainers, () => ({
				container: generateRandomString(), revision: generateRandomString() }));

			ModelList.getModelMD5Hash.mockResolvedValueOnce();

			await Federations.getMD5Hash(teamspace, containers);

			expect(ModelList.getModelMD5Hash).toHaveBeenCalledTimes(nContainers);
			containers.forEach(({ container, revision }, index) => {
				expect(ModelList.getModelMD5Hash).toHaveBeenNthCalledWith(index + 1, teamspace, container, revision);
			});
		});

		test('it should not call getModelMD5Hash if no containers are passed', async () => {
			await expect(Federations.getMD5Hash(teamspace, [])).resolves.toEqual([]);

			expect(ModelList.getModelMD5Hash).not.toHaveBeenCalled();
		});
	});
};

const testGetSuperMeshesInfo = () => {
	describe('Get super meshes info for federation', () => {
		const teamspace = generateRandomString();
		const federationId = generateRandomString();
		const revisionId = generateRandomString();

		test('when federation has containers', async () => {
			const containers = times(3, () => ({
				container: generateRandomString(), revision: generateRandomString() }));
			const superMeshInfoMock = times(3, () => generateRandomObject());

			superMeshInfoMock.forEach((info) => {
				ContainersProcessor.getSuperMeshesInfo.mockResolvedValueOnce(info);
			});

			const expectedData = superMeshInfoMock.map((info, index) => ({
				teamspace,
				model: containers[index].container,
				superMeshes: info,
			}));

			await expect(Federations.getSuperMeshesInfo(teamspace, federationId, revisionId, containers))
				.resolves.toEqual({ subModels: expectedData });

			expect(ContainersProcessor.getSuperMeshesInfo).toHaveBeenCalledTimes(containers.length);
			containers.forEach(({ container: model, revision }) => {
				expect(ContainersProcessor.getSuperMeshesInfo).toHaveBeenCalledWith(
					teamspace,
					model,
					revision,
				);
			});
		});

		test('when federation has no containers', async () => {
			await expect(Federations.getSuperMeshesInfo(teamspace, federationId, revisionId, []))
				.resolves.toEqual({ subModels: [] });

			expect(ContainersProcessor.getSuperMeshesInfo).not.toHaveBeenCalled();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetTicketGroupById();
	testAddFederation();
	testGetFederationList();
	testAppendFavourites();
	testDeleteFavourites();
	testNewRevision();
	testGetFederationStats();
	testGetSettings();
	testGetMD5Hash();
	testGetSuperMeshesInfo();
});
