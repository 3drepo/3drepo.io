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

const db = require(`${src}/handler/db`);
const { template } = require(`${src}/utils/responseCodes`);

const User = require(`${src}/models/users`);

const testGetAccessibleTeamspaces = () => {
	test('should return list of teamspaces if user exists', async () => {
		const expectedData = {
			roles: [
				{ db: 'ts1', role: 'a' },
				{ db: 'ts2', role: 'b' },
			],
		};
		jest.spyOn(db, 'findOne').mockResolvedValue(expectedData);

		const res = await User.getAccessibleTeamspaces('user');
		expect(res).toEqual(['ts1', 'ts2']);
	});

	test('should return error if user does not exists', async () => {
		jest.spyOn(db, 'findOne').mockResolvedValue(undefined);

		expect(User.getAccessibleTeamspaces('user'))
			.rejects.toThrow(template.userNotFound);
	});
};

describe('Users (Model)', () => {
	testGetAccessibleTeamspaces();
});
