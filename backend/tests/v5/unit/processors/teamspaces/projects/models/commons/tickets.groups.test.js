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
const { determineTestGroup, generateRandomString, generateRandomObject, generateUUIDString } = require('../../../../../../helper/services');
const { stringToUUID } = require('../../../../../../../../src/v5/utils/helper/uuids');
const { idTypesToKeys, idTypes } = require('../../../../../../../../src/v5/models/metadata.constants');

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
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const container = generateRandomString();
	const ticket = generateRandomString();
	const groupId = generateRandomString();
	const smartGroup = { rules: [generateRandomObject()] };
	const normalGroup = { objects: [{ _ids: [times(10, () => generateRandomString())], container }] };
	const ifcGuidGroup = { objects: [{ [idTypes.IFC]: [times(10, () => generateRandomString())], container }] };
	const revitIdGroup = { objects: [{ [idTypes.REVIT]: [times(10, () => generateRandomString())], container }] };

	const getMeta = (externalIdName) => times(10, () => ({ parents: times(2, () => generateRandomString()),
		metadata: [{ key: externalIdName, value: generateRandomString() }] }));

	const defaultOptions = {
		group: smartGroup,
		matchedMeta: getMeta(idTypesToKeys[idTypes.IFC][0]),
		unwantedMeta: [],
		revision: generateRandomString(),
		convertToMeshIds: true,
		latestRevisionFail: false,
	};

	describe.each([
		['when it is a container group', defaultOptions],
		['when it is a federation group', { ...defaultOptions, containers: [container] }],
		['when getLatestRevision fails', { ...defaultOptions, containers: [container], latestRevisionFail: true }],
		['when there is a negative query', { ...defaultOptions, unwantedMeta: defaultOptions.matchedMeta.slice(5) }],
		['when there are no matches', { ...defaultOptions, matchedMeta: [] }],
		['with ifc guids', { ...defaultOptions, convertToMeshIds: false, externalIdName: [idTypes.IFC] }],
		['with revit ids', { ...defaultOptions, convertToMeshIds: false, externalIdName: [idTypes.REVIT], matchedMeta: getMeta(idTypesToKeys[idTypes.REVIT][0]) }],
		['with ifc guids (with negative query)', { ...defaultOptions, convertToMeshIds: false, externalIdName: [idTypes.IFC], unwantedMeta: defaultOptions.matchedMeta.slice(0, 5) }],
	])('Get ticket group by Id (smart group)', (desc, options) => {
		test(`should return the group found ${desc}`, async () => {
			let expectedData;
			let { revision } = options;

			GroupsModel.getGroupById.mockResolvedValueOnce(cloneDeep(options.group));

			if (options.latestRevisionFail) {
				RevsModel.getLatestRevision.mockRejectedValueOnce(generateRandomString);
				expectedData = { ...options.group, objects: [] };
			} else {
				if (options.containers) {
					revision = generateRandomString();
					RevsModel.getLatestRevision.mockResolvedValueOnce({ _id: revision });
				}

				MetaModel.getMetadataByRules.mockResolvedValueOnce({
					matched: options.matchedMeta, unwanted: options.unwantedMeta,
				});

				if (options.convertToMeshIds) {
					const nodeRes = options.matchedMeta.length
						? times(10, () => ({ _id: generateRandomString() }))
						: [];

					if (options.matchedMeta.length) {
						ScenesModel.getNodesBySharedIds.mockResolvedValueOnce(nodeRes);
					}

					if (options.unwantedMeta.length && nodeRes.length) {
						ScenesModel.getNodesBySharedIds
							.mockResolvedValueOnce([...nodeRes.slice(options.unwantedMeta.length),
								{ _id: generateRandomString() }]);
					}

					const idMapMock = {};
					nodeRes.slice(1).forEach(({ _id }) => { idMapMock[_id] = [_id]; });
					FilesManager.getFile.mockResolvedValueOnce(JSON.stringify(idMapMock));

					const ids = nodeRes.slice(1, nodeRes.length - options.unwantedMeta.length).map(({ _id }) => _id);

					expectedData = { ...options.group, objects: ids.length ? [{ container, _ids: ids }] : [] };
				} else {
					expectedData = { ...options.group,
						objects: [{ container,
							[options.externalIdName]: options.matchedMeta.map((m) => m.metadata[0].value) }] };
				}
			}

			await expect(Groups.getTicketGroupById(teamspace, project, container, options.revision, ticket,
				groupId, options.convertToMeshIds, options.containers)).resolves.toEqual(expectedData);

			expect(GroupsModel.getGroupById).toHaveBeenCalledTimes(1);
			expect(GroupsModel.getGroupById).toHaveBeenCalledWith(teamspace, project, container, ticket, groupId);

			if (options.containers) {
				expect(RevsModel.getLatestRevision).toHaveBeenCalledTimes(1);
				expect(RevsModel.getLatestRevision).toHaveBeenCalledWith(teamspace, container, { _id: 1 });
			}

			if (!options.latestRevisionFail) {
				expect(MetaModel.getMetadataByRules).toHaveBeenCalledTimes(1);
				expect(MetaModel.getMetadataByRules).toHaveBeenCalledWith(teamspace, project, container,
					revision, options.group.rules, {
						parents: 1,
						...(options.convertToMeshIds ? {} : { metadata: { $elemMatch:
							{ $or: Object.values(idTypesToKeys).flat().map((n) => ({ key: n })) } } }),
					});

				if (options.matchedMeta.length && options.convertToMeshIds) {
					expect(ScenesModel.getNodesBySharedIds).toHaveBeenCalledWith(teamspace, project, container,
						revision, options.matchedMeta.flatMap(({ parents }) => parents), { _id: 1 });
				}

				if (options.unwantedMeta.length && options.convertToMeshIds) {
					expect(ScenesModel.getNodesBySharedIds).toHaveBeenCalledWith(teamspace, project, container,
						revision, options.unwantedMeta.flatMap(({ parents }) => parents), { _id: 1 });
				}
			}
		});
	});

	describe.each([
		['when it is a federation group', { ...defaultOptions, containers: [container], group: ifcGuidGroup, externalIdName: [idTypes.IFC] }],
		['when convertToMeshIds set to false', { ...defaultOptions, group: ifcGuidGroup, convertToMeshIds: false }],
		['when group already stores 3d repo Ids', { ...defaultOptions, group: normalGroup }],
		['when getLatestRevision fails', { ...defaultOptions, group: ifcGuidGroup, externalIdName: [idTypes.IFC], containers: [container], latestRevisionFail: true }],
		['when converting from ifc guids', { ...defaultOptions, group: ifcGuidGroup, externalIdName: [idTypes.IFC] }],
		['when converting from revit Ids', { ...defaultOptions, group: revitIdGroup, externalIdName: [idTypes.REVIT] }],
	])('Get ticket group by Id (normal group)', (desc, options) => {
		test(`should return the group found ${desc}`, async () => {
			const expectedData = cloneDeep(options.group);
			let { revision } = options;
			const { externalIdName, convertToMeshIds, latestRevisionFail, containers, group } = options;

			GroupsModel.getGroupById.mockResolvedValueOnce(cloneDeep(group));

			if (convertToMeshIds && externalIdName) {
				if (latestRevisionFail) {
					RevsModel.getLatestRevision.mockRejectedValueOnce(generateRandomString());
					expectedData.objects = [];
				} else {
					if (containers) {
						revision = generateRandomString();
						RevsModel.getLatestRevision.mockResolvedValueOnce({ _id: revision });
					}

					const nodeRes = times(10, () => ({ _id: generateUUIDString() }));
					MetaModel.getMetadataWithMatchingData.mockResolvedValueOnce(options.matchedMeta);
					ScenesModel.getNodesBySharedIds.mockResolvedValueOnce(nodeRes);

					const idMapMock = { };
					nodeRes.slice(1).forEach(({ _id }) => { idMapMock[_id] = [_id]; });
					FilesManager.getFile.mockResolvedValueOnce(JSON.stringify(idMapMock));

					const ids = nodeRes.slice(1).map(({ _id }) => stringToUUID(_id));
					expectedData.objects = expectedData.objects
						.map((o) => ({ ...o, [externalIdName]: undefined, _ids: ids }));
				}
			}

			await expect(Groups.getTicketGroupById(teamspace, project, container, revision, ticket,
				groupId, convertToMeshIds, containers)).resolves.toEqual(expectedData);

			if (convertToMeshIds) {
				if (containers) {
					expect(RevsModel.getLatestRevision).toHaveBeenCalledTimes(1);
					expect(RevsModel.getLatestRevision).toHaveBeenCalledWith(teamspace,
						group.objects[0].container, { _id: 1 });
				}

				if (!latestRevisionFail && group !== normalGroup) {
					expect(MetaModel.getMetadataWithMatchingData).toHaveBeenCalledTimes(1);
					expect(MetaModel.getMetadataWithMatchingData).toHaveBeenCalledWith(teamspace,
						container, revision, idTypesToKeys[externalIdName],
						group.objects[0][externalIdName], { parents: 1 });
				}
			}

			expect(GroupsModel.getGroupById).toHaveBeenCalledTimes(1);
			expect(GroupsModel.getGroupById).toHaveBeenCalledWith(teamspace, project, container, ticket, groupId);
		});
	});
};

const testAddGroups = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const container = generateRandomString();
	const revision = generateRandomString();
	const ticket = generateRandomString();

	describe('Add groups', () => {
		test('should add smart groups', async () => {
			const smartGroups = times(10, () => ({ rules: generateRandomString() }));
			await Groups.addGroups(teamspace, project, container, ticket, smartGroups);

			expect(GroupsModel.addGroups).toHaveBeenCalledTimes(1);
			expect(GroupsModel.addGroups).toHaveBeenCalledWith(teamspace, project, container, ticket, smartGroups);
		});

		test('should add groups without conversion if they already have external Id', async () => {
			const groups = times(10, () => ({
				objects: [{ [idTypes.IFC]: [generateRandomString()], container: generateRandomString() }],
			}));
			await Groups.addGroups(teamspace, project, container, ticket, groups);

			expect(GroupsModel.addGroups).toHaveBeenCalledTimes(1);
			expect(GroupsModel.addGroups).toHaveBeenCalledWith(teamspace, project, container, ticket, groups);
		});

		describe.each([
			['preserve object as it is (no metadata found)', undefined, []],
			[`convert object ids to ${[idTypes.IFC]}`, [idTypes.IFC], times(10, () => ({ metadata: [{ key: idTypesToKeys[idTypes.IFC][0], value: generateRandomString() }] }))],
			[`convert object ids to ${[idTypes.REVIT]}`, [idTypes.REVIT], times(10, () => ({ metadata: [{ key: idTypesToKeys[idTypes.REVIT][0], value: generateRandomString() }] }))],
		])('Convert Ids and add groups', (desc, externalIdName, metadata) => {
			test(`should ${desc} and add groups`, async () => {
				const groups = times(10, () => ({
					objects: [{ _ids: [generateRandomString()], container: generateRandomString() }],
				}));
				const sharedIds = times(10, () => ({ rev_id: revision, shared_id: generateRandomString() }));

				times(groups.length, () => {
					ScenesModel.getNodesByIds.mockResolvedValueOnce(sharedIds);
					MetaModel.getMetadataByQuery.mockResolvedValueOnce(metadata);
				});

				await Groups.addGroups(teamspace, project, container, ticket, groups);

				expect(ScenesModel.getNodesByIds).toHaveBeenCalledTimes(groups.length);
				expect(MetaModel.getMetadataByQuery).toHaveBeenCalledTimes(groups.length);

				const convertedGroups = groups.map((group) => {
					const convertedObjects = group.objects.map((obj) => {
						expect(ScenesModel.getNodesByIds).toHaveBeenCalledWith(teamspace, project,
							/* eslint-disable-next-line no-underscore-dangle */
							obj.container, obj._ids, { _id: 0, shared_id: 1, rev_id: 1 });

						const externalIdKeys = Object.values(idTypesToKeys).flat();
						const query = { rev_id: revision, parents: { $in: sharedIds.map((s) => s.shared_id) }, 'metadata.key': { $in: externalIdKeys } };
						const projection = { metadata: { $elemMatch:
							{ $or: externalIdKeys.map((n) => ({ key: n })) } } };
						expect(MetaModel.getMetadataByQuery).toHaveBeenCalledWith(teamspace, obj.container,
							query, projection);

						return metadata.length
							? { ...obj, _ids: undefined, [externalIdName]: metadata.map((m) => m.metadata[0].value) }
							: obj;
					});
					return { ...group, objects: convertedObjects };
				});

				expect(GroupsModel.addGroups).toHaveBeenCalledTimes(1);
				expect(GroupsModel.addGroups).toHaveBeenCalledWith(teamspace, project, container,
					ticket, convertedGroups);
			});
		});
	});
};

const testUpdateGroup = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const container = generateRandomString();
	const revision = generateRandomString();
	const ticket = generateRandomString();
	const groupId = generateRandomString();
	const author = generateRandomString();

	describe('Update groups', () => {
		test('should update a group', async () => {
			const data = generateRandomObject();
			await Groups.updateTicketGroup(teamspace, project, container, ticket, groupId, data, author);

			expect(GroupsModel.updateGroup).toHaveBeenCalledTimes(1);
			expect(GroupsModel.updateGroup).toHaveBeenCalledWith(teamspace, project, container, ticket, groupId,
				data, author);
		});

		test('should update a group without conversion if it already has external Id', async () => {
			const data = { objects: [{ [idTypes.IFC]: [generateRandomString()], container: generateRandomString() }] };
			await Groups.updateTicketGroup(teamspace, project, container, ticket, groupId, data, author);

			expect(GroupsModel.updateGroup).toHaveBeenCalledTimes(1);
			expect(GroupsModel.updateGroup).toHaveBeenCalledWith(teamspace, project, container, ticket, groupId,
				data, author);
		});

		describe.each([
			['preserve object as it is (no metadata found)', undefined, []],
			[`convert object ids to ${[idTypes.IFC]}`, [idTypes.IFC], times(10, () => ({ metadata: [{ key: idTypesToKeys[idTypes.IFC][0], value: generateRandomString() }] }))],
			[`convert object ids to ${[idTypes.REVIT]}`, [idTypes.REVIT], times(10, () => ({ metadata: [{ key: idTypesToKeys[idTypes.REVIT][0], value: generateRandomString() }] }))],
		])('Convert Ids and update groups', (desc, externalIdName, metadata) => {
			test(`should ${desc} and update groups`, async () => {
				const data = { objects: times(10, () => ({
					_ids: [generateRandomString()], container: generateRandomString() })) };
				const sharedIds = times(10, () => ({ shared_id: generateRandomString(), rev_id: revision }));

				times(data.objects.length, () => {
					ScenesModel.getNodesByIds.mockResolvedValueOnce(sharedIds);
					MetaModel.getMetadataByQuery.mockResolvedValueOnce(metadata);
				});

				await Groups.updateTicketGroup(teamspace, project, container, ticket, groupId, data, author);

				expect(ScenesModel.getNodesByIds).toHaveBeenCalledTimes(data.objects.length);
				expect(MetaModel.getMetadataByQuery).toHaveBeenCalledTimes(data.objects.length);

				data.objects = data.objects.map((obj) => {
					/* eslint-disable-next-line no-underscore-dangle */
					expect(ScenesModel.getNodesByIds).toHaveBeenCalledWith(teamspace, project, obj.container, obj._ids,
						{ _id: 0, shared_id: 1, rev_id: 1 });

					const externalIdKeys = Object.values(idTypesToKeys).flat();
					const query = { rev_id: revision, parents: { $in: sharedIds.map((s) => s.shared_id) }, 'metadata.key': { $in: externalIdKeys } };
					const projection = { metadata: { $elemMatch: { $or: externalIdKeys.map((n) => ({ key: n })) } } };

					expect(MetaModel.getMetadataByQuery).toHaveBeenCalledWith(teamspace, obj.container,
						query, projection);

					return metadata.length
						? { ...obj, _ids: undefined, [externalIdName]: metadata.map((m) => m.metadata[0].value) }
						: obj;
				});

				expect(GroupsModel.updateGroup).toHaveBeenCalledTimes(1);
				expect(GroupsModel.updateGroup).toHaveBeenCalledWith(teamspace, project, container, ticket, groupId,
					data, author);
			});
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetTicketGroupById();
	testAddGroups();
	testUpdateGroup();
});
