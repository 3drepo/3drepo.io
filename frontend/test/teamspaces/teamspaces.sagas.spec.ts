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

import { TeamspacesActions } from '@/v5/store/teamspaces/teamspaces.redux';
import * as TeamspacesSaga from '@/v5/store/teamspaces/teamspaces.sagas';
import { mockServer } from '../../internals/testing/mockServer';
import { quotaMockFactory } from './teamspaces.fixtures';

describe('Teamspaces: sagas', () => {
	const teamspaceName = 'teamspaceId';
	const teamspace = { name: teamspaceName, isAdmin: true };
	const teamspaces = [teamspace];

	describe('fetch', () => {
		it('should fetch teamspaces data and dispatch FETCH_SUCCESS', async () => {
			mockServer
				.get(`/teamspaces`)
				.reply(200, { teamspaces });

			await expectSaga(TeamspacesSaga.default)
					.dispatch(TeamspacesActions.fetch())
					.dispatch(TeamspacesActions.setTeamspacesArePending(true))
					.put(TeamspacesActions.fetchSuccess(teamspaces))
					.dispatch(TeamspacesActions.setTeamspacesArePending(false))
					.silentRun();
		});

		it('should handle teamspaces api error and dispatch FETCH_FAILURE', async () => {
			mockServer
				.get(`/teamspaces`)
				.reply(404);

			await expectSaga(TeamspacesSaga.default)
				.dispatch(TeamspacesActions.fetch())
				.dispatch(TeamspacesActions.setTeamspacesArePending(true))
				.dispatch(TeamspacesActions.setTeamspacesArePending(false))
				.silentRun();
		});
	});

	it('should fetch quota data and dispatch FETCH_QUOTA_SUCCESS', async () => {
		const teamspace = 'MyTeamspace';
		const quota = quotaMockFactory();

		mockServer
			.get(`/teamspaces/${teamspace}/quota`)
			.reply(200, quota);

		await expectSaga(TeamspacesSaga.default)
				.dispatch(TeamspacesActions.fetchQuota(teamspace))
				.put(TeamspacesActions.fetchQuotaSuccess(teamspace, quota))
				.silentRun();
	});
});
