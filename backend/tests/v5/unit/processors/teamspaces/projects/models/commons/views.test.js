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

const { src } = require('../../../../../../helper/path');
const { generateRandomString } = require('../../../../../../helper/services');

const Views = require(`${src}/processors/teamspaces/projects/models/commons/views`);

jest.mock('../../../../../../../../src/v5/models/views');
const ViewsModel = require(`${src}/models/views`);
const { templates } = require(`${src}/utils/responseCodes`);

const viewsList = ['a', 'b', 'c'];

const getViewsFn = ViewsModel.getViews.mockResolvedValue(viewsList);

const testGetViews = () => {
	describe('Get views', () => {
		test('should return all views within the model', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();

			await expect(Views.getViewList(teamspace, model)).resolves.toEqual(viewsList);

			expect(getViewsFn.mock.calls.length).toBe(1);
			expect(getViewsFn.mock.calls[0][0]).toBe(teamspace);
			expect(getViewsFn.mock.calls[0][1]).toBe(model);
		});
	});
};

const testGetThumbnail = () => {
	const buffer = generateRandomString();
	describe.each([
		[' buffer in thumbnail object ', { thumbnail: { buffer } }, true],
		[' (legacy) buffer in thumbnail.content ', { thumbnail: { content: { buffer } } }, true],
		[' (legacy) buffer in screenshot object ', { screenshot: { buffer } }, true],
		[' no thumbnail ', { }, false],
	])('Get View Thumbnail', (desc, data, shouldSucceed) => {
		test(`${desc} should ${shouldSucceed ? '' : 'NOT'} succeed`, async () => {
			ViewsModel.getViewById.mockResolvedValueOnce(data);

			if (shouldSucceed) {
				await expect(Views.getThumbnail('a', 'b', 'c')).resolves.toEqual(buffer);
			} else {
				await expect(Views.getThumbnail('a', 'b', 'c')).rejects.toEqual(templates.thumbnailNotFound);
			}
		});
	});
};

describe('processors/teamspaces/projects/models/commons/views', () => {
	testGetViews();
	testGetThumbnail();
});
