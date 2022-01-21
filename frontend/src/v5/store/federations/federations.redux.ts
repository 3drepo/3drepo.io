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
	FetchFederationsSuccessAction,
	IFederationsActionCreators,
	IFederationsState,
	SetFavouriteSuccessAction,
	FetchFederationStatsSuccessAction,
	SetIsListPendingAction,
} from '@/v5/store/federations/federations.types';
import { prepareSingleFederationData } from '@/v5/store/federations/federations.helpers';
import { Constants } from '../common/actions.helper';

export const { Types: FederationsTypes, Creators: FederationsActions } = createActions({
	addFavourite: ['teamspace', 'projectId', 'federationId'],
	removeFavourite: ['teamspace', 'projectId', 'federationId'],
	setFavouriteSuccess: ['projectId', 'federationId', 'isFavourite'],
	fetchFederations: ['teamspace', 'projectId'],
	fetchFederationsSuccess: ['projectId', 'federations'],
	fetchFederationStats: ['teamspace', 'projectId', 'federationId'],
	fetchFederationStatsSuccess: ['projectId', 'federationId', 'federationStats'],
	setIsListPending: ['isPending'],
	updateFederationSettings: ['teamspace', 'projectId', 'federationId', 'settings'],
}, { prefix: 'FEDERATIONS/' }) as { Types: Constants<IFederationsActionCreators>; Creators: IFederationsActionCreators };

export const INITIAL_STATE: IFederationsState = {
	federations: {},
	isListPending: true,
};

export const setFavourite = (state = INITIAL_STATE, {
	projectId,
	federationId,
	isFavourite,
}: SetFavouriteSuccessAction) => ({
	...state,
	federations: {
		...state.federations,
		[projectId]: state.federations[projectId].map((federation) => ({
			...federation,
			isFavourite: federation._id === federationId ? isFavourite : federation.isFavourite,
		})),
	},
});

export const fetchFederationsSuccess = (state = INITIAL_STATE, {
	projectId,
	federations,
}: FetchFederationsSuccessAction) => ({
	...state,
	federations: {
		...state.federations,
		[projectId]: federations,
	},
});

export const fetchStatsSuccess = (state = INITIAL_STATE, {
	projectId,
	federationId,
	federationStats,
}: FetchFederationStatsSuccessAction) => ({
	...state,
	federations: {
		...state.federations,
		[projectId]: state.federations[projectId].map((federation) => {
			if (federationId !== federation._id) return federation;
			return prepareSingleFederationData(federation, federationStats);
		}),
	},
});

export const setIsListPending = (state = INITIAL_STATE, { isPending }: SetIsListPendingAction) => ({
	...state,
	isListPending: isPending,
});

export const reducer = createReducer<IFederationsState>(INITIAL_STATE, {
	[FederationsTypes.FETCH_FEDERATIONS_SUCCESS]: fetchFederationsSuccess,
	[FederationsTypes.FETCH_FEDERATION_STATS_SUCCESS]: fetchStatsSuccess,
	[FederationsTypes.SET_FAVOURITE_SUCCESS]: setFavourite,
	[FederationsTypes.SET_IS_LIST_PENDING]: setIsListPending,
});
