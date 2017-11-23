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
	{ session: require('express-session')({ secret: 'testing',  resave: false,   saveUninitialized: false }) }
);
let log_iface = require("../../logger.js");
let systemLogger = log_iface.systemLogger;
let responseCodes = require("../../response_codes.js");


function stopQueue(done){
	let exec = require('child_process').exec;
	exec('sudo service rabbitmq-server stop', (err, stdout, stderr) => {
		done(err);
	});
}

function startQueue(done){
	let exec = require('child_process').exec;
	exec('sudo service rabbitmq-server start', (err, stdout, stderr) => {
		done(err);
	});
}

describe('Infrastructure', function () {

	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'testing';
	let password = 'testing';
	let model = 'testproject';



	describe('Queue', function(){
		this.timeout(15000);

		describe('died before app start', function(){
			before(function(done){
				stopQueue(err => {
					if(err){
						return done(err);
					}

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
			});

			after(function(done){
				startQueue(err => {
					if(err){
						return done(err);
					}

					server.close(function(){
						console.log('API test server is closed');
						done();
					});
				});
			});
		
			it('should behaves normal for non-queue based API', function(done){
				agent.get(`/{{username}}.json`)
				.expect(200, function(err, res){
					done(err);
				})
			})

			it('should report error for queue based api if queue service is not running', function(done){

				agent.post(`/testing/${model}/upload`)
				.attach('file', __dirname + '/../../statics/3dmodels/8000cubes.obj')
				.expect(500, function(err, res){
					done(err);
				});
			
			});
		});

		describe('died on midway', function(done){

			before(function(done){
				server = app.listen(8080, function () {
					console.log('API test server is listening on port 8080!');

					agent = request.agent(server);
					agent.post('/login')
					.send({ username, password })
					.expect(200, function(err, res){
						expect(res.body.username).to.equal(username);
						
						if(err){
							return done(err);
						}

						stopQueue(done);

					});

				});
			});

			it('should report error for queue based api if queue service is not running', function(done){

				agent.post(`/testing/${model}/upload`)
				.attach('file', __dirname + '/../../statics/3dmodels/8000cubes.obj')
				.expect(500, function(err, res){
					done(err);
				});
			
			});

			it('should behaves normal for non-queue based API', function(done){
				agent.get(`/{{username}}.json`)
				.expect(200, function(err, res){
					done(err);
				})
			})
			
			it('should reconnect if queue service starts again', function(done){
				startQueue(function(err){
					if(err){
						return done(err);
					}

					agent.post(`/testing/${model}/upload`)
					.attach('file', __dirname + '/../../statics/3dmodels/8000cubes.obj')
					.end(function(err, res){
						expect(res.statusCode).to.not.equal(500);
						done(err);
					});
				})
			})

			after(function(done){
				startQueue(err => {
					if(err){
						done(err);
					}

					server.close(function(){
						console.log('API test server is closed');
						done();
					});
				});
			});
		})


	});


});