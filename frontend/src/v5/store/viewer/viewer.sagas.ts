/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import * as API from '@/v5/services/api';
import { FetchContainersResponse } from '@/v5/services/api/containers';
import { FetchFederationsResponse } from '@/v5/services/api/federations';
import { formatMessage } from '@/v5/services/intl';
import { cancel, put, race, select, take, takeLatest } from 'redux-saga/effects';
import { prepareContainersData } from '../containers/containers.helpers';
import { ContainersActions, ContainersTypes } from '../containers/containers.redux';
import { DialogsActions, DialogsTypes } from '../dialogs/dialogs.redux';
import { prepareFederationsData } from '../federations/federations.helpers';
import { FederationsActions, FederationsTypes } from '../federations/federations.redux';
import { selectContainersByFederationId } from '../federations/federations.selectors';
import { TicketsCardActions } from '../tickets/card/ticketsCard.redux';
import { FetchDataAction, ViewerActions, ViewerTypes } from './viewer.redux';
import { DrawingsActions } from '../drawings/drawings.redux';

function* fetchData({ teamspace, containerOrFederation, project }: FetchDataAction) {
	yield put(ViewerActions.setFetching(true));
	try {
		const { federations }: FetchFederationsResponse = yield API.Federations.fetchFederations(teamspace, project);
		const federationsWithoutStats = prepareFederationsData(federations);
		yield put(FederationsActions.fetchFederationsSuccess(project, federationsWithoutStats));

		const { containers }: FetchContainersResponse = yield API.Containers.fetchContainers(teamspace, project);
		const containersWithoutStats = prepareContainersData(containers);
		yield put(ContainersActions.fetchContainersSuccess(project, containersWithoutStats));

		const isFederation = federationsWithoutStats.some(({ _id }) => _id === containerOrFederation);
		let containerToFetchStatsOf;

		if (isFederation) {
			yield put(FederationsActions.fetchFederationStats(teamspace, project, containerOrFederation));
			yield put(FederationsActions.fetchFederationJobs(teamspace, project, containerOrFederation));
			yield put(FederationsActions.fetchFederationUsers(teamspace, project, containerOrFederation));
			yield take(FederationsTypes.FETCH_FEDERATION_STATS_SUCCESS);
			// selectContainersByFederationId only returns containers user has permissions to
			const assignedContainers = yield select(selectContainersByFederationId, containerOrFederation);
			containerToFetchStatsOf = assignedContainers.map((cont) => cont._id);

			yield put(FederationsActions.fetchFederationSettings(teamspace, project, containerOrFederation));
			yield take(FederationsTypes.FETCH_FEDERATION_SETTINGS_SUCCESS);
		} else {
			yield put(ContainersActions.fetchContainerJobs(teamspace, project, containerOrFederation));
			yield put(ContainersActions.fetchContainerUsers(teamspace, project, containerOrFederation));
			containerToFetchStatsOf = [containerOrFederation];
		}

		for (const containerId of containerToFetchStatsOf) {
			// stats are needed to determine whether to show the model is empty overlay
			yield put(ContainersActions.fetchContainerStats(
				teamspace,
				project,
				containerId,
			));

			const result = yield race({
				fail: take(DialogsTypes.OPEN),
				success: take((action)=> action.type === ContainersTypes.FETCH_CONTAINER_STATS_SUCCESS && action.containerId === containerId),
			});

			if (result.fail) {
				yield cancel();
			}
		}

		yield put(TicketsCardActions.fetchTicketsList(teamspace, project, containerOrFederation, isFederation));
		yield put(DrawingsActions.fetchDrawings(teamspace, project));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'viewer.fetch.error', defaultMessage: 'trying to fetch viewer data' }),
			error,
		}));
	} finally {
		yield put(ViewerActions.setFetching(false));
	}
}

export default function* ViewerSaga() {
	yield takeLatest(ViewerTypes.FETCH_DATA, fetchData);
}
