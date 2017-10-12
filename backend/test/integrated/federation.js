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
	{ session: require('express-session')({ secret: 'testing',  resave: false,   saveUninitialized: false }) }
);
let log_iface = require("../../logger.js");
let systemLogger = log_iface.systemLogger;
let responseCodes = require("../../response_codes.js");
let helpers = require("./helpers");
let C = require('../../constants');
let async = require('async');
let ModelSetting = require('../../models/modelSetting');
let User = require('../../models/user');
let config = require('../../config');
let fs = require('fs');
let unit = 'm';

describe('Federated Model', function () {

	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'fed';
	let password = '123456';
	let subModels = ['proj1', 'proj2'];
	let desc = 'desc';
	let type = 'type';
	let fedModelName = 'fedproj';
	let fedModelId;

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
			q.channel.assertQueue(q.modelQName, { durable: true }).then(() => {
				return q.channel.purgeQueue(q.modelQName);
			}).then(() => {
				server.close(function(){
					console.log('API test server is closed');
					done();
				});
			});
		});
	});

	it('should be created successfully', function(done){
		this.timeout(5000);

		let q = require('../../services/queue');
		let corId, appId;

		//fake a response from bouncer;
		async.series([
			done => {
				q.channel.assertQueue(q.workerQName, { durable: true }).then(info => {
					expect(info.messageCount).to.equal(1);
					return q.channel.get(q.workerQName);
				}).then(res => {
					corId = res.properties.correlationId;
					appId = res.properties.appId;
					return q.channel.assertExchange(q.callbackQName, 'direct', { durable: true });
				}).then(() => {
					//send fake job done message to the queue;
					return q.channel.publish(
						q.callbackQName,
						appId,
						new Buffer(JSON.stringify({ value: 0, database: username, project: fedModelName })), 
						{
							correlationId: corId, 
							persistent: true 
						}
					);
				}).catch(err => {
					done(err);
				});
			},
			done => {
				agent.post(`/${username}/${fedModelName}`)
				.send({ 
					desc, 
					type,
					unit,
					subModels:[{
						"database": username,
						"model": subModels[0]
					}] 
				})
				.expect(200, function(err ,res) {

					if(err){
						return done(err);
					}

					expect(res.body.name).to.equal(fedModelName);
					fedModelId = res.body.model;

					async.series([
						done => {
							agent.get(`/${username}/${fedModelId}.json`)
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
								let fed = account.fedModels.find(m => m.model === fedModelId);
								expect(fed.federate).to.equal(true);
								done(err);
							})
						}
					], err => {
						done(err);
					})

				});
			}
		], err => {
			done(err);
		});

	});


	it('should be created successfully even if no sub models are specified', function(done){
		let emptyFed = 'emptyFed';
		let emptyFedId;

		agent.post(`/${username}/${emptyFed}`)
		.send({ 
			desc, 
			type, 
			unit,
			subModels:[] 
		})
		.expect(200, function(err ,res) {

			if(err){
				return done(err);
			}

			expect(res.body.name).to.equal(emptyFed);
			emptyFedId = res.body.model;


			async.series([
				done => {
					agent.get(`/${username}/${emptyFedId}.json`)
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
						let fed = account.fedModels.find(p => p.model === emptyFedId);
						expect(fed.federate).to.equal(true);
						done(err);
					})
				}
			], err => {
				done(err);
			})

			
		});
	});

	it('should fail if create federation using existing model name (fed or model)', function(done){

		agent.post(`/${username}/${subModels[0]}`)
		.send({ 
			desc, 
			type, 
			unit,
			subModels:[{
				"database": username,
				"model": subModels[0]
			}] 
		})
		.expect(400, function(err ,res) {

			expect(res.body.value).to.equal(responseCodes.MODEL_EXIST.value);
			done(err);

		});
	});

	it('should fail if create federation using invalid model name', function(done){


		agent.post(`/${username}/a%20c`)
		.send({ 
			desc, 
			type, 
			subModels:[{
				"database": 'testing',
				"model": 'testproject'
			}] 
		})
		.expect(400, function(err ,res) {

			expect(res.body.value).to.equal(responseCodes.INVALID_MODEL_NAME.value);
			done(err);

		});
	});



	it('should fail if create federation from models in a different database', function(done){

		agent.post(`/${username}/badfed`)
		.send({ 
			desc, 
			type, 
			unit,
			subModels:[{
				"database": 'testing',
				"model": 'testproject'
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
		let corId, appId;

		//fake a response from bouncer;
		setTimeout(function(){
		
			q.channel.assertQueue(q.workerQName, { durable: true }).then(info => {

				expect(info.messageCount).to.equal(1);
				return q.channel.get(q.workerQName);

			}).then(res => {
				
				corId = res.properties.correlationId;
				appId = res.properties.appId;

				let json = fs.readFileSync(config.cn_queue.shared_storage + '/' + corId + '/obj.json', {
					encoding: 'utf8'
				});

				json = JSON.parse(json);
			
				//check the request json file

				expect(json.subProjects.length).to.equal(1);

				return q.channel.assertExchange(q.callbackQName, 'direct', { durable: true });

			}).then(() => {
				//send fake job done message to the queue;
				return q.channel.publish(
					q.callbackQName,
					appId,
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
				unit,
				subModels:[{
					"database": username,
					"model": subModels[0]
				}, {
					"database": username,
					"model": subModels[0]
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
			unit,
			subModels:[{
				"database": username,
				"model": fedModelId
			}] 
		})
		.expect(400, function(err ,res) {

			expect(res.body.value).to.equal(responseCodes.FED_MODEL_IS_A_FED.value);
			done(err);

		});
	});

	it('update should fail if model is not a fed', function(done){

		agent.put(`/${username}/${subModels[0]}`)
		.send({ 
			desc, 
			type, 
			unit,
			subModels:[{
				"database": username,
				"model": subModels[0]
			}] 
		})
		.expect(400, function(err ,res) {

			expect(res.body.value).to.equal(responseCodes.MODEL_IS_NOT_A_FED.value);
			done(err);

		});
	});

	it('update should fail if model does not exist', function(done){
		agent.put(`/${username}/nonexistmodel`)
		.send({ 
			desc, 
			type, 
			unit,
			subModels:[{
				"database": username,
				"model": subModels[0]
			}] 
		})
		.expect(404, function(err ,res) {

			expect(res.body.value).to.equal(responseCodes.MODEL_NOT_FOUND.value);
			done(err);

		});
	});

	it('update should success if model is a federation', function(done){
		this.timeout(5000);

		let q = require('../../services/queue');
		let corId, appId;

		//fake a response from bouncer;
		setTimeout(function(){
			q.channel.assertQueue(q.workerQName, { durable: true }).then(info => {
				expect(info.messageCount).to.equal(0);
				return q.channel.get(q.workerQName);
			}).then(res => {
				corId = res.properties.correlationId;
				appId = res.properties.appId;
				return q.channel.assertExchange(q.callbackQName, 'direct', { durable: true });
			}).then(() => {
				//send fake job done message to the queue;
				return q.channel.publish(
					q.callbackQName,
					appId,
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

		agent.put(`/${username}/${fedModelId}`)
		.send({ 
			desc, 
			type, 
			unit,
			subModels:[{
				"database": username,
				"model": subModels[1]
			}] 
		})
		.expect(200, function(err ,res) {
			return done(err);
		});
	});

	it('should fail to delete a model that is a sub model of another federation', function(done){
		const model = 'f4ec3efb-3de8-4eeb-81a1-1c62cb2fed40';
		agent.delete(`/${username}/${model}`)
		.send({})
		.expect(400, function(err, res){
			
			expect(err).to.be.null;
			expect(res.body.value).to.equal(responseCodes.MODEL_IS_A_SUBMODEL.value);
			done();
		});
	})
});
