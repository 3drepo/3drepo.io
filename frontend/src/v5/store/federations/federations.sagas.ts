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
	RemoveFavouriteAction, FetchFederationStatsAction, UpdateFederationSettingsAction,
} from '@/v5/store/federations/federations.types';
import { prepareFederationsData } from '@/v5/store/federations/federations.helpers';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';

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

export function* updateFederationSettings({
	teamspace, projectId, federationId, settings,
}: UpdateFederationSettingsAction) {
	try {
		yield API.Federations.updateFederationSettings({
			teamspace, projectId, federationId, settings,
		});
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: 'trying to update federation settings',
			error,
		}));
	}
}

export default function* FederationsSagas() {
	yield takeLatest(FederationsTypes.ADD_FAVOURITE, addFavourites);
	yield takeLatest(FederationsTypes.REMOVE_FAVOURITE, removeFavourites);
	yield takeLatest(FederationsTypes.FETCH_FEDERATIONS, fetchFederations);
	yield takeEvery(FederationsTypes.FETCH_FEDERATION_STATS, fetchFederationStats);
	yield takeLatest(FederationsTypes.UPDATE_FEDERATION_SETTINGS, updateFederationSettings);
}
