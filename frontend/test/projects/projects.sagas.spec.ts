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

import { expectSaga } from 'redux-saga-test-plan';

import * as ProjectsSaga from '@/v5/store/projects/projects.sagas';
import { ProjectsActions } from '@/v5/store/projects/projects.redux';
import { mockServer } from '../../internals/testing/mockServer';
import { alertAction } from '../test.helpers';

describe('Teamspaces: sagas', () => {
	const teamspace = 'teamspaceName';
	const projectId = 'projectId';

	describe('fetch', () => {
		it('should fetch projects data and dispatch FETCH_SUCCESS', async () => {
			const projects = [];

			mockServer
				.get(`/teamspaces/${teamspace}/projects`)
				.reply(200, { projects })

			await expectSaga(ProjectsSaga.default)
				.dispatch(ProjectsActions.fetch(teamspace))
				.put(ProjectsActions.fetchSuccess(teamspace, projects))
				.silentRun();
		});

		it('should handle projects api error and dispatch FETCH_FAILURE', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects`)
				.reply(404)

			await expectSaga(ProjectsSaga.default)
				.dispatch(ProjectsActions.fetch(teamspace))
				.put.like(alertAction('trying to fetch projects'))
				.put(ProjectsActions.fetchFailure())
				.silentRun();
		});
	});

	describe('delete Project', () => {
		const onSuccess = jest.fn();
		const onError = jest.fn();
		it('should call deleteProject endpoint', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}`)
				.reply(200)

			await expectSaga(ProjectsSaga.default)
				.dispatch(ProjectsActions.deleteProject(teamspace, projectId, onSuccess, onError))
				.put(ProjectsActions.deleteProjectSuccess(teamspace, projectId))
				.silentRun();

			expect(onSuccess).toBeCalled();
		});
		it('should call deleteProject endpoint with 404 and open alert modal', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}`)
				.reply(404)

			await expectSaga(ProjectsSaga.default)
				.dispatch(ProjectsActions.deleteProject(teamspace, projectId, onSuccess, onError))
				.silentRun();

			expect(onError).toBeCalled();
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
		const onSuccess = jest.fn();
		const onError = jest.fn();

		it('should create a project', async () => {
			mockServer
					.post(`/teamspaces/${teamspace}/projects`, { name })
					.reply(200, { _id });

			await expectSaga(ProjectsSaga.default)
					.dispatch(ProjectsActions.createProject(teamspace, name, onSuccess, onError))
					.put(ProjectsActions.createProjectSuccess(teamspace, newProject))
					.silentRun();

			expect(onSuccess).toBeCalled();
		});

		it('should call error callback when API call errors', async () => {
			mockServer
					.post(`/teamspaces/${teamspace}/projects`, { name })
					.reply(404)

			await expectSaga(ProjectsSaga.default)
					.dispatch(ProjectsActions.createProject(teamspace, name, onSuccess, onError))
					.silentRun();
			
			expect(onError).toBeCalled();
		});
	});

	describe('updateProject', () => {
		const onSuccess = jest.fn();
		const onError = jest.fn();
		const project = { name: 'newName' };

		it('should call updateProject endpoint', async () => {
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}`)
				.reply(200)

			await expectSaga(ProjectsSaga.default)
				.dispatch(ProjectsActions.updateProject(teamspace, projectId, project, onSuccess, onError))
				.put(ProjectsActions.updateProjectSuccess(teamspace, projectId, project))
				.silentRun();

			expect(onSuccess).toBeCalled();
		});
		it('should call updateProject endpoint with 404 and open alert modal', async () => {
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}`)
				.reply(404)

			await expectSaga(ProjectsSaga.default)
				.dispatch(ProjectsActions.updateProject(teamspace, projectId, project, onSuccess, onError))
				.silentRun();

			expect(onError).toBeCalled();
		});
	});
});
