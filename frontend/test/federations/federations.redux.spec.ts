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

import { INITIAL_STATE, reducer as federationsReducer, FederationsActions } from '@/v5/store/federations/federations.redux';
import { times } from 'lodash';
import { federationMockFactory } from '@/v5/store/federations/federations.fixtures';

describe('Federations: redux', () => {
	const projectId = 'projectId';
	const mockFederations = times(5, () => federationMockFactory({ isFavourite: false }));
	const defaultState = {
		...INITIAL_STATE,
		federations: {
			[projectId]: mockFederations
		}
	};

	it('should add federation to favourites', () => {
		const resultState = federationsReducer(
			defaultState,
			FederationsActions.setFavouriteSuccess(projectId, mockFederations[0]._id, true)
		);
		const result = resultState.federations[projectId];

		expect(result[0].isFavourite).toEqual(true);
		expect(result.slice(1).every(federation => federation.isFavourite)).toEqual(false);
	});

	it('should remove federation from favourites', () => {
		const mockAllFavouritesFederations = times(5, () => federationMockFactory({ isFavourite: true }))
		const defaultStateWithAllFavourites = {
			...INITIAL_STATE,
			federations: {
				[projectId]: mockAllFavouritesFederations
			}
		}
		const resultState = federationsReducer(
			defaultStateWithAllFavourites,
			FederationsActions.setFavouriteSuccess(projectId, mockAllFavouritesFederations[0]._id, false)
		);
		const result = resultState.federations[projectId];

		expect(result[0].isFavourite).toEqual(false);
		expect(result.slice(1).every(federation => federation.isFavourite)).toEqual(true);
	});
})
