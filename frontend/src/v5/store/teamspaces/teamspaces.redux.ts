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

import { createActions, createReducer } from 'reduxsauce';
import { Constants } from '../common/actions.helper';

export interface ITeamspace {
	name: string;
	isAdmin: boolean;
}

export interface ITeamspacesActions {
	fetch: () => any;
	fetchSuccess: (teamspaces: ITeamspace[]) => any;
	fetchFailure: () => any;
}

export const { Types: TeamspacesTypes, Creators: TeamspacesActions } = createActions({
	fetch: [],
	fetchSuccess: ['teamspaces'],
	fetchFailure: [],
}, { prefix: 'TEAMSPACES2/' }) as { Types: Constants<ITeamspacesActions>; Creators: ITeamspacesActions };

interface ITeamspacesState {
	teamspaces: ITeamspace[];
}

export const INITIAL_STATE: ITeamspacesState = {
	teamspaces: [],
};

export const fetchSuccess = (state = INITIAL_STATE, { teamspaces }) => ({ ...state, teamspaces });

export const reducer = createReducer(INITIAL_STATE, {
	[TeamspacesTypes.FETCH_SUCCESS]: fetchSuccess,
});
