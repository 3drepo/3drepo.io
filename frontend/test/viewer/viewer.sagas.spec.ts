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
import { containerMockFactory, prepareMockBasecontainer, prepareMockStatsReply } from '../containers/containers.fixtures';
import { federationMockFactory, prepareMockBaseFederation, prepareMockFederationStatsReply } from '../federations/federations.fixtures';
import { mockServer } from '../../internals/testing/mockServer';
import { createTestStore, findById } from '../test.helpers';
import { ProjectsActions } from '@/v5/store/projects/projects.redux';
import { selectContainerById } from '@/v5/store/containers/containers.selectors';
import { prepareSingleContainerData } from '@/v5/store/containers/containers.helpers';
import { selectFederationById } from '@/v5/store/federations/federations.selectors';
import { DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';
import { selectDialogs } from '@/v5/store/dialogs/dialogs.selectors';


describe('Viewer: sagas', () => {
	const teamspace = 'myteamspace';
	const projectId = 'myprojectid';
	
	let dispatch, getState, waitForActions;

	beforeEach(() => {
		({ dispatch, getState,  waitForActions } = createTestStore());
		dispatch(ProjectsActions.setCurrentProject(projectId));
	});	

	describe('fetch', () => {
		it('should fetch the containers, the federations and the container particular data for viewing a container', async () => {
			const containers = times(3, () => containerMockFactory());
			const federations  = times(3, () => federationMockFactory());
			const baseContainers = containers.map(prepareMockBasecontainer); 
			const containerStat = prepareMockStatsReply(containers[1]);
			const containerOrFederationId = containers[1]._id;

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(200, { federations });

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
				.reply(200, {containers: baseContainers});

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerOrFederationId}/stats`)
				.reply(200, containerStat);
				
			await waitForActions(() => {
				dispatch(ViewerActionsCreators.fetchData(teamspace, projectId, containerOrFederationId));
			}, [ViewerActionsCreators.setFetching(false)]);

			const container = selectContainerById(getState(), containerOrFederationId);

			expect(container).toEqual(prepareSingleContainerData(baseContainers[1], containerStat));
		});

		it('should fetch the containers, the federations, the federation data and the containers data for a particular federation', async () => {
			const containers = times(6, () => containerMockFactory());
			const federations = times(3, () => federationMockFactory());
			const baseFederations = federations.map(prepareMockBaseFederation);
			const containersStats = containers.map(prepareMockStatsReply);
			const baseContainers = containers.map(prepareMockBasecontainer);
			const containersInState = baseContainers.map((base, index) => prepareSingleContainerData(base, containersStats[index]));
			const theFederation = federations[1];
			theFederation.containers = [ baseContainers[2]._id, baseContainers[0]._id];
			const containerOrFederationId = theFederation._id;

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(200, { federations: baseFederations });

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
				.reply(200, {containers: baseContainers});

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${containerOrFederationId}/stats`)
				.reply(200, prepareMockFederationStatsReply(theFederation));

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${baseContainers[0]._id}/stats`)
				.reply(200, containersStats[0]);

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${baseContainers[2]._id}/stats`)
				.reply(200, containersStats[2]);			
				
			await waitForActions(() => {
				dispatch(ViewerActionsCreators.fetchData(teamspace, projectId, containerOrFederationId));
			}, [ViewerActionsCreators.setFetching(false)]);


			const federation = selectFederationById(getState(), containerOrFederationId);
			const containersId = [...federation.containers].sort();
	
			containersId.forEach(containerId => {
				const theFetchedContainer = findById(containersInState, containerId);
				const container = selectContainerById(getState(), containerId);
				expect(container).toEqual(theFetchedContainer);
			})

		});

		it('should open a error dialog if it cant find the federation/container', async () => {
			const containers = times(3, () => containerMockFactory());
			const federations  = times(3, () => federationMockFactory());
			const baseContainers = containers.map(prepareMockBasecontainer); 
			const containerOrFederationId = 'nonexistentid';

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations`)
				.reply(200, { federations });

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
				.reply(200, {containers: baseContainers});

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerOrFederationId}/stats`)
				.reply(404, {});
				
			await waitForActions(() => {
				dispatch(ViewerActionsCreators.fetchData(teamspace, projectId, containerOrFederationId));
			}, [DialogsTypes.OPEN]);

			const dialogs =  selectDialogs(getState());

			expect(dialogs.length).toEqual(1);
			expect(dialogs[0].modalType).toEqual('alert');
		});
	});
});
