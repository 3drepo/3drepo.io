/**
 *  Copyright (C) 2014 3D Repo Ltd
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

"use strict";

const request = require("supertest");
const expect = require("chai").expect;
const { createAppAsync } = require("../../../src/v4/services/api.js");

describe("Config", function () {
	let server;
	

	before(async function() {
		const app = await createAppAsync();	
		await new Promise((resolve) => {
			server = app.listen(8080, function () {
				resolve();
			});
		});

	});

	after(function(done) {
		server.close(function() {
			console.log("API test server is closed");
			done();
		});
	});

	describe("version endpoint", function() {

		it("should return { VERSION : $version }", function(done) {

			const agent = request.agent(server);
			agent.get("/config/version.json")
				.expect(200, function(err, res) {
					expect(typeof res).to.equal("object");
					expect(typeof res.body.VERSION).to.equal("string");
					expect(res.body.VERSION.split(".").length - 1).to.equal(2);
					done(err);
				});

		});

	});

	describe("config endpoint", function() {

		it("should JavaScript file", function(done) {

			const agent = request.agent(server);
			agent.get("/config/config.js")
				.expect(200, function(err, res) {
					expect(typeof res).to.equal("object");
					done(err);
				});

		});

	});

});
