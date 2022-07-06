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
	prepareMockRawSettingsReply,
	prepareMockSettingsReply,
	prepareMockViewsReply,
} from './federations.fixtures';
import { prepareFederationsData } from '@/v5/store/federations/federations.helpers';
import { FederationStats, IFederation } from '@/v5/store/federations/federations.types';
import { prepareMockContainers } from './federations.fixtures';
import { prepareFederationSettingsForFrontend } from '@/v5/store/federations/federations.helpers';
import { alertAction } from '../test.helpers';

// TODO: review this
// There is something weird as how the tests are setup
// the ALWAYS timeout, with a lower value these run faster
// but if the value is too low it wont actually finish the saga so it will fail
expectSaga.DEFAULT_TIMEOUT = 100;

describe('Federations: sagas', () => {
	const teamspace = 'teamspace';
	const projectId = 'projectId';
	const federationId = 'federationId';

	beforeAll(() => {
		// Silence console.log here becouse faker throws an irrelevant warning
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
		const newFederationContainers = ['containerIdOne', 'containerIdTwo'];

		it('should successfully create a new federation', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(200, { _id: federationId });

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.createFederation(teamspace, projectId, newFederation, newFederationContainers))
				.put(FederationsActions.createFederationSuccess(projectId, newFederation, federationId))
				.put(FederationsActions.updateFederationContainers(teamspace, projectId, federationId, newFederationContainers))
				.silentRun();
		});
		it('should successfully create a new federation with no containers', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(200, { _id: federationId });

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.createFederation(teamspace, projectId, newFederation))
				.put(FederationsActions.createFederationSuccess(projectId, newFederation, federationId))
				.silentRun();
		});
		it('should call error dialog when create federation errors', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(400);

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.createFederation(teamspace, projectId, newFederation))
				.put.like(alertAction('trying to create federation'))
				.silentRun();
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
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/federations/favourites`)
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
			const prepareMockStatsReply = (federation: IFederation): FederationStats => ({
				containers: federation.containers,
				tickets: {
					issues: federation.issues,
					risks: federation.risks,
				},
				lastUpdated: federation.lastUpdated.valueOf(),
				category: federation.category,
				status: federation.status,
				code: federation.code,
			})

			mockFederations.forEach((federation) => {
				mockServer
					.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federation._id}/stats`)
					.reply(200, prepareMockStatsReply(federation));
			})

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.fetchFederationStats(teamspace, projectId, mockFederations[0]._id))
				.dispatch(FederationsActions.fetchFederationStats(teamspace, projectId, mockFederations[1]._id))
				.put(FederationsActions.fetchFederationStatsSuccess(projectId, mockFederations[0]._id, prepareMockStatsReply(mockFederations[0])))
				.put(FederationsActions.fetchFederationStatsSuccess(projectId, mockFederations[1]._id, prepareMockStatsReply(mockFederations[1])))
				.silentRun();
		})

		it('should call federations endpoint with 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(404);

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
			))
			.put(FederationsActions.updateFederationSettingsSuccess(
				projectId,
				federationId,
				mockSettings,
			))
			.silentRun();
		})
	})

	describe('deleteFederation', () => {
		const onSuccess = jest.fn();
		const onError = jest.fn();
		it('should call deleteFederation endpoint', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}`)
				.reply(200);

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.deleteFederation(teamspace, projectId, federationId, onSuccess, onError))
				.put(FederationsActions.deleteFederationSuccess(projectId, federationId))
				.silentRun();
			
			expect(onSuccess).toBeCalled();
		})

		it('should call deleteFederation endpoint with 404 and open alert modal', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}`)
				.reply(404);

			await expectSaga(FederationsSaga.default)
				.dispatch(FederationsActions.deleteFederation(teamspace, projectId, federationId, onSuccess, onError))
				.silentRun();

			expect(onSuccess).toBeCalled();
		})
	})
})

