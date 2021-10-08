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
"use strict";

const app = require("../../../src/v4/services/api.js").createApp();
const request = require("supertest");
const async = require("async");
const { expect } = require("chai");


const loginUsers = async (usernames, passwords) => {
	const server = await new Promise((resolve, reject) => {
		const res = {};
		res.val = app.listen(8080, () => {
			 resolve(res.val);
		});
	});

	const agents = { server };
	agents.done = () => new Promise((resolve) => {
		server.close(() => {
			console.log("API Server is closed");
			resolve(true);
		});
	 });

	await Promise.all(usernames.map((username, index) => {
		return new Promise((resolveLogin, rejectLogin) => {
			const agent = request.agent(server);

			// In the cases passwords is an array or passwords is the same password for every user
			const password = Array.isArray(passwords)? passwords[index] : passwords;

			agent.post("/login")
				.send({ username, password})
				.expect(200, function(err, res) {
					if (err)
						rejectLogin(err);
					else {
						resolveLogin(agent);
					}
				});

			agents[username] = agent;
		});
	}))

	return agents;
};


module.exports = {
	loginUsers,
	login: (agent, username, password) => (...args) => {
		const next = args.pop();

		async.series([
			function(_done) {
				agent.post("/logout")
					.send({})
					.expect(200, _done);
			},
			function(_done) {
				agent.post("/login")
					.send({username, password})
					.expect(200,  (err, res) => {
						expect(res.status, 'Status should be 200 (ok)').to.be.equal(200);
						_done();
					});
			}], next);
	}
};
