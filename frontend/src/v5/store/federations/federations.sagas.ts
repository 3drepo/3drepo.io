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

import { all, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import * as API from '@/v5/services/api';
import {
	AddFavouriteAction,
	CreateFederationAction,
	DeleteFederationAction,
	FederationsActions,
	FederationsTypes,
	FetchFederationJobsAction,
	FetchFederationsAction,
	FetchFederationSettingsAction,
	FetchFederationStatsAction,
	FetchFederationUsersAction,
	FetchFederationViewsAction,
	RemoveFavouriteAction,
	UpdateFederationContainersAction,
	UpdateFederationSettingsAction,
} from '@/v5/store/federations/federations.redux';
import { FederationStats } from '@/v5/store/federations/federations.types';
import { prepareFederationsData, prepareFederationSettingsForBackend, prepareFederationSettingsForFrontend } from '@/v5/store/federations/federations.helpers';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { formatMessage } from '@/v5/services/intl';
import { FetchFederationsResponse, FetchFederationViewsResponse } from '@/v5/services/api/federations';
import { isEqualWith } from 'lodash';
import { compByColum } from '../store.helpers';
import { selectFederationById, selectFederations, selectIsListPending } from './federations.selectors';

export function* createFederation({
	teamspace,
	projectId,
	newFederation,
	containers,
	onSuccess,
	onError,
}: CreateFederationAction) {
	try {
		const federationId = yield API.Federations.createFederation(teamspace, projectId, newFederation);
		yield put(FederationsActions.createFederationSuccess(projectId, newFederation, federationId));
		if (containers.length) {
			yield put(FederationsActions.updateFederationContainers(teamspace, projectId, federationId, containers));
		}
		yield put(FederationsActions.fetchFederationStats(teamspace, projectId, federationId));
		onSuccess();
	} catch (error) {
		onError(error);
	}
}

export function* addFavourites({ federationId, teamspace, projectId }: AddFavouriteAction) {
	try {
		yield put(FederationsActions.setFavouriteSuccess(projectId, federationId, true));
		yield API.Federations.addFavourites(teamspace, projectId, federationId);
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
		yield API.Federations.removeFavourites(teamspace, projectId, federationId);
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: 'trying to remove federation from favourites',
			error,
		}));
		yield put(FederationsActions.setFavouriteSuccess(projectId, federationId, true));
	}
}

export function* fetchFederations({ teamspace, projectId }: FetchFederationsAction) {
	try {
		const { federations }: FetchFederationsResponse = yield API.Federations.fetchFederations(teamspace, projectId);
		const federationsWithoutStats = prepareFederationsData(federations);
		const storedFederations = yield select(selectFederations);
		const isPending = yield select(selectIsListPending);

		if (isPending || !isEqualWith(storedFederations, federationsWithoutStats, compByColum(['_id', 'name', 'role', 'isFavourite']))) {
			yield put(FederationsActions.fetchFederationsSuccess(projectId, federationsWithoutStats));
		}

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
		const stats: FederationStats = yield API.Federations.fetchFederationStats(teamspace, projectId, federationId);

		const federation = yield select(selectFederationById, federationId);

		const sameTickets = stats?.tickets === federation?.tickets;
		const defaultStat = { desc: '', code: '', containers: [], status: 'ok' };

		if (!isEqualWith(federation, { ...defaultStat, ...stats }, compByColum(['name', 'code', 'desc', 'containers', 'status'])) || !sameTickets) {
			yield put(FederationsActions.fetchFederationStatsSuccess(projectId, federationId, stats));
		}
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: 'trying to fetch federations stats',
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
		const { views }: FetchFederationViewsResponse = yield API.Federations.fetchFederationViews(teamspace, projectId, federationId);
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
		const rawSettings = yield API.Federations.fetchFederationSettings(teamspace, projectId, federationId);
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
	teamspace,
	projectId,
	federationId,
	settings,
	onSuccess,
	onError,
}: UpdateFederationSettingsAction) {
	try {
		const rawSettings = prepareFederationSettingsForBackend(settings);
		yield API.Federations.updateFederationSettings(teamspace, projectId, federationId, rawSettings);
		yield put(FederationsActions.updateFederationSettingsSuccess(projectId, federationId, settings));
		onSuccess();
	} catch (error) {
		onError(error);
	}
}

export function* fetchFederationUsers({
	teamspace,
	projectId,
	federationId,
}: FetchFederationUsersAction) {
	try {
		const { users: nonViewerUsers } = yield API.Federations.fetchFederationUsers(teamspace, projectId, federationId, true);
		const { users: allUsers } = yield API.Federations.fetchFederationUsers(teamspace, projectId, federationId);
		const users = allUsers.map((user) => ({ user, isViewer: !nonViewerUsers.includes(user) }));

		yield put(FederationsActions.updateFederationSuccess(projectId, federationId, { users }));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'federations.fetchUsers.error', defaultMessage: 'trying to fetch federation users' }),
			error,
		}));
	}
}

export function* fetchFederationJobs({
	teamspace,
	projectId,
	federationId,
}: FetchFederationJobsAction) {
	try {
		const { jobs: nonViewerJobs } = yield API.Federations.fetchFederationJobs(teamspace, projectId, federationId, true);
		const { jobs: allJobs } = yield API.Federations.fetchFederationJobs(teamspace, projectId, federationId);
		const jobs = allJobs.map((job) => ({ _id: job, isViewer: !nonViewerJobs.includes(job) }));

		yield put(FederationsActions.updateFederationSuccess(projectId, federationId, { jobs }));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'federations.fetchJobs.error', defaultMessage: 'trying to fetch federation Jobs' }),
			error,
		}));
	}
}

export function* deleteFederation({ teamspace, projectId, federationId, onSuccess, onError }: DeleteFederationAction) {
	try {
		yield API.Federations.deleteFederation(teamspace, projectId, federationId);
		yield put(FederationsActions.deleteFederationSuccess(projectId, federationId));
		onSuccess();
	} catch (error) {
		onError(error);
	}
}

export function* updateFederationContainers({
	teamspace,
	projectId,
	federationId,
	containers,
}: UpdateFederationContainersAction) {
	try {
		yield API.Federations.updateFederationContainers(teamspace, projectId, federationId, containers);
		yield put(FederationsActions.updateFederationContainersSuccess(projectId, federationId, containers));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({
				id: 'federation.update.containers.error',
				defaultMessage: 'trying to update federation containers',
			}),
			error,
		}));
	}
}

export default function* FederationsSagas() {
	yield takeLatest(FederationsTypes.CREATE_FEDERATION, createFederation);
	yield takeLatest(FederationsTypes.ADD_FAVOURITE, addFavourites);
	yield takeLatest(FederationsTypes.REMOVE_FAVOURITE, removeFavourites);
	yield takeLatest(FederationsTypes.FETCH_FEDERATIONS, fetchFederations);
	yield takeEvery(FederationsTypes.FETCH_FEDERATION_STATS, fetchFederationStats);
	yield takeEvery(FederationsTypes.FETCH_FEDERATION_VIEWS, fetchFederationViews);
	yield takeEvery(FederationsTypes.FETCH_FEDERATION_SETTINGS, fetchFederationSettings);
	yield takeEvery(FederationsTypes.FETCH_FEDERATION_USERS, fetchFederationUsers);
	yield takeEvery(FederationsTypes.FETCH_FEDERATION_JOBS, fetchFederationJobs);
	yield takeLatest(FederationsTypes.UPDATE_FEDERATION_SETTINGS, updateFederationSettings);
	yield takeLatest(FederationsTypes.DELETE_FEDERATION, deleteFederation);
	yield takeLatest(FederationsTypes.UPDATE_FEDERATION_CONTAINERS, updateFederationContainers);
}
