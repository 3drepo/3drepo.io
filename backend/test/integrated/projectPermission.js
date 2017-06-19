'use strict';

/**
 *  Copyright (C) 2017 3D Repo Ltd
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

const request = require('supertest');
const expect = require('chai').expect;
const app = require("../../services/api.js").createApp(
	{ session: require('express-session')({ secret: 'testing'}) }
);
const log_iface = require("../../logger.js");
const systemLogger = log_iface.systemLogger;
const responseCodes = require("../../response_codes.js");
const async = require('async');


describe('Project Permissions', function () {

	let server;
	let agentCanCreateModel;
	let agentNoPermission;
	let agentCanUpdateProject;
	let agentProjectAdmin;

	const teamspace = 'projperm';
	const project = 'project1';

	const userCanCreateModel = {
		username: 'projectuser',
		password: 'projectuser'
	};

	const userCanUpdateProject = {
		username: 'projectuser4',
		password: 'projectuser4'
	}

	const userProjectAdmin = {
		username: 'projectuser3',
		password: 'projectuser3'
	};

	const userNoPermission = {
		username: 'testing',
		password: 'testing',
	};

	const modelDetail = {
		desc: 'desc', 
		type: 'type', 
		unit: 'm', 
		code: '00123', 
		project: project
	};

	before(function(done){
		server = app.listen(8080, function () {

			console.log('API test server is listening on port 8080!');

			async.parallel([ 

				done => {
					agentCanCreateModel = request.agent(server);
					agentCanCreateModel.post('/login')
					.send({ username: userCanCreateModel.username, password: userCanCreateModel.password })
					.expect(200, function(err, res){
						expect(res.body.username).to.equal(userCanCreateModel.username);
						done(err);
					});
				},

				done => {
					agentCanUpdateProject = request.agent(server);
					agentCanUpdateProject.post('/login')
					.send({ username: userCanUpdateProject.username, password: userCanUpdateProject.password })
					.expect(200, function(err, res){
						expect(res.body.username).to.equal(userCanUpdateProject.username);
						done(err);
					});
				},

				done => {
					agentProjectAdmin = request.agent(server);
					agentProjectAdmin.post('/login')
					.send({ username: userProjectAdmin.username, password: userProjectAdmin.password })
					.expect(200, function(err, res){
						expect(res.body.username).to.equal(userProjectAdmin.username);
						done(err);
					});
				},

				done => {
					agentNoPermission = request.agent(server);
					agentNoPermission.post('/login')
					.send({ username: userNoPermission.username, password: userNoPermission.password })
					.expect(200, function(err, res){
						expect(res.body.username).to.equal(userNoPermission.username);
						done(err);
					});
				}

			], done);

		});
	});

	after(function(done){
		server.close(function(){
			console.log('API test server is closed');
			done();
		});
	});

	it('user without create_model permission in a project cannot create model', function(done){

		const modelName = 'model001';

		agentNoPermission
		.post(`/${teamspace}/${modelName}`)
		.send(modelDetail)
		.expect(401, function(err, res){
			done(err);
		});

	});



	let modelId;

	it('user with create_model permission in a project can create model', function(done){

		const modelName = 'model001';
		
		agentCanCreateModel
		.post(`/${teamspace}/${modelName}`)
		.send(modelDetail)
		.expect(200, function(err, res){
			modelId = res.body.model;
			done(err);
		});
	});

	it('Users (non teamspace admin) have access to the model created by themselves', function(done){
		agentCanCreateModel
		.get(`/${teamspace}/${modelId}.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});

});