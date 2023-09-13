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

import { ProjectsActions } from '@/v5/store/projects/projects.redux';
import { mockServer } from '../../internals/testing/mockServer';
import { createTestStore } from '../test.helpers';
import { TeamspacesActions } from '@/v5/store/teamspaces/teamspaces.redux';
import { projectMockFactory } from './projects.fixtures';
import { selectCurrentProjects } from '@/v5/store/projects/projects.selectors';
import { DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';
import { getWaitablePromise } from '@/v5/helpers/async.helpers';

describe('Teamspaces: sagas', () => {
	const teamspace = 'teamspace';
	const projectId = 'project';
	const mockProject = projectMockFactory({ _id: projectId });
	let onSuccess, onError;
	let dispatch, getState, waitForActions;
	let resolve, promiseToResolve;

	beforeEach(() => {
		onSuccess = jest.fn();
		onError = jest.fn();
		({ dispatch, getState, waitForActions } = createTestStore());
		({ resolve, promiseToResolve } = getWaitablePromise());
		dispatch(TeamspacesActions.setCurrentTeamspace(teamspace));
	});

	describe('fetch', () => {
		it('should fetch projects data and dispatch FETCH_SUCCESS', async () => {
			const projects = [mockProject];

			mockServer
				.get(`/teamspaces/${teamspace}/projects`)
				.reply(200, { projects })

			await waitForActions(() => {
				dispatch(ProjectsActions.fetch(teamspace));
			}, [ProjectsActions.fetchSuccess(teamspace, projects)]);
		});

		it('should handle projects api error and dispatch FETCH_FAILURE', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects`)
				.reply(404)

			await waitForActions(() => {
				dispatch(ProjectsActions.fetch(teamspace));
			}, [DialogsTypes.OPEN]);
				
			const projectsInStore = selectCurrentProjects(getState());
			expect(projectsInStore).toEqual([]);
		});
	});

	describe('delete Project', () => {
		beforeEach(() => {
			dispatch(ProjectsActions.fetchSuccess(teamspace, [mockProject]));
		});
		it('should call deleteProject endpoint', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}`)
				.reply(200)

			await waitForActions(() => {
				dispatch(ProjectsActions.deleteProject(teamspace, projectId, onSuccess, onError));
			}, [ProjectsActions.deleteProjectSuccess(teamspace, projectId)]);

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		});
		it('should call deleteProject endpoint with 404 and open alert modal', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}`)
				.reply(404)

			dispatch(ProjectsActions.deleteProject(
				teamspace,
				projectId,
				onSuccess,
				() => { onError(); resolve(); },
			));
			await promiseToResolve;

			const projectsInStore = selectCurrentProjects(getState());
			expect(projectsInStore).toEqual([mockProject]);
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		});
	});

	describe('createProject', () => {
		const name = 'newProject';
		const _id = '123';
		const newProject = {
			name,
			_id,
			isAdmin: true,
		};

		beforeEach(() => {
			dispatch(ProjectsActions.fetchSuccess(teamspace, []));
		});

		it('should create a project', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects`, { name })
				.reply(200, { _id });

			await waitForActions(() => {
					dispatch(ProjectsActions.createProject(teamspace, name, onSuccess, onError))
			}, [ProjectsActions.createProjectSuccess(teamspace, newProject)]);

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		});

		it('should call error callback when API call errors', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects`, { name })
				.reply(404)

			dispatch(ProjectsActions.createProject(
				teamspace,
				name,
				onSuccess, 
				() => { onError(); resolve(); },
			));
			await promiseToResolve;

			const projectsInStore = selectCurrentProjects(getState());
			expect(projectsInStore).toEqual([]);
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		});
	});

	describe('updateProject', () => {
		const updatedProject = { ...mockProject, name: mockProject + "new" };
		beforeEach(() => {
			dispatch(ProjectsActions.fetchSuccess(teamspace, [mockProject]));
		});

		it('should call updateProject endpoint', async () => {
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}`)
				.reply(200)

			await waitForActions(() => {
				dispatch(ProjectsActions.updateProject(teamspace, projectId, updatedProject, onSuccess, onError));
			}, [ProjectsActions.updateProjectSuccess(teamspace, projectId, updatedProject)])

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		});
		it('should call updateProject endpoint with 404 and open alert modal', async () => {
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}`)
				.reply(404)

			dispatch(ProjectsActions.updateProject(
				teamspace,
				projectId,
				updatedProject,
				onSuccess, 
				() => { onError(); resolve(); },
			));
			await promiseToResolve;

			const projectsInStore = selectCurrentProjects(getState());
			expect(projectsInStore).toEqual([mockProject]);
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		});
	});
});
