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

const request = require('supertest');
const expect = require('chai').expect;
const app = require("../../services/api.js").createApp(
	{ session: require('express-session')({ secret: 'testing'}) }
);
const log_iface = require("../../logger.js");
const systemLogger = log_iface.systemLogger;
const responseCodes = require("../../response_codes.js");
const helpers = require("./helpers");
const async = require('async');
const C = require('../../constants');

describe('Sharing/Unsharing a model', function () {
	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'projectowner';
	let password = 'password';
	let model = 'testproject';
	let email = suf => `test3drepo_collaboration_${suf}@mailinator.com`;


	let username_viewer = 'collaborator_viewer';
	let password_viewer = 'collaborator_viewer';

	let username_editor = 'collaborator_editor';
	let password_editor = 'collaborator_editor';

	let username_commenter = 'collaborator_comm';
	let password_commenter = 'collaborator_comm';

	before(function(done){

		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');

			let actions = [
				function createViewer(done){
					helpers.signUpAndLogin({
						server, request, agent, expect, User, systemLogger,
						username: username_viewer, password: password_viewer, email: email('viewer'),
						done
					});
				},
				function createEditor(done){
					helpers.signUpAndLogin({
						server, request, agent, expect, User, systemLogger,
						username: username_editor, password: password_editor, email: email('editor'),
						done
					});
				},
				function createCommenter(done){
					helpers.signUpAndLogin({
						server, request, agent, expect, User, systemLogger,
						username: username_commenter, password: password_commenter, email: email('commenter'),
						done
					});
				}
			];

			[1,2,3,4,5].forEach(n => {

				actions.push(function (done){
					helpers.signUpAndLogin({
						server, request, agent, expect, User, systemLogger,
						username: username_viewer + n, password: password_viewer, email: email('viewer' + n),
						done
					});
				});
			});

			async.series(actions, done);
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


	describe('for view only', function(){

		before(function(done){

			agent = request.agent(server);
			agent.post('/login')
			.send({ username, password })
			.expect(200, function(err, res){
				expect(res.body.username).to.equal(username);
				done(err);
			});
			
		});

		after(function(done){

			agent.post('/logout')
			.send({})
			.expect(200, done);
		});

		it('should succee and the viewer is able to see the model', function(done){

			const permissions = [
				{ user: username_viewer, permission: 'viewer'}
			];

			async.series([
				function share(done){

					agent.post(`/${username}/${model}/permissions`)
					.send(permissions)
					.expect(200, function(err, res){
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
				function checkSharedModelInList(done){

					agent.get(`/${username_viewer}.json`)
					.expect(200, function(err, res){

						expect(res.body).to.have.property('accounts').that.is.an('array');
						const account = res.body.accounts.find( a => a.account === username);
						expect(account).to.have.property('models').that.is.an('array');
						const modelObj = account.models.find( _model => _model.model === model);
						expect(modelObj).to.have.property('model', model);
						expect(modelObj.permissions).to.deep.equal(C.VIEWER_TEMPLATE_PERMISSIONS);

						done(err);
					});
				},
				function ableToViewModel(done){

					agent.get(`/${username}/${model}/revision/master/head.x3d.mp`)
					.expect(200, function(err ,res){
						done(err);
					});
				}
			], done);


		});

		it('model info api shows correct permissions', function(done){
			agent.get(`/${username}/${model}.json`).
			expect(200, function(err, res){
				expect(res.body.permissions).to.deep.equal(C.VIEWER_TEMPLATE_PERMISSIONS);
				done(err);
			});
		});

		it('and the viewer should be able to see list of issues', function(done){
			agent.get(`/${username}/${model}/issues.json`)
			.expect(200, done);
		});

		it('and the viewer should not be able to download the model', function(done){
			agent.get(`/${username}/${model}/download/latest`).expect(401, done);
		});

		it('and the viewer should NOT be able to upload model', function(done){
			agent.post(`/${username}/${model}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/8000cubes.obj')
			.expect(401, done);
		});

		it('and the viewer should NOT be able to see raise issue', function(done){
			agent.post(`/${username}/${model}/issues.json`)
			.send({})
			.expect(401 , done);
		});

		it('and the viewer should NOT be able to delete the model', function(done){
			agent.delete(`/${username}/${model}`)
			.send({})
			.expect(401 , done);
		});

		it('and the viewer should NOT be able to update model settings', function(done){
			let body = {

					mapTile: {
						lat: 123,
						lon: 234,
						y: 5
					},
					unit: 'cm'

			};
			
			agent.put(`/${username}/${model}/settings`)
			.send(body).expect(401 , done);
		});


		describe('and then revoking the permission', function(){
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
					function loginAsModelOwner(done){

						agent.post('/login')
						.send({ username, password })
						.expect(200, function(err, res){
							expect(res.body.username).to.equal(username);
							done(err);
						});
					}
				], done);
			});

			it('should succee and the viewer is NOT able to see the model', function(done){

				const permissions = [];
					
				async.waterfall([
					function remove(done){

						agent.post(`/${username}/${model}/permissions`)
						.send(permissions)
						.expect(200, function(err, res){
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
					function checkSharedModelInList(done){

						agent.get(`/${username_viewer}.json`)
						.expect(200, function(err, res){

							expect(res.body).to.have.property('accounts').that.is.an('array');
							let account = res.body.accounts.find( a => a.account === username);
							expect(account).to.be.undefined;

							done(err);
						});
					},
					function notAbleToViewModel(done){

						agent.get(`/${username}/${model}/revision/master/head.x3d.mp`)
						.expect(401, function(err ,res){
							done(err);
						});
					}
				], done);

			});

			it('and the viewer should NOT be able to see raise issue', function(done){
				agent.post(`/${username}/${model}/issues.json`)
				.send({})
				.expect(401 , done);
			});
		});
	});

	describe('for comment only', function(){

		before(function(done){

			agent = request.agent(server);
			agent.post('/login')
			.send({ username, password })
			.expect(200, function(err, res){
				expect(res.body.username).to.equal(username);
				done(err);
			});
			
		});

		after(function(done){

			agent.post('/logout')
			.send({})
			.expect(200, done);
		});

		it('should succee and the commenter is able to see the model', function(done){

			const permissions = [
				{ user: username_commenter, permission: 'commenter'}
			];

			async.series([
				function share(done){

					agent.post(`/${username}/${model}/permissions`)
					.send(permissions)
					.expect(200, function(err, res){
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
				function loginAsCommenter(done){

					agent.post('/login')
					.send({ username: username_commenter, password: password_commenter })
					.expect(200, function(err, res){
						expect(res.body.username).to.equal(username_commenter);
						done(err);
					});
				},
				function checkSharedModelInList(done){

					agent.get(`/${username_commenter}.json`)
					.expect(200, function(err, res){

						expect(res.body).to.have.property('accounts').that.is.an('array');
						let account = res.body.accounts.find( a => a.account === username);
						expect(account).to.have.property('models').that.is.an('array');
						let modelObj = account.models.find( _model => _model.model === model);
						expect(modelObj).to.have.property('model', model);
						expect(modelObj.permissions).to.deep.equal(C.COMMENTER_TEMPLATE_PERMISSIONS);

						done(err);
					});
				},
				function ableToViewModel(done){

					agent.get(`/${username}/${model}/revision/master/head.x3d.mp`)
					.expect(200, function(err ,res){
						done(err);
					});
				}
			], done);


		});

		it('model info api shows correct permissions', function(done){
			agent.get(`/${username}/${model}.json`).
			expect(200, function(err, res){
				expect(res.body.permissions).to.deep.equal(C.COMMENTER_TEMPLATE_PERMISSIONS);
				done(err);
			});
		});

		it('and the commenter should be able to see list of issues', function(done){
			agent.get(`/${username}/${model}/issues.json`)
			.expect(200, done);
		});

		it('and the commenter should not be able to download the model', function(done){
			agent.get(`/${username}/${model}/download/latest`).expect(401, done);
		});

		it('and the commenter should be able to see raise issue', function(done){

			let issue = { 
				"name": "issue",
				"status": "open",
				"priority": "medium",
				"viewpoint":{
					"up":[0,1,0],
					"position":[38,38 ,125.08011914810137],
					"look_at":[0,0,-163.08011914810137],
					"view_dir":[0,0,-1],
					"right":[1,0,0],
					"unityHeight ":3.537606904422707,
					"fov":2.1124830653010416,
					"aspect_ratio":0.8750189337327384,
					"far":276.75612077194506 ,
					"near":76.42411012233212,
					"clippingPlanes":[]
				},
				"scale":1,
				"creator_role":"testproject.collaborator",
				"assigned_roles":["testproject.collaborator"],
			};

			agent.post(`/${username}/${model}/issues.json`)
			.send(issue)
			.expect(200 , done);
		});

		it('and the commenter should NOT be able to upload model', function(done){
			agent.post(`/${username}/${model}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/8000cubes.obj')
			.expect(401, done);
		});

		it('and the commenter should NOT be able to delete the model', function(done){
			agent.delete(`/${username}/${model}`)
			.send({})
			.expect(401 , done);
		});

		it('and the commenter should NOT be able to update model settings', function(done){
			let body = {

					mapTile: {
						lat: 123,
						lon: 234,
						y: 5
					},
					unit: 'cm'

			};
			
			agent.put(`/${username}/${model}/settings`)
			.send(body).expect(401 , done);
		});

		describe('and then revoking the permissions', function(done){
			before(function(done){
				async.waterfall([
					function logout(done){

						agent.post('/logout')
						.send({})
						.expect(200, function(err, res){
							expect(res.body.username).to.equal(username_commenter);
							done(err);
						});
					},
					function loginAsModelOwner(done){

						agent.post('/login')
						.send({ username, password })
						.expect(200, function(err, res){
							expect(res.body.username).to.equal(username);
							done(err);
						});
					}
				], done);
			});

			it('should succee and the commenter is NOT able to see the model', function(done){

				const permissions = [];
					
				async.waterfall([
					function remove(done){

						agent.post(`/${username}/${model}/permissions`)
						.send(permissions)
						.expect(200, function(err, res){
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
					function loginAsCommenter(done){

						agent.post('/login')
						.send({ username: username_commenter, password: password_commenter })
						.expect(200, function(err, res){
							expect(res.body.username).to.equal(username_commenter);
							done(err);
						});
					},
					function checkSharedModelInList(done){

						agent.get(`/${username_commenter}.json`)
						.expect(200, function(err, res){

							expect(res.body).to.have.property('accounts').that.is.an('array');
							let account = res.body.accounts.find( a => a.account === username);
							expect(account).to.be.undefined;

							done(err);
						});
					},
					function notAbleToViewModel(done){

						agent.get(`/${username}/${model}/revision/master/head.x3d.mp`)
						.expect(401, function(err ,res){
							done(err);
						});
					}
				], done);

			});

			it('and the commenter should NOT be able to see raise issue', function(done){
				agent.post(`/${username}/${model}/issues.json`)
				.send({ })
				.expect(401 , done);
			});
		});
	});

	describe('for collaborator', function(){
		before(function(done){

			agent = request.agent(server);
			agent.post('/login')
			.send({ username, password })
			.expect(200, function(err, res){
				expect(res.body.username).to.equal(username);
				done(err);
			});
			
		});

		after(function(done){

			agent.post('/logout')
			.send({})
			.expect(200, done);
		});

		it('should succee and the editor is able to see the model', function(done){

			const permissions = [
				{ user: username_editor, permission: 'collaborator'}
			];

			async.series([
				function share(done){

					agent.post(`/${username}/${model}/permissions`)
					.send(permissions)
					.expect(200, function(err, res){
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
				function loginAsEditor(done){

					agent.post('/login')
					.send({ username: username_editor, password: password_editor })
					.expect(200, function(err, res){
						expect(res.body.username).to.equal(username_editor);
						done(err);
					});
				},
				function checkSharedModelInList(done){

					agent.get(`/${username_editor}.json`)
					.expect(200, function(err, res){

						expect(res.body).to.have.property('accounts').that.is.an('array');
						let account = res.body.accounts.find( a => a.account === username);
						expect(account).to.have.property('models').that.is.an('array');
						let modelObj = account.models.find( _model => _model.model === model);
						expect(modelObj).to.have.property('model', model);
						expect(modelObj.permissions).to.deep.equal(C.COLLABORATOR_TEMPLATE_PERMISSIONS);

						done(err);
					});
				},
				function ableToViewModel(done){

					agent.get(`/${username}/${model}/revision/master/head.x3d.mp`)
					.expect(200, function(err ,res){
						done(err);
					});
				}
			], done);


		});

		it('model info api shows correct permissions', function(done){
			agent.get(`/${username}/${model}.json`).
			expect(200, function(err, res){
				expect(res.body.permissions).to.deep.equal(C.COLLABORATOR_TEMPLATE_PERMISSIONS);
				done(err);
			});
		});
		

		it('and the editor should be able to see list of issues', function(done){
			agent.get(`/${username}/${model}/issues.json`)
			.expect(200, done);
		});

		it('and the editor should be able to raise issue', function(done){

			let issue = { 
				"name": "issue",
				"status": "open",
				"priority": "medium",
				"viewpoint":{
					"up":[0,1,0],
					"position":[38,38 ,125.08011914810137],
					"look_at":[0,0,-163.08011914810137],
					"view_dir":[0,0,-1],
					"right":[1,0,0],
					"unityHeight ":3.537606904422707,
					"fov":2.1124830653010416,
					"aspect_ratio":0.8750189337327384,
					"far":276.75612077194506 ,
					"near":76.42411012233212,
					"clippingPlanes":[]
				},
				"scale":1,
				"creator_role":"testproject.collaborator",
				"assigned_roles":["testproject.collaborator"],
			};

			agent.post(`/${username}/${model}/issues.json`)
			.send(issue)
			.expect(200 , done);
		});

		it('and the collaborator should be able to upload model', function(done){
			agent.post(`/${username}/${model}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/8000cubes.obj')
			.expect(200, done);
		});


		it('and the collaborator should be able to download the model', function(done){
			agent.get(`/${username}/${model}/download/latest`).expect(200, done);
		});

		it('and the collaborator should NOT be able to delete the model', function(done){
			agent.delete(`/${username}/${model}`)
			.send({})
			.expect(401 , done);
		});

		it('and the collaborator should NOT be able to update model settings', function(done){
			let body = {

					mapTile: {
						lat: 123,
						lon: 234,
						y: 5
					},
					unit: 'cm'

			};
			
			agent.put(`/${username}/${model}/settings`)
			.send(body).expect(401 , done);
		});

		describe('and then revoking the permissions', function(done){
			before(function(done){
				async.waterfall([
					function logout(done){

						agent.post('/logout')
						.send({})
						.expect(200, function(err, res){
							expect(res.body.username).to.equal(username_editor);
							done(err);
						});
					},
					function loginAsModelOwner(done){

						agent.post('/login')
						.send({ username, password })
						.expect(200, function(err, res){
							expect(res.body.username).to.equal(username);
							done(err);
						});
					}
				], done);
			});

			it('should succee and the editor is NOT able to see the model', function(done){

				const permissions = [];
					
				async.waterfall([
					function remove(done){

						agent.post(`/${username}/${model}/permissions`)
						.send(permissions)
						.expect(200, function(err, res){
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
					function loginAsEditor(done){

						agent.post('/login')
						.send({ username: username_editor, password: password_editor })
						.expect(200, function(err, res){
							expect(res.body.username).to.equal(username_editor);
							done(err);
						});
					},
					function checkSharedModelInList(done){

						agent.get(`/${username_editor}.json`)
						.expect(200, function(err, res){

							expect(res.body).to.have.property('accounts').that.is.an('array');
							let account = res.body.accounts.find( a => a.account === username);
							expect(account).to.be.undefined;

							done(err);
						});
					},
					function notAbleToViewModel(done){

						agent.get(`/${username}/${model}/revision/master/head.x3d.mp`)
						.expect(401, function(err ,res){
							done(err);
						});
					}
				], done);

			});

			it('and the editor should NOT be able to raise issue', function(done){
				agent.post(`/${username}/${model}/issues.json`)
				.send({})
				.expect(401 , done);
			});
		});
	});

	// this test case may not be valid any more for current business requirements
	// describe('for unassigned user', function(){

	// 	before(function(done){

	// 		agent = request.agent(server);
	// 		agent.post('/login')
	// 		.send({ username, password })
	// 		.expect(200, function(err, res){
	// 			expect(res.body.username).to.equal(username);
	// 			done(err);
	// 		});
			
	// 	});

	// 	it('should fail', function(done){
	// 		let role = {
	// 			user: username_viewer + '1',
	// 			role: 'viewer'
	// 		};

	// 		agent.post(`/${username}/${model}/collaborators`)
	// 		.send(role)
	// 		.expect(400, function(err, res){
	// 			expect(res.body.value).to.equal(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE.value);
	// 			done(err);
	// 		});
	// 	});
	// });

	describe('for non-existing user', function(){

		let agent;

		before(function(done){

			agent = request.agent(server);
			agent.post('/login')
			.send({ username, password })
			.expect(200, function(err, res){
				expect(res.body.username).to.equal(username);
				done(err);
			});
			
		});

		it('should fail', function(done){

			const permissions = [{ user: username_viewer + '99', permission: 'collaborator'}];

			agent.post(`/${username}/${model}/permissions`)
			.send(permissions)
			.expect(400, function(err, res){
				expect(res.body.value).to.equal(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE.value);
				done(err);
			});
		});

		// it('should fail (unshare)', function(done){
		// 	let role = {
		// 		user: username_viewer + '99',
		// 		role: 'viewer'
		// 	};

		// 	agent.delete(`/${username}/${model}/collaborators`)
		// 	.send(role)
		// 	.expect(404, function(err, res){
		// 		expect(res.body.value).to.equal(responseCodes.USER_NOT_FOUND.value);
		// 		done(err);
		// 	});
		// });


	});


	// describe('for a user dont have access', function(){

	// 	it('should fail (share)', function(done){
	// 		let role = {
	// 			user: username_viewer + '2',
	// 			role: 'viewer'
	// 		};

	// 		agent.delete(`/${username}/${model}/collaborators`)
	// 		.send(role)
	// 		.expect(400, function(err, res){
	// 			expect(res.body.value).to.equal(responseCodes.NOT_IN_ROLE.value);
	// 			done(err);
	// 		});
	// 	});

	// });

	// describe('to themselves', function(){

	// 	it('should fail (share)', function(done){
	// 		let role = {
	// 			user: username,
	// 			role: 'collaborator'
	// 		};

	// 		agent.post(`/${username}/${model}/collaborators`)
	// 		.send(role)
	// 		.expect(400, function(err, res){
	// 			expect(res.body.value).to.equal(responseCodes.ALREADY_IN_ROLE.value);
	// 			done(err);
	// 		});
	// 	});


	// 	it('should fail (unshare)', function(done){
	// 		let role = {
	// 			user: username,
	// 			role: 'collaborator'
	// 		};

	// 		agent.delete(`/${username}/${model}/collaborators`)
	// 		.send(role)
	// 		.expect(400, function(err, res){
	// 			expect(res.body.value).to.equal(responseCodes.NOT_IN_ROLE.value);
	// 			done(err);
	// 		});
	// 	});

	// });


	describe('to the same user twice', function(){

		let agent;

		before(function(done){

			agent = request.agent(server);
			agent.post('/login')
			.send({ username, password })
			.expect(200, function(err, res){
				expect(res.body.username).to.equal(username);
				done(err);
			});
			
		});

		const permissions = [
			{ user: username_viewer, permission: 'viewer'},
			{ user: username_viewer, permission: 'viewer'}
		];

		it('should be ok and reduced to one by the backend', function(done){

			async.series([
				done => {
					agent.post(`/${username}/${model}/permissions`)
					.send(permissions)
					.expect(200, function(err, res){
						done(err);
					});
				},
				done => {
					agent.get(`/${username}/${model}/permissions`)
					.expect(200, function(err, res){
						//expect(res.body.toJSON()).to.deep.equal([{ user: username_viewer, permission: 'viewer'}]);
						// Or maybe
						expect(res.body).be.an('array');
						expect(res.body).to.have.length(1);
						
						expect(res.body[0]).to.have.property('permission');
						expect(res.body[0]["permission"]).to.be('viewer');

						expect(res.body[0]).to.have.property('user');
						expect(res.body[0]["user"]).to.be(username_viewer)
						
						done(err);
					});
				}
			], done);

		});
				
	});

});