/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { selectCurrentProject } from '../projects/projects.selectors';
import { DrawingsState } from './drawings.redux';
import { Role } from '../currentUser/currentUser.types';
import { isCollaboratorRole } from '../store.helpers';

const selectContainersDomain = (state): DrawingsState => state?.drawings || ({ drawingsByProjectByProject: {} });

export const selectDrawings = createSelector(
	selectContainersDomain, selectCurrentProject,
	(state, currentProject) => (state.drawingsByProject[currentProject] ?? []),
);

export const selectDrawingById = createSelector(
	selectDrawings,
	(_, _id) => _id,
	(drawings, _id) => drawings.find((d) => d._id === _id),
);

export const selectIsListPending = createSelector(
	selectContainersDomain, selectCurrentProject,
	// Checks if the containers for the project have been fetched
	(state, currentProject) => !state.drawingsByProject[currentProject],
);

export const selectContainerRole = createSelector(
	selectDrawingById,
	(drawing): Role | null => drawing?.role || null,
);

export const selectHasCollaboratorAccess = createSelector(
	selectContainerRole,
	(role): boolean => isCollaboratorRole(role),
);
