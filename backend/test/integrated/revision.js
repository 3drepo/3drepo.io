'use strict';

/**
 *  Copyright (C) 2016 3D Repo Ltd
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
let C = require('../../constants');
let async = require('async');
let Role = require('../../models/role');
let ProjectSetting = require('../../models/projectSetting');
let User = require('../../models/user');
let config = require('../../config');
let fs = require('fs');

describe('Revision', function () {

	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'rev';
	let password = '123456';
	let project = 'monkeys';
	let revisions;

	before(function(done){

		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');

			agent = request.agent(server);
			agent.post('/login')
			.send({ username, password })
			.expect(200, function(err, res){
				expect(res.body.username).to.equal(username);
				done(err);
			});

		});

	});

	after(function(done){

		server.close(function(){
			console.log('API test server is closed');
			done();
		});

	});


	it('list revisions should sccuess', function(done){
		agent.get(`/${username}/${project}/revisions.json`)
		.expect(200, function(err, res){
			expect(res.body.length).to.equal(3);
			expect(res.body[0]).to.have._id;
			expect(res.body[0]).to.have.timestamp;
			expect(res.body[0]).to.have.author;
			revisions = res.body;
			done(err);
		});
	})


	it('get x3d mp by revision id should success', function(done){
		agent.get(`/${username}/${project}/revision/${revisions[0]._id}.x3d.mp`)
		.expect(200, function(err, res){
			done(err);
		});
	});

	it('get x3d mp by revision tag should success', function(done){

		let revWithTag = revisions.find(rev => rev.tag);
		agent.get(`/${username}/${project}/revision/${revWithTag.tag}.x3d.mp`)
		.expect(200, function(err, res){
			done(err);
		});
	});

	it('get non existing rev should fail', function(done){

		let revWithTag = revisions.find(rev => rev.tag);
		agent.get(`/${username}/${project}/revision/invalidtag.x3d.mp`)
		.expect(404, function(err, res){
			done(err);
		});
	});

	it('get issues by revision id should success', function(done){
		agent.get(`/${username}/${project}/revision/${revisions[0]._id}/issues.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});

	it('get issues by revision tag should success', function(done){
		let revWithTag = revisions.find(rev => rev.tag);
		agent.get(`/${username}/${project}/revision/${revWithTag.tag}/issues.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});

	it('upload with exisitng tag name should fail', function(done){

		let revWithTag = revisions.find(rev => rev.tag);
		agent.post(`/${username}/${project}/upload`)
		.field('tag', revWithTag.tag)
		.attach('file', __dirname + '/../../statics/3dmodels/8000cubes.obj')
		.expect(400, function(err, res){
			expect(res.body.value).to.equal(responseCodes.DUPLICATE_TAG.value)
			done(err);
		});

	});

	it('upload with invalid tag name should fail', function(done){

		agent.post(`/${username}/${project}/upload`)
		.field('tag', 'a!b')
		.attach('file', __dirname + '/../../statics/3dmodels/8000cubes.obj')
		.expect(400, function(err, res){
			expect(res.body.value).to.equal(responseCodes.INVALID_TAG_NAME.value)
			done(err);
		});

	});
});