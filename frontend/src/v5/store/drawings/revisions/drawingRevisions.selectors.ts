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

export const selectRevisionsByDrawing = createSelector(
	selectRevisionsDomain,
	(state) => state.revisionsByDrawing || {},
);

export const selectRevisions = createSelector(
	selectRevisionsByDrawing,
	selectDrawingIdParam,
	(revisionsByDrawing, drawingId) => {
		const revisions = (revisionsByDrawing[drawingId]?.map((revision) => prepareRevisionData(revision)) || []);
		revisions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
		return revisions;
	},
);

export const selectActiveRevisions = createSelector(
	selectRevisions,
	(revisions) => revisions.filter((val) => !val.void),
); 

export const selectLastRevision = createSelector(
	selectActiveRevisions,
	(revisions) => {
		const lastRev = revisions[0];
		return !lastRev ? '' : lastRev.statusCode + '-' + lastRev.revCode;
	},
); 

export const selectRevisionsPending = createSelector(
	selectRevisionsByDrawing,
	selectDrawingIdParam,
	(revisionsByDrawing, drawingId) =>!revisionsByDrawing[drawingId],
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
