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
import { ICurrentUserState, INITIAL_STATE } from '@/v5/store/currentUser/currentUser.redux';
import { currentUserMockFactory } from './currentUser.fixtures';
import {
	selectCurrentUser,
	selectFirstName,
	selectUsername,
	selectPersonalError,
	selectPersonalDataIsUpdating,
	selectApiKey,
	selectApiKeyError,
	selectApiKeyIsUpdating,
} from '@/v5/store/currentUser/currentUser.selectors';

const defaultState: ICurrentUserState = {
	...INITIAL_STATE,
	currentUser: {
		...currentUserMockFactory({
			personalDataIsUpdating: true,
			personalError: new Error('Personal error'),
			apiKeyIsUpdating: true,
			apiKeyError: new Error('Api key error'),
		}),
	},
}

describe('CurrentUser: selectors', () => {
	describe('selectCurrentUser', () => {
		it('should return the current user', () => {
			const selected = selectCurrentUser.resultFunc(defaultState);
			expect(selected).toEqual(defaultState.currentUser);
		})
	})

	describe('selectUsername', () => {
		it('should return currentUser username', () => {
			const selected = selectUsername.resultFunc(defaultState.currentUser);
			expect(selected).toEqual(defaultState.currentUser.username);
		})
	})

	describe('selectFirstName', () => {
		it('should return currentUser firstName', () => {
			const selected = selectFirstName.resultFunc(defaultState.currentUser);
			expect(selected).toEqual(defaultState.currentUser.firstName);
		})
	})

	describe('selectPersonalError', () => {
		it('should return currentUser personalError', () => {
			const selected = selectPersonalError.resultFunc(defaultState.currentUser);
			expect(selected).toEqual(defaultState.currentUser.personalError);
		})
	})

	describe('selectPersonalError', () => {
		it('should return currentUser personalError', () => {
			const selected = selectPersonalError.resultFunc(defaultState.currentUser);
			expect(selected).toEqual(defaultState.currentUser.personalError);
		})
	})

	describe('selectPersonalDataIsUpdating', () => {
		it('should return currentUser personalDataIsUpdating', () => {
			const selected = selectPersonalDataIsUpdating.resultFunc(defaultState.currentUser);
			expect(selected).toEqual(defaultState.currentUser.personalDataIsUpdating);
		})
	})

	describe('selectApiKey', () => {
		it('should return currentUser apiKey', () => {
			const selected = selectApiKey.resultFunc(defaultState.currentUser);
			expect(selected).toEqual(defaultState.currentUser.apiKey);
		})
	})

	describe('selectApiKeyError', () => {
		it('should return currentUser apiKeyError', () => {
			const selected = selectApiKeyError.resultFunc(defaultState.currentUser);
			expect(selected).toEqual(defaultState.currentUser.apiKeyError);
		})
	})

	describe('selectApiKeyIsUpdating', () => {
		it('should return currentUser apiKeyIsUpdating', () => {
			const selected = selectApiKeyIsUpdating.resultFunc(defaultState.currentUser);
			expect(selected).toEqual(defaultState.currentUser.apiKeyIsUpdating);
		})
	})
})
