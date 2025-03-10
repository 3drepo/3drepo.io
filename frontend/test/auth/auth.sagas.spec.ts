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
import { selectIsAuthenticated, selectLoginError } from '@/v5/store/auth/auth.selectors';
import { DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';

describe('Auth: sagas', () => {
	const username = 'Jason';
	const password = 'Friday13';
	
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

	describe('login', () => {
		it('should login successfully', async () => {
			mockServer
				.post('/login')
				.reply(200);

			await waitForActions(() => {
				dispatch(AuthActions.login(username, password));
			}, [AuthActions.setIsAuthenticationPending(false)]);

			const isAuthenticated = selectIsAuthenticated(getState());

			expect(isAuthenticated).toBeTruthy();
		});

		it('should fail to log in with unexpected error', async () => {
			mockServer
				.post('/login')
				.reply(500);
			ClientConfig.loginPolicy = { lockoutDuration: 10 };

			await waitForActions(() => {
				dispatch(AuthActions.login(username, password));
			}, [AuthActions.setIsAuthenticationPending(false)]);

			const isAuthenticated = selectIsAuthenticated(getState());

			expect(isAuthenticated).toBeFalsy();

			delete ClientConfig.loginPolicy;
		});

		it('should fail to log in with expected error', async () => {
			const errorCode = { code: 'INCORRECT_USERNAME_OR_PASSWORD' };
			const expectedErrorMessage = 'Incorrect username or password. Please try again.';

			mockServer
				.post('/login')
				.reply(400, errorCode);
			ClientConfig.loginPolicy = { lockoutDuration: 10 };

			await waitForActions(() => {
				dispatch(AuthActions.login(username, password));
			}, [AuthActions.setIsAuthenticationPending(false)]);

			const isAuthenticated = selectIsAuthenticated(getState());
			const errorMessage = selectLoginError(getState());

			expect(isAuthenticated).toBeFalsy();
			expect(errorMessage).toEqual(expectedErrorMessage);

			delete ClientConfig.loginPolicy;
		});
	});

	describe('logout', () => {
		it('should logout successfully', async () => {
			mockServer
				.post('/logout')
				.reply(200);

			await waitForActions(() => {
				dispatch(AuthActions.logout());
			}, [AuthActions.setIsAuthenticationPending(false)]);

			const isAuthenticated = selectIsAuthenticated(getState());

			expect(isAuthenticated).toBeFalsy();
		});
		it('should fail to logout and open alert modal', async () => {
			mockServer
				.post('/logout')
				.reply(400);

			await waitForActions(() => {
				dispatch(AuthActions.logout());
			}, [DialogsTypes.OPEN, AuthActions.setIsAuthenticationPending(false)]);

			const isAuthenticated = selectIsAuthenticated(getState());
			expect(isAuthenticated).toBeFalsy();
		});
	});
});
