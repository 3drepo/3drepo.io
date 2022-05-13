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
	FederationView,
	IFederation,
	NewFederation,
} from '@/v5/store/federations/federations.types';
import { prepareNewFederation, prepareSingleFederationData } from '@/v5/store/federations/federations.helpers';
import { Action } from 'redux';
import { Constants } from '../../helpers/actions.helper';
import { TeamspaceAndProjectId, TeamspaceProjectAndFederationId, ProjectAndFederationId } from '../store.types';

export const { Types: FederationsTypes, Creators: FederationsActions } = createActions({
	createFederation: ['teamspace', 'projectId', 'newFederation', 'containers'],
	createFederationSuccess: ['projectId', 'newFederation', 'federationId'],
	addFavourite: ['teamspace', 'projectId', 'federationId'],
	removeFavourite: ['teamspace', 'projectId', 'federationId'],
	setFavouriteSuccess: ['projectId', 'federationId', 'isFavourite'],
	fetchFederations: ['teamspace', 'projectId'],
	fetchFederationsSuccess: ['projectId', 'federations'],
	fetchFederationStats: ['teamspace', 'projectId', 'federationId'],
	fetchFederationStatsSuccess: ['projectId', 'federationId', 'federationStats'],
	fetchFederationViews: ['teamspace', 'projectId', 'federationId'],
	fetchFederationViewsSuccess: ['projectId', 'federationId', 'views'],
	fetchFederationSettings: ['teamspace', 'projectId', 'federationId'],
	fetchFederationSettingsSuccess: ['projectId', 'federationId', 'settings'],
	updateFederationSettings: ['teamspace', 'projectId', 'federationId', 'settings'],
	updateFederationSettingsSuccess: ['projectId', 'federationId', 'settings'],
	deleteFederation: ['teamspace', 'projectId', 'federationId'],
	deleteFederationSuccess: ['projectId', 'federationId'],
	updateFederationContainers: ['teamspace', 'projectId', 'federationId', 'containers'],
	updateFederationContainersSuccess: ['projectId', 'federationId', 'containers'],
	updateFederationSuccess: ['projectId', 'federationId', 'updatedFederation'],
}, { prefix: 'FEDERATIONS/' }) as { Types: Constants<IFederationsActionCreators>; Creators: IFederationsActionCreators };

export const INITIAL_STATE: IFederationsState = {
	federationsByProject: {},
};

export const createFederationSuccess = (state = INITIAL_STATE, {
	projectId,
	newFederation,
	federationId,
}: CreateFederationSuccessAction): IFederationsState => ({
	...state,
	federationsByProject: {
		...state.federationsByProject,
		[projectId]: [
			...state.federationsByProject[projectId],
			{
				...prepareNewFederation(newFederation, federationId),
			},
		],
	},
});

export const setFavourite = (state = INITIAL_STATE, {
	projectId,
	federationId,
	isFavourite,
}: SetFavouriteSuccessAction): IFederationsState => ({
	...state,
	federationsByProject: {
		...state.federationsByProject,
		[projectId]: state.federationsByProject[projectId].map((federation) => ({
			...federation,
			isFavourite: federation._id === federationId ? isFavourite : federation.isFavourite,
		})),
	},
});

export const fetchFederationsSuccess = (state = INITIAL_STATE, {
	projectId,
	federations,
}: FetchFederationsSuccessAction): IFederationsState => ({
	...state,
	federationsByProject: {
		...state.federationsByProject,
		[projectId]: federations,
	},
});

export const fetchStatsSuccess = (state = INITIAL_STATE, {
	projectId,
	federationId,
	federationStats,
}: FetchFederationStatsSuccessAction): IFederationsState => ({
	...state,
	federationsByProject: {
		...state.federationsByProject,
		[projectId]: state.federationsByProject[projectId].map((federation) => {
			if (federationId !== federation._id) return federation;
			return prepareSingleFederationData(federation, federationStats);
		}),
	},
});

export const fetchFederationViewsSuccess = (state = INITIAL_STATE, {
	projectId,
	federationId,
	views,
}: FetchFederationViewsSuccessAction): IFederationsState => ({
	...state,
	federationsByProject: {
		...state.federationsByProject,
		[projectId]: state.federationsByProject[projectId].map((federation) => {
			if (federationId !== federation._id) return federation;
			return {
				...federation,
				views,
			};
		}),
	},
});

export const fetchFederationSettingsSuccess = (state = INITIAL_STATE, {
	projectId,
	federationId,
	settings,
}: FetchFederationSettingsSuccessAction): IFederationsState => ({
	...state,
	federationsByProject: {
		...state.federationsByProject,
		[projectId]: state.federationsByProject[projectId].map((federation) => {
			if (federationId !== federation._id) return federation;
			return {
				...federation,
				...settings,
			};
		}),
	},
});

export const updateFederationSettingsSuccess = (state = INITIAL_STATE, {
	projectId,
	federationId,
	settings,
}: UpdateFederationSettingsSuccessAction): IFederationsState => ({
	...state,
	federationsByProject: {
		...state.federationsByProject,
		[projectId]: state.federationsByProject[projectId].map((federation) => {
			if (federationId !== federation._id) return federation;
			return {
				...federation,
				...settings,
			};
		}),
	},
});

export const deleteFederationSuccess = (state = INITIAL_STATE, {
	projectId,
	federationId,
}: DeleteFederationSuccessAction): IFederationsState => ({
	...state,
	federationsByProject: {
		...state.federationsByProject,
		[projectId]: state.federationsByProject[projectId].filter((federation) => federationId !== federation._id),
	},
});

export const updateFederationContainersSuccess = (state = INITIAL_STATE, {
	projectId,
	federationId,
	containers,
}: UpdateFederationContainersActionSuccess) => ({
	...state,
	federationsByProject: {
		...state.federationsByProject,
		[projectId]: state.federationsByProject[projectId].map((federation) => ({
			...federation,
			containers: federation._id === federationId ? containers : federation.containers,
		})),
	},
});

export const updateFederationSuccess = (state = INITIAL_STATE, {
	projectId,
	federationId,
	updatedFederation,
}: UpdateFederationSuccessAction) => ({
	...state,
	federations: {
		...state.federationsByProject,
		[projectId]: state.federationsByProject[projectId].map((federation) => {
			if (federationId !== federation._id) return federation;
			return ({ ...federation, ...updatedFederation });
		}),
	},
});

export const federationsReducer = createReducer<IFederationsState>(INITIAL_STATE, {
	[FederationsTypes.CREATE_FEDERATION_SUCCESS]: createFederationSuccess,
	[FederationsTypes.FETCH_FEDERATIONS_SUCCESS]: fetchFederationsSuccess,
	[FederationsTypes.FETCH_FEDERATION_STATS_SUCCESS]: fetchStatsSuccess,
	[FederationsTypes.SET_FAVOURITE_SUCCESS]: setFavourite,
	[FederationsTypes.FETCH_FEDERATION_VIEWS_SUCCESS]: fetchFederationViewsSuccess,
	[FederationsTypes.FETCH_FEDERATION_SETTINGS_SUCCESS]: fetchFederationSettingsSuccess,
	[FederationsTypes.UPDATE_FEDERATION_SETTINGS_SUCCESS]: updateFederationSettingsSuccess,
	[FederationsTypes.DELETE_FEDERATION_SUCCESS]: deleteFederationSuccess,
	[FederationsTypes.UPDATE_FEDERATION_CONTAINERS_SUCCESS]: updateFederationContainersSuccess,
	[FederationsTypes.UPDATE_FEDERATION_SUCCESS]: updateFederationSuccess,
}) as (state: IFederationsState, action:any) => IFederationsState;

/**
 * Types
*/
export interface IFederationsState {
	federationsByProject: Record<string, IFederation[]>;
}

export type CreateFederationAction = Action<'CREATE_FEDERATION'> & TeamspaceAndProjectId & { newFederation: NewFederation, containers?: string[] };
export type CreateFederationSuccessAction = Action<'CREATE_FEDERATION_SUCCESS'> & { projectId: string, newFederation: NewFederation, federationId: string };
export type FetchFederationsAction = Action<'FETCH_FEDERATIONS'> & TeamspaceAndProjectId;
export type AddFavouriteAction = Action<'ADD_FAVOURITE'> & TeamspaceProjectAndFederationId;
export type RemoveFavouriteAction = Action<'REMOVE_FAVOURITE'> & TeamspaceProjectAndFederationId;
export type SetFavouriteSuccessAction = Action<'SET_FAVOURITE_SUCCESS'> & ProjectAndFederationId & { isFavourite: boolean };
export type FetchFederationsSuccessAction = Action<'FETCH_FEDERATIONS_SUCCESS'> & { projectId: string, federations: IFederation[] };
export type FetchFederationStatsAction = Action<'FETCH_FEDERATION_STATS'> & TeamspaceProjectAndFederationId;
export type FetchFederationStatsSuccessAction = Action<'FETCH_FEDERATION_STATS_SUCCESS'> & ProjectAndFederationId & { federationStats: FederationStats };
export type UpdateFederationContainersAction = Action<'UPDATE_FEDERATION_CONTAINERS'> & TeamspaceProjectAndFederationId & { containers: string[] };
export type UpdateFederationContainersActionSuccess = Action<'UPDATE_FEDERATION_CONTAINERS_SUCCESS'> & ProjectAndFederationId & { containers: string[] };
export type FetchFederationViewsAction = Action<'FETCH_FEDERATION_VIEWS'> & TeamspaceProjectAndFederationId;
export type FetchFederationViewsSuccessAction = Action<'FETCH_FEDERATION_VIEWS_SUCCESS'> & ProjectAndFederationId & { views: FederationView[] };
export type FetchFederationSettingsAction = Action<'FETCH_FEDERATION_SETTINGS'> & TeamspaceProjectAndFederationId;
export type FetchFederationSettingsSuccessAction = Action<'FETCH_FEDERATION_SETTINGS_SUCCESS'> & ProjectAndFederationId & { settings: FederationSettings};
export type UpdateFederationSettingsAction = Action<'UPDATE_FEDERATION_SETTINGS'> & TeamspaceProjectAndFederationId & { settings: FederationSettings };
export type UpdateFederationSettingsSuccessAction = Action<'UPDATE_FEDERATION_SETTINGS_SUCCESS'> & ProjectAndFederationId & { settings: FederationSettings};
export type DeleteFederationAction = Action<'DELETE_FEDERATION'> & TeamspaceProjectAndFederationId;
export type DeleteFederationSuccessAction = Action<'DELETE_FEDERATION_SUCCESS'> & ProjectAndFederationId;
export type UpdateFederationSuccessAction = Action<'UPDATE_FEDERATION'> & ProjectAndFederationId & { updatedFederation: IFederation};

export interface IFederationsActionCreators {
	createFederation: (
		teamspace: string,
		projectId: string,
		newFederation: NewFederation,
		containers?: string[],
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
		federationStats: FederationStats
	) => FetchFederationStatsSuccessAction;
	addFavourite: (teamspace: string, projectId: string, federationId: string) => AddFavouriteAction;
	removeFavourite: (teamspace: string, projectId: string, federationId: string) => RemoveFavouriteAction;
	setFavouriteSuccess: (projectId: string, federationId: string, isFavourite: boolean) => SetFavouriteSuccessAction;
	fetchFederationViews: (teamspace: string, projectId: string, federationId: string) => FetchFederationViewsAction;
	fetchFederationViewsSuccess: (
		projectId: string,
		federationId: string,
		views: FederationView[],
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
	updateFederationSettings: (
		teamspace: string,
		projectId: string,
		federationId: string,
		settings: FederationSettings,
	) => UpdateFederationSettingsAction;
	updateFederationSettingsSuccess: (
		projectId: string,
		federationId: string,
		settings: FederationSettings,
	) => UpdateFederationSettingsSuccessAction;
	deleteFederation: (teamspace: string, projectId: string, federationId: string) => DeleteFederationAction;
	deleteFederationSuccess: (projectId: string, federationId: string) => DeleteFederationSuccessAction;
	updateFederationContainers: (
		teamspace: string,
		projectId: string,
		federationId: string,
		containers: string[]
	) => UpdateFederationContainersAction;
	updateFederationContainersSuccess: (
		projectId: string,
		federationId: string,
		containers: string[],
	) => UpdateFederationContainersActionSuccess;
	updateFederationSuccess: (
		projectId: string,
		federationId: string,
		updatedFederation: Partial<IFederation>
	) => UpdateFederationSuccessAction;
}
