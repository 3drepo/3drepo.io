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

import { all, put, takeLatest } from 'redux-saga/effects';
import { FederationsActions, FederationsTypes } from '@/v5/store/federations/federations.redux';
import * as API from '@/v5/services/api';
import {
	FetchFederationsAction,
	FetchFederationsResponse,
	FetchFederationStatsResponse,
	AddFavouriteAction,
	RemoveFavouriteAction,
} from '@/v5/store/federations/federations.types';
import { prepareFederationsData } from '@/v5/store/federations/federations.helpers';

export function* addFavourites({ federationId, teamspace, projectId }: AddFavouriteAction) {
	try {
		yield put(FederationsActions.setFavouriteSuccess(projectId, federationId, true));
		yield API.Federations.addFavourites({ teamspace, projectId, federationId });
	} catch (e) {
		console.error(e);
	}
}

export function* removeFavourites({ federationId, teamspace, projectId }: RemoveFavouriteAction) {
	try {
		yield put(FederationsActions.setFavouriteSuccess(projectId, federationId, false));
		yield API.Federations.removeFavourites({ teamspace, projectId, federationId });
	} catch (e) {
		console.error(e);
	}
}

export function* fetchFederations({ teamspace, projectId }: FetchFederationsAction) {
	yield put(FederationsActions.setIsListPending(true));
	yield put(FederationsActions.setAreStatsPending(true));
	try {
		const { federations }: FetchFederationsResponse = yield API.Federations.fetchFederations({
			teamspace,
			projectId,
		});
		const federationsWithoutStats = prepareFederationsData(federations);

		yield put(FederationsActions.fetchFederationsSuccess(projectId, federationsWithoutStats));
		yield put(FederationsActions.setIsListPending(false));

		const stats: FetchFederationStatsResponse[] = yield all(
			federations.map(
				(federation) => API.Federations.fetchFederationStats({
					teamspace, projectId, federationId: federation._id,
				}),
			),
		);

		const federationsDataWithStats = prepareFederationsData(federations, stats);
		yield put(FederationsActions.fetchFederationsSuccess(projectId, federationsDataWithStats));
		yield put(FederationsActions.setAreStatsPending(false));
	} catch (e) {
		yield put(FederationsActions.setIsListPending(false));
		yield put(FederationsActions.setAreStatsPending(false));
		console.error(e);
	}
}

export default function* FederationsSagas() {
	yield takeLatest(FederationsTypes.ADD_FAVOURITE, addFavourites);
	yield takeLatest(FederationsTypes.REMOVE_FAVOURITE, removeFavourites);
	yield takeLatest(FederationsTypes.FETCH_FEDERATIONS, fetchFederations);
}
