/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { cloneDeep, times } = require('lodash');

const { src } = require('../../../../../../helper/path');
const { determineTestGroup, generateRandomString, generateRandomObject } = require('../../../../../../helper/services');

const Groups = require(`${src}/processors/teamspaces/projects/models/commons/tickets.groups`);

jest.mock('../../../../../../../../src/v5/models/tickets.groups');
const GroupsModel = require(`${src}/models/tickets.groups`);

jest.mock('../../../../../../../../src/v5/models/revisions');
const RevsModel = require(`${src}/models/revisions`);

jest.mock('../../../../../../../../src/v5/models/metadata');
const MetaModel = require(`${src}/models/metadata`);

jest.mock('../../../../../../../../src/v5/models/scenes');
const ScenesModel = require(`${src}/models/scenes`);

jest.mock('../../../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

const testGetTicketGroupById = () => {
	describe('Get ticket group by Id', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const revId = generateRandomString();
		const ticket = generateRandomString();
		const group = generateRandomString();

		test('[Normal group] should return the group found', async () => {
			const expectedData = generateRandomObject();
			GroupsModel.getGroupById.mockResolvedValueOnce(expectedData);

			await expect(Groups.getTicketGroupById(teamspace, project, model, revId, ticket, group))
				.resolves.toEqual(expectedData);

			expect(GroupsModel.getGroupById).toHaveBeenCalledTimes(1);
			expect(GroupsModel.getGroupById).toHaveBeenCalledWith(teamspace, project, model, ticket, group);
		});

		test('[Smart group] should return the group found with the query results (container)', async () => {
			const groupData = { ...generateRandomObject(), rules: [generateRandomObject()] };
			GroupsModel.getGroupById.mockResolvedValueOnce(groupData);

			const metaRes = times(10, () => ({ parents: times(2, () => generateRandomString()) }));
			MetaModel.getMetadataByRules.mockResolvedValueOnce({ matched: metaRes, unwanted: [] });

			const nodeRes = times(10, () => ({ _id: generateRandomString() }));
			ScenesModel.getNodesBySharedIds.mockResolvedValueOnce(nodeRes);

			const idMapMock = {};

			nodeRes.forEach(({ _id }) => { idMapMock[_id] = [_id]; });

			FilesManager.getFile.mockResolvedValueOnce(JSON.stringify(idMapMock));

			const expectedData = cloneDeep(groupData);
			expectedData.objects = [{
				container: model,
				_ids: nodeRes.map(({ _id }) => _id),
			}];

			await expect(Groups.getTicketGroupById(teamspace, project, model, revId, ticket, group))
				.resolves.toEqual(expectedData);

			expect(GroupsModel.getGroupById).toHaveBeenCalledTimes(1);
			expect(GroupsModel.getGroupById).toHaveBeenCalledWith(teamspace, project, model, ticket, group);

			expect(RevsModel.getLatestRevision).not.toHaveBeenCalled();

			expect(MetaModel.getMetadataByRules).toHaveBeenCalledTimes(1);
			expect(MetaModel.getMetadataByRules).toHaveBeenCalledWith(teamspace, project, model, revId,
				groupData.rules, { parents: 1 });

			expect(ScenesModel.getNodesBySharedIds).toHaveBeenCalledTimes(1);
			expect(ScenesModel.getNodesBySharedIds).toHaveBeenCalledWith(teamspace, project, model,
				revId, metaRes.flatMap(({ parents }) => parents), { _id: 1 });
		});

		test('[Smart group] should return the group found with the query results (federations)', async () => {
			const container = generateRandomString();

			const conRev = generateRandomString();
			RevsModel.getLatestRevision.mockResolvedValueOnce({ _id: conRev });

			const groupData = { ...generateRandomObject(), rules: [generateRandomObject()] };
			GroupsModel.getGroupById.mockResolvedValueOnce(groupData);

			const metaRes = times(10, () => ({ parents: times(2, () => generateRandomString()) }));
			MetaModel.getMetadataByRules.mockResolvedValueOnce({ matched: metaRes, unwanted: [] });

			const nodeRes = times(10, () => ({ _id: generateRandomString() }));
			ScenesModel.getNodesBySharedIds.mockResolvedValueOnce(nodeRes);

			const idMapMock = {};

			nodeRes.forEach(({ _id }) => { idMapMock[_id] = [_id]; });

			FilesManager.getFile.mockResolvedValueOnce(JSON.stringify(idMapMock));

			const expectedData = cloneDeep(groupData);
			expectedData.objects = [{
				container,
				_ids: nodeRes.map(({ _id }) => _id),
			}];

			await expect(Groups.getTicketGroupById(teamspace, project, model, revId, ticket, group, [container]))
				.resolves.toEqual(expectedData);

			expect(GroupsModel.getGroupById).toHaveBeenCalledTimes(1);
			expect(GroupsModel.getGroupById).toHaveBeenCalledWith(teamspace, project, model, ticket, group);

			expect(RevsModel.getLatestRevision).toHaveBeenCalledTimes(1);
			expect(RevsModel.getLatestRevision).toHaveBeenCalledWith(teamspace, container, { _id: 1 });

			expect(MetaModel.getMetadataByRules).toHaveBeenCalledTimes(1);
			expect(MetaModel.getMetadataByRules).toHaveBeenCalledWith(teamspace, project, container, conRev,
				groupData.rules, { parents: 1 });

			expect(ScenesModel.getNodesBySharedIds).toHaveBeenCalledTimes(1);
			expect(ScenesModel.getNodesBySharedIds).toHaveBeenCalledWith(teamspace, project, container,
				conRev, metaRes.flatMap(({ parents }) => parents), { _id: 1 });
		});

		test('[Smart group] should not fail if we failed to find a revision for the container (federations)', async () => {
			const container = generateRandomString();

			RevsModel.getLatestRevision.mockRejectedValueOnce(generateRandomString());

			const groupData = { ...generateRandomObject(), rules: [generateRandomObject()] };
			GroupsModel.getGroupById.mockResolvedValueOnce(groupData);

			const expectedData = cloneDeep(groupData);
			expectedData.objects = [];

			await expect(Groups.getTicketGroupById(teamspace, project, model, revId, ticket, group, [container]))
				.resolves.toEqual(expectedData);

			expect(GroupsModel.getGroupById).toHaveBeenCalledTimes(1);
			expect(GroupsModel.getGroupById).toHaveBeenCalledWith(teamspace, project, model, ticket, group);

			expect(RevsModel.getLatestRevision).toHaveBeenCalledTimes(1);
			expect(RevsModel.getLatestRevision).toHaveBeenCalledWith(teamspace, container, { _id: 1 });

			expect(MetaModel.getMetadataByRules).not.toHaveBeenCalled();
			expect(ScenesModel.getNodesBySharedIds).not.toHaveBeenCalled();
		});

		test('[Smart group] should return the group found with the query results (negative query)', async () => {
			const groupData = { ...generateRandomObject(), rules: [generateRandomObject()] };
			GroupsModel.getGroupById.mockResolvedValueOnce(groupData);

			const metaRes = times(10, () => ({ parents: times(2, () => generateRandomString()) }));
			const rejected = times(10, () => ({ parents: times(2, () => generateRandomString()) }));
			MetaModel.getMetadataByRules.mockResolvedValueOnce({ matched: metaRes, unwanted: rejected });

			const nodeRes = times(10, () => ({ _id: generateRandomString() }));
			ScenesModel.getNodesBySharedIds.mockResolvedValueOnce(nodeRes);
			ScenesModel.getNodesBySharedIds.mockResolvedValueOnce(nodeRes.slice(5));

			const idMapMock = {};

			nodeRes.forEach(({ _id }) => { idMapMock[_id] = [_id]; });

			FilesManager.getFile.mockResolvedValueOnce(JSON.stringify(idMapMock));

			const expectedData = cloneDeep(groupData);
			expectedData.objects = [{
				container: model,
				_ids: nodeRes.slice(0, 5).map(({ _id }) => _id),
			}];

			await expect(Groups.getTicketGroupById(teamspace, project, model, revId, ticket, group))
				.resolves.toEqual(expectedData);

			expect(GroupsModel.getGroupById).toHaveBeenCalledTimes(1);
			expect(GroupsModel.getGroupById).toHaveBeenCalledWith(teamspace, project, model, ticket, group);

			expect(RevsModel.getLatestRevision).not.toHaveBeenCalled();

			expect(MetaModel.getMetadataByRules).toHaveBeenCalledTimes(1);
			expect(MetaModel.getMetadataByRules).toHaveBeenCalledWith(teamspace, project, model, revId,
				groupData.rules, { parents: 1 });

			expect(ScenesModel.getNodesBySharedIds).toHaveBeenCalledTimes(2);
			expect(ScenesModel.getNodesBySharedIds).toHaveBeenCalledWith(teamspace, project, model,
				revId, metaRes.flatMap(({ parents }) => parents), { _id: 1 });
		});

		test('[Smart group] should return the group found with the query results (idmap not found)', async () => {
			const groupData = { ...generateRandomObject(), rules: [generateRandomObject()] };
			GroupsModel.getGroupById.mockResolvedValueOnce(groupData);

			const metaRes = times(10, () => ({ parents: times(2, () => generateRandomString()) }));
			const rejected = times(10, () => ({ parents: times(2, () => generateRandomString()) }));
			MetaModel.getMetadataByRules.mockResolvedValueOnce({ matched: metaRes, unwanted: rejected });

			const nodeRes = times(10, () => ({ _id: generateRandomString() }));
			ScenesModel.getNodesBySharedIds.mockResolvedValueOnce(nodeRes);
			ScenesModel.getNodesBySharedIds.mockResolvedValueOnce(nodeRes.slice(5));

			const idMapMock = {};

			nodeRes.slice(1, nodeRes.length - 1).forEach(({ _id }) => { idMapMock[_id] = [_id]; });

			FilesManager.getFile.mockResolvedValueOnce(JSON.stringify(idMapMock));

			const expectedData = cloneDeep(groupData);
			expectedData.objects = [{
				container: model,
				_ids: nodeRes.slice(1, 5).map(({ _id }) => _id),
			}];

			await expect(Groups.getTicketGroupById(teamspace, project, model, revId, ticket, group))
				.resolves.toEqual(expectedData);

			expect(GroupsModel.getGroupById).toHaveBeenCalledTimes(1);
			expect(GroupsModel.getGroupById).toHaveBeenCalledWith(teamspace, project, model, ticket, group);

			expect(RevsModel.getLatestRevision).not.toHaveBeenCalled();

			expect(MetaModel.getMetadataByRules).toHaveBeenCalledTimes(1);
			expect(MetaModel.getMetadataByRules).toHaveBeenCalledWith(teamspace, project, model, revId,
				groupData.rules, { parents: 1 });

			expect(ScenesModel.getNodesBySharedIds).toHaveBeenCalledTimes(2);
			expect(ScenesModel.getNodesBySharedIds).toHaveBeenCalledWith(teamspace, project, model,
				revId, metaRes.flatMap(({ parents }) => parents), { _id: 1 });
		});

		test('[Smart group] should return the group found with the query results (no match)', async () => {
			const groupData = { ...generateRandomObject(), rules: [generateRandomObject()] };
			GroupsModel.getGroupById.mockResolvedValueOnce(groupData);

			MetaModel.getMetadataByRules.mockResolvedValueOnce({ matched: [], unwanted: [] });

			FilesManager.getFile.mockResolvedValueOnce(JSON.stringify({}));

			const expectedData = cloneDeep(groupData);
			expectedData.objects = [];

			await expect(Groups.getTicketGroupById(teamspace, project, model, revId, ticket, group))
				.resolves.toEqual(expectedData);

			expect(GroupsModel.getGroupById).toHaveBeenCalledTimes(1);
			expect(GroupsModel.getGroupById).toHaveBeenCalledWith(teamspace, project, model, ticket, group);

			expect(RevsModel.getLatestRevision).not.toHaveBeenCalled();

			expect(MetaModel.getMetadataByRules).toHaveBeenCalledTimes(1);
			expect(MetaModel.getMetadataByRules).toHaveBeenCalledWith(teamspace, project, model, revId,
				groupData.rules, { parents: 1 });

			expect(ScenesModel.getNodesBySharedIds).not.toHaveBeenCalled();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetTicketGroupById();
});
