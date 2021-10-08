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

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const users = {
	tsAdmin: ServiceHelper.generateUserCredentials(),
	noProjectAccess: ServiceHelper.generateUserCredentials(),
};

const nobody = ServiceHelper.generateUserCredentials();

const teamspace = ServiceHelper.generateRandomString();

const project = {
	id: ServiceHelper.generateUUIDString(),
	name: ServiceHelper.generateRandomString(),
};

const modelWithRevId = ServiceHelper.generateUUIDString();
const modelWithoutRevId = ServiceHelper.generateUUIDString();

const modelSettings = [
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		isFavourite: true,
		properties: { ...ServiceHelper.generateRandomModelProperties(),
			federate: true,
			subModels: [{ model: modelWithRevId }] },
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: { ...ServiceHelper.generateRandomModelProperties(),
			federate: true,
			subModels: [{ model: modelWithoutRevId }] },
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: { ...ServiceHelper.generateRandomModelProperties(), federate: true },
	},
	{
		_id: modelWithRevId,
		name: ServiceHelper.generateRandomString(),
		properties: ServiceHelper.generateRandomModelProperties(),
	},
	{
		_id: modelWithoutRevId,
		name: ServiceHelper.generateRandomString(),
		properties: ServiceHelper.generateRandomModelProperties(),
	},
];

const issues = [
	{
		_id: ServiceHelper.generateUUIDString(),
		name: 'issue1',
		status: 'open',
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: 'issue2',
		status: 'closed',
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: 'issue3',
		status: 'in progress',
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: 'issue3',
		status: 'void',
	},
];

const risks = [
	{
		_id: ServiceHelper.generateUUIDString(),
		name: 'risk1',
		mitigation_status: 'unmitigated',
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: 'risk2',
		mitigation_status: 'proposed',
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: 'risk3',
		mitigation_status: 'void',
	},
];

const getUnresolvedIssues = (issuesList) => issuesList.filter((i) => i.status !== 'void' && i.status !== 'closed');

const getUnresolvedRisks = (risksList) => risksList.filter((i) => i.mitigation_status !== 'void' && i.mitigation_status !== 'agreed_fully'
		&& i.mitigation_status !== 'rejected');

const container = modelSettings.find(({ properties }) => !properties.federate);

const revisions = [
	ServiceHelper.generateRevisionEntry(),
	ServiceHelper.generateRevisionEntry(),
	ServiceHelper.generateRevisionEntry(true),
];

const federationWithRev = modelSettings[0];
const federationWithoutRev = modelSettings[1];
const federationWithoutSubModels = modelSettings[2];
const federationWithRevIssues = [issues[0], issues[1]];
const federationWithRevRisks = [risks[0], risks[1]];
const federationWithoutRevIssues = [issues[2]];
const federationWithoutRevRisks = [risks[2]];

const latestRevision = revisions.filter((rev) => !rev.void)
	.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));

const setupData = async () => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);
	const customData = { starredModels: {
		[teamspace]: modelSettings.flatMap(({ _id, isFavourite }) => (isFavourite ? _id : [])),
	} };
	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], [teamspace], customData));
	const modelProms = modelSettings.map((model) => ServiceHelper.db.createModel(
		teamspace,
		model._id,
		model.name,
		model.properties,
	));
	const federationWithRevIssueProms = federationWithRevIssues.map((issue) => ServiceHelper.db.createIssue(
		teamspace,
		federationWithRev._id,
		issue,
	));
	const federationWithRevRiskProms = federationWithRevRisks.map((risk) => ServiceHelper.db.createRisk(
		teamspace,
		federationWithRev._id,
		risk,
	));
	const federationWithoutRevIssueProms = federationWithoutRevIssues.map((issue) => ServiceHelper.db.createIssue(
		teamspace,
		federationWithoutRev._id,
		issue,
	));
	const federationWithoutRevRiskProms = federationWithoutRevRisks.map((risk) => ServiceHelper.db.createRisk(
		teamspace,
		federationWithoutRev._id,
		risk,
	));

	return Promise.all([
		...userProms,
		...modelProms,
		...federationWithRevIssueProms,
		...federationWithRevRiskProms,
		...federationWithoutRevIssueProms,
		...federationWithoutRevRiskProms,
		ServiceHelper.db.createUser(nobody),
		ServiceHelper.db.createProject(teamspace, project.id, project.name, modelSettings.map(({ _id }) => _id)),
		...revisions.map((revision) => ServiceHelper.db.createRevision(teamspace, modelWithRevId, revision)),
	]);
};

const testGetFederationList = () => {
	const route = `/v5/teamspaces/${teamspace}/projects/${project.id}/federations`;
	describe('Get federation list', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.get(route).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.get(`${route}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.get(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/federations?key=${users.tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should return empty array if the user has no access to any of the federations', async () => {
			const res = await agent.get(`${route}?key=${users.noProjectAccess.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual({ federations: [] });
		});

		test('should return the list of federations if the user has access', async () => {
			const res = await agent.get(`${route}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual({
				federations: modelSettings.flatMap(({ _id, name, properties, isFavourite }) => (properties?.federate
					? { _id, name, role: 'admin', isFavourite: !!isFavourite } : [])),
			});
		});
	});
};

const formatToStats = (federation, issueCount, riskCount, latestRev) => {
	const formattedStats = {
		code: federation.properties.properties.code,
		status: federation.properties.status,
		subModels: federation.properties.subModels
			? federation.properties.subModels.map(({ model }) => model) : undefined,
		lastUpdated: latestRev ? latestRev.getTime() : undefined,
		tickets: {
			issues: issueCount,
			risks: riskCount,
		},
	};

	return formattedStats;
};

const testGetFederationStats = () => {
	const route = (federationId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/federations/${federationId}/stats`;
	describe('Get federation stats', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.get(route(federationWithRev._id)).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.get(`${route(federationWithRev._id)}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.get(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/federations/${federationWithRev._id}/stats?key=${users.tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the user does not have access to the federation', async () => {
			const res = await agent.get(`${route(federationWithRev._id)}?key=${users.noProjectAccess.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the federation does not exist', async () => {
			const res = await agent.get(`${route('jibberish')}?key=${users.tsAdmin.apiKey}`).expect(templates.federationNotFound.status);
			expect(res.body.code).toEqual(templates.federationNotFound.code);
		});

		test('should return the federation stats correctly if the user has access (subModels with revisions)', async () => {
			const res = await agent.get(`${route(federationWithRev._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual(formatToStats(federationWithRev,
				getUnresolvedIssues(federationWithRevIssues).length,
				getUnresolvedRisks(federationWithRevRisks).length, latestRevision.timestamp));
		});

		test('should return the federation stats correctly if the user has access (subModels without revisions)', async () => {
			const res = await agent.get(`${route(federationWithoutRev._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual(formatToStats(federationWithoutRev,
				getUnresolvedIssues(federationWithoutRevIssues).length,
				getUnresolvedRisks(federationWithoutRevRisks).length));
		});

		test('should return the federation stats correctly if the user has access (no subModels)', async () => {
			const res = await agent.get(`${route(federationWithoutSubModels._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual(formatToStats(federationWithoutSubModels, 0, 0));
		});
	});
};

const testAppendFavourites = () => {
	const route = `/v5/teamspaces/${teamspace}/projects/${project.id}/federations/favourites`;
	describe('Append Favourite Federations', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.patch(route)
				.expect(templates.notLoggedIn.status).send({ federations: [modelSettings[1]._id] });
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.patch(`${route}?key=${nobody.apiKey}`)
				.expect(templates.teamspaceNotFound.status).send({ federations: [modelSettings[1]._id] });
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.patch(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/federations/favourites?key=${users.tsAdmin.apiKey}`)
				.expect(templates.projectNotFound.status).send({ federations: [modelSettings[1]._id] });
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the user has no access to one or more federations', async () => {
			const res = await agent.patch(`${route}?key=${users.noProjectAccess.apiKey}`)
				.expect(templates.invalidArguments.status).send({ federations: [modelSettings[1]._id] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the favourites list provided has a container', async () => {
			const res = await agent.patch(`${route}?key=${users.noProjectAccess.apiKey}`)
				.expect(templates.invalidArguments.status).send({ federations: [container._id] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the favourites list provided is empty', async () => {
			const res = await agent.patch(`${route}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.invalidArguments.status).send({ federations: [] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should append a new federation to the user favourites', async () => {
			await agent.patch(`${route}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.ok.status).send({ federations: [modelSettings[1]._id] });
		});
	});
};

const testDeleteFavourites = () => {
	const route = `/v5/teamspaces/${teamspace}/projects/${project.id}/federations/favourites`;
	describe('Remove Favourite Federations', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.delete(route)
				.expect(templates.notLoggedIn.status).send({ federations: [modelSettings[0]._id] });
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.delete(`${route}?key=${nobody.apiKey}`)
				.expect(templates.teamspaceNotFound.status).send({ federations: [modelSettings[0]._id] });
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.delete(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/federations/favourites?key=${users.tsAdmin.apiKey}`)
				.expect(templates.projectNotFound.status).send({ federations: [modelSettings[0]._id] });
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the user has no access to one or more federations', async () => {
			const res = await agent.delete(`${route}?key=${users.noProjectAccess.apiKey}`)
				.expect(templates.invalidArguments.status).send({ federations: [modelSettings[1]._id] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the favourites list provided has a container', async () => {
			const res = await agent.delete(`${route}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.invalidArguments.status).send({ federations: [container._id] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the favourites list provided is empty', async () => {
			const res = await agent.delete(`${route}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.invalidArguments.status).send({ federations: [] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should remove a federation from the user favourites', async () => {
			await agent.delete(`${route}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.ok.status).send({ federations: [modelSettings[0]._id] });
		});
	});
};

describe('E2E routes/teamspaces/projects/federations', () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testGetFederationList();
	testGetFederationStats();
	testAppendFavourites();
	testDeleteFavourites();
});
