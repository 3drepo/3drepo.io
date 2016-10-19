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
let session =  require('express-session')({ secret: 'testing'});

let app = require("../../services/api.js").createApp(
	{ session: session }
);
let log_iface = require("../../logger.js");
let systemLogger = log_iface.systemLogger;
let responseCodes = require("../../response_codes.js");
let config = require('../../config');
let io = require('socket.io-client');
let async = require('async');
let http = require('http');

describe('Notification', function () {

	let server;
	let agent;
	let agent2;
	let username = 'testing';
	let password = 'testing';

	let projectAccount = 'projectshared';
	let password2 = 'password';

	let project = 'projecttest';

	let cookies;
	let socket;
	let baseIssue = {
		"status": "open",
		"priority": "low",
		"topic_type": "for info",
		"viewpoint":{
			"up":[0,1,0],
			"position":[38,38 ,125.08011914810137],
			"look_at":[0,0,-163.08011914810137],
			"view_dir":[0,0,-1],
			"right":[1,0,0],
			"unityHeight ":3.537606904422707,
			"fov":2.1124830653010416,
			"aspect_ratio":0.8750189337327384,
			"far":276.75612077194506 ,
			"near":76.42411012233212,
			"clippingPlanes":[]
		},
		"scale":1,
		"creator_role":"testproject.collaborator",
		"assigned_roles":["testproject.collaborator"],
	};

	before(function(done){
		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');


			let chatServer = http.createServer();

			let chat = require('../../services/chat.js').createApp(
				chatServer, { session: session }
			);

			chatServer.listen(config.chat.port, function(){
				console.log(`chat server listening on ${config.chat.port}`);
				async.series([
					function(done){
						agent = request.agent(server);
						agent.post('/login')
						.send({ username, password })
						.expect(200, function(err, res){
							cookies = res.header['set-cookie'][0];
							done(err);
						});
					},
					function(done){
						agent2 = request.agent(server);
						agent2.post('/login')
						.send({ username: projectAccount, password: password2 })
						.expect(200, done);
					}
				], done);

			});
		});
	});


	after(function(done){
		server.close(function(){
			console.log('API test server is closed');
			done();
		});
	});

	it('connect to chat server and join room', function(done){


		//https://gist.github.com/jfromaniello/4087861
		//socket-io.client send the cookies!

		let connectSid;

		cookies.split(';').forEach(keyval => {
			if(keyval){
				keyval = keyval.split('=');
				if(keyval[0] === 'connect.sid'){
					connectSid = keyval[1];
				}
			}
		});

		socket = io(config.api_server.chat_host, {query: `connect.sid=${encodeURIComponent(connectSid)}`});
		socket.on('connect', function(data){

			socket.emit('join', {account: projectAccount, project: project});
			done();
		});
	
	});


	it('subscribe new issue notification', function(done){

		//other users post an issue
		let issue = Object.assign({"name":"Issue test"}, baseIssue);


		console.log(`${projectAccount}::${project}::newIssues`);
		socket.on(`${projectAccount}::${project}::newIssues`, function(issues){

			expect(issues[0]).to.exist;
			expect(issues[0].name).to.equal(issue.name);
			expect(issues[0].scale).to.equal(issue.scale);
			expect(issues[0].status).to.equal(issue.status);
			expect(issues[0].topic_type).to.equal(issue.topic_type);
			expect(issues[0].priority).to.equal(issue.priority);
			expect(issues[0].creator_role).to.equal(issue.creator_role);
			expect(issues[0].assigned_roles).to.deep.equal(issue.assigned_roles);
			expect(issues[0].viewpoint.up).to.deep.equal(issue.viewpoint.up);
			expect(issues[0].viewpoint.position).to.deep.equal(issue.viewpoint.position);
			expect(issues[0].viewpoint.look_at).to.deep.equal(issue.viewpoint.look_at);
			expect(issues[0].viewpoint.view_dir).to.deep.equal(issue.viewpoint.view_dir);
			expect(issues[0].viewpoint.right).to.deep.equal(issue.viewpoint.right);
			expect(issues[0].viewpoint.unityHeight).to.equal(issue.viewpoint.unityHeight);
			expect(issues[0].viewpoint.fov).to.equal(issue.viewpoint.fov);
			expect(issues[0].viewpoint.aspect_ratio).to.equal(issue.viewpoint.aspect_ratio);
			expect(issues[0].viewpoint.far).to.equal(issue.viewpoint.far);
			expect(issues[0].viewpoint.near).to.equal(issue.viewpoint.near);
			expect(issues[0].viewpoint.clippingPlanes).to.deep.equal(issue.viewpoint.clippingPlanes);

			done();
		});

		agent2.post(`/${projectAccount}/${project}/issues.json`)
		.send(issue)
		.expect(200 , function(err, res){
			expect(err).to.not.exist;
		});


	});
});