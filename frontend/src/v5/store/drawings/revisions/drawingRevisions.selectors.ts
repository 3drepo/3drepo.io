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
import { prepareRevisionData } from './drawingRevisions.helpers';
import { IDrawingRevisionsState } from './drawingRevisions.redux';

const selectRevisionsDomain = (state): IDrawingRevisionsState => state.drawingRevisions;
const selectDrawingIdParam = (_, drawingId: string) => drawingId;

const selectRevisionsByDrawing = createSelector(
	selectRevisionsDomain,
	(state) => state.revisionsByDrawing || {},
);

export const selectRevisions = createSelector(
	selectRevisionsByDrawing,
	selectDrawingIdParam,
	(revisionsByDrawing, drawingId) => revisionsByDrawing[drawingId]?.map((revision) => prepareRevisionData(revision)) || [],
);

export const selectLatestActiveRevision = createSelector(
	selectRevisions,
	(revisions) => revisions.find((r) => !r.void),
);

export const selectIsPending = createSelector(
	selectRevisionsDomain,
	selectDrawingIdParam,
	(state, drawingId) => state.isPending[drawingId],
);

export const selectUploads = createSelector(
	selectRevisionsDomain,
	(revisionsState) => revisionsState.revisionsUploadStatus,
);

export const selectUploadIsComplete = createSelector(
	selectUploads,
	(uploadStates) => Object.keys(uploadStates).every((id) => uploadStates[id].isComplete),
);

export const selectUploadError = createSelector(
	selectUploads,
	selectDrawingIdParam,
	(uploadStates, drawingId) => uploadStates[drawingId]?.errorMessage || null,
);

export const selectUploadProgress = createSelector(
	selectUploads,
	selectDrawingIdParam,
	(uploadStates, drawingId) => uploadStates[drawingId]?.progress || 0,
);

export const selectStatusCodes = createSelector(
	selectRevisionsDomain,
	(state) => state.statusCodes || [],
);
