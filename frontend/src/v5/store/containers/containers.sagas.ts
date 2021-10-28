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

import { all, put, takeLatest, select, call } from 'redux-saga/effects';
import * as API from '@/v5/services/api';
import {
	ContainersActions,
	ContainersTypes,
} from '@/v5/store/containers/containers.redux';
import { selectCurrentTeamspaceUsers } from '@/v5/store/teamspaces/teamspaces.selectors';
import { prepareRevisionsData } from '@/v5/store/containers/containers.helpers';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import {
	AddFavouriteAction,
	RemoveFavouriteAction,
	ContainerStatuses,
	SetRevisionVoidStatusAction,
} from './containers.types';

export function* fetchContainers({ teamspace, projectId }) {
	yield put(ContainersActions.setIsPending(true));
	try {
		const { data: { containers } } = yield API.fetchContainers(teamspace, projectId);

		const stats = yield all(
			containers.map(
				(container) => API.fetchContainerStats(teamspace, projectId, container._id),
			),
		);

		const containersWithStats = containers.map((container, index) => {
			const containerStats = stats[index].data;
			return {
				...container,
				revisionsCount: containerStats.revisions.total,
				lastUpdated: containerStats.revisions.lastUpdate ? new Date(containerStats.revisions.lastUpdate) : null,
				latestRevision: containerStats.revisions.latestRevision ?? '',
				type: containerStats.type ?? '',
				code: containerStats.code ?? '',
				status: containerStats.status ?? ContainerStatuses.OK,
				revisions: [],
				isPending: true,
			};
		});

		yield put(ContainersActions.fetchContainersSuccess(projectId, containersWithStats));
		yield put(ContainersActions.setIsPending(false));
	} catch (e) {
		yield put(ContainersActions.setIsPending(false));
		console.error(e);
	}
}

export function* addFavourites({ containerId, teamspace, projectId }: AddFavouriteAction) {
	try {
		yield API.addFavourites({ teamspace, containerId, projectId });
		yield put(ContainersActions.setFavouriteSuccess(projectId, containerId, true));
	} catch (e) {
		console.error(e);
	}
}

export function* removeFavourites({ containerId, teamspace, projectId }: RemoveFavouriteAction) {
	try {
		yield API.removeFavourites({ containerId, teamspace, projectId });
		yield put(ContainersActions.setFavouriteSuccess(projectId, containerId, false));
	} catch (e) {
		console.error(e);
	}
}

export function* setRevisionVoidStatus({
	teamspace, projectId, containerId, revisionId, isVoid,
}: SetRevisionVoidStatusAction) {
	try {
		yield API.setRevisionVoidStatus(teamspace, projectId, containerId, revisionId, isVoid);
		yield put(ContainersActions.setRevisionVoidStatusSuccess(projectId, containerId, revisionId, isVoid));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: 'trying to set revision void status',
			error,
		}));
	}
}

export function* fetchRevisions({ teamspace, projectId, containerId }) {
	yield put(ContainersActions.setRevisionsIsPending(projectId, containerId, true));
	try {
		const { data: { revisions } } = yield API.fetchRevisions(teamspace, projectId, containerId);
		const teamspaceUsers = yield select(selectCurrentTeamspaceUsers);
		const revisionsWithUsersInfo = yield call(prepareRevisionsData, revisions, teamspaceUsers);

		yield put(ContainersActions.fetchRevisionsSuccess(projectId, containerId, revisionsWithUsersInfo));
		yield put(ContainersActions.setRevisionsIsPending(projectId, containerId, false));
	} catch (e) {
		yield put(ContainersActions.setRevisionsIsPending(projectId, containerId, false));
		console.error(e);
	}
}

export default function* ContainersSaga() {
	yield takeLatest(ContainersTypes.FETCH_CONTAINERS as any, fetchContainers);
	yield takeLatest(ContainersTypes.ADD_FAVOURITE, addFavourites);
	yield takeLatest(ContainersTypes.REMOVE_FAVOURITE, removeFavourites);
	yield takeLatest(ContainersTypes.FETCH_REVISIONS as any, fetchRevisions);
	yield takeLatest(ContainersTypes.SET_REVISION_VOID_STATUS, setRevisionVoidStatus);
}
