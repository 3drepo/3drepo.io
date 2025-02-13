'use strict';

/**
 *  Copyright (C) 2019 3D Repo Ltd
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

const { loginUsers } = require('../helpers/users.js');
const { AssertionError, expect } = require('chai');
const { INVALID_MODEL_ID, INVALID_MODEL_PERMISSION, INVALID_PROJECT_ID,
	LICENCE_LIMIT_REACHED, NOT_AUTHORIZED, ROLE_NOT_FOUND,
	USER_ALREADY_EXISTS } = require('../../../src/v4/response_codes.js');

const STRONG_PASSWORD = 'Str0ngPassword!';

const inviteUrl = (account) => `/${account}/invitations`;
const membersUrl = (account) => `/${account}/members`;

describe('Invitations ', function () {
	this.timeout(60000);

	const usernames = [
		'collaboratorTeamspace1Model1RoleA',
		'teamSpace1',
		'sub_paypal',
		'sub_all',
	];

	const password = 'password';
	const account = 'teamSpace1';
	const model = '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac';
	let agents = {};

	const project1Id = '5bf7df65-f3a8-4337-8016-a63f00000000';

	before(() => loginUsers(usernames, password).then((loggedInAgents) => agents = loggedInAgents));

	after(() => agents.done());

	it('sent with a registered email should fail', async () => {
		const inviteEmail = 'mail@teamspace1.com';
		const inviteRole = 'roleA';
		const permissions = { teamspace_admin: true };

		const { body } = await agents.teamSpace1.post(inviteUrl(account))
			.send({ email: inviteEmail, role: inviteRole, permissions })
			.expect(USER_ALREADY_EXISTS.status);

		expect(body.message).to.equal(USER_ALREADY_EXISTS.message);
	});

	it('sent with a non existent role should fail', (done) => {
		const inviteEmail = '5122a304d9df4@email.com';
		const inviteRole = 'nonExistentRole';
		const inviteTeamPermission = { teamspace_admin: true };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email: inviteEmail, role: inviteRole, permissions: inviteTeamPermission })
			.expect(ROLE_NOT_FOUND.status, (err, res) => {
 				expect(res.body.message).to.equal(ROLE_NOT_FOUND.message);
				done();
			});
	});

	it('sent with a non existen project should fail', (done) => {
		const email = '19bd030fee094@email.com';
		const role = 'roleA';
		const projectPermission = { project: 'nonexistenProject', project_admin: true };
		const inviteTeamPermission = { teamspace_admin: false, projects: [projectPermission] };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email, role, permissions: inviteTeamPermission })
			.expect(INVALID_PROJECT_ID.status, (err, res) => {
 				expect(res.body.message).to.equal(INVALID_PROJECT_ID.message);
				done();
			});
	});

	it('sent with a non existen model should fail', (done) => {
		const email = '19bd030fee094@email.com';
		const role = 'roleA';
		const modelsPermissions = [{ model: '1cb3e38c4f7644b', permission: 'collaborator' }];
		const projectPermission = { project: project1Id, models: modelsPermissions };
		const inviteTeamPermission = { teamspace_admin: false, projects: [projectPermission] };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email, role, permissions: inviteTeamPermission })
			.expect(INVALID_MODEL_ID.status, (err, res) => {
 				expect(res.body.message).to.equal(INVALID_MODEL_ID.message);
				done();
			});
	});

	it('sent with teamspace admin should work for the teamspace admin', (done) => {
		const inviteEmail = '7e634bae01db4f@mail.com';
		const inviteRole = 'roleA';
		const inviteTeamPermission = { teamspace_admin: true };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email: inviteEmail, role: inviteRole, permissions: inviteTeamPermission })
			.expect(200, (err, res) => {
				const { email, role, permissions } = res.body;
				expect(email).to.equal(inviteEmail);
				expect(role).to.equal(inviteRole);
				expect(permissions.teamspace_admin).to.equal(true);
				expect(permissions.projects).to.be.undefined;
				done();
			});
	});

	it('sent with project admin should work for the teamspace admin', (done) => {
		const inviteEmail = '93393d28f953@mail.com';
		const inviteRole = 'roleA';
		const inviteTeamPermission = { projects: [{ project: project1Id, project_admin: true }] };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email: inviteEmail, role: inviteRole, permissions: inviteTeamPermission })
			.expect(200, (err, res) => {
				const { email, role, permissions } = res.body;
				expect(email).to.equal(inviteEmail);
				expect(role).to.equal(inviteRole);
				expect(permissions.projects).to.be.an('array').and.to.have.length(1);

				const projectPerm = permissions.projects[0];
				expect(projectPerm.project).to.equal(project1Id);
				expect(projectPerm.project_admin).to.equal(true);

				done();
			});
	});

	it('sent with admin permission role for models should work for the teamspace admin', (done) => {
		const inviteEmail = '48bc8da2f3bc@mail.com';
		const inviteRole = 'roleA';
		const modelsPermissions = [{ model: '00b1fb4d-091d-4f11-8dd6-9deaf71f5ca5', permission: 'collaborator' }];
		const inviteTeamPermission = { projects: [{ project: project1Id, models: modelsPermissions }] };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email: inviteEmail, role: inviteRole, permissions: inviteTeamPermission })
			.expect(200, (err, res) => {
				AssertionError.includeStack = true;

				const { email, role, permissions } = res.body;

				expect(email).to.equal(inviteEmail);
				expect(role).to.equal(inviteRole);

				const { projects } = permissions;
				expect(projects).to.be.an('array').and.to.have.length(1);

				const { project, models } = projects[0];
				expect(project).to.equal(project1Id);

				expect(models).to.be.an('array').and.to.have.length(1);
				const { model, permission } = models[0];
				expect(model).to.equal('00b1fb4d-091d-4f11-8dd6-9deaf71f5ca5');
				expect(permission).to.equal('collaborator');

				done();
			});
	});

	it('sent with nonexistent permission role for model should fail', (done) => {
		const inviteEmail = '4oj1i2393bc@mail.com';
		const inviteRole = 'roleA';
		const modelsPermissions = [{ model: '00b1fb4d-091d-4f11-8dd6-9deaf71f5ca5', permission: 'crazypermission' }];
		const inviteTeamPermission = { projects: [{ project: project1Id, models: modelsPermissions }] };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email: inviteEmail, role: inviteRole, permissions: inviteTeamPermission })
			.expect(INVALID_MODEL_PERMISSION.status, (err, res) => {
				expect(res.body.message).to.equal(INVALID_MODEL_PERMISSION.message);
				done();
			});
	});

	it('sent by a non teamspace admin should fail', (done) => {
		const inviteEmail = '7e634bae01db4f@mail.com';
		const inviteRole = 'roleA';
		const inviteTeamPermission = { teamspace_admin: true };

		agents.collaboratorTeamspace1Model1RoleA.post(inviteUrl(account))
			.send({ email: inviteEmail, role: inviteRole, permissions: inviteTeamPermission })
			.expect(NOT_AUTHORIZED.status, (err, res) => {
 				expect(res.body.message).to.equal(NOT_AUTHORIZED.message);
				done();
			});
	});

	it('should be able to be retrieved by the teamspace admin', (done) => {
		agents.teamSpace1.get(inviteUrl(account))
			.expect(200, (err, res) => {
				expect(res.body).to.be.an('array').and.to.have.lengthOf.above(0);
				done();
			});
	});

	it('should be able to be revoked by the teamspace admin', async () => {
		const deleteUrl = (email) => `${inviteUrl(account)}/${email}`;

		var { body: invitations } = await agents.teamSpace1.get(inviteUrl(account)).expect(200);
		expect(invitations).to.be.an('array').and.to.have.lengthOf.above(0);

		await Promise.all(invitations.map(({ email }) => agents.teamSpace1.delete(deleteUrl(email))));

		var { body: invitations } = await agents.teamSpace1.get(inviteUrl(account)).expect(200);
		expect(invitations).to.be.an('array').and.to.have.length(0);
	});

	it('with teamspace admin that are unpacked should generate the proper user permissions the teamspace', async () => {
		AssertionError.includeStack = true;
		const username = 'adminInvitedUser2';
		const email = 'adminInvitedUser2@mail.com';
		const inviteRole = 'roleA';

		const selectInvitedUser = ({ user }) => user === username;

		await agents.sub_all.post(inviteUrl('sub_all'))
			.send({ email, role: inviteRole, permissions: { teamspace_admin: true } })
			.expect(200);

		const User = require('../../../src/v4/models/user');
		const { token } = await User.createUser(username, STRONG_PASSWORD, { email }, 200000);

		await User.verify(username, token, { skipImportToyModel: true, skipCreateBasicPlan: true });

		const { body: { members } } = await agents.sub_all.get(membersUrl('sub_all'));
		const invited = members.find(selectInvitedUser);
		expect(invited.permissions[0], 'invited user should be a teamspace admin').to.equal('teamspace_admin');
	});

	it('that are unpacked should generate the proper user permissions for two teamspaces', async () => {
		AssertionError.includeStack = true;
		const username = 'invitedUser';
		const email = '7556155d71@mail.com';
		const inviteRole = 'roleA';

		const selectInvitedUser = ({ user }) => user === username;
		const selectModel = (selectedModel) => ({ model }) => model === selectedModel;

		const modelsPermsUrl = (account, models) => `/${account}/models/permissions?models=${models.join(',')}`;

		const team1Perm = {
			projects:
			[
				{
					project: project1Id,
					models: [
						{ model: '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac', permission: 'viewer' },
						{ model: '00b1fb4d-091d-4f11-8dd6-9deaf71f5ca5', permission: 'commenter' },
					],
				},
			],
		};

		await agents.sub_all.post(inviteUrl('sub_all'))
			.send({ email, role: inviteRole, permissions: { teamspace_admin: true } })
			.expect(200);

		await agents.teamSpace1.post(inviteUrl('teamSpace1'))
			.send({ email, role: inviteRole, permissions: team1Perm })
			.expect(200);

		const User = require('../../../src/v4/models/user');
		const { token } = await User.createUser(username, STRONG_PASSWORD, { email }, 200000);
		await User.verify(username, token, { skipImportToyModel: true, skipCreateBasicPlan: true });

		const { body: { members } } = await agents.sub_all.get(membersUrl('sub_all'));
		const invited = members.find(selectInvitedUser);
		expect(invited.permissions[0], 'invited user should be a teamspace admin').to.equal('teamspace_admin');

		const models = team1Perm.projects[0].models.map(({ model }) => model);

		const { body: modelPerms } = await agents.teamSpace1.get(modelsPermsUrl('teamSpace1', models));

		let permsForModel = modelPerms.find(selectModel(models[0])).permissions.find(selectInvitedUser);
		expect(permsForModel.permission, 'should be viewer for this model').to.equal('viewer');

		permsForModel = modelPerms.find(selectModel(models[1])).permissions.find(selectInvitedUser);
		expect(permsForModel.permission, 'should be a commenter for this model').to.equal('commenter');
	});

	it('that are unpacked with a project_admin should have the correct permission', async () => {
		AssertionError.includeStack = true;
		const username = 'projectAdminInvited';
		const email = 'projectAdminInvited@mail.com';
		const inviteRole = 'roleA';

		const selectInvitedUser = ({ user }) => user === username;

		const team1Perm = {
			projects:
			[
				{
					project: project1Id,
					project_admin: true,
				},
			],
		};

		await agents.teamSpace1.post(inviteUrl('teamSpace1'))
			.send({ email, role: inviteRole, permissions: team1Perm })
			.expect(200);

		const User = require('../../../src/v4/models/user');
		const { token } = await User.createUser(username, STRONG_PASSWORD, { email }, 200000);
		await User.verify(username, token, { skipImportToyModel: true, skipCreateBasicPlan: true });

		const { body: { permissions } } = await agents.teamSpace1.get('/teamSpace1/projects/project1').expect(200);

		const invitedPermission = permissions.find(selectInvitedUser);
	 	expect(invitedPermission.permissions[0], 'should be a project admin').to.equal('admin_project');
	});

	it('should fail when trying to invite by email after the limit has been reached by invitations', async () => {
		AssertionError.includeStack = true;
		const inviteRole = 'roleA';

		// sub_paypal has licence limit of 2
		await agents.sub_paypal.post(inviteUrl('sub_paypal'))
			.send({ email: 'last_liscenavailable@mail.com', role: inviteRole, permissions: { teamspace_admin: true } })
			.expect(200);

		const res = await agents.sub_paypal.post(inviteUrl('sub_paypal'))
			.send({ email: 'failedInvitation@mail.com', role: inviteRole, permissions: { teamspace_admin: true } })
			.expect(LICENCE_LIMIT_REACHED.status);

		expect(res.body.message).to.equal(LICENCE_LIMIT_REACHED.message);
	});

	it('should fail when trying to add a registered user to the teamspace after the limit has been reached by invitations', async () => {
		AssertionError.includeStack = true;
		const inviteRole = 'roleA';

		// sub_paypal has licence limit of 2
		// one seat is taken by sub_paypal and the other by the previous invitation last_liscenavailable@mail.com
		const res = await agents.sub_paypal.post('/sub_paypal/members')
			.send({
					    role: inviteRole,
					    user: 'teamSpace1',
					    permissions: [],
			})
			.expect(LICENCE_LIMIT_REACHED.status);

		expect(res.body.message).to.equal(LICENCE_LIMIT_REACHED.message);
	});
});
