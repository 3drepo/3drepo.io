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
import { AddOns } from '../store.types';

export const { Types: TeamspacesTypes, Creators: TeamspacesActions } = createActions({
	fetch: [],
	fetchSuccess: ['teamspaces'],
	fetchQuota: ['teamspace'],
	fetchQuotaSuccess: ['teamspace', 'quota'],
	setUsedQuotaSeats: ['teamspace', 'seats'],
	setCurrentTeamspace: ['currentTeamspace'],
	setTeamspacesArePending: ['teamspacesArePending'],
	fetchAddOnsSuccess: ['teamspace', 'addOns'],
	fetchActivityLog: ['teamspace', 'startDate', 'endDate'],
}, { prefix: 'TEAMSPACES2/' }) as { Types: Constants<ITeamspacesActionCreators>; Creators: ITeamspacesActionCreators };

export const INITIAL_STATE: TeamspacesState = {
	teamspaces: [],
	currentTeamspace: null,
	quota: {},
	teamspacesArePending: false,
	addOns: {},
};

export const setCurrentTeamspace = (state, { currentTeamspace }: SetCurrentTeamspaceAction) => {
	state.currentTeamspace = currentTeamspace;
};

export const setTeamspacesArePending = (state, { teamspacesArePending }: SetTeamspacesArePendingAction) => {
	state.teamspacesArePending = teamspacesArePending;
};

export const fetchSuccess = (state, { teamspaces }: FetchSuccessAction) => {
	state.teamspaces = teamspaces;
};

export const fetchQuotaSuccess = (state, { teamspace, quota }: FetchQuotaSuccessAction) => {
	state.quota[teamspace] = quota;
};

export const setUsedQuotaSeats = (state, { teamspace, seats }: SetUsedQuotaSeatsAction) => {
	state.quota[teamspace].seats.used = seats;
};

export const fetchAddOnsSuccess = (state: TeamspacesState, { teamspace, addOns }: FetchAddOnsSuccessAction) => {
	state.addOns[teamspace] = addOns;
};

export const teamspacesReducer = createReducer(INITIAL_STATE, produceAll({
	[TeamspacesTypes.FETCH_SUCCESS]: fetchSuccess,
	[TeamspacesTypes.FETCH_QUOTA_SUCCESS]: fetchQuotaSuccess,
	[TeamspacesTypes.SET_CURRENT_TEAMSPACE]: setCurrentTeamspace,
	[TeamspacesTypes.SET_TEAMSPACES_ARE_PENDING]: setTeamspacesArePending,
	[TeamspacesTypes.SET_USED_QUOTA_SEATS]: setUsedQuotaSeats,
	[TeamspacesTypes.FETCH_ADD_ONS_SUCCESS]: fetchAddOnsSuccess,
}));

/**
 * Types
 */
export interface TeamspacesState {
	teamspaces: ITeamspace[];
	quota: Record<string, Quota>;
	currentTeamspace: string;
	teamspacesArePending: boolean;
	addOns: Record<string, AddOns>;
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
export type SetTeamspacesArePendingAction = Action<'SET_TEAMSPACES_ARE_PENDING'> & { teamspacesArePending: boolean };
export type SetUsedQuotaSeatsAction = Action<'SET_USED_QUOTA_SEATS'> & { teamspace: string, seats: number };
export type FetchAddOnsAction = Action<'FETCH_ADD_ONS'> & { teamspace: string };
export type FetchAddOnsSuccessAction = Action<'FETCH_ADD_ONS_SUCCESS'> & { teamspace: string, addOns: AddOns };
export type FetchActivityLogAction = Action<'FETCH_ACTIVITY_LOG'> & { teamspace: string, startDate?: Date, endDate?: Date };

export interface ITeamspacesActionCreators {
	fetch: () => FetchAction;
	fetchSuccess: (teamspaces: ITeamspace[]) => FetchSuccessAction;
	setCurrentTeamspace: (teamspace: string) => SetCurrentTeamspaceAction;
	setTeamspacesArePending: (teamspacesArePending: boolean) => SetTeamspacesArePendingAction;
	fetchQuota: (teamspace: string) => FetchQuotaAction;
	fetchQuotaSuccess: (teamspace: string, quota: Quota) => FetchQuotaSuccessAction;
	setUsedQuotaSeats: (teamspace: string, seats: number) => SetUsedQuotaSeatsAction;
	fetchAddOnsSuccess: (teamspace: string, addOns: AddOns) => FetchAddOnsSuccessAction;
	fetchActivityLog: (teamspace: string, startDate?: Date, endDate?: Date) => FetchActivityLogAction;
}
