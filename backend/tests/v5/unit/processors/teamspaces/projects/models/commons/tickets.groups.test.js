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

const { modelTypes } = require(`${src}/modelSettings.constants`);

const Groups = require(`${src}/processors/teamspaces/projects/models/commons/tickets.groups`);

jest.mock('../../../../../../../../src/v5/models/tickets.groups');
const GroupsModel = require(`${src}/models/tickets.groups`);

jest.mock('../../../../../../../../src/v5/models/revisions');
const RevsModel = require(`${src}/models/revisions`);

jest.mock('../../../../../../../../src/v5/models/metadata');
const MetaModel = require(`${src}/models/metadata`);

jest.mock('../../../../../../../../src/v5/models/scenes');
const ScenesModel = require(`${src}/models/scenes`);

jest.mock('../../../../../../../../src/v5/processors/teamspaces/projects/models/commons/scenes');
const SceneProcessor = require(`${src}/processors/teamspaces/projects/models/commons/scenes`);

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
		['with ifc guids', { ...defaultOptions, convertToMeshIds: false, externalIdName: idTypes.IFC }],
		['with revit ids', { ...defaultOptions, convertToMeshIds: false, externalIdName: idTypes.REVIT, matchedMeta: getMetadata(idTypesToKeys[idTypes.REVIT][0]) }],
		['when returnMeshIds is false but no metadata are found', { ...defaultOptions, convertToMeshIds: false, noMetaFound: true, matchedMeta: [] }],
		['when returnMeshIds is false but no external Id are found', { ...defaultOptions, convertToMeshIds: false, noExternId: true, matchedMeta: [{ parents: times(2, () => generateRandomString()) }] }],
		['with ifc guids (with negative query)', { ...defaultOptions, convertToMeshIds: false, externalIdName: [idTypes.IFC], unwantedMeta: defaultOptions.matchedMeta.slice(0, 5) }],
		['with ifc guids (with negative query) but no unwanted external ID are found', { ...defaultOptions, convertToMeshIds: false, externalIdName: [idTypes.IFC], noUnwantedExternId: true, unwantedMeta: defaultOptions.matchedMeta.slice(0, 5) }],
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
				} else if (revision) {
					RevsModel.getRevisionByIdOrTag.mockResolvedValueOnce({ _id: revision });
				}

				MetaModel.getMetadataByRules.mockResolvedValueOnce({
					matched: options.matchedMeta, unwanted: options.unwantedMeta,
				});

				if (options.convertToMeshIds) {
					if (options.matchedMeta.length) {
						const ids = times(options.matchedMeta.length, generateUUIDString);
						SceneProcessor.getMeshesWithParentIds.mockResolvedValueOnce(ids);
						expectedData = { ...options.group,
							objects: [{ container, _ids: ids.map(stringToUUID) }] };
					} else {
						expectedData = { ...options.group, objects: [] };
					}

					if (options.unwantedMeta.length) {
						const ids = times(options.unwantedMeta.length, generateUUIDString);
						SceneProcessor.getMeshesWithParentIds.mockResolvedValueOnce(ids);
					}
				} else if (options.noMetaFound) {
					expectedData = { ...options.group, objects: [] };
				} else if (options.noExternId) {
					SceneProcessor.getExternalIdsFromMetadata.mockReturnValueOnce(undefined);
					expectedData = { ...options.group, objects: [] };
				} else {
					const expectedValues = options.matchedMeta.map(({ metadata }) => metadata[0].value);
					SceneProcessor.getExternalIdsFromMetadata.mockReturnValueOnce(
						{ key: options.externalIdName, values: expectedValues });

					expectedData = { ...options.group,
						objects: [{ container, [options.externalIdName]: expectedValues }] };
					if (options.unwantedMeta.length) {
						if (options.noUnwantedExternId) {
							SceneProcessor.getExternalIdsFromMetadata.mockReturnValueOnce(undefined);
						} else {
							const unwantedIds = options.unwantedMeta.map(({ metadata }) => metadata[0].value);
							SceneProcessor.getExternalIdsFromMetadata.mockReturnValueOnce(
								{ key: options.externalIdName,
									values: unwantedIds });
							expectedData = { ...options.group,
								objects: [{ container,
									[options.externalIdName]: expectedValues.filter(
										(v) => !unwantedIds.includes(v)) }] };
						}
					}
				}
			}

			await expect(Groups.getTicketGroupById(teamspace, project, container, options.revision, ticket,
				groupId, options.convertToMeshIds, options.containers)).resolves.toEqual(expectedData);

			expect(GroupsModel.getGroupById).toHaveBeenCalledTimes(1);
			expect(GroupsModel.getGroupById).toHaveBeenCalledWith(teamspace, project, container, ticket, groupId);

			if (options.containers) {
				expect(RevsModel.getLatestRevision).toHaveBeenCalledTimes(1);
				expect(RevsModel.getLatestRevision).toHaveBeenCalledWith(teamspace, container, modelTypes.CONTAINER,
					{ _id: 1 });
			}

			if (!options.latestRevisionFail) {
				expect(MetaModel.getMetadataByRules).toHaveBeenCalledTimes(1);
				expect(MetaModel.getMetadataByRules).toHaveBeenCalledWith(teamspace, project, container,
					revision, options.group.rules, {
						parents: 1,
						...(options.convertToMeshIds ? {} : { metadata: { $elemMatch:
							{ $or: Object.values(idTypesToKeys).flat().map((n) => ({ key: n })) } } }),
					});
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
					} else if (revision) {
						RevsModel.getRevisionByIdOrTag.mockResolvedValueOnce({ _id: revision });
					}

					const ids = times(10, generateUUIDString());
					MetaModel.getMetadataWithMatchingData.mockResolvedValueOnce(options.matchedMeta);
					SceneProcessor.getMeshesWithParentIds.mockResolvedValueOnce(ids);
					expectedData.objects = expectedData.objects
						.map(({ container: resContainer }) => ({
							container: resContainer, _ids: ids.map(stringToUUID) }));
				}
			}

			const results = await Groups.getTicketGroupById(teamspace, project, container, revision, ticket,
				groupId, convertToMeshIds, containers);
			expect(results).toEqual(expectedData);

			if (convertToMeshIds && !invalidContainer) {
				if (containers) {
					expect(RevsModel.getLatestRevision).toHaveBeenCalledTimes(1);
					expect(RevsModel.getLatestRevision).toHaveBeenCalledWith(teamspace,
						group.objects[0].container, modelTypes.CONTAINER, { _id: 1 });
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
			desc: `should ${action} a group without conversion if external ids are not found`,
			container,
			group: { objects: [{ _ids: [generateRandomString()], container }] },
			nodes,
		},
		{
			desc: `should ${action} a group and convert group ids to ${[idTypes.IFC]}`,
			container,
			group: { objects: [{ _ids: [generateRandomString()], container }] },
			nodes,
			convertedResults: { key: idTypes.IFC, values: [metadataValue] },
			convertedGroup: { objects: [{ [idTypes.IFC]: [metadataValue], container }] },
		},
		{
			desc: `should ${action} a group and convert group ids to ${[idTypes.REVIT]}`,
			container,
			group: { objects: [{ _ids: [generateRandomString()], container }] },
			nodes,
			convertedResults: { key: idTypes.REVIT, values: [metadataValue] },
			convertedGroup: { objects: [{ [idTypes.REVIT]: [metadataValue], container }] },
		},
	];
};

const testAddGroups = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const ticket = generateRandomString();

	const runTest = ({ desc, container, group, nodes, convertedResults, convertedGroup, containsMeshIds = true }) => {
		test(desc, async () => {
			if (containsMeshIds) {
				ScenesModel.getNodesByIds.mockResolvedValueOnce(nodes);
			}

			if (nodes?.length) {
				SceneProcessor.sharedIdsToExternalIds.mockResolvedValueOnce(convertedResults);
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
				expect(SceneProcessor.sharedIdsToExternalIds).toHaveBeenCalledTimes(1);
				expect(SceneProcessor.sharedIdsToExternalIds).toHaveBeenCalledWith(teamspace, container,
					nodes[0].rev_id, nodes.map(({ shared_id }) => shared_id));
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

	const runTest = ({ desc, container, group, nodes, convertedResults, convertedGroup, containsMeshIds = true }) => {
		test(desc, async () => {
			if (containsMeshIds) {
				ScenesModel.getNodesByIds.mockResolvedValueOnce(nodes);
			}

			if (nodes?.length) {
				SceneProcessor.sharedIdsToExternalIds.mockResolvedValueOnce(convertedResults);
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
				expect(SceneProcessor.sharedIdsToExternalIds).toHaveBeenCalledTimes(1);
				expect(SceneProcessor.sharedIdsToExternalIds).toHaveBeenCalledWith(teamspace, container,
					nodes[0].rev_id, nodes.map(({ shared_id }) => shared_id));
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
