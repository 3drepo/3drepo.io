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
import * as API from '@/v5/services/api';
import {
	AddFavouriteAction,
	ContainersActions,
	ContainersTypes,
	CreateContainerAction,
	DeleteContainerAction,
	FetchContainersAction,
	FetchContainerStatsAction,
	RemoveFavouriteAction,
} from '@/v5/store/containers/containers.redux';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { formatMessage } from '@/v5/services/intl';
import { FetchContainersResponse } from '@/v5/services/api/containers';

import { prepareContainersData } from './containers.helpers';

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

		yield put(ContainersActions.fetchContainersSuccess(projectId, containersWithoutStats));

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

		yield put(ContainersActions.fetchContainerStatsSuccess(projectId, containerId, stats));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'containers.fetchStats.error', defaultMessage: 'trying to fetch containers details' }),
			error,
		}));
	}
}

export function* createContainer({ teamspace, projectId, newContainer }: CreateContainerAction) {
	try {
		const id = yield API.Containers.createContainer({ teamspace, projectId, newContainer });

		const container = { _id: id, ...newContainer };
		yield put(ContainersActions.createContainerSuccess(
			projectId,
			container,
		));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'containers.creation.error', defaultMessage: 'trying to create container' }),
			error,
		}));
	}
}

export function* deleteContainer({ teamspace, projectId, containerId }: DeleteContainerAction) {
	try {
		yield API.Containers.deleteContainer({ teamspace, projectId, containerId });
		yield put(ContainersActions.deleteContainerSuccess(projectId, containerId));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'container.delete.error', defaultMessage: 'trying to delete container' }),
			error,
		}));
	}
}

export default function* ContainersSaga() {
	yield takeLatest(ContainersTypes.ADD_FAVOURITE, addFavourites);
	yield takeLatest(ContainersTypes.REMOVE_FAVOURITE, removeFavourites);
	yield takeLatest(ContainersTypes.FETCH_CONTAINERS, fetchContainers);
	yield takeEvery(ContainersTypes.FETCH_CONTAINER_STATS, fetchContainerStats);
	yield takeLatest(ContainersTypes.CREATE_CONTAINER, createContainer);
	yield takeLatest(ContainersTypes.DELETE_CONTAINER, deleteContainer);
}
