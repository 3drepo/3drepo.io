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

describe('Revision', function () {

	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'rev';
	let password = '123456';
	let model = 'monkeys';
	let revisions;

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


	it('list revisions should succeed', function(done){
		agent.get(`/${username}/${model}/revisions.json`)
		.expect(200, function(err, res){
			expect(res.body.length).to.equal(3);
			expect(res.body[0]).to.have.property("_id");
			expect(res.body[0]).to.have.property("timestamp");
			expect(res.body[0]).to.have.property("author");
			revisions = res.body;
			done(err);
		});
	});

	// TODO: X3DOM isn't used any more

	it('get x3d mp by revision id should succeed', function(done){
		agent.get(`/${username}/${model}/revision/${revisions[0]._id}.x3d.mp`)
		.expect(200, function(err, res){
			done(err);
		});
	});

	it('get asset bundle list by revision id should succeed', function(done){
		agent.get(`/${username}/${model}/revision/7349c6eb-4009-4a4a-af66-701a496dbe2e/unityAssets.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});

	it('get x3d mp by revision tag should succeed', function(done){

		let revWithTag = revisions.find(rev => rev.tag);
		agent.get(`/${username}/${model}/revision/${revWithTag.tag}.x3d.mp`)
		.expect(200, function(err, res){
			done(err);
		});
	});


	it('get asset bundle list by revision tag should succeed', function(done){

		let revWithTag = revisions.find(rev => rev.tag);
		agent.get(`/${username}/${model}/revision/${revWithTag.tag}/unityAssets.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});

	it('get non existing rev should fail', function(done){
		agent.get(`/${username}/${model}/revision/invalidtag.x3d.mp`)
		.expect(404, function(err, res){
			done(err);
		});
	});

	it('get asset bundle list of non existing rev should fail', function(done){
		agent.get(`/${username}/${model}/revision/invalidtag/unityAssets.json`)
		.expect(400, function(err, res){
			done(err);
		});
	});

	it('get issues by revision id should succeed', function(done){
		agent.get(`/${username}/${model}/revision/${revisions[0]._id}/issues.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});

	it('get issues by revision tag should succeed', function(done){
		let revWithTag = revisions.find(rev => rev.tag);
		agent.get(`/${username}/${model}/revision/${revWithTag.tag}/issues.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});


	it('get tree by revision tag should succeed', function(done){
		agent.get(`/${username}/${model}/revision/original/fulltree.json`)
		.expect(200, function(err, res){
			expect(JSON.parse(res.text).mainTree.nodes.name).to.equal('suzanne-flat.obj');
			done(err);
		});
	});


	it('get tree by revision id should succeed', function(done){
		agent.get(`/${username}/${model}/revision/6c558faa-8236-4255-a48a-a4ce99465182/fulltree.json`)
		.expect(200, function(err, res){
			expect(JSON.parse(res.text).mainTree.nodes.name).to.equal('suzanne-flat.obj');
			done(err);
		});
	});

	it('get tree by non existing revision should fail', function(done){
		agent.get(`/${username}/${model}/revision/000/fulltree.json`)
		.expect(404, function(err, res){
			expect(res.body.value).to.equal(responseCodes.TREE_NOT_FOUND.value);
			done(err);
		});
	});



	it('get tree of head of master should succeed', function(done){
		agent.get(`/${username}/${model}/revision/master/head/fulltree.json`)
		.expect(200, function(err, res){
			expect(JSON.parse(res.text).mainTree.nodes.name).to.equal('3DrepoBIM.obj');
			done(err);
		});
	});

	//IdMap
	it('get idMap by revision id should succeed', function(done){
		agent.get(`/${username}/${model}/revision/7349c6eb-4009-4a4a-af66-701a496dbe2e/idMap.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});

	it('get idMap by non existing revision should fail', function(done){
		agent.get(`/${username}/${model}/revision/000/idMap.json`)
		.expect(400, function(err, res){
			done(err);
		});
	});

	it('get idMap of head of master should succeed', function(done){
		agent.get(`/${username}/${model}/revision/master/head/idMap.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});	

	//IdToMeshes
	it('get idToMeshes by revision id should succeed', function(done){
		agent.get(`/${username}/${model}/revision/7349c6eb-4009-4a4a-af66-701a496dbe2e/idToMeshes.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});

	it('get idToMeshes by non existing revision should fail', function(done){
		agent.get(`/${username}/${model}/revision/000/idToMeshes.json`)
		.expect(400, function(err, res){
			done(err);
		});
	});

	it('get idToMeshes of head of master should succeed', function(done){
		agent.get(`/${username}/${model}/revision/master/head/idToMeshes.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});	

	//treePath
	it('get treePath by revision id should succeed', function(done){
		agent.get(`/${username}/${model}/revision/7349c6eb-4009-4a4a-af66-701a496dbe2e/tree_path.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});

	it('get treePath by non existing revision should fail', function(done){
		agent.get(`/${username}/${model}/revision/000/tree_path.json`)
		.expect(400, function(err, res){
			done(err);
		});
	});

	it('get treePath of head of master should succeed', function(done){
		agent.get(`/${username}/${model}/revision/master/head/tree_path.json`)
		.expect(200, function(err, res){
			done(err);
		});
	});	

	it('upload with exisitng tag name should fail', function(done){

		let revWithTag = revisions.find(rev => rev.tag);
		agent.post(`/${username}/${model}/upload`)
		.field('tag', revWithTag.tag)
		.attach('file', __dirname + '/../../statics/3dmodels/8000cubes.obj')
		.expect(400, function(err, res){
			expect(res.body.value).to.equal(responseCodes.DUPLICATE_TAG.value)
			done(err);
		});

	});

	it('upload with invalid tag name should fail', function(done){

		agent.post(`/${username}/${model}/upload`)
		.field('tag', 'a!b')
		.attach('file', __dirname + '/../../statics/3dmodels/8000cubes.obj')
		.expect(400, function(err, res){
			expect(res.body.value).to.equal(responseCodes.INVALID_TAG_NAME.value)
			done(err);
		});

	});
});
