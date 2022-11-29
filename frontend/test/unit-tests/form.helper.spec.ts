/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { diffObjects, isBasicValue, removeEmptyObjects } from "@/v5/helpers/form.helper";
import { isEqual } from "lodash";


describe('Tickets: helpers unit tests' , () => {

	it('removeEmptyObjects should remove the empty objects', () => {
		const treeWithEmptyObjects = {
			properties: { 
				nothingToSee:{}, 
				something: true
			}
		}
		
		const cleanedObject = removeEmptyObjects(treeWithEmptyObjects);

		expect(cleanedObject).toEqual({properties: {something: true}});
	});


	it('diff objects should return the differece (objc1-objc2)', () => {
		const objec1 = {
			properties: {
				view: {
					camera: [0,1,2],
					clippingPlanes: [2,3,4],
					screenshot:'sameScreenshot'
				},
				anotherGuy:'hiya'
			} 
		}

		const objec2 = {
			properties: {
				view: {
					camera: [3,2,1],
					clippingPlanes: [2.2,3.1,4.3],
					screenshot:'sameScreenshot'
				},
			} 
		}

		const expectedRes = {
			properties: {
				view: {
					camera: [3,2,1],
					clippingPlanes: [2.2,3.1,4.3],
				},
			} 
		}

		const res =  diffObjects(objec2, objec1);

		expect(res).toEqual(expectedRes);
	});

});