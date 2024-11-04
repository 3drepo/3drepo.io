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
import {
	FederationSettings,
	FederationStats,
	GroupedContainer,
	IFederation,
	NewFederation,
} from '@/v5/store/federations/federations.types';
import { prepareNewFederation, prepareSingleFederationData } from '@/v5/store/federations/federations.helpers';
import { Action } from 'redux';
import { produceAll } from '@/v5/helpers/reducers.helper';
import { Constants } from '../../helpers/actions.helper';
import { TeamspaceAndProjectId, TeamspaceProjectAndFederationId, ProjectAndFederationId, View, SuccessAndErrorCallbacks } from '../store.types';

export const { Types: FederationsTypes, Creators: FederationsActions } = createActions({
	createFederation: ['teamspace', 'projectId', 'newFederation', 'containers', 'onSuccess', 'onError'],
	createFederationSuccess: ['projectId', 'newFederation', 'federationId'],
	addFavourite: ['teamspace', 'projectId', 'federationId'],
	removeFavourite: ['teamspace', 'projectId', 'federationId'],
	setFavouriteSuccess: ['projectId', 'federationId', 'isFavourite'],
	fetchFederations: ['teamspace', 'projectId'],
	fetchFederationsSuccess: ['projectId', 'federations'],
	fetchFederationStats: ['teamspace', 'projectId', 'federationId'],
	fetchFederationStatsSuccess: ['projectId', 'federationId', 'stats'],
	fetchFederationViews: ['teamspace', 'projectId', 'federationId'],
	fetchFederationViewsSuccess: ['projectId', 'federationId', 'views'],
	fetchFederationSettings: ['teamspace', 'projectId', 'federationId'],
	fetchFederationSettingsSuccess: ['projectId', 'federationId', 'settings'],
	fetchFederationUsers: ['teamspace', 'projectId', 'federationId'],
	fetchFederationUsersSuccess: ['projectId', 'federationId', 'users'],
	fetchFederationJobs: ['teamspace', 'projectId', 'federationId'],
	fetchFederationJobsSuccess: ['projectId', 'federationId', 'jobs'],
	updateFederationSettings: ['teamspace', 'projectId', 'federationId', 'settings', 'onSuccess', 'onError'],
	updateFederationSettingsSuccess: ['projectId', 'federationId', 'settings'],
	deleteFederation: ['teamspace', 'projectId', 'federationId', 'onSuccess', 'onError'],
	deleteFederationSuccess: ['projectId', 'federationId'],
	updateFederationContainers: ['teamspace', 'projectId', 'federationId', 'containers'],
	updateFederationContainersSuccess: ['projectId', 'federationId', 'containers'],
	updateFederationSuccess: ['projectId', 'federationId', 'updatedFederation'],
}, { prefix: 'FEDERATIONS/' }) as { Types: Constants<IFederationsActionCreators>; Creators: IFederationsActionCreators };

export const INITIAL_STATE: IFederationsState = {
	federationsByProject: {},
};

const getFederationFromState = (state, projectId, federationId) => (
	state.federationsByProject[projectId].find((federation) => federation._id === federationId)
);

export const createFederationSuccess = (state, {
	projectId,
	newFederation,
	federationId,
}: CreateFederationSuccessAction) => {
	if (getFederationFromState(state, projectId, federationId)) return;

	state.federationsByProject[projectId].push(prepareNewFederation(newFederation, federationId));
};

export const setFavouriteSuccess = (state, {
	projectId,
	federationId,
	isFavourite,
}: SetFavouriteSuccessAction) => {
	getFederationFromState(state, projectId, federationId).isFavourite = isFavourite;
};

export const fetchFederationsSuccess = (state, {
	projectId,
	federations,
}: FetchFederationsSuccessAction) => {
	state.federationsByProject[projectId] = federations;
};

export const fetchStatsSuccess = (state, {
	projectId,
	federationId,
	stats,
}: FetchFederationStatsSuccessAction) => {
	const federation = getFederationFromState(state, projectId, federationId);
	Object.assign(federation, prepareSingleFederationData(federation, stats));
};

export const fetchFederationViewsSuccess = (state, {
	projectId,
	federationId,
	views,
}: FetchFederationViewsSuccessAction) => {
	getFederationFromState(state, projectId, federationId).views = views;
};

export const fetchFederationSettingsSuccess = (state, {
	projectId,
	federationId,
	settings,
}: FetchFederationSettingsSuccessAction) => {
	const federation = getFederationFromState(state, projectId, federationId);
	Object.assign(federation, settings);
};

export const updateFederationSettingsSuccess = (state, {
	projectId,
	federationId,
	settings,
}: UpdateFederationSettingsSuccessAction) => {
	const federation = getFederationFromState(state, projectId, federationId);
	Object.assign(federation, settings);
};

export const deleteFederationSuccess = (state, {
	projectId,
	federationId,
}: DeleteFederationSuccessAction) => {
	state.federationsByProject[projectId] = state.federationsByProject[projectId].filter(
		(federation) => federationId !== federation._id,
	);
};

export const updateFederationContainersSuccess = (state, {
	projectId,
	federationId,
	containers,
}: UpdateFederationContainersActionSuccess) => {
	getFederationFromState(state, projectId, federationId).containers = containers;
};

export const updateFederationSuccess = (state, {
	projectId,
	federationId,
	updatedFederation,
}: UpdateFederationSuccessAction) => {
	const federation = getFederationFromState(state, projectId, federationId);
	Object.assign(federation, updatedFederation);
};

export const federationsReducer = createReducer<IFederationsState>(INITIAL_STATE, produceAll({
	[FederationsTypes.CREATE_FEDERATION_SUCCESS]: createFederationSuccess,
	[FederationsTypes.FETCH_FEDERATIONS_SUCCESS]: fetchFederationsSuccess,
	[FederationsTypes.FETCH_FEDERATION_STATS_SUCCESS]: fetchStatsSuccess,
	[FederationsTypes.SET_FAVOURITE_SUCCESS]: setFavouriteSuccess,
	[FederationsTypes.FETCH_FEDERATION_VIEWS_SUCCESS]: fetchFederationViewsSuccess,
	[FederationsTypes.FETCH_FEDERATION_SETTINGS_SUCCESS]: fetchFederationSettingsSuccess,
	[FederationsTypes.UPDATE_FEDERATION_SETTINGS_SUCCESS]: updateFederationSettingsSuccess,
	[FederationsTypes.DELETE_FEDERATION_SUCCESS]: deleteFederationSuccess,
	[FederationsTypes.UPDATE_FEDERATION_CONTAINERS_SUCCESS]: updateFederationContainersSuccess,
	[FederationsTypes.UPDATE_FEDERATION_SUCCESS]: updateFederationSuccess,
})) as (state: IFederationsState, action:any) => IFederationsState;

/**
 * Types
*/
export interface IFederationsState {
	federationsByProject: Record<string, IFederation[]>;
}

export type CreateFederationAction = Action<'CREATE_FEDERATION'> & TeamspaceAndProjectId & { newFederation: NewFederation, containers?: GroupedContainer[], onSuccess: () => void, onError: (error) => void };
export type CreateFederationSuccessAction = Action<'CREATE_FEDERATION_SUCCESS'> & { projectId: string, newFederation: NewFederation, federationId: string };
export type FetchFederationsAction = Action<'FETCH_FEDERATIONS'> & TeamspaceAndProjectId;
export type AddFavouriteAction = Action<'ADD_FAVOURITE'> & TeamspaceProjectAndFederationId;
export type RemoveFavouriteAction = Action<'REMOVE_FAVOURITE'> & TeamspaceProjectAndFederationId;
export type SetFavouriteSuccessAction = Action<'SET_FAVOURITE_SUCCESS'> & ProjectAndFederationId & { isFavourite: boolean };
export type FetchFederationsSuccessAction = Action<'FETCH_FEDERATIONS_SUCCESS'> & { projectId: string, federations: IFederation[] };
export type FetchFederationStatsAction = Action<'FETCH_FEDERATION_STATS'> & TeamspaceProjectAndFederationId;
export type FetchFederationStatsSuccessAction = Action<'FETCH_FEDERATION_STATS_SUCCESS'> & ProjectAndFederationId & { stats: FederationStats };
export type FetchFederationUsersAction = Action<'FETCH_FEDERATION_USERS'> & TeamspaceProjectAndFederationId;
// export type FetchFederationUsersSuccessAction = Action<'FETCH_FEDERATION_USERS_SUCCESS'> & ProjectAndFederationId & { users: string[] };
export type FetchFederationJobsAction = Action<'FETCH_FEDERATION_JOBS'> & TeamspaceProjectAndFederationId;
// export type FetchFederationJobsSuccessAction = Action<'FETCH_FEDERATION_JOBS_SUCCESS'> & ProjectAndFederationId & { jobs: string[] };
export type UpdateFederationContainersAction = Action<'UPDATE_FEDERATION_CONTAINERS'> & TeamspaceProjectAndFederationId & { containers: GroupedContainer[] };
export type UpdateFederationContainersActionSuccess = Action<'UPDATE_FEDERATION_CONTAINERS_SUCCESS'> & ProjectAndFederationId & { containers: GroupedContainer[] };
export type FetchFederationViewsAction = Action<'FETCH_FEDERATION_VIEWS'> & TeamspaceProjectAndFederationId;
export type FetchFederationViewsSuccessAction = Action<'FETCH_FEDERATION_VIEWS_SUCCESS'> & ProjectAndFederationId & { views: View[] };
export type FetchFederationSettingsAction = Action<'FETCH_FEDERATION_SETTINGS'> & TeamspaceProjectAndFederationId;
export type FetchFederationSettingsSuccessAction = Action<'FETCH_FEDERATION_SETTINGS_SUCCESS'> & ProjectAndFederationId & { settings: FederationSettings };
export type UpdateFederationSettingsAction = Action<'UPDATE_FEDERATION_SETTINGS'> & TeamspaceProjectAndFederationId & { settings: FederationSettings, onSuccess: () => void, onError: (error) => void };
export type UpdateFederationSettingsSuccessAction = Action<'UPDATE_FEDERATION_SETTINGS_SUCCESS'> & ProjectAndFederationId & { settings: FederationSettings };
export type DeleteFederationAction = Action<'DELETE_FEDERATION'> & TeamspaceProjectAndFederationId & SuccessAndErrorCallbacks;
export type DeleteFederationSuccessAction = Action<'DELETE_FEDERATION_SUCCESS'> & ProjectAndFederationId;
export type UpdateFederationSuccessAction = Action<'UPDATE_FEDERATION'> & ProjectAndFederationId & { updatedFederation: IFederation };

export interface IFederationsActionCreators {
	createFederation: (
		teamspace: string,
		projectId: string,
		newFederation: NewFederation,
		containers: GroupedContainer[],
		onSuccess: () => void,
		onError: (error) => void,
	) => CreateFederationAction;
	createFederationSuccess: (
		projectId: string,
		newFederation: NewFederation,
		federationId: string,
	) => CreateFederationSuccessAction;
	fetchFederations: (teamspace: string, projectId: string) => FetchFederationsAction;
	fetchFederationsSuccess: (projectId: string, federations: IFederation[]) => FetchFederationsSuccessAction;
	fetchFederationStats: (teamspace: string, projectId: string, federationId: string) => FetchFederationStatsAction;
	fetchFederationStatsSuccess: (
		projectId: string,
		federationId: string,
		stats: FederationStats
	) => FetchFederationStatsSuccessAction;
	addFavourite: (teamspace: string, projectId: string, federationId: string) => AddFavouriteAction;
	removeFavourite: (teamspace: string, projectId: string, federationId: string) => RemoveFavouriteAction;
	setFavouriteSuccess: (projectId: string, federationId: string, isFavourite: boolean) => SetFavouriteSuccessAction;
	fetchFederationViews: (teamspace: string, projectId: string, federationId: string) => FetchFederationViewsAction;
	fetchFederationViewsSuccess: (
		projectId: string,
		federationId: string,
		views: View[],
	) => FetchFederationViewsSuccessAction;
	fetchFederationSettings: (
		teamspace: string,
		projectId: string,
		federationId: string,
	) => FetchFederationSettingsAction;
	fetchFederationSettingsSuccess: (
		projectId: string,
		federationId: string,
		settings: FederationSettings,
	) => FetchFederationSettingsSuccessAction;
	fetchFederationUsers: (
		teamspace: string,
		projectId: string,
		federationId: string,
	) => FetchFederationUsersAction,
	fetchFederationJobs: (
		teamspace: string,
		projectId: string,
		federationId: string,
	) => FetchFederationJobsAction,
	updateFederationSettings: (
		teamspace: string,
		projectId: string,
		federationId: string,
		settings: FederationSettings,
		onSuccess: () => void,
		onError: (error) => void,
	) => UpdateFederationSettingsAction;
	updateFederationSettingsSuccess: (
		projectId: string,
		federationId: string,
		settings: FederationSettings,
	) => UpdateFederationSettingsSuccessAction;
	deleteFederation: (
		teamspace: string,
		projectId: string,
		federationId: string,
		onSuccess: () => void,
		onError: (error) => void
	) => DeleteFederationAction;
	deleteFederationSuccess: (projectId: string, federationId: string) => DeleteFederationSuccessAction;
	updateFederationContainers: (
		teamspace: string,
		projectId: string,
		federationId: string,
		containers: GroupedContainer[],
	) => UpdateFederationContainersAction;
	updateFederationContainersSuccess: (
		projectId: string,
		federationId: string,
		containers: GroupedContainer[],
	) => UpdateFederationContainersActionSuccess;
	updateFederationSuccess: (
		projectId: string,
		federationId: string,
		updatedFederation: Partial<IFederation>
	) => UpdateFederationSuccessAction;
}
