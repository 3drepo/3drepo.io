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
import { Action } from 'redux';
import { ProjectAndFederationId, TeamspaceProjectAndFederationId } from '../store.types';

export interface IFederation {
	_id: string;
	desc?: string;
	name: string;
	role: string;
	isFavourite: boolean;
	code: string;
	status: string;
	containers: string[];
	issues: number;
	risks: number;
	category: string;
	lastUpdated: Date;
	hasStatsPending: boolean;
	views?: FederationView[];
	surveyPoint?: SurveyPoint;
	angleFromNorth?: number;
	defaultView?: string;
	unit?: string;
}

export interface IFederationsState {
	federationsByProject: Record<string, IFederation[]>;
}

export interface SurveyPoint {
	latLong: [number, number];
	position: [number, number, number];
}

export type FederationSettings = Pick<IFederation, 'surveyPoint' | 'angleFromNorth' | 'defaultView' | 'unit' | 'desc' | 'name' | 'code'>;

export type FetchFederationSettingsResponse = FederationSettings & {
	timestamp?: number;
	status?: string[];
	errorReason?: {
		message: string;
		timestamp: number;
		errorCode: string;
	}
};

export type FederationBackendSettings = Omit<FetchFederationSettingsResponse, 'surveyPoint'> & {
	surveyPoints: SurveyPoint[];
};

export type FederationView = {
	_id: string;
	name: string;
	hasThumbnail: boolean;
};

export const EMPTY_VIEW: FederationView = {
	_id: ' ',
	name: 'None',
	hasThumbnail: false,
};

export type FetchFederationsPayload = {
	projectId: string;
	teamspace: string;
};

export type MinimumFederation = Pick<IFederation, '_id' | 'name' | 'role' | 'isFavourite'>;

export type FederationStats = {
	code: string;
	status: string;
	containers: string[];
	tickets: {
		issues: number;
		risks: number;
	};
	category: string;
	lastUpdated: number;
};

export type FetchFederationStatsPayload = TeamspaceProjectAndFederationId;

export type FetchFederationStatsSuccessPayload = {
	federationId: string;
	projectId: string;
	federationStats: FederationStats;
};

export type FetchFederationViewsPayload = FetchFederationsPayload & {
	federationId: string;
};

export type FetchFederationViewsResponse = {
	views: FederationView[];
};

export type FetchFederationViewsSuccessPayload = {
	projectId: string;
	federationId: string;
	views: FederationView[];
};

export type FetchFederationSettingsPayload = FetchFederationsPayload & {
	federationId: string;
};

export type FetchFederationSettingsSuccessPayload = {
	projectId: string;
	federationId: string;
	settings: FederationSettings;
};

export type UpdateFederationSettingsPayload = FetchFederationsPayload & {
	federationId: string;
	settings: FederationSettings;
};

export type UpdateFederationSettingsSuccessPayload = {
	projectId: string;
	federationId: string;
	settings: FederationSettings;
};

export type DeleteFederationPayload = FetchFederationsPayload & {
	federationId: string;
};

export type DeleteFederationSuccessPayload = {
	projectId: string;
	federationId: string;
};

export interface UpdateFederationContainersPayload {
	teamspace: string;
	projectId: string;
	federationId: string;
	containers: string[];
}

export interface UpdateFederationContainersSuccessPayload {
	projectId: string;
	federationId: string;
	containers: string[];
}

export type FetchFederationsAction = Action<'FETCH_FEDERATIONS'> & FetchFederationsPayload;
export type AddFavouriteAction = Action<'ADD_FAVOURITE'> & TeamspaceProjectAndFederationId;
export type RemoveFavouriteAction = Action<'REMOVE_FAVOURITE'> & TeamspaceProjectAndFederationId;
export type SetFavouriteSuccessAction = Action<'SET_FAVOURITE_SUCCESS'> & ProjectAndFederationId & { isFavourite: boolean };
export type FetchFederationsSuccessAction = Action<'FETCH_FEDERATIONS_SUCCESS'> & { projectId: string, federations: IFederation[] };
export type FetchFederationStatsAction = Action<'FETCH_FEDERATION_STATS'> & FetchFederationStatsPayload;
export type FetchFederationStatsSuccessAction = Action<'FETCH_FEDERATION_STATS_SUCCESS'> & FetchFederationStatsSuccessPayload;
export type UpdateFederationContainersAction = Action<'UPDATE_FEDERATION_CONTAINERS'> & UpdateFederationContainersPayload;
export type UpdateFederationContainersActionSuccess = Action<'UPDATE_FEDERATION_CONTAINERS_SUCCESS'> & UpdateFederationContainersSuccessPayload;
export type FetchFederationViewsAction = Action<'FETCH_FEDERATION_VIEWS'> & FetchFederationViewsPayload;
export type FetchFederationViewsSuccessAction = Action<'FETCH_FEDERATION_VIEWS_SUCCESS'> & FetchFederationViewsSuccessPayload;
export type FetchFederationSettingsAction = Action<'FETCH_FEDERATION_SETTINGS'> & FetchFederationSettingsPayload;
export type FetchFederationSettingsSuccessAction = Action<'FETCH_FEDERATION_SETTINGS_SUCCESS'> & FetchFederationSettingsSuccessPayload;
export type UpdateFederationSettingsAction = Action<'UPDATE_FEDERATION_SETTINGS'> & UpdateFederationSettingsPayload;
export type UpdateFederationSettingsSuccessAction = Action<'UPDATE_FEDERATION_SETTINGS_SUCCESS'> & UpdateFederationSettingsSuccessPayload;
export type DeleteFederationAction = Action<'DELETE_FEDERATION'> & DeleteFederationPayload;
export type DeleteFederationSuccessAction = Action<'DELETE_FEDERATION_SUCCESS'> & DeleteFederationSuccessPayload;
export type UpdateFederationSuccessAction = Action<'UPDATE_FEDERATION'> & {projectId: string, federationId: string, updatedFederation: IFederation};

export interface IFederationsActionCreators {
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
