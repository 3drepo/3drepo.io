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
	{ session: require('express-session')({ secret: 'testing',  resave: false,   saveUninitialized: false }) }
);
const log_iface = require("../../logger.js");
const systemLogger = log_iface.systemLogger;
const responseCodes = require("../../response_codes.js");
const async = require('async');


describe('Job', function () {

	let server;
	let agent;
	let username = 'job';
	let password = 'job';
	let job = { _id: 'job1', color: '000000'};
	let job2 = { _id: 'job2', color: '000000'};

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

	it('should able to create new job', function(done){

		agent.post(`/${username}/jobs`)
		.send(job)
		.expect(200, function(err, res){
			done(err);
		});
	
	});

	it('should able to create second job', function(done){

		agent.post(`/${username}/jobs`)
		.send(job2)
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
			expect(res.body.jobs).to.deep.equal([job, job2]);
			done(err);
		});
	});

	it('should fail to assign a job that doesnt exist to a licence(user)', function(done){
		agent.post(`/${username}/subscriptions/${subId}/assign`)
		.send({ user: 'testing', job: `nonsense`})
		.expect(404, function(err, res){
			expect(res.body.value).to.equal(responseCodes.JOB_NOT_FOUND.value);
			done(err);
		});
	});

	it('should able to assign a job to a licence(user)', function(done){

		async.series([
			callback => {
				agent.post(`/${username}/subscriptions/${subId}/assign`)
				.send({ user: 'testing', job: job._id})
				.expect(200, function(err, res){
					callback(err);
				});
			},

			callback => {
				agent.get(`/${username}/subscriptions`)
				.expect(200, function(err, res){
					expect(res.body.find(sub => sub._id === subId).job).to.equal(job._id);
					callback(err);
				});
			}

		], (err, res) => done(err));

	});

	it('should fail to change assignment to a job that doesnt exist to a licence(user)', function(done){
		agent.put(`/${username}/subscriptions/${subId}/assign`)
		.send({ job: `nonsense`})
		.expect(404, function(err, res){
			expect(res.body.value).to.equal(responseCodes.JOB_NOT_FOUND.value);
			done(err);
		});
	});

	it('should able to change assignment to another job', function(done){
		async.series([
			callback => {
				agent.put(`/${username}/subscriptions/${subId}/assign`)
				.send({ job: job2._id})
				.expect(200, function(err, res){
					callback(err);
				});
			},

			callback => {
				agent.get(`/${username}/subscriptions`)
				.expect(200, function(err, res){
					expect(res.body.find(sub => sub._id === subId).job).to.equal(job2._id);
					callback(err);
				});
			}

		], (err, res) => done(err));
	});


	it('should able to unassign', function(done){

		let subId = '591063b613f4b994b72df324';
		async.series([
			callback => {
				agent.put(`/${username}/subscriptions/${subId}/assign`)
				.send({ job: ''})
				.expect(200, function(err, res){
					callback(err);
				});
			},

			callback => {
				agent.get(`/${username}/subscriptions`)
				.expect(200, function(err, res){
					expect(res.body.find(sub => sub._id === subId).job).to.not.exist;
					callback(err);
				});
			}

		], (err, res) => done(err));
	});

	it('should fail to remove a job if it is assigned to someone', function(done){
		agent.delete(`/${username}/jobs/${job2._id}`)
		.expect(400, function(err, res){
			expect(res.body.value).to.equal(responseCodes.JOB_ASSIGNED.value);
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
			expect(res.body.jobs).to.deep.equal([job2]);
			done(err);
		});
	});
});