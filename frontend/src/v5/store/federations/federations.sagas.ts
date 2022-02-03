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

import { all, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { FederationsActions, FederationsTypes } from '@/v5/store/federations/federations.redux';
import * as API from '@/v5/services/api';
import {
	FetchFederationsAction,
	FetchFederationsResponse,
	FetchFederationStatsResponse,
	AddFavouriteAction,
	RemoveFavouriteAction,
	FetchFederationStatsAction,
	UpdateFederationSettingsAction,
	FetchFederationViewsAction,
	FetchFederationViewsResponse,
	FetchFederationSettingsAction,
	DeleteFederationAction,
} from '@/v5/store/federations/federations.types';
import {
	prepareFederationsData,
	prepareFederationSettingsForFrontend,
	prepareFederationSettingsForBackend,
} from '@/v5/store/federations/federations.helpers';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { formatMessage } from '@/v5/services/intl';

export function* addFavourites({ federationId, teamspace, projectId }: AddFavouriteAction) {
	try {
		yield put(FederationsActions.setFavouriteSuccess(projectId, federationId, true));
		yield API.Federations.addFavourites({ teamspace, projectId, federationId });
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: 'trying to add federation to favourites',
			error,
		}));
		yield put(FederationsActions.setFavouriteSuccess(projectId, federationId, false));
	}
}

export function* removeFavourites({ federationId, teamspace, projectId }: RemoveFavouriteAction) {
	try {
		yield put(FederationsActions.setFavouriteSuccess(projectId, federationId, false));
		yield API.Federations.removeFavourites({ teamspace, projectId, federationId });
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: 'trying to remove federation from favourites',
			error,
		}));
		yield put(FederationsActions.setFavouriteSuccess(projectId, federationId, true));
	}
}

export function* fetchFederations({ teamspace, projectId }: FetchFederationsAction) {
	yield put(FederationsActions.setIsListPending(true));
	try {
		const { federations }: FetchFederationsResponse = yield API.Federations.fetchFederations({
			teamspace,
			projectId,
		});
		const federationsWithoutStats = prepareFederationsData(federations);

		yield put(FederationsActions.fetchFederationsSuccess(projectId, federationsWithoutStats));
		yield put(FederationsActions.setIsListPending(false));

		yield all(
			federations.map(
				(federation) => put(FederationsActions.fetchFederationStats(teamspace, projectId, federation._id)),
			),
		);
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: 'trying to fetch federations',
			error,
		}));
	}
}

export function* fetchFederationStats({ teamspace, projectId, federationId }: FetchFederationStatsAction) {
	try {
		const stats: FetchFederationStatsResponse = yield API.Federations.fetchFederationStats({
			teamspace, projectId, federationId,
		});

		yield put(FederationsActions.fetchFederationStatsSuccess(projectId, federationId, stats));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: 'trying to fetch federations',
			error,
		}));
	}
}

export function* fetchFederationViews({
	teamspace,
	projectId,
	federationId,
}: FetchFederationViewsAction) {
	try {
		const { views }: FetchFederationViewsResponse = yield API.Federations.fetchFederationViews({
			teamspace,
			projectId,
			federationId,
		});
		yield put(FederationsActions.fetchFederationViewsSuccess(projectId, federationId, views));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: 'trying to fetch federation views',
			error,
		}));
	}
}

export function* fetchFederationSettings({
	teamspace,
	projectId,
	federationId,
}: FetchFederationSettingsAction) {
	try {
		const rawSettings = yield API.Federations.fetchFederationSettings({
			teamspace,
			projectId,
			federationId,
		});
		const settings = prepareFederationSettingsForFrontend(rawSettings);
		yield put(FederationsActions.fetchFederationSettingsSuccess(projectId, federationId, settings));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: 'trying to fetch federation settings',
			error,
		}));
	}
}

export function* updateFederationSettings({
	teamspace, projectId, federationId, settings, extraSettings
}: UpdateFederationSettingsAction) {
	try {
		const rawSettings = prepareFederationSettingsForBackend(settings, extraSettings);
		yield API.Federations.updateFederationSettings({
			teamspace, projectId, federationId, rawSettings,
		});
		yield put(FederationsActions.updateFederationSettingsSuccess(projectId, federationId, rawSettings));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: 'trying to update federation settings',
			error,
		}));
	}
}

export function* deleteFederation({ teamspace, projectId, federationId }: DeleteFederationAction) {
	try {
		yield API.Federations.deleteFederation({ teamspace, projectId, federationId });
		yield put(FederationsActions.deleteFederationSuccess(projectId, federationId));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'federation.delete.error', defaultMessage: 'trying to delete federation' }),
			error,
		}));
	}
}

export default function* FederationsSagas() {
	yield takeLatest(FederationsTypes.ADD_FAVOURITE, addFavourites);
	yield takeLatest(FederationsTypes.REMOVE_FAVOURITE, removeFavourites);
	yield takeLatest(FederationsTypes.FETCH_FEDERATIONS, fetchFederations);
	yield takeEvery(FederationsTypes.FETCH_FEDERATION_STATS, fetchFederationStats);
	yield takeEvery(FederationsTypes.FETCH_FEDERATION_VIEWS, fetchFederationViews);
	yield takeEvery(FederationsTypes.FETCH_FEDERATION_SETTINGS, fetchFederationSettings);
	yield takeLatest(FederationsTypes.UPDATE_FEDERATION_SETTINGS, updateFederationSettings);
	yield takeLatest(FederationsTypes.DELETE_FEDERATION, deleteFederation);
}
