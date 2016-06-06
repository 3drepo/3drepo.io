'use strict';

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

let request = require('supertest');
let expect = require('chai').expect;
let app = require("../../services/api.js").createApp(
	{ session: require('express-session')({ secret: 'testing'}) }
);
let log_iface = require("../../logger.js");
let systemLogger = log_iface.systemLogger;
let responseCodes = require("../../response_codes.js");
let helpers = require("./helpers");


describe('Creating an issue', function () {

	let Issue = require('../../models/issue');
	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'issue_username';
	let password = 'password';
	let email = 'test3drepo@mailinator.com';
	let project = 'project1';

	let desc = 'desc';
	let type = 'type';

	let baseIssue = { 
		"viewpoint":{
			"up":[0,1,0],
			"position":[38,38 ,125.08011914810137],
			"look_at":[0,0,-163.08011914810137],
			"view_dir":[0,0,-1],
			"right":[1,0,0],
			"unityHeight ":3.537606904422707,
			"fov":2.1124830653010416,
			"aspect_ratio":0.8750189337327384,
			"far":276.75612077194506 ,
			"near":76.42411012233212,
			"clippingPlanes":[]
		},
		"scale":1,
		"creator_role":"testproject.collaborator",
		"assigned_roles":["testproject.collaborator"],
	};

	before(function(done){

		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');

			helpers.signUpAndLoginAndCreateProject({
				server, request, agent, expect, User, systemLogger,
				username, password, email, project, desc, type,
				done: function(err, _agent){
					agent = _agent;
					done(err);
				}
			});
			
		});

	});

	after(function(done){
		server.close(function(){
			console.log('API test server is closed');
			done();
		});
	});

	it('should succee', function(done){

		let issue = Object.assign({"name":"Issue test"}, baseIssue);

		agent.post(`/${username}/${project}/issues.json`)
		.send({ data: JSON.stringify(issue) })
		.expect(200 , function(err, res){
			
			expect(res.body.issue.name).to.equal(issue.name);
			expect(res.body.issue.scale).to.equal(issue.scale);
			expect(res.body.issue.creator_role).to.equal(issue.creator_role);
			expect(res.body.issue.assigned_roles).to.deep.equal(issue.assigned_roles);
			expect(res.body.issue.viewpoint.up).to.deep.equal(issue.viewpoint.up);
			expect(res.body.issue.viewpoint.position).to.deep.equal(issue.viewpoint.position);
			expect(res.body.issue.viewpoint.look_at).to.deep.equal(issue.viewpoint.look_at);
			expect(res.body.issue.viewpoint.view_dir).to.deep.equal(issue.viewpoint.view_dir);
			expect(res.body.issue.viewpoint.right).to.deep.equal(issue.viewpoint.right);
			expect(res.body.issue.viewpoint.unityHeight).to.equal(issue.viewpoint.unityHeight);
			expect(res.body.issue.viewpoint.fov).to.equal(issue.viewpoint.fov);
			expect(res.body.issue.viewpoint.aspect_ratio).to.equal(issue.viewpoint.aspect_ratio);
			expect(res.body.issue.viewpoint.far).to.equal(issue.viewpoint.far);
			expect(res.body.issue.viewpoint.near).to.equal(issue.viewpoint.near);
			expect(res.body.issue.viewpoint.clippingPlanes).to.deep.equal(issue.viewpoint.clippingPlanes);

			if(err){
				return done(err);
			}

			//also check it is in database
			Issue.findByUID({ account: username, project: project}, res.body._id).then(_issue => {

				expect(_issue.name).to.equal(issue.name);
				expect(_issue.scale).to.equal(issue.scale);
				expect(_issue.creator_role).to.equal(issue.creator_role);
				expect(_issue.assigned_roles).to.deep.equal(issue.assigned_roles);
				expect(_issue.viewpoint.up).to.deep.equal(issue.viewpoint.up);
				expect(_issue.viewpoint.position).to.deep.equal(issue.viewpoint.position);
				expect(_issue.viewpoint.look_at).to.deep.equal(issue.viewpoint.look_at);
				expect(_issue.viewpoint.view_dir).to.deep.equal(issue.viewpoint.view_dir);
				expect(_issue.viewpoint.right).to.deep.equal(issue.viewpoint.right);
				expect(_issue.viewpoint.unityHeight).to.equal(issue.viewpoint.unityHeight);
				expect(_issue.viewpoint.fov).to.equal(issue.viewpoint.fov);
				expect(_issue.viewpoint.aspect_ratio).to.equal(issue.viewpoint.aspect_ratio);
				expect(_issue.viewpoint.far).to.equal(issue.viewpoint.far);
				expect(_issue.viewpoint.near).to.equal(issue.viewpoint.near);
				expect(_issue.viewpoint.clippingPlanes).to.deep.equal(issue.viewpoint.clippingPlanes);

				done();
			}).catch( err => {
				done(err);
			});
			
		});

	});

	it('without name should fail', function(done){

		let issue = baseIssue;

		agent.post(`/${username}/${project}/issues.json`)
		.send({ data: JSON.stringify(issue) })
		.expect(400 , function(err, res){
			expect(res.body.value).to.equal(responseCodes.ISSUE_NO_NAME.value);
			done(err);
		});
	});

	it('with pin should succee and pin info is saved', function(done){

		let issue = Object.assign({
			"name":"Issue test",
			"norm": [0.9999999319099296, 0.00006146719401852714, -0.000363870746590937],
			"position": [33.167440465643935, 12.46054749529149, -46.997271893235435]
		}, baseIssue);

		agent.post(`/${username}/${project}/issues.json`)
		.send({ data: JSON.stringify(issue) })
		.expect(200 , function(err, res){
			
			expect(res.body.issue.norm).to.deep.equal(issue.norm);
			expect(res.body.issue.position).to.deep.equal(issue.position);

			if(err){
				return done(err);
			}
			
			//also check it is in database
			Issue.findByUID({ account: username, project: project}, res.body._id).then(_issue => {

				expect(_issue.norm).to.deep.equal(issue.norm);
				expect(_issue.position).to.deep.equal(issue.position);
				done();

			}).catch( err => {
				done(err);
			});

		});
	});

	it('with scribble should succee and scribble is saved', function(done){

		let issue = Object.assign({
			"name":"Issue test",
			"scribble": "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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/9wWZDWhBi7eXxgAAAABJRU5ErkJggg=="
		}, baseIssue);

		agent.post(`/${username}/${project}/issues.json`)
		.send({ data: JSON.stringify(issue) })
		.expect(200 , function(err, res){
			
			expect(res.body.issue.scribble).to.deep.equal(issue.scribble);

			if(err){
				return done(err);
			}
			
			//also check it is in database
			Issue.findByUID({ account: username, project: project}, res.body._id).then(_issue => {

				expect(_issue.scribble).to.equal(issue.scribble);
				done();

			}).catch( err => {
				done(err);
			});

		});

	});



});
