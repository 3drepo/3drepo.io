"use strict";

/**
 *  Copyright (C) 2018 3D Repo Ltd
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

const request = require("supertest");
const expect = require("chai").expect;
const app = require("../../services/api.js").createApp();
const logger = require("../../logger.js");
const systemLogger = logger.systemLogger;

describe("Checking Quota Info  ", function() {
	let server;
	let agent;
	const timeout = 30000;
	const noSubUser = {
		user: "sub_noSub",
		password: "password",
		quota: {spaceLimit: 1, collaboratorLimit: 0, spaceUsed: 0}
	};

	const paypalUser = {
		user: "sub_paypal",
		password: "password",
		quota: {spaceLimit: 20481, collaboratorLimit: 2, spaceUsed: 0}
	};

	const enterpriseUser = {
		user: "sub_enterprise",
		password: "password",
		quota: {spaceLimit: 2049, collaboratorLimit: 5, spaceUsed: 0}
	};

	const discretionaryUser = {
		user: "sub_discretionary",
		password: "password",
		quota: {spaceLimit: 1025, collaboratorLimit: 10, spaceUsed: 0}
	};

	const mixedUser1 = {
		user: "sub_all",
		password: "password",
		quota: {spaceLimit: 23553, collaboratorLimit: "unlimited", spaceUsed: 0}
	};

	const mixedUser2 = {
		user: "sub_all2",
		password: "password",
		quota: {spaceLimit: 22529, collaboratorLimit: "unlimited", spaceUsed: 0}
	};

	const mixedUser3 = {
		user: "sub_all3",
		password: "password",
		quota: {spaceLimit: 21505, collaboratorLimit: 4, spaceUsed: 0}
	};

	const mixedUser4 = {
		user: "sub_all4",
		password: "password",
		quota: {spaceLimit: 3073, collaboratorLimit: "unlimited", spaceUsed: 0}
	};

	before(function(done) {

		server = app.listen(8080, function () {
			agent = request.agent(server);
			console.log("API test server is listening on port 8080!");
			done();
		});
	});

	after(function(done) {

		server.close(function() {
			console.log("API test server is closed");
			done();
		});

	});

	describe("user with no subscription", function(done) {
		const user = noSubUser;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should have basic quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("user with paypal subscription", function(done) {
		const user = paypalUser;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should have basic & paypal quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});

	});

	describe("user with enterprise subscription", function(done) {
		const user = enterpriseUser;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should have basic & enterprise quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("user with discretionary subscription", function(done) {
		const user = discretionaryUser;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should have basic & discretionary quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("user with mixed subscription", function(done) {
		const user =  mixedUser1;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should have the correct aggregated quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("user with mixed subscription with expired subscriptions (1)", function(done) {
		const user =  mixedUser2;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should have the correct aggregated quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("user with mixed subscription with expired subscriptions (2)", function(done) {
		const user =  mixedUser3;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should have the correct aggregated quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("user with mixed subscription with expired subscriptions (3)", function(done) {
		const user =  mixedUser4;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should have the correct aggregated quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					console.log(res.body);
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

});
