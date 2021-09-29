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
import { containerMockFactory } from '@/v5/store/containers/containers.fixtures';
import {
	selectContainers,
	selectFavouriteContainers,
	selectFilteredContainers
} from '@/v5/store/containers/containers.selectors';
import { IContainersState } from '@/v5/store/containers/containers.types';

const searchPhrase = 'test phrase'
const defaultState: IContainersState = {
	...INITIAL_STATE,
	containers: [
		containerMockFactory({ isFavourite: true, name: searchPhrase }),
		...times(5, () => containerMockFactory({ isFavourite: true })),
		...times(4, () => containerMockFactory({ isFavourite: false }))
	],
	filterQuery: searchPhrase
}

describe('Containers: selectors', () => {
	describe('selectFavouriteContainers', () => {
		it('should select favourite containers', () => {
			const selected = selectFavouriteContainers.resultFunc(defaultState.containers);
			expect(selected).toHaveLength(6);
		})
	})

	describe('selectContainers', () => {
		it('should select all containers', () => {
			const selected = selectContainers.resultFunc(defaultState);
			expect(selected).toHaveLength(10);
		})
	})

	describe('selectFilteredContainers', () => {
		it('should select container with searchPhrase', () => {
			const selected = selectFilteredContainers.resultFunc(defaultState.containers, searchPhrase);
			expect(selected).toHaveLength(1);
		})
	})
})
