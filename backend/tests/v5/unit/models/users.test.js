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
const { templates } = require(`${src}/utils/responseCodes`);

const User = require(`${src}/models/users`);

const testGetAccessibleTeamspaces = () => {
	describe('Get accessible teamspaces', () => {
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

			await expect(User.getAccessibleTeamspaces('user'))
				.rejects.toEqual(templates.userNotFound);
		});
	});
};

const testGetFavourites = () => {
	const favouritesData = {
		teamspace1: [],
		teamspace2: ['a', 'b', 'c'],
	};
	describe.each([
		['xxx', 'teamspace1', favouritesData.teamspace1],
		['xxx', 'teamspace2', favouritesData.teamspace2],
		['xxx', 'teamspace3', []],
	])('Get favourites', (user, teamspace, result) => {
		test(`Getting favourites for ${teamspace} should return ${result.length} entries`, async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: { starredModels: favouritesData } });
			const res = await User.getFavourites(user, teamspace);
			expect(res).toEqual(result);
		});
	});

	describe('Get favourites (no data)', () => {
		test('Getting favourites when the user has no favourites entry should return an empty array', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: { } });
			const res = await User.getFavourites('xxx', 'yyy');
			expect(res).toEqual([]);
		});
	});
};

describe('models/users', () => {
	testGetAccessibleTeamspaces();
	testGetFavourites();
});
