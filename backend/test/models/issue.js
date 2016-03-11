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



let utils = require("../mock/utils");

let sinon = require('sinon');

// let Issue = proxyquire('../../models/issue', { 
// 	'../db/db_interface': dbInterface,
// 	'./projectSetting': {},
// 	'mongoose': mongoose, 
// 	'./factory/modelFactory':  modelFactoryMock,
// 	'../../utils': utils
// });


let DB = require('../mock/db');




describe('Issue', function(){

	before(function(done) {

		modelFactoryMock.setDB(new DB());

	    mongoose.connect('mongodb://doesnt.matter/whatdb-it-is-mock', function(err) {
	        done(err);
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