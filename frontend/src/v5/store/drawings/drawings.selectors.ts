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
import { Calibration, CalibrationState } from './drawings.types';
import { selectContainerById } from '../containers/containers.selectors';
import { selectFederationById } from '../federations/federations.selectors';
import { convertCoordUnits, convertVectorUnits, getUnitsConversionFactor } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.helpers';
import { EMPTY_CALIBRATION } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.constants';

const selectDrawingsDomain = (state): DrawingsState => state?.drawings || ({ drawingsByProjectByProject: {} });

export const selectDrawings = createSelector(
	selectDrawingsDomain, selectCurrentProject,
	(state, currentProject) => (state.drawingsByProject[currentProject] ?? []),
);

export const selectCalibratedDrawings = createSelector(
	selectDrawings,
	(drawings) => (drawings.filter((d) => [CalibrationState.CALIBRATED, CalibrationState.OUT_OF_SYNC].includes(d.calibration?.state))),
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

export const selectDrawingCalibration = createSelector(
	selectDrawingById,
	(drawing) => drawing.calibration ?? {},
);

export const selectIsListPending = createSelector(
	selectDrawingsDomain, selectCurrentProject,
	// Checks if the drawings for the project have been fetched
	(state, currentProject) => !state.drawingsByProject[currentProject],
);

export const selectCalibratedDrawingsHaveStatsPending = createSelector(
	selectCalibratedDrawings,
	(drawings) => drawings.some(({ hasStatsPending }) => hasStatsPending),
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

export const selectCategories = createSelector(
	selectDrawingsDomain, selectCurrentProject,
	(state, currentProject) => (state.categoriesByProject[currentProject] ?? []),
);

export const selectIsCategoriesPending = createSelector(
	selectDrawingsDomain, selectCurrentProject,
	// Checks if the categories for the project have been fetched
	(state, currentProject) => !state.categoriesByProject[currentProject],
);

export const selectCalibration = createSelector(
	selectDrawingById,
	(state, drawingId, modelId) => selectContainerById(state, modelId) || selectFederationById(state, modelId),
	(drawing, model) => {
		const calibration = drawing?.calibration || EMPTY_CALIBRATION as Partial<Calibration>;
		const conversionFactor = getUnitsConversionFactor(calibration?.units, model.unit);
		const horizontalCalibration = calibration.horizontal || EMPTY_CALIBRATION.horizontal;
		return {
			horizontal: {
				model: convertVectorUnits(horizontalCalibration.model, conversionFactor),
				drawing: convertVectorUnits(horizontalCalibration.drawing, conversionFactor),
			},
			verticalRange: convertCoordUnits(calibration.verticalRange || EMPTY_CALIBRATION.verticalRange, conversionFactor),
		};
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
