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

import { createSelector } from 'reselect';
import { selectCurrentTeamspace } from '../teamspaces/teamspaces.selectors';
import { IProjectsState } from './projects.redux';
import { IProject } from './projects.types';
import { removeDeprecated } from '../tickets/tickets.helpers';

const selectProjectsDomain = (state): IProjectsState => state?.projects;

export const selectProjects = createSelector(
	selectProjectsDomain, (state) => state.projectsByTeamspace ?? {},
);

export const selectCurrentProjects = createSelector(
	selectCurrentTeamspace, selectProjects, (teamspace, state) => state[teamspace] || [],
);

export const selectCurrentProject = createSelector(
	selectProjectsDomain, (state) => state?.currentProject,
);

export const selectCurrentProjectDetails = createSelector(
	selectCurrentProject, selectCurrentProjects,
	(project, projects): IProject => projects.find(({ _id }) => _id === project) || {} as IProject,
);

export const selectCurrentProjectName = createSelector(
	selectCurrentProjectDetails,
	(project) => project?.name || null,
);

export const selectIsProjectAdmin = createSelector(
	selectCurrentProjectDetails,
	(project): boolean => !!project?.isAdmin,
);

export const selectTemplatesArePending = createSelector(
	selectProjectsDomain,
	selectCurrentProject,
	(state, currentProject) => !state.templatesByProject[currentProject],
);

export const selectCurrentProjectTemplates = createSelector(
	selectProjectsDomain,
	selectCurrentProject,
	(state, currentProject) => state.templatesByProject[currentProject]?.map(removeDeprecated) || [],
);

export const selectCurrentProjectTemplateById = createSelector(
	selectCurrentProjectTemplates,
	(state, templateId) => templateId,
	(templates, templateId) => templates.find(({ _id }) => _id === templateId),
);
