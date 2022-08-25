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
import * as AuthSaga from '@/v5/store/auth/auth.sagas';
import { CurrentUserActions } from '@/v5/store/currentUser/currentUser.redux';
import { expectSaga } from 'redux-saga-test-plan';
import { mockServer } from '../../internals/testing/mockServer';
import { alertAction } from '../test.helpers'

describe('Auth: sagas', () => {
	const username = 'Jason';
	const password = 'Friday13';

	describe('authenticate', () => {
		it('should authenticate successfully', async () => {
			mockServer
				.get('/login')
				.reply(200);

			await expectSaga(AuthSaga.default)
				.dispatch(AuthActions.authenticate())
				.put(AuthActions.setPendingStatus(true))
				.put(CurrentUserActions.fetchUser())
				.put(AuthActions.setAuthenticationStatus(true))
				.put(AuthActions.setPendingStatus(false))
				.silentRun();
		});

		it('should fail to authenticate and open alert modal', async () => {
			mockServer
				.get('/login')
				.reply(400);

			await expectSaga(AuthSaga.default)
				.dispatch(AuthActions.authenticate())
				.put(AuthActions.setPendingStatus(true))
				.put(AuthActions.setAuthenticationStatus(false))
				.put.like(alertAction('trying to authenticate'))
				.put(AuthActions.setPendingStatus(false))
				.silentRun();
		});
	});

	describe('login', () => {

		it('should login successfully', async () => {
			mockServer
				.post('/login')
				.reply(200);

			await expectSaga(AuthSaga.default)
				.dispatch(AuthActions.login(username, password))
				.put(AuthActions.setPendingStatus(true))
				.put(CurrentUserActions.fetchUser())
				.put(AuthActions.setAuthenticationStatus(true))
				.put(AuthActions.setPendingStatus(false))
				.silentRun();
		});

		it('should fail to log in with unexpected error', async () => {
			mockServer
				.post('/login')
				.reply(500);
			ClientConfig.loginPolicy = { lockoutDuration: 10 };

			await expectSaga(AuthSaga.default)
				.dispatch(AuthActions.login(username, password))
				.put(AuthActions.setPendingStatus(true))
				.put(AuthActions.loginFailed(null))
				.put(AuthActions.setPendingStatus(false))
				.silentRun();
			
			delete ClientConfig.loginPolicy;
		});

		it('should fail to log in with expected error', async () => {
			const errorCode = { code: 'INCORRECT_USERNAME_OR_PASSWORD' };
			const expectedErrorMessage = 'Incorrect username or password. Please try again.';

			mockServer
				.post('/login')
				.reply(400, errorCode);
			ClientConfig.loginPolicy = { lockoutDuration: 10 };

			await expectSaga(AuthSaga.default)
				.dispatch(AuthActions.login(username, password))
				.put(AuthActions.setPendingStatus(true))
				.put(AuthActions.loginFailed(expectedErrorMessage))
				.put(AuthActions.setPendingStatus(false))
				.silentRun();

			delete ClientConfig.loginPolicy;
		});
	});

	describe('logout', () => {
		it('should logout successfully', async () => {
			mockServer
				.post('/logout')
				.reply(200);

			await expectSaga(AuthSaga.default)
				.dispatch(AuthActions.logout())
				.put(AuthActions.setPendingStatus(true))
				.put({ type: 'RESET_APP' })
				.put(AuthActions.setAuthenticationStatus(false))
				.put(AuthActions.setPendingStatus(false))
				.silentRun();
		});
		it('should fail to logout and open alert modal', async () => {
			mockServer
				.post('/logout')
				.reply(400);

			await expectSaga(AuthSaga.default)
				.dispatch(AuthActions.logout())
				.put(AuthActions.setPendingStatus(true))
				.put.like(alertAction('trying to log out'))
				.put({ type: 'RESET_APP' })
				.put(AuthActions.setAuthenticationStatus(false))
				.put(AuthActions.setPendingStatus(false))
				.silentRun();
		});
	});
});
