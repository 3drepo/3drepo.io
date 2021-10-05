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

import * as ContainersSaga from '@/v5/store/containers/containers.sagas';
import { expectSaga } from 'redux-saga-test-plan';
import { ContainersActions } from '@/v5/store/containers/containers.redux';
import { mockServer } from '../../internals/testing/mockServer';

describe('Containers: sagas', () => {
	const teamspace = 'teamspace';
	const projectId = 'projectId';
	const containerId = 'containerId';

	describe('addFavourite', () => {
		it('should call addFavourite endpoint and dispatch TOGGLE_FAVOURITE_SUCCESS', async () => {
			mockServer
			.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/favourites`)
			.reply(200)

			await expectSaga(ContainersSaga.default)
			.dispatch(ContainersActions.addFavourite(teamspace, projectId, containerId))
			.put(ContainersActions.toggleFavouriteSuccess(projectId, containerId))
			.silentRun();
		})

		it('should call addFavourite endpoint with 404 and should not dispatch TOGGLE_FAVOURITE_SUCCESS', async () => {
			mockServer
			.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/favourites`)
			.reply(404)

			await expectSaga(ContainersSaga.default)
			.dispatch(ContainersActions.addFavourite(teamspace, projectId, containerId))
			.silentRun()
			.then(({ effects }: any) => {
				expect(effects.put).toBeUndefined();
			})
		})
	})

	describe('removeFavourite', () => {
		it('should call removeFavourite endpoint and dispatch TOGGLE_FAVOURITE_SUCCESS', async () => {
			mockServer
			.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/favourites`)
			.reply(200)

			await expectSaga(ContainersSaga.default)
			.dispatch(ContainersActions.removeFavourite(teamspace, projectId, containerId))
			.put(ContainersActions.toggleFavouriteSuccess(projectId, containerId))
			.silentRun();
		})

		it('should call removeFavourite endpoint with 404 and not dispatch TOGGLE_FAVOURITE_SUCCESS', async () => {
			mockServer
			.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/favourites`)
			.reply(404)

			await expectSaga(ContainersSaga.default)
			.dispatch(ContainersActions.removeFavourite(teamspace, projectId, containerId))
			.silentRun()
			.then(({ effects }: any) => {
				expect(effects.put).toBeUndefined();
			});
		})
	})
})
