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
import { prepareRevisionData } from './containerRevisions.helpers';
import { IContainerRevisionsState } from './containerRevisions.redux';
import { selectContainerById } from '../containers.selectors';

const selectRevisionsDomain = (state): IContainerRevisionsState => state.containerRevisions;
const selectContainerIdParam = (_, containerId: string) => containerId;

export const selectRevisionsByContainer = createSelector(
	selectRevisionsDomain,
	(state) => state.revisionsByContainer || {},
);

export const selectRevisions = createSelector(
	selectRevisionsByContainer,
	selectContainerIdParam,
	(revisionsByContainer, containerId) => revisionsByContainer[containerId]?.map((revision) => prepareRevisionData(revision))
		|| [],
);

export const selectRevisionsPending = createSelector(
	selectRevisions,
	selectContainerById,
	(revisions, container) => revisions.length !== container.revisionsCount,
);

export const selectIsPending: (any, string) => boolean = createSelector(
	selectRevisionsDomain,
	selectContainerIdParam,
	(state, containerId) => state.isPending[containerId],
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
	selectContainerIdParam,
	(uploadStates, containerId) => uploadStates[containerId]?.errorMessage || null,
);

export const selectUploadProgress = createSelector(
	selectUploads,
	selectContainerIdParam,
	(uploadStates, containerId) => uploadStates[containerId]?.progress || 0,
);
