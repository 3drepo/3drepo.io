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

import { pick, values } from 'lodash';
import { orderBy } from 'lodash';
import * as queryString from 'query-string';
import { matchPath } from 'react-router';
import { createSelector } from 'reselect';
import { ROUTES } from '../../constants/routes';
import { sortByField } from '../../helpers/sorting';
import { selectCurrentUser } from '../currentUser';
import { selectLocation } from '../router/router.selectors';
import { selectModels as selectModelsMap, selectProjectsList, selectTeamspaces } from '../teamspaces';
import { getExtendedModelPermissions, getExtendedProjectPermissions, prepareUserData } from './userManagement.helpers';

const orderByFullName = (users) => orderBy(users, (user) => user.lastName + ' ' + user. firstName, 'asc');

export const selectUserManagementDomain = (state) => ({ ...state.userManagement });

export const selectUsersPending = createSelector(
	selectUserManagementDomain, (state) => state.usersPending
);

export const selectProjectsPending = createSelector(
	selectUserManagementDomain, (state) => state.projectsPending
);

export const selectCurrentTeamspace = createSelector(
	selectLocation, (location) =>  {
		const userManagementParams = matchPath(location.pathname, { path: ROUTES.USER_MANAGEMENT_TEAMSPACE });
		return ((userManagementParams || {}).params || {}).teamspace;
	}
);

export const selectUsers = createSelector(
	selectUserManagementDomain, selectCurrentTeamspace, selectCurrentUser,
		({users}, teamspace, {username}) => orderByFullName(users).map(prepareUserData.bind(null, teamspace, username))
);

export const selectUsersSuggestions = createSelector(
	selectUserManagementDomain, (state) => state.usersSuggestions
);

export const selectProject = createSelector(
	selectUserManagementDomain, (state) => state.project
);

export const selectProjectPermissions = createSelector(
	selectUsers,
	selectProject,
	getExtendedProjectPermissions
);

export const selectSelectedModels = createSelector(
	selectUserManagementDomain, selectProject,
		(state, project) => {
			if (!project) {
				return [];
			}

			return  (state.models || []).filter((m) => project.models.includes(m.model));
		}
);

const  mergeEqualPermissions = (permissionsA, permissionsB: any[]) => {
	const mergedPermission =  permissionsA.reduce((totalPermissions, currPermission) => {
			const permissionBValue = permissionsB.find( (perm) => perm.user === currPermission.user);
			if ((permissionBValue || {}).permission  === currPermission.permission) {
				totalPermissions.push(currPermission);
			}

			return totalPermissions;
		} , []);

	return mergedPermission;
};

const selectUnifiedModelPermissions = createSelector(
	selectSelectedModels, (models) => {
		const firstPermissions = (models[0] || {}).permissions || [];
		return models.reduce((permissions, model) => mergeEqualPermissions(permissions, model.permissions), firstPermissions);
	}
);

export const selectModelsPermissions = createSelector(
	selectProjectPermissions,
	selectUnifiedModelPermissions,
	getExtendedModelPermissions
);

export const selectProjects = createSelector(
	selectProjectsList, selectCurrentTeamspace,
		(projects,  currentTeamspace) => {
			const currentTeamspaceProjects = projects.filter(({teamspace}) =>  teamspace === currentTeamspace);
			return sortByField(currentTeamspaceProjects , { order: 'asc', config: { field: 'name' } });
		}
);

export const selectUrlQueryProject = createSelector(
	selectLocation, selectProjects , (location, projects) =>  {
		const { project } = queryString.parse(location.search);
		const projectFound = projects.find(({ name }) => name === project);
		return projectFound ? project : '';
	}
);

export const selectProjectModels = createSelector(
	selectProject, selectModelsMap, (project, modelsMap) => {
		if (!project) {
			return [];
		}

		return values(modelsMap).filter((m) => m.projectName === project._id);
	}
);

export const selectIsTeamspaceAdmin = createSelector(
	selectCurrentTeamspace, selectTeamspaces,
		(currentTeamspace, teamspaces) => Boolean((teamspaces[currentTeamspace] || {}).isAdmin)
);

export const selectCollaboratorLimit = createSelector(
	selectUserManagementDomain, (state) => state.collaboratorLimit
);

export const selectInvitations = createSelector(
	selectUserManagementDomain, (state) => state.invitations || []
);

export const selectLicensesCount = createSelector(
	selectUsers, selectInvitations , (users, invitations) => users.length + invitations.length
);

export const selectInvitationsCount = createSelector(
	selectInvitations , (invitations) => invitations.length
);

export const selectUserNotExists = createSelector(
	selectUserManagementDomain, (state) => state.userNotExists
);
