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

import { TeamspacesActions } from '@/v5/store/teamspaces/teamspaces.redux';
import { mockServer } from '../../internals/testing/mockServer';
import { quotaMockFactory } from './teamspaces.fixtures';
import { createTestStore } from '../test.helpers';
import { selectTeamspaces } from '@/v5/store/teamspaces/teamspaces.selectors';
import { AddOn } from '@/v5/store/store.types';

describe('Teamspaces: sagas', () => {
	const teamspaceName = 'teamspaceId';
	const teamspace = { name: teamspaceName, isAdmin: true };
	const teamspaces = [teamspace];
	const addOns: AddOn[] = [AddOn.Risks];
	let dispatch, getState, waitForActions;

	beforeEach(() => {
		({ dispatch, getState, waitForActions } = createTestStore());
	});

	describe('fetch', () => {
		it('should fetch teamspaces data and dispatch FETCH_SUCCESS', async () => {
			mockServer
				.get(`/teamspaces`)
				.reply(200, { teamspaces });

			mockServer
				.get(`/teamspaces/${teamspaceName}/addOns`)
				.reply(200, {modules:addOns});

			await waitForActions(() => {
				dispatch(TeamspacesActions.fetch());
			}, [
				TeamspacesActions.setTeamspacesArePending(true),
				TeamspacesActions.fetchAddOnsSuccess(teamspaceName, addOns),
				TeamspacesActions.fetchSuccess(teamspaces),
				TeamspacesActions.setTeamspacesArePending(false),
			]);
		});

		it('should handle teamspaces api error and dispatch FETCH_FAILURE', async () => {
			mockServer
				.get(`/teamspaces`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TeamspacesActions.fetch());
			}, [
				TeamspacesActions.setTeamspacesArePending(true),
				TeamspacesActions.setTeamspacesArePending(false),
			]);

			const teamspacesInStore = selectTeamspaces(getState());
			expect(teamspacesInStore).toEqual([]);
		});
	});

	it('should fetch quota data and dispatch FETCH_QUOTA_SUCCESS', async () => {
		const quota = quotaMockFactory();

		dispatch(TeamspacesActions.fetchSuccess(teamspaces));
		dispatch(TeamspacesActions.setCurrentTeamspace(teamspaceName));

		mockServer
			.get(`/teamspaces/${teamspaceName}/quota`)
			.reply(200, quota);

		await waitForActions(() => {
			dispatch(TeamspacesActions.fetchQuota(teamspaceName));
		}, [TeamspacesActions.fetchQuotaSuccess(teamspaceName, quota)]);
	});
});
