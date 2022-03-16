/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { src } = require('../../../../../../../../helper/path');
const _ = require('lodash');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
const { UUIDToString, generateUUIDString } = require(`${src}/utils/helper/uuids`);
const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { templates } = require(`${src}/utils/responseCodes`);

const ViewsOutputMiddlewares = require(`${src}/middleware/dataConverter/outputs/teamspaces/projects/models/commons/views`);

// Mock respond function to just return the resCode
const respondFn = Responder.respond.mockImplementation((req, res, errCode) =>
	errCode);

const testSerialiseViews = () => {
	describe('Serialise views data', () => {
		test('should serialise correctly', () => {
			const inputData = [
				{ _id: generateUUIDString(), thumbnail: 'sdfkdsf', some: 'other data' },
				{ _id: generateUUIDString(), thumbnail: { buffer: 'awdsf' }, some: 'other data' },
				{ _id: generateUUIDString(), screenshot: { buffer: 'awdsf' }, some: 'other data' },
				{ _id: generateUUIDString(), thumbnail: { content: { buffer: 'awdsf' } }, some: 'other data' },
				{ _id: generateUUIDString(), num: 1 },
			];

			const nextIdx = respondFn.mock.calls.length;
			ViewsOutputMiddlewares.serialiseViews({ outputData: cloneDeep(inputData) }, {}, () => {});
			expect(respondFn.mock.calls.length).toBe(nextIdx + 1);
			expect(respondFn.mock.calls[nextIdx][2]).toEqual(templates.ok);

			// eslint-disable-next-line implicit-arrow-linebreak
			const views = inputData.map((view) => ({
				_id: UUIDToString(view._id),
				hasThumbnail: !!(view.thumbnail?.buffer || view.thumbnail?.content?.buffer || view.screenshot?.buffer),
				..._.omit(view, ['thumbnail', 'screenshot']),
			}));

			expect(respondFn.mock.calls[nextIdx][3]).toEqual({ views });
		});
	});
};

describe('middleware/dataConverter/outputs/teamspaces/projects/models/commons/views', () => {
	testSerialiseViews();
});
