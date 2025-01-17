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
	FetchContainerJobsAction,
	FetchContainersAction,
	FetchContainerSettingsAction,
	FetchContainerStatsAction,
	FetchContainerUsersAction,
	FetchContainerViewsAction,
	RemoveFavouriteAction,
	UpdateContainerSettingsAction,
} from '@/v5/store/containers/containers.redux';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { formatMessage } from '@/v5/services/intl';
import { FetchContainersResponse } from '@/v5/services/api/containers';
import { isEqualWith } from 'lodash';
import { ContainerStats, FetchContainerViewsResponseView, IContainer } from './containers.types';
import { prepareContainerSettingsForBackend, prepareContainerSettingsForFrontend, prepareContainersData } from './containers.helpers';
import { selectContainerById, selectContainers, selectIsListPending } from './containers.selectors';
import { compByColum } from '../store.helpers';
import { getSortingFunction } from '@components/dashboard/dashboardList/useOrderedList/useOrderedList.helpers';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';
import { LifoQueue } from '@/v5/helpers/functions.helpers';

const statsQueue = new LifoQueue<ContainerStats>(API.Containers.fetchContainerStats, 30);

export function* addFavourites({ containerId, teamspace, projectId }: AddFavouriteAction) {
	try {
		yield put(ContainersActions.setFavouriteSuccess(projectId, containerId, true));
		yield API.Containers.addFavourite(teamspace, projectId, containerId);
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
		yield API.Containers.removeFavourite(teamspace, projectId, containerId);
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'containers.removeFavourite.error', defaultMessage: 'trying to remove container from favourites' }),
			error,
		}));
		yield put(ContainersActions.setFavouriteSuccess(projectId, containerId, true));
	}
}

export function* fetchContainerStats({ teamspace, projectId, containerId }: FetchContainerStatsAction) {
	try {
		const container: IContainer = yield select(selectContainerById, containerId);
		const stats = yield statsQueue.enqueue(teamspace, projectId, containerId);
		
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

export function* fetchContainers({ teamspace, projectId }: FetchContainersAction) {
	try {
		const { containers }: FetchContainersResponse = yield API.Containers.fetchContainers(teamspace, projectId);
		const containersWithoutStats = prepareContainersData(containers);
		const storedContainers = yield select(selectContainers);
		const isPending = yield select(selectIsListPending);

		// Only update if theres is new data
		if (isPending || !isEqualWith(storedContainers, containersWithoutStats, compByColum(['_id', 'name', 'role', 'isFavourite']))) {
			yield put(ContainersActions.fetchContainersSuccess(projectId, containersWithoutStats));
		}

		statsQueue.resetQueue();

		yield all(
			containers.sort(getSortingFunction({ column: ['name'], direction:[SortingDirection.DESCENDING] })).map(
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

export function* fetchContainerViews({
	teamspace,
	projectId,
	containerId,
}: FetchContainerViewsAction) {
	try {
		const { views }: FetchContainerViewsResponseView = yield API.Containers.fetchContainerViews(teamspace, projectId, containerId);
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
		const rawSettings = yield API.Containers.fetchContainerSettings(teamspace, projectId, containerId);
		const settings = prepareContainerSettingsForFrontend(rawSettings);
		yield put(ContainersActions.fetchContainerSettingsSuccess(projectId, containerId, settings));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'containers.fetchSettings.error', defaultMessage: 'trying to fetch container settings' }),
			error,
		}));
	}
}

export function* fetchContainerUsers({
	teamspace,
	projectId,
	containerId,
}: FetchContainerUsersAction) {
	try {
		const { users: nonViewerUsers } = yield API.Containers.fetchContainerUsers(teamspace, projectId, containerId, true);
		const { users: allUsers } = yield API.Containers.fetchContainerUsers(teamspace, projectId, containerId);
		const users = allUsers.map((user) => ({ user, isViewer: !nonViewerUsers.includes(user) }));

		yield put(ContainersActions.updateContainerSuccess(projectId, containerId, { users }));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'containers.fetchUsers.error', defaultMessage: 'trying to fetch container users' }),
			error,
		}));
	}
}

export function* fetchContainerJobs({
	teamspace,
	projectId,
	containerId,
}: FetchContainerJobsAction) {
	try {
		const { jobs: nonViewerJobs } = yield API.Containers.fetchContainerJobs(teamspace, projectId, containerId, true);
		const { jobs: allJobs } = yield API.Containers.fetchContainerJobs(teamspace, projectId, containerId);
		const jobs = allJobs.map((job) => ({ _id: job, isViewer: !nonViewerJobs.includes(job) }));
		yield put(ContainersActions.updateContainerSuccess(projectId, containerId, { jobs }));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'containers.fetchJobs.error', defaultMessage: 'trying to fetch container Jobs' }),
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
		yield API.Containers.updateContainerSettings(teamspace, projectId, containerId, rawSettings);
		yield put(ContainersActions.updateContainerSettingsSuccess(projectId, containerId, settings));
		onSuccess();
	} catch (error) {
		onError(error);
	}
}

export function* createContainer({ teamspace, projectId, newContainer, onSuccess, onError }: CreateContainerAction) {
	try {
		const id = yield API.Containers.createContainer(teamspace, projectId, newContainer);

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
		yield API.Containers.deleteContainer(teamspace, projectId, containerId);
		yield put(ContainersActions.deleteContainerSuccess(projectId, containerId));
		onSuccess();
	} catch (error) {
		onError(error);
	}
}

export function* resetContainerStatsQueue() {
	statsQueue.resetQueue();
}

export default function* ContainersSaga() {
	yield takeLatest(ContainersTypes.ADD_FAVOURITE, addFavourites);
	yield takeLatest(ContainersTypes.REMOVE_FAVOURITE, removeFavourites);
	yield takeLatest(ContainersTypes.FETCH_CONTAINERS, fetchContainers);
	yield takeEvery(ContainersTypes.FETCH_CONTAINER_STATS, fetchContainerStats);
	yield takeEvery(ContainersTypes.FETCH_CONTAINER_VIEWS, fetchContainerViews);
	yield takeEvery(ContainersTypes.FETCH_CONTAINER_SETTINGS, fetchContainerSettings);
	yield takeLatest(ContainersTypes.UPDATE_CONTAINER_SETTINGS, updateContainerSettings);
	yield takeLatest(ContainersTypes.FETCH_CONTAINER_USERS, fetchContainerUsers);
	yield takeLatest(ContainersTypes.FETCH_CONTAINER_JOBS, fetchContainerJobs);
	yield takeEvery(ContainersTypes.CREATE_CONTAINER, createContainer);
	yield takeLatest(ContainersTypes.DELETE_CONTAINER, deleteContainer);
	yield takeEvery(ContainersTypes.RESET_CONTAINER_STATS_QUEUE, resetContainerStatsQueue);
}
