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

import { all, put, takeLatest, select } from 'redux-saga/effects';
import * as API from '@/v5/services/api';
import {
	ContainersActions,
	ContainersTypes,
} from '@/v5/store/containers/containers.redux';
import { selectCurrentTeamspaceUsers } from '@/v5/store/teamspaces/teamspaces.selectors';
import { ContainerStatuses } from './containers.types';

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
			};
		});

		yield put(ContainersActions.fetchContainersSuccess(projectId, containersWithStats));
		yield put(ContainersActions.setIsPending(false));
	} catch (e) {
		yield put(ContainersActions.setIsPending(false));
		console.error(e);
	}
}

export function* fetchRevisions({ teamspace, projectId, containerId }) {
	try {
		const { data: { revisions } } = yield API.fetchRevisions(teamspace, projectId, containerId);
		const teamspaceUsers = yield select(selectCurrentTeamspaceUsers);

		const revisionsWithUsersInfo = revisions.map(({ author, ...revision }) => ({
			...revision,
			author: teamspaceUsers.find((user) => user.user === author),
		}));

		yield put(ContainersActions.fetchRevisionsSuccess(projectId, containerId, revisionsWithUsersInfo));
	} catch (e) {
		console.error(e);
	}
}

export default function* ContainersSaga() {
	yield takeLatest(ContainersTypes.FETCH_CONTAINERS as any, fetchContainers);
	yield takeLatest(ContainersTypes.FETCH_REVISIONS as any, fetchRevisions);
}
