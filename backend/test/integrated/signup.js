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

let expect = require('chai').expect;
let app = require("../../services/api.js").createApp(
	{ session: require('express-session')({ secret: 'testing'}) }
);


let request = require('supertest');
let C = require('../../constants');
let responseCodes = require("../../response_codes.js");

describe('Sign up', function(){

	let server;

	before(function(done){
		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');
			done();
		});
	});

	after(function(done){
		server.close(function(){
			console.log('API test server is closed');
			done();
		})
	});

	let username = 'signup_helloworld';
	let password = 'password';
	let email = 'test3drepo_signup@mailinator.com';

	let User = require('../../models/user');

	it('with available username should return success', function(done){

		request(server)
		.post(`/${username}`)
		.send({

			"email": email,
			"password": password

		}).expect(200, function(err, res){

			expect(res.body.account).to.equal(username);
			done(err);
		});

	});


	it('should have user created in database after sign up', function(){
		// use return for promise function
		return User.findByUserName(username).then(user => {
			expect(user).to.not.be.null;
			expect(user.user).to.equal(username);
		});
	});

	it('with username that already exists should fail', function(done){

		request(server)
		.post(`/${username}`)
		.send({

			"email": email,
			"password": password

		}).expect(400, function(err, res){
			done(err);
		});

	});


	C.REPO_BLACKLIST_USERNAME.forEach(username => {

		it('with blacklisted username - ' + username + ' should fail', function(done){
			request(server)
			.post(`/${username}`)
			.send({

				"email": email,
				"password": password

			}).expect(400, function(err, res){
				done(err);
			});
		});

	});

	it('with invalid email address - abc@b should fail', function(done){
			request(server)
			.post('/signup_somebaduser')
			.send({

				"email": "abc@b",
				"password": password

			}).expect(400, function(err, res){

				expect(res.body.value).to.equal(responseCodes.SIGN_UP_INVALID_EMAIL.value);
				done(err);
			});
	});

	it('with invalid email address - abc should fail', function(done){
			request(server)
			.post('/signup_somebaduser')
			.send({

				"email": "abc",
				"password": password

			}).expect(400, function(err, res){

				expect(res.body.value).to.equal(responseCodes.SIGN_UP_INVALID_EMAIL.value);
				done(err);
			});
	});

	it('without email should fail', function(done){
			request(server)
			.post('/signup_somebaduser')
			.send({

				"email": "",
				"password": password

			}).expect(400, function(err, res){

				expect(res.body.value).to.equal(responseCodes.SIGN_UP_INVALID_EMAIL.value);
				done(err);
			});
	});

	it('without password should fail', function(done){
			request(server)
			.post('/signup_somebaduser')
			.send({

				"email": email,
				"password": ''

			}).expect(400, function(err, res){

				expect(res.body.value).to.equal(responseCodes.SIGN_UP_PASSWORD_MISSING.value);
				done(err);
			});
	});


});
