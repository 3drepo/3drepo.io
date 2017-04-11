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



describe('Job', function () {

	let server;
	let agent;
	let username = 'job';
	let password = 'job';
	let job = { _id: 'job1', color: '000000'};


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

	it('should able to create new job', function(done){

		agent.post(`/${username}/jobs`)
		.send(job)
		.expect(200, function(err, res){
			done(err);
		});
	
	});

	it('should not able to create duplicated job', function(done){

		agent.post(`/${username}/jobs`)
		.send(job)
		.expect(400 , function(err, res){
			expect(res.body.value).to.equal(responseCodes.DUP_JOB.value);
			done(err);
		});
	
	});

	it('should able to list the job created', function(done){
		agent.get(`/${username}.json`)
		.expect(200, function(err, res){
			expect(res.body.jobs).to.deep.equal([job]);
			done(err);
		});
	});


	it('should able to remove a job', function(done){
		agent.delete(`/${username}/jobs/${job._id}`)
		.expect(200, function(err, res){
			done(err);
		});	
	});

	it('should not able to remove a job that doesnt exist', function(done){
		agent.delete(`/${username}/jobs/nonsense`)
		.expect(404, function(err, res){
			expect(res.body.value).to.equal(responseCodes.JOB_NOT_FOUND.value);
			done(err);
		});	
	})

	it('job should be removed from the list', function(done){
		agent.get(`/${username}.json`)
		.expect(200, function(err, res){
			expect(res.body.jobs).to.deep.equal([]);
			done(err);
		});
	});
});