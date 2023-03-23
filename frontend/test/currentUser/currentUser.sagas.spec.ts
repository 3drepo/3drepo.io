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
import { UpdatePersonalData } from '@/v5/store/currentUser/currentUser.types';
import api from '@/v5/services/api/default';
import {
	currentUserMockFactory,
	generateFakeApiKey,
	generateFakeAvatarFile,
	generateFakeAvatarUrl,
	generatePersonalData,
} from './currentUser.fixtures';
import { spyOnAxiosApiCallWithFile } from '../test.helpers';
import { mockServer } from '../../internals/testing/mockServer';


describe('Current User: sagas', () => {
	describe('fetchUser', () => {
		const userData = currentUserMockFactory();
		it('should fetch user data', async () => {
			mockServer
				.get('/user')
				.reply(200, userData);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.fetchUser())
				.dispatch(CurrentUserActions.fetchUserSuccess(userData))
				.run();
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
				.run();
		})
	})

	describe('updatePersonalData', () => {
		const userData = generatePersonalData();
		const avatarFile = generateFakeAvatarFile();
		const avatarUrl = generateFakeAvatarUrl();
		const personalData: UpdatePersonalData = { ...userData };
		const personalDataWithAvatar: UpdatePersonalData = { ...userData, avatarFile };
		let onSuccess, onError;

		beforeEach(() => {
			onSuccess = jest.fn();
			onError = jest.fn();
		});

		it('should update user data (without avatar)', async () => {
			mockServer
				.put('/user')
				.reply(200, null);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.updatePersonalData(personalData, onSuccess, onError))
				.run();
			
			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		})

		it('should update user data (including avatar)', async () => {
			const spy = spyOnAxiosApiCallWithFile(api, 'put');
			window.URL.createObjectURL = jest.fn().mockReturnValue(avatarUrl);

			mockServer
				.put('/user')
				.reply(200, null)
				.put('/user/avatar')
				.reply(200, { avatarUrl });

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.updatePersonalData(personalDataWithAvatar, onSuccess, onError))
				.put(CurrentUserActions.updateUserSuccess({ avatarUrl, hasAvatar: true }))
				.put(CurrentUserActions.updateUserSuccess(userData))
				.run();
			
			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();

			spy.mockClear();
		})

		it('should call error callback when API call errors on updateUser', async () => {
			mockServer
				.put('/user')
				.reply(400, Error);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.updatePersonalData(userData, onSuccess, onError))
				.run();
			
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		})

		it('should call error callback when API call errors on updateAvatar', async () => {
			mockServer
				.put('/user')
				.reply(200, 'this is the response')
				.put('/user/avatar')
				.reply(400, Error);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.updatePersonalData({...userData, avatarFile}, onSuccess, onError))
				.run();
			
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		})
	})

	describe('generateApiKey', () => {
		it('should generate an API key and update user data', async () => {
			const apiKey = generateFakeApiKey();

			mockServer
				.post('/user/key')
				.reply(200, apiKey);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.generateApiKey())
				.put(CurrentUserActions.setApiKeyIsUpdating(true))
				.put(CurrentUserActions.updateUserSuccess(apiKey))
				.put(CurrentUserActions.setApiKeyIsUpdating(false))
				.run();
		})

		it('should not generate an API key when API call errors', async () => {
			mockServer
				.post('/user/key')
				.reply(400);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.generateApiKey())
				.put(CurrentUserActions.setApiKeyIsUpdating(true))
				.put(CurrentUserActions.setApiKeyIsUpdating(false))
				.run();
		})
	})

	describe('deleteApiKey', () => {
		it('should delete the API key and update user data', async () => {
			mockServer
				.delete('/user/key')
				.reply(200, null);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.deleteApiKey())
				.put(CurrentUserActions.setApiKeyIsUpdating(true))
				.put(CurrentUserActions.updateUserSuccess({ apiKey: null }))
				.put(CurrentUserActions.setApiKeyIsUpdating(false))
				.run();
		})

		it('should delete the API key when API call errors', async () => {
			mockServer
				.delete('/user/key')
				.reply(400);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.deleteApiKey())
				.put(CurrentUserActions.setApiKeyIsUpdating(true))
				.put(CurrentUserActions.setApiKeyIsUpdating(false))
				.run();
		})
	})
});
