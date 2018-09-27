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
import { first } from 'lodash';
import { selectCurrentUserTeamspaces } from '../teamspace/teamspace.selectors';
import { PROJECT_ROLES_TYPES } from '../../constants/project-permissions';

const getExtendedProjectPermissions = (currentUsers = [], project = {permissions: []}) => {
	return project.permissions.map(({ user, permissions = [], isSelected = false }) => {
		const userData = currentUsers.find((userDetails) => userDetails.user === user) || {};
		let projectPermissionsKey = PROJECT_ROLES_TYPES.UNASSIGNED;
		if (userData.isAdmin) {
			projectPermissionsKey = PROJECT_ROLES_TYPES.ADMINISTRATOR;
		} else {
			projectPermissionsKey = first(permissions) || PROJECT_ROLES_TYPES.UNASSIGNED;
		}

		return {
			...userData,
			permissions,
			key: projectPermissionsKey,
			isSelected
		};
	});
};

export const selectUserManagementDomain = (state) => Object.assign({}, state.userManagement);

export const selectUsers = createSelector(
	selectUserManagementDomain, (state) => state.users
);

export const selectUsersLimit = createSelector(
	selectUserManagementDomain, (state) => state.collaboratorLimit || 0
);

export const selectJobs = createSelector(
	selectUserManagementDomain, (state) => state.jobs
);

export const selectJobsColors = createSelector(
	selectUserManagementDomain, (state) => state.jobsColors
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
