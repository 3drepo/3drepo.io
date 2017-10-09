'use strict';

/**
 *  Copyright (C) 2016 3D Repo Ltd
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
let helpers = require("./helpers");
let C = require('../../constants');
let async = require('async');
let ModelSetting = require('../../models/modelSetting');
let User = require('../../models/user');
let config = require('../../config');
let fs = require('fs');

describe('Metadata', function () {

	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'metaTest';
	let password = '123456';
	let model = '4d3df6a7-b4d5-4304-a6e1-dc192a761490';
	let oldRevision = "c01daebe-9fe1-452e-a77e-d201280d1fb9";

	before(function(done){

		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');

			agent = request.agent(server);
			agent.post('/login')
			.send({ username, password })
			.expect(200, function(err, res){
				console.log(res.body);
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

	it('metadata search of a specific revision should succeed', function(done){
		agent.get(`/${username}/${model}/revision/${oldRevision}/meta/Category.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});

	it('metadata search of head master should succeed', function(done){
		agent.get(`/${username}/${model}/revision/master/head/meta/Category.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});

	it('get metadata by revision tag should succeed', function(done){
		agent.get(`/${username}/${model}/revision/myTag/meta/Category.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});

	it('get metadata of invalid revision should fail', function(done){
		agent.get(`/${username}/${model}/revision/blahblah123/meta/Category.json`)
		.expect(400, function(err, res){
			done(err);
		});
	});

	it('metadata search of non existent field should succeed', function(done){
		agent.get(`/${username}/${model}/revision/${oldRevision}/meta/blahblah.json`)
		.expect(200, function(err, res){
			expect(JSON.parse(res.text).data).to.equal([]);
			done(err);
		});
	});
	
	it('retrieving metadata by existing ID should succeed', function(done){
		agent.get(`/${username}/${model}/meta/60fa0851-2fc1-4906-b50d-b9bb9db98db8.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});

	it('retrieving metadata by non-existing ID should fail', function(done){
		agent.get(`/${username}/${model}/meta/60fa0851-2fc1-4906-b50d-000000000000.json`)
		.expect(404, function(err, res){
			done(err);
		});
	});

	it('retrieving metadata by invalid ID should fail', function(done){
		agent.get(`/${username}/${model}/meta/dslfkdjslkfjsd.json`)
		.expect(404, function(err, res){
			done(err);
		});
	});

});
