/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const SuperTest = require('supertest');
const ServiceHelper = require('../../../../../../helper/services');
const { src } = require('../../../../../../helper/path');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { templates } = require(`${src}/utils/responseCodes`);
const uuidHelper = require(`${src}/utils/helper/uuids`);

let server;
let agent;

const getRandomDatesDesc = (numberOfDates) => {
	const dates = [];
	for (let i = 0; i < numberOfDates; i++) {
		dates.push(ServiceHelper.generateRandomDate());
	}

	dates.sort((a, b) => b - a);

	return dates;
};

const createContainerObject = (teamspace, permissions, revisions) => {
	const _id = ServiceHelper.generateUUIDString();

	// Create stash entries for the revisions
	const stashEntries = [];
	for (let i = 0; i < revisions.length; i++) {
		const rev = revisions[i];

		// Generate stash entry only if not void and has file
		if (!rev.void && rev.rFile) {
			const stashEntry = ServiceHelper.generateStashEntry(
				rev._id,
				_id,
				teamspace,
				true,
			);
			stashEntries.push(stashEntry);
		}
	}

	return {
		_id,
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(modelTypes.CONTAINER),
			permissions,
		},
		revisions,
		stashEntries,
	};
};

const createFederationObject = (teamspace, containers, permissions) => {
	const subModels = [];
	for (let i = 0; i < containers.length; i++) {
		subModels.push({ _id: containers[i]._id });
	}

	const fedObj = {
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(modelTypes.FEDERATION),
			permissions,
			subModels,
		},
	};

	// Create federation revision
	const fedRevision = ServiceHelper.generateRevisionEntry(false, false);
	const revId = fedRevision._id;

	// Create federation stash entry
	const fedStashEntry = ServiceHelper.generateStashEntry(revId,
		fedObj._id, teamspace, true);

	// Generate nodes for scene mock
	const rootNode = ServiceHelper.generateBasicNode('transformation', revId);
	const meshNode = ServiceHelper.generateBasicNode('mesh', revId, [rootNode.shared_id]);
	const refNodes = [];
	for (let i = 0; i < containers.length; i++) {
		const refNode = ServiceHelper.generateBasicNode('ref', revId,
			[rootNode.shared_id], { owner: teamspace, project: containers[i]._id });
		refNodes.push(refNode);
	}

	const nodes = [
		rootNode,
		...refNodes,
		meshNode];

	// Create Mesh Map for scene mock
	const meshIdStr = uuidHelper.UUIDToString(meshNode._id);
	const meshMap = {
		[`${uuidHelper.UUIDToString(rootNode._id)}`]: [meshIdStr],
		[meshIdStr]: meshIdStr,
	};

	return {
		fedObj,
		fedRevision,
		fedStashEntry,
		nodes,
		meshMap,
		containers,
	};
};

const generateTestEnvData = () => {
// - Container C1:
	// - Valid revision R1
	// - Valid revision R2
// - Container C2:
	// - Valid Revision R3
// - Container C3:
	// - Void revision R4
	// - Valid Revision R5
// - Container C4:
	// - NoFile revision R6
	// - Valid Revision R7
// - Container C5:
	// - Void Revision R8
// - Container C6:
	// - Void Revision R9
// - Federation F1:
	// - C1
	// - C2
// - Federation F2:
	// - C3
	// - C4
// - Federation F3:
	// - C5
	// - C6

	// Create users
	const users = {
		tsAdmin: ServiceHelper.generateUserCredentials(),
		noProjectAccess: ServiceHelper.generateUserCredentials(),
		viewer: ServiceHelper.generateUserCredentials(),
		commenter: ServiceHelper.generateUserCredentials(),
		nobody: ServiceHelper.generateUserCredentials(),
	};

	// Create permissions
	const permissions = [
		{ user: users.viewer.user, permission: 'viewer' },
		{ user: users.commenter.user, permission: 'commenter' },
	];

	// Create teamspace and projects
	const teamspace = ServiceHelper.generateRandomString();
	const project = ServiceHelper.generateRandomProject();

	// Create Revisions for C1
	const dates = getRandomDatesDesc(9);
	const R1 = ServiceHelper.generateRevisionEntry(false, true, modelTypes.CONTAINER, dates[0]);
	const R2 = ServiceHelper.generateRevisionEntry(false, true, modelTypes.CONTAINER, dates[1]);

	// Create Revisions for C2
	const R3 = ServiceHelper.generateRevisionEntry(false, true, modelTypes.CONTAINER, dates[2]);

	// Create Revisions for C3
	const R4 = ServiceHelper.generateRevisionEntry(true, true, modelTypes.CONTAINER, dates[3]);
	const R5 = ServiceHelper.generateRevisionEntry(false, true, modelTypes.CONTAINER, dates[4]);

	// Create Revisions for C4
	const R6 = ServiceHelper.generateRevisionEntry(false, false, modelTypes.CONTAINER, dates[5]);
	const R7 = ServiceHelper.generateRevisionEntry(false, true, modelTypes.CONTAINER, dates[6]);

	// Create Revisions for C5
	const R8 = ServiceHelper.generateRevisionEntry(true, true, modelTypes.CONTAINER, dates[7]);

	// Create Revisions for C6
	const R9 = ServiceHelper.generateRevisionEntry(true, true, modelTypes.CONTAINER, dates[8]);

	// Create Container objects
	const C1 = createContainerObject(
		teamspace,
		permissions,
		[R1, R2],
	);

	const C2 = createContainerObject(
		teamspace,
		permissions,
		[R3],
	);

	const C3 = createContainerObject(
		teamspace,
		permissions,
		[R4, R5],
	);

	const C4 = createContainerObject(
		teamspace,
		permissions,
		[R6, R7],
	);

	const C5 = createContainerObject(
		teamspace,
		permissions,
		[R8],
	);

	const C6 = createContainerObject(
		teamspace,
		permissions,
		[R9],
	);

	const containers = {
		C1,
		C2,
		C3,
		C4,
		C5,
		C6,
	};

	// Create Federation objects
	const F1 = createFederationObject(
		teamspace,
		[C1, C2],
		permissions,
	);

	const F2 = createFederationObject(
		teamspace,
		[C3, C4],
		permissions,
	);

	const F3 = createFederationObject(
		teamspace,
		[C5, C6],
		permissions,
	);

	const federations = {
		F1,
		F2,
		F3,
	};

	return {
		users,
		teamspace,
		project,
		containers,
		federations,
	};
};

const setupTestData = async ({ users, teamspace, project, containers, federations }) => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], key !== 'nobody' ? [teamspace] : []));

	const contProms = Object.keys(containers).map((key) => {
		const proms = [];
		proms.push(ServiceHelper.db.createModel(
			teamspace,
			containers[key]._id,
			containers[key].name,
			containers[key].properties,
		));

		const { revisions } = containers[key];
		for (let i = 0; i < revisions.length; i++) {
			const rev = revisions[i];
			proms.push(ServiceHelper.db.createRevision(
				teamspace,
				project.id,
				containers[key]._id,
				rev,
				modelTypes.CONTAINER,
			));
		}
		const { stashEntries } = containers[key];
		for (let i = 0; i < stashEntries.length; i++) {
			const stashEntry = stashEntries[i];
			proms.push(ServiceHelper.db.createStash(
				teamspace,
				stashEntry,
			));
		}

		return proms;
	});

	const fedProms = Object.keys(federations).map((key) => {
		const proms = [];
		proms.push(ServiceHelper.db.createModel(
			teamspace,
			federations[key].fedObj._id,
			federations[key].fedObj.name,
			federations[key].fedObj.properties,
		));
		proms.push(ServiceHelper.db.createStash(
			teamspace,
			federations[key].fedStashEntry,
		));
		proms.push(ServiceHelper.db.createScene(
			teamspace,
			project,
			federations[key].fedObj._id,
			federations[key].fedRevision,
			federations[key].nodes,
			federations[key].meshMap,
		));
		return proms;
	});

	const contIds = Object.keys(containers).map((key) => containers[key]._id);
	const fedIds = Object.keys(federations).map((key) => federations[key].fedObj._id);
	const modelIds = [...contIds, ...fedIds];
	const projPromise = ServiceHelper.db.createProject(teamspace, project.id, project.name, modelIds);

	return Promise.all([
		...userProms,
		...contProms,
		...fedProms,
		projPromise,
	]);
};

const testGetAssetMaps = () => {
	describe('Get asset maps', () => {
		const testEnvData = generateTestEnvData();
		const { users, teamspace, project, containers, federations } = testEnvData;

		beforeAll(async () => {
			await setupTestData(testEnvData);
		});

		const generateTestData = () => {
			const getContRoute = ({
				ts = teamspace,
				projectId = project.id,
				modelType = modelTypes.CONTAINER,
				modelId = containers.C1._id,
				revisionId = containers.C1.revisions[0]._id,
				key = users.tsAdmin.apiKey,
			} = {}) => `/v5/teamspaces/${ts}/projects/${projectId}/${modelType}s/${modelId}/assetMaps/revision/${revisionId}?key=${key}`;

			const getFedRoute = ({
				ts = teamspace,
				projectId = project.id,
				modelType = modelTypes.FEDERATION,
				modelId = federations.F1.fedObj._id,
				key = users.tsAdmin.apiKey,
			} = {}) => `/v5/teamspaces/${ts}/projects/${projectId}/${modelType}s/${modelId}/assetMaps/revision/master/head?key=${key}`;

			const getContResult = (cont, revId) => {
				const modelId = cont._id;

				const { stashEntries } = cont;

				let result = '';

				const findFirstValidRev = () => {
					for (let i = 0; i < cont.revisions.length; i++) {
						const rev = cont.revisions[i];
						if (!rev.void) {
							return rev._id;
						}
					}
					return undefined;
				};

				const revisionId = revId || findFirstValidRev();

				if (revisionId) {
					const stashEntry = stashEntries.find((entry) => entry._id === revisionId);

					if (stashEntry) {
						result += `{"model":"${modelId}","supermeshes":[`;
						const assetIds = stashEntry.assets;
						const assetData = stashEntry.jsonData;

						let assetString = '';
						for (let i = 0; i < assetIds.length; i++) {
							const id = assetIds[i];
							const data = assetData[i];
							assetString += `{"id":"${id}","data":${data}}`;

							if (i !== (assetIds.length - 1)) {
								assetString += ',';
							}
						}
						result += `${assetString}]}`;
					}
				}

				return result;
			};

			const getFedResult = (fed) => {
				let result = '';

				result += '{"submodels":[';

				const conts = fed.containers;
				for (let i = 0; i < conts.length; i++) {
					const cont = conts[i];
					const contResult = getContResult(cont);

					if (i !== 0 && contResult !== '') {
						result += ',';
					}

					result += contResult;
				}

				result += ']}';

				return result;
			};

			// Basic tests
			const randomString = ServiceHelper.generateRandomString();
			const nobodyKey = users.nobody.apiKey;
			const noProjAccKey = users.noProjectAccess.apiKey;
			const viewerKey = users.viewer.apiKey;
			const commenterKey = users.commenter.apiKey;
			const fedId = federations.F1.fedObj._id;
			const detachedRev = ServiceHelper.generateRevisionEntry()._id;
			const { containerNotFound, federationNotFound } = templates;
			const contId = containers.C1._id;
			const masterRevId = 'master/head';

			const basicFailCasesCont = [
				['the user does not have a valid session', getContRoute({ key: null }), false, templates.notLoggedIn],
				['the teamspace does not exist', getContRoute({ ts: randomString }), false, templates.teamspaceNotFound],
				['the project does not exist', getContRoute({ projectId: randomString }), false, templates.projectNotFound],
				['the Container does not exist', getContRoute({ modelId: randomString }), false, containerNotFound],
				['the revision does not exist', getContRoute({ revisionId: detachedRev }), false, templates.revisionNotFound],
				['the user is not a member of the teamspace', getContRoute({ key: nobodyKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the model', getContRoute({ key: noProjAccKey }), false, templates.notAuthorized],
				['the model is of wrong type', getContRoute({ modelId: fedId }), false, containerNotFound],
			];

			const basicFailCasesFed = [
				['the user does not have a valid session', getFedRoute({ key: null }), false, templates.notLoggedIn],
				['the teamspace does not exist', getFedRoute({ ts: randomString }), false, templates.teamspaceNotFound],
				['the project does not exist', getFedRoute({ projectId: randomString }), false, templates.projectNotFound],
				['the Federation does not exist', getFedRoute({ modelId: randomString }), false, federationNotFound],
				['the user is not a member of the teamspace', getFedRoute({ key: nobodyKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the model', getFedRoute({ key: noProjAccKey }), false, templates.notAuthorized],
				['the model is of wrong type', getFedRoute({ modelId: contId }), false, federationNotFound],
			];

			// Valid Container Tests
			const { C1 } = containers;
			const { C3 } = containers;
			const { C4 } = containers;

			const C3Id = C3._id;
			const C4Id = C4._id;

			const R1Id = C1.revisions[0]._id;
			const R2Id = C1.revisions[1]._id;
			const R4Id = C3.revisions[0]._id;
			const R5Id = C3.revisions[1]._id;
			const R6Id = C4.revisions[0]._id;

			const curRevResult = getContResult(C1, R1Id);
			const prevRevResult = getContResult(C1, R2Id);
			const contValidRevs = [
				['trying to access current rev via rev ID', getContRoute(), true, curRevResult],
				['trying to access current via master/head', getContRoute({ revisionId: masterRevId }), true, curRevResult],
				['trying to access previous via rev ID', getContRoute({ revisionId: R2Id }), true, prevRevResult],
				['trying to access current with viewer via rev ID', getContRoute({ key: viewerKey }), true, curRevResult],
				['trying to access current with commenter via rev ID', getContRoute({ key: commenterKey }), true, curRevResult],
				['trying to access current with viewer via master/head', getContRoute({ revisionId: masterRevId, key: viewerKey }), true, curRevResult],
				['trying to access current with commenter via master/head', getContRoute({ revisionId: masterRevId, key: commenterKey }), true, curRevResult],
			];

			// Void Container Tests
			const voidRevResult = getContResult(C3, R4Id);
			const validRevResultC3 = getContResult(C3, R5Id);
			const contVoidRevs = [
				['trying to access void revision via rev ID (admin)', getContRoute({ modelId: C3Id, revisionId: R4Id }), true, voidRevResult],
				['trying to access void revision via rev ID (viewer)', getContRoute({ modelId: C3Id, revisionId: R4Id, key: viewerKey }), true, voidRevResult],
				['trying to access void revision via rev ID (commenter)', getContRoute({ modelId: C3Id, revisionId: R4Id, key: commenterKey }), true, voidRevResult],
				['getting latest form container with newer void revision via master/head (admin)', getContRoute({ modelId: C3Id, revisionId: masterRevId }), true, validRevResultC3],
				['getting latest form container with newer void revision via master/head (viewer)', getContRoute({ modelId: C3Id, revisionId: masterRevId, key: viewerKey }), true, validRevResultC3],
				['getting latest form container with newer void revision via master/head (commenter)', getContRoute({ modelId: C3Id, revisionId: masterRevId, key: commenterKey }), true, validRevResultC3],
			];

			// NoFile Container Tests
			const noFileRevResult = getContResult(C4, R6Id);
			const contNoFileRevisions = [
				['trying to access noFile revision via rev ID (admin)', getContRoute({ modelId: C4Id, revisionId: R6Id }), true, noFileRevResult],
				['trying to access noFile revision via rev ID (viewer)', getContRoute({ modelId: C4Id, revisionId: R6Id, key: viewerKey }), true, noFileRevResult],
				['trying to access noFile revision via rev ID (commenter)', getContRoute({ modelId: C4Id, revisionId: R6Id, key: commenterKey }), true, noFileRevResult],
				['trying to access noFile revision via master/head (admin)', getContRoute({ modelId: C4Id, revisionId: masterRevId }), true, noFileRevResult],
				['trying to access noFile revision via master/head (viewer)', getContRoute({ modelId: C4Id, revisionId: masterRevId, key: viewerKey }), true, noFileRevResult],
				['trying to access noFile revision via master/head (commenter)', getContRoute({ modelId: C4Id, revisionId: masterRevId, key: commenterKey }), true, noFileRevResult],
			];

			// Federation tests
			const F2Id = federations.F2.fedObj._id;
			const F3Id = federations.F3.fedObj._id;

			const fed1Results = getFedResult(federations.F1);
			const fed2Results = getFedResult(federations.F2);
			const fed3Results = getFedResult(federations.F3);
			const fedRevCombCases = [
				['trying to access fed with two containers with valid revisions (admin)', getFedRoute(), true, fed1Results],
				['trying to access fed with two containers with valid revisions (viewer)', getFedRoute({ key: viewerKey }), true, fed1Results],
				['trying to access fed with two containers with valid revisions (commenter)', getFedRoute({ key: commenterKey }), true, fed1Results],
				['trying to access fed with two containers with one void and one noFile as head (admin)', getFedRoute({ modelId: F2Id }), true, fed2Results],
				['trying to access fed with two containers with one void and one noFile as head (viewer)', getFedRoute({ modelId: F2Id, key: viewerKey }), true, fed2Results],
				['trying to access fed with two containers with one void and one noFile as head (commenter)', getFedRoute({ modelId: F2Id, key: commenterKey }), true, fed2Results],
				['trying to access fed with two containers with both only void revisions (admin)', getFedRoute({ modelId: F3Id }), true, fed3Results],
				['trying to access fed with two containers with both only void revisions (admin)', getFedRoute({ modelId: F3Id, key: viewerKey }), true, fed3Results],
				['trying to access fed with two containers with both only void revisions (admin)', getFedRoute({ modelId: F3Id, key: commenterKey }), true, fed3Results],
			];

			return [
				...basicFailCasesCont,
				...basicFailCasesFed,
				...contValidRevs,
				...contVoidRevs,
				...contNoFileRevisions,
				...fedRevCombCases,
			];
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;

				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(res.text).toEqual(expectedOutput);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};
		describe.each(generateTestData())('Get asset maps', runTest);
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});

	afterAll(() => ServiceHelper.closeApp(server));

	testGetAssetMaps();
});