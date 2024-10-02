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
import { selectCurrentProject, selectIsProjectAdmin } from '../projects/projects.selectors';
import { DrawingsState } from './drawings.redux';
import { isCollaboratorRole, isCommenterRole, isViewerRole } from '../store.helpers';
import { Role } from '../currentUser/currentUser.types';
import { selectContainerById } from '../containers/containers.selectors';
import { selectFederationById } from '../federations/federations.selectors';
import { convertUnits, convertVectorUnits, getTransformationMatrix, getUnitsConversionFactor, removeZ } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.helpers';
import { EMPTY_CALIBRATION, EMPTY_VECTOR } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.constants';
import { isEqual, orderBy } from 'lodash';
import { Vector2 } from 'three';
import { fullDrawing } from './drawings.helpers';
import { selectRevisionsByDrawing } from './revisions/drawingRevisions.selectors';
import { Calibration } from './drawings.types';

const selectDrawingsDomain = (state): DrawingsState => state?.drawings || ({ drawingsByProjectByProject: {} });

export const selectDrawings = createSelector(
	selectDrawingsDomain,
	selectCurrentProject,
	selectRevisionsByDrawing, // This selector is used here to recalculate the value after the revisions are fetched
	(state, currentProject) => {
		const drawings = (state.drawingsByProject[currentProject] ?? []).map((drawing) => fullDrawing(drawing as any));
		return orderBy(drawings, 'lastUpdated', 'desc');
	},
);

export const selectNonEmptyDrawings = createSelector(
	selectDrawings,
	(drawings) => drawings.filter((d) => d.revisionsCount > 0),
);

export const selectFavouriteDrawings = createSelector(
	selectDrawings,
	(drawings) => drawings.filter(({ isFavourite }) => isFavourite),
);

export const selectDrawingById = createSelector(
	selectDrawings,
	(_, _id) => _id,
	(drawings, _id) => drawings.find((d) => d._id === _id),
);

export const selectIsListPending = createSelector(
	selectDrawingsDomain, selectCurrentProject,
	// Checks if the drawings for the project have been fetched
	(state, currentProject) => !state.drawingsByProject[currentProject],
);

export const selectAreStatsPending = createSelector(
	selectDrawings,
	(drawings) => drawings.some(({ hasStatsPending }) => hasStatsPending),
);

export const selectDrawingRole = createSelector(
	selectDrawingById,
	(drawing): Role | null => drawing?.role || null,
);

export const selectHasCollaboratorAccess = createSelector(
	selectDrawingRole,
	(role): boolean => isCollaboratorRole(role),
);

export const selectCanUploadToProject = createSelector(
	selectDrawings,
	selectIsProjectAdmin,
	(drawings, isAdmin): boolean => isAdmin || drawings.some(({ role }) => isCollaboratorRole(role)),
);

export const selectTypes = createSelector(
	selectDrawingsDomain, selectCurrentProject,
	(state, currentProject) => state.typesByProject[currentProject] ?? [],
);

export const selectIsTypesPending = createSelector(
	selectDrawingsDomain, selectCurrentProject,
	// Checks if the types for the project have been fetched
	(state, currentProject) => !state.typesByProject[currentProject],
);

export const selectCalibration = createSelector(
	selectDrawingById,
	(state, drawingId, modelId) => selectContainerById(state, modelId) || selectFederationById(state, modelId),
	(drawing, model) => {
		const calibration = { ...EMPTY_CALIBRATION, ...drawing?.calibration };
		const conversionFactor = getUnitsConversionFactor(model.unit, calibration.units);
		const horizontalCalibration = calibration.horizontal;

		return {
			horizontal: {
				model: convertVectorUnits(horizontalCalibration.model, conversionFactor),
				drawing: convertVectorUnits(horizontalCalibration.drawing, conversionFactor),
			},
			verticalRange: convertUnits(calibration.verticalRange, conversionFactor),
		} as Calibration;
	},
);


export const selectTransformMatrix = createSelector(
	selectCalibration,
	(calibration) => {
		if (isEqual(calibration.horizontal.drawing, EMPTY_VECTOR) || isEqual(calibration.horizontal.model, EMPTY_VECTOR)) return null;
		return getTransformationMatrix(calibration.horizontal.drawing, calibration.horizontal.model);
	},
);

export const selectTransform2DTo3D = createSelector(
	selectTransformMatrix,
	(matrix) => {
		if (!matrix) return null;
		return (vector): Vector2 => new Vector2(...vector).applyMatrix3(matrix);
	},
);

export const selectTransform3DTo2D = createSelector(
	selectTransformMatrix,
	(matrix) => {
		if (!matrix) return null;
		const inverseMat = matrix.clone().invert();

		return (vector): Vector2 => new Vector2(...removeZ(vector)).applyMatrix3(inverseMat) ;
	},
);

export const selectHasCommenterAccess = createSelector(
	selectDrawingRole,
	(role): boolean => isCommenterRole(role),
);

export const selectHasViewerAccess = createSelector(
	selectDrawingRole,
	(role): boolean => isViewerRole(role),
);
