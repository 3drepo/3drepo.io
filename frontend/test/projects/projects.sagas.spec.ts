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
import { createTestStore, spyOnAxiosApiCallWithFile } from '../test.helpers';
import { TeamspacesActions } from '@/v5/store/teamspaces/teamspaces.redux';
import { generateFakeProjectImageFile, projectMockFactory } from './projects.fixtures';
import { selectCurrentProjects } from '@/v5/store/projects/projects.selectors';
import { DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';
import { getWaitablePromise } from '@/v5/helpers/async.helpers';
import { templateMockFactory } from '../tickets/tickets.fixture';
import { selectCurrentProjectTemplates } from '@/v5/store/projects/projects.selectors';
import api from '@/v5/services/api/default';
import { FederationsActions } from '@/v5/store/federations/federations.redux';
import { federationMockFactory } from '../federations/federations.fixtures';
import { AddOn } from '@/v5/store/store.types';

describe('Teamspaces: sagas', () => {
	const teamspace = 'teamspace';
	const projectId = 'project';
	const mockProject = projectMockFactory({ _id: projectId });
	const mockImageFile = generateFakeProjectImageFile();
	const federationId = 'federationId';
	const mockFederation = federationMockFactory({ _id: federationId });
	const templateId = 'template';
	const mockTemplate = templateMockFactory({ _id: templateId });
	let onSuccess, onError;
	let dispatch, getState, waitForActions;
	let resolve, promiseToResolve;
	let spy;

	beforeEach(() => {
		onSuccess = jest.fn();
		onError = jest.fn();
		({ dispatch, getState, waitForActions } = createTestStore());
		({ resolve, promiseToResolve } = getWaitablePromise());
		dispatch(TeamspacesActions.setCurrentTeamspace(teamspace));
	});

	beforeAll(() => {
		spy = spyOnAxiosApiCallWithFile(api, 'put');
	});

	afterAll(() => { spy.mockClear(); });

	describe('fetch', () => {
		const addOns = [AddOn.Risks];
		it('should fetch projects data and dispatch FETCH_SUCCESS', async () => {
			const projects = [mockProject];

			mockServer
				.get(`/teamspaces/${teamspace}/addOns`)
				.reply(200, {modules: addOns})
				.get(`/teamspaces/${teamspace}/projects`)
				.reply(200, { projects })

			await waitForActions(() => {
				dispatch(TeamspacesActions.fetchAddOnsSuccess(teamspace, addOns));
				dispatch(ProjectsActions.fetch(teamspace));
			}, [ProjectsActions.fetchSuccess(teamspace, projects)]);
		});

		it('should handle projects api error and dispatch FETCH_FAILURE', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/addOns`)
				.reply(200, {modules: addOns})
				.get(`/teamspaces/${teamspace}/projects`)
				.reply(404)

			await waitForActions(() => {
				dispatch(ProjectsActions.fetch(teamspace));
				dispatch(TeamspacesActions.fetchAddOnsSuccess(teamspace, addOns));
			}, [DialogsTypes.OPEN]);
				
			const projectsInStore = selectCurrentProjects(getState());
			expect(projectsInStore).toEqual([]);
		});

		it('should handle teamspace api error and dispatch FETCH_FAILURE', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/addOns`)
				.reply(401)

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
		const name = `new${mockProject.name}`;
		const _id = `new${projectId}`;
		const newProject = {
			name,
			_id,
			isAdmin: true,
		};
		let onImageError;

		beforeEach(() => {
			dispatch(ProjectsActions.fetchSuccess(teamspace, []));
			onImageError = jest.fn();
		});

		it('should create a project without image', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects`, { name })
				.reply(200, { _id });

			await waitForActions(() => {
				dispatch(ProjectsActions.createProject(teamspace, { name }, onSuccess, onImageError, onError))
			}, [ProjectsActions.createProjectSuccess(teamspace, newProject)]);

			expect(onSuccess).toHaveBeenCalled();
			expect(onImageError).not.toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		});

		it('should create a project with image', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects`, { name })
				.reply(200, { _id })
				.put(`/teamspaces/${teamspace}/projects/${_id}/image`)
				.reply(200);

			await Promise.all([
				waitForActions(() => {
					dispatch(ProjectsActions.createProject(
						teamspace,
						{ name, image: mockImageFile },
						() => { onSuccess(); resolve(); },
						onImageError,
						onError,
					))
				}, [ProjectsActions.createProjectSuccess(teamspace, newProject)]),
				promiseToResolve,
			]);

			expect(onSuccess).toHaveBeenCalled();
			expect(onImageError).not.toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		});

		it('should call error callback when API call errors for name', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects`, { name })
				.reply(404)

			dispatch(ProjectsActions.createProject(
				teamspace,
				{ name },
				onSuccess,
				onImageError,
				() => { onError(); resolve(); },
			));
			await promiseToResolve;

			const projectsInStore = selectCurrentProjects(getState());
			expect(projectsInStore).toEqual([]);
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onImageError).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		});

		it('should call error callback when API call errors for image', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects`, { name })
				.reply(200, { _id })
				.put(`/teamspaces/${teamspace}/projects/${_id}/image`)
				.reply(404);

			await Promise.all([
				waitForActions(() => {
					dispatch(ProjectsActions.createProject(
						teamspace,
						{ name, image: mockImageFile },
						onSuccess,
						() => { onImageError(); resolve(); },
						onError,
					));
				}, [ProjectsActions.createProjectSuccess(teamspace, newProject)]),
				promiseToResolve,
			]);

			const projectsInStore = selectCurrentProjects(getState());
			expect(projectsInStore).toEqual([newProject]);
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onImageError).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		});
	});

	describe('updateProject', () => {
		const newName = `new${mockProject.name}`;

		beforeEach(() => {
			dispatch(ProjectsActions.fetchSuccess(teamspace, [mockProject]));
		});

		describe('without image', () => {
			it('should call updateProject endpoint', async () => {
				mockServer
					.patch(`/teamspaces/${teamspace}/projects/${projectId}`)
					.reply(200)
	
				await waitForActions(() => {
					dispatch(ProjectsActions.updateProject(teamspace, projectId, { name: newName }, onSuccess, onError));
				}, [ProjectsActions.updateProjectSuccess(teamspace, projectId, { name: newName })])
	
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
					{ name: newName },
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

		describe('with image', () => {
			it('should update image', async () => {
				mockServer
					.put(`/teamspaces/${teamspace}/projects/${projectId}/image`)
					.reply(200)
	
				dispatch(ProjectsActions.updateProject(
					teamspace,
					projectId,
					{ image: mockImageFile },
					() => { onSuccess(); resolve(); },
					onError,
				));

				await promiseToResolve;
	
				expect(onSuccess).toHaveBeenCalled();
				expect(onError).not.toHaveBeenCalled();
				spy.mockClear();
			});
	
			it('should delete image', async () => {
				mockServer
					.delete(`/teamspaces/${teamspace}/projects/${projectId}/image`)
					.reply(200)

				dispatch(ProjectsActions.updateProject(
					teamspace,
					projectId,
					{ image: null },
					() => { onSuccess(); resolve(); },
					onError,
				));

				await promiseToResolve;
	
				expect(onSuccess).toHaveBeenCalled();
				expect(onError).not.toHaveBeenCalled();
			});
	
			it('should call updateProject endpoint with 404', async () => {
				mockServer
					.put(`/teamspaces/${teamspace}/projects/${projectId}/image`)
					.reply(404)
	
				dispatch(ProjectsActions.updateProject(
					teamspace,
					projectId,
					{ image: mockImageFile },
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

	describe('templates', () => {

		beforeEach(() => { 
			dispatch(ProjectsActions.fetchSuccess(teamspace, [mockProject]));
			dispatch(ProjectsActions.setCurrentProject(projectId));
			dispatch(FederationsActions.fetchFederationsSuccess(projectId, [mockFederation]));
		});

		describe('fetchTemplates', () => {
			it('should call fetchTemplates endpoint', async () => {
				mockServer
					.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets/templates?showDeprecated=true`)
					.reply(200, { templates: [mockTemplate] });
	
				await waitForActions(() => {
					dispatch(ProjectsActions.fetchTemplates(teamspace, projectId));
				}, [ProjectsActions.fetchTemplatesSuccess(projectId, [mockTemplate])]);
	
				const templatesInStore = selectCurrentProjectTemplates(getState());
				expect(templatesInStore).toEqual([mockTemplate]);
			})
	
			it('should call fetchTemplates endpoint with 404', async () => {
				mockServer
					.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets/templates?showDeprecated=true`)
					.reply(404);
	
				await waitForActions(() => {
					dispatch(ProjectsActions.fetchTemplates(teamspace, projectId));
				}, [DialogsTypes.OPEN]);
	
				const templatesInStore = selectCurrentProjectTemplates(getState());
				expect(templatesInStore).toEqual([]);
			})
		})
	})
});
