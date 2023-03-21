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

import { ViewerActionsCreators, ViewerTypes } from '@/v5/store/viewer/viewer.redux';
import { times } from 'lodash';
import { containerMockFactory, prepareMockStatsReply } from '../containers/containers.fixtures';
import { federationMockFactory } from '../federations/federations.fixtures';
import { mockServer } from '../../internals/testing/mockServer';
import { createTestStore } from '../test.helpers';
import { ProjectsActions, ProjectsTypes } from '@/v5/store/projects/projects.redux';
import { projectMockFactory } from '../projects/projects.fixtures';

describe('Viewer: sagas', () => {
	const teamspace = 'myteamspace';
	const projectId = 'myprojectid';
	
	let dispatch, getState, waitForActions;

	beforeEach(() => {
		({ dispatch, getState,  waitForActions } = createTestStore());
		dispatch(ProjectsActions.setCurrentProject(projectId));
	});	

	describe('fetch', () => {
		it('should fetch the containers, the federations and the federation particular data', async () => {
			const containers = times(3, () => containerMockFactory());
			const federations  = times(3, () => federationMockFactory());
			const containerStat = prepareMockStatsReply(containers[1]);
			const containerOrFederationId = containers[1]._id;
			
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(200, { federations });

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
				.reply(200, {containers});

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerOrFederationId}/stats`)
				.reply(200, containerStat);
				
			await waitForActions(() => {
				dispatch(ViewerActionsCreators.fetchData(teamspace, projectId, containerOrFederationId));
			}, [ViewerActionsCreators.setFetching(false)]);
		});


	});


});
