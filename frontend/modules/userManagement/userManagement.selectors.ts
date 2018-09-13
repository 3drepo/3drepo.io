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

export const selectProjects = createSelector(
	selectUserManagementDomain, (state) => state.projects
);

export const selectIsPending = createSelector(
	selectUserManagementDomain, (state) => state.isPending
);

export const selectCurrentTeamspace = createSelector(
	selectUserManagementDomain, (state) => state.teamspace
);
