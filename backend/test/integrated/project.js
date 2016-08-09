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
let C = require('../../constants');
let async = require('async');
let Role = require('../../models/role');
let ProjectSetting = require('../../models/projectSetting');
let User = require('../../models/user');
describe('Project', function () {
	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'project_username';
	let password = 'password';
	let email = 'test3drepo_project@mailinator.com';
	let project = 'project1';
	let desc = 'desc';
	let type = 'type';

	before(function(done){

		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');

			helpers.signUpAndLogin({
				server, request, agent, expect, User, systemLogger,
				username, password, email,
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

	it('should be created successfully', function(done){

		agent.post(`/${username}/${project}`)
		.send({ desc, type })
		.expect(200, function(err ,res) {

			expect(res.body.project).to.equal(project);

			if(err){
				return done(err);
			}

			agent.get(`/${username}/${project}.json`)
			.expect(200, function(err, res){
				expect(res.body.desc).to.equal(desc);
				expect(res.body.type).to.equal(type);
				done(err);
			})
			
		});
	});

	it('update settings should be successful', function(done){

		let body = {

				mapTile: {
					lat: 123,
					lon: 234,
					y: 5
				},
				unit: 'meter'

		};
		
		agent.put(`/${username}/${project}/settings`)
		.send(body).expect(200, function(err ,res) {

			expect(res.body.properties).to.deep.equal(body);

			if(err){
				return done(err);
			}

			agent.get(`/${username}/${project}.json`)
			.expect(200, function(err, res){
				expect(res.body.properties).to.deep.equal(body);
				done(err);
			})
			
		});
	});

	it('should return error message if project name already exists', function(done){

		agent.post(`/${username}/${project}`)
		.send({ desc, type })
		.expect(400, function(err ,res) {
			expect(res.body.value).to.equal(responseCodes.PROJECT_EXIST.value);
			done(err);
		});
	});


	C.REPO_BLACKLIST_PROJECT.forEach(projectName => {


		it(`should return error message if project name is blacklisted - ${projectName}`, function(done){

			if([
				'database',
				'verify',
				'forgot-password',
				'subscriptions'
			].indexOf(projectName) !== -1){
				//skip these project name because they are actually other APIs.
				return done();
			}

			agent.post(`/${username}/${projectName}`)
			.send({ desc, type })
			.expect(400, function(err ,res) {
				expect(res.body.value).to.equal(responseCodes.BLACKLISTED_PROJECT_NAME.value);
				done(err);
			});
		});

	});



	it('should return error message if project name contains spaces', function(done){

		agent.post('/' + username + '/you%20are%20genius')
		.send({ desc, type })
		.expect(400, function(err ,res) {
			expect(res.body.value).to.equal(responseCodes.INVALID_PROJECT_NAME.value);
			done(err);
		});
	});


	it('should return error if creating a project in a database that doesn\'t exists or not authorized for', function(done){

		agent.post(`/${username} + '_someonelese' /${project}`)
		.send({ desc, type })
		.expect(401, function(err ,res) {
			done(err);
		});
	});


	describe('Delete a project', function(){

		let username = 'projectshared';
		let password = 'password';
		let project = 'sample_project';

		let collaboratorUsername = 'testing';

		before(function(done){
			async.series([
				function logout(done){
					agent.post('/logout').send({}).expect(200, done);
				},
				function login(done){
					agent.post('/login').send({
						username, password
					}).expect(200, done);
				}, function(done){
					// check if the project is shared and roles are in place
					Role.findByRoleID(`${username}.${project}.viewer`).then(role => {
						expect(role).to.not.be.null;
						return Role.findByRoleID(`${username}.${project}.collaborator`);
					}).then(role => {
						expect(role).to.not.be.null;
						done();
					});
				}, function(done){
					// check if the project is shared and roles are in place
					ProjectSetting.findById({account: username, project: project}, project).then(setting => {
						expect(setting).to.not.be.null;
						done();
					});
				}, function(done){
					// check if the project is shared and roles are in place
					return User.findByUserName(collaboratorUsername).then(user => {
						expect(user.roles.find(role => role.role === `${project}.collaborator` && role.db === username)).to.not.be.undefined;
						done();
					});
				}
			], done);

		});


		it('should success', function(done){
			agent.delete(`/${username}/${project}`).expect(200, done);
		});

		it('should fail if delete again', function(done){
			agent.delete(`/${username}/${project}`).expect(400, function(err, res){
				expect(res.body.value).to.equal(responseCodes.PROJECT_NOT_FOUND.value);
				done(err);
			});
		});

		it('should remove all the roles in roles collection', function(){
			return Role.findByRoleID(`${username}.${project}.viewer`).then(role => {
				expect(role).to.be.null;
				return Role.findByRoleID(`${username}.${project}.collaborator`);
			}).then(role => {
				expect(role).to.be.null;
			});
		});

		it('should remove setting in settings collection', function() {
			return ProjectSetting.findById({account: username, project: project}, project).then(setting => {
				expect(setting).to.be.null;
			});
		});

		it('should remove role from collaborator user.roles', function(){
			return User.findByUserName(collaboratorUsername).then(user => {
				expect(user.roles.find(role => role.role === `${project}.collaborator` && role.db === username)).to.be.undefined;
			});
		});

	})
});