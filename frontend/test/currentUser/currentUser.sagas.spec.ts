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

describe('Current User: sagas', () => {

	const userData = {
		username: 'Jason',
		firstName: 'Jason',
		lastName: 'Voorhees',
		company: '13DRepo',
	}

	describe('getProfile', () => {
		it('should fetch profile data', async () => {
			mockServer
				.get(`/user`)
				.reply(200, userData);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.getProfile())
				.put.like({ // Using like because avatarUrl uses a timestamp
					action: {
						type: 'CURRENT_USER2/GET_PROFILE_SUCCESS',
						userData: {
							...userData,
						}
					}
				})
				.silentRun();
		})

		it('should show error dialog when API call errors', async () => {
			mockServer
				.get(`/user`)
				.reply(400, Error);

			await expectSaga(CurrentUserSaga.default)
				.dispatch(CurrentUserActions.getProfile())
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
})
