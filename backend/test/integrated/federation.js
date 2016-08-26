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

describe('Federated Project', function () {

	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'fed';
	let password = '123456';
	let subProjects = ['proj1', 'proj2'];
	let desc = 'desc';
	let type = 'type';
	let fedProject = 'fedproj';

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

		q.channel.assertQueue(q.workerQName, { durable: true }).then(() => {
			return q.channel.purgeQueue(q.workerQName);
		}).then(() => {
			server.close(function(){
				console.log('API test server is closed');
				done();
			});
		});
	});

	it('should be created successfully', function(done){
		this.timeout(5000);

		let q = require('../../services/queue');
		let corId;

		//fake a response from bouncer;
		setTimeout(function(){
			q.channel.assertQueue(q.workerQName, { durable: true }).then(info => {
				expect(info.messageCount).to.equal(1);
				return q.channel.get(q.workerQName);
			}).then(res => {
				corId = res.properties.correlationId;
				return q.channel.assertQueue(q.callbackQName, { durable: true });
			}).then(() => {
				//send fake job done message to the queue;
				return q.channel.sendToQueue(q.callbackQName, 
					new Buffer(JSON.stringify({ value: 0})), 
					{
						correlationId: corId, 
						persistent: true 
					}
				);
			}).catch(err => {
				done(err);
			});

		}, 1000);

		agent.post(`/${username}/${fedProject}`)
		.send({ 
			desc, 
			type, 
			subProjects:[{
				"database": username,
				"project": subProjects[0]
			}] 
		})
		.expect(200, function(err ,res) {

			expect(res.body.project).to.equal(fedProject);

			if(err){
				return done(err);
			}

			async.series([
				done => {
					agent.get(`/${username}/${fedProject}.json`)
					.expect(200, function(err, res){
						expect(res.body.desc).to.equal(desc);
						expect(res.body.type).to.equal(type);
						done(err);
					})
				},
				done => {
					agent.get(`/${username}.json`)
					.expect(200, function(err, res){
						let account = res.body.accounts.find(a => a.account === username);
						let fed = account.fedProjects.find(p => p.project === fedProject);
						expect(fed.federate).to.equal(true);
						done(err);
					})
				}
			], err => {
				done(err);
			})

			
		});
	});


	it('should be created successfully even if no sub projects are specified', function(done){
		let emptyFed = 'emptyFed';

		agent.post(`/${username}/${emptyFed}`)
		.send({ 
			desc, 
			type, 
			subProjects:[] 
		})
		.expect(200, function(err ,res) {

			expect(res.body.project).to.equal(emptyFed);

			if(err){
				return done(err);
			}

			async.series([
				done => {
					agent.get(`/${username}/${emptyFed}.json`)
					.expect(200, function(err, res){
						expect(res.body.desc).to.equal(desc);
						expect(res.body.type).to.equal(type);
						done(err);
					})
				},
				done => {
					agent.get(`/${username}.json`)
					.expect(200, function(err, res){
						let account = res.body.accounts.find(a => a.account === username);
						let fed = account.fedProjects.find(p => p.project === emptyFed);
						expect(fed.federate).to.equal(true);
						done(err);
					})
				}
			], err => {
				done(err);
			})

			
		});
	});

	it('should fail if create federation using existing project name (fed or model)', function(done){


		agent.post(`/${username}/${subProjects[0]}`)
		.send({ 
			desc, 
			type, 
			subProjects:[{
				"database": username,
				"project": subProjects[0]
			}] 
		})
		.expect(400, function(err ,res) {

			expect(res.body.value).to.equal(responseCodes.PROJECT_EXIST.value);
			done(err);

		});
	});

	it('should fail if create federation using invalid project name', function(done){


		agent.post(`/${username}/a%20c`)
		.send({ 
			desc, 
			type, 
			subProjects:[{
				"database": 'testing',
				"project": 'testproject'
			}] 
		})
		.expect(400, function(err ,res) {

			expect(res.body.value).to.equal(responseCodes.INVALID_PROJECT_NAME.value);
			done(err);

		});
	});



	it('should fail if create federation from models in a different database', function(done){

		agent.post(`/${username}/badfed`)
		.send({ 
			desc, 
			type, 
			subProjects:[{
				"database": 'testing',
				"project": 'testproject'
			}] 
		})
		.expect(400, function(err ,res) {

			expect(res.body.value).to.equal(responseCodes.FED_MODEL_IN_OTHER_DB.value);
			done(err);

		});
	});

	it('should accept only one model if models are duplicated', function(done){

		this.timeout(5000);

		let q = require('../../services/queue');
		let corId;

		//fake a response from bouncer;
		setTimeout(function(){
		
			q.channel.assertQueue(q.workerQName, { durable: true }).then(info => {

				expect(info.messageCount).to.equal(1);
				return q.channel.get(q.workerQName);

			}).then(res => {
				corId = res.properties.correlationId;
				
				let json = fs.readFileSync(config.cn_queue.shared_storage + '/' + corId + '/obj.json', {
					encoding: 'utf8'
				});

				json = JSON.parse(json);
			
				//check the request json file

				expect(json.subProjects.length).to.equal(1);

				return q.channel.assertQueue(q.callbackQName, { durable: true });

			}).then(() => {
				//send fake job done message to the queue;
				return q.channel.sendToQueue(q.callbackQName, 
					new Buffer(JSON.stringify({ value: 0})), 
					{
						correlationId: corId, 
						persistent: true 
					}
				);
			}).catch(err => {
				done(err);
			});

		}, 1000);

		q.channel.assertQueue(q.workerQName, { durable: true }).then(() => {
			return q.channel.purgeQueue(q.workerQName);
		}).then(() => {
			agent.post(`/${username}/dupfed`)
			.send({ 
				desc, 
				type, 
				subProjects:[{
					"database": username,
					"project": subProjects[0]
				}, {
					"database": username,
					"project": subProjects[0]
				}] 
			})
			.expect(200, function(err ,res) {
				console
				done(err);
			});
		});

	});


	it('should fail if create fed of fed', function(done){
		agent.post(`/${username}/fedfed`)
		.send({ 
			desc, 
			type, 
			subProjects:[{
				"database": username,
				"project": fedProject
			}] 
		})
		.expect(400, function(err ,res) {

			expect(res.body.value).to.equal(responseCodes.FED_MODEL_IS_A_FED.value);
			done(err);

		});
	});

	it('update should fail if project is not a fed', function(done){

		agent.put(`/${username}/${subProjects[0]}`)
		.send({ 
			desc, 
			type, 
			subProjects:[{
				"database": username,
				"project": subProjects[0]
			}] 
		})
		.expect(400, function(err ,res) {

			expect(res.body.value).to.equal(responseCodes.PROJECT_IS_NOT_A_FED.value);
			done(err);

		});
	});

	it('update should fail if project does not exist', function(done){
		agent.put(`/${username}/nonexistproject`)
		.send({ 
			desc, 
			type, 
			subProjects:[{
				"database": username,
				"project": subProjects[0]
			}] 
		})
		.expect(400, function(err ,res) {

			expect(res.body.value).to.equal(responseCodes.PROJECT_NOT_FOUND.value);
			done(err);

		});
	});

	it('update should success if project is a federation', function(done){
		this.timeout(5000);

		let q = require('../../services/queue');
		let corId;

		//fake a response from bouncer;
		setTimeout(function(){
			q.channel.assertQueue(q.workerQName, { durable: true }).then(info => {
				expect(info.messageCount).to.equal(1);
				return q.channel.get(q.workerQName);
			}).then(res => {
				corId = res.properties.correlationId;
				return q.channel.assertQueue(q.callbackQName, { durable: true });
			}).then(() => {
				//send fake job done message to the queue;
				return q.channel.sendToQueue(q.callbackQName, 
					new Buffer(JSON.stringify({ value: 0})), 
					{
						correlationId: corId, 
						persistent: true 
					}
				);
			}).catch(err => {
				done(err);
			});

		}, 1000);

		agent.put(`/${username}/${fedProject}`)
		.send({ 
			desc, 
			type, 
			subProjects:[{
				"database": username,
				"project": subProjects[1]
			}] 
		})
		.expect(200, function(err ,res) {

			expect(res.body.project).to.equal(fedProject);
			return done(err);
		});
	});
});