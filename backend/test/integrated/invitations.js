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


const inviteUrl = (account) => `/${account}/invitations`;

describe("Invitations ", function () {
	const usernames = [ "adminTeamspace1JobA",
		"teamSpace1"];

	const password = "password";
	const account = "teamSpace1";
	const model = "5bfc11fa-50ac-b7e7-4328-83aa11fa50ac";
	let agents = {};

	before(() => loginUsers(usernames, password).then(loggedInAgents => agents = loggedInAgents));

	it("send invitations should work for the teamspace admin", function(done) {
		const inviteEmail = 'nonexitentmail@mail.com';
		const inviteJob = 'jobA';
		const inviteTeamPermission = ['team_admin'];

		agents.teamSpace1.post(inviteUrl(account))
			.send({ email: inviteEmail, job: inviteJob, permissions: inviteTeamPermission})
			.expect(200, (err, res) => {
				const {email, job, permissions} = res.body;
				expect(email).to.equal(inviteEmail);
				expect(job).to.equal(inviteJob);
				expect(permissions).to.equal(inviteTeamPermission);
				done();

			});
	});

	it("get invitations should work for the teamspace admin", function(done) {
		const inviteEmail = 'nonexitentmail@mail.com';
		const inviteJob = 'jobA';
		const inviteTeamPermission = ['team_admin'];

		agents.teamSpace1.get(inviteUrl(account))
			.expect(200, (err, res) => {
				console.log(res.body);
				done();
			});
	});

	after(() => agents.done);
});
