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

const testAppendFavourites = () => {
	const favouritesData = {
		teamspace1: ['a', 'b', 'c'],
		teamspace2: ['d'],
	};

	describe('Add containers to favourites', () => {
		test('Adding an array of containers of a new teamspace', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: { starredModels: favouritesData } });
			await User.appendFavourites('xxx', 'teamspace3', ['e', 'f']);			
		});

		test('Adding an array of containers of an existing teamspace', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: { starredModels: favouritesData } });
			await User.appendFavourites('xxx', 'teamspace1', ['d', 'e']);						
		});

		test('Adding an array of containers of an existing teamspace with duplicate entries', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: { starredModels: favouritesData } });
			await User.appendFavourites('xxx', 'teamspace1', ['a', 'b', 'c', ' d', 'e']);						
		});
	});
};

const testDeleteFromFavourites = () => {
	const favouritesData = {
		teamspace1: ['a', 'b', 'c'],
		teamspace2: ['d'],
	};

	describe('Remove container from favourites', () => {
		test('Remove all containers of a teamspace', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: { starredModels: favouritesData } });
			await User.deleteFavourites('xxx', 'teamspace2', ['d']);
			const newFavourtiesData = favouritesData;
			newFavourtiesData.teamspace2 = undefined;
			expect(favouritesData).toEqual(newFavourtiesData);
		});

		test('Remove some containers of a teamspace', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: { starredModels: favouritesData } });
			await User.deleteFavourites('xxx', 'teamspace1', ['c']);
			const newFavourtiesData = favouritesData;
			newFavourtiesData.teamspace1[2] = undefined;
			expect(favouritesData).toEqual(newFavourtiesData);
		});
	});
};

describe('models/users', () => {
	testGetAccessibleTeamspaces();
	testGetFavourites();
	testAppendFavourites();
	testDeleteFromFavourites();
});
