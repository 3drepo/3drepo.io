"use strict";

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

const { loginUsers } = require("../helpers/users.js");
const { expect, AssertionError } = require("chai");
const { EMAIL_INVALID, JOB_NOT_FOUND, INVALID_PROJECT_NAME,
	INVALID_MODEL_ID, NOT_AUTHORIZED, INVALID_MODEL_PERMISSION_ROLE } = require("../../response_codes.js");


const inviteUrl = (account) => `/${account}/invitations`;


describe("Invitations ", function () {
	const usernames = [ "adminTeamspace1JobA",
		"collaboratorTeamspace1Model1JobA",
		"teamSpace1"];

	const password = "password";
	const account = "teamSpace1";
	const model = "5bfc11fa-50ac-b7e7-4328-83aa11fa50ac";
	let agents = {};

	before(() => loginUsers(usernames, password).then(loggedInAgents => agents = loggedInAgents));

	after(() => agents.done());


	it("sent with a registered email should fail", function(done) {
		const inviteEmail = 'mail@teamspace1.com';
		const inviteJob = 'jobA';
		const permissions = { team_admin: true };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email: inviteEmail, job: inviteJob, permissions })
			.expect(EMAIL_INVALID.status, (err, res) => {
 				expect(res.body.message).to.equal(EMAIL_INVALID.message);
				done();
			});
	});


	it("sent with a non existent job should fail", function(done) {
		const inviteEmail = '5122a304d9df4@email.com';
		const inviteJob = 'nonExistentJob';
		const inviteTeamPermission = { team_admin: true };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email: inviteEmail, job: inviteJob, permissions: inviteTeamPermission})
			.expect(JOB_NOT_FOUND.status, (err, res) => {
 				expect(res.body.message).to.equal(JOB_NOT_FOUND.message);
				done();
			});
	});

	it("sent with a non existen project should fail", function(done) {
		const email = '19bd030fee094@email.com';
		const job = 'jobA';
		const projectPermission = { name: 'nonexistenProject', project_admin: true };
		const inviteTeamPermission = { team_admin: false, projects: [projectPermission] };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email, job, permissions: inviteTeamPermission})
			.expect(INVALID_PROJECT_NAME.status, (err, res) => {
 				expect(res.body.message).to.equal(INVALID_PROJECT_NAME.message);
				done();
			});
	});

	it("sent with a non existen model should fail", function(done) {
		const email = '19bd030fee094@email.com';
		const job = 'jobA';
		const modelsPermissions = [{ model : '1cb3e38c4f7644b', role: 'admin' }]
		const projectPermission = { project: 'project1', models: modelsPermissions };
		const inviteTeamPermission = { team_admin: false, projects: [projectPermission] };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email, job, permissions: inviteTeamPermission})
			.expect(INVALID_MODEL_ID.status, (err, res) => {
 				expect(res.body.message).to.equal(INVALID_MODEL_ID.message);
				done();
			});
	});

	it("sents with teamspace admin should work for the teamspace admin", function(done) {
		const inviteEmail = '7e634bae01db4f@mail.com';
		const inviteJob = 'jobA';
		const inviteTeamPermission =  { team_admin: true };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email: inviteEmail, job: inviteJob, permissions: inviteTeamPermission})
			.expect(200, (err, res) => {
				const {email, job, permissions} = res.body;
				expect(email).to.equal(inviteEmail);
				expect(job).to.equal(inviteJob);
				expect(permissions.team_admin).to.equal(true);
				expect(permissions.projects).to.be.undefined;
				done();
			});
	});


	it("sents with project admin should work for the teamspace admin", function(done) {
		const inviteEmail = '93393d28f953@mail.com';
		const inviteJob = 'jobA';
		const inviteTeamPermission =  { projects: [{project: 'project1', project_admin: true}] };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email: inviteEmail, job: inviteJob, permissions: inviteTeamPermission})
			.expect(200, (err, res) => {
				const {email, job, permissions} = res.body;
				expect(email).to.equal(inviteEmail);
				expect(job).to.equal(inviteJob);
				expect(permissions.projects).to.be.an('array').and.to.have.length(1);

				const projectPerm = permissions.projects[0];
				expect(projectPerm.project).to.equal('project1');
				expect(projectPerm.project_admin).to.equal(true);

				done();
			});
	});

	it("sents with admin permission role for models should work for the teamspace admin", function(done) {
		const inviteEmail = '48bc8da2f3bc@mail.com';
		const inviteJob = 'jobA';
		const modelsPermissions = [{ model : '00b1fb4d-091d-4f11-8dd6-9deaf71f5ca5', role: 'admin' }];
		const inviteTeamPermission =  { projects: [{project: 'project1', models: modelsPermissions}] };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email: inviteEmail, job: inviteJob, permissions: inviteTeamPermission})
			.expect(200, (err, res) => {
				AssertionError.includeStack = true;

				const {email, job, permissions} = res.body;

				expect(email).to.equal(inviteEmail);
				expect(job).to.equal(inviteJob);

				const { projects } = permissions;
				expect(projects).to.be.an('array').and.to.have.length(1);

				const {project, models} = projects[0];
				expect(project).to.equal('project1');

				expect(models).to.be.an('array').and.to.have.length(1);
				const {model, role} = models[0];
				expect(model).to.equal('00b1fb4d-091d-4f11-8dd6-9deaf71f5ca5');
				expect(role).to.equal('admin');

				done();
			});
	});


	it("sent with nonexistent permission role for model should fail", function(done) {
		const inviteEmail = '4oj1i2393bc@mail.com';
		const inviteJob = 'jobA';
		const modelsPermissions = [{ model : '00b1fb4d-091d-4f11-8dd6-9deaf71f5ca5', role: 'crazyrole' }];
		const inviteTeamPermission =  { projects: [{project: 'project1', models: modelsPermissions}] };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email: inviteEmail, job: inviteJob, permissions: inviteTeamPermission})
			.expect(INVALID_MODEL_PERMISSION_ROLE.status, (err, res) => {
				expect(res.body.message).to.equal(INVALID_MODEL_PERMISSION_ROLE.message);
				done();
			});
	});

	it("sent by a non teamspace admin should fail", function(done) {
		const inviteEmail = '7e634bae01db4f@mail.com';
		const inviteJob = 'jobA';
		const inviteTeamPermission =  { team_admin: true };

		agents.collaboratorTeamspace1Model1JobA.post(inviteUrl(account))
			.send({ email: inviteEmail, job: inviteJob, permissions: inviteTeamPermission})
			.expect(NOT_AUTHORIZED.status, (err, res) => {
 				expect(res.body.message).to.equal(NOT_AUTHORIZED.message);
				done();
			});
	});

	it("should be able to be retrieved by the teamspace admin", function(done) {
		agents.teamSpace1.get(inviteUrl(account))
			.expect(200, (err, res) => {
				expect(res.body).to.be.an('array').and.to.have.lengthOf.above(0);
				done();
			});
	});

	it("should be able to be revoked by the teamspace admin", async function() {
		const deleteUrl = (email) => inviteUrl(account) + "/" + email;

		var { body: invitations } = await agents.teamSpace1.get(inviteUrl(account)).expect(200);
		expect(invitations).to.be.an('array').and.to.have.lengthOf.above(0);

		await Promise.all(invitations.map(({ email }) => agents.teamSpace1.delete(deleteUrl(email)) ));

		var { body: invitations } = await agents.teamSpace1.get(inviteUrl(account)).expect(200);
		expect(invitations).to.be.an('array').and.to.have.length(0);
	});


	// it("should assign the invitations permissions and jobs", function(done) {
	// 	const inviteEmail = 'inviteeUser@mail.com';


	// 	agents.teamSpace1.post(inviteUrl(account))
	// 		.send({ email: inviteEmail, job: inviteJob, permissions: inviteTeamPermission})
	// 		.expect(NOT_AUTHORIZED.status, (err, res) => {
 	// 			expect(res.body.message).to.equal(NOT_AUTHORIZED.message);
	// 			done();
	// 		});
	// });


	// TODO: test licence limit
	// TODO: update invitations permissions
});
