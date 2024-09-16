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
/* eslint-disable implicit-arrow-linebreak */

import { IDrawingRevision, IDrawingRevisionUpdate } from '@/v5/store/drawings/revisions/drawingRevisions.types';
import { DrawingRevisionsActionsDispatchers, DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { subscribeToRoomEvent } from './realtime.service';
import { getState } from '@/v5/helpers/redux.helpers';
import { selectRevisionsPending } from '@/v5/store/drawings/revisions/drawingRevisions.selectors';



export const enableRealtimeDrawingRevisionUpdate = (teamspace: string, project: string, drawingId: string) =>
	subscribeToRoomEvent({ teamspace, project, model: drawingId }, 'drawingRevisionUpdate',
		(updatedStats: IDrawingRevisionUpdate) => {
			DrawingsActionsDispatchers.fetchDrawingStats(teamspace, project, drawingId);
			
			if (selectRevisionsPending(getState(), drawingId)) {
				DrawingRevisionsActionsDispatchers.fetch(teamspace, project, drawingId);
			} else {
				DrawingRevisionsActionsDispatchers.updateRevisionSuccess(drawingId, updatedStats);
			}
		},
	);

export const enableRealtimeNewDrawingRevisionUpdate = (teamspace: string, project: string, drawingId: string) =>
	subscribeToRoomEvent({ teamspace, project, model: drawingId }, 'drawingNewRevision',
		(revision: IDrawingRevision) => {
			DrawingsActionsDispatchers.fetchDrawingStats(teamspace, project, drawingId);
			if (selectRevisionsPending(getState(), drawingId)) {
				DrawingRevisionsActionsDispatchers.fetch(teamspace, project, drawingId);
			} else {
				DrawingRevisionsActionsDispatchers.revisionProcessingSuccess(drawingId, revision);
			}
		});
