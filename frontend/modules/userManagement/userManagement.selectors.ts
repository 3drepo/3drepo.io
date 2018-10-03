/**
 *  Copyright (C) 2017 3D Repo Ltd
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
import { getExtendedModelPermissions, getExtendedProjectPermissions } from './userManagement.helpers';

export const selectUserManagementDomain = (state) => Object.assign({}, state.userManagement);

export const selectUsers = createSelector(
	selectUserManagementDomain, (state) => state.users
);

export const selectUsersLimit = createSelector(
	selectUserManagementDomain, (state) => state.collaboratorLimit || 0
);

export const selectIsPending = createSelector(
	selectUserManagementDomain, (state) => state.isPending
);

export const selectCurrentTeamspace = createSelector(
	selectUserManagementDomain, (state) => state.selectedTeamspace
);

export const selectUsersSuggestions = createSelector(
	selectUserManagementDomain, (state) => state.usersSuggestions
);

export const selectProjects = createSelector(
	selectUserManagementDomain, (state) => state.projects
);

export const selectCurrentProject = createSelector(
	selectUserManagementDomain, (state) => state.currentProject
);

export const selectExtendedProjectPermissions = createSelector(
	selectUsers,
	selectCurrentProject,
	getExtendedProjectPermissions
);

export const selectModels = createSelector(
	selectUserManagementDomain, (state) => state.currentProject.models || []
);

export const selectCurrentModels = createSelector(
	selectUserManagementDomain, (state) => state.currentProject.currentModels || []
);

export const selectModelsPermissions = createSelector(
	selectUserManagementDomain, (state) => state.currentProject.modelsPermissions
);

export const selectExtendedModelPermissions = createSelector(
	selectExtendedProjectPermissions,
	selectModelsPermissions,
	getExtendedModelPermissions
);
