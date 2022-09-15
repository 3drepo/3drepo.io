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
import { prepareContainersData } from '@/v5/store/containers/containers.helpers';
import { IContainer } from '@/v5/store/containers/containers.types';
import { containerMockFactory, prepareMockSettingsReply } from './containers.fixtures';
import { omit } from 'lodash';
import { prepareMockViewsReply } from './containers.fixtures';
import { prepareMockRawSettingsReply } from './containers.fixtures';
import { prepareContainerSettingsForFrontend } from './../../src/v5/store/containers/containers.helpers';
import { alertAction } from '../test.helpers';

describe('Containers: sagas', () => {
	const teamspace = 'teamspace';
	const projectId = 'projectId';
	const containerId = 'containerId';
	let onSuccess, onError;

	beforeEach(() => {
		onSuccess = jest.fn();
		onError = jest.fn();
	})

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
			.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/favourites?ids=${containerId}`)
			.reply(200)

			await expectSaga(ContainersSaga.default)
				.dispatch(ContainersActions.removeFavourite(teamspace, projectId, containerId))
				.put(ContainersActions.setFavouriteSuccess(projectId, containerId, false))
				.silentRun();
		})

		it('should call removeFavourite endpoint with 404 and revert change', async () => {
			mockServer
			.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/favourites?ids=${containerId}`)
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
		const mockContainersWithoutStats = prepareContainersData(mockContainers).map(
			(container) => omit(container, ['views', 'defaultView', 'surveyPoint', 'angleFromNorth', 'desc'])
		);

		it('should fetch containers data', async () => {
			mockServer
			.get(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
			.reply(200, {
				containers: mockContainersBaseResponse
			});

			await expectSaga(ContainersSaga.default)
				.dispatch(ContainersActions.fetchContainers(teamspace, projectId))
				.put(ContainersActions.fetchContainersSuccess(projectId, mockContainersWithoutStats))
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
				unit: container.unit
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
				.silentRun();
		})

		it('should fetch container views', async () => {
			mockContainers.forEach((container) => {
				mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${container._id}/views`)
				.reply(200, prepareMockViewsReply(container));
			});

			await expectSaga(ContainersSaga.default)
				.dispatch(ContainersActions.fetchContainerViews(teamspace, projectId, mockContainers[0]._id))
				.dispatch(ContainersActions.fetchContainerViews(teamspace, projectId, mockContainers[1]._id))
				.put(ContainersActions.fetchContainerViewsSuccess(
					projectId,
					mockContainers[0]._id,
					prepareMockViewsReply(mockContainers[0]).views)
				).put(ContainersActions.fetchContainerViewsSuccess(
					projectId,
					mockContainers[1]._id,
					prepareMockViewsReply(mockContainers[1]).views)
				)
				.silentRun();
		})

		it('should fetch container settings', async () => {
			mockContainers.forEach((container) => {
				mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${container._id}`)
				.reply(200, prepareMockRawSettingsReply(container));
			});

			await expectSaga(ContainersSaga.default)
				.dispatch(ContainersActions.fetchContainerSettings(teamspace, projectId, mockContainers[0]._id))
				.dispatch(ContainersActions.fetchContainerSettings(teamspace, projectId, mockContainers[1]._id))
				.put(ContainersActions.fetchContainerSettingsSuccess(
					projectId,
					mockContainers[0]._id,
					prepareContainerSettingsForFrontend(prepareMockRawSettingsReply(mockContainers[0])),
				))
				.put(ContainersActions.fetchContainerSettingsSuccess(
					projectId,
					mockContainers[1]._id,
					prepareContainerSettingsForFrontend(prepareMockRawSettingsReply(mockContainers[1])),
				))
				.silentRun();
		})

		it('should call container settings endpoint with 404', async () => {
			const containerId = mockContainers[0]._id;
			mockServer
			.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}`)
			.reply(404);

			await expectSaga(ContainersSaga.default)
				.dispatch(ContainersActions.fetchContainerSettings(teamspace, projectId, containerId))
				.silentRun();
		})
	})

	describe('createContainer', () => {
		const newContainer = { // improve this with containerMockFactory when Issue #2919 resolved
			name: 'Test Container',
			type: 'Other',
			unit: 'mm',
		}

		it('should call createContainer endpoint', async () => {
			mockServer
			.post(`/teamspaces/${teamspace}/projects/${projectId}/containers`, newContainer)
			.reply(200, {
				_id: '12345'
			});
			const container = { ...newContainer, _id: '12345'}

			await expectSaga(ContainersSaga.default)
				.dispatch(ContainersActions.createContainer(teamspace, projectId, newContainer, onSuccess, onError))
				.put(ContainersActions.createContainerSuccess( projectId, container))
				.silentRun();

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		})
		
		it('should call createContainer endpoint with 400', async () => {
			mockServer
			.post(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
			.reply(400);

			await expectSaga(ContainersSaga.default)
				.dispatch(ContainersActions.createContainer(teamspace, projectId, newContainer, onSuccess, onError))
				.silentRun();

			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		})
	})

	describe('updateContainerSettings', () => {
		const mockContainer = containerMockFactory();
		const mockSettings = prepareMockSettingsReply(mockContainer);

		it('should call updateContainerSettings endpoint', async () => {
			mockServer
			.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}`)
			.reply(200);

			await expectSaga(ContainersSaga.default)
				.dispatch(ContainersActions.updateContainerSettings(
					teamspace,
					projectId,
					containerId,
					mockSettings,
					onSuccess,
					onError,
				))
				.put(ContainersActions.updateContainerSettingsSuccess(
					projectId,
					containerId,
					mockSettings,
				))
				.silentRun();

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		})

		it('should call container settings endpoint with 404', async () => {
			const containerId = mockContainer._id;
			mockServer
			.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}`)
			.reply(404);

			await expectSaga(ContainersSaga.default)
				.dispatch(ContainersActions.updateContainerSettings(teamspace, projectId, containerId, mockSettings, onSuccess, onError))
				.silentRun();

			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		})
	})

	describe('deleteContainer', () => {
		it('should call deleteContainer endpoint', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}`)
				.reply(200);

			await expectSaga(ContainersSaga.default)
				.dispatch(ContainersActions.deleteContainer(teamspace, projectId, containerId, onSuccess, onError))
				.put(ContainersActions.deleteContainerSuccess(projectId, containerId))
				.silentRun();
				
			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		})

		it('should call deleteContainer endpoint with 404 and open alert modal', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}`)
				.reply(404);

			await expectSaga(ContainersSaga.default)
				.dispatch(ContainersActions.deleteContainer(teamspace, projectId, containerId, onSuccess, onError))
				.silentRun();

			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		})
	})
})
