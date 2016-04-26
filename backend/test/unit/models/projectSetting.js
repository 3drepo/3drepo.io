'use strict';

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

	after(function(done){
		mockgoose.reset(function() {
			mongoose.unmock(function(){
				done();
			});
		});
	});


});