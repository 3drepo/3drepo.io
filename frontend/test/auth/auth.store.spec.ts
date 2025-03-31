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

import { AuthActions } from '@/v5/store/auth/auth.redux';
import { authMockFactory } from './auth.fixtures';
import { selectAuthenticationFetched, selectIsAuthenticated, selectIsAuthenticationPending, selectReturnUrl } from '@/v5/store/auth/auth.selectors';
import { createTestStore } from '../test.helpers';

describe('Auth: store', () => {
	let dispatch, getState = null;

	const mockAuth = authMockFactory();

	beforeEach(() => ({ dispatch, getState } = createTestStore()));

	it('should set is authenticated successfully', () => {
		const authFetchedBefore = selectAuthenticationFetched(getState());
		expect(authFetchedBefore).toEqual(false);

		dispatch(AuthActions.setIsAuthenticated(mockAuth.isAuthenticated));
		const authStatus = selectIsAuthenticated(getState());
		expect(authStatus).toEqual(mockAuth.isAuthenticated);

		const authFetchedAfter = selectAuthenticationFetched(getState());
		expect(authFetchedAfter).toEqual(true);
	});

	it('should set authentication pending status successfully', () => {
		dispatch(AuthActions.setIsAuthenticationPending(mockAuth.isAuthenticationPending));
		const isAuthenticationPending = selectIsAuthenticationPending(getState());
		expect(isAuthenticationPending).toEqual(mockAuth.isAuthenticationPending);
	});
	
	it('should set the return URL successfully', () => {
		dispatch(AuthActions.setReturnUrl(mockAuth.returnUrl));
		const returnUrl = selectReturnUrl(getState());
		expect(returnUrl).toEqual(mockAuth.returnUrl);
	});
});
