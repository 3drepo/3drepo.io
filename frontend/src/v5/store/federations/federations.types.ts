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
import { UploadStatuses } from '@/v5/store/containers/containers.types';
import { Action } from 'redux';

export interface IFederation {
	_id: string;
	name: string;
	role: string;
	isFavourite: boolean;
	code: string;
	status: UploadStatuses;
	subModels: string[];
	containers: number;
	issues: number;
	risks: number;
	category: string;
	lastUpdated: Date;
}

export interface IFederationsState {
	federations: Record<string, IFederation[]>;
	allFilterQuery: string;
	favouritesFilterQuery: string;
	isListPending: boolean;
	areStatsPending: boolean;
}

export type FetchFederationsPayload = {
	teamspace: string;
	projectId: string;
};

export type FetchFederationsResponse = {
	federations: Array<Pick<IFederation, '_id' | 'name' | 'role' | 'isFavourite'>>
};

export type FavouritePayload = FetchFederationsPayload & {
	federationId: string;
};

export type FetchFederationStatsResponse = {
	code: string;
	status: UploadStatuses;
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

export type FetchFederationsAction = Action<'FETCH_FEDERATIONS'> & FetchFederationsPayload;
export type AddFavouriteAction = Action<'ADD_FAVOURITE'> & FavouritePayload;
export type RemoveFavouriteAction = Action<'REMOVE_FAVOURITE'> & FavouritePayload;
export type SetFavouriteSuccessAction = Action<'SET_FAVOURITE_SUCCESS'> & {projectId: string, federationId: string, isFavourite: boolean};
export type FetchFederationsSuccessAction = Action<'FETCH_FEDERATIONS_SUCCESS'> & { projectId: string, federations: IFederation[] };
export type SetIsListPendingAction = Action<'SET_IS_LIST_PENDING'> & { isPending: boolean };
export type SetAreStatsPendingAction = Action<'SET_ARE_STATS_PENDING'> & { isPending: boolean };
export type SetFilterQueryAction = Action<'SET_ALL_FILTER_QUERY'> & { query: string};
export type SetFavouritesFilterQueryAction = Action<'SET_FAVOURITES_FILTER_QUERY'> & { query: string};

export interface IFederationsActionCreators {
	fetchFederations: (teamspace: string, projectId: string) => FetchFederationsAction;
	fetchFederationsSuccess: (projectId: string, federations: IFederation[]) => FetchFederationsSuccessAction;
	addFavourite: (teamspace: string, projectId: string, federationId: string) => AddFavouriteAction;
	removeFavourite: (teamspace: string, projectId: string, federationId: string) => RemoveFavouriteAction;
	setFavouriteSuccess: (projectId: string, containerId: string, isFavourite: boolean) => SetFavouriteSuccessAction;
	setAllFilterQuery: (query: string) => SetFilterQueryAction;
	setFavouritesFilterQuery: (query: string) => SetFavouritesFilterQueryAction;
	setIsListPending: (isPending: boolean) => SetIsListPendingAction;
	setAreStatsPending: (isPending: boolean) => SetAreStatsPendingAction
}
