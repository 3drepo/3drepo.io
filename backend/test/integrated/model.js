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
let ModelSetting = require('../../models/modelSetting');
let User = require('../../models/user');
describe('Model', function () {
	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'project_username';
	let password = 'project_username';
	let model = 'project1';
	let modelFed = 'projectFed1';
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

				agent.post(`/${username}/${model}`)
				.send({ desc, type, unit, code, projectGroup })
				.expect(200, function(err ,res) {
					console.log(res.body);
					expect(res.body.model).to.equal(model);
					callback(err);
				});

			},
			callback => {
				agent.get(`/${username}/${model}.json`)
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

					const myModel = pg.models.find(_model => _model.model === model);
					expect(myModel).to.exist;

					callback(err);
				});
			}
		] , err => done(err));

	});


	it('should fail if project group supplied is not found', function(done){

		agent.post(`/${username}/model2`)
		.send({ desc, type, unit, code, projectGroup: 'noexist' })
		.expect(404, function(err ,res) {
			expect(res.body.value).to.equal(responseCodes.PROJECT_NOT_FOUND.value);
			done(err);
		});

	});

	it('should fail if no unit specified', function(done){

		agent.post(`/${username}/model3`)
		.send({ desc, type })
		.expect(400, function(err ,res) {

			expect(res.body.value).to.equal(responseCodes.MODEL_NO_UNIT.value);
			done(err);
			
		});
	});

	it('update model code with invalid format', function(done){


		function updateModelCode(code, done){

			let model = 'project4';

			agent.put(`/${username}/${model}/settings`)
			.send({code}).expect(400, function(err ,res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_MODEL_CODE.value);
				done(err);
			});
		}

		async.series([
			function(done){
				updateModelCode('$', done)
			}, 
			function(done){
				updateModelCode('123456', done)
			}
		], done)

	});

	it('update issues type with duplicate values', function(done){

			let model = 'project5';

			agent.put(`/${username}/${model}/settings`)
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

		let mymodel = "project6";
		agent.put(`/${username}/${mymodel}/settings`)
		.send(body).expect(200, function(err ,res) {

			expect(res.body).to.deep.equal(expectedReturn);

			if(err){
				return done(err);
			}

			agent.get(`/${username}/${mymodel}.json`)
			.expect(200, function(err, res){
				expect(res.body.properties).to.deep.equal(expectedReturn);
				done(err);
			})
			
		});
	});



	it('should return error message if model name already exists', function(done){

		let model = 'project7';
		
		agent.post(`/${username}/${model}`)
		.send({ desc, type, unit })
		.expect(400, function(err ,res) {
			expect(res.body.value).to.equal(responseCodes.MODEL_EXIST.value);
			done(err);
		});
	});


	C.REPO_BLACKLIST_MODEL.forEach(modelName => {


		it(`should return error message if model name is blacklisted - ${modelName}`, function(done){

			if([
				'database',
				'verify',
				'forgot-password',
				'subscriptions',
				'projects'
			].indexOf(modelName) !== -1){
				//skip these model name because they are actually other APIs.
				return done();
			}

			agent.post(`/${username}/${modelName}`)
			.send({ desc, type, unit })
			.expect(400, function(err ,res) {
				expect(res.body.value).to.equal(responseCodes.BLACKLISTED_MODEL_NAME.value);
				done(err);
			});
		});

	});



	it('should return error message if model name contains spaces', function(done){

		agent.post('/' + username + '/you%20are%20genius')
		.send({ desc, type, unit })
		.expect(400, function(err ,res) {
			expect(res.body.value).to.equal(responseCodes.INVALID_MODEL_NAME.value);
			done(err);
		});
	});


	it('should return error if creating a model in a database that doesn\'t exists or not authorized for', function(done){

		agent.post(`/${username}_someonelese/${model}`)
		.send({ desc, type, unit })
		.expect(401, function(err ,res) {
			done(err);
		});
	});

	describe('Download latest file', function(){ 

		let username = 'testing';
		let password = 'testing';
		let model = 'testproject';

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
			agent.get(`/${username}/${model}/download/latest`).expect(200, function(err, res){

				expect(res.headers['content-disposition']).to.equal('attachment;filename=3DrepoBIM.obj');
				
				done(err);
			});
		});

	});


	describe('Delete a model', function(){

		let username = 'projectshared';
		let password = 'password';
		let model = 'sample_project';

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

			], done);

		});


		it('should success', function(done){
			agent.delete(`/${username}/${model}`).expect(200, done);
		});

		it('should fail if delete again', function(done){
			agent.delete(`/${username}/${model}`).expect(404, function(err, res){
				expect(res.body.value).to.equal(responseCodes.MODEL_NOT_FOUND.value);
				done(err);
			});
		});

		// it('should remove all the roles in roles collection', function(){
		// 	return Role.findByRoleID(`${username}.${model}.viewer`).then(role => {
		// 		expect(role).to.be.null;
		// 		return Role.findByRoleID(`${username}.${model}.collaborator`);
		// 	}).then(role => {
		// 		expect(role).to.be.null;
		// 	});
		// });

		it('should remove setting in settings collection', function() {
			return ModelSetting.findById({account: username, model: model}, model).then(setting => {
				expect(setting).to.be.null;
			});
		});

		// it('should remove role from collaborator user.roles', function(){
		// 	return User.findByUserName(collaboratorUsername).then(user => {
		// 		expect(user.roles.find(role => role.role === `${model}.collaborator` && role.db === username)).to.be.undefined;
		// 	});
		// });

		it('should be removed from collaborator\'s model listing', function(done){

			const agent2 = request.agent(server);

			async.series([
				callback => {
					agent2.post('/login').send({ username: 'testing', password: 'testing' }).expect(200, callback);
				},
				callback => {
					agent2.get(`/testing.json`).expect(200, function(err, res){
						
						const account = res.body.accounts.find(account => account.account === username);
						expect(account).to.not.exist;

						// const mm = account.models.find(m => m.model === model);
						// expect(mm).to.not.exist;

						callback(err);
					});
				}
			], done);


		});

		it('should be removed from model group', function(done){
			agent.get(`/${username}.json`).expect(200, function(err, res){
				
				const account = res.body.accounts.find(account => account.account === username);
				expect(account).to.exist;

				const pg = account.projectGroups.find(pg => pg.name === 'project1');
				expect(pg).to.exist;

				const myModel = pg.models.find(_model => _model.model === 'sample_project');
				expect(myModel).to.not.exist;

				done(err);
			});
		});

	})
});