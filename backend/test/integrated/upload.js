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
let moment = require("moment");

describe('Uploading a project', function () {
	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'upload_username';
	let password = 'password';
	let email = 'test3drepo_upload@mailinator.com';
	let project = 'project1';

	let desc = 'desc';
	let type = 'type';
	let unit = 'meter';

	before(function(done){

		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');

			helpers.signUpAndLoginAndCreateProject({
				server, request, agent, expect, User, systemLogger,
				username, password, email, project, desc, type, noBasicPlan: true, unit,
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

	describe('without quota', function(){

		it('should return error (no subscriptions)', function(done){
			agent.post(`/${username}/${project}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/8000cubes.obj')
			.expect(400, function(err, res){
				expect(res.body.value).to.equal(responseCodes.SIZE_LIMIT_PAY.value);
				done(err);
			});
		});

		it('should return error (has a subscription but ran out of space)', function(done){
			//user: testing loaded with a valid subscription and a project with 6MB and subscription limit is 8MB
			let agent2 = request.agent(server);
			agent2.post('/login')
			.send({ username: 'testing', password: 'testing' })
			.expect(200, function(err, res){
				expect(res.body.username).to.equal('testing');
				
				if(err){
					return done(err);
				}

				//create a project
				agent2.post(`/testing/testproject/upload`)
				.attach('file', __dirname + '/../../statics/3dmodels/8000cubes.obj')
				.expect(400, function(err, res){
					expect(res.body.value).to.equal(responseCodes.SIZE_LIMIT_PAY.value);
					done(err);
				});

			});
		});

	});

	describe('with quota', function(){

		before(function(){
			//give some money to this guy
			return User.findByUserName(username).then( user => {
				return user.createSubscription('THE-100-QUID-PLAN', user.user, true, moment().utc().add(1, 'month'))
			})
		});

		it('should succee', function(done){
			agent.post(`/${username}/${project}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/8000cubes.obj')
			.expect(200, function(err, res){
				done(err);
			});
		});


		it('should have one item inserted into the queue', function(done){

			let q = require('../../services/queue');

			// upload api return before insert item to queue so introduce some time lag here
			setTimeout(function(){

				q.channel.assertQueue(q.workerQName, { durable: true }).then( info => {

					//expect 1 message in the worker queue
					expect(info.messageCount).to.equal(1);
					done();

				}).catch(err => {
					done(err);
				});

			}, 1000);

		});

		it('should succee (uppercase extension)', function(done){
			agent.post(`/${username}/${project}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/upper.OBJ')
			.expect(200, function(err, res){
				done(err);
			});
		});
		
		it('but empty file size should fail', function(done){

			agent.post(`/${username}/${project}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/empty.ifc')
			.expect(400, function(err, res){
				expect(res.body.value).to.equal(responseCodes.FILE_FORMAT_NOT_SUPPORTED.value);
				done(err);
			});

		});

		it('but unaccepted extension should failed', function(done){

			agent.post(`/${username}/${project}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/toy.abc')
			.expect(400, function(err, res){
				expect(res.body.value).to.equal(responseCodes.FILE_FORMAT_NOT_SUPPORTED.value);
				done(err);
			});

		});

		it('but no extension should failed', function(done){

			agent.post(`/${username}/${project}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/toy')
			.expect(400, function(err, res){
				expect(res.body.value).to.equal(responseCodes.FILE_FORMAT_NOT_SUPPORTED.value);
				done(err);
			});

		});

		it('but file size exceeded fixed single file size limit should fail', function(done){

			agent.post(`/${username}/${project}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/toy.ifc')
			.expect(400, function(err, res){
				expect(res.body.value).to.equal(responseCodes.SIZE_LIMIT.value);
				done(err);
			});

		});

	});



});