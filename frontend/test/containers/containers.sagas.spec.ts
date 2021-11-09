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

import { expectSaga } from 'redux-saga-test-plan';
import { pick, times } from 'lodash';

import { mockServer } from '../../internals/testing/mockServer';
import * as ContainersSaga from '@/v5/store/containers/containers.sagas';
import { ContainersActions } from '@/v5/store/containers/containers.redux';
import { containerMockFactory } from './containers.fixtures';
import { prepareContainersData } from '@/v5/store/containers/containers.helpers';
import { IContainer } from '@/v5/store/containers/containers.types';

describe('Containers: sagas', () => {
	const teamspace = 'teamspace';
	const projectId = 'projectId';
	const containerId = 'containerId';

	describe('addFavourite', () => {
		it('should call addFavourite endpoint', async () => {
			mockServer
			.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/favourites`)
			.reply(200)

			await expectSaga(ContainersSaga.default)
			.dispatch(ContainersActions.addFavourite(teamspace, projectId, containerId))
			.put(ContainersActions.setFavouriteSuccess(projectId, containerId, true))
			.silentRun();
		})

		it('should call addFavourite endpoint with 404 and revert change', async () => {
			mockServer
			.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/favourites`)
			.reply(404)

			await expectSaga(ContainersSaga.default)
			.dispatch(ContainersActions.addFavourite(teamspace, projectId, containerId))
			.put(ContainersActions.setFavouriteSuccess(projectId, containerId, true))
			.put(ContainersActions.setFavouriteSuccess(projectId, containerId, false))
			.silentRun();
		})
	})

	describe('removeFavourite', () => {
		it('should call removeFavourite endpoint', async () => {
			mockServer
			.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/favourites`)
			.reply(200)

			await expectSaga(ContainersSaga.default)
			.dispatch(ContainersActions.removeFavourite(teamspace, projectId, containerId))
			.put(ContainersActions.setFavouriteSuccess(projectId, containerId, false))
			.silentRun();
		})

		it('should call removeFavourite endpoint with 404 and revert change', async () => {
			mockServer
			.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/favourites`)
			.reply(404)

			await expectSaga(ContainersSaga.default)
			.dispatch(ContainersActions.removeFavourite(teamspace, projectId, containerId))
			.put(ContainersActions.setFavouriteSuccess(projectId, containerId, false))
			.put(ContainersActions.setFavouriteSuccess(projectId, containerId, true))
			.silentRun();
		})
	})

	describe('fetchContainers', () => {
		const mockContainers = times(2, () => containerMockFactory());
		const mockContainersBaseResponse = mockContainers.map((container) => pick(container, ['_id', 'name', 'role', 'isFavourite']));
		const mockContainersWithoutStats = prepareContainersData(mockContainers);

		it('should fetch containers data', async () => {
			mockServer
			.get(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
			.reply(200, {
				containers: mockContainersBaseResponse
			});

			await expectSaga(ContainersSaga.default)
			.dispatch(ContainersActions.fetchContainers(teamspace, projectId))
			.put(ContainersActions.setIsListPending(true))
			.put(ContainersActions.fetchContainersSuccess(projectId, mockContainersWithoutStats))
			.put(ContainersActions.setIsListPending(false))
			.silentRun();
		})

		it('should fetch stats', async () => {
			const prepareMockStatsReply = (container: IContainer) => ({
				revisions: {
					total: container.revisionsCount,
					lastUpdated: container.lastUpdated.valueOf(),
					latestRevision: container.latestRevision
				},
				type: container.type,
				status: container.status,
				code: container.code,
				units: container.units
			})

			mockContainers.forEach((container) => {
				mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${container._id}/stats`)
				.reply(200, prepareMockStatsReply(container));
			})

			await expectSaga(ContainersSaga.default)
			.dispatch(ContainersActions.fetchContainerStats(teamspace, projectId, mockContainers[0]._id))
			.dispatch(ContainersActions.fetchContainerStats(teamspace, projectId, mockContainers[1]._id))
			.put(ContainersActions.fetchContainerStatsSuccess(projectId, mockContainers[0]._id, prepareMockStatsReply(mockContainers[0])))
			.put(ContainersActions.fetchContainerStatsSuccess(projectId, mockContainers[1]._id, prepareMockStatsReply(mockContainers[1])))
			.silentRun();
		})

		it('should call containers endpoint with 404', async () => {
			mockServer
			.get(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
			.reply(404);

			await expectSaga(ContainersSaga.default)
			.dispatch(ContainersActions.fetchContainers(teamspace, projectId))
			.put(ContainersActions.setIsListPending(true))
			.silentRun();
		})
	})
})
