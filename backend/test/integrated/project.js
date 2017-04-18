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


describe('Project groups', function () {

	let server;
	let agent;
	let username = 'projectuser';
	let password = 'projectuser';

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


	it('should able to create project group', function(done){

		const projectgroup = {
			_id: 'project1'
		};

		async.series([
			
			callback => {
				agent.post(`/${username}/project-groups`)
				.send(projectgroup)
				.expect(200, function(err, res){
					callback(err);
				});
			},

			callback => {
				agent.get(`/${username}.json`)
				.expect(200, function(err, res){
					const pg = res.body.projectGroups.find(pg => pg._id === projectgroup._id);
					expect(pg).to.exist;
					callback(err);
				});
			}

		], (err, res) => done(err));
	});


	it('should fail to create project group with name default', function(done){
		agent.post(`/${username}/project-groups`)
		.send({_id: 'default'})
		.expect(400, function(err, res){
			expect(res.body.value).to.equal(responseCodes.INVALID_PROJECT_NAME.value);
			done(err);
		});
	});


	it('should fail to create project group with dup name', function(done){

		const projectgroup = {
			_id: 'project_exists'
		};

		agent.post(`/${username}/project-groups`)
		.send(projectgroup)
		.expect(400, function(err, res){
			expect(res.body.value).to.equal(responseCodes.PROJECT_EXIST.value);
			done(err);
		});
	});


	it('should be able to update project group', function(done){


		const projectgroup = {
			_id: 'project2_new',
			permissions: [{
				user: 'testing',
				permissions: ['create_model', 'view_project']
			}]
		};

		async.series([
			
			callback => {
				agent.put(`/${username}/project-groups/project2`)
				.send(projectgroup)
				.expect(200, function(err, res){
					callback(err);
				});
			},

			callback => {
				agent.get(`/${username}.json`)
				.expect(200, function(err, res){
					const pg = res.body.projectGroups.find(pg => pg._id === projectgroup._id);
					expect(pg).to.exist;
					expect(pg.permissions).to.deep.equal(projectgroup.permissions);
					callback(err);
				});
			}

		], (err, res) => done(err));
	});


	it('should fail to update project group for invalid permissions', function(done){

		const projectgroup = {
			_id: 'project3',
			permissions: [{
				user: 'testing',
				permissions: ['create_issue']
			}]
		};

		agent.put(`/${username}/project-groups/${projectgroup._id}`)
		.send(projectgroup)
		.expect(400, function(err, res){
			expect(res.body.value).to.equal(responseCodes.INVALID_PERM.value);
			done(err);
		});
	});


	it('should able to delete project group', function(done){

		const projectgroup = {
			_id: 'project4'
		};

		async.series([
			
			callback => {
				agent.delete(`/${username}/project-groups/${projectgroup._id}`)
				.expect(200, function(err, res){
					callback(err);
				});

			},

			callback => {
				agent.get(`/${username}.json`)
				.expect(200, function(err, res){
					const pg = res.body.projectGroups.find(pg => pg._id === projectgroup._id);
					expect(pg).to.not.exist;
					callback(err);
				});
			}

		], (err, res) => done(err));

	});

	it('should fail to update a project group that doesnt exist', function(done){
		agent.put(`/${username}/project-groups/notexist`)
		.send({})
		.expect(404, function(err, res){
			expect(res.body.value).to.equal(responseCodes.PROJECT_NOT_FOUND.value);
			done(err);
		});
	});

	it('should fail to delete a project group that doesnt exist', function(done){
		agent.delete(`/${username}/project-groups/notexist`)
		.expect(404, function(err, res){
			expect(res.body.value).to.equal(responseCodes.PROJECT_NOT_FOUND.value);
			done(err);
		});
	});

});