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

import { ContainersActions } from '@/v5/store/containers/containers.redux';
import { mockServer } from '../../internals/testing/mockServer';
import { pick } from 'lodash';
import { prepareSingleContainerData } from '@/v5/store/containers/containers.helpers';
import { containerMockFactory, prepareMockSettingsReply, prepareMockStats } from './containers.fixtures';
import { omit } from 'lodash';
import { prepareMockRawSettingsReply } from './containers.fixtures';
import { createTestStore } from '../test.helpers';
import { prepareContainerSettingsForFrontend } from './../../src/v5/store/containers/containers.helpers';
import { ProjectsActions } from '@/v5/store/projects/projects.redux';
import { selectContainerById, selectContainers } from '@/v5/store/containers/containers.selectors';
import { DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';
import { getWaitablePromise } from '@/v5/helpers/async.helpers';

describe('Containers: sagas', () => {
	const teamspace = 'teamspace';
	const projectId = 'projectId';
	const containerId = 'containerId';
	let onSuccess, onError;
	let dispatch, getState, waitForActions;
	const mockContainer = containerMockFactory({ _id: containerId }) as any;

	const populateStore = (container = mockContainer) => {
		dispatch(ContainersActions.fetchContainersSuccess(projectId, [container]));
	};

	beforeEach(() => {
		onSuccess = jest.fn();
		onError = jest.fn();
		({ dispatch, getState, waitForActions } = createTestStore());
		dispatch(ProjectsActions.setCurrentProject(projectId));
		dispatch(ContainersActions.fetchContainersSuccess(projectId, []));
	})

	describe('addFavourite', () => {
		beforeEach(() => populateStore({ ...mockContainer, isFavourite: false }));

		it('should call addFavourite endpoint', async () => {
			const { resolve, promiseToResolve } = getWaitablePromise();
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/favourites`)
				.reply(200, resolve)

			await Promise.all([
				waitForActions(() => {
					dispatch(ContainersActions.addFavourite(teamspace, projectId, containerId))
				}, [ContainersActions.setFavouriteSuccess(projectId, containerId, true)]),
				promiseToResolve,
			]);
		})

		it('should call addFavourite endpoint with 404 and revert change', async () => {
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/favourites`)
				.reply(404)

			await waitForActions(() => {
				dispatch(ContainersActions.addFavourite(teamspace, projectId, containerId))
			}, [
				ContainersActions.setFavouriteSuccess(projectId, containerId, true),
				DialogsTypes.OPEN,
				ContainersActions.setFavouriteSuccess(projectId, containerId, false),
			])

			const { isFavourite } = selectContainerById(getState(), containerId);
			expect(isFavourite).toBeFalsy();
		})
	})

	describe('removeFavourite', () => {
		beforeEach(() => populateStore({ ...mockContainer, isFavourite: true }));
		const { resolve, promiseToResolve } = getWaitablePromise();
		it('should call removeFavourite endpoint', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/favourites?ids=${containerId}`)
				.reply(200, resolve)

			await Promise.all([
				waitForActions(() => {
					dispatch(ContainersActions.removeFavourite(teamspace, projectId, containerId))
				}, [ContainersActions.setFavouriteSuccess(projectId, containerId, false)]),
				promiseToResolve,
			]);
		})

		it('should call removeFavourite endpoint with 404 and revert change', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/favourites?ids=${containerId}`)
				.reply(404)

			await waitForActions(() => {
				dispatch(ContainersActions.removeFavourite(teamspace, projectId, containerId))
			}, [
				ContainersActions.setFavouriteSuccess(projectId, containerId, false),
				DialogsTypes.OPEN,
				ContainersActions.setFavouriteSuccess(projectId, containerId, true),
			])

			const { isFavourite } = selectContainerById(getState(), containerId);
			expect(isFavourite).toBeTruthy();
		})
	})

	describe('fetchContainers', () => {
		const stats = prepareMockStats();

		it('should fetch containers data', async () => {			
			const mockContainerWithoutStats = omit(
				prepareSingleContainerData(mockContainer),
				['views', 'defaultView', 'surveyPoint', 'angleFromNorth', 'desc']
			);

			const mockContainerBaseResponse = pick(mockContainer, ['_id', 'name', 'role', 'isFavourite']);

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
				.reply(200, {
					containers: [mockContainerBaseResponse]
				});

			await waitForActions(() => {
				dispatch(ContainersActions.fetchContainers(teamspace, projectId));
			}, [
				ContainersActions.fetchContainersSuccess(projectId, [mockContainerWithoutStats]),
				ContainersActions.fetchContainerStats(teamspace, projectId, mockContainer._id),
			]);
		})

		it('should call fetch containers data endpoint with 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
				.reply(404);

			await waitForActions(() => {
				dispatch(ContainersActions.fetchContainers(teamspace, projectId));
			}, [DialogsTypes.OPEN]);
			const containersInStore = selectContainers(getState());
			expect(containersInStore).toEqual([]);
		})

		it('should fetch stats', async () => {
			populateStore();
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/stats`)
				.reply(200, stats);

			await waitForActions(() => {
				dispatch(ContainersActions.fetchContainerStats(teamspace, projectId, containerId));
			}, [ContainersActions.fetchContainerStatsSuccess(projectId, containerId, stats)]);
		})

		it('should call fetch container stats endpoint with 401', async () => {
			populateStore();
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/stats`)
				.reply(401);

			await waitForActions(() => {
				dispatch(ContainersActions.fetchContainerStats(teamspace, projectId, containerId));
			}, [DialogsTypes.OPEN]);

			const containersInStore = selectContainers(getState());
			expect(containersInStore).toEqual([mockContainer]);
		})

		it('should fetch container views', async () => {
			populateStore();
			const { views } = containerMockFactory();
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/views`)
				.reply(200, { views });

			await waitForActions(() => {
				dispatch(ContainersActions.fetchContainerViews(teamspace, projectId, containerId));
			}, [
				ContainersActions.fetchContainerViewsSuccess(
					projectId,
					containerId,
					views,
				)
			]);
		})

		it('should fetch container settings', async () => {
			populateStore();
			const settings = prepareMockRawSettingsReply(containerMockFactory());
			const frontendSettings = prepareContainerSettingsForFrontend(settings);

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}`)
				.reply(200, settings);

			await waitForActions(() => {
				dispatch(ContainersActions.fetchContainerSettings(teamspace, projectId, containerId));
			}, [
				ContainersActions.fetchContainerSettingsSuccess(
					projectId,
					containerId,
					frontendSettings,
				),
			]);
		})

		it('should call fetch container settings endpoint with 404', async () => {
			populateStore();
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}`)
				.reply(404);

			await waitForActions(() => {
				dispatch(ContainersActions.fetchContainerSettings(teamspace, projectId, containerId));
			}, [DialogsTypes.OPEN]);

			const containersInStore = selectContainers(getState());
			expect(containersInStore).toEqual([mockContainer]);
		})
	})

	describe('createContainer', () => {
		const newContainer = {
			name: 'Test Container',
			type: 'Other',
			unit: 'mm',
		};
		it('should call createContainer endpoint', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers`, newContainer)
				.reply(200, { _id: containerId });

			const fetchedContainer = { ...newContainer, _id: containerId }

			await waitForActions(() => {
				dispatch(ContainersActions.createContainer(teamspace, projectId, newContainer, onSuccess, onError))
			}, [ContainersActions.createContainerSuccess(projectId, fetchedContainer)]);

			expect(onError).not.toHaveBeenCalled();
			expect(onSuccess).toHaveBeenCalled();	
		})
		
		it('should call createContainer endpoint with 400', async () => {
			const { resolve, promiseToResolve } = getWaitablePromise();
			
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
				.reply(400);

			dispatch(ContainersActions.createContainer(
				teamspace,
				projectId,
				newContainer,
				onSuccess,
				() => { onError(); resolve()},
			));

			await promiseToResolve;

			const containersInStore = selectContainers(getState());

			expect(containersInStore).toEqual([]);
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		})
	})

	describe('updateContainerSettings', () => {
		beforeEach(() => populateStore());
		const mockSettings = prepareMockSettingsReply(mockContainer);

		it('should call updateContainerSettings endpoint', async () => {
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}`)
				.reply(200);
				
			await waitForActions(() => {
				dispatch(ContainersActions.updateContainerSettings(
					teamspace,
					projectId,
					containerId,
					mockSettings,
					onSuccess,
					onError,
				));
			}, [
				ContainersActions.updateContainerSettingsSuccess(
					projectId,
					containerId,
					mockSettings,
				)
			]);
			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		})

		it('should call update container settings endpoint with 404', async () => {
			const { resolve, promiseToResolve } = getWaitablePromise();

			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}`)
				.reply(404);
				
			dispatch(ContainersActions.updateContainerSettings(
				teamspace,
				projectId,
				containerId,
				mockSettings,
				onSuccess,
				() => { onError(); resolve(); },
			));

			await promiseToResolve;

			const containersInStore = selectContainers(getState());
			expect(containersInStore).toEqual([mockContainer]);

			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		})
	})

	describe('deleteContainer', () => {
		beforeEach(() => populateStore());
		
		it('should call deleteContainer endpoint', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}`)
				.reply(200);

			await waitForActions(() => {
				dispatch(ContainersActions.deleteContainer(teamspace, projectId, containerId, onSuccess, onError));
			}, [ContainersActions.deleteContainerSuccess(projectId, containerId)]);

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		})

		it('should call deleteContainer endpoint with 404', async () => {
			const { resolve, promiseToResolve } = getWaitablePromise();
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}`)
				.reply(404);

			const containersBefore = selectContainers(getState());

			dispatch(ContainersActions.deleteContainer(
				teamspace,
				projectId,
				containerId,
				onSuccess,
				() => { onError(); resolve(); },
			));

			await promiseToResolve;

			const containersAfter = selectContainers(getState());
			expect(containersBefore).toEqual(containersAfter);
				
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		})
	})
})
