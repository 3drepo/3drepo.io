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

	let subId = '58ef9c8d70f65b5587e6dae5';
	let subId2 = '58ef9c8d70f65b5587e6dae6';

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

	it('should fail to assign permissions to a licence(user) that doesnt exist', function(done){
		agent.post(`/${username}/subscriptions/${subId}/assign`)
		.send({ user: 'nonsense', permissions: ['create_project']})
		.expect(404, function(err, res){
			expect(res.body.value).to.equal(responseCodes.USER_NOT_FOUND.value);
			done(err);
		});
	});

	it('should fail to assign non team space permissions to a licence(user)', function(done){
		agent.post(`/${username}/subscriptions/${subId2}/assign`)
		.send({ user: 'user1', permissions: ['view_issue']})
		.expect(400, function(err, res){
			expect(res.body.value).to.equal(responseCodes.INVALID_PERM.value);
			done(err);
		});
	});

	it('should able to assign permissions to a licence(user)', function(done){

		async.series([
			callback => {
				agent.post(`/${username}/subscriptions/${subId}/assign`)
				.send({ user: 'testing', permissions: ['create_project']})
				.expect(200, function(err, res){
					callback(err);
				});
			},

			callback => {
				agent.get(`/${username}/subscriptions`)
				.expect(200, function(err, res){
					expect(res.body.find(sub => sub._id === subId).permissions).to.deep.equal(['create_project']);
					callback(err);
				});
			}

		], (err, res) => done(err));

	});


	it('should able to update permissions to a licence(user)', function(done){

		async.series([
			callback => {
				agent.put(`/${username}/subscriptions/${subId}/assign`)
				.send({ permissions: []})
				.expect(200, function(err, res){
					callback(err);
				});
			},

			callback => {
				agent.get(`/${username}/subscriptions`)
				.expect(200, function(err, res){
					expect(res.body.find(sub => sub._id === subId).permissions).to.deep.equal([]);
					callback(err);
				});
			}

		], (err, res) => done(err));

	});


	it('should able to update permissions to a licence(user)', function(done){

		async.series([
			callback => {
				agent.put(`/${username}/subscriptions/${subId}/assign`)
				.send({ permissions: ['create_project']})
				.expect(200, function(err, res){
					callback(err);
				});
			},

			callback => {
				agent.get(`/${username}/subscriptions`)
				.expect(200, function(err, res){
					expect(res.body.find(sub => sub._id === subId).permissions).to.deep.equal(['create_project']);
					callback(err);
				});
			}

		], (err, res) => done(err));

	});


	it('should fail to update non team space permissions to a licence(user)', function(done){
		agent.put(`/${username}/subscriptions/${subId}/assign`)
		.send({ permissions: ['view_issue']})
		.expect(400, function(err, res){
			expect(res.body.value).to.equal(responseCodes.INVALID_PERM.value);
			done(err);
		});
	});

});
