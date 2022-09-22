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
	ContainersActions,
	ContainersTypes,
	CreateContainerAction,
	DeleteContainerAction,
	FetchContainersAction,
	FetchContainerSettingsAction,
	FetchContainerStatsAction,
	FetchContainerViewsAction,
	RemoveFavouriteAction,
	UpdateContainerSettingsAction,
} from '@/v5/store/containers/containers.redux';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { formatMessage } from '@/v5/services/intl';
import { FetchContainersResponse } from '@/v5/services/api/containers';
import { isEqualWith } from 'lodash';
import { FetchContainerViewsResponseView } from './containers.types';
import { prepareContainerSettingsForBackend, prepareContainerSettingsForFrontend, prepareContainersData } from './containers.helpers';
import { selectContainerById, selectContainers, selectIsListPending } from './containers.selectors';
import { compByColum } from '../store.helpers';

export function* addFavourites({ containerId, teamspace, projectId }: AddFavouriteAction) {
	try {
		yield put(ContainersActions.setFavouriteSuccess(projectId, containerId, true));
		yield API.Containers.addFavourites({ teamspace, containerId, projectId });
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'containers.addFavourite.error', defaultMessage: 'trying to add container to favourites' }),
			error,
		}));
		yield put(ContainersActions.setFavouriteSuccess(projectId, containerId, false));
	}
}

export function* removeFavourites({ containerId, teamspace, projectId }: RemoveFavouriteAction) {
	try {
		yield put(ContainersActions.setFavouriteSuccess(projectId, containerId, false));
		yield API.Containers.removeFavourites({ containerId, teamspace, projectId });
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'containers.removeFavourite.error', defaultMessage: 'trying to remove container from favourites' }),
			error,
		}));
		yield put(ContainersActions.setFavouriteSuccess(projectId, containerId, true));
	}
}

export function* fetchContainers({ teamspace, projectId }: FetchContainersAction) {
	try {
		const { containers }: FetchContainersResponse = yield API.Containers.fetchContainers({ teamspace, projectId });
		const containersWithoutStats = prepareContainersData(containers);
		const storedContainers = yield select(selectContainers);
		const isPending = yield select(selectIsListPending);

		// Only update if theres is new data
		if (isPending || !isEqualWith(storedContainers, containersWithoutStats, compByColum(['_id', 'name', 'role', 'isFavourite']))) {
			yield put(ContainersActions.fetchContainersSuccess(projectId, containersWithoutStats));
		}

		yield all(
			containers.map(
				(container) => put(ContainersActions.fetchContainerStats(teamspace, projectId, container._id)),
			),
		);
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'containers.fetchAll.error', defaultMessage: 'trying to fetch containers' }),
			error,
		}));
	}
}

export function* fetchContainerStats({ teamspace, projectId, containerId }: FetchContainerStatsAction) {
	try {
		const stats = yield API.Containers.fetchContainerStats({
			teamspace, projectId, containerId,
		});

		const container = yield select(selectContainerById, containerId);

		const basicDataEqual = compByColum(['unit', 'type'])(container, stats);
		// eslint-disable-next-line max-len
		const revisionsEqual = (container?.latestRevision === stats?.revisions?.latestRevision && container?.status === stats?.status) // if it has revisions
							|| (container?.latestRevision === '' && stats?.revisions?.total === 0); // if it doesnt

		// Only update if theres is new data
		if (!basicDataEqual || !revisionsEqual) {
			yield put(ContainersActions.fetchContainerStatsSuccess(projectId, containerId, stats));
		}
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'containers.fetchStats.error', defaultMessage: 'trying to fetch containers details' }),
			error,
		}));
	}
}

export function* fetchContainerViews({
	teamspace,
	projectId,
	containerId,
}: FetchContainerViewsAction) {
	try {
		const { views }: FetchContainerViewsResponseView = yield API.Containers.fetchContainerViews({
			teamspace,
			projectId,
			containerId,
		});
		yield put(ContainersActions.fetchContainerViewsSuccess(projectId, containerId, views));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'containers.fetchViews.error', defaultMessage: 'trying to fetch container views' }),
			error,
		}));
	}
}

export function* fetchContainerSettings({
	teamspace,
	projectId,
	containerId,
}: FetchContainerSettingsAction) {
	try {
		const rawSettings = yield API.Containers.fetchContainerSettings({
			teamspace,
			projectId,
			containerId,
		});
		const settings = prepareContainerSettingsForFrontend(rawSettings);
		yield put(ContainersActions.fetchContainerSettingsSuccess(projectId, containerId, settings));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'containers.fetchSettings.error', defaultMessage: 'trying to fetch container settings' }),
			error,
		}));
	}
}

export function* updateContainerSettings({
	teamspace,
	projectId,
	containerId,
	settings,
	onSuccess,
	onError,
}: UpdateContainerSettingsAction) {
	try {
		const rawSettings = prepareContainerSettingsForBackend(settings);
		yield API.Containers.updateContainerSettings({
			teamspace, projectId, containerId, settings: rawSettings,
		});
		yield put(ContainersActions.updateContainerSettingsSuccess(projectId, containerId, settings));
		onSuccess();
	} catch (error) {
		onError(error);
	}
}

export function* createContainer({ teamspace, projectId, newContainer, onSuccess, onError }: CreateContainerAction) {
	try {
		const id = yield API.Containers.createContainer({ teamspace, projectId, newContainer });

		const container = { _id: id, ...newContainer };
		yield put(ContainersActions.createContainerSuccess(
			projectId,
			container,
		));
		onSuccess();
	} catch (error) {
		onError(error);
	}
}

export function* deleteContainer({ teamspace, projectId, containerId, onSuccess, onError }: DeleteContainerAction) {
	try {
		yield API.Containers.deleteContainer({ teamspace, projectId, containerId });
		yield put(ContainersActions.deleteContainerSuccess(projectId, containerId));
		onSuccess();
	} catch (error) {
		onError(error);
	}
}

export default function* ContainersSaga() {
	yield takeLatest(ContainersTypes.ADD_FAVOURITE, addFavourites);
	yield takeLatest(ContainersTypes.REMOVE_FAVOURITE, removeFavourites);
	yield takeLatest(ContainersTypes.FETCH_CONTAINERS, fetchContainers);
	yield takeEvery(ContainersTypes.FETCH_CONTAINER_STATS, fetchContainerStats);
	yield takeEvery(ContainersTypes.FETCH_CONTAINER_VIEWS, fetchContainerViews);
	yield takeEvery(ContainersTypes.FETCH_CONTAINER_SETTINGS, fetchContainerSettings);
	yield takeLatest(ContainersTypes.UPDATE_CONTAINER_SETTINGS, updateContainerSettings);
	yield takeEvery(ContainersTypes.CREATE_CONTAINER, createContainer);
	yield takeLatest(ContainersTypes.DELETE_CONTAINER, deleteContainer);
}
