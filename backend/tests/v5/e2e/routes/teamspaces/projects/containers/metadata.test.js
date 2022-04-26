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

const SuperTest = require('supertest');
const ServiceHelper = require('../../../../../helper/services');
const { src } = require('../../../../../helper/path');

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const users = {
	tsAdmin: ServiceHelper.generateUserCredentials(),
	viewer: ServiceHelper.generateUserCredentials(),
};
const nobody = ServiceHelper.generateUserCredentials();
const teamspace = ServiceHelper.generateRandomString();

const project = {
	_id: ServiceHelper.generateUUIDString(),
	name: ServiceHelper.generateRandomString(),
};

const models = [
	ServiceHelper.generateRandomModel({ viewers: [users.viewer] }),
	ServiceHelper.generateRandomModel({ isFederation: true }),
	ServiceHelper.generateRandomModel(),
];
const container = models[0];
const federation = models[1];

const metadata = {
	_id: ServiceHelper.generateUUIDString(),
	metadata: [
		{ key: ServiceHelper.generateRandomString(), value: ServiceHelper.generateRandomString() },
		{ key: ServiceHelper.generateRandomString(), value: ServiceHelper.generateRandomString(), custom: true },
		{ key: ServiceHelper.generateRandomString(), value: ServiceHelper.generateRandomString(), custom: true },
	]
} 

const nonCustomMetadata = metadata.metadata[0];
const customMetadata = metadata.metadata[1];
const metadataToDelete = metadata.metadata[2];

const setupData = async () => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], [teamspace]));
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
		ServiceHelper.db.createProject(teamspace, project._id, project.name, models.map((m) => m._id)),
		ServiceHelper.db.createMetadata(teamspace, container._id, metadata._id, metadata.metadata),
	]);
};

const testUpdateCustomMetadata = () => {
	const createRoute = (projectId = project._id, containerId = container._id, metadataId = metadata._id) => 
		`/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/metadata/${metadataId}`;

	const routeV4 = `/${teamspace}/${container._id}/meta/${metadata._id}.json`;

	describe('Update Metadata', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.patch(createRoute()).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.patch(`${createRoute()}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.patch(`${createRoute(ServiceHelper.generateRandomString())}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the container does not exist', async () => {
			const res = await agent.patch(`${createRoute(project._id, ServiceHelper.generateRandomString())}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.containerNotFound.status);
			expect(res.body.status).toEqual(templates.containerNotFound.status);
		});

		test('should fail if the container is a federation', async () => {
			const res = await agent.patch(`${createRoute(project._id, federation._id)}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.containerNotFound.status);
			expect(res.body.status).toEqual(templates.containerNotFound.status);
		});

		test('should fail if the metadata does not exist', async () => {
			const res = await agent.patch(`${createRoute(project._id, container._id, ServiceHelper.generateRandomString())}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.metadataNotFound.status);
			expect(res.body.status).toEqual(templates.metadataNotFound.status);
		});

		test('should fail if the user does not have permissions to access the container', async () => {
			const res = await agent.patch(`${createRoute()}?key=${users.viewer.apiKey}`)
				.expect(templates.notAuthorized.status);
			expect(res.body.status).toEqual(templates.notAuthorized.status);
		});

		test('should fail if the user is trying to update non custom metadata', async () => {
			const res = await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({
					metadata: [
						{ key: nonCustomMetadata.key, value: ServiceHelper.generateRandomString() },
						{ key: customMetadata.key, value: ServiceHelper.generateRandomString() },
					],
				}).expect(templates.invalidArguments.status);
			expect(res.body.status).toEqual(templates.invalidArguments.status);
		});

		test('should fail if the user is trying to add metadata with missing value', async () => {
			const res = await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({
					metadata: [{ key: nonCustomMetadata.key }],
				}).expect(templates.invalidArguments.status);
			expect(res.body.status).toEqual(templates.invalidArguments.status);
		});

		test('should add new metadata', async () => {
			const metadataToAdd = {
				key: ServiceHelper.generateRandomString(),
				value: ServiceHelper.generateRandomString() };
			await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`).send({ metadata: [metadataToAdd] })
				.expect(templates.ok.status);

			const updatedMetdata = await agent.get(`${routeV4}?key=${users.tsAdmin.apiKey}`);
			const updatedMetadataObj = updatedMetdata.body.meta[0].metadata;
			const itemAdded = Object.prototype.hasOwnProperty.call(updatedMetadataObj, metadataToAdd.key)
				&& updatedMetadataObj[metadataToAdd.key] === metadataToAdd.value;
			expect(itemAdded).toEqual(true);
		});

		test('should edit metadata', async () => {
			const newMetadataValue = ServiceHelper.generateRandomString();

			await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ metadata: [{ key: customMetadata.key, value: newMetadataValue }] })
				.expect(templates.ok.status);

			const updatedMetdata = await agent.get(`${routeV4}?key=${users.tsAdmin.apiKey}`);
			const updatedMetadataObj = updatedMetdata.body.meta[0].metadata;
			const itemEdited = Object.prototype.hasOwnProperty.call(updatedMetadataObj, customMetadata.key)
				&& updatedMetadataObj[customMetadata.key] === newMetadataValue;
			expect(itemEdited).toEqual(true);
		});

		test('should delete metadata', async () => {
			const metadataBackup = { ...metadataToDelete };
			await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ metadata: [{ key: metadataToDelete.key, value: null }] })
				.expect(templates.ok.status);

			const updatedMetdata = await agent.get(`${routeV4}?key=${users.tsAdmin.apiKey}`);
			const updatedMetadataObj = updatedMetdata.body.meta[0].metadata;
			const itemRemoved = !Object.prototype.hasOwnProperty.call(updatedMetadataObj, metadataToDelete.key);
			expect(itemRemoved).toEqual(true);

			// add the deleted metadata again
			await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ metadata: [{ key: metadataBackup.key, value: metadataBackup.value }] });
		});

		test('should add, edit and delete metadata', async () => {
			const metadataBackup = { ...metadataToDelete };
			const metadataToAdd = {
				key: ServiceHelper.generateRandomString(),
				value: ServiceHelper.generateRandomString(),
			};
			const metadataToEdit = { key: customMetadata.key, value: ServiceHelper.generateRandomString() };
			await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({
					metadata: [
						{ key: metadataToDelete.key, value: null },
						metadataToEdit,
						metadataToAdd,
					],
				})
				.expect(templates.ok.status);

			const updatedMetadata = await agent.get(`${routeV4}?key=${users.tsAdmin.apiKey}`);
			const updatedMetadataObj = updatedMetadata.body.meta[0].metadata;

			const itemsUpdated = !Object.prototype.hasOwnProperty.call(updatedMetadataObj, metadataToDelete.key)
				&& Object.prototype.hasOwnProperty.call(updatedMetadataObj, metadataToEdit.key)
				&& updatedMetadataObj[metadataToEdit.key] === metadataToEdit.value
				&& Object.prototype.hasOwnProperty.call(updatedMetadataObj, metadataToAdd.key)
				&& updatedMetadataObj[metadataToAdd.key] === metadataToAdd.value;
			expect(itemsUpdated).toEqual(true);

			// add the deleted metadata again
			await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ metadata: [{ key: metadataBackup.key, value: metadataBackup.value }] });
		});
	});
};

describe('E2E routes/teamspaces/projects/containers/metadata', () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testUpdateCustomMetadata();
});
