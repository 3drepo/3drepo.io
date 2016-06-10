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
let async = require('async');

describe('Sharing a project', function () {
	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'testing';
	let password = 'testing';
	let project = 'testproject';
	let email = 'test3drepo@mailinator.com'

	let username_viewer = 'collaborator_viewer';
	let password_viewer = 'collaborator_viewer';

	let username_editer = 'collaborator_editer';
	let password_editer = 'collaborator_editer';

	before(function(done){

		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');


			async.series([
				function createViewer(done){
					helpers.signUpAndLogin({
						server, request, agent, expect, User, systemLogger,
						username: username_viewer, password: password_viewer, email,
						done
					});
				},
				function createEditer(done){
					helpers.signUpAndLogin({
						server, request, agent, expect, User, systemLogger,
						username: username_editer, password: password_editer, email,
						done
					});
				},
				function logInAsOwner(done){
					agent = request.agent(server);
					agent.post('/login')
					.send({ username, password })
					.expect(200, function(err, res){
						expect(res.body.username).to.equal(username);
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


	describe('for view only', function(){

		it('should succee and the viewer is able to see the project', function(done){
			let role = {
				user: username_viewer,
				role: 'viewer'
			};

			async.series([
				function share(done){

					agent.post(`/${username}/${project}/collaborators`)
					.send(role)
					.expect(200, function(err, res){
						expect(res.body).to.deep.equal(role);
						done(err);
					});
				},
				function logout(done){

					agent.post('/logout')
					.send({})
					.expect(200, function(err, res){
						expect(res.body.username).to.equal(username);
						done(err);
					});
				},
				function loginAsViewer(done){

					agent.post('/login')
					.send({ username: username_viewer, password: password_viewer })
					.expect(200, function(err, res){
						expect(res.body.username).to.equal(username_viewer);
						done(err);
					});
				},
				function checkSharedProjectInList(done){

					agent.get(`/${username_viewer}.json`)
					.expect(200, function(err, res){

						expect(res.body).to.have.property('accounts').that.is.an('array');
						let account = res.body.accounts.find( a => a.account === username);
						expect(account).to.have.property('projects').that.is.an('array');
						let projectObj = account.projects.find( p => p.project === project);
						expect(projectObj).to.have.property('project', project);

						done(err);
					});
				},
				function ableToViewProject(done){

					agent.get(`/${username}/${project}/revision/master/head.x3d.mp`)
					.expect(200, function(err ,res){
						done(err);
					});
				}
			], done);


		});


		it('and the viewer should be able to see list of issues', function(done){
			agent.get(`/${username}/${project}/issues.json`)
			.expect(200, done);
		});

		it('and the viewer should NOT be able to see raise issue', function(done){
			agent.post(`/${username}/${project}/issues.json`)
			.send({ data: {} })
			.expect(401 , done);
		});

		describe('and then remove the role', function(done){
			before(function(done){
				async.waterfall([
					function logout(done){

						agent.post('/logout')
						.send({})
						.expect(200, function(err, res){
							expect(res.body.username).to.equal(username_viewer);
							done(err);
						});
					},
					function loginAsProjectOwner(done){

						agent.post('/login')
						.send({ username, password })
						.expect(200, function(err, res){
							expect(res.body.username).to.equal(username);
							done(err);
						});
					}
				], done);
			});

			it('should succee and the viewer is NOT able to see the project', function(done){

				let role = {
					user: username_viewer,
					role: 'viewer'
				};
					
				async.waterfall([
					function remove(done){

						agent.delete(`/${username}/${project}/collaborators`)
						.send(role)
						.expect(200, function(err, res){
							expect(res.body).to.deep.equal(role);
							done(err);
						});
					},
					function logout(done){

						agent.post('/logout')
						.send({})
						.expect(200, function(err, res){
							expect(res.body.username).to.equal(username);
							done(err);
						});
					},
					function loginAsViewer(done){

						agent.post('/login')
						.send({ username: username_viewer, password: password_viewer })
						.expect(200, function(err, res){
							expect(res.body.username).to.equal(username_viewer);
							done(err);
						});
					},
					function checkSharedProjectInList(done){

						agent.get(`/${username_viewer}.json`)
						.expect(200, function(err, res){

							expect(res.body).to.have.property('accounts').that.is.an('array');
							let account = res.body.accounts.find( a => a.account === username);
							expect(account).to.be.undefined;

							done(err);
						});
					},
					function notAbleToViewProject(done){

						agent.get(`/${username}/${project}/revision/master/head.x3d.mp`)
						.expect(401, function(err ,res){
							done(err);
						});
					}
				], done);

			});

			it('and the viewer should NOT be able to see raise issue', function(done){
				agent.post(`/${username}/${project}/issues.json`)
				.send({ data: {} })
				.expect(401 , done);
			});
		});
	});

	describe('for both view and edit', function(){

	});
});