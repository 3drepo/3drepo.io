/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { selectCurrentProject, selectCurrentProjectDetails, selectCurrentProjectTemplates, selectCurrentProjects, selectIsProjectAdmin } from '@/v5/store/projects/projects.selectors';
import { TeamspacesActions } from '@/v5/store/teamspaces/teamspaces.redux';
import { times } from 'lodash';
import { projectMockFactory } from './projects.fixtures';
import { createTestStore, listContainsElementWithId } from '../test.helpers';
import { templateMockFactory } from '../tickets/tickets.fixture';

describe('Projects: store', () => {
	const teamspace = 'teamspace';
	let dispatch, getState;

	beforeEach(() => {
		({ dispatch, getState } = createTestStore());
		dispatch(TeamspacesActions.setCurrentTeamspace(teamspace));
	});

	const createAndAddProjectToStore = (projectOverrides = {}) => {
		const newProject = projectMockFactory(projectOverrides);
		dispatch(ProjectsActions.fetchSuccess(teamspace, [newProject]));
		return newProject;
	};

	it('should set projects', () => {
		const mockProjects = times(2, () => projectMockFactory());
		dispatch(ProjectsActions.fetchSuccess(teamspace, mockProjects));
		const projects = selectCurrentProjects(getState());
		expect(projects[0]).toEqual(mockProjects[0]);
		expect(projects[1]).toEqual(mockProjects[1]);
	});

	it('should set current project', () => {
		const mockProject = projectMockFactory();
		dispatch(ProjectsActions.fetchSuccess(teamspace, [mockProject]));
		dispatch(ProjectsActions.setCurrentProject(mockProject._id));

		const currentProject = selectCurrentProjectDetails(getState());
		expect(currentProject).toEqual(mockProject);

		const currentProjectId = selectCurrentProject(getState());
		expect(currentProjectId).toEqual(mockProject._id);
	});

	describe('Updating projects list:', () => {
		it('should create new project', () => {
			createAndAddProjectToStore();
			const mockProject = projectMockFactory();
			dispatch(ProjectsActions.createProjectSuccess(teamspace, mockProject));

			const projects = selectCurrentProjects(getState());
			const projectIsIncluded = listContainsElementWithId(projects, mockProject);
			expect(projectIsIncluded).toBeTruthy();
		});

		it('should update project', () => {
			createAndAddProjectToStore();
			const mockProject = projectMockFactory();
			dispatch(ProjectsActions.createProjectSuccess(teamspace, mockProject));

			const newName = mockProject.name + mockProject.name;
			const update = { name: newName };
			dispatch(ProjectsActions.updateProjectSuccess(teamspace, mockProject._id, update));

			const updatedProject = selectCurrentProjects(getState()).find(({ _id }) => _id === mockProject._id);
			expect(updatedProject.name).toEqual(newName);
		});

		it('should delete project', () => {
			const mockProjectId = "123";
			createAndAddProjectToStore({ _id: mockProjectId });
			dispatch(ProjectsActions.deleteProjectSuccess(teamspace, mockProjectId));
			const projects = selectCurrentProjects(getState());
			const projectIsIncluded = listContainsElementWithId(projects, mockProjectId);
			expect(projectIsIncluded).toBeFalsy();
		});
	});

	it('should return a users project admin status', () => {
		const adminProject = createAndAddProjectToStore({ isAdmin: true });
		dispatch(ProjectsActions.setCurrentProject(adminProject._id));
		expect(selectIsProjectAdmin(getState())).toBeTruthy();
		
		const nonAdminProject = createAndAddProjectToStore({ isAdmin: false });
		dispatch(ProjectsActions.setCurrentProject(nonAdminProject._id));
		expect(selectIsProjectAdmin(getState())).toBeFalsy();
	});

	it('should set the templates', () => {
		const mockProject = projectMockFactory();
		const mockTemplates = [templateMockFactory()];
		dispatch(ProjectsActions.fetchSuccess(teamspace, [mockProject]));
		dispatch(ProjectsActions.setCurrentProject(mockProject._id));
		dispatch(ProjectsActions.fetchTemplatesSuccess(mockProject._id, mockTemplates));

		const currentTemlates = selectCurrentProjectTemplates(getState());
		expect(currentTemlates).toEqual(mockTemplates);
	});
});
