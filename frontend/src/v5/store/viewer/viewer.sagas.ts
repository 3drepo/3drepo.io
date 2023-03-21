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
import { all, put, select, take, takeLatest } from 'redux-saga/effects';
import { prepareContainersData } from '../containers/containers.helpers';
import { ContainersActions, ContainersTypes } from '../containers/containers.redux';
import { DialogsActions } from '../dialogs/dialogs.redux';
import { prepareFederationsData } from '../federations/federations.helpers';
import { FederationsActions, FederationsTypes } from '../federations/federations.redux';
import { selectFederationById } from '../federations/federations.selectors';
import { IFederation } from '../federations/federations.types';
import { FetchDataAction, ViewerActionsCreators, ViewerTypes } from './viewer.redux';

function* fetchData({ teamspace, containerOrFederation, project }: FetchDataAction) {
	yield put(ViewerActionsCreators.setFetching(true));
	try {
		const { federations }: FetchFederationsResponse = yield API.Federations.fetchFederations(teamspace, project);
		const federationsWithoutStats = prepareFederationsData(federations);
		yield put(FederationsActions.fetchFederationsSuccess(project, federationsWithoutStats));

		const { containers }: FetchContainersResponse = yield API.Containers.fetchContainers(teamspace, project);
		const containersWithoutStats = prepareContainersData(containers);
		yield put(ContainersActions.fetchContainersSuccess(project, containersWithoutStats));

		const isFederation = federationsWithoutStats.some(({ _id }) => _id === containerOrFederation);

		if (isFederation) {
			yield put(FederationsActions.fetchFederationStats(teamspace, project, containerOrFederation));
			yield take(FederationsTypes.FETCH_FEDERATION_STATS_SUCCESS);
			const federation: IFederation = yield select(selectFederationById, containerOrFederation);
			yield all(federation.containers.map(function* fetchAndWaitForContainer(container) {
				yield put(ContainersActions.fetchContainerStats(teamspace, project, container));
				yield take(ContainersTypes.FETCH_CONTAINER_STATS_SUCCESS);
			}));
		} else {
			yield put(ContainersActions.fetchContainerStats(teamspace, project, containerOrFederation));
			yield take(ContainersTypes.FETCH_CONTAINER_STATS_SUCCESS);
		}
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'viewer.fetch.error', defaultMessage: 'trying to fetch viewer data' }),
			error,
		}));
	}

	yield put(ViewerActionsCreators.setFetching(false));
}

export default function* ViewerSaga() {
	yield takeLatest(ViewerTypes.FETCH_DATA, fetchData);
}
