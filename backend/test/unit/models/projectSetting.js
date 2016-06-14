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

let chai = require("chai");
let expect = require('chai').expect;
let mongoose = require('mongoose');
let mockgoose = require('mockgoose');
let _ = require('lodash');

mockgoose(mongoose);

let proxyquire = require('proxyquire');

let modelFactoryMock = proxyquire('../../../models/factory/modelFactory', { 
	'mongoose': mongoose, 
});



let utils = require("../mock/utils");

let sinon = require('sinon');

let ProjectSetting = proxyquire('../../../models/projectSetting', { 
	'mongoose': mongoose, 
	'./factory/modelFactory':  modelFactoryMock,
});


let DB = require('../mock/db');




describe('Project Settings', function(){

	before(function(done) {

		modelFactoryMock.setDB(new DB());

	    mongoose.connect('mongodb://doesnt.matter/whatdb-it-is-mock', function(err) {
	        done(err);
	    });

	});


	describe('#updateMapTileCoors', function(){
		it('have update map tile coors function', function(){
			let projectSetting = new ProjectSetting();
			expect(projectSetting).to.have.property('updateMapTileCoors');
		});

		it('should update map tiles properties, call markModified and call save function', function(){

			let mapTileProp = {
				lat: 123,
				lon: 234,
				width: 567,
				height: 789
			};

			let projectSetting = new ProjectSetting();
			
			let stub = sinon.stub(projectSetting, 'save').returns(Promise.resolve(projectSetting));
			let markModStub = sinon.stub(projectSetting, 'markModified').returns(true);

			return projectSetting.updateMapTileCoors(mapTileProp).then(result => {

				sinon.assert.calledOnce(stub);
				sinon.assert.calledWith(markModStub, 'properties');
				expect(result.properties.mapTile).to.deep.equal(mapTileProp);
				stub.restore();
				markModStub.restore();

			});


		})
	});

	describe('.findCollaborator', function(){

		it('should have findCollaborator method', function(){
			let projectSetting = new ProjectSetting();
			expect(projectSetting.findCollaborator).to.exist;
		});


		it('findCollaborator should able to return the collaborator found', function(){

			let projectSetting = new ProjectSetting();

			projectSetting.collaborators = [ 
				{
					"user" : "user1",
					"role" : "viewer"
				}, 
				{
					"user" : "user2",
					"role" : "collaborator"
				}
			];

			let found = projectSetting.findCollaborator(projectSetting.collaborators[1].user, projectSetting.collaborators[1].role);
			expect(found).to.deep.equal(projectSetting.collaborators[1]);

			found = projectSetting.findCollaborator(projectSetting.collaborators[0].user, projectSetting.collaborators[0].role);
			expect(found).to.deep.equal(projectSetting.collaborators[0]);


			found = projectSetting.findCollaborator('user1', 'collaborator');
			expect(found).to.be.null;

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