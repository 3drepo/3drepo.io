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
const expect = require("chai").expect;
const app = require("../../services/api.js").createApp();
const async = require("async");


describe('User ', () => {
	let server;
	let teamSpace1 = null;
	let unlogged_Agent = null;
	const username = "teamSpace1";
	const password = "password";


	before(done => {
		server = app.listen(8080, function () {
			unlogged_Agent = request.agent(server);
			teamSpace1 = request.agent(server);
			teamSpace1.post("/login")
				.send({ username, password})
				.expect(200, done);

		});
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

		it("should not work for logging in", done => {
			unlogged_Agent.post("/login?key=" + apikey)
					.send({ username: "-", password: "-"})
					.expect(400,  done);
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

});