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

import { CurrentUserActions, INITIAL_STATE } from '@/v5/store/currentUser/currentUser.redux';
import { UpdatePersonalData } from '@/v5/store/currentUser/currentUser.types';
import api from '@/v5/services/api/default';
import {
	currentUserMockFactory,
	generateFakeApiKey,
	generateFakeAvatarFile,
	generateFakeAvatarUrl,
	generatePersonalData,
} from './currentUser.fixtures';
import { createTestStore, spyOnAxiosApiCallWithFile } from '../test.helpers';
import { mockServer } from '../../internals/testing/mockServer';
import { selectApiKey, selectCurrentUser } from '@/v5/store/currentUser/currentUser.selectors';
import { DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';
import { ViewerActions } from '@/v4/modules/viewer';
import MockDate from 'mockdate';
import { omit } from 'lodash';
import { getWaitablePromise } from '@/v5/helpers/async.helpers';

describe('Current User: sagas', () => {
	let onSuccess, onError;
	let dispatch, getState, waitForActions;
	let avatarUrl;
	
	const apiKey = generateFakeApiKey();
	const INITIAL_USER = INITIAL_STATE.currentUser;
	const mockUser = currentUserMockFactory();
	const personalData: UpdatePersonalData = generatePersonalData();
	const personalDataWithAvatarFile: UpdatePersonalData = { ...personalData, avatarFile: generateFakeAvatarFile() };

	beforeAll(() => {
		// don't change this (WONDERFUL) date :)
		MockDate.set('1997-10-09');
		avatarUrl = generateFakeAvatarUrl();
	});

	afterAll(MockDate.reset);

	beforeEach(() => {
		onSuccess = jest.fn();
		onError = jest.fn();
		({ dispatch, getState, waitForActions } = createTestStore());
	});

	describe('fetchUser', () => {
		it('should fetch user data', async () => {
			const mockUseWithAvatar = { ...mockUser, avatarUrl };
			mockServer
				.get('/user')
				.reply(200, mockUser);

			await waitForActions(() => {
				dispatch(CurrentUserActions.fetchUser());
			}, [
				CurrentUserActions.fetchUserSuccess(mockUseWithAvatar),
				ViewerActions.fetchSettings(),
			])
			
			const userInStore = selectCurrentUser(getState());
			expect(userInStore).toEqual(mockUseWithAvatar);
		})

		it('should show error dialog when API call errors', async () => {
			mockServer
				.get('/user')
				.reply(400, Error);

			await waitForActions(() => {
				dispatch(CurrentUserActions.fetchUser());
			}, [DialogsTypes.OPEN]);

			const userInStore = selectCurrentUser(getState());
			expect(userInStore).toEqual(INITIAL_USER);
		})
	})

	describe('updatePersonalData', () => {
		it('should update user data (without avatar)', async () => {
			mockServer
				.put('/user')
				.reply(200);

			await waitForActions(() => {
				dispatch(CurrentUserActions.updatePersonalData(personalData, onSuccess, onError));
			}, [CurrentUserActions.updateUserSuccess(personalData)]);

			const userInStore = selectCurrentUser(getState());
			expect(omit(userInStore, 'username')).toEqual(personalData);
			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		})

		it('should call error callback when API call errors on updateUser', async () => {
			const { resolve, promiseToResolve } = getWaitablePromise();
			mockServer
				.put('/user')
				.reply(400);

			dispatch(CurrentUserActions.updatePersonalData(personalData, onSuccess, () => { onError(); resolve() }));
			await promiseToResolve;

			const userInStore = selectCurrentUser(getState());

			expect(userInStore).toEqual(INITIAL_USER);			
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		})

		it('should update user data (including avatar)', async () => {
			const spy = spyOnAxiosApiCallWithFile(api, 'put');
			window.URL.createObjectURL = jest.fn().mockReturnValue(avatarUrl);

			const avatarData = { avatarUrl, hasAvatar: true };

			mockServer
				.put('/user')
				.reply(200)
				.put('/user/avatar')
				.reply(200, { avatarUrl });

			await waitForActions(() => {
				dispatch(CurrentUserActions.updatePersonalData(personalDataWithAvatarFile, onSuccess, onError))
			}, [
				CurrentUserActions.updateUserSuccess(avatarData),
				CurrentUserActions.updateUserSuccess(personalData),
			]);

			const userInStore = selectCurrentUser(getState());
			expect(omit(userInStore, 'username')).toEqual({ ...personalData, ...avatarData });
			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();

			spy.mockClear();
		})

		it('should call error callback when API call errors on updateAvatar', async () => {
			const { resolve, promiseToResolve } = getWaitablePromise();

			mockServer
				.put('/user')
				.reply(200, 'this is the response')
				.put('/user/avatar')
				.reply(400);

			dispatch(CurrentUserActions.updatePersonalData(personalDataWithAvatarFile, onSuccess, () => { onError(); resolve() }));
			await promiseToResolve;

			const userInStore = selectCurrentUser(getState());
			
			expect(userInStore).toEqual(INITIAL_USER);		
			
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		})
	})

	describe('generateApiKey', () => {
		it('should generate an API key and update user data', async () => {
			mockServer
				.post('/user/key')
				.reply(200, { apiKey });

			await waitForActions(() => {
				dispatch(CurrentUserActions.generateApiKey())
			}, [
				CurrentUserActions.setApiKeyIsUpdating(true),
				CurrentUserActions.updateUserSuccess({ apiKey }),
				CurrentUserActions.setApiKeyIsUpdating(false),
			]);

			const keyInStore = selectApiKey(getState());
			expect(keyInStore).toEqual(apiKey);
		})

		it('should not generate an API key when API call errors', async () => {
			mockServer
				.post('/user/key')
				.reply(400);

			await waitForActions(() => {
				dispatch(CurrentUserActions.generateApiKey())
			}, [
				CurrentUserActions.setApiKeyIsUpdating(true),
				CurrentUserActions.setApiKeyIsUpdating(false),
			]);
			
			const keyInStore = selectApiKey(getState());
			expect(keyInStore).toBeFalsy();
		})
	})

	describe('deleteApiKey', () => {
		beforeEach(() => {
			dispatch(CurrentUserActions.updateUserSuccess({ apiKey }))
		});

		it('should delete the API key and update user data', async () => {
			mockServer
				.delete('/user/key')
				.reply(200);

			await waitForActions(() => {
				dispatch(CurrentUserActions.deleteApiKey())
			}, [
				CurrentUserActions.setApiKeyIsUpdating(true),
				CurrentUserActions.updateUserSuccess({ apiKey: null }),
				CurrentUserActions.setApiKeyIsUpdating(false),
			]);
			
			const keyInStore = selectApiKey(getState());
			expect(keyInStore).toBeFalsy();
		})

		it('should delete the API key when API call errors', async () => {
			mockServer
				.delete('/user/key')
				.reply(400);

			await waitForActions(() => {
				dispatch(CurrentUserActions.deleteApiKey())
			}, [
				CurrentUserActions.setApiKeyIsUpdating(true),
				CurrentUserActions.setApiKeyIsUpdating(false),
			]);
			
			const keyInStore = selectApiKey(getState());
			expect(keyInStore).toEqual(apiKey);
		})
	})
});
