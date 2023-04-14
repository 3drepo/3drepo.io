/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import reducers from '@/v5/store/reducers';
import { createStore, combineReducers } from 'redux';
import { times } from 'lodash';
import { selectCurrentQuota, selectCurrentTeamspace, selectIsTeamspaceAdmin, selectTeamspaces } from '@/v5/store/teamspaces/teamspaces.selectors';
import { quotaMockFactory, teamspaceMockFactory } from './teamspaces.fixtures';


describe('Teamspaces: store', () => {
	let dispatch, getState = null;

	beforeEach(() => {
		// resetting the store //
		const store = createStore(combineReducers(reducers));
		dispatch = store.dispatch;
		getState = store.getState;
	});

	it('should fetch teamspaces successfully', () => {
		const mockTeamspaces = times(5, () => teamspaceMockFactory());
		dispatch(TeamspacesActions.fetchSuccess(mockTeamspaces));
		const teamspaces = selectTeamspaces(getState());
		expect(teamspaces).toEqual(mockTeamspaces);
	});

	it('should set the current teamspace successfully', () => {
		const mockTeamspaces = times(5, () => teamspaceMockFactory());
		dispatch(TeamspacesActions.setCurrentTeamspace(mockTeamspaces[3].name));
		const currentTeamspace = selectCurrentTeamspace(getState());
		expect(currentTeamspace).toEqual(mockTeamspaces[3].name);
	});

	it('should be loaded and retrievable', () => {
		const teamspace = teamspaceMockFactory();
		const quota = quotaMockFactory();
		
		dispatch(TeamspacesActions.setCurrentTeamspace(teamspace.name));
		dispatch(TeamspacesActions.fetchQuotaSuccess(teamspace.name, quota));
		
		expect(selectCurrentQuota(getState())).toBe(quota);
		
		dispatch(TeamspacesActions.setCurrentTeamspace('anotherTeamspace'));
		expect(selectCurrentQuota(getState())).toBeFalsy();
	})
	
	it('should return a users teamspace admin status', () => {
		const adminTeamspace = teamspaceMockFactory({ isAdmin: true });
		const nonAdminTeamspace = teamspaceMockFactory({ isAdmin: false });
		dispatch(TeamspacesActions.fetchSuccess([adminTeamspace, nonAdminTeamspace]));

		dispatch(TeamspacesActions.setCurrentTeamspace(adminTeamspace.name));
		expect(selectIsTeamspaceAdmin(getState())).toBeTruthy();
		
		dispatch(TeamspacesActions.setCurrentTeamspace(nonAdminTeamspace.name));
		expect(selectIsTeamspaceAdmin(getState())).toBeFalsy();
	})

});
