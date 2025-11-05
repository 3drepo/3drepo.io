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

const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { calibrationStatuses } = require(`${src}/models/calibrations.constants`);
const { isUUIDString } = require(`${src}/utils/helper/typeCheck`);
const { templates } = require(`${src}/utils/responseCodes`);
const { updateOne } = require(`${src}/handler/db`);
const { statuses, statusTypes } = require(`${src}/schemas/tickets/templates.constants`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);

let server;
let agent;

const generateBasicData = () => {
	const viewer = ServiceHelper.generateUserCredentials();
	const commenter = ServiceHelper.generateUserCredentials();
	const collaborator = ServiceHelper.generateUserCredentials();
	const data = {
		users: {
			tsAdmin: ServiceHelper.generateUserCredentials(),
			noProjectAccess: ServiceHelper.generateUserCredentials(),
			nobody: ServiceHelper.generateUserCredentials(),
			projectAdmin: ServiceHelper.generateUserCredentials(),
			viewer,
			commenter,
			collaborator,
		},
		teamspace: ServiceHelper.generateRandomString(),
		project: ServiceHelper.generateRandomProject(),
		con: ServiceHelper.generateRandomModel({
			viewers: [viewer.user],
			commenters: [commenter.user],
			collaborators: [collaborator.user] }),
		fed: ServiceHelper.generateRandomModel({
			viewers: [viewer.user],
			commenters: [commenter.user],
			collaborators: [collaborator.user],
			modelType: modelTypes.FEDERATION }),
		draw: ServiceHelper.generateRandomModel({
			viewers: [viewer.user],
			commenters: [commenter.user],
			collaborators: [collaborator.user],
			modelType: modelTypes.DRAWING }),
		calibration: ServiceHelper.generateCalibration(),
	};

	data.jobs = [
		{ _id: ServiceHelper.generateRandomString(), users: [viewer.user] },
		{ _id: ServiceHelper.generateRandomString(), users: [collaborator.user] },
		{ _id: ServiceHelper.generateRandomString(), users: Object.values(data.users).map(({ user }) => user) },
	];

	return data;
};

const setupBasicData = async (users, teamspace, project, models) => {
	const { tsAdmin, ...otherUsers } = users;

	await ServiceHelper.db.createUser(tsAdmin);
	await ServiceHelper.db.createTeamspace(teamspace, [tsAdmin.user]);

	const userProms = Object.keys(otherUsers).map((key) => ServiceHelper.db.createUser(users[key], key !== 'nobody' ? [teamspace] : []));
	const modelProms = models.map((model) => ServiceHelper.db.createModel(
		teamspace,
		model._id,
		model.name,
		model.properties,
	));
	await Promise.all([
		...userProms,
		...modelProms,
		ServiceHelper.db.createProject(teamspace, project.id, project.name, models.map(({ _id }) => _id),
			[users.projectAdmin.user]),
	]);
};

const testGetModelList = () => {
	describe('Get model list', () => {
		const { users, teamspace, project, con, fed, draw } = generateBasicData();
		const models = [...times(15, (n) => {
			let modelType;
			if (n % 2 === 0) {
				modelType = modelTypes.FEDERATION;
			} else if (n % 3 === 0) {
				modelType = modelTypes.DRAWING;
			} else {
				modelType = modelTypes.CONTAINER;
			}

			return {
				...ServiceHelper.generateRandomModel({ modelType }),
				isFavourite: n % 5 === 0,
				modelType,
			};
		})];

		models.push(
			{ ...con, modelType: modelTypes.CONTAINER },
			{ ...fed, modelType: modelTypes.FEDERATION },
			{ ...draw, modelType: modelTypes.DRAWING });

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, models);
			const favourites = models.flatMap(({ _id, isFavourite }) => (isFavourite ? _id : []));
			await updateOne('admin', 'system.users', { user: users.tsAdmin.user }, {
				$set: {
					[`customData.starredModels.${teamspace}`]: favourites,
				},
			});
		});

		const generateTestData = (modelType) => {
			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s${key ? `?key=${key}` : ''}`;

			const modelList = models.flatMap(({ _id, isFavourite, name, modelType: type }) => (type === modelType ? { _id, isFavourite: !!isFavourite, name, role: 'admin' } : []));

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
		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawing', runTest);
	});
};

const addTickets = async (teamspace, project, model) => {
	const template = ServiceHelper.generateTemplate();

	const customStatuses = [
		{ name: ServiceHelper.generateRandomString(), type: statusTypes.OPEN },
		{ name: ServiceHelper.generateRandomString(), type: statusTypes.ACTIVE },
		{ name: ServiceHelper.generateRandomString(), type: statusTypes.VOID },
		{ name: ServiceHelper.generateRandomString(), type: statusTypes.DONE },
	];

	const customStatusesTemplate = ServiceHelper.generateTemplate(false, false, {
		status: {
			values: customStatuses,
			default: customStatuses[0].name,
		},
	});

	const tickets = Object.values(statuses).map((status) => {
		const ticket = ServiceHelper.generateTicket(template);
		ticket.properties.Status = status;
		return ticket;
	});

	const customStatusTickets = customStatuses.map((status) => {
		const ticket = ServiceHelper.generateTicket(customStatusesTemplate);
		ticket.properties.Status = status.name;
		return ticket;
	});

	await ServiceHelper.db.createTemplates(teamspace, [template, customStatusesTemplate]);
	await Promise.all([
		...tickets.map((ticket) => ServiceHelper.db.createTicket(
			teamspace, project.id, model._id, ticket,
		)),
		...customStatusTickets.map((ticket) => ServiceHelper.db.createTicket(
			teamspace, project.id, model._id, ticket,
		)),
	]);

	// eslint-disable-next-line no-param-reassign
	model.ticketCount = 5;
};

const addRevision = async (teamspace, project, model, modelType = modelTypes.CONTAINER, hasFiles = false) => {
	const rev = ServiceHelper.generateRevisionEntry(false, hasFiles, modelType);
	if (hasFiles) {
		/* eslint-disable-next-line no-param-reassign */
		model.files = model.files ?? [];
		model.files.push({ refData: rev.refData, thumbnailData: rev.thumbnailData, imageData: rev.imageData });
	}
	await ServiceHelper.db.createRevision(teamspace, project.id, model._id, rev, modelType);

	/* eslint-disable-next-line no-param-reassign */
	model.revs = model.revs || [];
	model.revs.push(rev);

	return rev;
};

const testGetModelStats = () => {
	describe('Get model stats', () => {
		const { users, teamspace, project, con, fed, draw, calibration } = generateBasicData();
		const [fedWithNoSubModel, fedWithNoRevInSubModel] = times(
			2, () => ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION }),
		);

		const drawNoRev = ServiceHelper.generateRandomModel({ modelType: modelTypes.DRAWING });

		const [
			conNoRev, conFailedProcessing1, conFailedProcessing2,
		] = times(3, () => ServiceHelper.generateRandomModel());

		fed.properties.subModels = [{ _id: con._id }, { _id: conNoRev._id }];
		fedWithNoRevInSubModel.properties.subModels = [{ _id: conNoRev._id }];

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
				fed, con, draw, fedWithNoSubModel, fedWithNoRevInSubModel,
				conNoRev, drawNoRev, conFailedProcessing1, conFailedProcessing2,
			];
			await setupBasicData(users, teamspace, project, models);
			await Promise.all([
				addTickets(teamspace, project, fed),
				addTickets(teamspace, project, fedWithNoRevInSubModel),
			]);

			const drawRev = await addRevision(teamspace, project, draw, modelTypes.DRAWING);
			await ServiceHelper.db.createCalibration(teamspace, project.id, draw._id, drawRev._id, calibration);
			draw.properties.calibrationStatus = calibrationStatuses.CALIBRATED;

			const rev = await addRevision(teamspace, project, con);
			fed.revs = [rev];
		});

		const generateTestData = (modelType) => {
			let model;
			let wrongTypeModel;
			let modelNotFound;

			if (modelType === modelTypes.CONTAINER) {
				wrongTypeModel = fed;
				model = con;
				modelNotFound = templates.containerNotFound;
			} else if (modelType === modelTypes.FEDERATION) {
				wrongTypeModel = con;
				model = fed;
				modelNotFound = templates.federationNotFound;
			} else {
				wrongTypeModel = fed;
				model = draw;
				modelNotFound = templates.drawingNotFound;
			}

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

			const customCases = {
				[modelTypes.FEDERATION]: [
					[`the ${modelType} contains subModels with revisions`, getRoute(), true, model],
					[`the ${modelType} contains subModels with no revision`, getRoute({ modelId: fedWithNoRevInSubModel._id }), true, fedWithNoRevInSubModel],
					[`the ${modelType} does not have subModels`, getRoute({ modelId: fedWithNoSubModel._id }), true, fedWithNoSubModel],
				],
				[modelTypes.CONTAINER]: [
					[`the ${modelType} is valid and user has access`, getRoute(), true, model],
					[`the ${modelType} is valid and user has access (no revision)`, getRoute({ modelId: conNoRev._id }), true, conNoRev],
					[`the ${modelType} is valid and user has access (with failed revision - 1)`, getRoute({ modelId: conFailedProcessing1._id }), true, conFailedProcessing1],
					[`the ${modelType} is valid and user has access (with failed revision - 2)`, getRoute({ modelId: conFailedProcessing2._id }), true, conFailedProcessing2],
				],
				[modelTypes.DRAWING]: [
					[`the ${modelType} is valid and user has access`, getRoute(), true, model],
					[`the ${modelType} is valid and user has access (no revision)`, getRoute({ modelId: drawNoRev._id }), true, drawNoRev],
				],
			};

			return [
				...basicCases,
				...customCases[modelType],
			];
		};

		const formatToStats = ({ properties, ticketCount = 0, revs = [] }) => {
			const { subModels, status, desc, number, properties: props, calibrationStatus,
				federate, errorReason, type } = properties;

			let { modelType } = properties;
			if (!modelType) {
				modelType = federate ? modelTypes.FEDERATION : modelTypes.CONTAINER;
			}

			revs.sort(({ timestamp: t1 }, { timestamp: t2 }) => {
				if (t1 < t2) return -1;
				if (t1 > t2) return 1;
				return 0;
			});

			const latestRev = revs.length ? revs[revs.length - 1] : undefined;
			const res = {
				code: modelType === modelTypes.DRAWING ? undefined : props.code,
				unit: modelType === modelTypes.DRAWING ? undefined : props.unit,
				number: modelType === modelTypes.DRAWING ? number : undefined,
				desc: modelType === modelTypes.CONTAINER ? undefined : desc,
				lastUpdated: modelType === modelTypes.FEDERATION ? latestRev?.timestamp?.getTime() : undefined,
				containers: modelType === modelTypes.FEDERATION ? subModels : undefined,
				status,
				calibration: modelType === modelTypes.DRAWING ? calibrationStatus : undefined,
				type: modelType === modelTypes.FEDERATION ? undefined : type,
			};

			if (federate) {
				if (subModels) {
					res.containers = subModels;
				}
				if (desc) {
					res.desc = desc;
				}

				res.tickets = ticketCount;

				if (latestRev) {
					res.lastUpdated = latestRev.timestamp.getTime();
				}
			} else {
				res.revisions = {
					total: revs.length,
					lastUpdated: latestRev?.timestamp ? latestRev.timestamp.getTime() : undefined,
					latestRevision: modelType === modelTypes.DRAWING && latestRev
						? `${latestRev.statusCode}-${latestRev.revCode}`
						: latestRev?.tag || latestRev?._id,
				};
			}

			if (status === 'failed') {
				res.errorReason = {
					message: errorReason.message,
					timestamp: errorReason.timestamp ? errorReason.timestamp.getTime() : undefined,
				};
			}

			return deleteIfUndefined(res);
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

		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawings', runTest);
	});
};

const testAppendFavourites = () => {
	describe('Append Favourites', () => {
		const { users, teamspace, project, con, fed, draw } = generateBasicData();
		const favFed = { ...ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION }),
			isFavourite: true };
		const favCon = { ...ServiceHelper.generateRandomModel(), isFavourite: true };
		const favDraw = { ...ServiceHelper.generateRandomModel({ modelType: modelTypes.DRAWING }),
			isFavourite: true };

		beforeAll(async () => {
			const models = [con, fed, draw, favFed, favCon, favDraw];
			await setupBasicData(users, teamspace, project, models);
			const favourites = models.flatMap(({ _id, isFavourite }) => (isFavourite ? _id : []));
			await updateOne('admin', 'system.users', { user: users.tsAdmin.user }, {
				$set: {
					[`customData.starredModels.${teamspace}`]: favourites,
				},
			});
		});

		const generateTestData = (modelType) => {
			let model;
			let favModel;
			let wrongTypeModel;
			let wrongModelType;

			if (modelType === modelTypes.CONTAINER) {
				wrongTypeModel = fed;
				model = con;
				favModel = favCon;
				wrongModelType = modelTypes.FEDERATION;
			} else if (modelType === modelTypes.FEDERATION) {
				wrongTypeModel = con;
				model = fed;
				favModel = favFed;
				wrongModelType = modelTypes.CONTAINER;
			} else {
				wrongTypeModel = fed;
				model = draw;
				favModel = favDraw;
				wrongModelType = modelTypes.FEDERATION;
			}

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

		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawings', runTest);
	});
};

const testDeleteFavourites = () => {
	describe('Remove Favourites', () => {
		const { users, teamspace, project, con, fed, draw } = generateBasicData();
		const favFed = { ...ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION }),
			isFavourite: true };
		const favCon = { ...ServiceHelper.generateRandomModel(), isFavourite: true };
		const favDraw = { ...ServiceHelper.generateRandomModel({ modelType: modelTypes.DRAWING }),
			isFavourite: true };

		beforeAll(async () => {
			const models = [con, fed, draw, favFed, favCon, favDraw];
			await setupBasicData(users, teamspace, project, models);
			const favourites = models.flatMap(({ _id, isFavourite }) => (isFavourite ? _id : []));
			await updateOne('admin', 'system.users', { user: users.tsAdmin.user }, {
				$set: {
					[`customData.starredModels.${teamspace}`]: favourites,
				},
			});
		});

		const generateTestData = (modelType) => {
			let model;
			let favModel;
			let wrongTypeModel;
			let wrongModelType;

			if (modelType === modelTypes.CONTAINER) {
				wrongTypeModel = fed;
				model = con;
				favModel = favCon;
				wrongModelType = modelTypes.FEDERATION;
			} else if (modelType === modelTypes.FEDERATION) {
				wrongTypeModel = con;
				model = fed;
				favModel = favFed;
				wrongModelType = modelTypes.CONTAINER;
			} else {
				wrongTypeModel = fed;
				model = draw;
				favModel = favDraw;
				wrongModelType = modelTypes.FEDERATION;
			}

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
		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawings', runTest);
	});
};

const testAddModel = () => {
	describe('Add Model', () => {
		const { users, teamspace, project, con, fed, draw } = generateBasicData();

		beforeAll(async () => {
			const models = [con, fed, draw];
			await setupBasicData(users, teamspace, project, models);
			const favourites = models.flatMap(({ _id, isFavourite }) => (isFavourite ? _id : []));
			await updateOne('admin', 'system.users', { user: users.tsAdmin.user }, {
				$set: {
					[`customData.starredModels.${teamspace}`]: favourites,
				},
			});
		});

		const generateTestData = (modelType) => {
			let wrongModelType;
			let model;
			let wrongTypeModel;

			if (modelType === modelTypes.CONTAINER) {
				wrongTypeModel = fed;
				wrongModelType = modelTypes.FEDERATION;
				model = con;
			} else if (modelType === modelTypes.FEDERATION) {
				wrongTypeModel = con;
				wrongModelType = modelTypes.CONTAINER;
				model = fed;
			} else {
				wrongTypeModel = fed;
				wrongModelType = modelTypes.FEDERATION;
				model = draw;
			}

			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s${key ? `?key=${key}` : ''}`;

			const generatePayload = (name = ServiceHelper.generateRandomString()) => ({
				name,
				number: modelType === modelTypes.DRAWING ? ServiceHelper.generateRandomString() : undefined,
				unit: modelType === modelTypes.DRAWING ? undefined : 'mm',
				calibration: modelType === modelTypes.DRAWING ? { verticalRange: [0, 5], units: 'mm' } : undefined,
				type: modelType === modelTypes.FEDERATION ? undefined : ServiceHelper.generateRandomString(),
			});

			return [
				['the user does not have a valid session', getRoute({ key: null }), false, generatePayload(), templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, generatePayload(), templates.teamspaceNotFound],
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, generatePayload(), templates.projectNotFound],
				['the user is not a project admin', getRoute({ key: users.noProjectAccess.apiKey }), false, generatePayload(), templates.notAuthorized],
				[`the name has been taken by another ${modelType}`, getRoute(), false, generatePayload(model.name), templates.invalidArguments],
				[`the name has been taken by another ${modelType} (case insensitive)`, getRoute(), false, generatePayload(model.name.toUpperCase()), templates.invalidArguments],
				[`the name has been taken by a ${wrongModelType}`, getRoute(), false, generatePayload(wrongTypeModel.name), templates.invalidArguments],
				[`the name has been taken by a ${wrongModelType} (case insensitive)`, getRoute(), false, generatePayload(wrongTypeModel.name.toUpperCase()), templates.invalidArguments],
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
		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawings', runTest);
	});
};

const testDeleteModel = () => {
	describe('Delete Model', () => {
		const { users, teamspace, project, con, fed, draw } = generateBasicData();
		const conIsSubModel = ServiceHelper.generateRandomModel();
		const fedOfSubModelCon = ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION });

		fedOfSubModelCon.properties.subModels = [{ _id: conIsSubModel._id }];

		beforeAll(async () => {
			const models = [con, fed, conIsSubModel, fedOfSubModelCon, draw];
			await setupBasicData(users, teamspace, project, models);
			const favourites = models.flatMap(({ _id, isFavourite }) => (isFavourite ? _id : []));
			await updateOne('admin', 'system.users', { user: users.tsAdmin.user }, {
				$set: {
					[`customData.starredModels.${teamspace}`]: favourites,
				},
			});
		});

		const generateTestData = (modelType) => {
			let model;
			let wrongTypeModel;
			let modelNotFound;

			if (modelType === modelTypes.CONTAINER) {
				wrongTypeModel = fed;
				model = con;
				modelNotFound = templates.containerNotFound;
			} else if (modelType === modelTypes.FEDERATION) {
				wrongTypeModel = con;
				model = fed;
				modelNotFound = templates.federationNotFound;
			} else {
				wrongTypeModel = fed;
				model = draw;
				modelNotFound = templates.drawingNotFound;
			}

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
				...(modelType !== modelTypes.CONTAINER ? [] : [
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

		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawings', runTest);
	});
};

const testUpdateModelSettings = () => {
	describe('Update Settings', () => {
		const { users, teamspace, project, con, fed, draw } = generateBasicData();
		const conIsSubModel = ServiceHelper.generateRandomModel();
		const fedOfSubModelCon = ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION });

		fedOfSubModelCon.properties.subModels = [{ _id: conIsSubModel._id }];

		fed.legend = { _id: ServiceHelper.generateUUID() };
		con.legend = { _id: ServiceHelper.generateUUID() };
		fed.view = { _id: ServiceHelper.generateUUID() };
		con.view = { _id: ServiceHelper.generateUUID() };

		beforeAll(async () => {
			const models = [con, fed, conIsSubModel, fedOfSubModelCon, draw];
			await setupBasicData(users, teamspace, project, models);

			await Promise.all([
				ServiceHelper.db.createViews(teamspace, fed._id, [fed.view]),
				ServiceHelper.db.createLegends(teamspace, fed._id, [fed.legend]),
				ServiceHelper.db.createViews(teamspace, con._id, [con.view]),
				ServiceHelper.db.createLegends(teamspace, con._id, [con.legend]),
			]);
		});

		const generateTestData = (modelType) => {
			let model;
			let wrongTypeModel;
			let modelNotFound;

			if (modelType === modelTypes.CONTAINER) {
				wrongTypeModel = fed;
				model = con;
				modelNotFound = templates.containerNotFound;
			} else if (modelType === modelTypes.FEDERATION) {
				wrongTypeModel = con;
				model = fed;
				modelNotFound = templates.federationNotFound;
			} else {
				wrongTypeModel = fed;
				model = draw;
				modelNotFound = templates.drawingNotFound;
			}

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
				['the user is trying to toggle federate', getRoute(), false, { federate: modelType !== modelTypes.FEDERATION }, templates.invalidArguments],
				['the payload is valid', getRoute(), true, dummyPayload],
				...(modelType !== modelTypes.DRAWING ? [
					['the defaultView is not recognised', getRoute(), false, { defaultView: ServiceHelper.generateRandomString() }, templates.invalidArguments],
					['the defaultView is set to a valid view', getRoute(), true, { defaultView: UUIDToString(model.view._id) }],
					['the defaultLegend is not recognised', getRoute(), false, { defaultLegend: ServiceHelper.generateRandomString() }, templates.invalidArguments],
					['the defaultLegend is set to a valid legend', getRoute(), true, { defaultLegend: UUIDToString(model.legend._id) }],
					['the defaultView is set to null', getRoute(), true, { defaultView: null }],
					['the defaultLegend is set to null', getRoute(), true, { defaultLegend: null }],
					['the code and units are updated', getRoute(), true, { code: ServiceHelper.generateRandomString(), unit: 'm' }],
					['the code is unset and units are updated', getRoute(), true, { code: null, unit: 'm' }],
				] : []),
				...(modelType === modelTypes.FEDERATION ? [
					['the user tries to edit submodel array', getRoute(), false, { subModels: [con._id] }, templates.invalidArguments],
				] : []),
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

		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawings', runTest);
	});
};

const testGetSettings = () => {
	describe('Get Model Settings', () => {
		const { users, teamspace, project, con, fed, draw } = generateBasicData();

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

		const fed2 = ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION });
		const con2 = ServiceHelper.generateRandomModel();
		const draw2 = ServiceHelper.generateRandomModel({ modelType: modelTypes.DRAWING });

		beforeAll(async () => {
			const models = [con, fed, draw, fed2, con2, draw2];
			await setupBasicData(users, teamspace, project, models);
		});

		const generateTestData = (modelType) => {
			let model;
			let model2;
			let wrongTypeModel;
			let modelNotFound;

			if (modelType === modelTypes.CONTAINER) {
				model = con;
				model2 = con2;
				wrongTypeModel = fed;
				modelNotFound = templates.containerNotFound;
			} else if (modelType === modelTypes.FEDERATION) {
				model = fed;
				model2 = fed2;
				wrongTypeModel = con;
				modelNotFound = templates.federationNotFound;
			} else {
				model = draw;
				model2 = draw2;
				wrongTypeModel = con;
				modelNotFound = templates.drawingNotFound;
			}

			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = model._id,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}${key ? `?key=${key}` : ''}`;

			return [
				['the user does not have a valid session', modelType, getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', modelType, getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the project does not exist', modelType, getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				[`the ${modelType} does not exist`, modelType, getRoute({ modelId: ServiceHelper.generateRandomString() }), false, modelNotFound],
				[`the model is not a ${modelType}`, modelType, getRoute({ modelId: wrongTypeModel._id }), false, modelNotFound],
				[`the user does not have access to the ${modelType}`, modelType, getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
				['the model exists and the user has access', modelType, getRoute(), true, model],
				['the model exists and the user has access (2)', modelType, getRoute({ modelId: model2._id }), true, model2],
			];
		};

		const formatToSettings = (settings, modelType) => ({
			_id: settings._id,
			name: settings.name,
			desc: settings.properties.desc,
			type: settings.properties.type,
			...(modelType === modelTypes.DRAWING ? {
				number: settings.properties.number,
				calibration: settings.properties.calibration,
			} : {
				code: settings.properties.properties.code,
				unit: settings.properties.properties.unit,
				defaultView: settings.properties.defaultView
					? UUIDToString(settings.properties.defaultView) : undefined,
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
			}),
		});

		const runTest = (desc, modelType, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(res.body)
						.toEqual(formatToSettings(expectedOutput, modelType));
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawings', runTest);
	});
};

const testGetThumbnail = () => {
	describe('Get drawing thumbnail', () => {
		const { users, teamspace, project, draw, fed } = generateBasicData();
		const drawNoRev = ServiceHelper.generateRandomModel({ modelType: modelTypes.DRAWING });

		beforeAll(async () => {
			const models = [draw, drawNoRev, fed];
			await setupBasicData(users, teamspace, project, models);
			await addRevision(teamspace, project, draw, modelTypes.DRAWING, true);
		});

		const generateTestData = () => {
			const model = draw;
			const wrongTypeModel = fed;
			const modelNotFound = templates.drawingNotFound;

			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = model._id,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/drawings/${modelId}/thumbnail${key ? `?key=${key}` : ''}`;

			return [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				['the user does not have access to the drawing', getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
				['the drawing does not exist', getRoute({ modelId: ServiceHelper.generateRandomString() }), false, modelNotFound],
				['the model is not a drawing', getRoute({ modelId: wrongTypeModel._id }), false, modelNotFound],
				['the drawing has a thumbnail and user has access', getRoute(), true, model],
				['the drawing does not have a thumbnail and user has access', getRoute({ modelId: drawNoRev._id }), false, templates.fileNotFound],
			];
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(res.body.toString()).toEqual(
						expectedOutput.files[expectedOutput.files.length - 1].thumbnailData);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData())('Drawings', runTest);
	});
};

const testGetUsersWithPermissions = () => {
	describe('Get users with permissions', () => {
		const { users, teamspace, project, con, fed, draw } = generateBasicData();

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed, draw]);
		});

		const generateTestData = (modelType) => {
			let model;
			let wrongTypeModel;
			let modelNotFound;

			if (modelType === modelTypes.CONTAINER) {
				model = con;
				wrongTypeModel = fed;
				modelNotFound = templates.containerNotFound;
			} else if (modelType === modelTypes.FEDERATION) {
				model = fed;
				wrongTypeModel = con;
				modelNotFound = templates.federationNotFound;
			} else {
				model = draw;
				wrongTypeModel = con;
				modelNotFound = templates.drawingNotFound;
			}

			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = model._id,
				excludeViewers,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/members${key ? `?key=${key}${excludeViewers ? '&excludeViewers=true' : ''}` : ''}`;

			return [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				['the user does not have access to the model', getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
				['the model does not exist', getRoute({ modelId: ServiceHelper.generateRandomString() }), false, modelNotFound],
				['the model is of wrong type', getRoute({ modelId: wrongTypeModel._id }), false, modelNotFound],
				['excludeViewers is set to false', getRoute(), true, { users: [teamspace, users.tsAdmin.user, users.projectAdmin.user, users.viewer.user, users.commenter.user, users.collaborator.user] }],
				['excludeViewers is set to true', getRoute({ excludeViewers: true }), true, { users: [teamspace, users.tsAdmin.user, users.projectAdmin.user, users.commenter.user, users.collaborator.user] }],
			];
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(res.body).toEqual(expectedOutput);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawing', runTest);
	});
};

const testGetJobsWithAccess = () => {
	describe('Get jobs with access', () => {
		const { users, teamspace, project, con, fed, draw, jobs } = generateBasicData();

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed, draw], jobs);
			await ServiceHelper.db.createJobs(teamspace, jobs);
		});

		const generateTestData = (modelType) => {
			let model;
			let wrongTypeModel;
			let modelNotFound;

			if (modelType === modelTypes.CONTAINER) {
				model = con;
				wrongTypeModel = fed;
				modelNotFound = templates.containerNotFound;
			} else if (modelType === modelTypes.FEDERATION) {
				model = fed;
				wrongTypeModel = con;
				modelNotFound = templates.federationNotFound;
			} else {
				model = draw;
				wrongTypeModel = con;
				modelNotFound = templates.drawingNotFound;
			}

			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = model._id,
				excludeViewers,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/jobs${key ? `?key=${key}${excludeViewers ? '&excludeViewers=true' : ''}` : ''}`;

			return [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				['the user does not have access to the model', getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
				['the model does not exist', getRoute({ modelId: ServiceHelper.generateRandomString() }), false, modelNotFound],
				['the model is of wrong type', getRoute({ modelId: wrongTypeModel._id }), false, modelNotFound],
				['excludeViewers is set to false', getRoute(), true, { jobs: ['Admin', ...jobs.map(({ _id }) => _id)] }],
				['excludeViewers is set to true', getRoute({ excludeViewers: true }), true, { jobs: ['Admin', ...jobs.slice(1).map(({ _id }) => _id)] }],
			];
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(res.body).toEqual(expectedOutput);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawing', runTest);
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
	testGetThumbnail();
	testGetUsersWithPermissions();
	testGetJobsWithAccess();
});
