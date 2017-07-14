'use strict';

// test implied permission like admin of teamspace can do everything in their own teamspace and
// admin of an project can do everything in their own project, and all the crazy wildcard permissions 
// for all models in a project

describe('Implied permission::', function () {

	let server;
	let agent;

	const app = require("../../services/api.js").createApp(
		{ session: require('express-session')({ secret: 'testing'}) }
	);
	const sharedTeamspace = 'imsharedTeamspace';
	const C = require('../../constants');
	const middlewares = require('../../middlewares/middlewares');
	const request = require('supertest');
	const expect = require('chai').expect;
	const model = {
		"desc": "this is a model",
		"type": "Structural",
		"code": "00123",
		"unit": "m"
	};
	const q = require('../../services/queue');

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
		});
	});

	//teamspace admin
	describe('Teamspace admin::', function(){

		let agent;

		const username = 'impermTeamspaceAdmin';
		const password = 'impermTeamspaceAdmin';
		const project = 'project1';
		const project2 = 'project2';
		const modelId = '40e6a14c-29b9-4ce1-a04c-86eb7d8d261a';
		const modeltoDelete = '7de7b6b3-a3c8-4121-987f-9d12d2dc241b';

		const baseIssue = {
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
			"creator_role":"jobA",
			"assigned_roles":["jobB"],
		};

		const issueId = 'b3e52b50-6330-11e7-a610-939d55d9fca8';

		before(function(done){
			agent = request.agent(server);
			agent.post('/login')
			.send({ username, password })
			.expect(200, function(err, res){
				expect(res.body.username).to.equal(username);
				done(err);
			});
		});

		after(function(){
			return q.channel.purgeQueue(q.workerQName);
		})

		//list teamspaces api show implied permissions
		it('list teamspaces api show correct inherited and implied permissions', function(done){
			agent
			.get(`/${username}.json`)
			.expect(200, function(err, res){
				expect(err).to.not.exist;

				const teamspace = res.body.accounts.find(a => a.account === sharedTeamspace);
				expect(teamspace).to.exist;
				expect(teamspace.permissions).to.deep.equal(C.ACCOUNT_PERM_LIST);

				const project = teamspace.projects.find(p => p.name === project2);
				expect(project).to.exist;
				expect(project.permissions).to.deep.equal(C.PROJECT_PERM_LIST);

				const model = project.models.find(m => m.model === modelId);
				expect(model).to.exist;
				expect(model.permissions).to.deep.equal(C.MODEL_PERM_LIST);

				done();

			});
		});

		it('list model info should show correct inherited and implied permissions', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}.json`)
			.expect(200, function(err, res){
				expect(err).to.not.exist;
				expect(res.body.permissions).to.deep.equal(C.MODEL_PERM_LIST);
				done();
			});
		});

		it('can create project', function(done){
			agent
			.post(`/${sharedTeamspace}/projects`)
			.send({
				'name': 'tc1project'
			})
			.expect(200, done);
		});

		it('can edit project', function(done){
			agent
			.put(`/${sharedTeamspace}/projects/${project}`)
			.send({
				'name': project
			})
			.expect(200, done);
		});

		it('can delete project', function(done){
			agent
			.delete(`/${sharedTeamspace}/projects/${project}`)
			.expect(200, done);
		});

		it('can create a model', function(done){

			const modelName = 'model123';
			agent
			.post(`/${sharedTeamspace}/${modelName}`)
			.send(model)
			.expect(200, done);
		});

		it('can create federation', function(done){

			const modelName = 'fedmodel123';
			let corId, appId;

			//fake a response from bouncer;
			setTimeout(function(){
				q.channel.assertQueue(q.workerQName, { durable: true }).then(info => {
					expect(info.messageCount).to.equal(1);
					return q.channel.get(q.workerQName);
				}).then(res => {
					corId = res.properties.correlationId;
					appId = res.properties.appId;
					return q.channel.assertExchange(q.callbackQName, 'direct', { durable: true });
				}).then(() => {
					//send fake job done message to the queue;
					return q.channel.publish(
						q.callbackQName,
						appId,
						new Buffer(JSON.stringify({ value: 0})), 
						{
							correlationId: corId, 
							persistent: true 
						}
					);
				}).catch(err => {
					done(err);
				});

			}, 1000);

			agent
			.post(`/${sharedTeamspace}/${modelName}`)
			.send(Object.assign({
				subModels:[{
					"database": sharedTeamspace,
					"model": modelId
				}] 
			}, model))
			.expect(200, done);
		})

		it('can view model', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}.json`)
			.expect(200, done);
		});

		it('can download model', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}/download/latest`)
			.expect(404, done);
		});

		it('can upload model', function(done){
			agent
			.post(`/${sharedTeamspace}/${modelId}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/upper.OBJ')
			.expect(200, done);
		});

		it('can edit model setting', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelId}/settings`)
			.send({code: '00011'})
			.expect(200, done);
		});

		it('can view issues', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}/issues.json`)
			.expect(200 , done);
		});

		it('can create issue', function(done){

			let issue = Object.assign({"name":"Issue test"}, baseIssue);
			agent
			.post(`/${sharedTeamspace}/${modelId}/issues.json`)
			.send(issue)
			.expect(200 , done);

		});
		
		it('can comment', function(done){

			let comment = { 
				comment: 'hello world',
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
			};

			agent.put(`/${sharedTeamspace}/${modelId}/issues/${issueId}.json`)
			.send(comment)
			.expect(200 , done);
		});


		it('can edit issue', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelId}/issues/${issueId}.json`)
			.send({  status: 'open' })
			.expect(200 , done);
		});


		it('can delete model', function(done){
			agent
			.delete(`/${sharedTeamspace}/${modeltoDelete}`)
			.expect(200 , done);
		});

		//another way of testing permissions
		// it('can delete model 2', function(done){

		// 	const req = {
		// 		session : { user : {username} },
		// 		params: {
		// 			account: 'henry',
		// 			model: modelId
		// 		}
		// 	};


		// 	middlewares.hasDeleteAccessToModel(req, null, err => {
		// 		expect(err).to.exists;
		// 		done();
		// 	});
		// });


	});


	//project admin
	describe('Project admin::', function(){

		let agent;

		const username = 'imProjectAdmin';
		const password = 'imProjectAdmin';
		const projectHaveAccess = 'project3';
		const project2 = 'project2';
		const projectNoAccess = 'project4'
		const modelId = '40e6a14c-29b9-4ce1-a04c-86eb7d8d261a';
		const modeltoDelete = '5a55347a-11c7-439f-ac41-4fda1c1c89a6';
		const modelNoAccess = 'c92b9a11-c13b-40aa-b2a6-16cfea99d78e';

		const baseIssue = {
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
			"creator_role":"jobA",
			"assigned_roles":["jobB"],
		};

		const issueId = 'b3e52b50-6330-11e7-a610-939d55d9fca8';

		before(function(done){
			agent = request.agent(server);
			agent.post('/login')
			.send({ username, password })
			.expect(200, function(err, res){
				expect(res.body.username).to.equal(username);
				done(err);
			});
		});

		after(function(){
			return q.channel.purgeQueue(q.workerQName);
		});

		//list teamspaces api show implied permissions
		it('list teamspaces api show correct inherited and implied permissions', function(done){
			agent
			.get(`/${username}.json`)
			.expect(200, function(err, res){
				expect(err).to.not.exist;

				const teamspace = res.body.accounts.find(a => a.account === sharedTeamspace);
				expect(teamspace).to.exist;
				expect(teamspace.permissions).to.deep.equal([]);

				const project = teamspace.projects.find(p => p.name === project2);
				expect(project).to.exist;
				expect(project.permissions).to.deep.equal(C.PROJECT_PERM_LIST);

				const model = project.models.find(m => m.model === modelId);
				expect(model).to.exist;
				expect(model.permissions).to.deep.equal(C.MODEL_PERM_LIST);

				done();

			});
		});


		it('list model info should show correct inherited and implied permissions', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}.json`)
			.expect(200, function(err, res){
				expect(err).to.not.exist;
				expect(res.body.permissions).to.deep.equal(C.MODEL_PERM_LIST);
				done();
			});
		});

		it('cannot create project', function(done){
			agent
			.post(`/${sharedTeamspace}/projects`)
			.send({
				'name': 'tc2project'
			})
			.expect(401, done);
		});

		it('can edit project', function(done){
			agent
			.put(`/${sharedTeamspace}/projects/${projectHaveAccess}`)
			.send({
				'name': projectHaveAccess
			})
			.expect(200, done);
		});

		it('cannot edit other project', function(done){
			agent
			.put(`/${sharedTeamspace}/projects/${projectNoAccess}`)
			.send({
				'name': projectNoAccess
			})
			.expect(401, done);
		});

		it('can delete project', function(done){
			agent
			.delete(`/${sharedTeamspace}/projects/${projectHaveAccess}`)
			.expect(200, done);
		});

		it('can delete other project', function(done){
			agent
			.delete(`/${sharedTeamspace}/projects/${projectNoAccess}`)
			.expect(401, done);
		});


		it('cannot create a model', function(done){

			const modelName = 'model123';
			agent
			.post(`/${sharedTeamspace}/${modelName}`)
			.send(model)
			.expect(401, done);
		});

		it('can create a model in your own project', function(done){

			const modelName = 'model123';
			agent
			.post(`/${sharedTeamspace}/${modelName}`)
			.send(Object.assign({project: project2}, model))
			.expect(200, done);
		});

		it('cannot create a fed model', function(done){

			const modelName = 'model123';
			agent
			.post(`/${sharedTeamspace}/${modelName}`)
			.send(Object.assign({
				subModels:[{
					"database": sharedTeamspace,
					"model": modelId
				}] 
			}, model))
			.expect(401, done);
		});

		it('can create federation in your own project', function(done){

			const modelName = 'fedmodel123';
			const q = require('../../services/queue');
			let corId, appId;

			//fake a response from bouncer;
			setTimeout(function(){
				q.channel.assertQueue(q.workerQName, { durable: true }).then(info => {
					expect(info.messageCount).to.equal(1);
					return q.channel.get(q.workerQName);
				}).then(res => {
					corId = res.properties.correlationId;
					appId = res.properties.appId;
					return q.channel.assertExchange(q.callbackQName, 'direct', { durable: true });
				}).then(() => {
					//send fake job done message to the queue;
					return q.channel.publish(
						q.callbackQName,
						appId,
						new Buffer(JSON.stringify({ value: 0})), 
						{
							correlationId: corId, 
							persistent: true 
						}
					);
				}).catch(err => {
					done(err);
				});

			}, 1000);

			agent
			.post(`/${sharedTeamspace}/${modelName}`)
			.send(Object.assign({
				project: project2,
				subModels:[{
					"database": sharedTeamspace,
					"model": modelId
				}] 
			}, model))
			.expect(200, done);
		})

		it('can view model in your project', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}.json`)
			.expect(200, done);
		});

		it('cannot view other model', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelNoAccess}.json`)
			.expect(401, done);
		});


		it('can download model in your project', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}/download/latest`)
			.expect(404, done);
		});

		it('cannot download other model', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelNoAccess}/download/latest`)
			.expect(401, done);
		});

		it('can upload model in your project', function(done){
			agent
			.post(`/${sharedTeamspace}/${modelId}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/upper.OBJ')
			.expect(200, done);
		});

		it('cannot upload model', function(done){
			agent
			.post(`/${sharedTeamspace}/${modelNoAccess}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/upper.OBJ')
			.expect(401, done);
		});

		it('can edit model setting in your project', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelId}/settings`)
			.send({code: '00011'})
			.expect(200, done);
		});

		it('cannot edit other model setting', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelNoAccess}/settings`)
			.send({code: '00011'})
			.expect(401, done);
		});

		it('can view issues', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}/issues.json`)
			.expect(200 , done);
		});

		it('can create issue', function(done){

			let issue = Object.assign({"name":"Issue test"}, baseIssue);
			agent
			.post(`/${sharedTeamspace}/${modelId}/issues.json`)
			.send(issue)
			.expect(200 , done);

		});
		
		it('cannot view issues in other model', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelNoAccess}/issues.json`)
			.expect(401 , done);
		});

		it('cannot create issue in other model', function(done){

			let issue = Object.assign({"name":"Issue test"}, baseIssue);
			agent
			.post(`/${sharedTeamspace}/${modelNoAccess}/issues.json`)
			.send(issue)
			.expect(401 , done);

		});

		it('can comment', function(done){

			let comment = { 
				comment: 'hello world',
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
			};

			agent.put(`/${sharedTeamspace}/${modelId}/issues/${issueId}.json`)
			.send(comment)
			.expect(200 , done);
		});


		it('cannot comment in other model', function(done){

			let comment = { 
				comment: 'hello world',
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
			};

			agent.put(`/${sharedTeamspace}/${modelNoAccess}/issues/${issueId}.json`)
			.send(comment)
			.expect(401 , done);
		});

		it('can edit issue', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelId}/issues/${issueId}.json`)
			.send({  status: 'open' })
			.expect(200 , done);
		});


		it('cannot edit issue in other model', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelNoAccess}/issues/${issueId}.json`)
			.send({  status: 'open' })
			.expect(401 , done);
		});

		it('can delete model', function(done){
			agent
			.delete(`/${sharedTeamspace}/${modeltoDelete}`)
			.expect(200 , done);
		});

		it('can delete other models', function(done){
			agent
			.delete(`/${sharedTeamspace}/${modelNoAccess}`)
			.expect(401 , done);
		});

	});

	//model admin
	describe('Model admin::', function(){

		let agent;

		const username = 'imModelAdmin';
		const password = 'imModelAdmin';
		const projectNoAccess = 'project5'
		const modelId = '168da6a8-f3ed-42db-b625-af4db27ce6e7';
		const modelToDelete = 'd39fc3ef-f6b0-4aac-9468-a2f975509593';
		const modelNoAccess = '15a54758-ccf1-4fc4-8ec7-20e94791f856';

		const baseIssue = {
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
			"creator_role":"jobA",
			"assigned_roles":["jobB"],
		};

		const issueId = 'b3e52b50-6330-11e7-a610-939d55d9fca8';

		before(function(done){
			agent = request.agent(server);
			agent.post('/login')
			.send({ username, password })
			.expect(200, function(err, res){
				expect(res.body.username).to.equal(username);
				done(err);
			});
		});

		after(function(){
			return q.channel.purgeQueue(q.workerQName);
		})

		//list teamspaces api show implied permissions
		it('list teamspaces api show correct inherited and implied permissions', function(done){
			agent
			.get(`/${username}.json`)
			.expect(200, function(err, res){
				expect(err).to.not.exist;

				const teamspace = res.body.accounts.find(a => a.account === sharedTeamspace);
				expect(teamspace).to.exist;
				expect(teamspace.permissions).to.deep.equal([]);

				const project = teamspace.projects.find(p => p.name === projectNoAccess);
				expect(project).to.exist;
				expect(project.permissions).to.deep.equal([]);

				const model = project.models.find(m => m.model === modelId);
				expect(model).to.exist;
				expect(model.permissions).to.deep.equal(C.MODEL_PERM_LIST);

				done();

			});
		});

		it('list model info should show correct inherited and implied permissions', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}.json`)
			.expect(200, function(err, res){
				expect(err).to.not.exist;
				expect(res.body.permissions).to.deep.equal(C.MODEL_PERM_LIST);
				done();
			});
		});

		it('cannot create project', function(done){
			agent
			.post(`/${sharedTeamspace}/projects`)
			.send({
				'name': 'tc2project'
			})
			.expect(401, done);
		});

		it('cannot edit project', function(done){
			agent
			.put(`/${sharedTeamspace}/projects/${projectNoAccess}`)
			.send({
				'name': projectNoAccess
			})
			.expect(401, done);
		});


		it('can delete project', function(done){
			agent
			.delete(`/${sharedTeamspace}/projects/${projectNoAccess}`)
			.expect(401, done);
		});


		it('cannot create a model', function(done){

			const modelName = 'model123';
			agent
			.post(`/${sharedTeamspace}/${modelName}`)
			.send(model)
			.expect(401, done);
		});


		it('cannot create a fed model', function(done){

			const modelName = 'model123';
			agent
			.post(`/${sharedTeamspace}/${modelName}`)
			.send(Object.assign({
				subModels:[{
					"database": sharedTeamspace,
					"model": modelId
				}] 
			}, model))
			.expect(401, done);
		});

		it('can view model assigned to you', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}.json`)
			.expect(200, done);
		});

		it('cannot view other model', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelNoAccess}.json`)
			.expect(401, done);
		});


		it('can download model in your project', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}/download/latest`)
			.expect(404, done);
		});

		it('cannot download other model', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelNoAccess}/download/latest`)
			.expect(401, done);
		});

		it('can upload model', function(done){
			agent
			.post(`/${sharedTeamspace}/${modelId}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/upper.OBJ')
			.expect(200, done);
		});

		it('cannot upload other model', function(done){
			agent
			.post(`/${sharedTeamspace}/${modelNoAccess}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/upper.OBJ')
			.expect(401, done);
		});

		it('can edit model setting', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelId}/settings`)
			.send({code: '00011'})
			.expect(200, done);
		});

		it('cannot edit other model setting', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelNoAccess}/settings`)
			.send({code: '00011'})
			.expect(401, done);
		});

		it('can view issues', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}/issues.json`)
			.expect(200 , done);
		});

		it('can create issue', function(done){

			let issue = Object.assign({"name":"Issue test"}, baseIssue);
			agent
			.post(`/${sharedTeamspace}/${modelId}/issues.json`)
			.send(issue)
			.expect(200 , done);

		});
		
		it('cannot view issues in other model', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelNoAccess}/issues.json`)
			.expect(401 , done);
		});

		it('cannot create issue in other model', function(done){

			let issue = Object.assign({"name":"Issue test"}, baseIssue);
			agent
			.post(`/${sharedTeamspace}/${modelNoAccess}/issues.json`)
			.send(issue)
			.expect(401 , done);

		});

		it('can comment', function(done){

			let comment = { 
				comment: 'hello world',
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
			};

			agent.put(`/${sharedTeamspace}/${modelId}/issues/${issueId}.json`)
			.send(comment)
			.expect(404 , done);
		});


		it('cannot comment in other model', function(done){

			let comment = { 
				comment: 'hello world',
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
			};

			agent.put(`/${sharedTeamspace}/${modelNoAccess}/issues/${issueId}.json`)
			.send(comment)
			.expect(401 , done);
		});

		it('can edit issue', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelId}/issues/${issueId}.json`)
			.send({  status: 'open' })
			.expect(404 , done);
		});


		it('cannot edit issue in other model', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelNoAccess}/issues/${issueId}.json`)
			.send({  status: 'open' })
			.expect(401 , done);
		});

		it('can delete model', function(done){
			agent
			.delete(`/${sharedTeamspace}/${modelToDelete}`)
			.expect(200 , done);
		});

		it('can delete other models', function(done){
			agent
			.delete(`/${sharedTeamspace}/${modelNoAccess}`)
			.expect(401 , done);
		});

	});

	describe('Project::View all models', function(){
		let agent;

		const username = 'impliedViewAllModels';
		const password = 'impliedViewAllModels';
		const projectSomeAccess = 'project6'
		const modelId = '67a50060-a6cd-45e2-91f1-7d262bba5971';
		const modelToDelete = '42ece336-8719-4ce0-a375-3493cbdf6712';
		const modelNoAccess = '26c69864-1630-4d02-bde3-46b14d1c6455';
		const issueId = 'b3e52b50-6330-11e7-a610-939d55d9fca8';
		const baseIssue = {
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
			"creator_role":"jobA",
			"assigned_roles":["jobB"],
		};

		before(function(done){
			agent = request.agent(server);
			agent.post('/login')
			.send({ username, password })
			.expect(200, function(err, res){
				expect(res.body.username).to.equal(username);
				done(err);
			});
		});

		after(function(){
			return q.channel.purgeQueue(q.workerQName);
		});

		it('list teamspaces api show correct inherited and implied permissions', function(done){
			agent
			.get(`/${username}.json`)
			.expect(200, function(err, res){
				expect(err).to.not.exist;

				const teamspace = res.body.accounts.find(a => a.account === sharedTeamspace);
				expect(teamspace).to.exist;
				expect(teamspace.permissions).to.deep.equal([]);

				const project = teamspace.projects.find(p => p.name === projectSomeAccess);
				expect(project).to.exist;
				expect(project.permissions).to.deep.equal([C.PERM_VIEW_MODEL_ALL_MODELS]);

				const model = project.models.find(m => m.model === modelId);
				expect(model).to.exist;
				expect(model.permissions).to.deep.equal([C.PERM_VIEW_MODEL]);

				done();

			});
		});

		it('list model info should show correct inherited and implied permissions', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}.json`)
			.expect(200, function(err, res){
				expect(err).to.not.exist;
				expect(res.body.permissions).to.deep.equal([C.PERM_VIEW_MODEL]);
				done();
			});
		});

		it('cannot create project', function(done){
			agent
			.post(`/${sharedTeamspace}/projects`)
			.send({
				'name': 'tc2project'
			})
			.expect(401, done);
		});

		it('cannot edit project', function(done){
			agent
			.put(`/${sharedTeamspace}/projects/${projectSomeAccess}`)
			.send({
				'name': projectSomeAccess
			})
			.expect(401, done);
		});


		it('can delete project', function(done){
			agent
			.delete(`/${sharedTeamspace}/projects/${projectSomeAccess}`)
			.expect(401, done);
		});


		it('cannot create a model', function(done){

			const modelName = 'model123';
			agent
			.post(`/${sharedTeamspace}/${modelName}`)
			.send(model)
			.expect(401, done);
		});


		it('cannot create a fed model', function(done){

			const modelName = 'model123';
			agent
			.post(`/${sharedTeamspace}/${modelName}`)
			.send(Object.assign({
				subModels:[{
					"database": sharedTeamspace,
					"model": modelId
				}] 
			}, model))
			.expect(401, done);
		});

		it('can view model assigned to you', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}.json`)
			.expect(200, done);
		});

		it('cannot view other model', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelNoAccess}.json`)
			.expect(401, done);
		});


		it('cannot download model in your project', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}/download/latest`)
			.expect(401, done);
		});

		it('cannot download other model', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelNoAccess}/download/latest`)
			.expect(401, done);
		});

		it('cannot upload model', function(done){
			agent
			.post(`/${sharedTeamspace}/${modelId}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/upper.OBJ')
			.expect(401, done);
		});

		it('cannot upload other model in other project as well', function(done){
			agent
			.post(`/${sharedTeamspace}/${modelNoAccess}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/upper.OBJ')
			.expect(401, done);
		});

		it('cannot edit model setting', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelId}/settings`)
			.send({code: '00011'})
			.expect(401, done);
		});

		it('cannot edit other model setting in other project as well', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelNoAccess}/settings`)
			.send({code: '00011'})
			.expect(401, done);
		});

		it('cannot view issues', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}/issues.json`)
			.expect(401 , done);
		});

		it('cannot create issue', function(done){

			let issue = Object.assign({"name":"Issue test"}, baseIssue);
			agent
			.post(`/${sharedTeamspace}/${modelId}/issues.json`)
			.send(issue)
			.expect(401 , done);

		});
		
		it('cannot view issues of other model in other project as well', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelNoAccess}/issues.json`)
			.expect(401 , done);
		});

		it('cannot create issue for other model in other project as well', function(done){

			let issue = Object.assign({"name":"Issue test"}, baseIssue);
			agent
			.post(`/${sharedTeamspace}/${modelNoAccess}/issues.json`)
			.send(issue)
			.expect(401 , done);

		});

		it('cannot comment', function(done){

			let comment = { 
				comment: 'hello world',
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
			};

			agent.put(`/${sharedTeamspace}/${modelId}/issues/${issueId}.json`)
			.send(comment)
			.expect(401 , done);
		});


		it('cannot comment in other model in other project as well', function(done){

			let comment = { 
				comment: 'hello world',
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
			};

			agent.put(`/${sharedTeamspace}/${modelNoAccess}/issues/${issueId}.json`)
			.send(comment)
			.expect(401 , done);
		});

		it('cannot edit issue', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelId}/issues/${issueId}.json`)
			.send({  status: 'open' })
			.expect(401 , done);
		});


		it('cannot edit issue in other model', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelNoAccess}/issues/${issueId}.json`)
			.send({  status: 'open' })
			.expect(401 , done);
		});

		it('cannot delete model', function(done){
			agent
			.delete(`/${sharedTeamspace}/${modelToDelete}`)
			.expect(401 , done);
		});

		it('cannot delete other models', function(done){
			agent
			.delete(`/${sharedTeamspace}/${modelNoAccess}`)
			.expect(401 , done);
		});
		
	});

	describe('Project::Upload models', function(){
		let agent;

		const username = 'imUploadAllModels';
		const password = 'imUploadAllModels';
		const projectSomeAccess = 'project8'
		const modelId = '48706168-9f4a-479a-a2b8-100b653ad71a';
		const modelToDelete = 'b0b503b0-a063-4565-b957-ad5eb8320cc2';
		const modelNoAccess = 'f2f8b651-323e-4371-bdac-c15bbe1a4f12';
		const issueId = 'b3e52b50-6330-11e7-a610-939d55d9fca8';
		const baseIssue = {
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
			"creator_role":"jobA",
			"assigned_roles":["jobB"],
		};

		before(function(done){
			agent = request.agent(server);
			agent.post('/login')
			.send({ username, password })
			.expect(200, function(err, res){
				expect(res.body.username).to.equal(username);
				done(err);
			});
		});

		after(function(){
			return q.channel.purgeQueue(q.workerQName);
		});

		it('list teamspaces api show correct inherited and implied permissions', function(done){
			agent
			.get(`/${username}.json`)
			.expect(200, function(err, res){
				expect(err).to.not.exist;

				const teamspace = res.body.accounts.find(a => a.account === sharedTeamspace);
				expect(teamspace).to.exist;
				expect(teamspace.permissions).to.deep.equal([]);

				const project = teamspace.projects.find(p => p.name === projectSomeAccess);
				expect(project).to.exist;
				expect(project.permissions).to.deep.equal([C.PERM_UPLOAD_FILES_ALL_MODELS]);

				const model = project.models.find(m => m.model === modelId);
				expect(model).to.exist;
				expect(model.permissions).to.deep.equal([C.PERM_UPLOAD_FILES]);

				done();

			});
		});


		it('cannot create project', function(done){
			agent
			.post(`/${sharedTeamspace}/projects`)
			.send({
				'name': 'tc2project'
			})
			.expect(401, done);
		});

		it('cannot edit project', function(done){
			agent
			.put(`/${sharedTeamspace}/projects/${projectSomeAccess}`)
			.send({
				'name': projectSomeAccess
			})
			.expect(401, done);
		});


		it('cannot delete project', function(done){
			agent
			.delete(`/${sharedTeamspace}/projects/${projectSomeAccess}`)
			.expect(401, done);
		});


		it('cannot create a model', function(done){

			const modelName = 'model123';
			agent
			.post(`/${sharedTeamspace}/${modelName}`)
			.send(model)
			.expect(401, done);
		});


		it('cannot create a fed model', function(done){

			const modelName = 'model123';
			agent
			.post(`/${sharedTeamspace}/${modelName}`)
			.send(Object.assign({
				subModels:[{
					"database": sharedTeamspace,
					"model": modelId
				}] 
			}, model))
			.expect(401, done);
		});

		it('cannot view model', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}.json`)
			.expect(401, done);
		});

		it('cannot view other model', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelNoAccess}.json`)
			.expect(401, done);
		});


		it('cannot download model in your project', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}/download/latest`)
			.expect(401, done);
		});

		it('cannot download other model', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelNoAccess}/download/latest`)
			.expect(401, done);
		});

		it('can upload model', function(done){
			agent
			.post(`/${sharedTeamspace}/${modelId}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/upper.OBJ')
			.expect(200, done);
		});

		it('cannot upload other model in other project as well', function(done){
			agent
			.post(`/${sharedTeamspace}/${modelNoAccess}/upload`)
			.attach('file', __dirname + '/../../statics/3dmodels/upper.OBJ')
			.expect(401, done);
		});

		it('cannot edit model setting', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelId}/settings`)
			.send({code: '00011'})
			.expect(401, done);
		});

		it('cannot edit other model setting in other project as well', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelNoAccess}/settings`)
			.send({code: '00011'})
			.expect(401, done);
		});

		it('cannot view issues', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelId}/issues.json`)
			.expect(401 , done);
		});

		it('cannot create issue', function(done){

			let issue = Object.assign({"name":"Issue test"}, baseIssue);
			agent
			.post(`/${sharedTeamspace}/${modelId}/issues.json`)
			.send(issue)
			.expect(401 , done);

		});
		
		it('cannot view issues of other model in other project as well', function(done){
			agent
			.get(`/${sharedTeamspace}/${modelNoAccess}/issues.json`)
			.expect(401 , done);
		});

		it('cannot create issue for other model in other project as well', function(done){

			let issue = Object.assign({"name":"Issue test"}, baseIssue);
			agent
			.post(`/${sharedTeamspace}/${modelNoAccess}/issues.json`)
			.send(issue)
			.expect(401 , done);

		});

		it('cannot comment', function(done){

			let comment = { 
				comment: 'hello world',
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
			};

			agent.put(`/${sharedTeamspace}/${modelId}/issues/${issueId}.json`)
			.send(comment)
			.expect(401 , done);
		});


		it('cannot comment in other model in other project as well', function(done){

			let comment = { 
				comment: 'hello world',
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
			};

			agent.put(`/${sharedTeamspace}/${modelNoAccess}/issues/${issueId}.json`)
			.send(comment)
			.expect(401 , done);
		});

		it('cannot edit issue', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelId}/issues/${issueId}.json`)
			.send({  status: 'open' })
			.expect(401 , done);
		});


		it('cannot edit issue in other model', function(done){
			agent
			.put(`/${sharedTeamspace}/${modelNoAccess}/issues/${issueId}.json`)
			.send({  status: 'open' })
			.expect(401 , done);
		});

		it('cannot delete model', function(done){
			agent
			.delete(`/${sharedTeamspace}/${modelToDelete}`)
			.expect(401 , done);
		});

		it('cannot delete other models', function(done){
			agent
			.delete(`/${sharedTeamspace}/${modelNoAccess}`)
			.expect(401 , done);
		});
	});


	// { proj: C.PERM_EDIT_FEDERATION_ALL_MODELS, model: C.PERM_EDIT_FEDERATION },
	// { proj: C.PERM_CREATE_ISSUE_ALL_MODELS, model: C.PERM_CREATE_ISSUE },
	// { proj: C.PERM_COMMENT_ISSUE_ALL_MODELS, model: C.PERM_COMMENT_ISSUE },
	// { proj: C.PERM_VIEW_ISSUE_ALL_MODELS, model: C.PERM_VIEW_ISSUE },
	// { proj: C.PERM_DOWNLOAD_MODEL_ALL_MODELS, model: C.PERM_DOWNLOAD_MODEL },
	// { proj: C.PERM_CHANGE_MODEL_SETTINGS_ALL_MODELS, model: C.PERM_CHANGE_MODEL_SETTINGS },


});