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

import { mockServer } from '../../internals/testing/mockServer';
import * as RevisionsSaga from '@/v5/store/revisions/revisions.sagas';
import { RevisionsActions } from '@/v5/store/revisions/revisions.redux';

describe('Revisions: sagas', () => {
	const teamspace = 'teamspace';
	const projectId = 'projectId';
	const containerId = 'containerId';

	describe('fetch', () => {
		it('should fetch revisions data and dispatch FETCH_SUCCESS', async () => {
			mockServer
					.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions?showVoid=true`)
					.reply(200, {
						revisions: []
					});

			await expectSaga(RevisionsSaga.default)
					.dispatch(RevisionsActions.fetch(teamspace, projectId, containerId))
					.put(RevisionsActions.setIsPending(containerId, true))
					.put(RevisionsActions.fetchSuccess(containerId, []))
					.put(RevisionsActions.setIsPending(containerId, false))
					.silentRun();
		});

		it('should handle revisions api error', async () => {
			mockServer
					.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions?showVoid=true`)
					.reply(404);

			await expectSaga(RevisionsSaga.default)
					.dispatch(RevisionsActions.fetch(teamspace, projectId, containerId))
					.put(RevisionsActions.setIsPending(containerId, true))
					.put(RevisionsActions.setIsPending(containerId, false))
					.silentRun();
		});
	});

	describe('setVoidStatus', () => {
		const revisionId = 'revisionId';
		const isVoid = true;

		it('should set void status to true and dispatch SET_VOID_STATUS_SUCCESS', async () => {
			mockServer
					.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions/${revisionId}`)
					.reply(200);

			await expectSaga(RevisionsSaga.default)
					.dispatch(RevisionsActions.setVoidStatus(teamspace, projectId, containerId, revisionId, isVoid))
					.put(RevisionsActions.setVoidStatusSuccess(containerId, revisionId, isVoid))
					.silentRun();
		});

		it('should handle api error', async () => {
			mockServer
					.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions/${revisionId}`)
					.reply(404);

			await expectSaga(RevisionsSaga.default)
					.dispatch(RevisionsActions.setVoidStatus(teamspace, projectId, containerId, revisionId, isVoid))
					.silentRun();
		});
	});

})
