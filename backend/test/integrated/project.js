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


describe('Project', function () {
	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'project_username';
	let password = 'password';
	let email = 'test3drepo_project@mailinator.com';
	let project = 'project1';
	let desc = 'desc';
	let type = 'type';

	before(function(done){

		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');

			helpers.signUpAndLogin({
				server, request, agent, expect, User, systemLogger,
				username, password, email,
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

	it('should be created successfully', function(done){

		agent.post(`/${username}/${project}`)
		.send({ desc, type })
		.expect(200, function(err ,res) {

			expect(res.body.project).to.equal(project);

			if(err){
				return done(err);
			}

			agent.get(`/${username}/${project}.json`)
			.expect(200, function(err, res){
				expect(res.body.desc).to.equal(desc);
				expect(res.body.type).to.equal(type);
				done(err);
			})
			
		});
	});

	it('should return error message if project name already exists', function(done){

		agent.post(`/${username}/${project}`)
		.send({ desc, type })
		.expect(400, function(err ,res) {
			expect(res.body.value).to.equal(responseCodes.PROJECT_EXIST.value);
			done(err);
		});
	});


	it('should return error message if project name is blacklisted - password', function(done){

		agent.post(`/${username}/password`)
		.send({ desc, type })
		.expect(400, function(err ,res) {
			expect(res.body.value).to.equal(responseCodes.BLACKLISTED_PROJECT_NAME.value);
			done(err);
		});
	});


	it('should return error message if project name contains spaces', function(done){

		agent.post('/' + username + '/you%20are%20genius')
		.send({ desc, type })
		.expect(400, function(err ,res) {
			expect(res.body.value).to.equal(responseCodes.INVALID_PROJECT_NAME.value);
			done(err);
		});
	});

	it('should return error if creating a project in a database that doesn\'t exists or not authorized for', function(done){

		agent.post(`/${username} + '_someonelese' /${project}`)
		.send({ desc, type })
		.expect(401, function(err ,res) {
			done(err);
		});
	});


});