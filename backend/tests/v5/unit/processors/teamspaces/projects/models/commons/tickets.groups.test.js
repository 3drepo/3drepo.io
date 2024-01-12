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

const getMetadata = (externalIdName) => times(10, () => ({ parents: times(2, () => generateRandomString()),
	metadata: [{ key: externalIdName, value: generateRandomString() }] }));

const getSmartTicketGroupById = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const container = generateRandomString();
	const ticket = generateRandomString();
	const groupId = generateRandomString();
	const smartGroup = { rules: [generateRandomObject()] };

	const defaultOptions = {
		group: smartGroup,
		matchedMeta: getMetadata(idTypesToKeys[idTypes.IFC][0]),
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
		['with revit ids', { ...defaultOptions, convertToMeshIds: false, externalIdName: [idTypes.REVIT], matchedMeta: getMetadata(idTypesToKeys[idTypes.REVIT][0]) }],
		['when returnMeshIds is true but no metadata are found', { ...defaultOptions, convertToMeshIds: false, noMetaFound: true, matchedMeta: [{ parents: times(2, () => generateRandomString()) }] }],
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
						objects: options.noMetaFound ? [] : [{ container,
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
};

const getNormalTicketGroupById = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const container = generateRandomString();
	const ticket = generateRandomString();
	const groupId = generateRandomString();
	const normalGroup = { objects: [{ _ids: [times(10, () => generateRandomString())], container }] };
	const ifcGuidGroup = { objects: [{ [idTypes.IFC]: [times(10, () => generateRandomString())], container }] };
	const revitIdGroup = { objects: [{ [idTypes.REVIT]: [times(10, () => generateRandomString())], container }] };

	const defaultOptions = {
		group: ifcGuidGroup,
		matchedMeta: getMetadata(idTypesToKeys[idTypes.IFC][0]),
		unwantedMeta: [],
		revision: generateRandomString(),
		convertToMeshIds: true,
		latestRevisionFail: false,
	};

	describe.each([
		['when it is a federation group', { ...defaultOptions, containers: [container], externalIdName: [idTypes.IFC] }],
		['when it is a federation  but the container of the group object is not part of the federation', { ...defaultOptions, externalIdName: [idTypes.IFC], invalidContainer: true, containers: [container], group: { ...ifcGuidGroup, objects: [{ container: generateRandomString() }] } }],
		['when convertToMeshIds set to false', { ...defaultOptions, convertToMeshIds: false }],
		['when group already stores 3d repo Ids', { ...defaultOptions, group: normalGroup }],
		['when getLatestRevision fails', { ...defaultOptions, externalIdName: [idTypes.IFC], containers: [container], latestRevisionFail: true }],
		['when converting from ifc guids', { ...defaultOptions, externalIdName: [idTypes.IFC] }],
		['when converting from revit Ids', { ...defaultOptions, group: revitIdGroup, externalIdName: [idTypes.REVIT] }],
	])('Get ticket group by Id (normal group)', (desc, options) => {
		test(`should return the group found ${desc}`, async () => {
			const expectedData = cloneDeep(options.group);
			let { revision } = options;
			const { externalIdName, convertToMeshIds, latestRevisionFail, containers,
				invalidContainer, group } = options;

			GroupsModel.getGroupById.mockResolvedValueOnce(cloneDeep(group));

			if (convertToMeshIds && externalIdName) {
				if (invalidContainer) {
					expectedData.objects = [];
				} else if (latestRevisionFail) {
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

			if (convertToMeshIds && !invalidContainer) {
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

const getCommonTestCases = (isUpdate) => {
	const nodes = times(10, () => ({ rev_id: generateRandomString(), shared_id: generateRandomString() }));
	const action = isUpdate ? 'update' : 'add';
	const metadataValue = generateRandomString();
	const container = generateRandomString();

	return [
		{
			desc: `should ${action} a smart group`,
			container,
			group: { rules: generateRandomString() },
			containsMeshIds: false,
		},
		{
			desc: `should ${action} a group without conversion if it already has external Id`,
			container,
			group: { objects: [{ [idTypes.IFC]: [generateRandomString()], container }] },
			containsMeshIds: false,
		},
		{
			desc: `should ${action} a group without conversion if nodes are not found`,
			container,
			group: { objects: [{ _ids: [generateRandomString()], container }] },
			nodes: [],
		},
		{
			desc: `should ${action} a group without conversion if metadata are not found`,
			container,
			group: { objects: [{ _ids: [generateRandomString()], container }] },
			nodes,
		},
		{
			desc: `should ${action} a group and convert group ids to ${[idTypes.IFC]}`,
			container,
			group: { objects: [{ _ids: [generateRandomString()], container }] },
			nodes,
			metadata: times(10,
				() => ({ metadata: [{ key: idTypesToKeys[idTypes.IFC][0], value: metadataValue }] })),
			convertedGroup: { objects: [{ [idTypes.IFC]: [metadataValue], container }] },
		},
		{
			desc: `should ${action} a group and convert group ids to ${[idTypes.REVIT]}`,
			container,
			group: { objects: [{ _ids: [generateRandomString()], container }] },
			nodes,
			metadata: times(10,
				() => ({ metadata: [{ key: idTypesToKeys[idTypes.REVIT][0], value: metadataValue }] })),
			convertedGroup: { objects: [{ [idTypes.REVIT]: [metadataValue], container }] },
		},
	];
};

const testAddGroups = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const ticket = generateRandomString();
	const externalIdKeys = Object.values(idTypesToKeys).flat();

	const runTest = ({ desc, container, group, nodes, metadata, convertedGroup, containsMeshIds = true }) => {
		test(desc, async () => {
			if (containsMeshIds) {
				ScenesModel.getNodesByIds.mockResolvedValueOnce(nodes);
			}

			if (nodes?.length) {
				MetaModel.getMetadataByQuery.mockResolvedValueOnce(metadata);
			}

			await Groups.addGroups(teamspace, project, container, ticket, [group]);

			expect(GroupsModel.addGroups).toHaveBeenCalledTimes(1);
			expect(GroupsModel.addGroups).toHaveBeenCalledWith(teamspace, project, container,
				ticket, [convertedGroup ?? group]);

			if (containsMeshIds) {
				expect(ScenesModel.getNodesByIds).toHaveBeenCalledTimes(1);
				expect(ScenesModel.getNodesByIds).toHaveBeenCalledWith(teamspace, project, container,
					// eslint-disable-next-line no-underscore-dangle
					group.objects[0]._ids, { _id: 0, shared_id: 1, rev_id: 1 });
			}

			if (nodes?.length) {
				expect(MetaModel.getMetadataByQuery).toHaveBeenCalledTimes(1);
				expect(MetaModel.getMetadataByQuery).toHaveBeenCalledWith(teamspace, container,
					{ rev_id: nodes[0].rev_id, parents: { $in: nodes.map((s) => s.shared_id) }, 'metadata.key': { $in: externalIdKeys } },
					{ metadata: { $elemMatch: { $or: externalIdKeys.map((n) => ({ key: n })) } } });
			}
		});
	};

	describe.each(getCommonTestCases())('Add groups', runTest);
};

const testUpdateGroup = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const ticket = generateRandomString();
	const groupId = generateRandomString();
	const author = generateRandomString();
	const externalIdKeys = Object.values(idTypesToKeys).flat();

	const runTest = ({ desc, container, group, nodes, metadata, convertedGroup, containsMeshIds = true }) => {
		test(desc, async () => {
			if (containsMeshIds) {
				ScenesModel.getNodesByIds.mockResolvedValueOnce(nodes);
			}

			if (nodes?.length) {
				MetaModel.getMetadataByQuery.mockResolvedValueOnce(metadata);
			}

			await Groups.updateTicketGroup(teamspace, project, container, ticket, groupId, group, author);

			expect(GroupsModel.updateGroup).toHaveBeenCalledTimes(1);
			expect(GroupsModel.updateGroup).toHaveBeenCalledWith(teamspace, project, container,
				ticket, groupId, convertedGroup ?? group, author);

			if (containsMeshIds) {
				expect(ScenesModel.getNodesByIds).toHaveBeenCalledTimes(1);
				expect(ScenesModel.getNodesByIds).toHaveBeenCalledWith(teamspace, project, container,
					// eslint-disable-next-line no-underscore-dangle
					group.objects[0]._ids, { _id: 0, shared_id: 1, rev_id: 1 });
			}

			if (nodes?.length) {
				expect(MetaModel.getMetadataByQuery).toHaveBeenCalledTimes(1);
				expect(MetaModel.getMetadataByQuery).toHaveBeenCalledWith(teamspace, container,
					{ rev_id: nodes[0].rev_id, parents: { $in: nodes.map((s) => s.shared_id) }, 'metadata.key': { $in: externalIdKeys } },
					{ metadata: { $elemMatch: { $or: externalIdKeys.map((n) => ({ key: n })) } } });
			}
		});
	};

	describe.each(getCommonTestCases(true))('Update group', runTest);
};

describe(determineTestGroup(__filename), () => {
	getNormalTicketGroupById();
	getSmartTicketGroupById();
	testAddGroups();
	testUpdateGroup();
});
