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

import * as faker from 'faker';
import { FederationsActions } from '@/v5/store/federations/federations.redux';
import { mockServer } from '../../internals/testing/mockServer';
import { omit, times } from 'lodash';
import {
	federationMockFactory,
	prepareMockStats,
	prepareMockRawSettingsReply,
	prepareMockSettingsReply,
	prepareMockBaseFederation,
	groupedContainerMockFactory,
} from './federations.fixtures';
import { prepareSingleFederationData } from '@/v5/store/federations/federations.helpers';
import { prepareFederationSettingsForFrontend } from '@/v5/store/federations/federations.helpers';
import { ProjectsActions } from '@/v5/store/projects/projects.redux';
import { selectFederationById, selectFederations } from '@/v5/store/federations/federations.selectors';
import { createTestStore } from '../test.helpers';
import { DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';
import { getWaitablePromise } from '@/v5/helpers/async.helpers';

describe('Federations: sagas', () => {
	const teamspace = 'teamspace';
	const projectId = 'projectId';
	const federationId = 'federationId';
	let onSuccess, onError;
	let dispatch, getState, waitForActions;
	const mockFederation = federationMockFactory({ _id: federationId }) as any;

	const populateStore = (federation = mockFederation) => {
		dispatch(FederationsActions.fetchFederationsSuccess(projectId, [federation]));
	};

	beforeEach(() => {
		onSuccess = jest.fn();
		onError = jest.fn();
		({ dispatch, getState, waitForActions } = createTestStore());
		dispatch(ProjectsActions.setCurrentProject(projectId));
		dispatch(FederationsActions.fetchFederationsSuccess(projectId, []));
	})

	describe('addFavourite', () => {
		beforeEach(() => populateStore({ ...mockFederation, isFavourite: false }));

		it('should call addFavourite endpoint', async () => {
			const { resolve, promiseToResolve } = getWaitablePromise();
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/federations/favourites`)
				.reply(200, resolve)

			await Promise.all([
				waitForActions(() => {
					dispatch(FederationsActions.addFavourite(teamspace, projectId, federationId))
				}, [FederationsActions.setFavouriteSuccess(projectId, federationId, true)]),
				promiseToResolve,
			]);
		})

		it('should call addFavourite endpoint with 404 and revert change', async () => {
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/federations/favourites`)
				.reply(404)

			await waitForActions(() => {
				dispatch(FederationsActions.addFavourite(teamspace, projectId, federationId))
			}, [
				FederationsActions.setFavouriteSuccess(projectId, federationId, true),
				DialogsTypes.OPEN,
				FederationsActions.setFavouriteSuccess(projectId, federationId, false),
			])

			const { isFavourite } = selectFederationById(getState(), federationId);
			expect(isFavourite).toBeFalsy();
		})
	})

	describe('removeFavourite', () => {
		beforeEach(() => populateStore({ ...mockFederation, isFavourite: true }));
		const { resolve, promiseToResolve } = getWaitablePromise();
		it('should call removeFavourite endpoint', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/federations/favourites?ids=${federationId}`)
				.reply(200, resolve)

			await Promise.all([
				waitForActions(() => {
					dispatch(FederationsActions.removeFavourite(teamspace, projectId, federationId))
				}, [FederationsActions.setFavouriteSuccess(projectId, federationId, false)]),
				promiseToResolve,
			]);
		})

		it('should call removeFavourite endpoint with 404 and revert change', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/federations/favourites?ids=${federationId}`)
				.reply(404)

			await waitForActions(() => {
				dispatch(FederationsActions.removeFavourite(teamspace, projectId, federationId))
			}, [
				FederationsActions.setFavouriteSuccess(projectId, federationId, false),
				DialogsTypes.OPEN,
				FederationsActions.setFavouriteSuccess(projectId, federationId, true),
			])

			const { isFavourite } = selectFederationById(getState(), federationId);
			expect(isFavourite).toBeTruthy();
		})
	})

	describe('fetchFederations', () => {
		const stats = prepareMockStats();

		it('should fetch federations data', async () => {
			const mockFederationWithoutStats = omit(
				prepareSingleFederationData(mockFederation),
				['views', 'surveyPoint', 'angleFromNorth', 'defaultView', 'unit']
			);

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(200, { federations: [mockFederationWithoutStats] });

			await waitForActions(() => {
				dispatch(FederationsActions.fetchFederations(teamspace, projectId));
			}, [
				FederationsActions.fetchFederationsSuccess(projectId, [mockFederationWithoutStats]),
				FederationsActions.fetchFederationStats(teamspace, projectId, mockFederation._id),
			]);
		})

		it('should call fetch federations endpoint with 400', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(400);

			await waitForActions(() => {
				dispatch(FederationsActions.fetchFederations(teamspace, projectId));
			}, [DialogsTypes.OPEN]);
		
			const federationsInStore = selectFederations(getState());
			expect(federationsInStore).toEqual([]);
		})

		it('should fetch stats', async () => {
			populateStore();
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/stats`)
				.reply(200, stats);

			await waitForActions(() => {
				dispatch(FederationsActions.fetchFederationStats(teamspace, projectId, federationId));
			}, [FederationsActions.fetchFederationStatsSuccess(projectId, federationId, stats)]);
		})

		it('should call updateFederationContainers endpoint', async () => {
			populateStore();
			const mockContainers = [groupedContainerMockFactory()];
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/revisions`)
				.reply(200);

			await waitForActions(() => {
				dispatch(FederationsActions.updateFederationContainers(teamspace, projectId, federationId, mockContainers))
			}, [FederationsActions.updateFederationContainersSuccess(projectId, federationId, mockContainers)]);
		})

		it('should fetch federation views', async () => {
			const { views, viewslessFederation } = mockFederation;
			populateStore(viewslessFederation);
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/views`)
				.reply(200, { views });

			await waitForActions(() => {
				dispatch(FederationsActions.fetchFederationViews(teamspace, projectId, federationId));
			}, [FederationsActions.fetchFederationViewsSuccess(projectId, federationId, views)]);
		})

		it('should fetch federation settings', async () => {
			populateStore();
			const baseFederation = prepareMockBaseFederation(mockFederation)
			const rawSettings = prepareMockRawSettingsReply(mockFederation);
			const settings = prepareFederationSettingsForFrontend(rawSettings);
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}`)
				.reply(200, rawSettings);
			
			populateStore(baseFederation);
			await waitForActions(() => {
				dispatch(FederationsActions.fetchFederationSettings(teamspace, projectId, federationId))
			}, [FederationsActions.fetchFederationSettingsSuccess(
				projectId,
				federationId,
				settings,
			)]);
		})
	})

	describe('createFederation', () => {
		const newFederation = {
			name: 'New Federation',
			code: 'FED123',
			desc: 'This is a test federation',
			unit: 'cm',
		};
		const newFederationContainers = [{ _id: 'containerIdOne' }, { _id: 'containerIdTwo' }];

		it('should successfully create a new federation', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(200, { _id: federationId });

			await waitForActions(() => {
				dispatch(FederationsActions.createFederation(teamspace, projectId, newFederation, newFederationContainers, onSuccess, onError))
			}, [
				FederationsActions.createFederationSuccess(projectId, newFederation, federationId),
				FederationsActions.updateFederationContainers(teamspace, projectId, federationId, newFederationContainers),
				FederationsActions.fetchFederationStats(teamspace, projectId, federationId),
			]);

			expect(onError).not.toHaveBeenCalled();
			expect(onSuccess).toHaveBeenCalled();
		});

		it('should successfully create a new federation with no containers', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(200, { _id: federationId });

			await waitForActions(() => {
				dispatch(FederationsActions.createFederation(teamspace, projectId, newFederation, [], onSuccess, onError));
			}, [FederationsActions.createFederationSuccess(projectId, newFederation, federationId)])

			const federationsInStore = selectFederations(getState());

			expect(federationsInStore.length).toBe(1);
			expect(federationsInStore[0].containers.length).toBe(0);
			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		});

		it('should call error dialog when create federation errors', async () => {
			const { resolve, promiseToResolve } = getWaitablePromise();

			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(400);

			dispatch(FederationsActions.createFederation(
				teamspace,
				projectId,
				newFederation,
				[],
				onSuccess,
				() => { onError(); resolve(); },
			));

			await promiseToResolve;

			const federationsInStore = selectFederations(getState());

			expect(federationsInStore.length).toBe(0);
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		});
	});

	describe('updateFederationSettings', () => {
		beforeEach(populateStore);

		const settings = prepareMockSettingsReply(federationMockFactory());

		it('should call updateFederationSettings endpoint', async () => {
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}`)
				.reply(200);

			await waitForActions(() => {
				dispatch(FederationsActions.updateFederationSettings(
					teamspace,
					projectId,
					federationId,
					settings,
					onSuccess,
					onError,
				));
			}, [FederationsActions.updateFederationSettingsSuccess(
				projectId,
				federationId,
				settings,
			)]);

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		})

		it('should call updateFederationSettings endpoint with 400', async () => {
			const { resolve, promiseToResolve } = getWaitablePromise();
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}`)
				.reply(400);

			dispatch(FederationsActions.updateFederationSettings(
				teamspace,
				projectId,
				federationId,
				settings,
				onSuccess,
				() => { onError(); resolve(); },
			));

			await promiseToResolve;

			const federationInStore = selectFederationById(getState(), federationId);

			expect(federationInStore).toEqual(mockFederation);
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		})
	})

	describe('deleteFederation', () => {
		beforeEach(populateStore);

		it('should call deleteFederation endpoint', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}`)
				.reply(200);

			await waitForActions(() => {
				dispatch(FederationsActions.deleteFederation(teamspace, projectId, federationId, onSuccess, onError));
			}, [FederationsActions.deleteFederationSuccess(projectId, federationId)]);

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		})

		it('should call deleteFederation endpoint with 400', async () => {
			const { resolve, promiseToResolve } = getWaitablePromise();
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}`)
				.reply(400);

			dispatch(FederationsActions.deleteFederation(
				teamspace,
				projectId,
				federationId,
				onSuccess,
				() => { onError(); resolve(); },
			));

			await promiseToResolve;	

			const federationsInStore = selectFederations(getState());
			expect(federationsInStore.length).toBe(1);

			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		})
	})

	describe('fetchJobs', () => {
		beforeEach(() => populateStore({ ...mockFederation, jobs: undefined }));
	
		test('should fetch jobs', async () => {
			const viewerJobs = times(2, () => faker.random.word());
			const nonViewerJobs = times(2, () => faker.random.word());
			const allJobs = [
				...viewerJobs.map((_id) => ({ _id, isViewer: true })),
				...nonViewerJobs.map(((_id) => ({ _id, isViewer: false }))),
			];
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/jobs?excludeViewers=${true}`)
				.reply(200, { jobs: nonViewerJobs })
	
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/jobs?excludeViewers=${false}`)
				.reply(200, { jobs: [...viewerJobs, ...nonViewerJobs] })
	
			await waitForActions(() => {
				dispatch(FederationsActions.fetchFederationJobs(teamspace, projectId, federationId));
			}, [FederationsActions.updateFederationSuccess(projectId, federationId, { jobs: allJobs })]);
	
			expect(selectFederations(getState())[0].jobs).toEqual(allJobs);
		})
	
		test('should fetch jobs even if there is none', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/jobs?excludeViewers=${true}`)
				.reply(200, { jobs: [] })
	
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/jobs?excludeViewers=${false}`)
				.reply(200, { jobs: [] })
	
	
			await waitForActions(() => {
				dispatch(FederationsActions.fetchFederationJobs(teamspace, projectId, federationId));
			}, [FederationsActions.updateFederationSuccess(projectId, federationId, { jobs: [] })]);
	
			expect(selectFederations(getState())[0].jobs).toEqual([]);
		})
	
		it('should call fetchJobs endpoint with 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/jobs?excludeViewers=${true}`)
				.reply(404);
	
			const federationsBefore = selectFederations(getState());
	
			await waitForActions(() => {
				dispatch(FederationsActions.fetchFederationJobs(teamspace, projectId, federationId));
			}, [DialogsTypes.OPEN]);
	
			const federationsAfter = selectFederations(getState());
			expect(federationsBefore).toEqual(federationsAfter);
		})
	})
	
	describe('fetchUsers', () => {
		beforeEach(() => populateStore({ ...mockFederation, users: undefined }));
	
		test('should fetch users', async () => {
			const viewerUsers = times(2, () => faker.random.word());
			const nonViewerUsers = times(2, () => faker.random.word());
			const allUsers = [
				...viewerUsers.map((user) => ({ user, isViewer: true })),
				...nonViewerUsers.map(((user) => ({ user, isViewer: false }))),
			];
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/members?excludeViewers=${true}`)
				.reply(200, { users: nonViewerUsers })
	
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/members?excludeViewers=${false}`)
				.reply(200, { users: [...viewerUsers, ...nonViewerUsers] })
	
			await waitForActions(() => {
				dispatch(FederationsActions.fetchFederationUsers(teamspace, projectId, federationId));
			}, [FederationsActions.updateFederationSuccess(projectId, federationId, { users: allUsers })]);
	
			expect(selectFederations(getState())[0].users).toEqual(allUsers);
		})
	
		test('should fetch users even if there is none', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/members?excludeViewers=${true}`)
				.reply(200, { users: [] })
	
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/members?excludeViewers=${false}`)
				.reply(200, { users: [] })
	
	
			await waitForActions(() => {
				dispatch(FederationsActions.fetchFederationUsers(teamspace, projectId, federationId));
			}, [FederationsActions.updateFederationSuccess(projectId, federationId, { users: [] })]);
	
			expect(selectFederations(getState())[0].users).toEqual([]);
		})
	
		it('should call fetchUsers endpoint with 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/members?excludeViewers=${true}`)
				.reply(404);
	
			const federationsBefore = selectFederations(getState());
	
			await waitForActions(() => {
				dispatch(FederationsActions.fetchFederationUsers(teamspace, projectId, federationId));
			}, [DialogsTypes.OPEN]);
	
			const federationsAfter = selectFederations(getState());
			expect(federationsBefore).toEqual(federationsAfter);
		})
	})
})

