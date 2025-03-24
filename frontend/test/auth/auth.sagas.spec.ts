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
import { mockServer } from '../../internals/testing/mockServer';
import { createTestStore } from '../test.helpers'
import { selectAuthenticatedTeamspace, selectIsAuthenticated } from '@/v5/store/auth/auth.selectors';
import { DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';

describe('Auth: sagas', () => {
	const authenticatedTeamspace = 'WE_HATE_PINEAPPLE_ON_PIZZA_TEAMSPACE';
	
	let dispatch, getState, waitForActions;

	beforeEach(() => {
		({ dispatch, getState,  waitForActions } = createTestStore());
	});	

	describe('authenticate', () => {
		it('should authenticate successfully', async () => {
			mockServer
				.get('/login')
				.reply(200);

			await waitForActions(() => {
				dispatch(AuthActions.authenticate());
			}, [AuthActions.setIsAuthenticationPending(false)]);

			const isAuthenticated = selectIsAuthenticated(getState());

			expect(isAuthenticated).toBeTruthy();
		});

		it('should fail to authenticate and open alert modal', async () => {
			mockServer
				.get('/login')
				.reply(400);

			await waitForActions(() => {
				dispatch(AuthActions.authenticate());
			}, [DialogsTypes.OPEN, AuthActions.setIsAuthenticationPending(false)]);
		});
	});

	describe('logout', () => {
		beforeEach(() => {
			dispatch(AuthActions.setAuthenticatedTeamspace(authenticatedTeamspace));
			dispatch(AuthActions.setIsAuthenticated(true));
		})
		it('should logout successfully', async () => {
			mockServer
				.post('/logout')
				.reply(200);

			await waitForActions(() => {
				dispatch(AuthActions.logout());
			}, [
				AuthActions.setIsAuthenticated(false),
				AuthActions.setIsAuthenticationPending(false),
				AuthActions.setAuthenticatedTeamspace(null),
			]);

			const isAuthenticated = selectIsAuthenticated(getState());
			const teamspace = selectAuthenticatedTeamspace(getState());

			expect(isAuthenticated).toBeFalsy();
			expect(teamspace).toEqual(null);
		});
		it('should fail to logout and open alert modal', async () => {
			mockServer
				.post('/logout')
				.reply(400);

			await waitForActions(() => {
				dispatch(AuthActions.logout());
			}, [DialogsTypes.OPEN, AuthActions.setIsAuthenticationPending(false)]);


			const isAuthenticated = selectIsAuthenticated(getState());
			const teamspace = selectAuthenticatedTeamspace(getState());

			expect(isAuthenticated).toBeFalsy();
			expect(teamspace).toEqual(null);
		});
	});
});
