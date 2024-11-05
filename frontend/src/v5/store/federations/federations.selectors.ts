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
import { selectCurrentProject } from '@/v5/store/projects/projects.selectors';
import { compact } from 'lodash';
import { IFederationsState } from './federations.redux';
import { IFederation } from './federations.types';
import { selectContainers } from '../containers/containers.selectors';
import { Role } from '../currentUser/currentUser.types';
import { isCollaboratorRole, isCommenterRole } from '../store.helpers';
import { selectJobs } from '@/v4/modules/jobs';
import { selectCurrentTeamspaceUsers } from '../users/users.selectors';

const selectFederationsDomain = (state): IFederationsState => state?.federations || ({ federationsByProject: {} });

export const selectFederations = createSelector(
	selectFederationsDomain, selectCurrentProject,
	(state, currentProject) => state?.federationsByProject[currentProject] ?? [],
);

export const selectFederationsNames = createSelector(
	selectFederations,
	(federations) => federations.map(({ name }) => name),
);

export const selectFavouriteFederations = createSelector(
	selectFederations,
	(federations) => federations.filter(({ isFavourite }) => isFavourite),
);

export const selectIsListPending = createSelector(
	selectFederationsDomain, selectCurrentProject,
	// Checks if the federations for the project have been fetched
	(state, currentProject) => !state.federationsByProject[currentProject],
);

export const selectAreStatsPending = createSelector(
	selectFederations, (federations) => federations.some(({ hasStatsPending }) => hasStatsPending),
);

export const selectFederationById = createSelector(
	selectFederations,
	(_, id) => id,
	(federations, id): IFederation | null => federations.find((federation) => (federation._id === id)),
);

export const selectIsFederation = createSelector(
	selectFederations,
	(federations): (id:string) => boolean => 
		(id: string) => !!federations?.find((federation) => (federation._id === id)),
);

export const selectContainersByFederationId = createSelector(
	selectContainers,
	selectFederationById,
	(containers, federation) => compact(federation?.containers?.map(
		({ _id }) => containers.find((container) => container._id === _id),
	)) ?? [],
);

export const selectFederationRole = createSelector(
	selectFederationById,
	(federation): Role | null => federation?.role || null,
);

export const selectHasCollaboratorAccess = createSelector(
	selectFederationRole,
	(role): boolean => isCollaboratorRole(role),
);

export const selectHasCommenterAccess = createSelector(
	selectFederationRole,
	(role): boolean => isCommenterRole(role),
);

export const selectFederationUsers = createSelector(
	selectFederationById,
	selectCurrentTeamspaceUsers,
	(federation, users) => (federation?.users || []).map((username) => users.find((u: any) => u.user === username)),
);

export const selectFederationJobs = createSelector(
	selectFederationById,
	selectJobs,
	(federation, jobs) => (federation?.jobs || []).map((jobId) => jobs.find((j) => j._id === jobId)).filter(Boolean),
);
