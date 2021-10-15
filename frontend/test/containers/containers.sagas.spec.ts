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
import { pick, times } from 'lodash';
import { containerMockFactory } from '@/v5/store/containers/containers.fixtures';
import { prepareContainersData } from '@/v5/store/containers/containers.helpers';

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

	describe('fetchContainers', () => {
		const mockContainers = times(10, () => containerMockFactory());
		const mockContainersBaseResponse = mockContainers.map((container) => pick(container, ['_id', 'name', 'role', 'isFavourite']));
		const mockContainersWithoutStats = prepareContainersData(mockContainers);


		it('should call containers endpoint -> call stats endpoint -> put SET_IS_PENDING ', async () => {
			mockServer
			.get(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
			.reply(200, {
				containers: mockContainersBaseResponse
			});

			mockContainers.forEach((container) => {
				mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${container._id}/stats`)
				.reply(200, {
					revisions: {
						total: container.revisionsCount,
						lastUpdated: container.lastUpdated,
						latestRevision: container.latestRevision
					},
					type: container.type,
					status: container.status,
					code: container.code,
				});
			})

			await expectSaga(ContainersSaga.default)
			.dispatch(ContainersActions.fetchContainers(teamspace, projectId))
			.put(ContainersActions.setIsListPending(true))
			.put(ContainersActions.setAreStatsPending(true))
			.put(ContainersActions.fetchContainersSuccess(projectId, mockContainersWithoutStats))
			.put(ContainersActions.setIsListPending(false))
			.put(ContainersActions.fetchContainersSuccess(projectId, mockContainers))
			.put(ContainersActions.setAreStatsPending(false))
			.silentRun();
		})

		it('should call containers endpoint with 404 -> put SET_IS_PENDING ', async () => {
			mockServer
			.get(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
			.reply(404);

			await expectSaga(ContainersSaga.default)
			.dispatch(ContainersActions.fetchContainers(teamspace, projectId))
			.put(ContainersActions.setIsListPending(true))
			.put(ContainersActions.setAreStatsPending(true))
			.put(ContainersActions.setIsListPending(false))
			.put(ContainersActions.setAreStatsPending(false))
			.silentRun()
			.then(({ effects }: any) => {
				expect(effects.put).toBeUndefined();
			});
		})
	})
})
