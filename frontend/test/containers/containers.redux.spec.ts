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

import { INITIAL_STATE, reducer as containersReducer, ContainersActions } from '@/v5/store/containers/containers.redux';
import { times } from 'lodash';
import { containerMockFactory } from '@/v5/store/containers/containers.fixtures';

describe('Containers: redux', () => {
	const mockContainers = times(5, () => containerMockFactory({ isFavourite: false }));
	const defaultState = {
		...INITIAL_STATE,
		containers: mockContainers
	};

	it('should add container to favourites', () => {
		const resultState = containersReducer(defaultState, ContainersActions.toggleFavouriteSuccess(mockContainers[0]._id));

		expect(resultState.containers[0].isFavourite).toEqual(true);
		expect(resultState.containers.slice(1).every(container => container.isFavourite)).toEqual(false);
	});

	it('should remove container from favourites', () => {
		const mockAllFavouritesContainersMock = times(5, () => containerMockFactory({ isFavourite: true }))
		const defaultStateWithAllFavourites = {
			...INITIAL_STATE,
			containers: mockAllFavouritesContainersMock
		}
		const resultState = containersReducer(defaultStateWithAllFavourites, ContainersActions.toggleFavouriteSuccess(mockAllFavouritesContainersMock[0]._id));

		expect(resultState.containers[0].isFavourite).toEqual(false);
		expect(resultState.containers.slice(1).every(container => container.isFavourite)).toEqual(true);
	})
})
