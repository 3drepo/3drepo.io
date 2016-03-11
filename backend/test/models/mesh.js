'use strict';

let chai = require("chai");
let expect = require('chai').expect;
let mongoose = require('mongoose');
let mockgoose = require('mockgoose');
let _ = require('lodash');

mockgoose(mongoose);

let proxyquire = require('proxyquire');

let modelFactoryMock = proxyquire('../../models/factory/modelFactory', { 
	'mongoose': mongoose, 
});

let repoGraphSceneMock = require('../mock/repoGraphScene');
let utils = require("../mock/utils");
let topLvStubs = [];
let sinon = require('sinon');


let repoBaseMock = proxyquire('../../models/base/repo', { 
	'../../repo/repoGraphScene.js': repoGraphSceneMock, 
	'../../utils': utils
});

let Revision = require('../../models/revision');


let DB = require('../mock/db');

let Mesh = proxyquire('../../models/mesh', { 
	'mongoose': mongoose, 
	'./factory/modelFactory':  modelFactoryMock,
	'../revision': Revision,
	'./base/repo': repoBaseMock

});


describe('Mesh and Object extended from repo base', function(){

	before(function(done) {

		modelFactoryMock.setDB(new DB());

	    mongoose.connect('mongodb://doesnt.matter/whatdb-it-is-mock', function(err) {
	        done(err);
	    });

	});

	describe('#findByUID', function(){
		it('as a repo item it should have findByUID static function', function(){
			expect(Mesh).to.have.property('findByUID');
		});

	
		it('should return from stash if found', function(){

			let stashData = { 'a': 1 };
			let stub = sinon.stub(Mesh, 'findStashByFilename').returns(Promise.resolve(stashData));
			
			return Mesh.findByUID({}, '1234567890', { stash: {} }).then(data => {

				expect(data).to.deep.equal(stashData);
				stub.restore();
			});
		});

		it('should return from collection and decode if not found from stash', function(){

			let dbData = {a: 1};
			dbData.toObject = () => dbData;

			let stub = sinon.stub(Mesh, 'findById').returns(Promise.resolve(dbData));
			// mock no stash found
			let stashStub = sinon.stub(Mesh, 'findStashByFilename').returns(Promise.resolve(false));


			return Mesh.findByUID({}, 'id', { stash: {} }).then(data => {

				expect(data).to.deep.equal(dbData);
				stub.restore();
				stashStub.restore();

			});
		});
	});

	describe('#findByRevision', function(){
		it('as a repo item it should have findByRevision static function', function(){
			expect(Mesh).to.have.property('findByRevision');
		});

		it('should return from stash if found', function(){

			let stashData = { 'a': 1 };
			let stub = sinon.stub(Mesh, 'findStashByFilename').returns(Promise.resolve(stashData));
			
			return Mesh.findByRevision({}, 'rid', 'sid', { stash: {} }).then(data => {

				expect(data).to.deep.equal(stashData);
				stub.restore();
			});
		});

		it('should return from collection and decode if not found from stash', function(){

			let dbData = {a: 1};
			dbData.toObject = () => dbData;

			let revisionObj = {current: [1,2,3,4,5]};
			revisionObj.toObject = () => revisionObj;

			let RevStub = sinon.stub(Revision, 'findById').returns(Promise.resolve(revisionObj));
			// mock no stash found
			let stashStub = sinon.stub(Mesh, 'findStashByFilename').returns(Promise.resolve(false));
			let meshStub = sinon.stub(Mesh, 'findOne').returns(Promise.resolve(dbData));

			let dbCol = {};
			let rid = 'rid';
			let sid = 'sid';

			return Mesh.findByRevision(dbCol, rid, sid, { stash: {} }).then(data => {

				expect(data).to.deep.equal(dbData);
				// Revision.findById should be called
				sinon.assert.calledWith(RevStub, dbCol, rid);
				
				RevStub.restore();
				meshStub.restore();
				stashStub.restore();

			});
		});
	});

	after(function(done){

		mockgoose.reset(function() {
			mongoose.unmock(function(){
				done();
			});
		});
	});


});