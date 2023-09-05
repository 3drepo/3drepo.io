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

import * as FederationsSaga from '@/v5/store/federations/federations.sagas';
import { expectSaga } from 'redux-saga-test-plan';
import { FederationsActions } from '@/v5/store/federations/federations.redux';
import { mockServer } from '../../internals/testing/mockServer';
import { omit, times } from 'lodash';
import {
	federationMockFactory,
	prepareMockFederationStatsReply,
	prepareMockRawSettingsReply,
	prepareMockSettingsReply,
	prepareMockViewsReply,
} from './federations.fixtures';
import { prepareFederationsData } from '@/v5/store/federations/federations.helpers';
import { prepareMockContainers } from './federations.fixtures';
import { prepareFederationSettingsForFrontend } from '@/v5/store/federations/federations.helpers';

// TODO: review this
// There is something weird as how the tests are setup
// the ALWAYS timeout, with a lower value these run faster
// but if the value is too low it wont actually finish the saga so it will fail
expectSaga.DEFAULT_TIMEOUT = 100;

describe('Federations: sagas', () => {
	const teamspace = 'teamspace';
	const projectId = 'projectId';
	const federationId = 'federationId';
	let onSuccess, onError;

	beforeEach(() => {
		onSuccess = jest.fn();
		onError = jest.fn();
	})

	beforeAll(() => {
		// Silence console.log here because faker throws an irrelevant warning
		jest.spyOn(console, 'log').mockImplementation(jest.fn());
		jest.spyOn(console, 'debug').mockImplementation(jest.fn());
	})

	afterAll(() => {
		jest.spyOn(console, 'log').mockRestore();
		jest.spyOn(console, 'debug').mockRestore();
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

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.createFederation(teamspace, projectId, newFederation, newFederationContainers, onSuccess, onError))
				.put(FederationsActions.createFederationSuccess(projectId, newFederation, federationId))
				.put(FederationsActions.updateFederationContainers(teamspace, projectId, federationId, newFederationContainers))
				.put(FederationsActions.fetchFederationStats(teamspace, projectId, federationId))
				.silentRun();

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		});
		it('should successfully create a new federation with no containers', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(200, { _id: federationId });

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.createFederation(teamspace, projectId, newFederation, [], onSuccess, onError))
				.put(FederationsActions.createFederationSuccess(projectId, newFederation, federationId))
				.silentRun();

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		});
		it('should call error dialog when create federation errors', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(400);

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.createFederation(teamspace, projectId, newFederation, [], onSuccess, onError))
				.silentRun();

			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		});
	});

	describe('addFavourite', () => {
		it('should call addFavourite endpoint', async () => {
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/federations/favourites`)
				.reply(200)

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.addFavourite(teamspace, projectId, federationId))
				.put(FederationsActions.setFavouriteSuccess(projectId, federationId, true))
				.silentRun();
		})
	})

	describe('removeFavourite', () => {
		it('should call removeFavourite endpoint', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/federations/favourites?ids=${federationId}`)
				.reply(200)

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.removeFavourite(teamspace, projectId, federationId))
				.put(FederationsActions.setFavouriteSuccess(projectId, federationId, false))
				.silentRun();
		})
	})

	describe('fetchFederations', () => {
		const mockFederations = times(2, () => federationMockFactory());
		const mockFederationsWithoutStats = prepareFederationsData(mockFederations).map(
			(federation) => omit(federation, ['views', 'surveyPoint', 'angleFromNorth', 'defaultView', 'unit'])
		);

		it('should fetch federations data', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(200, {
					federations: mockFederationsWithoutStats
				});

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.fetchFederations(teamspace, projectId))
				.put(FederationsActions.fetchFederationsSuccess(projectId, mockFederationsWithoutStats))
				.put(FederationsActions.fetchFederationStats(teamspace, projectId, mockFederations[0]._id))
				.put(FederationsActions.fetchFederationStats(teamspace, projectId, mockFederations[1]._id))
				.silentRun();
		})

		it('should fetch stats', async () => {
			mockFederations.forEach((federation) => {
				mockServer
					.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federation._id}/stats`)
					.reply(200, prepareMockFederationStatsReply(federation));
			})

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.fetchFederationStats(teamspace, projectId, mockFederations[0]._id))
				.dispatch(FederationsActions.fetchFederationStats(teamspace, projectId, mockFederations[1]._id))
				.put(FederationsActions.fetchFederationStatsSuccess(projectId, mockFederations[0]._id, prepareMockFederationStatsReply(mockFederations[0])))
				.put(FederationsActions.fetchFederationStatsSuccess(projectId, mockFederations[1]._id, prepareMockFederationStatsReply(mockFederations[1])))
				.silentRun();
		})

		it('should call federations endpoint with 400', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(400);

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.fetchFederations(teamspace, projectId))
				.silentRun();
		})

		it('should call updateFederationContainers endpoint', async () => {
			const mockContainers = prepareMockContainers();
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/revisions`)
				.reply(200);

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.updateFederationContainers(teamspace, projectId, federationId, mockContainers))
				.put(FederationsActions.updateFederationContainersSuccess(projectId, federationId, mockContainers))
				.silentRun();
		})

		it('should fetch federation views', async () => {
			mockFederations.forEach((federation) => {
				mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federation._id}/views`)
				.reply(200, prepareMockViewsReply(federation));
			});

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.fetchFederationViews(teamspace, projectId, mockFederations[0]._id))
				.dispatch(FederationsActions.fetchFederationViews(teamspace, projectId, mockFederations[1]._id))
				.put(FederationsActions.fetchFederationViewsSuccess(
					projectId,
					mockFederations[0]._id,
					prepareMockViewsReply(mockFederations[0]).views)
				).put(FederationsActions.fetchFederationViewsSuccess(
					projectId,
					mockFederations[1]._id,
					prepareMockViewsReply(mockFederations[1]).views)
				)
				.silentRun();
		})

		it('should fetch federation settings', async () => {
			mockFederations.forEach((federation) => {
				mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federation._id}`)
				.reply(200, prepareMockRawSettingsReply(federation));
			});

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.fetchFederationSettings(teamspace, projectId, mockFederations[0]._id))
				.dispatch(FederationsActions.fetchFederationSettings(teamspace, projectId, mockFederations[1]._id))
				.put(FederationsActions.fetchFederationSettingsSuccess(
					projectId,
					mockFederations[0]._id,
					prepareFederationSettingsForFrontend(prepareMockRawSettingsReply(mockFederations[0])),
				))
				.put(FederationsActions.fetchFederationSettingsSuccess(
					projectId,
					mockFederations[1]._id,
					prepareFederationSettingsForFrontend(prepareMockRawSettingsReply(mockFederations[1])),
				))
				.silentRun();
		})
	})

	describe('updateFederationSettings', () => {
		const mockFederation = federationMockFactory();
		const mockSettings = prepareMockSettingsReply(mockFederation);

		it('should call updateFederationSettings endpoint', async () => {
			mockServer
			.patch(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}`)
			.reply(200);

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.updateFederationSettings(
					teamspace,
					projectId,
					federationId,
					mockSettings,
					onSuccess,
					onError,
				))
				.put(FederationsActions.updateFederationSettingsSuccess(
					projectId,
					federationId,
					mockSettings,
				))
				.silentRun();

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		})

		it('should call updateFederationSettings endpoint with 400', async () => {
			mockServer
			.patch(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}`)
			.reply(400);

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.updateFederationSettings(
					teamspace,
					projectId,
					federationId,
					mockSettings,
					onSuccess,
					onError,
				))
				.silentRun();

			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		})
	})

	describe('deleteFederation', () => {
		it('should call deleteFederation endpoint', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}`)
				.reply(200);

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.deleteFederation(teamspace, projectId, federationId, onSuccess, onError))
				.put(FederationsActions.deleteFederationSuccess(projectId, federationId))
				.silentRun();

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		})

		it('should call deleteFederation endpoint with 400', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}`)
				.reply(400);

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.deleteFederation(teamspace, projectId, federationId, onSuccess, onError))
				.silentRun();

			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		})
	})
})

