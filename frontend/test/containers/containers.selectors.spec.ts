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
import { INITIAL_STATE } from '@/v5/store/containers/containers.redux';
import { times } from 'lodash';
import { containerMockFactory } from './containers.fixtures';
import {
	selectFavouriteContainers,
	selectContainers,
	selectAreStatsPending,
	selectHasContainers
} from '@/v5/store/containers/containers.selectors';
import { IContainersState } from '@/v5/store/containers/containers.types';

const searchPhrase = 'test phrase';
const projectId = 'projectId';
const defaultState: IContainersState = {
	...INITIAL_STATE,
	containers:
		{
			[projectId]: [
				containerMockFactory({ isFavourite: true, name: searchPhrase }),
				...times(5, () => containerMockFactory({ isFavourite: true, hasStatsPending: false })),
				...times(4, () => containerMockFactory({ isFavourite: false, hasStatsPending: false })),
				containerMockFactory({ isFavourite: false, hasStatsPending: true}),
			],
		},
}

describe('Containers: selectors', () => {
	describe('selectFavouriteContainers', () => {
		it('should return favourite containers', () => {
			const selected = selectFavouriteContainers.resultFunc(defaultState.containers[projectId]);
			expect(selected).toHaveLength(6);
		})
	})

	describe('selectContainers', () => {
		it('should return all containers', () => {
			const selected = selectContainers.resultFunc(defaultState, projectId);
			expect(selected).toHaveLength(11);
		})
	})

	describe('selectHasContainers', () => {
		it('should return correct values when favourite item is in federations', () => {
			const containers = defaultState.containers[projectId];
			const favourites = selectFavouriteContainers.resultFunc(containers);
			const selected = selectHasContainers.resultFunc(containers, favourites);
			expect(selected).toEqual({ favourites: true, all: true })
		})

		it('should return correct values when no favourite item is in containers', () => {
			const containers = [containerMockFactory({ isFavourite: false })];
			const favourites = selectFavouriteContainers.resultFunc(containers);
			const selected = selectHasContainers.resultFunc(containers, favourites);
			expect(selected).toEqual({ favourites: false, all: true })
		})

		it('should return correct values for empty containers', () => {
			const selected = selectHasContainers.resultFunc([], []);
			expect(selected).toEqual({ favourites: false, all: false })
		})
	})

	describe('selectAreStatsPending', () => {
		it('should return true if at least one item has pending stats', () => {
			const selected = selectAreStatsPending.resultFunc(defaultState.containers[projectId]);
			expect(selected).toBeTruthy();
		})

		it('should return false if all items has no pending stats', () => {
			const containers = times(10, () => containerMockFactory({hasStatsPending: false}));

			const selected = selectAreStatsPending.resultFunc(containers);
			expect(selected).toBeFalsy();
		})
	})
})
