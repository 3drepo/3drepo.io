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

const selectProjectsDomain = (state): IProjectsState => state.projects;

export const selectProjects = createSelector(
	selectProjectsDomain, (state) => state.projectsByTeamspace,
);

export const selectCurrentProjects = createSelector(
	selectCurrentTeamspace, selectProjects, (teamspace, state) => state[teamspace] || [],
);

export const selectCurrentProject = createSelector(
	selectProjectsDomain, (state) => state.currentProject,
);

export const selectCurrentProjectDetails = createSelector(
	selectCurrentProject, selectCurrentProjects,
	(project, projects) => projects.find(({ _id }) => _id === project),
);
