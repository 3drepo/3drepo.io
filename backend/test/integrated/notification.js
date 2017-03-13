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
let config = require('../../config');
let app = require("../../services/api.js").createApp(
	{ session: config.api_server.session }
);
let log_iface = require("../../logger.js");
let systemLogger = log_iface.systemLogger;
let responseCodes = require("../../response_codes.js");
let async = require('async');
let http = require('http');
let newXhr = require('socket.io-client-cookie'); 
let io = require('socket.io-client');

describe('Notification', function () {

	let server;
	let agent;
	let agent2;
	let username = 'testing';
	let password = 'testing';
	let project = 'testproject';

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

	let connectSid;

	before(function(done){
		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');


			let chatServer = http.createServer();

			let chat = require('../../services/chat.js').createApp(
				chatServer, config.chat_server
			);

			chatServer.listen(config.chat_server.port, function(){
				console.log(`chat server listening on ${config.chat_server.port}`);
				async.series([
					function(done){
						agent = request.agent(server);
						agent.post('/login')
						.send({ username, password })
						.expect(200, function(err, res){
							cookies = res.header['set-cookie'][0];

							cookies.split(';').forEach(keyval => {
								if(keyval){
									keyval = keyval.split('=');
									if(keyval[0] === 'connect.sid'){
										connectSid = keyval[1];
									}
								}
							});
							done(err);
						});
					},
					function(done){
						agent2 = request.agent(server);
						agent2.post('/login')
						.send({ username: username, password: password })
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

	it('connect to chat server and join room should succee', function(done){
		this.timeout(2000);

		//https://gist.github.com/jfromaniello/4087861
		//socket-io.client send the cookies!

		newXhr.setCookies(`connect.sid=${connectSid}; `);
		socket = io(config.chat_server.chat_host, {path: '/' + config.chat_server.subdirectory});
		socket.on('connect', function(data){

			socket.emit('join', {account: username, project: project});
			
			socket.on('joined', function(data){
				if(data.account === username && data.project === project){
					done();
				}
			});

			socket.on('credentialError', function(err){
				done(err);
			});
		});

	
	});


	it('join a room that user has no access to should fail', function(done){

		newXhr.setCookies(`connect.sid=${connectSid}; `);
		
		//https://github.com/socketio/socket.io-client/issues/318 force new connection
		let mySocket = io(config.chat_server.chat_host, {path: '/' + config.chat_server.subdirectory, 'force new connection': true});

		mySocket.on('connect', function(data){
			console.log('on connect')
			mySocket.emit('join', {account: 'someaccount', project: 'someproject'});

			mySocket.on('credentialError', function(err){
				expect(err).to.exist
				done();
			});
		});
	})

	let issueId;

	it('subscribe new issue notification should succee', function(done){

		//other users post an issue
		let issue = Object.assign({"name":"Issue test"}, baseIssue);


		socket.on(`${username}::${project}::newIssues`, function(issues){

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

		agent2.post(`/${username}/${project}/issues.json`)
		.send(issue)
		.expect(200 , function(err, res){
			issueId = res.body._id;
			expect(err).to.not.exist;
		});

		socket.on('credentialError', function(err){
			done(err);
		});
	});

	it('subscribe new comment notification should succee', function(done){
		let comment = {"comment":"abc123","viewpoint":{"up":[0,1,0],"position":[38,38,125.08011914810137],"look_at":[0,0,-1],"view_dir":[0,0,-1],"right":[1,0,0],"unityHeight":3.598903890627168,"fov":2.127137068283407,"aspect_ratio":0.8810888191084674,"far":244.15656512260063,"near":60.08161739445468,"clippingPlanes":[]}};
		
		socket.on(`${username}::${project}::${issueId}::newComment`, function(resComment){
			expect(resComment).to.exist;
			expect(resComment.comment).to.equal(comment.comment);
			expect(resComment.viewpoint.up).to.deep.equal(comment.viewpoint.up);
			expect(resComment.viewpoint.position).to.deep.equal(comment.viewpoint.position);
			expect(resComment.viewpoint.look_at).to.deep.equal(comment.viewpoint.look_at);
			expect(resComment.viewpoint.view_dir).to.deep.equal(comment.viewpoint.view_dir);
			expect(resComment.viewpoint.right).to.deep.equal(comment.viewpoint.right);
			expect(resComment.viewpoint.unityHeight).to.equal(comment.viewpoint.unityHeight);
			expect(resComment.viewpoint.fov).to.equal(comment.viewpoint.fov);
			expect(resComment.viewpoint.aspect_ratio).to.equal(comment.viewpoint.aspect_ratio);
			expect(resComment.viewpoint.far).to.equal(comment.viewpoint.far);
			expect(resComment.viewpoint.near).to.equal(comment.viewpoint.near);
			expect(resComment.viewpoint.clippingPlanes).to.deep.equal(comment.viewpoint.clippingPlanes);

			done();
		});

		agent2.put(`/${username}/${project}/issues/${issueId}.json`)
		.send(comment)
		.expect(200 , function(err, res){
			expect(err).to.not.exist;
		});
	});


	it('subscribe comment changed notification should succee', function(done){
		let comment ={"comment":"abc123456","edit":true,"commentIndex":0};

		socket.on(`${username}::${project}::${issueId}::commentChanged`, function(resComment){
			expect(resComment).to.exist;
			expect(resComment.comment).to.equal(comment.comment);
			done();
		});

		agent2.put(`/${username}/${project}/issues/${issueId}.json`)
		.send(comment)
		.expect(200 , function(err, res){
			expect(err).to.not.exist;
		});
	});


	it('subscribe comment deleted notification should succee', function(done){

		let comment = {"comment":"","delete":true,"commentIndex":0}

		socket.on(`${username}::${project}::${issueId}::commentDeleted`, function(resComment){
			expect(resComment).to.exist;
			done();
		});

		agent2.put(`/${username}/${project}/issues/${issueId}.json`)
		.send(comment)
		.expect(200 , function(err, res){
			expect(err).to.not.exist;
		});
	});

	it('subscribe issue change should succee', function(done){

		let status = {"priority":"high","status":"open","topic_type":"for info","assigned_roles":["testproject.collaborator"]};

		socket.off(`${username}::${project}::${issueId}::newComment`);

		async.parallel([
			function(done){
				socket.on(`${username}::${project}::${issueId}::newComment`, function(resComment){
					expect(resComment).to.exist;
					expect(resComment.action).to.deep.equal({"property":"priority","from":"low","to":"high"});
					done();
				});
			},
			function(done){
				socket.on(`${username}::${project}::${issueId}::issueChanged`, function(issue){
					expect(issue).to.exist;
					expect(issue.priority).to.equal('high');
					done();
				});
			}
		], done)




		agent2.put(`/${username}/${project}/issues/${issueId}.json`)
		.send(status)
		.expect(200 , function(err, res){
			expect(err).to.not.exist;
		});
	});

});