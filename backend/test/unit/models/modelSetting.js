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

const ModelSetting = proxyquire("../../../models/modelSetting", {
	"mongoose": mongoose,
	"./factory/modelFactory":  modelFactoryMock
});

const DB = require("../mock/db");

describe("Model Settings", function() {

	before(function(done) {

		modelFactoryMock.setDB(new DB());

		mockgoose(mongoose).then(function() {
			mongoose.connect("mongodb://example.com/TestingDB", function(err) {
				done(err);
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
