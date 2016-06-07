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

describe('Viewing a project', function () {
	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'testing';
	let password = 'testing';
	let project = 'testproject';

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

	it('should succee if getting head.x3d.mp', function(done){

		agent.get(`/${username}/${project}/revision/master/head.x3d.mp`)
		.expect(200, function(err ,res){
			done(err);
		});

	});


	it('should succee if getting json.mpc', function(done){

		agent.get(`/${username}/${project}/d2a73c6e-b6d8-43dd-bf31-e1d65300d721.json.mpc`)
		.expect(200, function(err ,res){
			done(err);
		});

	});

	it('should succee if getting x3d.mpc', function(done){

		agent.get(`/${username}/${project}/d2a73c6e-b6d8-43dd-bf31-e1d65300d721.x3d.mpc`)
		.expect(200, function(err ,res){
			done(err);
		});

	});

	it('should succee if getting src.mpc', function(done){

		agent.get(`/${username}/${project}/d2a73c6e-b6d8-43dd-bf31-e1d65300d721.src.mpc`)
		.expect(200, function(err ,res){
			done(err);
		});

	});

});