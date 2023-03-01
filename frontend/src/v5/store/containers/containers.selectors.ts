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
import { IContainersState } from './containers.redux';
import { IContainer } from './containers.types';
import { Role } from '../currentUser/currentUser.types';
import { isCollaboratorRole, isCommenterRole } from '../store.helpers';

const selectContainersDomain = (state): IContainersState => state?.containers || ({ containersByProject: {} });

export const selectContainers = createSelector(
	selectContainersDomain, selectCurrentProject,
	(state, currentProject) => state?.containersByProject[currentProject] ?? [],
);

export const selectFavouriteContainers = createSelector(
	selectContainers,
	(containers) => containers.filter(({ isFavourite }) => isFavourite),
);

export const selectIsListPending = createSelector(
	selectContainersDomain, selectCurrentProject,
	// Checks if the containers for the project have been fetched
	(state, currentProject) => !state.containersByProject[currentProject],
);

export const selectAreStatsPending = createSelector(
	selectContainers,
	(containers) => containers.some(({ hasStatsPending }) => hasStatsPending),
);

export const selectContainerById = createSelector(
	selectContainers,
	(_, id) => id,
	(containers, id): IContainer | null => containers.find((container) => (container._id === id)),
);

export const selectContainerRole = createSelector(
	selectContainerById,
	(container): Role | null => container?.role || null,
);

export const selectHasCollaboratorAccess = createSelector(
	selectContainerRole,
	(role): boolean => isCollaboratorRole(role),
);

export const selectHasCommenterAccess = createSelector(
	selectContainerRole,
	(role): boolean => isCommenterRole(role),
);

export const selectCanUploadToProject = createSelector(
	selectContainers,
	(containers): boolean => containers.some(({ role }) => isCollaboratorRole(role)),
);
