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

const { src } = require('../../helper/path');

const Issues = require(`${src}/models/issues`);
const db = require(`${src}/handler/db`);

const checkResults = (fn, teamspace, model) => {
	const excludeClosedIssues = {
		status: { $nin: [
			'closed',
			'void',
		] },
	};

	expect(fn.mock.calls.length).toBe(1);
	expect(fn.mock.calls[0][1]).toEqual(`${model}.issues`);
	expect(fn.mock.calls[0][2]).toEqual(excludeClosedIssues);
};

const testGetIssueCount = () => {
	describe('Get issue count', () => {
		test('should get the number of issues of a federation', async () => {
			const fn = jest.spyOn(db, 'count').mockImplementation(() => 5);
			const res = await Issues.getModelIssueCount('someTS', 'someModel');
			expect(res).toEqual(5);
			checkResults(fn, 'teamspace', 'someModel');
		});
	});
};

describe('models/issues', () => {
	testGetIssueCount();
});
