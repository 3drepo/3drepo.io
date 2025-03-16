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
const SessionTracker = require("../../v4/helpers/sessionTracker")
const expect = require("chai").expect;
const app = require("../../../src/v4/services/api.js").createApp();
const responseCodes = require("../../../src/v4/response_codes");
const async = require("async");


describe('User ', () => {
	let server;
	let teamSpace1 = null;
	let unlogged_Agent = null;
	const username = "teamSpace1";
	const password = "password";


	before(async function() {
		await new Promise((resolve) => {
			server = app.listen(8080, () => {
				console.log("API test server is listening on port 8080!");
				resolve();
			});

		});

		unlogged_Agent = request.agent(server);
		teamSpace1 = SessionTracker(request(server));
		await teamSpace1.login(username, password);

	});
	after(done => server.close(done));

	describe("using an API Key" , () => {
		let apikey = null;
		const APIKEY_URL = "/apikey";

		it("should be able to generated it sucessfully", done => {
			teamSpace1.post(APIKEY_URL)
				.send({})
				.expect(200, function(err, res) {
					expect(res.body.apiKey).to.not.be.null;
					apikey = res.body.apiKey;
					done(err);
				});
		});

		it("should fail at generating it using a key", done => {
			unlogged_Agent.post(APIKEY_URL+"?key="+apikey)
				.send({})
				.expect(401, done);
		});

		it("should be not be able to delete one using a key", done => {
			async.series(
				[next =>
					unlogged_Agent.delete(APIKEY_URL+"?key="+apikey)
						.send({})
						.expect(401, next),
				next =>
					teamSpace1.get("/me")
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
						unlogged_Agent.get("/notifications?key="+apikey)
							.expect(200, next),
					next =>
						unlogged_Agent.get("/me?key="+apikey)
						.expect(200, (err, res) => {
							expect(res.body.username).to.equals(username);
							next(err);
						})
				],
			done)
		});

		it("should be sucessfully deleted when logged in", done => {
			async.series(
				[next =>
					teamSpace1.delete(APIKEY_URL)
						.send({})
						.expect(200, next),
				next =>
					teamSpace1.get("/me").expect(200,(err, res) => {
						expect(res.body.apikey).to.be.undefined;
						next(err);
				})],
			done);
		});
	});

	describe('using starred metadata', () => {
		const FAVOURITE_URL = "/starredMeta";
		const tags = ['lorem', 'ipsum', 'dolor', 'sit', 'amet'];

		const deleteTag =  agent => tag => next =>
								agent.delete(FAVOURITE_URL)
									.send({tag})
									.expect(200, next);

		const deleteTags = agent => done =>
									async.parallel(
										tags.map(deleteTag(agent))
									,done);

		before(done => deleteTags(teamSpace1)(done));

		it("should show an empty list when no tags have been starred", done => {
			teamSpace1.get(FAVOURITE_URL)
				.send({})
				.expect(200, function(err, res) {
					expect(res.body).to.be.an("array").and.to.have.length(0, 'Should have an empty array as favourites metadata tags');
					done(err);
				});
		});


		it ("should set the tags when send a whole array of tags", done => {
			async.series([
				next => teamSpace1.put(FAVOURITE_URL)
					.send(tags)
					.expect(200, function(err, res) {
						next(err);
					}),
				next => teamSpace1.get(FAVOURITE_URL)
					.expect(200, function(err, res) {
						const favourites = res.body;
						expect(favourites).to.be.an("array");
						expect(favourites.sort()).to.eql( tags.sort());
						next(err);
					})
			], done);
		})


		it ("should set the tags empty when send a an empty array of tags", done => {
			async.series([
				next => teamSpace1.put(FAVOURITE_URL)
					.send([])
					.expect(200, function(err, res) {
						next(err);
					}),
				next => teamSpace1.get(FAVOURITE_URL)
					.expect(200, function(err, res) {
						expect(res.body).to.be.an("array").and.to.have.length(0, 'Should have an empty array as favourites metadata tags');
						next(err);
					})
			], done);
		})

		it("should fail with 400 when sending bad data", done => {
			teamSpace1.post(FAVOURITE_URL)
				.send({})
				.expect(400, function(err, res) {
					done(err);
				});
		});

		it("should add a tag when starred", done => {
			async.series([
				next => teamSpace1.post(FAVOURITE_URL)
					.send({tag:tags[0]})
					.expect(200, function(err, res) {
						next(err);
					}),
				next => teamSpace1.get(FAVOURITE_URL)
					.expect(200, function(err, res) {
						const favourites = res.body;
						expect(favourites).to.be.an("array").and.to.have.length(1, 'Should have an array with one tag');
						expect(favourites).to.eql([tags[0]]);
						next(err);
					})
			], done);
		});

		it("should append tags when starred", done => {
			async.series([
				next =>
					async.parallel(
						tags.map(tag => nextAppend => teamSpace1.post(FAVOURITE_URL)
							.send({tag})
							.expect(200, nextAppend)
						)
					, next),
				next => teamSpace1.get(FAVOURITE_URL)
					.expect(200, function(err, res) {
						const favourites = res.body;
						expect(favourites).to.be.an("array").and.to.have.length(tags.length, 'Should have an array with one tag');
						expect(favourites.sort()).to.eql(tags.sort());
						next(err);
					})
			], done);
		});

		it ("should delete a tag when unstarred", done => {
			const tagToDelete =  tags[1];

			async.series([
				next => deleteTag(teamSpace1)(tagToDelete)(next),
				next => teamSpace1.get(FAVOURITE_URL)
							.expect(200, function(err, res) {
								const favourites = res.body;
								expect(favourites).to.be.an("array").and.to.have.length(tags.length-1, 'Should have an array with the rest of the tags');
								expect(favourites.sort()).to.eql(tags.filter(t => t != tagToDelete).sort());
								next(err);
							})
				], done)
		});

	});

	describe('Starring models', () => {
		const FAVOURITE_URL = "/starredModels";


		it("should show an empty object when no models have been starred", done => {
			teamSpace1.get(FAVOURITE_URL)
				.send({})
				.expect(200, function(err, res) {
					expect(res.body).to.eql({});
					done(err);
				});
		});


		it ("should overwrite the models list if sent the whole information", done => {
			const data = {
				"teamSpace1" : ["7418c82c-7562-4226-a7d3-880a76bffc1d", "8bb5cb46-c655-416a-8025-8d1e4f3c254e"],
				"teamSpace2" : ["a35e82fb-1063-483a-8131-d4e6310fee0c"]
			}
			async.series([
				next => teamSpace1.put(FAVOURITE_URL)
					.send(data)
				.expect(200, function(err, res) {
						next(err);
					}),
				next => teamSpace1.get(FAVOURITE_URL)
					.expect(200, function(err, res) {
						expect(res.body).to.deep.equal(data);
						next(err);
					})
			], done);
		})

		it ("should fail if the format is incorrect", done => {
			async.series([
				next => teamSpace1.put(FAVOURITE_URL)
					.send([])
					.expect(400, function(err, res) {
						expect(res.body.code).to.equal(responseCodes.INVALID_ARGUMENTS.code);
						next(err);
				}),
				next => teamSpace1.put(FAVOURITE_URL)
					.send({"a": 1})
					.expect(400, function(err, res) {
						expect(res.body.code).to.equal(responseCodes.INVALID_ARGUMENTS.code);
						next(err);
				}),
				next => teamSpace1.put(FAVOURITE_URL)
					.send({"a": [1]})
					.expect(400, function(err, res) {
						expect(res.body.code).to.equal(responseCodes.INVALID_ARGUMENTS.code);
						next(err);
				})


			], done);
		})
		it ("should set the model list to empty if an empty object is sent", done => {
			async.series([
				next => teamSpace1.put(FAVOURITE_URL)
					.send({})
					.expect(200, function(err, res) {
						next(err);
					}),
				next => teamSpace1.get(FAVOURITE_URL)
					.expect(200, function(err, res) {
						expect(res.body).to.eql({});
						next(err);
					})
			], done);
		})

		it("should add a model when starred", done => {
			const data = {
				"teamspace" : "teamSpace1",
				"model" : "a35e82fb-1063-483a-8131-d4e6310fee0c"
			}

			const expectedData = {
				"teamSpace1" : ["a35e82fb-1063-483a-8131-d4e6310fee0c"]
			}

			async.series([
				next => teamSpace1.post(FAVOURITE_URL)
					.send(data)
					.expect(200, function(err, res) {
						next(err);
					}),
				next => teamSpace1.get(FAVOURITE_URL)
					.expect(200, function(err, res) {
						const favourites = res.body;
						expect(favourites).to.deep.equal(expectedData);
						next(err);
					})
			], done);
		});

		it("should NOT add an entry if it already exists", done => {
			const data = {
				"teamspace" : "teamSpace1",
				"model" : "a35e82fb-1063-483a-8131-d4e6310fee0c"
			}

			const expectedData = {
				"teamSpace1" : ["a35e82fb-1063-483a-8131-d4e6310fee0c"]
			}

			async.series([
				next => teamSpace1.post(FAVOURITE_URL)
					.send(data)
					.expect(200, function(err, res) {
						next(err);
					}),
				next => teamSpace1.get(FAVOURITE_URL)
					.expect(200, function(err, res) {
						const favourites = res.body;
						expect(favourites).to.deep.equal(expectedData);
						next(err);
					})
			], done);
		});

		it("should append tags when a second modelID is added", done => {
			const data = {
				"teamspace" : "teamSpace1",
				"model" : "020d2fcb-9053-4ffb-953d-4de4f1c285a5"
			}

			const expectedData = {
				"teamSpace1" : ["a35e82fb-1063-483a-8131-d4e6310fee0c", "020d2fcb-9053-4ffb-953d-4de4f1c285a5"]
			}

			async.series([
				next => teamSpace1.post(FAVOURITE_URL)
					.send(data)
					.expect(200, function(err, res) {
						next(err);
					}),
				next => teamSpace1.get(FAVOURITE_URL)
					.expect(200, function(err, res) {
						const favourites = res.body;
						expect(favourites).to.deep.equal(expectedData);
						next(err);
					})
			], done);
		});

		it("should append tags correctly if another modelID from a different teamspace is added", done => {
			const data = {
				"teamspace" : "teamSpace2",
				"model" : "020d2fcb-9053-4ffb-953d-4de4f1c285a5"
			}

			const expectedData = {
				"teamSpace1" : ["a35e82fb-1063-483a-8131-d4e6310fee0c", "020d2fcb-9053-4ffb-953d-4de4f1c285a5"],
				"teamSpace2" : ["020d2fcb-9053-4ffb-953d-4de4f1c285a5"]
			}

			async.series([
				next => teamSpace1.post(FAVOURITE_URL)
					.send(data)
					.expect(200, function(err, res) {
						next(err);
					}),
				next => teamSpace1.get(FAVOURITE_URL)
					.expect(200, function(err, res) {
						const favourites = res.body;
						expect(favourites).to.deep.equal(expectedData);
						next(err);
					})
			], done);
		});

		it ("should delete a model when unstarred", done => {
			const data = {
				"teamspace" : "teamSpace2",
				"model" : "020d2fcb-9053-4ffb-953d-4de4f1c285a5"
			}

			const expectedData = {
				"teamSpace1" : ["a35e82fb-1063-483a-8131-d4e6310fee0c", "020d2fcb-9053-4ffb-953d-4de4f1c285a5"]
			}
			async.series([
				next => teamSpace1.delete(FAVOURITE_URL)
					.send(data)
					.expect(200, function(err, res) {
						next(err);
				}),
				next => teamSpace1.get(FAVOURITE_URL)
					.expect(200, function(err, res) {
						const favourites = res.body;
						expect(favourites).to.deep.equal(expectedData);
						next(err);
					})
			], done);
		});

		it ("should not change the data if the the modelID did not exist", done => {
			const data = {
				"teamspace" : "teamSpace2",
				"model" : "020d2fcb-9053-4ffb-953d-4de4f1c285a5"
			}

			const expectedData = {
				"teamSpace1" : ["a35e82fb-1063-483a-8131-d4e6310fee0c", "020d2fcb-9053-4ffb-953d-4de4f1c285a5"]
			}
			async.series([
				next => teamSpace1.delete(FAVOURITE_URL)
					.send(data)
					.expect(200, function(err, res) {
						next(err);
				}),
				next => teamSpace1.get(FAVOURITE_URL)
					.expect(200, function(err, res) {
						const favourites = res.body;
						expect(favourites).to.deep.equal(expectedData);
						next(err);
					})
			], done);
		});

	});

});
