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


describe('Permission templates', function () {

	let server;
	let agent;
	let username = 'job';
	let password = 'job';
	let permission = { _id: 'customA', permissions: ['view_issue', 'view_project']};
	let permission1 = { _id: 'customB', permissions: ['view_issue', 'view_project', 'create_project', 'create_issue']};

	let subId = '58ecfbf94804d17bee4cdbbc';


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

	it('should able to create new template', function(done){

		agent.post(`/${username}/permission-templates`)
		.send(permission)
		.expect(200, function(err, res){
			done(err);
		});
	
	});

	it('should fail to create duplicated template', function(done){

		agent.post(`/${username}/permission-templates`)
		.send(permission)
		.expect(400, function(err, res){
			expect(res.body.value).to.equal(responseCodes.DUP_PERM_TEMPLATE.value);
			done(err);
		});
	
	});


	it('should able to create another template', function(done){

		agent.post(`/${username}/permission-templates`)
		.send(permission1)
		.expect(200, function(err, res){
			done(err);
		});
	
	});

	it('should fail to create template with invalid permission', function(done){

		agent.post(`/${username}/permission-templates`)
		.send( { _id: 'customC', permissions: ['nonsense']})
		.expect(400, function(err, res){
			expect(res.body.value).to.equal(responseCodes.INVALID_PERM.value);
			done(err);
		});
	
	});


	it('should able to remove template', function(done){

		agent.delete(`/${username}/permission-templates/${permission._id}`)
		.expect(200, function(err, res){
			done(err);
		});
	
	});

	it('should fail to remove template that doesnt exist', function(done){

		agent.delete(`/${username}/permission-templates/nonsense`)
		.expect(404, function(err, res){
			done(err);
		});
	
	});
});