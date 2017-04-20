'use strict';
/**
 *  Copyright (C) 2017 3D Repo Ltd
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

const chai = require("chai");
const expect = require('chai').expect;
const _ = require('lodash');
const checkPermission  = require('../../../middlewares/checkPermission');


describe('Check permission function', function(){


	it('should return true', function(){
		let getPermissionsAdpater = function(){
			return {
				accountLevel: () => Promise.resolve([]);
				projectLevel: () => Promise.resolve([]);
				modelLevel: () => Promise.resolve(['VIEW_PROJECT']);
			}
		};
		return checkPermission('', '', '', '', ['VIEW_PROJECT', getPermissionsAdpater).then(granted => {
			expect(granted).to.be.true;
		});
	});


});