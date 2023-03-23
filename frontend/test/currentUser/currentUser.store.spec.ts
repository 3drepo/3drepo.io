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

import { CurrentUserActions } from '@/v5/store/currentUser/currentUser.redux';
import { selectApiKeyIsUpdating, selectCurrentUser } from '@/v5/store/currentUser/currentUser.selectors';
import { currentUserMockFactory, generatePersonalData } from './currentUser.fixtures';
import { createTestStore } from '../test.helpers';

describe('CurrentUser: store', () => {
	let dispatch, getState;

	beforeEach(() => {
		({ dispatch, getState} = createTestStore());
	})

	it('should set currentUser', () => {
		let currentUser = selectCurrentUser(getState());
		expect(Object.keys(currentUser).length).not.toBe(0);

		const mockCurrentUser = currentUserMockFactory();
		dispatch(CurrentUserActions.fetchUserSuccess(mockCurrentUser));
		currentUser = selectCurrentUser(getState());
		expect(currentUser).toEqual(mockCurrentUser);
	})

	describe('Updating currentUser attributes:', () => {
		it('should update personal data', () => {
			const mockCurrentUser = currentUserMockFactory();
			dispatch(CurrentUserActions.fetchUserSuccess(mockCurrentUser));
			const { firstName: mockFirstName } = generatePersonalData();
			dispatch(CurrentUserActions.updateUserSuccess({ firstName: mockFirstName }));
			const currentUser = selectCurrentUser(getState());
			expect(currentUser).toEqual({ ...mockCurrentUser, firstName: mockFirstName });
		})

		// apiKeyIsUpdating
		it('should set api key data to true', () => {
			dispatch(CurrentUserActions.setApiKeyIsUpdating(true));
			const personalDataIsUpdating = selectApiKeyIsUpdating(getState());
			expect(personalDataIsUpdating).toBe(true);
		});
	
		it('should set api key data to false', () => {
			dispatch(CurrentUserActions.setApiKeyIsUpdating(false));
			const personalDataIsUpdating = selectApiKeyIsUpdating(getState());
			expect(personalDataIsUpdating).toBe(false);
		});
	})
})
