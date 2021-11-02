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

import {
	INITIAL_STATE,
	reducer as teamspaceReducer,
	TeamspacesActions
} from '@/v5/store/teamspaces/teamspaces.redux';

describe('Teamspace: redux', () => {
	const defaultState = {
		...INITIAL_STATE,
	};

	describe('on fetchSuccess action', () => {
		it('should set teamspaces', () => {
			const teamspaces = [{
				name: 'teamspace 1',
				isAdmin: true,
			}, {
				name: 'teamspace-2',
				isAdmin: true,
			}, {
				name: 'teamspace_3',
				isAdmin: false,
			}];

			expect(teamspaceReducer(defaultState, TeamspacesActions.fetchSuccess(teamspaces))).toEqual({
				...defaultState,
				teamspaces,
			});
		});
	});
});
