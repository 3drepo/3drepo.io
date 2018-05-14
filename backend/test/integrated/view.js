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

let request = require("supertest");
let expect = require("chai").expect;
let app = require("../../services/api.js").createApp(
	{ session: require("express-session")({ secret: "testing",  resave: false,   saveUninitialized: false }) }
);
let responseCodes = require("../../response_codes.js");
let async = require("async");

describe("Views", function () {

	let server;
	let agent;

	const username = "view_username";
	const username2 = "view_username2";
	const password = "password";
	
	const projectAdminUser = "imProjectAdmin";

	const model = "project1";

	let pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mPUjrj6n4EIwDiqkL4KAV6SF3F1FmGrAAAAAElFTkSuQmCC";
	let baseView = {
		"clippingPlanes":[]
		"viewpoint":{
			"up":[0,1,0],
			"position":[38,38 ,125.08011914810137],
			"look_at":[0,0,-163.08011914810137],
			"view_dir":[0,0,-1],
			"right":[1,0,0],
		},
	};

	before(function(done){

		server = app.listen(8080, function () {
			console.log("API test server is listening on port 8080!");

			agent = request.agent(server);
			agent.post("/login")
			.send({ username, password })
			.expect(200, function(err, res){
				expect(res.body.username).to.equal(username);
				done(err);
			});
		});

	});

	after(function(done){
		server.close(function(){
			console.log("API test server is closed");
			done();
		});
	});

	describe("Creating a view", function(){

		it("should succeed", function(done){

			let view = Object.assign({"name":"View test"}, baseView);
			let viewId;

			async.series([
				function(done){
					agent.post(`/${username}/${model}/views/`)
					.send(view)
					.expect(200 , function(err, res){
						
						viewId = res.body._id;
						expect(res.body.name).to.equal(view.name);
						expect(res.body.clippingPlanes).to.equal(view.clippingPlanes);
						expect(res.body.viewpoint.up).to.deep.equal(view.viewpoint.up);
						expect(res.body.viewpoint.position).to.deep.equal(view.viewpoint.position);
						expect(res.body.viewpoint.look_at).to.deep.equal(view.viewpoint.look_at);
						expect(res.body.viewpoint.view_dir).to.deep.equal(view.viewpoint.view_dir);
						expect(res.body.viewpoint.right).to.deep.equal(view.viewpoint.right);

						return done(err);
					});
				},

				function(done){
					agent.get(`/${username}/${model}/views/${viewId}`).expect(200, function(err , res){

						expect(res.body.name).to.equal(view.name);
						expect(res.body.clippingPlanes).to.equal(view.clippingPlanes);
						expect(res.body.viewpoint.up).to.deep.equal(view.viewpoint.up);
						expect(res.body.viewpoint.position).to.deep.equal(view.viewpoint.position);
						expect(res.body.viewpoint.look_at).to.deep.equal(view.viewpoint.look_at);
						expect(res.body.viewpoint.view_dir).to.deep.equal(view.viewpoint.view_dir);
						expect(res.body.viewpoint.right).to.deep.equal(view.viewpoint.right);

						return done(err);

					});
				}
			], done);

		});

		it("with screenshot should succeed", function(done){

			let view = Object.assign({"name":"View test"}, baseView);
			view.screenshot = pngBase64;

			let viewId;

			async.series([
				function(done){
					agent.post(`/${username}/${model}/views/`)
					.send(view)
					.expect(200 , function(err, res){
						
						viewId = res.body._id;
						return done(err);
					});
				},

				function(done){
					agent.get(`/${username}/${model}/views/${viewId}/`).expect(200, function(err , res){

						expect(res.body.screenshot).to.equal(`${username}/${model}/views/${viewId}/${res.body.guid}/screenshot.png`);
						return done(err);

					});
				}
			], done);

		});

		it("change name should succeed", function(done){

			let view = Object.assign({"name":"View test"}, baseView, { status: "open"});
			let viewId;
			let newName = { name: "New view name"};
			async.series([
				function(done){
					agent.post(`/${username}/${model}/views/`)
					.send(view)
					.expect(200 , function(err, res){
						viewId = res.body._id;
						return done(err);
						
					});
				},
				function(done){
					agent.put(`/${username}/${model}/views/${viewId}/`)
					.send(newName)
					.expect(200, done);
				},
				function(done){
					agent.get(`/${username}/${model}/views/${viewId}/`)
					.expect(200, function(err, res){
						expect(res.body.name === newName.name);
						done(err);
					});
				},
			], done);
		});

		it("change viewpoint should succeed", function(done){

			let view = Object.assign({"name":"View test"}, baseView, { status: "open"});
			let viewId;
			let newView = {
				"up":[1,1,1],
				"position":[12,13,35],
				"look_at":[0,0,1],
				"view_dir":[-1,0,1],
				"right":[0,1,0]
			}
			async.series([
				function(done){
					agent.post(`/${username}/${model}/views/`)
					.send(view)
					.expect(200 , function(err, res){
						viewId = res.body._id;
						return done(err);
						
					});
				},
				function(done){
					agent.put(`/${username}/${model}/views/${viewId}/`)
					.send(newView)
					.expect(200, done);
				},
				function(done){
					agent.get(`/${username}/${model}/views/${viewId}/`)
					.expect(200, function(err, res){
						expect(res.body.viewpoint.up).to.deep.equal(newView.viewpoint.up);
						expect(res.body.viewpoint.position).to.deep.equal(newView.viewpoint.position);
						expect(res.body.viewpoint.look_at).to.deep.equal(newView.viewpoint.look_at);
						expect(res.body.viewpoint.view_dir).to.deep.equal(newView.viewpoint.view_dir);
						expect(res.body.viewpoint.right).to.deep.equal(newView.viewpoint.right);
						done(err);
					});
				},
			], done);
		});

	});

});

