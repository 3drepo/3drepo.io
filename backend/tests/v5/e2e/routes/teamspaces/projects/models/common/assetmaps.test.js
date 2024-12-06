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
const { sort } = require('../../../../../../../../src/v4/models/addressMeta');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { templates } = require(`${src}/utils/responseCodes`);
const uuidHelper = require(`${src}/utils/helper/uuids`);

let server;
let agent;

const generateBasicData = () => {
	const users = {
		tsAdmin: ServiceHelper.generateUserCredentials(),
		noProjectAccess: ServiceHelper.generateUserCredentials(),
		viewer: ServiceHelper.generateUserCredentials(),
		commenter: ServiceHelper.generateUserCredentials(),
		nobody: ServiceHelper.generateUserCredentials(),
	};

	const teamspace = ServiceHelper.generateRandomString();
	const project = ServiceHelper.generateRandomProject();

	const models = {
		conWithRev: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: {
				...ServiceHelper.generateRandomModelProperties(modelTypes.CONTAINER),
				permissions: [{ user: users.viewer.user, permission: 'viewer' }, { user: users.commenter.user, permission: 'commenter' }],
			},
		},
		conWithNoRev: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: ServiceHelper.generateRandomModelProperties(modelTypes.CONTAINER),
		},
		federation: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: { ...ServiceHelper.generateRandomModelProperties(modelTypes.FEDERATION),
				permissions: [{ user: users.viewer.user, permission: 'viewer' }, { user: users.commenter.user, permission: 'commenter' }],
			},
		},
	};

	models.federation.properties.subModels = [{ _id: models.conWithRev._id }];

	const revisionDates = [
		ServiceHelper.generateRandomDate(),
		ServiceHelper.generateRandomDate(),
		ServiceHelper.generateRandomDate(),
	];
	revisionDates.sort((a, b) => a - b);

	const conRevisions = {
		nonVoidRevision: ServiceHelper.generateRevisionEntry(false, true, modelTypes.CONTAINER, revisionDates[2]),
		voidRevision: ServiceHelper.generateRevisionEntry(true, true, modelTypes.CONTAINER, revisionDates[1]),
		noFileRevision: ServiceHelper.generateRevisionEntry(false, false, modelTypes.CONTAINER, revisionDates[0]),
	};

	const fedRevision = ServiceHelper.generateRevisionEntry(false, false);

	const stashEntries = {
		conStashEntry: ServiceHelper.generateStashEntry(conRevisions.nonVoidRevision._id,
			models.conWithRev._id, teamspace, true),
		fedStashEntry: ServiceHelper.generateStashEntry(fedRevision._id,
			models.federation._id, teamspace, true),
	};

	// Generate nodes for scene mock
	const revId = fedRevision._id;
	const rootNode = ServiceHelper.generateBasicNode('transformation', revId);
	const refNode = ServiceHelper.generateBasicNode('ref', revId,
		[rootNode.shared_id], { owner: teamspace, project: models.conWithRev._id });
	const meshNode = ServiceHelper.generateBasicNode('mesh', revId, [rootNode.shared_id]);

	const nodes = [rootNode, refNode, meshNode];

	// Create Mesh Map for scene mock
	const meshIdStr = uuidHelper.UUIDToString(meshNode._id);
	const meshMap = {
		[`${uuidHelper.UUIDToString(rootNode._id)}`]: [meshIdStr],
		[meshIdStr]: meshIdStr,
	};

	return {
		users,
		teamspace,
		project,
		models,
		conRevisions,
		fedRevision,
		stashEntries,
		nodes,
		meshMap,
	};
};

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
// - Container C4:
	// - NoFile revision R5
// - Federation F1:
	// - C1
	// - C2
// - Federation F2:
	// - C2
	// - C3
// - Federation F3:
	// - C3
	// - C4

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
	const dates = getRandomDatesDesc(5);
	const R1 = ServiceHelper.generateRevisionEntry(false, true, modelTypes.CONTAINER, dates[0]);
	const R2 = ServiceHelper.generateRevisionEntry(false, true, modelTypes.CONTAINER, dates[1]);

	// Create Revision for C2
	const R3 = ServiceHelper.generateRevisionEntry(false, true, modelTypes.CONTAINER, dates[2]);

	// Create Revision for C3
	const R4 = ServiceHelper.generateRevisionEntry(true, true, modelTypes.CONTAINER, dates[3]);

	// Create Revision for C4
	const R5 = ServiceHelper.generateRevisionEntry(false, false, modelTypes.CONTAINER, dates[4]);

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
		[R4],
	);

	const C4 = createContainerObject(
		teamspace,
		permissions,
		[R5],
	);

	const containers = {
		C1,
		C2,
		C3,
		C4,
	};

	// Create Federation objects
	const F1 = createFederationObject(
		teamspace,
		[C1, C2],
		permissions,
	);

	const F2 = createFederationObject(
		teamspace,
		[C2, C3],
		permissions,
	);

	const F3 = createFederationObject(
		teamspace,
		[C3, C4],
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
				project,
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
			project,
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

const setupData = async ({ users, teamspace, project, models, conRevisions, fedRevision, stashEntries,
	nodes, meshMap }) => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], key !== 'nobody' ? [teamspace] : []));

	const modelProms = Object.keys(models).map((key) => ServiceHelper.db.createModel(
		teamspace,
		models[key]._id,
		models[key].name,
		models[key].properties,
	));

	return Promise.all([
		...userProms,
		...modelProms,
		ServiceHelper.db.createProject(teamspace, project.id, project.name,
			Object.keys(models).map((key) => models[key]._id)),
		...Object.keys(conRevisions).map((key) => ServiceHelper.db.createRevision(teamspace,
			project.id, models.conWithRev._id, conRevisions[key], modelTypes.CONTAINER)),
		// ServiceHelper.db.createRevision(teamspace, project.id, models.federation._id,
		// 	fedRevision, modelTypes.FEDERATION),
		...Object.keys(stashEntries).map((key) => ServiceHelper.db.createStash(teamspace,
			project.id, stashEntries[key])),
		ServiceHelper.db.createScene(teamspace, project, models.federation._id, fedRevision, nodes, meshMap),
	]);
};

const testGetAssetMaps = () => {
	describe('Get asset maps', () => {
		// const basicData = generateBasicData();
		// const { users, teamspace, project, models, conRevisions, fedRevision,
		// 	stashEntries, nodes, meshMap } = basicData;

		// beforeAll(async () => {
		// 	await setupData(basicData);
		// });

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

				const revisionId = revId || cont.revisions[0]._id;

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

				return result;
			};

			// const getBasicContResult = () => {
			// 	const modelId = models.conWithRev._id;

			// 	const stashEntry = stashEntries.conStashEntry;
			// 	const assetIds = stashEntry.assets;
			// 	const assetData = stashEntry.jsonData;

			// 	let result = '';

			// 	result += `{"model":"${modelId}","supermeshes":[`;

			// 	let assetString = '';
			// 	for (let i = 0; i < assetIds.length; i++) {
			// 		const id = assetIds[i];
			// 		const data = assetData[i];
			// 		assetString += `{"id":"${id}","data":${data}}`;

			// 		if (i !== (assetIds.length - 1)) {
			// 			assetString += ',';
			// 		}
			// 	}

			// 	result += `${assetString}]}`;

			// 	return result;
			// };

			const getFedResult = (fed) => {
				let result = '';

				result += '{"submodels":[';

				const conts = fed.containers;
				for (let i = 0; i < conts.length; i++) {
					const cont = conts[i];
					const contResult = getContResult(cont);
					result += contResult;

					if (i !== (conts.length - 1) && contResult !== '') {
						result += ',';
					}
				}

				result += ']}';

				return result;
			};

			//const getBasicFedResult = () => `{"submodels":[${getBasicContResult()}]}`;

			// Basic tests
			// - User has no valid session
			// - Teamspace does not exist
			// - User is not a member of the teamspace
			// - The user does not have access to the model
			// - The user is viewer ?
			// - The user is commenter ?
			// - The project does not exist
			// const randomString = ServiceHelper.generateRandomString();
			// const nobodyKey = users.nobody.apiKey;
			// const noProjAccKey = users.noProjectAccess.apiKey;
			const viewerKey = users.viewer.apiKey;
			const commenterKey = users.commenter.apiKey;
			// const fedId = models.federation._id;
			// const detachedRev = ServiceHelper.generateRevisionEntry()._id;
			// const { containerNotFound, federationNotFound } = templates;
			// const contId = models.conWithRev._id;
			const masterRevId = 'master/head';

			const basicFailCasesCont = [
				// ['the user does not have a valid session', getContRoute({ key: null }), false, templates.notLoggedIn],
				// ['the teamspace does not exist', getContRoute({ ts: randomString }), false, templates.teamspaceNotFound],
				// ['the project does not exist', getContRoute({ projectId: randomString }), false, templates.projectNotFound],
				// ['the Container does not exist', getContRoute({ modelId: randomString }), false, containerNotFound],
				// ['the revision does not exist', getContRoute({ revisionId: detachedRev }), false, templates.revisionNotFound],
				// ['the user is not a member of the teamspace', getContRoute({ key: nobodyKey }), false, templates.teamspaceNotFound],
				// ['the user does not have access to the model', getContRoute({ key: noProjAccKey }), false, templates.notAuthorized],
				// ['the model is of wrong type', getContRoute({ modelId: fedId }), false, containerNotFound],
			];

			const basicFailCasesFed = [
				// ['the user does not have a valid session', getFedRoute({ key: null }), false, templates.notLoggedIn],
				// ['the teamspace does not exist', getFedRoute({ ts: randomString }), false, templates.teamspaceNotFound],
				// ['the project does not exist', getFedRoute({ projectId: randomString }), false, templates.projectNotFound],
				// ['the Federation does not exist', getFedRoute({ modelId: randomString }), false, federationNotFound],
				// ['the user is not a member of the teamspace', getFedRoute({ key: nobodyKey }), false, templates.teamspaceNotFound],
				// ['the user does not have access to the model', getFedRoute({ key: noProjAccKey }), false, templates.notAuthorized],
				// ['the user is viewer', getFedRoute({ key: viewerKey }), false, templates.ok],
				// ['the user is commenter', getFedRoute({ key: commenterKey }), false, templates.ok],
				// ['the model is of wrong type', getFedRoute({ modelId: contId }), false, federationNotFound],
			];

			const { C1 } = containers;
			const { C2 } = containers;
			const { C3 } = containers;
			const { C4 } = containers;

			const C1Id = C1._id;
			const C2Id = C2._id;
			const C3Id = C3._id;
			const C4Id = C4._id;

			const R1Id = C1.revisions[0]._id;
			const R2Id = C1.revisions[1]._id;
			const R3Id = C2.revisions[0]._id;
			const R4Id = C3.revisions[0]._id;
			const R5Id = C4.revisions[0]._id;

			const curRevResult = getContResult(C1, R1Id);
			const prevRevResult = getContResult(C1, R2Id);
			const contValidRevs = [
				// ['Access current rev via rev ID', getContRoute(), true, curRevResult],
				// ['Access current via master/head', getContRoute({ revisionId: masterRevId }), true, curRevResult],
				// ['Access previous via rev ID', getContRoute({ revisionId: R2Id }), true, prevRevResult],
				// ['Access current with viewer via rev ID', getContRoute({ key: viewerKey }), true, curRevResult],
				// ['Access current with commenter via rev ID', getContRoute({ key: commenterKey }), true, curRevResult],
				// ['Access current with viewer via master/head', getContRoute({ revisionId: masterRevId, key: viewerKey }), true, curRevResult],
				// ['Access current with commenter via master/head', getContRoute({ revisionId: masterRevId, key: commenterKey }), true, curRevResult],
			];

			const voidRevResult = getContResult(C3, R4Id);
			const contVoidRevs = [
				// ['Access Void revision via rev ID', getContRoute({ modelId: C3Id, revisionId: R4Id }), true, voidRevResult],
				['Access Void revision via master/head', getContRoute({ modelId: C3Id, revisionId: masterRevId }), true, voidRevResult],
				// ['Access Void revision with viewer via rev ID', getContRoute({ modelId: C3Id, revisionId: R4Id, key: viewerKey }), true, voidRevResult],
				// ['Access Void revision with commenter via rev ID', getContRoute({ modelId: C3Id, revisionId: R4Id, key: commenterKey }), true, voidRevResult],
				// ['Access Void revision with viewer via master/head', getContRoute({ modelId: C3Id, revisionId: masterRevId, key: viewerKey }), true, voidRevResult],
				// ['Access Void revision with commenter via master/head', getContRoute({ modelId: C3Id, revisionId: masterRevId, key: commenterKey }), true, voidRevResult],
			];

			const noFileRevResult = getContResult(C4, R5Id);
			const contNoFileRevisions = [
				// ['Access NoFile revision via rev ID', getContRoute({ modelId: C4Id, revisionId: R5Id }), true, noFileRevResult],
				// ['Access NoFile revision via master/head', getContRoute({ modelId: C4Id, revisionId: masterRevId }), true, noFileRevResult],
				// ['Access NoFile revision with viewer via rev ID', getContRoute({ modelId: C4Id, revisionId: R5Id, key: viewerKey }), true, noFileRevResult],
				// ['Access NoFile revision with commenter via rev ID', getContRoute({ modelId: C4Id, revisionId: R5Id, key: commenterKey }), true, noFileRevResult],
				// ['Access NoFile revision with viewer via master/head', getContRoute({ modelId: C4Id, revisionId: masterRevId, key: viewerKey }), true, noFileRevResult],
				// ['Access NoFile revision with commenter via master/head', getContRoute({ modelId: C4Id, revisionId: masterRevId, key: commenterKey }), true, noFileRevResult],
			];

			const F2Id = federations.F1.fedObj._id;
			const F3Id = federations.F3.fedObj._id;

			const fed1Results = getFedResult(federations.F1);
			const fed2Results = getFedResult(federations.F2);
			const fed3Results = getFedResult(federations.F3);
			const fedRevCombCases = [
				// ['Access fed with two submodels with valid revisions as admin', getFedRoute(), true, fed1Results],
				// ['Access fed with two submodels with valid revisions as viewer', getFedRoute({ key: viewerKey }), true, fed1Results],
				// ['Access fed with two submodels with valid revisions as commenter', getFedRoute({ key: commenterKey }), true, fed1Results],
				// ['Access fed with two submodels with one valid and one void as admin', getFedRoute({ modelId: F2Id }), true, fed2Results],
				// ['Access fed with two submodels with one valid and one void as viewer', getFedRoute({ modelId: F2Id, key: viewerKey }), true, fed2Results],
				// ['Access fed with two submodels with one valid and one void as commenter', getFedRoute({ modelId: F2Id, key: commenterKey }), true, fed2Results],
				// ['Access fed with two submodels with one void and one NoFile as admin', getFedRoute({ modelId: F3Id }), true, fed3Results],
				// ['Access fed with two submodels with one void and one NoFile as viewer', getFedRoute({ modelId: F3Id, key: viewerKey }), true, fed3Results],
				// ['Access fed with two submodels with one void and one NoFile as commenter', getFedRoute({ modelId: F3Id, key: commenterKey }), true, fed3Results],
			];

// 			○ Containers:
// 			§ Valid Revisions
// 				□ Access current via rev ID
// 				□ Access current via master/head
// 				□ Access previous via rev ID
// 				□ Access current with admin, viewer, and commenter rights via rev ID
// 				□ Access current with admin, viewer, and commenter rights via master/head
// 				□ Access previous with admin, viewer, and commenter rights via rev ID
// 			§ Invalid Revisions
// 				□ Access Void revision via rev ID
// 				□ Access Void revision via master/head
// 				□ Access Void revision with admin, viewer, and commenter rights via rev ID
// 				□ Access Void revision with admin, viewer, and commenter rights via master/head
// 			§ NoFile Revisions
// 				□ Access NoFile revision via rev ID
// 				□ Access NoFile revision via master/head
// 				□ Access NoFile revision with admin, viewer, and commenter rights via rev ID
// 				□ Access NoFile revision with admin, viewer, and commenter rights via master/head
// 		○ Federations
// 			§ Revision combinations
// 				□ Access federation with two submodels with valid revisions as admin, viewer, and commenter
// 				□ Access federation with two submodels with one valid and one void as admin viewer and commenter
// Access federation with two submodels with one void and one NoFile revision as admin viewer and commenter


			// const basicSuccCasesCont = [
			// 	['the user is admin', getContRoute(), true, getBasicContResult()],
			// 	['the user is viewer', getContRoute({ key: viewerKey }), true, getBasicContResult()],
			// 	['the user is commenter', getContRoute({ key: commenterKey }), true, getBasicContResult()],
			// ];

			// const basicSuccCasesFed = [
			// 	['the user is admin', getFedRoute(), true, getBasicFedResult()],
			// 	['the user is viewer', getFedRoute({ key: viewerKey }), true, getBasicFedResult()],
			// 	['the user is commenter', getFedRoute({ key: commenterKey }), true, getBasicFedResult()],
			// ];

			// Container only test
			// That it works, of course
			// providing revision /master/head returns most current revision
			// providing previous revision returns previous revision

			// Federation only tests
			// - Revision requested off federation should not work
			// - Federation should only get latest revisions from models.

			// Drawing test
			// Route does not exists for drawings

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
		console.log(generateTestData());
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
