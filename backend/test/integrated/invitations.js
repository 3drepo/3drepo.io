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
const { expect } = require("chai");
const { EMAIL_INVALID, JOB_NOT_FOUND, INVALID_PROJECT_NAME, INVALID_MODEL_ID } = require("../../response_codes.js");


const inviteUrl = (account) => `/${account}/invitations`;

describe("Invitations ", function () {
	const usernames = [ "adminTeamspace1JobA",
		"teamSpace1"];

	const password = "password";
	const account = "teamSpace1";
	const model = "5bfc11fa-50ac-b7e7-4328-83aa11fa50ac";
	let agents = {};

	before(() => loginUsers(usernames, password).then(loggedInAgents => agents = loggedInAgents));

	it("send invitation with a registered email should fail", function(done) {
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


	it("send invitation with a non existent job should fail", function(done) {
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

	it("send invitation with a non existen project should fail", function(done) {
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

	it("send invitation with a non existen model should fail", function(done) {
		const email = '19bd030fee094@email.com';
		const job = 'jobA';
		const modelsPermissions = [{ id : '1cb3e38c4f7644b', role: 'admin' }]
		const projectPermission = { name: 'project1', models: modelsPermissions };
		const inviteTeamPermission = { 'team_admin': false, projects: [projectPermission] };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email, job, permissions: inviteTeamPermission})
			.expect(INVALID_MODEL_ID.status, (err, res) => {
 				expect(res.body.message).to.equal(INVALID_MODEL_ID.message);
				done();
			});
	});

	it("send invitations with teamspace admin should work for the teamspace admin", function(done) {
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


	it("send invitations with project admin should work for the teamspace admin", function(done) {
		const inviteEmail = '93393d28f953@mail.com';
		const inviteJob = 'jobA';
		const inviteTeamPermission =  { projects: [{name: 'project1', project_admin: true}] };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email: inviteEmail, job: inviteJob, permissions: inviteTeamPermission})
			.expect(200, (err, res) => {
				const {email, job, permissions} = res.body;
				expect(email).to.equal(inviteEmail);
				expect(job).to.equal(inviteJob);
				expect(permissions.team_admin).to.equal(true);
				expect(permissions.projects).to.be.an('array').and.to.have.length(1);

				const projectPerm = permissions.projects[0];
				expect(projectPerm.name).to.equal('project1');
				expect(projectPerm.project_admin).to.equal(true);

				done();
			});
	});

	it("send invitations with model admin should work for the teamspace admin", function(done) {
		const inviteEmail = '48bc8da2f3bc@mail.com';
		const inviteJob = 'jobA';
		const modelsPermissions = [{ id : '00b1fb4d-091d-4f11-8dd6-9deaf71f5ca5', role: 'admin' }];
		const inviteTeamPermission =  { projects: [{name: 'project1', models: modelsPermissions}] };

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email: inviteEmail, job: inviteJob, permissions: inviteTeamPermission})
			.expect(200, (err, res) => {
				const {email, job, permissions} = res.body;
				expect(email).to.equal(inviteEmail);
				expect(job).to.equal(inviteJob);
				expect(permissions.team_admin).to.equal(true);
				expect(permissions.projects).to.be.an('array').and.to.have.length(1);

				const projectPerm = permissions.projects[0];
				expect(projectPerm.name).to.equal('project1');
				expect(projectPerm.project_admin).to.equal(true);

				done();
			});
	});



	// it("get invitations should work for the teamspace admin", function(done) {
	// 	const inviteEmail = 'nonexitentmail@mail.com';
	// 	const inviteJob = 'jobA';
	// 	const inviteTeamPermission = ['team_admin'];

	// 	agents.teamSpace1.get(inviteUrl(account))
	// 		.expect(200, (err, res) => {
	// 			console.log(res.body);
	// 			done();
	// 		});
	// });

	after(() => agents.done);
});
