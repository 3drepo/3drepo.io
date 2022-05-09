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
import { IFederationsState, INITIAL_STATE } from '@/v5/store/federations/federations.redux';
import { times } from 'lodash';
import {
	selectFederations,
	selectFavouriteFederations,
	selectAreStatsPending, selectHasFederations
} from '@/v5/store/federations/federations.selectors';
import { federationMockFactory } from './federations.fixtures';

const searchPhrase = 'test phrase';
const projectId = 'projectId';
const defaultState: IFederationsState = {
	...INITIAL_STATE,
	federationsByProject:
		{
			[projectId]: [
				federationMockFactory({ isFavourite: true, name: searchPhrase }),
				...times(5, () => federationMockFactory({ isFavourite: true, hasStatsPending: false })),
				...times(4, () => federationMockFactory({ isFavourite: false, hasStatsPending: false })),
				federationMockFactory({ isFavourite: false, hasStatsPending: true }),
			],
		},
}

describe('Federations: selectors', () => {
	describe('selectFavouriteFederations', () => {
		it('should return favourite federations', () => {
			const selected = selectFavouriteFederations.resultFunc(defaultState.federationsByProject[projectId]);
			expect(selected).toHaveLength(6);
		})
	})

	describe('selectFederations', () => {
		it('should return all federations', () => {
			const selected = selectFederations.resultFunc(defaultState, projectId);
			expect(selected).toHaveLength(11);
		})
	})

	describe('selectHasFederations', () => {
		it('should return correct values when favourite item is in federations', () => {
			const federations = defaultState.federationsByProject[projectId];
			const favourites = selectFavouriteFederations.resultFunc(federations);
			const selected = selectHasFederations.resultFunc(federations, favourites);
			expect(selected).toEqual({ favourites: true, all: true })
		})

		it('should return correct values when no favourite item is in federations', () => {
			const federations = [federationMockFactory({ isFavourite: false })];
			const favourites = selectFavouriteFederations.resultFunc(federations);
			const selected = selectHasFederations.resultFunc(federations, favourites);
			expect(selected).toEqual({ favourites: false, all: true })
		})

		it('should return correct values for empty federations', () => {
			const selected = selectHasFederations.resultFunc([],[]);
			expect(selected).toEqual({ favourites: false, all: false })
		})
	})

	describe('selectAreStatsPending', () => {
		it('should return true if at least one item has pending stats', () => {
			const selected = selectAreStatsPending.resultFunc(defaultState.federationsByProject[projectId]);
			expect(selected).toBeTruthy();
		})

		it('should return false if all items has no pending stats', () => {
			const federations = times(10, () => federationMockFactory({ hasStatsPending: false }));

			const selected = selectAreStatsPending.resultFunc(federations);
			expect(selected).toBeFalsy();
		})
	})
})
