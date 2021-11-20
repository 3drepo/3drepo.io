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

const SuperTest = require('supertest');
const ServiceHelper = require('../../../../../helper/services');
const { src } = require('../../../../../helper/path');

const { isUUIDString } = require(`${src}/utils/helper/typeCheck`);
const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const users = {
	tsAdmin: ServiceHelper.generateUserCredentials(),
	noProjectAccess: ServiceHelper.generateUserCredentials(),
	viewer: ServiceHelper.generateUserCredentials(),
	commenter: ServiceHelper.generateUserCredentials(),
	projectAdmin: ServiceHelper.generateUserCredentials(),
};

const nobody = ServiceHelper.generateUserCredentials();

const teamspace = ServiceHelper.generateRandomString();

const project = {
	id: ServiceHelper.generateUUIDString(),
	name: ServiceHelper.generateRandomString(),
	permissions: [{ user: users.projectAdmin.user, permissions: ['admin_project'] }],
};

const views = [
	{
		_id: ServiceHelper.generateUUIDString(),
	},
	{
		_id: ServiceHelper.generateUUIDString(),
	},
	{
		_id: ServiceHelper.generateUUIDString(),
	},
];

const legends = [
	{
		_id: ServiceHelper.generateUUIDString(),
	},
	{
		_id: ServiceHelper.generateUUIDString(),
	},
	{
		_id: ServiceHelper.generateUUIDString(),
	},
];

const models = [
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		isFavourite: true,
		permissions: [{ user: users.viewer, permission: 'viewer' }, { user: users.commenter, permission: 'commenter' }],
		properties: ServiceHelper.generateRandomModelProperties(),
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: ServiceHelper.generateRandomModelProperties(),
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: { ...ServiceHelper.generateRandomModelProperties(), federate: true },
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(),
			status: 'failed',
			errorReason: {
				message: ServiceHelper.generateRandomString(),
				timestamp: new Date(),
			} },
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: { ...ServiceHelper.generateRandomModelProperties(),
			errorReason: {
				message: ServiceHelper.generateRandomString(),
				errorCode: 1,
			},
		},
	},
	{
		// NOTE: this model gets deleted after deleteContainer test
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		isFavourite: true,
		permissions: [{ user: users.viewer, permission: 'viewer' }, { user: users.commenter, permission: 'commenter' }],
		properties: ServiceHelper.generateRandomModelProperties(),
	},
];

// setup sub model
models[2].properties.subModels = [{ model: models[1]._id, database: teamspace }];

const revisions = [
	ServiceHelper.generateRevisionEntry(),
	ServiceHelper.generateRevisionEntry(),
	ServiceHelper.generateRevisionEntry(true),
];

const modelWithRev = models[0];
const modelWithoutRev = models[1];
const federation = models[2];
const modelWithViews = models[0];
const modelWithLegends = models[0];
const modelWithFailedProcess = models[3];
const modelWithFailedProcess2 = models[4];
const modelToDelete = models[5];

const latestRevision = revisions.filter((rev) => !rev.void)
	.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));

const setupData = async () => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);
	const customData = { starredModels: {
		[teamspace]: models.flatMap(({ _id, isFavourite }) => (isFavourite ? _id : [])),
	} };
	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], [teamspace], customData));
	const modelProms = models.map((model) => ServiceHelper.db.createModel(
		teamspace,
		model._id,
		model.name,
		model.properties,
	));

	return Promise.all([
		...userProms,
		...modelProms,
		ServiceHelper.db.createUser(nobody),
		ServiceHelper.db.createProject(teamspace, project.id, project.name, models.map(({ _id }) => _id)),
		...revisions.map((revision) => ServiceHelper.db.createRevision(teamspace, modelWithRev._id, revision)),
		ServiceHelper.db.createViews(teamspace, modelWithViews._id, views),
		ServiceHelper.db.createLegends(teamspace, modelWithLegends._id, legends),
	]);
};

const testGetContainerList = () => {
	const route = `/v5/teamspaces/${teamspace}/projects/${project.id}/containers`;
	describe('Get container list', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.get(route).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.get(`${route}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.get(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/containers?key=${users.tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should return empty array if the user has no access to any of the containers', async () => {
			const res = await agent.get(`${route}?key=${users.noProjectAccess.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual({ containers: [] });
		});

		test('should return the list of containers if the user has access', async () => {
			const res = await agent.get(`${route}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual({
				containers: models.flatMap(({ _id, name, properties, isFavourite }) => (properties?.federate ? []
					: { _id, name, role: 'admin', isFavourite: !!isFavourite })),
			});
		});
	});
};

const formatToStats = (settings, revCount, latestRev) => {
	const res = {
		type: settings.type,
		code: settings.properties.code,
		status: settings.status,
		units: settings.properties.unit,
		revisions: {
			total: revCount,
			lastUpdated: latestRev.timestamp ? latestRev.timestamp.getTime() : undefined,
			latestRevision: latestRev.tag || latestRev._id,
		},
	};

	if (settings.status === 'failed') {
		res.errorReason = {
			message: settings.errorReason.message,
			timestamp: settings.errorReason.timestamp ? settings.errorReason.timestamp.getTime() : undefined,
		};
	}
	return res;
};

const testGetContainerStats = () => {
	const route = (containerId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${containerId}/stats`;
	describe('Get container stats', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.get(route(modelWithRev._id)).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.get(`${route(modelWithRev._id)}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.get(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/containers/${modelWithRev._id}/stats?key=${users.tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the user does not have access to the container', async () => {
			const res = await agent.get(`${route(modelWithRev._id)}?key=${users.noProjectAccess.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the model is a federation', async () => {
			const res = await agent.get(`${route(federation._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});

		test('should fail if the container does not exist', async () => {
			const res = await agent.get(`${route('jibberish')}?key=${users.tsAdmin.apiKey}`).expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});
		test('should return the container stats correctly if the user has access', async () => {
			const res = await agent.get(`${route(modelWithRev._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			const nonVoidRevisionCount = revisions.filter((rev) => !rev.void).length;
			expect(res.body).toEqual(formatToStats(modelWithRev.properties, nonVoidRevisionCount, latestRevision));
		});

		test('should return the container stats correctly if the user has access (no revisions)', async () => {
			const res = await agent.get(`${route(modelWithoutRev._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual(formatToStats(modelWithoutRev.properties, 0, {}));
		});
		test('should return the container stats correctly if the latest revision process failed', async () => {
			const res = await agent.get(`${route(modelWithFailedProcess._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual(formatToStats(modelWithFailedProcess.properties, 0, {}));
		});

		test('should return the container stats correctly if the latest revision process failed (2)', async () => {
			const res = await agent.get(`${route(modelWithFailedProcess2._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual(formatToStats(modelWithFailedProcess2.properties, 0, {}));
		});
	});
};

const testAddContainer = () => {
	const route = `/v5/teamspaces/${teamspace}/projects/${project.id}/containers`;
	describe('Add container', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.post(route).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.post(`${route}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should return new container ID if the user has permissions', async () => {
			const res = await agent.post(`${route}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status).send({ name: ServiceHelper.generateRandomString(), unit: 'mm', type: 'a' });
			expect(isUUIDString(res.body._id)).toBe(true);

			const getRes = await agent.get(`${route}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);

			expect(getRes.body.containers.find(({ _id }) => _id === res.body._id)).not.toBe(undefined);
		});

		test('should fail if name already exists', async () => {
			const res = await agent.post(`${route}?key=${users.tsAdmin.apiKey}`).expect(templates.invalidArguments.status).send({ name: models[0].name, unit: 'mm', type: 'a' });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if user has insufficient permissions', async () => {
			const res = await agent.post(`${route}?key=${users.viewer.apiKey}`).expect(templates.notAuthorized.status).send({ name: ServiceHelper.generateRandomString(), unit: 'mm', type: 'a' });
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail with invalid payload', async () => {
			const res = await agent.post(`${route}?key=${users.tsAdmin.apiKey}`).expect(templates.invalidArguments.status).send({ name: ServiceHelper.generateRandomString() });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});
	});
};

const testDeleteContainer = () => {
	const route = (containerId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${containerId}`;
	describe('Delete container', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.delete(route(modelToDelete._id)).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.delete(`${route(modelToDelete._id)}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if container does not exist', async () => {
			const res = await agent.delete(`${route('badId')}?key=${users.tsAdmin.apiKey}`).expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});

		test('should return ok on success', async () => {
			const res = await agent.delete(`${route(modelToDelete._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual({});

			const getRes = await agent.get(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(getRes.body.containers.find(({ _id }) => _id === modelToDelete._id)).toBe(undefined);
		});

		test('should fail if container is federation', async () => {
			const res = await agent.delete(`${route(models[2]._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});

		test('should fail if container is submodel', async () => {
			const res = await agent.delete(`${route(models[1]._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.containerIsSubModel.status);
			expect(res.body.code).toEqual(templates.containerIsSubModel.code);
		});

		test('should fail if user lacks permissions', async () => {
			const res = await agent.delete(`${route(models[1]._id)}?key=${users.viewer.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});
	});
};

const testAppendFavourites = () => {
	const route = `/v5/teamspaces/${teamspace}/projects/${project.id}/containers/favourites`;
	describe('Append Favourite Containers', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.patch(route)
				.expect(templates.notLoggedIn.status).send({ containers: [models[1]._id] });
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.patch(`${route}?key=${nobody.apiKey}`)
				.expect(templates.teamspaceNotFound.status).send({ containers: [models[1]._id] });
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.patch(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/containers/favourites?key=${users.tsAdmin.apiKey}`)
				.expect(templates.projectNotFound.status).send({ containers: [models[1]._id] });
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the user has no access to one or more containers', async () => {
			const res = await agent.patch(`${route}?key=${users.noProjectAccess.apiKey}`)
				.expect(templates.invalidArguments.status).send({ containers: [models[1]._id] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the list contains a federation', async () => {
			const res = await agent.patch(`${route}?key=${users.noProjectAccess.apiKey}`)
				.expect(templates.invalidArguments.status).send({ containers: [federation._id] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the favourites list provided is empty', async () => {
			const res = await agent.patch(`${route}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.invalidArguments.status).send({ containers: [] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should append a new container to the user favourites', async () => {
			await agent.patch(`${route}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.ok.status).send({ containers: [models[1]._id] });
		});
	});
};

const testDeleteFavourites = () => {
	const route = `/v5/teamspaces/${teamspace}/projects/${project.id}/containers/favourites`;
	describe('Remove Favourite Containers', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.delete(route)
				.expect(templates.notLoggedIn.status).send({ containers: [models[0]._id] });
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.delete(`${route}?key=${nobody.apiKey}`)
				.expect(templates.teamspaceNotFound.status).send({ containers: [models[0]._id] });
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.delete(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/containers/favourites?key=${users.tsAdmin.apiKey}`)
				.expect(templates.projectNotFound.status).send({ containers: [models[0]._id] });
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the user has no access to one or more containers', async () => {
			const res = await agent.delete(`${route}?key=${users.noProjectAccess.apiKey}`)
				.expect(templates.invalidArguments.status).send({ containers: [models[1]._id] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the list contains a federation', async () => {
			const res = await agent.delete(`${route}?key=${users.noProjectAccess.apiKey}`)
				.expect(templates.invalidArguments.status).send({ containers: [federation._id] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the favourites list provided is empty', async () => {
			const res = await agent.delete(`${route}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.invalidArguments.status).send({ containers: [] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should remove a container from the user favourites', async () => {
			await agent.delete(`${route}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.ok.status).send({ containers: [models[0]._id] });
		});
	});
};

const testUpdateContainerSettings = () => {
	const route = (container) => `/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container}`;
	describe('Update the settings of a container', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.patch(route(modelWithViews._id))
				.send({ name: 'name' }).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.patch(`${route(modelWithViews._id)}?key=${nobody.apiKey}`)
				.send({ name: 'name' }).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the user does not have access to the project', async () => {
			const res = await agent.patch(`${route(modelWithViews._id)}?key=${users.noProjectAccess.apiKey}`)
				.send({ name: 'name' }).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the user does not have adequate permissions to edit the container (viewer)', async () => {
			const res = await agent.patch(`${route(modelWithViews._id)}?key=${users.viewer.apiKey}`)
				.send({ name: 'name' }).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the user does not have adequate permissions to edit the container (commenter)', async () => {
			const res = await agent.patch(`${route(modelWithViews._id)}?key=${users.commenter.apiKey}`)
				.send({ name: 'name' }).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.patch(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/containers/${modelWithViews._id}?key=${users.tsAdmin.apiKey}`)
				.send({ name: 'name' }).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the container does not exist', async () => {
			const res = await agent.patch(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/dfsfaewfc?key=${users.tsAdmin.apiKey}`)
				.send({ name: 'name' }).expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});

		test('should fail if a body param is not of the expected type', async () => {
			const res = await agent.patch(`${route(modelWithViews._id)}?key=${users.tsAdmin.apiKey}`)
				.send({ name: 123 }).expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the body of the request contains extra data', async () => {
			const res = await agent.patch(`${route(modelWithViews._id)}?key=${users.tsAdmin.apiKey}`)
				.send({ name: 'name', extra: 123 }).expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the defaultView is not found', async () => {
			const res = await agent.patch(`${route(modelWithViews._id)}?key=${users.tsAdmin.apiKey}`)
				.send({ name: 'name', defaultView: '374bb150-065f-11ec-8edf-ab0f7cc84da8' }).expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the defaultLegend is not found', async () => {
			const res = await agent.patch(`${route(modelWithViews._id)}?key=${users.tsAdmin.apiKey}`)
				.send({ name: 'name', defaultLegend: '374bb150-065f-11ec-8edf-ab0f7cc84da8' }).expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the a federation Id is passed', async () => {
			const res = await agent.patch(`${route(federation._id)}?key=${users.tsAdmin.apiKey}`)
				.send({ name: 'name' }).expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});

		test('should update a container\'s settings if all the body params have value', async () => {
			const data = {
				name: 'newName',
				desc: 'newDesc',
				surveyPoints: [
					{
						position: [7, 8, 9],
						latLong: [10, 11],
					},
				],
				angleFromNorth: 180,
				type: 'someType',
				unit: 'mm',
				code: 'CODE1',
				defaultView: views[1]._id,
				defaultLegend: legends[1]._id,
			};
			await agent.patch(`${route(modelWithViews._id)}?key=${users.tsAdmin.apiKey}`)
				.send(data).expect(templates.ok.status);
		});

		test('should update a container\'s settings if defaultView is null', async () => {
			const data = {
				name: 'newName',
				desc: 'newDesc',
				surveyPoints: [
					{
						position: [7, 8, 9],
						latLong: [10, 11],
					},
				],
				angleFromNorth: 180,
				type: 'someType',
				unit: 'mm',
				code: 'CODE1',
				defaultView: null,
				defaultLegend: legends[1]._id,
			};
			await agent.patch(`${route(modelWithViews._id)}?key=${users.tsAdmin.apiKey}`)
				.send(data).expect(templates.ok.status);
		});

		test('should update a container\'s settings if defaultLegend is null', async () => {
			const data = {
				name: 'newName',
				desc: 'newDesc',
				surveyPoints: [
					{
						position: [7, 8, 9],
						latLong: [10, 11],
					},
				],
				angleFromNorth: 180,
				type: 'someType',
				unit: 'mm',
				code: 'CODE1',
				defaultView: views[1]._id,
				defaultLegend: null,
			};
			await agent.patch(`${route(modelWithViews._id)}?key=${users.tsAdmin.apiKey}`)
				.send(data).expect(templates.ok.status);
		});

		test('should update a container\'s settings if not all body params are provided', async () => {
			const data = {
				name: 'newName',
				desc: 'newDesc',
			};
			await agent.patch(`${route(modelWithViews._id)}?key=${users.tsAdmin.apiKey}`)
				.send(data).expect(templates.ok.status);
		});
	});
};

const formatToSettings = (settings) => ({
	_id: settings._id,
	name: settings.name,
	desc: settings.properties.desc,
	type: settings.properties.type,
	code: settings.properties.properties.code,
	unit: settings.properties.properties.unit,
	defaultView: settings.properties.defaultView,
	defaultLegend: settings.properties.defaultLegend,
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

const testGetSettings = () => {
	const route = (containerId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${containerId}`;
	describe('Get container settings', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.get(route(models[3]._id)).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.get(`${route(models[3]._id)}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.get(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/containers/${models[3]._id}?key=${users.tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the user does not have access to the container', async () => {
			const res = await agent.get(`${route(models[3]._id)}?key=${users.noProjectAccess.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the model is a federation', async () => {
			const res = await agent.get(`${route(federation._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});

		test('should fail if the container does not exist', async () => {
			const res = await agent.get(`${route('jibberish')}?key=${users.tsAdmin.apiKey}`).expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});

		test('should return the container settings correctly if the user has access', async () => {
			const res = await agent.get(`${route(models[3]._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual(formatToSettings(models[3]));
		});

		test('should return the container settings correctly if the user has access (no timestamp)', async () => {
			const res = await agent.get(`${route(models[4]._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual(formatToSettings(models[4]));
		});
	});
};

describe('E2E routes/teamspaces/projects/containers', () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testGetContainerList();
	testGetContainerStats();
	testAppendFavourites();
	testDeleteFavourites();
	testAddContainer();
	testUpdateContainerSettings();
	testGetSettings();
	testDeleteContainer();
});
