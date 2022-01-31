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

export interface IFederation {
	_id: string;
	description?: string;
	name: string;
	role: string;
	isFavourite: boolean;
	code: string;
	status: string;
	subModels: string[];
	containers: number;
	issues: number;
	risks: number;
	category: string;
	lastUpdated: Date;
	hasStatsPending: boolean;
	settings?: IFederationSettings;
	views?: FederationView[];
}

export interface IFederationsState {
	federations: Record<string, IFederation[]>;
	isListPending: boolean;
}

interface SurveyPoint {
	latLong: [number, number];
	position: [number, number, number];
}
export interface IFederationSettings {
	surveyPoint: SurveyPoint;
	angleFromNorth: number;
	defaultView: string;
	unit: string;
}

export type RawFederationSettings = Omit<IFederationSettings, 'surveyPoint'> & {
	_id?: string;
	name?: string;
	desc?: string;
	code?: string;
	unit: string;
	timestamp?: number;
	status?: string[];
	surveyPoints: SurveyPoint[];
	errorReason?: {
		message: string;
		timestamp: number;
		errorCode: string;
	}
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

export type FetchFederationsItemResponse = Pick<IFederation, '_id' | 'name' | 'role' | 'isFavourite'>;

export type FetchFederationsResponse = {
	federations: Array<FetchFederationsItemResponse>;
};

export type FavouritePayload = FetchFederationsPayload & {
	federationId: string;
};

export type FetchFederationStatsResponse = {
	code: string;
	status: string;
	subModels: string[];
	tickets: {
		issues: number;
		risks: number;
	};
	category: string;
	lastUpdated: number;
};

export type FetchFederationStatsPayload = FetchFederationsPayload & {
	federationId: string;
};

export type FetchFederationStatsSuccessPayload = {
	federationId: string;
	projectId: string;
	federationStats: FetchFederationStatsResponse;
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
	views: FetchFederationViewsResponse;
};

export type FetchFederationSettingsPayload = FetchFederationsPayload & {
	federationId: string;
};

export type FetchFederationSettingsResponse = {
	settings: IFederationSettings;
	rawSettings: RawFederationSettings;
};

export type FetchFederationSettingsSuccessPayload = {
	projectId: string;
	federationId: string;
	settings: IFederationSettings;
};

export type UpdateFederationSettingsPayload = FetchFederationsPayload & {
	federationId: string;
	rawSettings: RawFederationSettings;
};

export type UpdateFederationSettingsSuccessPayload = {
	projectId: string;
	federationId: string;
	rawSettings: RawFederationSettings;
};

export type DeleteFederationPayload = FetchFederationsPayload & {
	federationId: string;
};

export type DeleteFederationSuccessPayload = {
	projectId: string;
	federationId: string;
};

export type FetchFederationsAction = Action<'FETCH_FEDERATIONS'> & FetchFederationsPayload;
export type AddFavouriteAction = Action<'ADD_FAVOURITE'> & FavouritePayload;
export type RemoveFavouriteAction = Action<'REMOVE_FAVOURITE'> & FavouritePayload;
export type SetFavouriteSuccessAction = Action<'SET_FAVOURITE_SUCCESS'> & { projectId: string, federationId: string, isFavourite: boolean };
export type FetchFederationsSuccessAction = Action<'FETCH_FEDERATIONS_SUCCESS'> & { projectId: string, federations: IFederation[] };
export type SetIsListPendingAction = Action<'SET_IS_LIST_PENDING'> & { isPending: boolean };
export type FetchFederationStatsAction = Action<'FETCH_FEDERATION_STATS'> & FetchFederationStatsPayload;
export type FetchFederationStatsSuccessAction = Action<'FETCH_FEDERATION_STATS_SUCCESS'> & FetchFederationStatsSuccessPayload;
export type FetchFederationViewsAction = Action<'FETCH_FEDERATION_VIEWS'> & FetchFederationViewsPayload;
export type FetchFederationViewsSuccessAction = Action<'FETCH_FEDERATION_VIEWS_SUCCESS'> & FetchFederationViewsSuccessPayload;
export type FetchFederationSettingsAction = Action<'FETCH_FEDERATION_SETTINGS'> & FetchFederationSettingsPayload;
export type FetchFederationSettingsSuccessAction = Action<'FETCH_FEDERATION_SETTINGS_SUCCESS'> & FetchFederationSettingsSuccessPayload;
export type UpdateFederationSettingsAction = Action<'UPDATE_FEDERATION_SETTINGS'> & UpdateFederationSettingsPayload;
export type UpdateFederationSettingsSuccessAction = Action<'UPDATE_FEDERATION_SETTINGS_SUCCESS'> & UpdateFederationSettingsSuccessPayload;
export type DeleteFederationAction = Action<'DELETE_FEDERATION'> & DeleteFederationPayload;
export type DeleteFederationSuccessAction = Action<'DELETE_FEDERATION_SUCCESS'> & DeleteFederationSuccessPayload;

export interface IFederationsActionCreators {
	fetchFederations: (teamspace: string, projectId: string) => FetchFederationsAction;
	fetchFederationsSuccess: (projectId: string, federations: IFederation[]) => FetchFederationsSuccessAction;
	fetchFederationStats: (teamspace: string, projectId: string, federationId: string) => FetchFederationStatsAction;
	fetchFederationStatsSuccess: (
		projectId: string,
		federationId: string,
		federationStats: FetchFederationStatsResponse
	) => FetchFederationStatsSuccessAction;
	addFavourite: (teamspace: string, projectId: string, federationId: string) => AddFavouriteAction;
	removeFavourite: (teamspace: string, projectId: string, federationId: string) => RemoveFavouriteAction;
	setFavouriteSuccess: (projectId: string, federationId: string, isFavourite: boolean) => SetFavouriteSuccessAction;
	setIsListPending: (isPending: boolean) => SetIsListPendingAction;
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
		settings: IFederationSettings,
	) => FetchFederationSettingsSuccessAction;
	updateFederationSettings: (
		teamspace: string,
		projectId: string,
		federationId: string,
		rawSettings: RawFederationSettings,
	) => UpdateFederationSettingsAction;
	updateFederationSettingsSuccess: (
		projectId: string,
		federationId: string,
		rawSettings: RawFederationSettings,
	) => UpdateFederationSettingsSuccessAction;
	deleteFederation: (teamspace: string, projectId: string, federationId: string) => DeleteFederationAction;
	deleteFederationSuccess: (projectId: string, federationId: string) => DeleteFederationSuccessAction;
}
