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
const SuperTest = require('supertest');
const ServiceHelper = require('../../../../../../helper/services');
const { src } = require('../../../../../../helper/path');
const { UUIDToString } = require('../../../../../../../../src/v5/utils/helper/uuids');

const { isUUIDString } = require(`${src}/utils/helper/typeCheck`);
const { templates } = require(`${src}/utils/responseCodes`);
const { updateOne } = require(`${src}/handler/db`);

let server;
let agent;

const generateBasicData = () => {
	const viewer = ServiceHelper.generateUserCredentials();
	const data = {
		users: {
			tsAdmin: ServiceHelper.generateUserCredentials(),
			noProjectAccess: ServiceHelper.generateUserCredentials(),
			nobody: ServiceHelper.generateUserCredentials(),
			viewer,
		},
		teamspace: ServiceHelper.generateRandomString(),
		project: ServiceHelper.generateRandomProject(),
		con: ServiceHelper.generateRandomModel({ viewers: [viewer.user] }),
		fed: ServiceHelper.generateRandomModel({ viewers: [viewer.user], isFederation: true }),
	};

	return data;
};

const setupBasicData = async (users, teamspace, project, models) => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], key !== 'nobody' ? [teamspace] : []));
	const modelProms = models.map((model) => ServiceHelper.db.createModel(
		teamspace,
		model._id,
		model.name,
		model.properties,
	));
	await Promise.all([
		...userProms,
		...modelProms,
		ServiceHelper.db.createProject(teamspace, project.id, project.name, models.map(({ _id }) => _id)),
	]);
};

const testGetModelList = () => {
	describe('Get model list', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const models = times(10, (n) => ({
			...ServiceHelper.generateRandomModel({ isFederation: n % 2 === 0 }),
			isFavourite: n % 3 === 0,
		}));

		models.push(con, fed);

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, models);
			const favourites = models.flatMap(({ _id, isFavourite }) => (isFavourite ? _id : []));
			await updateOne('admin', 'system.users', { user: users.tsAdmin.user }, {
				$set: {
					[`customData.starredModels.${teamspace}`]: favourites,
				},
			});
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';

			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s${key ? `?key=${key}` : ''}`;

			const modelList = models.flatMap(({ _id, isFavourite, name, properties }) => {
				const shouldInclude = isFed ? properties?.federate : !properties?.federate;
				return shouldInclude ? { _id, isFavourite: !!isFavourite, name, role: 'admin' } : [];
			});
			return [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				[`the user is a member of the teamspace but has no access to any of the ${modelType}`, getRoute({ key: users.noProjectAccess.apiKey }), true, { [`${modelType}s`]: [] }],
				[`the user has access to some ${modelType}s`, getRoute(), true, { [`${modelType}s`]: modelList }],
			];
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					const key = Object.keys(expectedOutput)[0];

					expect(res.body[key].length).toBe(expectedOutput[key].length);
					expect(res.body[key]).toEqual(expect.arrayContaining(expectedOutput[key]));
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};
		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

const addIssuesAndRisks = async (teamspace, model) => {
	const issues = ['open', 'closed', 'in progress', 'void'].map((status) => ({
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		status,
	}));

	const risks = ['unmitigated', 'proposed', 'void', 'agreed_fully', 'agreed_partial'].map((status) => ({
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		mitigation_status: status,
	}));

	await Promise.all([
		...issues.map((issue) => ServiceHelper.db.createIssue(
			teamspace,
			model._id,
			issue,
		)),
		...risks.map((risk) => ServiceHelper.db.createRisk(
			teamspace,
			model._id,
			risk,
		)),
	]);

	/* eslint-disable no-param-reassign */
	model.issuesCount = 2;
	model.risksCount = 3;
	/* eslint-enable no-param-reassign */
};

const addRevision = async (teamspace, model) => {
	const rev = ServiceHelper.generateRevisionEntry(false, false);
	await ServiceHelper.db.createRevision(teamspace, model._id, rev);

	/* eslint-disable-next-line no-param-reassign */
	model.revs = model.revs || [];
	model.revs.push(rev);
	return rev;
};

const testGetModelStats = () => {
	describe('Get model stats', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const [fedWithNoSubModel, fedWithNoRevInSubModel] = times(
			2, () => ServiceHelper.generateRandomModel({ isFederation: true }),
		);

		const [
			conNoRev, conFailedProcessing1, conFailedProcessing2,
		] = times(3, () => ServiceHelper.generateRandomModel());

		fed.properties.subModels = [con._id, conNoRev._id];
		fedWithNoRevInSubModel.properties.subModels = [conNoRev._id];

		conFailedProcessing1.properties = {
			...conFailedProcessing1.properties,
			status: 'failed',
			errorReason: {
				message: ServiceHelper.generateRandomString(),
				timestamp: new Date(),
			},
		};

		conFailedProcessing2.properties = {
			...conFailedProcessing2.properties,
			errorReason: {
				message: ServiceHelper.generateRandomString(),
				errorCode: 1,
			},

		};

		beforeAll(async () => {
			const models = [
				fed, con, fedWithNoSubModel, fedWithNoRevInSubModel,
				conNoRev, conFailedProcessing1, conFailedProcessing2,
			];
			await setupBasicData(users, teamspace, project, models);
			await Promise.all([
				addIssuesAndRisks(teamspace, fed),
				addIssuesAndRisks(teamspace, fedWithNoRevInSubModel),
			]);

			const rev = await addRevision(teamspace, con);
			fed.revs = [rev];
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const model = isFed ? fed : con;
			const wrongTypeModel = isFed ? con : fed;

			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = model._id,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/stats${key ? `?key=${key}` : ''}`;

			const basicCases = [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				[`the user does not have access to the ${modelType}`, getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
				[`the ${modelType} does not exist`, getRoute({ modelId: ServiceHelper.generateRandomString() }), false, modelNotFound],
				[`the model is not a ${modelType}`, getRoute({ modelId: wrongTypeModel._id }), false, modelNotFound],
			];

			return [
				...basicCases,
				...(isFed
					? [
						[`the ${modelType} contains subModels with revisions`, getRoute(), true, model],
						[`the ${modelType} contains subModels with no revision`, getRoute({ modelId: fedWithNoRevInSubModel._id }), true, fedWithNoRevInSubModel],
						[`the ${modelType} does not have subModels`, getRoute({ modelId: fedWithNoSubModel._id }), true, fedWithNoSubModel],
					]
					: [
						[`the ${modelType} is valid and user has access`, getRoute(), true, model],
						[`the ${modelType} is valid and user has access (no revision)`, getRoute({ modelId: conNoRev._id }), true, conNoRev],
						[`the ${modelType} is valid and user has access (with failed revision - 1)`, getRoute({ modelId: conFailedProcessing1._id }), true, conFailedProcessing1],
						[`the ${modelType} is valid and user has access (with failed revision - 2)`, getRoute({ modelId: conFailedProcessing2._id }), true, conFailedProcessing2],
					]),
			];
		};
		const formatToStats = ({ properties, issuesCount = 0, risksCount = 0, revs = [] }) => {
			const { subModels, status, desc, properties: { code, unit }, federate, errorReason, type } = properties;
			revs.sort(({ timestamp: t1 }, { timestamp: t2 }) => {
				if (t1 < t2) return -1;
				if (t1 > t2) return 1;
				return 0;
			});

			const latestRev = revs.length ? revs[revs.length - 1] : undefined;
			const res = {
				code,
				status,
			};

			if (federate) {
				if (subModels) {
					res.containers = subModels;
				}
				if (desc) {
					res.desc = desc;
				}
				res.tickets = {
					issues: issuesCount,
					risks: risksCount,
				};
				if (latestRev) {
					res.lastUpdated = latestRev.timestamp.getTime();
				}
			} else {
				res.revisions = {
					total: revs.length,
					lastUpdated: latestRev?.timestamp ? latestRev.timestamp.getTime() : undefined,
					latestRevision: latestRev?.tag || latestRev?._id,
				};

				res.type = type;
				res.unit = unit;
			}

			if (status === 'failed') {
				res.errorReason = {
					message: errorReason.message,
					timestamp: errorReason.timestamp ? errorReason.timestamp.getTime() : undefined,
				};
			}

			return res;
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(res.body).toEqual(formatToStats(expectedOutput));
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};
		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

const testAppendFavourites = () => {
	describe('Append Favourites', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const favFed = { ...ServiceHelper.generateRandomModel({ isFederation: true }), isFavourite: true };
		const favCon = { ...ServiceHelper.generateRandomModel(), isFavourite: true };

		beforeAll(async () => {
			const models = [con, fed, favFed, favCon];
			await setupBasicData(users, teamspace, project, models);
			const favourites = models.flatMap(({ _id, isFavourite }) => (isFavourite ? _id : []));
			await updateOne('admin', 'system.users', { user: users.tsAdmin.user }, {
				$set: {
					[`customData.starredModels.${teamspace}`]: favourites,
				},
			});
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongModelType = isFed ? 'container' : 'federation';
			const model = isFed ? fed : con;
			const favModel = isFed ? favFed : favCon;
			const wrongTypeModel = isFed ? con : fed;

			const standardPayload = { [`${modelType}s`]: [model._id] };

			const generateRouteParams = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
			} = {}) => ({
				projectId, modelType, key,
			});

			return [
				['the user does not have a valid session', generateRouteParams({ key: null }), false, templates.notLoggedIn, standardPayload],
				['the user is not a member of the teamspace', generateRouteParams({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound, standardPayload],
				['the project does not exist', generateRouteParams({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound, standardPayload],
				[`the user does not have access to the ${modelType}`, generateRouteParams({ key: users.noProjectAccess.apiKey }), false, templates.invalidArguments, standardPayload],
				[`the ${modelType} list provided contains a ${wrongModelType}`, generateRouteParams(), false, templates.invalidArguments, { [`${modelType}s`]: [wrongTypeModel._id] }],
				[`the ${modelType} list provided isEmpty`, generateRouteParams(), false, templates.invalidArguments, { [`${modelType}s`]: [] }],
				['the payload is empty', generateRouteParams(), false, templates.invalidArguments, { }],
				[`the ${modelType} list contains a ${modelType} that does not exist`, generateRouteParams(), false, templates.invalidArguments, { [`${modelType}s`]: [ServiceHelper.generateRandomString()] }],
				[`the ${modelType} list is valid`, generateRouteParams(), true, undefined, standardPayload],
				[`the ${modelType} list contains ${modelType} that is already a favourite`, generateRouteParams(), true, undefined, { [`${modelType}s`]: [favModel._id] }],
			];
		};

		const runTest = (desc, routeParams, success, expectedOutput, payload) => {
			const getRoute = ({
				modelType,
				projectId,
				key,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/favourites${key ? `?key=${key}` : ''}`;
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.patch(getRoute(routeParams)).send(payload).expect(expectedStatus);
				if (success) {
					const { modelType, projectId, key } = routeParams;
					const getModelListRoute = `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s?key=${key}`;
					const listRes = await agent.get(getModelListRoute).expect(expectedStatus);
					const favModels = listRes.body[`${modelType}s`].flatMap(({ isFavourite, _id }) => (isFavourite ? _id : []));
					expect(favModels).toEqual(expect.arrayContaining(payload[`${modelType}s`]));
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};
		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

const testDeleteFavourites = () => {
	describe('Remove Favourites', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const favFed = { ...ServiceHelper.generateRandomModel({ isFederation: true }), isFavourite: true };
		const favCon = { ...ServiceHelper.generateRandomModel(), isFavourite: true };

		beforeAll(async () => {
			const models = [con, fed, favFed, favCon];
			await setupBasicData(users, teamspace, project, models);
			const favourites = models.flatMap(({ _id, isFavourite }) => (isFavourite ? _id : []));
			await updateOne('admin', 'system.users', { user: users.tsAdmin.user }, {
				$set: {
					[`customData.starredModels.${teamspace}`]: favourites,
				},
			});
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongModelType = isFed ? 'container' : 'federation';
			const model = isFed ? fed : con;
			const favModel = isFed ? favFed : favCon;
			const wrongTypeModel = isFed ? con : fed;

			const generateRouteParams = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelIds = [model._id],
			} = {}) => ({
				projectId, modelType, key, modelIds,
			});

			return [
				['the user does not have a valid session', generateRouteParams({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', generateRouteParams({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the project does not exist', generateRouteParams({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				[`the user does not have access to the ${modelType}`, generateRouteParams({ key: users.noProjectAccess.apiKey }), false, templates.invalidArguments],
				[`the ${modelType} list provided has a ${wrongModelType}`, generateRouteParams({ modelIds: [wrongTypeModel._id] }), false, templates.invalidArguments],
				[`the ${modelType} list is not provided`, generateRouteParams({ modelIds: null }), false, templates.invalidArguments],
				[`the ${modelType} list contains correct data`, generateRouteParams({ modelIds: [favModel._id] }), true],
			];
		};

		const runTest = (desc, routeParams, success, expectedOutput) => {
			const getRoute = ({
				projectId,
				key,
				modelIds,
				modelType,
			}) => {
				let url = `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/favourites`;
				let firstParam = true;
				if (key) {
					url += `?key=${key}`;
					firstParam = false;
				}
				if (modelIds) {
					url += `${firstParam ? '?' : '&'}ids=${modelIds.join(',')}`;
				}

				return url;
			};

			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.delete(getRoute(routeParams)).expect(expectedStatus);
				if (success) {
					const { modelType, projectId, key, modelIds } = routeParams;
					const getModelListRoute = `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s?key=${key}`;
					const listRes = await agent.get(getModelListRoute).expect(expectedStatus);
					const favModels = listRes.body[`${modelType}s`].flatMap(({ isFavourite, _id }) => (isFavourite ? _id : []));
					expect(favModels).not.toEqual(expect.arrayContaining(modelIds));
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};
		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

const testAddModel = () => {
	describe('Add Model', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();

		beforeAll(async () => {
			const models = [con, fed];
			await setupBasicData(users, teamspace, project, models);
			const favourites = models.flatMap(({ _id, isFavourite }) => (isFavourite ? _id : []));
			await updateOne('admin', 'system.users', { user: users.tsAdmin.user }, {
				$set: {
					[`customData.starredModels.${teamspace}`]: favourites,
				},
			});
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongModelType = isFed ? 'container' : 'federation';
			const model = isFed ? fed : con;
			const wrongTypeModel = isFed ? con : fed;

			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s${key ? `?key=${key}` : ''}`;

			const generatePayload = (name = ServiceHelper.generateRandomString()) => ({ name, unit: 'mm', type: isFed ? undefined : ServiceHelper.generateRandomString() });

			return [
				['the user does not have a valid session', getRoute({ key: null }), false, generatePayload(), templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, generatePayload(), templates.teamspaceNotFound],
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, generatePayload(), templates.projectNotFound],
				['the user is not a project admin', getRoute({ key: users.noProjectAccess.apiKey }), false, generatePayload(), templates.notAuthorized],
				[`the name has been taken by another ${modelType}`, getRoute(), false, generatePayload(model.name), templates.invalidArguments],
				[`the name has been taken by a ${wrongModelType}`, getRoute(), false, generatePayload(wrongTypeModel.name), templates.invalidArguments],
				['with invalid payload', getRoute(), false, {}, templates.invalidArguments],
				['user has sufficient permission and the payload is valid', getRoute(), true, generatePayload()],
			];
		};

		const runTest = (desc, route, success, payload, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.post(route).send(payload).expect(expectedStatus);
				if (success) {
					expect(isUUIDString(res.body._id)).toBe(true);
					const getRes = await agent.get(route).expect(templates.ok.status);
					const modelType = Object.keys(getRes.body)[0];
					expect(getRes.body[modelType].find(({ _id }) => _id === res.body._id)).not.toBe(undefined);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};
		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

const testDeleteModel = () => {
	describe('Delete Model', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const conIsSubModel = ServiceHelper.generateRandomModel();
		const fedOfSubModelCon = ServiceHelper.generateRandomModel({ isFederation: true });

		fedOfSubModelCon.properties.subModels = [conIsSubModel._id];

		beforeAll(async () => {
			const models = [con, fed, conIsSubModel, fedOfSubModelCon];
			await setupBasicData(users, teamspace, project, models);
			const favourites = models.flatMap(({ _id, isFavourite }) => (isFavourite ? _id : []));
			await updateOne('admin', 'system.users', { user: users.tsAdmin.user }, {
				$set: {
					[`customData.starredModels.${teamspace}`]: favourites,
				},
			});
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const model = isFed ? fed : con;
			const wrongTypeModel = isFed ? con : fed;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;

			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = model._id,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}${key ? `?key=${key}` : ''}`;

			return [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				[`the ${modelType} does not exist`, getRoute({ modelId: ServiceHelper.generateRandomString() }), false, modelNotFound],
				[`the model is not a ${modelType}`, getRoute({ modelId: wrongTypeModel._id }), false, modelNotFound],
				['the user lacks sufficient permissions', getRoute({ key: users.viewer.apiKey }), false, templates.notAuthorized],
				[`the ${modelType} exists and the user has sufficient permissions`, getRoute(), true],
				...(isFed ? [] : [
					[`the ${modelType} is a sub model of a federation`, getRoute({ modelId: conIsSubModel._id }), false, templates.containerIsSubModel],
				]),
			];
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.delete(route).expect(expectedStatus);
				if (success) {
					const queryStr = route.split('?')[1];
					const getRoute = route.split('/').slice(0, -1).join('/');
					const getRes = await agent.get(`${getRoute}?${queryStr}`).expect(templates.ok.status);
					const modelType = Object.keys(getRes.body)[0];
					expect(getRes.body[modelType].find(({ _id }) => _id === res.body._id)).toBeUndefined();
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};
		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

const testUpdateModelSettings = () => {
	describe('Update Settings', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const conIsSubModel = ServiceHelper.generateRandomModel();
		const fedOfSubModelCon = ServiceHelper.generateRandomModel({ isFederation: true });

		fedOfSubModelCon.properties.subModels = [conIsSubModel._id];

		fed.legend = { _id: ServiceHelper.generateUUID() };
		con.legend = { _id: ServiceHelper.generateUUID() };
		fed.view = { _id: ServiceHelper.generateUUID() };
		con.view = { _id: ServiceHelper.generateUUID() };

		beforeAll(async () => {
			const models = [con, fed, conIsSubModel, fedOfSubModelCon];
			await setupBasicData(users, teamspace, project, models);

			await Promise.all([
				ServiceHelper.db.createViews(teamspace, fed._id, [fed.view]),
				ServiceHelper.db.createLegends(teamspace, fed._id, [fed.legend]),
				ServiceHelper.db.createViews(teamspace, con._id, [con.view]),
				ServiceHelper.db.createLegends(teamspace, con._id, [con.legend]),
			]);
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const model = isFed ? fed : con;
			const wrongTypeModel = isFed ? con : fed;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;

			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = model._id,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}${key ? `?key=${key}` : ''}`;

			const dummyPayload = { name: ServiceHelper.generateRandomString() };

			return [
				['the user does not have a valid session', getRoute({ key: null }), false, dummyPayload, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, dummyPayload, templates.teamspaceNotFound],
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, dummyPayload, templates.projectNotFound],
				[`the ${modelType} does not exist`, getRoute({ modelId: ServiceHelper.generateRandomString() }), false, dummyPayload, modelNotFound],
				[`the model is not a ${modelType}`, getRoute({ modelId: wrongTypeModel._id }), false, dummyPayload, modelNotFound],
				['the user lacks sufficient permissions', getRoute({ key: users.viewer.apiKey }), false, dummyPayload, templates.notAuthorized],
				['the payload does not conform to the schema', getRoute(), false, { name: 123 }, templates.invalidArguments],
				['the payload contains unrecognised data', getRoute(), false, { name: 123, [ServiceHelper.generateRandomString()]: true }, templates.invalidArguments],
				['the user is trying to toggle federate', getRoute(), false, { federate: !isFed }, templates.invalidArguments],
				['the defaultView is not recognised', getRoute(), false, { defaultView: ServiceHelper.generateRandomString() }, templates.invalidArguments],
				['the defaultView is set to a valid view', getRoute(), true, { defaultView: UUIDToString(model.view._id) }],
				['the defaultLegend is not recognised', getRoute(), false, { defaultLegend: ServiceHelper.generateRandomString() }, templates.invalidArguments],
				['the defaultLegend is set to a valid legend', getRoute(), true, { defaultLegend: UUIDToString(model.legend._id) }],
				['the defaultView is set to null', getRoute(), true, { defaultView: null }],
				['the defaultLegend is set to null', getRoute(), true, { defaultLegend: null }],
				['the payload is valid', getRoute(), true, dummyPayload],
				...(isFed ? [
					['the user tries to edit submodel array', getRoute(), false, { subModels: [con._id] }, templates.invalidArguments],
				] : [
				]),
			];
		};

		const runTest = (desc, route, success, payload, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.patch(route).send(payload).expect(expectedStatus);
				if (!success) {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};
		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

const testGetSettings = () => {
	describe('Get Model Settings', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();

		fed.properties = {
			...fed.properties,
			defaultView: ServiceHelper.generateUUID(),
			defaultLegend: ServiceHelper.generateUUID(),
			timestamp: new Date(),
			errorReason: {
				message: 'error reason',
				timestamp: new Date(),
				errorCode: 1,
			},
		};

		con.properties = {
			...con.properties,
			defaultView: ServiceHelper.generateUUID(),
			defaultLegend: ServiceHelper.generateUUID(),
			timestamp: new Date(),
			status: 'failed',
			errorReason: {
				message: 'error reason',
				timestamp: new Date(),
				errorCode: 1,
			},
		};

		const fed2 = ServiceHelper.generateRandomModel({ isFederation: true });
		const con2 = ServiceHelper.generateRandomModel();

		beforeAll(async () => {
			const models = [con, fed, fed2, con2];
			await setupBasicData(users, teamspace, project, models);
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const model = isFed ? fed : con;
			const model2 = isFed ? fed2 : con2;

			const wrongTypeModel = isFed ? con : fed;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;

			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = model._id,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}${key ? `?key=${key}` : ''}`;

			return [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				[`the ${modelType} does not exist`, getRoute({ modelId: ServiceHelper.generateRandomString() }), false, modelNotFound],
				[`the model is not a ${modelType}`, getRoute({ modelId: wrongTypeModel._id }), false, modelNotFound],
				[`the user does not have access to the ${modelType}`, getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
				['the model exists and the user has access', getRoute(), true, model],
				['the model exists and the user has access (2)', getRoute({ modelId: model2._id }), true, model2],
			];
		};

		const formatToSettings = (settings) => ({
			_id: settings._id,
			name: settings.name,
			desc: settings.properties.desc,
			code: settings.properties.properties.code,
			unit: settings.properties.properties.unit,
			type: settings.properties.type,
			defaultView: settings.properties.defaultView ? UUIDToString(settings.properties.defaultView) : undefined,
			defaultLegend: settings.properties.defaultLegend
				? UUIDToString(settings.properties.defaultLegend) : undefined,
			timestamp: settings.properties.timestamp ? settings.properties.timestamp.getTime() : undefined,
			angleFromNorth: settings.properties.angleFromNorth,
			status: settings.properties.status,
			surveyPoints: settings.properties.surveyPoints,
			errorReason: settings.properties.errorReason ? {
				message: settings.properties.errorReason.message,
				timestamp: settings.properties.errorReason.timestamp
					? settings.properties.errorReason.timestamp.getTime() : undefined,
				errorCode: settings.properties.errorReason.errorCode,
			} : undefined,
		});

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(res.body).toEqual(formatToSettings(expectedOutput));
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};
		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testGetModelList();
	testGetModelStats();
	testAppendFavourites();
	testDeleteFavourites();
	testAddModel();
	testDeleteModel();
	testUpdateModelSettings();
	testGetSettings();
});
