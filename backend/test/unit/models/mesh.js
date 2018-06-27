"use strict";
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

const expect = require("chai").expect;
const mongoose = require("mongoose");
const mockgoose = require("mockgoose");

const proxyquire = require("proxyquire");

const modelFactoryMock = proxyquire("../../../models/factory/modelFactory", {
	"mongoose": mongoose
});

const repoGraphSceneMock = require("../mock/repoGraphScene");
const utils = require("../mock/utils");
const sinon = require("sinon");

const repoBaseMock = proxyquire("../../../models/base/repo", {
	"../../repo/repoGraphScene.js": repoGraphSceneMock,
	"../../utils": utils,
	"../factory/modelFactory": modelFactoryMock
});

const History = require("../../../models/history");

const DB = require("../mock/db");

const Mesh = proxyquire("../../../models/mesh", {
	"mongoose": mongoose,
	"./factory/modelFactory":  modelFactoryMock,
	"../history": History,
	"./base/repo": repoBaseMock

});

describe("Mesh and Object extended from repo base", function() {

	before(function(done) {

		modelFactoryMock.setDB(DB);
		mockgoose(mongoose).then(function() {
			mongoose.connect("mongodb://example.com/TestingDB", function(err) {
				done(err);
			});
		});

	});

	/*	describe('#findByUID', function(){
		it('as a repo item it should have findByUID static function', function(){
			expect(Mesh).to.have.property('findByUID');
		});

		// it('should return from stash if found', function(){

		// 	let stashData = { 'a': 1 };
		// 	let stub = sinon.stub(Mesh, 'findStashByFilename').returns(Promise.resolve(stashData));

		// 	return Mesh.findByUID({}, '1234567890', { stash: {} }).then(data => {

		// 		expect(data).to.deep.equal(stashData);
		// 		stub.restore();
		// 	});
		// });

		it('should return from collection and decode if not found from stash', function(){

			let dbData = {a: 1};
			dbData.toObject = () => dbData;

			let stub = sinon.stub(Mesh, 'findById').returns(Promise.resolve(dbData));
			// mock no stash found
			//let stashStub = sinon.stub(Mesh, 'findStashByFilename').returns(Promise.resolve(false));

			return Mesh.findByUID({}, 'id', { stash: {} }).then(data => {

				expect(data).to.deep.equal(dbData);
				stub.restore();
				//stashStub.restore();

			});
		});
	});
*/
	describe("#findByRevision", function() {
		it("as a repo item it should have findByRevision static function", function() {
			expect(Mesh).to.have.property("findByRevision");
		});

		// it('should return from stash if found', function(){

		// 	let stashData = { 'a': 1 };
		// 	let stub = sinon.stub(Mesh, 'findStashByFilename').returns(Promise.resolve(stashData));

		// 	return Mesh.findByRevision({}, 'rid', 'sid', { stash: {} }).then(data => {

		// 		expect(data).to.deep.equal(stashData);
		// 		stub.restore();
		// 	});
		// });

		it("should return from collection and decode if not found from stash", function() {

			const dbData = {a: 1};
			dbData.toObject = () => dbData;

			const revisionObj = {current: [1,2,3,4,5]};
			revisionObj.toObject = () => revisionObj;

			const HistoryStub = sinon.stub(History, "findByUID").returns(Promise.resolve(revisionObj));
			// mock no stash found
			// let stashStub = sinon.stub(Mesh, 'findStashByFilename').returns(Promise.resolve(false));
			const meshStub = sinon.stub(Mesh, "findOne").returns(Promise.resolve(dbData));

			const dbCol = {};
			const rid = "rid";
			const sid = "sid";

			return Mesh.findByRevision(dbCol, rid, sid, { stash: {} }).then(data => {

				expect(data).to.deep.equal(dbData);
				// Revision.findById should be called
				sinon.assert.calledWith(HistoryStub, dbCol, rid);

				HistoryStub.restore();
				meshStub.restore();
				// stashStub.restore();

			});
		});
	});

	after(function(done) {

		mockgoose.reset(function() {
			mongoose.unmock(function() {
				done();
			});
		});
	});

});
