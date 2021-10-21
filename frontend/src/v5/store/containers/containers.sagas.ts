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
import * as API from '@/v5/services/api';
import {
	ContainersActions,
	ContainersTypes,
} from '@/v5/store/containers/containers.redux';
import { AddFavouriteAction, RemoveFavouriteAction } from './containers.types';
import { ExtendedAction } from '@/v5/store/store.types';
import {
	FavouritePayload,
	FetchContainersPayload,
	FetchContainersResponse,
	FetchContainerStatsResponse,
} from './containers.types';
import { prepareContainersData } from './containers.helpers';

export function* addFavourites({ containerId, teamspace, projectId }: AddFavouriteAction) {
	try {
		yield API.addFavourites({ teamspace, containerId, projectId });
		yield put(ContainersActions.setFavouriteSuccess(containerId, true));
	} catch (e) {
		console.error(e);
	}
}

export function* removeFavourites({ containerId, teamspace, projectId }: RemoveFavouriteAction) {
	try {
		yield API.removeFavourites({ containerId, teamspace, projectId });
		yield put(ContainersActions.setFavouriteSuccess(containerId, false));
	} catch (e) {
		console.error(e);
	}
}

export function* fetchContainers({ teamspace, projectId }: ExtendedAction<FetchContainersPayload>) {
	yield put(ContainersActions.setIsListPending(true));
	yield put(ContainersActions.setAreStatsPending(true));
	try {
		const { containers }: FetchContainersResponse = yield API.fetchContainers({ teamspace, projectId });
		const containersWithoutStats = prepareContainersData(containers);
		yield put(ContainersActions.setIsListPending(false));

		yield put(ContainersActions.fetchContainersSuccess(projectId, containersWithoutStats));

		const stats: FetchContainerStatsResponse[] = yield all(
			containers.map(
				(container) => API.fetchContainerStats({
					teamspace, projectId, containerId: container._id,
				}),
			),
		);
		const containersWithStats = prepareContainersData(containers, stats);
		yield put(ContainersActions.fetchContainersSuccess(projectId, containersWithStats));

		yield put(ContainersActions.setAreStatsPending(false));
	} catch (e) {
		yield put(ContainersActions.setIsListPending(false));
		yield put(ContainersActions.setAreStatsPending(false));
		console.error(e);
	}
}

export default function* ContainersSaga() {
	yield takeLatest(ContainersTypes.ADD_FAVOURITE, addFavourites);
	yield takeLatest(ContainersTypes.REMOVE_FAVOURITE, removeFavourites);
	yield takeLatest(ContainersTypes.FETCH_CONTAINERS, fetchContainers);
}
