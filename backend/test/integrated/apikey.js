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
const request = require("supertest");
const bouncerHelper = require("./bouncerHelper");
const expect = require("chai").expect;
const app = require("../../services/api.js").createApp(
	{ session: require("express-session")({ secret: "testing",  resave: false,   saveUninitialized: false }) }
);
const async = require("async");



describe('API key ', () => {
	let server;
	let loggedAgent = null;
	let unloggedAgent = null;
	let apikey = null;
	const APIKEY_URL = "/apikey";
	const username = "teamSpace1";
	const password = "password";


	before(done => {
		server = app.listen(8080, function () {
			unloggedAgent = request.agent(server);
			loggedAgent = request.agent(server);
			loggedAgent.post("/login")
				.send({ username, password})
				.expect(200, done);

		});
	});

	after(done => server.close(done));

	it("should be generated sucessfully", done => {
		loggedAgent.post(APIKEY_URL)
			.send({})
			.expect(200, function(err, res) {
				expect(res.body.apiKey).to.not.be.null;
				apikey = res.body.apiKey;
				done(err);
			});
	});

	it("should fail to be generated when using a key", done => {
		unloggedAgent.post(APIKEY_URL+"?key="+apikey)
			.send({})
			.expect(401, done);
	});

	it("should be not be able to be deleted using a key", done => {
		async.series(
			[next =>
				unloggedAgent.delete(APIKEY_URL+"?key="+apikey)
					.send({})
					.expect(401, next),
			next =>
				loggedAgent.get("/me")
					.expect(200, (err, res) => {
					expect(res.body.apikey).to.not.be.null;
					next(err);
				})],
		done)
	});

	it("should work when querying the api with the key attached",  done => {
		async.parallel(
			[
				next =>
					unloggedAgent.get("/notifications?key="+apikey)
						.expect(200, next),
				next =>
					unloggedAgent.get("/me?key="+apikey)
					.expect(200, (err, res) => {
						expect(res.body.username).to.equals(username);
						next(err);
					})
			],
		done)
	});

	it("should not work for logging in", done => {
		unloggedAgent.post("/login?key=" + apikey)
				.send({ username: "-", password: "-"})
				.expect(400,  done);
	});

	it("should be sucessfully deleted when logged in", done => {
		async.series(
			[next =>
				loggedAgent.delete(APIKEY_URL)
					.send({})
					.expect(200, next),
			next =>
				loggedAgent.get("/me").expect(200,(err, res) => {
					expect(res.body.apikey).to.be.undefined;
					next(err);
			})],
		done);
	});

});