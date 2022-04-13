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

import * as CurrentUserSaga from '@/v5/store/currentUser/currentUser.sagas';
import { expectSaga } from 'redux-saga-test-plan';
import { CurrentUserActions } from '@/v5/store/currentUser/currentUser.redux';
import { mockServer } from '../../internals/testing/mockServer';
import { currentUserMockFactory, generateFakeApiKey } from './currentUser.fixtures';

describe('Current User: sagas', () => {
	describe('fetchUser', () => {
		const userData = currentUserMockFactory();
		it('should fetch user data', async () => {
			mockServer
				.get('/user')
				.reply(200, userData);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.fetchUser())
				.put.like({ // Using like because avatarUrl uses a timestamp
					action: {
						type: 'CURRENT_USER2/FETCH_USER_SUCCESS',
						userData,
					}
				})
				.silentRun();
		})

		it('should show error dialog when API call errors', async () => {
			mockServer
				.get('/user')
				.reply(400, Error);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.fetchUser())
				.put.like({
					action: {
						type: 'MODALS/OPEN',
						modalType: 'alert',
						props: {
							currentActions: 'trying to fetch current user details',
						},
					}})
				.silentRun();
		})
	})

	describe('updateUser', () => {
		const userData = currentUserMockFactory();
		it('should update user data', async () => {
			mockServer
				.put('/user')
				.reply(200, userData);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.updateUser(userData))
				.put(CurrentUserActions.setIsPending(true))
				.put(CurrentUserActions.updateUserSuccess(userData))
				.put(CurrentUserActions.setIsPending(false))
				.silentRun();
		})

		it('should show error dialog when API call errors', async () => {
			mockServer
				.put('/user')
				.reply(400, Error);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.updateUser(userData))
				.put(CurrentUserActions.setIsPending(true))
				.put.like({
					action: {
						type: 'MODALS/OPEN',
						modalType: 'alert',
						props: {
							currentActions: 'trying to update current user details',
						},
					}})
				.silentRun();
		})
	})

	describe('generateApiKey', () => {
		const apiKey = generateFakeApiKey();
		it('should generate an API key and update user data', async () => {
			mockServer
				.post('/user/key')
				.reply(200, apiKey);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.generateApiKey())
				.put(CurrentUserActions.setIsPending(true))
				.put(CurrentUserActions.updateUserSuccess(apiKey))
				.put(CurrentUserActions.setIsPending(false))
				.silentRun();
		})

		it('should show error dialog when API call errors', async () => {
			mockServer
				.post('/user/key')
				.reply(400, Error);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.generateApiKey())
				.put(CurrentUserActions.setIsPending(true))
				.put.like({
					action: {
						type: 'MODALS/OPEN',
						modalType: 'alert',
						props: {
							currentActions: 'trying to generate API key',
						},
					}})
				.silentRun();
		})
	})

	describe('deleteApiKey', () => {
		it('should delete an API key and update user data', async () => {
			mockServer
				.delete('/user/key')
				.reply(200, '');

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.deleteApiKey())
				.put(CurrentUserActions.setIsPending(true))
				.put(CurrentUserActions.updateUserSuccess({ apiKey: null }))
				.put(CurrentUserActions.setIsPending(false))
				.silentRun();
		})

		it('should show error dialog when API call errors', async () => {
			mockServer
				.delete('/user/key')
				.reply(400, Error);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.deleteApiKey())
				.put(CurrentUserActions.setIsPending(true))
				.put.like({
					action: {
						type: 'MODALS/OPEN',
						modalType: 'alert',
						props: {
							currentActions: 'trying to delete API key',
						},
					}})
				.silentRun();
		})
	})
})