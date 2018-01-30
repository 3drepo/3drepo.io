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
let logger = require("../../logger.js");
let systemLogger = logger.systemLogger;
let responseCodes = require("../../response_codes.js");
let helpers = require("./helpers");
let async = require('async');

describe('Updating user info', function () {
	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'updateinfo_username';
	let password = 'password';
	let email = 'test3drepo_updateinfo@mailinator.com';
	let newEmail = 'test3drepo_updateinfo_1@mailinator.com';
	let takenEmail = 'test3drepo@mailinator.com';

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

	it('should succee if provide new info and same email address', function(done){

		let firstName = 'abc';
		let lastName = 'def';
		async.series([
			function update(done){
				agent.put(`/${username}`)
				.send({ firstName, lastName, email })
				.expect(200, done);
			},

			function check(done){
				agent.get(`/${username}.json`)
				.expect(200, function(err, res){
					expect(res.body.firstName).to.equal(firstName);
					expect(res.body.lastName).to.equal(lastName);
					done(err);
				});
			}
		], done);

	});


	it('should succee if provide new info and new email address', function(done){

		let firstName = 'abc';
		let lastName = 'def';
		async.series([
			function update(done){
				agent.put(`/${username}`)
				.send({ firstName, lastName, email: newEmail})
				.expect(200, done);
			},

			function check(done){
				agent.get(`/${username}.json`)
				.expect(200, function(err, res){
					expect(res.body.firstName).to.equal(firstName);
					expect(res.body.lastName).to.equal(lastName);
					expect(res.body.email).to.equal(newEmail);
					done(err);
				});
			}
		], done);

	});

	it('should fail if email provided is taken', function(done){

		let firstName = 'abc';
		let lastName = 'def';


		agent.put(`/${username}`)
		.send({ firstName, lastName, email: takenEmail })
		.expect(400, function(err, res){
			expect(res.body.value).to.equal(responseCodes.EMAIL_EXISTS.value);
			done(err);
		});


	});
});

