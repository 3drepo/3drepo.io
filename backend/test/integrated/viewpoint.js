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
let async = require("async");

describe("Views", function () {

	let server;
	let agent;

	const username = "issue_username";
	const password = "password";
	
	const model = "project1";

	let pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mPUjrj6n4EIwDiqkL4KAV6SF3F1FmGrAAAAAElFTkSuQmCC";
	let baseView = {
		"screenshot":{"base64":pngBase64},
		"clippingPlanes":[],
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
			done();
		});
	});

	describe("Creating a viewpoint", function(){

		it("should succeed", function(done){

			let viewpoint = Object.assign({"name":"View test"}, baseView);
			let viewpointId;

			async.series([
				function(done){
					agent.post(`/${username}/${model}/viewpoints/`)
					.send(viewpoint)
					.expect(200 , function(err, res){
						viewpointId = res.body._id;
						return done(err);
					});
				},

				function(done){
					agent.get(`/${username}/${model}/viewpoints/${viewpointId}`).expect(200, function(err , res){

						expect(res.body.name).to.equal(viewpoint.name);
						expect(res.body.clippingPlanes).to.deep.equal(viewpoint.clippingPlanes);
						expect(res.body.viewpoint.up).to.deep.equal(viewpoint.viewpoint.up);
						expect(res.body.viewpoint.position).to.deep.equal(viewpoint.viewpoint.position);
						expect(res.body.viewpoint.look_at).to.deep.equal(viewpoint.viewpoint.look_at);
						expect(res.body.viewpoint.view_dir).to.deep.equal(viewpoint.viewpoint.view_dir);
						expect(res.body.viewpoint.right).to.deep.equal(viewpoint.viewpoint.right);

						return done(err);

					});
				}
			], done);

		});

		it("with screenshot should succeed", function(done){

			let viewpoint = Object.assign({"name":"View test", "viewpoint": {}}, baseView);
			viewpoint.screenshot = {};
			viewpoint.screenshot.base64 = pngBase64;

			let viewpointId;

			async.series([
				function(done){
					agent.post(`/${username}/${model}/viewpoints/`)
					.send(viewpoint)
					.expect(200 , function(err, res){
						viewpointId = res.body._id;
						return done(err);
					});
				},

				function(done){
					agent.get(`/${username}/${model}/viewpoints/${viewpointId}/`).expect(200, function(err , res){

						expect(res.body.screenshot.thumbnail).to.equal(`${username}/${model}/viewpoints/${viewpointId}/thumbnail.png`);
						return done(err);

					});
				}
			], done);

		});

		it("change name should succeed", function(done){

			let viewpoint = Object.assign({"name":"View test"}, baseView, { status: "open"});
			let viewpointId;
			let newName = { name: "New viewpoint name"};
			async.series([
				function(done){
					agent.post(`/${username}/${model}/viewpoints/`)
					.send(viewpoint)
					.expect(200 , function(err, res){
						viewpointId = res.body._id;
						return done(err);
						
					});
				},
				function(done){
					agent.put(`/${username}/${model}/viewpoints/${viewpointId}/`)
					.send(newName)
					.expect(200, done);
				},
				function(done){
					agent.get(`/${username}/${model}/viewpoints/${viewpointId}/`)
					.expect(200, function(err, res){
						expect(res.body.name === newName.name);
						done(err);
					});
				},
			], done);
		});

		it("change viewpoint should fail", function(done){

			let viewpoint = Object.assign({"name":"View test"}, baseView, { status: "open"});
			let viewpointId;
			let newView = {
				"viewpoint":{
					"up":[1,1,1],
					"position":[12,13,35],
					"look_at":[0,0,1],
					"view_dir":[-1,0,1],
					"right":[0,1,0]
				}
			};
			async.series([
				function(done){
					agent.post(`/${username}/${model}/viewpoints/`)
					.send(viewpoint)
					.expect(200 , function(err, res){
						viewpointId = res.body._id;
						return done(err);
						
					});
				},
				function(done){
					agent.put(`/${username}/${model}/viewpoints/${viewpointId}/`)
					.send(newView)
					.expect(400, done);
				},
			], done);
		});

	});

});

