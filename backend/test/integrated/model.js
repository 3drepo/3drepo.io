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
	let password = 'project_username';
	let project = 'project1';
	let projectFed = 'projectFed1';
	let projectGroup = 'projectgroup'
	let desc = 'desc';
	let type = 'type';
	let unit = 'm';
	let code = '00011';


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
		let q = require('../../services/queue');
		q.channel.purgeQueue(q.workerQName).then(() => {
			server.close(function(){
				console.log('API test server is closed');
				done();
			});
		});
	});

	it('should be created successfully', function(done){

		async.series([
			callback => {

				agent.post(`/${username}/${project}`)
				.send({ desc, type, unit, code, projectGroup })
				.expect(200, function(err ,res) {
					console.log(res.body);
					expect(res.body.project).to.equal(project);
					callback(err);
				});

			},
			callback => {
				agent.get(`/${username}/${project}.json`)
				.expect(200, function(err, res){
					expect(res.body.desc).to.equal(desc);
					expect(res.body.type).to.equal(type);
					expect(res.body.properties.unit).to.equal(unit);
					expect(res.body.properties.code).to.equal(code);
					callback(err);
				});
			},

			callback => {
				agent.get(`/${username}.json`)
				.expect(200, function(err, res){

					const account = res.body.accounts.find(account => account.account === username);
					expect(account).to.exist;

					const pg = account.projectGroups.find(pg => pg.name === projectGroup);
					expect(pg).to.exist;

					console.log(pg);

					const model = pg.models.find(model => model.project === project);
					expect(model).to.exist;

					callback(err);
				});
			}
		] , err => done(err));

	});


	it('should fail if project group supplied is not found', function(done){

		agent.post(`/${username}/project2`)
		.send({ desc, type, unit, code, projectGroup: 'noexist' })
		.expect(404, function(err ,res) {
			expect(res.body.value).to.equal(responseCodes.PROJECT_NOT_FOUND.value);
			done(err);
		});

	});

	it('should fail if no unit specified', function(done){

		agent.post(`/${username}/project3`)
		.send({ desc, type })
		.expect(400, function(err ,res) {

			expect(res.body.value).to.equal(responseCodes.PROJECT_NO_UNIT.value);
			done(err);
			
		});
	});

	it('update project code with invalid format', function(done){


		function updateProjectCode(code, done){
			agent.put(`/${username}/project4/settings`)
			.send({code}).expect(400, function(err ,res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_PROJECT_CODE.value);
				done(err);
			});
		}

		async.series([
			function(done){
				updateProjectCode('$', done)
			}, 
			function(done){
				updateProjectCode('123456', done)
			}
		], done)

	});

	it('update issues type with duplicate values', function(done){
			agent.put(`/${username}/project5/settings`)
			.send({
				topicTypes: ['For Info', 'for info']
			}).expect(400, function(err ,res) {
				expect(res.body.value).to.equal(responseCodes.ISSUE_DUPLICATE_TOPIC_TYPE.value);
				done(err);
			});
	});
	

	it('update settings should be successful', function(done){

		let body = {

				mapTile: {
					lat: 123,
					lon: 234,
					y: 5
				},
				unit: 'cm',
				code: '00222',
				topicTypes: ['For Info', '3D Repo', 'Vr']

		};
		
		let expectedReturn = {

				mapTile: {
					lat: 123,
					lon: 234,
					y: 5
				},
				unit: 'cm',
				code: '00222',
				topicTypes: [{
					label: 'For Info', 
					value: 'for_info'
				}, {
					label: '3D Repo',
					value: '3d_repo'
				}, {
					label: 'Vr',
					value: 'vr'
				}]

		};

		agent.put(`/${username}/project6/settings`)
		.send(body).expect(200, function(err ,res) {

			expect(res.body.properties).to.deep.equal(expectedReturn);

			if(err){
				return done(err);
			}

			agent.get(`/${username}/project6.json`)
			.expect(200, function(err, res){
				expect(res.body.properties).to.deep.equal(expectedReturn);
				done(err);
			})
			
		});
	});



	it('should return error message if project name already exists', function(done){

		agent.post(`/${username}/project7`)
		.send({ desc, type, unit })
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
			.send({ desc, type, unit })
			.expect(400, function(err ,res) {
				expect(res.body.value).to.equal(responseCodes.BLACKLISTED_PROJECT_NAME.value);
				done(err);
			});
		});

	});



	it('should return error message if project name contains spaces', function(done){

		agent.post('/' + username + '/you%20are%20genius')
		.send({ desc, type, unit })
		.expect(400, function(err ,res) {
			expect(res.body.value).to.equal(responseCodes.INVALID_PROJECT_NAME.value);
			done(err);
		});
	});


	it('should return error if creating a project in a database that doesn\'t exists or not authorized for', function(done){

		agent.post(`/${username}_someonelese/${project}`)
		.send({ desc, type, unit })
		.expect(401, function(err ,res) {
			done(err);
		});
	});

	describe('Download latest file', function(){ 

		let username = 'testing';
		let password = 'testing';
		let project = 'testproject';

		before(function(done){
			async.series([
				function logout(done){
					agent.post('/logout').send({}).expect(200, done);
				},
				function login(done){
					agent.post('/login').send({
						username, password
					}).expect(200, done);
				}
			], done);
		});

		it('should success and get the latest file', function(done){
			agent.get(`/${username}/${project}/download/latest`).expect(200, function(err, res){

				expect(res.headers['content-disposition']).to.equal('attachment;filename=3DrepoBIM.obj');
				
				done(err);
			});
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
				},
				// function(done){
				// 	// check if the project is shared and roles are in place
				// 	Role.findByRoleID(`${username}.${project}.viewer`).then(role => {
				// 		expect(role).to.not.be.null;
				// 		return Role.findByRoleID(`${username}.${project}.collaborator`);
				// 	}).then(role => {
				// 		expect(role).to.not.be.null;
				// 		done();
				// 	});
				// },
				// function(done){
				// 	// check if the project is shared and roles are in place
				// 	ProjectSetting.findById({account: username, project: project}, project).then(setting => {
				// 		expect(setting).to.not.be.null;
				// 		done();
				// 	});
				// },
				// function(done){
				// 	// check if the project is shared and roles are in place
				// 	return User.findByUserName(collaboratorUsername).then(user => {
				// 		expect(user.roles.find(role => role.role === `${project}.collaborator` && role.db === username)).to.not.be.undefined;
				// 		done();
				// 	});
				// }
			], done);

		});


		it('should success', function(done){
			agent.delete(`/${username}/${project}`).expect(200, done);
		});

		it('should fail if delete again', function(done){
			agent.delete(`/${username}/${project}`).expect(404, function(err, res){
				expect(res.body.value).to.equal(responseCodes.PROJECT_NOT_FOUND.value);
				done(err);
			});
		});

		// it('should remove all the roles in roles collection', function(){
		// 	return Role.findByRoleID(`${username}.${project}.viewer`).then(role => {
		// 		expect(role).to.be.null;
		// 		return Role.findByRoleID(`${username}.${project}.collaborator`);
		// 	}).then(role => {
		// 		expect(role).to.be.null;
		// 	});
		// });

		it('should remove setting in settings collection', function() {
			return ProjectSetting.findById({account: username, project: project}, project).then(setting => {
				expect(setting).to.be.null;
			});
		});

		// it('should remove role from collaborator user.roles', function(){
		// 	return User.findByUserName(collaboratorUsername).then(user => {
		// 		expect(user.roles.find(role => role.role === `${project}.collaborator` && role.db === username)).to.be.undefined;
		// 	});
		// });

		it('should be removed from collaborator\'s project listing', function(done){

			const agent2 = request.agent(server);

			async.series([
				callback => {
					agent2.post('/login').send({ username: 'testing', password: 'testing' }).expect(200, callback);
				},
				callback => {
					agent2.get(`/testing.json`).expect(200, function(err, res){
						
						const account = res.body.accounts.find(account => account.account === username);
						expect(account).to.not.exist;

						// const model = account.projects.find(myProject => myProject.project === project);
						// expect(model).to.not.exist;

						callback(err);
					});
				}
			], done);


		});

		it('should be removed from project group', function(done){
			agent.get(`/${username}.json`).expect(200, function(err, res){
				
				const account = res.body.accounts.find(account => account.account === username);
				expect(account).to.exist;

				const pg = account.projectGroups.find(pg => pg.name === 'project1');
				expect(pg).to.exist;

				const model = pg.models.find(model => model.project === 'sample_project');
				expect(model).to.not.exist;

				done(err);
			});
		});

	})
});