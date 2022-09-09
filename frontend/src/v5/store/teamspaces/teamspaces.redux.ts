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

import { produceAll } from '@/v5/helpers/reducers.helper';
import { Action } from 'redux';
import { createActions, createReducer } from 'reduxsauce';
import { Constants } from '../../helpers/actions.helper';

export const { Types: TeamspacesTypes, Creators: TeamspacesActions } = createActions({
	fetch: [],
	fetchSuccess: ['teamspaces'],
	fetchQuota: ['teamspace'],
	fetchQuotaSuccess: ['teamspace', 'quota'],
	setCurrentTeamspace: ['currentTeamspace'],
}, { prefix: 'TEAMSPACES2/' }) as { Types: Constants<ITeamspacesActionCreators>; Creators: ITeamspacesActionCreators };

export const INITIAL_STATE: ITeamspacesState = {
	teamspaces: [],
	currentTeamspace: null,
	quota: {},
};

export const setCurrentTeamspace = (state, { currentTeamspace }: SetCurrentTeamspaceAction) => {
	state.currentTeamspace = currentTeamspace;
};

export const fetchSuccess = (state, { teamspaces }: FetchSuccessAction) => {
	state.teamspaces = teamspaces;
};

export const fetchQuotaSuccess = (state, { teamspace, quota }: FetchQuotaSuccessAction) => {
	state.quota[teamspace] = quota;
};

export const teamspacesReducer = createReducer(INITIAL_STATE, produceAll({
	[TeamspacesTypes.FETCH_SUCCESS]: fetchSuccess,
	[TeamspacesTypes.FETCH_QUOTA_SUCCESS]: fetchQuotaSuccess,
	[TeamspacesTypes.SET_CURRENT_TEAMSPACE]: setCurrentTeamspace,
}));

/**
 * Types
 */
export interface ITeamspacesState {
	teamspaces: ITeamspace[];
	quota: Record<string, Quota>;
	currentTeamspace: string;
}

export type QuotaUnit = {
	available: number | string;
	used: number;
};

export type Quota = {
	freeTier: boolean;
	expiryDate: number
	data: QuotaUnit,
	seats: QuotaUnit
};

export interface ITeamspace {
	name: string;
	isAdmin: boolean;
}

export type FetchAction = Action<'FETCH'>;
export type FetchSuccessAction = Action<'FETCH_SUCCESS'> & { teamspaces: ITeamspace[] };
export type FetchQuotaAction = Action<'FETCH_QUOTA'> & { teamspace: string };
export type FetchQuotaSuccessAction = Action<'FETCH_QUOTA_SUCCESS'> & { teamspace: string, quota: Quota };
export type SetCurrentTeamspaceAction = Action<'SET_CURRENT_TEAMSPACE'> & { currentTeamspace: string };

export interface ITeamspacesActionCreators {
	fetch: () => FetchAction;
	fetchSuccess: (teamspaces: ITeamspace[]) => FetchSuccessAction;
	setCurrentTeamspace: (teamspace: string) => SetCurrentTeamspaceAction;
	fetchQuota: (teamspace: string) => FetchQuotaAction;
	fetchQuotaSuccess: (teamspace: string, quota: Quota) => FetchQuotaSuccessAction;
}
