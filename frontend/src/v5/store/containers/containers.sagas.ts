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
	ContainersActions,
	ContainersTypes,
} from '@/v5/store/containers/containers.redux';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { formatMessage } from '@/v5/services/intl';
import {
	AddFavouriteAction,
	RemoveFavouriteAction,
	FetchContainersResponse,
	FetchContainerStatsResponse,
	FetchContainersAction,
	FetchContainerStatsAction,
} from './containers.types';
import { prepareContainersData } from './containers.helpers';

export function* fetchContainers({ teamspace, projectId }: FetchContainersAction) {
	yield put(ContainersActions.setIsListPending(true));
	try {
		const { containers }: FetchContainersResponse = yield API.fetchContainers({ teamspace, projectId });
		const containersWithoutStats = prepareContainersData(containers);

		yield put(ContainersActions.fetchContainersSuccess(projectId, containersWithoutStats));
		yield put(ContainersActions.setIsListPending(false));

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
		const stats: FetchContainerStatsResponse = yield API.fetchContainerStats({
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

export function* addFavourites({ containerId, teamspace, projectId }: AddFavouriteAction) {
	try {
		yield put(ContainersActions.setFavouriteSuccess(projectId, containerId, true));
		yield API.addFavourites({ teamspace, containerId, projectId });
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
		yield API.removeFavourites({ containerId, teamspace, projectId });
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'containers.removeFavourite.error', defaultMessage: 'trying to remove container from favourites' }),
			error,
		}));
		yield put(ContainersActions.setFavouriteSuccess(projectId, containerId, true));
	}
}

export default function* ContainersSaga() {
	yield takeLatest(ContainersTypes.ADD_FAVOURITE, addFavourites);
	yield takeLatest(ContainersTypes.REMOVE_FAVOURITE, removeFavourites);
	yield takeLatest(ContainersTypes.FETCH_CONTAINERS, fetchContainers);
	yield takeEvery(ContainersTypes.FETCH_CONTAINER_STATS, fetchContainerStats);
}
