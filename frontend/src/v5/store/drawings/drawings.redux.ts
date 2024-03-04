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

import { Constants } from '@/v5/helpers/actions.helper';
import { Action } from 'redux';
import { createActions, createReducer } from 'reduxsauce';
import { TeamspaceAndProjectId, ProjectId, ProjectAndDrawingId, TeamspaceProjectAndDrawingId } from '../store.types';
import { Drawing, DrawingStats } from './drawing.types';
import { produceAll } from '@/v5/helpers/reducers.helper';

export const { Types: DrawingsTypes, Creators: DrawingsActions } = createActions({
	fetchDrawings: ['teamspace', 'projectId'],
	fetchDrawingsSuccess: ['projectId', 'drawings'],
	fetchDrawingStats: ['teamspace', 'projectId', 'drawingId'],
	fetchDrawingStatsSuccess: [ 'drawingId', 'stats'],
}, { prefix: 'DRAWINGS/' }) as { Types: Constants<DrawingsActionCreators>; Creators: DrawingsActionCreators };


export const fetchDrawingsSuccess = (state: DrawingsState, { projectId, drawings } : FetchDrawingsSuccessAction) => {
	state.drawingsByProject[projectId] = drawings;
};

export const fetchDrawingStatsSuccess = (state: DrawingsState, { drawingId, stats }:FetchDrawingStatsSuccessAction ) => {
	state.statsByDrawing[drawingId] = (state.statsByDrawing[drawingId] || []).concat(stats);
};

const INITIAL_STATE: DrawingsState = {
	drawingsByProject: {},
	statsByDrawing : {},
};

export interface DrawingsState {
	drawingsByProject: Record<string, Drawing[]>;
	statsByDrawing : Record<string, DrawingStats[]>;
}

export const drawingsReducer = createReducer<DrawingsState>(INITIAL_STATE, produceAll({
	[DrawingsTypes.FETCH_DRAWINGS_SUCCESS]: fetchDrawingsSuccess,
	[DrawingsTypes.FETCH_DRAWING_STATS_SUCCESS]: fetchDrawingStatsSuccess,
})) as (state: DrawingsState, action: any) => DrawingsState;


export type FetchDrawingsAction = Action<'FETCH_DRAWINGS'> & TeamspaceAndProjectId;
export type FetchDrawingsSuccessAction = Action<'FETCH_DRAWINGS_SUCCESS'> & ProjectId & { drawings: Drawing[] };
export type FetchDrawingStatsAction = Action<'FETCH_DRAWING_STATS'> & TeamspaceProjectAndDrawingId;
export type FetchDrawingStatsSuccessAction = Action<'FETCH_DRAWING_STATS_SUCCESS'> & ProjectAndDrawingId & { stats: DrawingStats };

export interface DrawingsActionCreators {
	fetchDrawings: (teamspace: string, projectId: string) => FetchDrawingsAction;
	fetchDrawingsSuccess: (projectId: string, drawings: Drawing[]) => FetchDrawingsSuccessAction;
	fetchDrawingStats: (teamspace: string, projectId: string, drawingId: string) => FetchDrawingStatsAction;
	fetchDrawingStatsSuccess: ( projectId: string, drawingId: string, stats: DrawingStats ) => FetchDrawingStatsSuccessAction;
}
