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
const ServiceHelper = require('../../../../../../helper/services');
const { src, objModel, objModelUppercaseExt } = require('../../../../../../helper/path');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const users = {
	tsAdmin: ServiceHelper.generateUserCredentials(),
	noProjectAccess: ServiceHelper.generateUserCredentials(),
	viewer: ServiceHelper.generateUserCredentials(),
	commenter: ServiceHelper.generateUserCredentials(),
};

const nobody = ServiceHelper.generateUserCredentials();

const teamspace = ServiceHelper.generateRandomString();

const project = {
	id: ServiceHelper.generateUUIDString(),
	name: ServiceHelper.generateRandomString(),
};

const models = [
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		isFavourite: true,
		properties: {
			...ServiceHelper.generateRandomModelProperties(),
			permissions: [{ user: users.viewer.user, permission: 'viewer' }, { user: users.commenter.user, permission: 'commenter' }],
		},
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: ServiceHelper.generateRandomModelProperties(),
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: { ...ServiceHelper.generateRandomModelProperties(modelTypes.FEDERATION) },
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: { ...ServiceHelper.generateRandomModelProperties(), status: 'queued' },
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: { ...ServiceHelper.generateRandomModelProperties(), status: 'processing' },
	},
];

const revisions = [
	ServiceHelper.generateRevisionEntry(),
	ServiceHelper.generateRevisionEntry(false, false),
	ServiceHelper.generateRevisionEntry(true),
	ServiceHelper.generateRevisionEntry(),
];

const modelWithRev = models[0];
const federation = models[2];
const queuedStatusModel = models[3];
const processingStatusModel = models[4];
const noFileRevision = revisions[1];
const validRefTypeRevision = revisions[0];
const voidRevision = revisions[2];

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
	]);
};

const formatRevisions = (revs, includeVoid = false) => {
	const formattedRevisions = revs
		.sort((a, b) => b.timestamp - a.timestamp)
		.flatMap((rev) => (includeVoid || !rev.void ? {
			_id: rev._id,
			tag: rev.tag,
			author: rev.author,
			void: rev.void,
			timestamp: rev.timestamp.getTime(),
			...(!rev.rFile ? {} : { format: '.'.concat(rev.rFile[0].split('_').pop()) }),
			desc: rev.desc,
		} : []));
	return { revisions: formattedRevisions };
};

const testGetRevisions = () => {
	const route = (containerId, showVoid = false, ts = teamspace) => `/v5/teamspaces/${ts}/projects/${project.id}/containers/${containerId}/revisions?showVoid=${showVoid}`;
	describe('Get container revisions', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.get(route(modelWithRev._id, false)).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.get(`${route(modelWithRev._id)}&key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.get(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/containers/${modelWithRev._id}/revisions?key=${users.tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the container does not exist', async () => {
			const res = await agent.get(`${route('jibberish')}&key=${users.tsAdmin.apiKey}`).expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});

		test('should fail if the user does not have access to the container', async () => {
			const res = await agent.get(`${route(modelWithRev._id)}&key=${users.noProjectAccess.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should return non void container revisions correctly if the user has access', async () => {
			const res = await agent.get(`${route(modelWithRev._id)}&key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual(formatRevisions(revisions));
		});

		test('should return all container revisions correctly if the user has access', async () => {
			const res = await agent.get(`${route(modelWithRev._id, true)}&key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual(formatRevisions(revisions, true));
		});
	});
};

const testUpdateRevisionStatus = () => {
	const route = (revision) => `/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${modelWithRev._id}/revisions/${revision}`;
	describe('Update a revision status', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.patch(route(voidRevision._id))
				.send({ void: false }).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.patch(`${route(voidRevision._id)}?key=${nobody.apiKey}`)
				.send({ void: false }).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the user does not have access to the project', async () => {
			const res = await agent.patch(`${route(voidRevision._id)}?key=${users.noProjectAccess.apiKey}`)
				.send({ void: false }).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the user does not have adequate permissions to edit the container (viewer)', async () => {
			const res = await agent.patch(`${route(voidRevision._id)}?key=${users.viewer.apiKey}`)
				.send({ void: false }).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the user does not have adequate permissions to edit the container (commenter)', async () => {
			const res = await agent.patch(`${route(voidRevision._id)}?key=${users.commenter.apiKey}`)
				.send({ void: false }).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.patch(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/containers/${modelWithRev._id}/revisions/${voidRevision._id}?key=${users.tsAdmin.apiKey}`)
				.send({ void: false }).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the container does not exist', async () => {
			const res = await agent.patch(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/dfsfaewfc/revisions/${voidRevision._id}?key=${users.tsAdmin.apiKey}`)
				.send({ void: false }).expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});

		test('should fail if the revision does not exist', async () => {
			const res = await agent.patch(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${modelWithRev._id}/revisions/fdefaxsxsa?key=${users.tsAdmin.apiKey}`)
				.send({ void: false }).expect(templates.revisionNotFound.status);
			expect(res.body.code).toEqual(templates.revisionNotFound.code);
		});

		test('should return error if the body of the request is not boolean', async () => {
			const res = await agent.patch(`${route(voidRevision._id)}?key=${users.tsAdmin.apiKey}`)
				.send({ void: 123 }).expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should return error if the body of the request contains extra data', async () => {
			const res = await agent.patch(`${route(voidRevision._id)}?key=${users.tsAdmin.apiKey}`)
				.send({ void: true, extra: 123 }).expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should update a revision\'s status if the body of the request is boolean', async () => {
			await agent.patch(`${route(voidRevision._id)}?key=${users.tsAdmin.apiKey}`)
				.send({ void: false }).expect(templates.ok.status);

			const revs = await agent.get(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${modelWithRev._id}/revisions?key=${users.tsAdmin.apiKey}`);
			expect(revs.body.revisions.find((r) => r._id === voidRevision._id).void).toBe(false);
		});
	});
};

const testNewRevision = () => {
	const route = (
		ts = teamspace,
		projectId = project.id,
		model = modelWithRev._id,
	) => `/v5/teamspaces/${ts}/projects/${projectId}/containers/${model}/revisions`;
	describe('New model upload', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.post(route()).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.post(`${route()}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});
		test('should fail if the user does not have access to the project', async () => {
			const res = await agent.post(`${route()}?key=${users.noProjectAccess.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the user is a viewer', async () => {
			const res = await agent.post(`${route()}?key=${users.viewer.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the user is a commenter', async () => {
			const res = await agent.post(`${route()}?key=${users.commenter.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.post(`${route(teamspace, 'nelskfjdlsf')}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the container does not exist', async () => {
			const res = await agent.post(`${route(teamspace, project.id, 'sdlfkds')}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});

		test('should fail if the container is actually a federation', async () => {
			const res = await agent.post(`${route(teamspace, project.id, federation._id)}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});

		test('should succeed if correct parameters are sent', async () => {
			await agent.post(`${route()}?key=${users.tsAdmin.apiKey}`)
				.set('Content-Type', 'multipart/form-data')
				.field('tag', '123')
				.attach('file', objModel)
				.expect(templates.ok.status);
		});

		test('should succeed if correct parameters are sent and file has uppercase extension', async () => {
			await agent.post(`${route(teamspace, project.id, models[1]._id)}?key=${users.tsAdmin.apiKey}`)
				.set('Content-Type', 'multipart/form-data')
				.field('tag', '123')
				.attach('file', objModelUppercaseExt)
				.expect(templates.ok.status);
		});

		test(`should fail with ${templates.invalidArguments.code} if incorrect parameters are sent`, async () => {
			const res = await agent.post(`${route()}?key=${users.tsAdmin.apiKey}`)
				.set('Content-Type', 'multipart/form-data')
				.attach('file', objModel)
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the file is missing', async () => {
			const res = await agent.post(`${route()}?key=${users.tsAdmin.apiKey}`)
				.set('Content-Type', 'multipart/form-data')
				.field('tag', '123')
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the model status is queued', async () => {
			const res = await agent.post(`${route(teamspace, project.id, queuedStatusModel._id)}?key=${users.tsAdmin.apiKey}`)
				.set('Content-Type', 'multipart/form-data')
				.field('tag', '123')
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the model status is processing', async () => {
			const res = await agent.post(`${route(teamspace, project.id, processingStatusModel._id)}?key=${users.tsAdmin.apiKey}`)
				.set('Content-Type', 'multipart/form-data')
				.field('tag', '123')
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});
	});
};

const testDownloadRevisionFiles = () => {
	const route = (ts, proj, container, revision) => `/v5/teamspaces/${ts}/projects/${proj}/containers/${container}/revisions/${revision}/files`;
	describe('Download revision files', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.get(route(teamspace, project.id, modelWithRev._id, validRefTypeRevision._id))
				.expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.get(`${route(teamspace, project.id, modelWithRev._id, validRefTypeRevision._id)}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.get(`${route(teamspace, 'dflkdsjfs', modelWithRev._id, validRefTypeRevision._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the container does not exist', async () => {
			const res = await agent.get(`${route(teamspace, project.id, 'jibberish', validRefTypeRevision._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});

		test('should fail if the user does not have access to the container', async () => {
			const res = await agent.get(`${route(teamspace, project.id, modelWithRev._id, validRefTypeRevision._id)}?key=${users.noProjectAccess.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the user does not have adequate permissions to the container (viewer)', async () => {
			const res = await agent.get(`${route(teamspace, project.id, modelWithRev._id, validRefTypeRevision._id)}?key=${users.viewer.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the user does not have adequate permissions to the container (commenter)', async () => {
			const res = await agent.get(`${route(teamspace, project.id, modelWithRev._id, validRefTypeRevision._id)}?key=${users.commenter.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if revision is not found', async () => {
			const res = await agent.get(`${route(teamspace, project.id, modelWithRev._id, 'invalid id')}?key=${users.tsAdmin.apiKey}`).expect(templates.revisionNotFound.status);
			expect(res.body.code).toEqual(templates.revisionNotFound.code);
		});

		test('should fail if revision has no file', async () => {
			const res = await agent.get(`${route(teamspace, project.id, modelWithRev._id, noFileRevision._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.fileNotFound.status);
			expect(res.body.code).toEqual(templates.fileNotFound.code);
		});

		test('should download files if there is a valid ref', async () => {
			const res = await agent.get(`${route(teamspace, project.id, modelWithRev._id, validRefTypeRevision._id)}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.ok.status);
			expect(res.text).toEqual(validRefTypeRevision.refData);
		});

		test('should download files if there is a valid ref (using revision tag)', async () => {
			const res = await agent.get(`${route(teamspace, project.id, modelWithRev._id, validRefTypeRevision.tag)}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.ok.status);
			expect(res.text).toEqual(validRefTypeRevision.refData);
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => Promise.all([
		ServiceHelper.queue.purgeQueues(),
		ServiceHelper.closeApp(server),
	]));
	testGetRevisions();
	testUpdateRevisionStatus();
	testNewRevision();
	testDownloadRevisionFiles();
});
