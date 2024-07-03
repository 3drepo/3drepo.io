"use strict";

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

const request = require("supertest");
const expect = require("chai").expect;
const app = require("../../../src/v4/services/api.js").createApp();
const logger = require("../../../src/v4/logger.js");
const systemLogger = logger.systemLogger;
const responseCodes = require("../../../src/v4/response_codes.js");
const async = require("async");


const defaultAdmin = { "_id": "Admin", "color": "#f7f7b2"};
describe("Job", function () {

	let server;
	let agent;
	const username = "job";
	const password = "job";
	const job = { _id: "job1", color: "#000000"};
	const job2 = { _id: "job2", color: "#000000"};

	before(function(done) {
		server = app.listen(8080, function () {
			console.log("API test server is listening on port 8080!");

			agent = request.agent(server);
			agent.post("/login")
				.send({ username, password })
				.expect(200, function(err, res) {
					expect(res.body.username).to.equal(username);
					done(err);
				});

		});
	});

	after(function(done) {
		server.close(function() {
			console.log("API test server is closed");
			done();
		});
	});

	it("should able to create new job", function(done) {

		agent.post(`/${username}/jobs`)
			.send(job)
			.expect(200, function(err, res) {
				done(err);
			});

	});

	it("should able to create second job", function(done) {

		agent.post(`/${username}/jobs`)
			.send(job2)
			.expect(200, function(err, res) {
				done(err);
			});

	});

	it("should not able to create duplicated job", function(done) {

		agent.post(`/${username}/jobs`)
			.send(job)
			.expect(400 , function(err, res) {
				expect(res.body.value).to.equal(responseCodes.DUP_JOB.value);
				done(err);
			});

	});

	it("should not able to create job with invalid name", function(done) {
		agent.post(`/${username}/jobs`)
			.send({ _id: " ", color: "#000000"})
			.expect(400 , function(err, res) {
				expect(res.body.value).to.equal(responseCodes.JOB_ID_INVALID.value);
				done(err);
			});
	});

	it("should not able to create job with invalid color", function(done) {
		agent.post(`/${username}/jobs`)
			.send({ _id: "abcd", color: "000000"})
			.expect(400 , function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});
	});

	it("should not able to create job with no name", function(done) {
		agent.post(`/${username}/jobs`)
			.send({ _id: "", color: "#000000"})
			.expect(400 , function(err, res) {
				expect(res.body.value).to.equal(responseCodes.JOB_ID_INVALID.value);
				done(err);
			});
	});

	it("get job assigned to current user should succeed", function(done) {
		agent.get(`/${username}/myJob`)
			.expect(200, function(err, res) {
				expect(res.body).to.deep.equal(defaultAdmin);
				done(err);
			});
	});

	it("get job assigned to current user after job assignment should succeed", function(done) {
		async.series([
			function(done) {
				agent.post(`/${username}/jobs/${job2._id}/${username}`)
					.expect(200, done);
			},
			function(done) {
				agent.get(`/${username}/myJob`)
					.expect(200, function(err, res) {
						expect(res.body).to.deep.equal(job2);
						done(err);
					});
			}
		], done);
	});

	it("update job colour should succeed", function(done) {
		const updatedJob = {
			_id: job2._id,
			color: "#aaaaaa"
		};

		let oldJobs;

		async.series([
			function(done) {
				agent.get(`/${username}/jobs`)
					.expect(200, function(err, res) {
						oldJobs = res.body;
						done(err);
					});
			},
			function(done) {
				agent.put(`/${username}/jobs/${job2._id}`)
					.send(updatedJob)
					.expect(200, done);
			},
			function(done) {
				agent.get(`/${username}/jobs`)
					.expect(200, function(err, res) {
						const newJobs = [
							defaultAdmin,
							job,
							updatedJob
						];

						expect(res.body).to.deep.equal(newJobs);
						done(err);
					});
			},
			function(done) {
				agent.put(`/${username}/jobs/${job2._id}`)
					.send(oldJobs[2])
					.expect(200, done);
			},
			function(done) {
				agent.get(`/${username}/jobs`)
					.expect(200, function(err, res) {
						expect(res.body).to.deep.equal(oldJobs);
						done(err);
					});
			}
		], done);
	});

	it("update job id should fail", function(done) {
		const updatedJob = {
			_id: "new name",
			color: job2._id
		};

		let oldJobs;

		async.series([
			function(done) {
				agent.get(`/${username}/jobs`)
					.expect(200, function(err, res) {
						oldJobs = res.body;
						done(err);
					});
			},
			function(done) {
				agent.put(`/${username}/jobs/${job2._id}`)
					.send(updatedJob)
					.expect(400, function(err, res) {
						expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
						done(err);
					});
			},
			function(done) {
				agent.get(`/${username}/jobs`)
					.expect(200, function(err, res) {
						expect(res.body).to.deep.equal(oldJobs);
						done(err);
					});
			}
		], done);
	});

	it("should able to list the job created", function(done) {
		agent.get(`/${username}/jobs`)
			.expect(200, function(err, res) {
				expect(res.body).to.deep.equal([defaultAdmin, job, job2]);
				done(err);
			});
	});

	it("should fail to assign a job that doesnt exist to a licence(user)", function(done) {
		agent.post(`/${username}/jobs/nonsense/user1`)
			.expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.JOB_NOT_FOUND.value);
				done(err);
			});
	});

	it("should able to assign a job to a licence(user)", function(done) {

		async.series([
			callback => {
				agent.post(`/${username}/jobs/${job._id}/user1`)
					.expect(200, function(err, res) {
						callback(err);
					});
			},

			callback => {
				agent.get(`/${username}/members`)
					.expect(200, function(err, res) {
						const entry = res.body.members.find(entry => entry.user === "user1");
						expect(entry.job).to.equal(job._id);
						callback(err);
					});
			}

		], (err, res) => done(err));

	});

	it("should able to change assignment to another job", function(done) {
		async.series([
			callback => {
				agent.post(`/${username}/jobs/${job2._id}/user1`)
					.expect(200, function(err, res) {
						callback(err);
					});
			},

			callback => {
				agent.get(`/${username}/members`)
					.expect(200, function(err, res) {
						for(let i = 0; i < res.body.length; ++i) {
							const entry = res.body.members.find(entry => entry.user === "user1");
							expect(entry.job).to.equal(job2._id);
						}

						callback(err);
					});
			}

		], (err, res) => done(err));
	});

	// is the functionality of this endpoint useful?
	it("list job colours should show unique list and succeed", function(done) {
		agent.get(`/${username}/jobs/colors`)
			.expect(200, function(err, res) {
				expect(res.body).to.deep.equal([defaultAdmin.color, job.color]);
				done(err);
			});
	});

	it("list job colours should succeed", function(done) {
		const updatedJob = {
			_id: job2._id,
			color: "#aaaaaa"
		};

		let oldJobs;

		async.series([
			function(done) {
				agent.get(`/${username}/jobs`)
					.expect(200, function(err, res) {
						oldJobs = res.body;
						done(err);
					});
			},
			function(done) {
				agent.put(`/${username}/jobs/${job2._id}`)
					.send(updatedJob)
					.expect(200, done);
			},
			function(done) {
				agent.get(`/${username}/jobs/colors`)
					.expect(200, function(err, res) {
						expect(res.body).to.deep.equal([defaultAdmin.color, job.color, updatedJob.color]);
						done(err);
					});
			},
			function(done) {
				agent.put(`/${username}/jobs/${job2._id}`)
					.send(oldJobs[2])
					.expect(200, done);
			}
		], done);
	});

	it("should fail to remove a job if it is assigned to someone", function(done) {
		agent.delete(`/${username}/jobs/${job2._id}`)
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.JOB_ASSIGNED.value);
				done(err);
			});
	});

	it("should able to remove a job", function(done) {
		agent.delete(`/${username}/jobs/${job._id}`)
			.expect(200, function(err, res) {
				done(err);
			});
	});

	it("should not able to remove a job that doesnt exist", function(done) {
		agent.delete(`/${username}/jobs/nonsense`)
			.expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.JOB_NOT_FOUND.value);
				done(err);
			});
	});

	it("job should be removed from the list", function(done) {
		agent.get(`/${username}/jobs`)
			.expect(200, function(err, res) {
				expect(res.body).to.deep.equal([defaultAdmin, job2]);
				done(err);
			});
	});
});
