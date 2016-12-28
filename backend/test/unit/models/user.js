'use strict';

let chai = require("chai");
let expect = require('chai').expect;
let mongoose = require('mongoose');
let mockgoose = require('mockgoose');
let _ = require('lodash');


let proxyquire = require('proxyquire').noCallThru();;
let modelFactoryMock = proxyquire('../../../models/factory/modelFactory', { 
	'mongoose': mongoose, 
});

let sinon = require('sinon');
let DB = require('../mock/db');


let User = proxyquire('../../../models/user', {
	'../db/db': function() { 
		return { 
			getAuthDB : function(){ 
				return  { authenticate: function(u, p){ return Promise.resolve()}  };
			} 
		};
	}, 
	'mongoose': mongoose, 
	'./factory/modelFactory':  modelFactoryMock,
	'../mailer/mailer': {},
	'../logger.js': {},
	'./userBilling': {}
});


describe('User', function(){

	before(function(done) {

		modelFactoryMock.setDB(new DB());

	    mockgoose(mongoose).then(function() {
	        mongoose.connect('mongodb://example.com/TestingDB', function(err) {
	            done(err);
	        });
	    });

	});

	describe('#authenticate', function(){
		it('should have authenticate static function', function(){
			expect(User.authenticate).to.exist;
		});

		it('should call mongodb authenicate return user object on successful', function(){
			
			let username = 'a';
			let password = 'b';

			let stub = sinon.stub(User, 'findByUserName').returns(Promise.resolve({username}));
			//let spy = sinon.spy(modelFactoryMock.db, 'authenticate');


			return User.authenticate(null, username, password).then(user => {
				// node mongo authenicate called with supplied username and password
				//sinon.assert.calledWith(spy, username, password);
				// findByUserName called with supplied username
				sinon.assert.calledWith(stub, username);
				expect(user).to.deep.equal({username});

				stub.restore();
				//spy.restore();
			})
		})
	});

	describe('.updateInfo', function(){

		it('should have updateInfo method', function(){
			let user = new User();
			expect(user.updateInfo).to.exist;
		});

		it('updateInfo should put the data in customData and save', function(){

			let user = new User();

			user._id = 'whatever';

			let updateObj = {
				firstName: 'fname',
				lastName: 'lastname',
				email: 'test3drepo@mailinator.com'
			};

			user.markModified = () => true;

			let spy = sinon.spy(user, 'save');
			let stub = sinon.stub(User, 'isEmailTaken').returns(Promise.resolve(0));

			return user.updateInfo(updateObj).then(user => {
				// user updated 
				//expect(user.toObject().customData).to.deep.equal(updateObj);
				expect(user.toObject()).to.have.deep.property('customData.firstName', updateObj.firstName);
				expect(user.toObject()).to.have.deep.property('customData.lastName', updateObj.lastName);
				expect(user.toObject()).to.have.deep.property('customData.email', updateObj.email);
				// save should've been called once
				sinon.assert.calledOnce(spy);
				spy.restore();
				stub.restore();
			});

		})
	});

	describe('#updatePassword', function(){
		it('should have updatePassword static method', function(){
			expect(User.updatePassword).to.exist;
		});

		it('should have called authenticate', function(){
			
			let username = 'user';
			let oldPassword = 'old';
			let newPassword = 'new';

			let stub = sinon.stub(User, 'authenticate').returns(Promise.resolve({username}));

			return User.updatePassword({}, username, oldPassword, null, newPassword).then(() => {
				sinon.assert.calledWith(stub, {}, username, oldPassword);
				stub.restore();
			});

		
		})
	});

	describe('#createUser', function(){
		it('should have createUser static method', function(){
			expect(User.createUser).to.exist;
		});

		it('should have called addUser', function(){
			let spy = sinon.spy(modelFactoryMock.db, 'addUser');
			let username = 'user';
			let password = '123';
			let options = {
				'rubbish': 'should not be inserted into database',
				'firstName': '123',
				'email': 'test3drepo@mailinator.com'
			};

			let expectedCallWithOptions = {
				customData: { firstName : options.firstName, inactive: true, email: options.email, billing: {}},
				roles: []
			}

			let stub = sinon.stub(User, 'isEmailTaken').returns(Promise.resolve(0));

			return User.createUser({}, username, password, options, 1).then(res => {
				expectedCallWithOptions.customData.emailVerifyToken = res;
				sinon.assert.calledWith(spy, username, password, expectedCallWithOptions);
				spy.restore();
				stub.restore();
			});
		});

	});



	after(function(done){
		mockgoose.reset(function() {
			mongoose.unmock(function(){
				done();
			});
		});

	})
});

