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

import { INITIAL_STATE, currentUserReducer, CurrentUserActions, ICurrentUserState } from '@/v5/store/currentUser/currentUser.redux';
import { currentUserMockFactory } from './currentUser.fixtures';

describe('CurrentUser: redux', () => {
	const defaultState: ICurrentUserState = {
		...INITIAL_STATE,
		currentUser: {
			...currentUserMockFactory({
				personalDataIsUpdating: false,
				apiKeyIsUpdating: false,
			}),
		}
	};

	describe('personal data', () => {
		it('should set error', () => {
			const error = new Error('personal error');
			const resultState: ICurrentUserState = currentUserReducer(
				defaultState,
				CurrentUserActions.setPersonalError(error)
			);

			expect(resultState.currentUser.personalError).toEqual(error);
		});

		it('should clear the error', () => {
			const resultState: ICurrentUserState = currentUserReducer(
				defaultState,
				CurrentUserActions.setPersonalError(null)
			);
			expect(resultState.currentUser.personalError).toEqual(null);
		});

		it('should set updating to true', () => {
			const resultState: ICurrentUserState = currentUserReducer(
				defaultState,
				CurrentUserActions.setPersonalDataIsUpdating(true)
			);

			expect(resultState.currentUser.personalDataIsUpdating).toEqual(true);
		});

		it('should set updating to false', () => {
			const resultState: ICurrentUserState = currentUserReducer(
				defaultState,
				CurrentUserActions.setPersonalDataIsUpdating(false)
			);

			expect(resultState.currentUser.personalDataIsUpdating).toEqual(false);
		});
	})

	describe('api key data', () => {
		it('should set error', () => {
			const error = new Error('api key error');
			const resultState: ICurrentUserState = currentUserReducer(
				defaultState,
				CurrentUserActions.setApiKeyError(error)
			);

			expect(resultState.currentUser.apiKeyError).toEqual(error);
		});

		it('should clear the error', () => {
			const resultState: ICurrentUserState = currentUserReducer(
				defaultState,
				CurrentUserActions.setApiKeyError(null)
			);
			expect(resultState.currentUser.apiKeyError).toEqual(null);
		});
		it('should set updating to true', () => {
			const resultState: ICurrentUserState = currentUserReducer(
				defaultState,
				CurrentUserActions.setApiKeyIsUpdating(true),
			);
			const resultCurrentUser = resultState.currentUser;

			expect(resultCurrentUser.apiKeyIsUpdating).toEqual(true);
		});

		it('should set updating to false', () => {
			const resultState: ICurrentUserState = currentUserReducer(
				defaultState,
				CurrentUserActions.setApiKeyIsUpdating(false),
			);
			const resultCurrentUser = resultState.currentUser;

			expect(resultCurrentUser.apiKeyIsUpdating).toEqual(false);
		});
	})
})
