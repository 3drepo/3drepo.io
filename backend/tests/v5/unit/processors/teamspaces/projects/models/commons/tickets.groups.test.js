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

const externalIdNamesToKeys = {
	ifc_guids: ['IFC GUID', 'Ifc::IfcGUID', 'Element::IfcGUID'],
	revit_ids: ['Element ID', 'Element ID::Value'],
};

const testGetTicketGroupById = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const container = generateRandomString();
	const ticket = generateRandomString();
	const groupId = generateRandomString();
	const smartGroup = { rules: [generateRandomObject()] };
	const normalGroup = { objects: [{ _ids: [times(10, () => generateRandomString())],
		container: generateRandomString() }] };
	const ifcGuidGroup = { objects: [{ ifc_guids: [times(10, () => generateRandomString())],
		container: generateRandomString() }] };
	const revitIdGroup = { objects: [{ revit_ids: [times(10, () => generateRandomString())],
		container: generateRandomString() }] };

	const getMeta = (externalIdName) => times(10, () => ({ parents: times(2, () => generateRandomString()),
		metadata: [{ key: externalIdName, value: generateRandomString() }] }));

	const defaultOptions = {
		group: smartGroup,
		matchedMeta: getMeta('IFC GUID'),
		unwantedMeta: [],
		revision: generateRandomString(),
		convertTo3dRepoIds: true,
		latestRevisionFail: false,
	};

	describe.each([
		['when its a container group', defaultOptions],
		['when its a federation group', { ...defaultOptions, containers: [container] }],
		['when getLatestRevision fails', { ...defaultOptions, containers: [container], latestRevisionFail: true }],
		['when there is a negative query', { ...defaultOptions, unwantedMeta: defaultOptions.matchedMeta.slice(5) }],
		['when there are no matches', { ...defaultOptions, matchedMeta: [] }],
		['with ifc guids', { ...defaultOptions, convertTo3dRepoIds: false, externalIdName: 'ifc_guids' }],
		['with revit ids', { ...defaultOptions, convertTo3dRepoIds: false, externalIdName: 'revit_ids', matchedMeta: getMeta('Element ID') }],
		['with ifc guids (with negative query)', { ...defaultOptions, convertTo3dRepoIds: false, externalIdName: 'ifc_guids', unwantedMeta: defaultOptions.matchedMeta.slice(0, 5) }],
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

				if (options.convertTo3dRepoIds) {
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
				groupId, options.containers, options.convertTo3dRepoIds)).resolves.toEqual(expectedData);

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
						...(options.convertTo3dRepoIds ? {} : { metadata: { $elemMatch:
							{ $or: Object.values(externalIdNamesToKeys).flat().map((n) => ({ key: n })) } } }),
					});

				if (options.matchedMeta.length && options.convertTo3dRepoIds) {
					expect(ScenesModel.getNodesBySharedIds).toHaveBeenCalledWith(teamspace, project, container,
						revision, options.matchedMeta.flatMap(({ parents }) => parents), { _id: 1 });
				}

				if (options.unwantedMeta.length && options.convertTo3dRepoIds) {
					expect(ScenesModel.getNodesBySharedIds).toHaveBeenCalledWith(teamspace, project, container,
						revision, options.unwantedMeta.flatMap(({ parents }) => parents), { _id: 1 });
				}
			}
		});
	});

	describe.each([
		['when its a federation group', { ...defaultOptions, containers: [container], group: ifcGuidGroup, externalIdName: 'ifc_guids' }],
		['when convertTo3dRepoIds set to false', { ...defaultOptions, group: ifcGuidGroup, convertTo3dRepoIds: false }],
		['when group already stores 3d repo Ids', { ...defaultOptions, group: normalGroup }],
		['when getLatestRevision fails', { ...defaultOptions, group: ifcGuidGroup, externalIdName: 'ifc_guids', containers: [container], latestRevisionFail: true }],
		['when converting from ifc guids', { ...defaultOptions, group: ifcGuidGroup, externalIdName: 'ifc_guids' }],
		['when converting from revit Ids', { ...defaultOptions, group: revitIdGroup, externalIdName: 'revit_ids' }],
	])('Get ticket group by Id (normal group)', (desc, options) => {
		test(`should return the group found ${desc}`, async () => {
			const expectedData = cloneDeep(options.group);
			let { revision } = options;

			GroupsModel.getGroupById.mockResolvedValueOnce(cloneDeep(options.group));

			if (options.convertTo3dRepoIds && options.externalIdName) {
				if (options.latestRevisionFail) {
					RevsModel.getLatestRevision.mockRejectedValueOnce(generateRandomString());
					expectedData.objects = [];
				} else {
					if (options.containers) {
						revision = generateRandomString();
						RevsModel.getLatestRevision.mockResolvedValueOnce({ _id: revision });
					}

					const nodeRes = times(10, () => ({ _id: generateUUIDString() }));
					MetaModel.getMetadataByQuery.mockResolvedValueOnce(options.matchedMeta);
					ScenesModel.getNodesBySharedIds.mockResolvedValueOnce(nodeRes);

					const idMapMock = { };
					nodeRes.slice(1).forEach(({ _id }) => { idMapMock[_id] = [_id]; });
					FilesManager.getFile.mockResolvedValueOnce(JSON.stringify(idMapMock));

					const ids = nodeRes.slice(1).map(({ _id }) => stringToUUID(_id));
					expectedData.objects = expectedData.objects
						.map((o) => ({ ...o, [options.externalIdName]: undefined, _ids: ids }));
				}
			}

			await expect(Groups.getTicketGroupById(teamspace, project, container, revision, ticket,
				groupId, options.containers, options.convertTo3dRepoIds)).resolves.toEqual(expectedData);

			if (options.convertTo3dRepoIds) {
				if (options.containers) {
					expect(RevsModel.getLatestRevision).toHaveBeenCalledTimes(1);
					expect(RevsModel.getLatestRevision).toHaveBeenCalledWith(teamspace,
						options.group.objects[0].container, { _id: 1 });
				}

				if (!options.latestRevisionFail && options.group !== normalGroup) {
					const query = {
						rev_id: revision,
						metadata: { $elemMatch: { key: { $in: externalIdNamesToKeys[options.externalIdName] },
							value: { $in: options.group.objects.map((o) => o[options.externalIdName]).flat() } } },
					};
					expect(MetaModel.getMetadataByQuery).toHaveBeenCalledTimes(1);
					expect(MetaModel.getMetadataByQuery).toHaveBeenCalledWith(teamspace,
						options.group.objects[0].container, query, { parents: 1 });
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
				objects: [{ ifc_guids: [generateRandomString()], container: generateRandomString() }],
			}));
			await Groups.addGroups(teamspace, project, container, ticket, groups);

			expect(GroupsModel.addGroups).toHaveBeenCalledTimes(1);
			expect(GroupsModel.addGroups).toHaveBeenCalledWith(teamspace, project, container, ticket, groups);
		});

		describe.each([
			['preserve oject as it is (no metadata found)', undefined, []],
			['convert object ids to ifc_guids', 'ifc_guids', times(10, () => ({ metadata: [{ key: 'IFC GUID', value: generateRandomString() }] }))],
			['convert object ids to revit_ids', 'revit_ids', times(10, () => ({ metadata: [{ key: 'Element ID', value: generateRandomString() }] }))],
		])('Convert Ids and add groups', (desc, externalIdName, metadata) => {
			test(`should ${desc} and add groups`, async () => {
				const groups = times(10, () => ({
					objects: [{ _ids: [generateRandomString()], container: generateRandomString() }],
				}));
				const sharedIds = times(10, () => ({ shared_id: generateRandomString() }));

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
							obj.container, obj._ids, { _id: 0, shared_id: 1 });

						const externalIdKeys = Object.values(externalIdNamesToKeys).flat().map((n) => ({ key: n }));
						const query = { parents: { $in: sharedIds.map((s) => s.shared_id) }, 'metadata.key': { $in: externalIdKeys } };
						const projection = { metadata: { $elemMatch: { $or: externalIdKeys } } };

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
			const data = { objects: [{ ifc_guids: [generateRandomString()], container: generateRandomString() }] };
			await Groups.updateTicketGroup(teamspace, project, container, ticket, groupId, data, author);

			expect(GroupsModel.updateGroup).toHaveBeenCalledTimes(1);
			expect(GroupsModel.updateGroup).toHaveBeenCalledWith(teamspace, project, container, ticket, groupId,
				data, author);
		});

		describe.each([
			['preserve oject as it is (no metadata found)', undefined, []],
			['convert object ids to ifc_guids', 'ifc_guids', times(10, () => ({ metadata: [{ key: 'IFC GUID', value: generateRandomString() }] }))],
			['convert object ids to revit_ids', 'revit_ids', times(10, () => ({ metadata: [{ key: 'Element ID', value: generateRandomString() }] }))],
		])('Convert Ids and update groups', (desc, externalIdName, metadata) => {
			test(`should ${desc} and update groups`, async () => {
				const data = { objects: times(10, () => ({
					_ids: [generateRandomString()], container: generateRandomString() })) };
				const sharedIds = times(10, () => ({ shared_id: generateRandomString() }));

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
						{ _id: 0, shared_id: 1 });

					const externalIdKeys = Object.values(externalIdNamesToKeys).flat().map((n) => ({ key: n }));
					const query = { parents: { $in: sharedIds.map((s) => s.shared_id) }, 'metadata.key': { $in: externalIdKeys } };
					const projection = { metadata: { $elemMatch: { $or: externalIdKeys } } };

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
