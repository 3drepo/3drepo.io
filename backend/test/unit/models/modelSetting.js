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


let proxyquire = require('proxyquire');

let modelFactoryMock = proxyquire('../../../models/factory/modelFactory', { 
	'mongoose': mongoose, 
});



let utils = require("../mock/utils");

let sinon = require('sinon');

let ModelSetting = proxyquire('../../../models/modelSetting', { 
	'mongoose': mongoose, 
	'./factory/modelFactory':  modelFactoryMock,
});


let DB = require('../mock/db');

describe('Model Settings', function(){

	before(function(done) {

		modelFactoryMock.setDB(new DB());

	    mockgoose(mongoose).then(function() {
	        mongoose.connect('mongodb://example.com/TestingDB', function(err) {
	            done(err);
	        });
	    });

	});


	describe('#updateProperties', function(){

		it('should have updateProperties function', function(){
			let modelSetting = new ModelSetting();
			expect(modelSetting).to.have.property('updateProperties');
		});

		it('should update properties', function(){

			let props = {
				unit: "metre",
				topicTypes: ['For info', 'VR'],
				code: '09ABC'

			};

			let expectedReturn = {
				mapTile: {
					lat: 123,
					lon: 234,
					y: 5
				},
				unit: "metre",
				topicTypes: [{
					label: 'For info',
					value: 'for_info'
				}, {
					label: 'VR',
					value: 'vr'
				}],
				code: '09ABC'
			};

			let modelSetting = new ModelSetting();
			
			modelSetting.updateProperties(props);
			expect(modelSetting.toObject().properties).to.deep.equal(expectedReturn);
		

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
