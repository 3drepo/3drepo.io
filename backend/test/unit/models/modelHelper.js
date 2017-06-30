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
let _ = require('lodash');


let proxyquire = require('proxyquire').noCallThru();
let sinon = require('sinon');
let ModelHelper = proxyquire('../../../models/helper/model', {
	'../role': {},
	'../roleSetting': {},
	'../modelSetting': {},
	'../user': {},
	'../../response_codes': {},
	'../../services/queue': {},
	'../../constants': {},
	'../../mailer/mailer': {},
	'../../logger.js': {},
	'../../routes/middlewares': {},
	'../../config': {},
	'../../utils': {},
	'../history': {},
	'../scene': {},
	'../../constants': {},
	'../ref': {},
	'./stash': {},
	'../ref': {},
	'../chatEvent': {},
	'../project': {}
});

describe('Model Helpers', function(){

	describe('#modelNameRegExp', function(){
		it('should have modelNameRegExp exposed', function(){
			expect(ModelHelper.modelNameRegExp).to.have.exists;
		});

		it('test model name format should succee', function(){
			expect(ModelHelper.modelNameRegExp.test('abc')).to.be.true;
			expect(ModelHelper.modelNameRegExp.test('123-4a')).to.be.true;
			expect(ModelHelper.modelNameRegExp.test('123_4a')).to.be.true;
			expect(ModelHelper.modelNameRegExp.test('123_4A')).to.be.true;
			expect(ModelHelper.modelNameRegExp.test('aa')).to.be.false;
			expect(ModelHelper.modelNameRegExp.test('aasa[')).to.be.false;
			expect(ModelHelper.modelNameRegExp.test('aasa/')).to.be.false;
			expect(ModelHelper.modelNameRegExp.test('aasa%')).to.be.false;
			expect(ModelHelper.modelNameRegExp.test('aaaaaaaaaaaaaaaaaaaaa')).to.be.false;
		});
	});

});