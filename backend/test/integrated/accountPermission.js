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
const async = require('async');


describe('Account permission', function () {

	let server;
	let agent;
	let username = 'accountPerm';
	let password = 'accountPerm';

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

	it('should fail to assign permissions to a user that doesnt exist', function(done){
		agent.post(`/${username}/permissions`)
		.send({ user: 'nonsense', permissions: ['create_project']})
		.expect(404, function(err, res){
			expect(res.body.value).to.equal(responseCodes.USER_NOT_FOUND.value);
			done(err);
		});
	});

	it('should fail to assign non team space permissions to a user', function(done){
		agent.post(`/${username}/permissions`)
		.send({ user: 'user1', permissions: ['view_issue']})
		.expect(400, function(err, res){
			expect(res.body.value).to.equal(responseCodes.INVALID_PERM.value);
			done(err);
		});
	});

	it('should able to assign permissions to a user', function(done){

		const permission = { user: 'testing', permissions: ['create_project']};

		async.series([
			callback => {
				agent.post(`/${username}/permissions`)
				.send(permission)
				.expect(200, function(err, res){
					callback(err);
				});
			},

			callback => {
				agent.get(`/${username}/permissions`)
				.expect(200, function(err, res){

					expect(res.body.find(perm => perm.user === permission.user)).to.deep.equal(permission);
					callback(err);
				});
			}

		], (err, res) => done(err));

	});


	it('should able to update users permissions', function(done){

		async.series([
			callback => {
				agent.put(`/${username}/permissions/user2`)
				.send({ permissions: []})
				.expect(200, function(err, res){
					callback(err);
				});
			},

			callback => {
				agent.get(`/${username}/permissions`)
				.expect(200, function(err, res){
					expect(res.body.find(perm => perm.user === 'user2')).to.deep.equal({user: 'user2', permissions:[]});
					callback(err);
				});
			}

		], (err, res) => done(err));

	});


	it('should able to update user\'s permissions', function(done){

		async.series([
			callback => {
				agent.put(`/${username}/permissions/user2`)
				.send({ permissions: ['create_project']})
				.expect(200, function(err, res){
					callback(err);
				});
			},

			callback => {
				agent.get(`/${username}/permissions`)
				.expect(200, function(err, res){
					expect(res.body.find(perm => perm.user === 'user2')).to.deep.equal({user: 'user2', permissions:['create_project']});
					callback(err);
				});
			}

		], (err, res) => done(err));

	});


	it('should fail to update non team space permissions', function(done){
		agent.put(`/${username}/permissions/user2`)
		.send({ permissions: ['view_issue']})
		.expect(400, function(err, res){
			expect(res.body.value).to.equal(responseCodes.INVALID_PERM.value);
			done(err);
		});
	});

	it('should fail to assign permissions to a user twice', function(done){
		agent.post(`/${username}/permissions`)
		.send({ user: 'user3', permissions: ['create_project']})
		.expect(400, function(err, res){
			expect(res.body.value).to.equal(responseCodes.DUP_ACCOUNT_PERM.value);
			done(err);
		});
	});

	it('should fail to update permission for an non existing record', function(done){
		agent.put(`/${username}/permissions/user4`)
		.send({ permissions: ['create_project']})
		.expect(404, function(err, res){
			expect(res.body.value).to.equal(responseCodes.ACCOUNT_PERM_NOT_FOUND.value);
			done(err);
		});
	});

	it('should fail to remove permission for an non existing record', function(done){
		agent.delete(`/${username}/permissions/user4`)
		.expect(404, function(err, res){
			expect(res.body.value).to.equal(responseCodes.ACCOUNT_PERM_NOT_FOUND.value);
			done(err);
		});
	});

	it('should able to remove user permission', function(done){

		async.series([
			callback => {
				agent.delete(`/${username}/permissions/user3`)
				.expect(200, function(err, res){
					callback(err);
				});
			},

			callback => {
				agent.get(`/${username}/permissions`)
				.expect(200, function(err, res){
					expect(res.body.find(perm => perm.user === 'user3')).to.not.exist;
					callback(err);
				});
			}

		], (err, res) => done(err));
	});

	let projectName = 'project567';

	it('should able to create_project on other teamspace if given create_project on the target teamspace', function(done){

		const teamspace = 'testing';

		agent.post(`/${teamspace}/projects`)
		.send({ name: projectName })
		.expect(200, done);
	});

	it('should able to access the project created by the users themselves', function(done){

		const teamspace = 'testing';

		agent.get(`/${teamspace}/projects/${projectName}`)
		.expect(200, done);
	});
});
