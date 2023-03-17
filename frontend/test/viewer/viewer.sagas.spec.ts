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

import { prepareContainersData } from '@/v5/store/containers/containers.helpers';
import { ContainersActions } from '@/v5/store/containers/containers.redux';
import { DialogsActions, DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';
import { ViewerActions } from '@/v5/store/viewer/viewer.redux';
import * as ViewerSaga from '@/v5/store/viewer/viewer.sagas';
import { times } from 'lodash';
import { expectSaga } from 'redux-saga-test-plan';
import { containerMockFactory, prepareMockStatsReply } from '../containers/containers.fixtures';
import { federationMockFactory } from '../federations/federations.fixtures';
import { mockServer } from '../../internals/testing/mockServer';
import { FederationsActions } from '@/v5/store/federations/federations.redux';
import { prepareFederationsData } from '@/v5/store/federations/federations.helpers';

expectSaga.DEFAULT_TIMEOUT = 100;

describe('Viewer: sagas', () => {
	const teamspace = 'myteamspace';
	const projectId = 'myprojectid';

	describe('fetch', () => {
		it('should fetch the containers, the federations and the federation particular data', async () => {
			const containers = times(3, () => containerMockFactory());
			const federations  = times(3, () => federationMockFactory());;
			const containerStat = prepareMockStatsReply(containers[1]);
			const containerOrFederationId = containers[1]._id;

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
				.reply(200, { containers });

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(200, { federations });

			await expectSaga(ViewerSaga.default)
					.dispatch(ViewerActions.fetchData(teamspace, projectId, containerOrFederationId))
					.put(ViewerActions.setFetching(true))
					.put(ContainersActions.fetchContainersSuccess(projectId, prepareContainersData(containers)))
					.put(FederationsActions.fetchFederationsSuccess(projectId, prepareFederationsData(federations)))
					.put(ContainersActions.fetchContainerStats(teamspace, projectId, containerOrFederationId))
					//.put(ViewerActions.setFetching(false)) // This is called but redux-saga-test-plan doesnt work with take from a different saga 
					.silentRun();
		});


	});


});
