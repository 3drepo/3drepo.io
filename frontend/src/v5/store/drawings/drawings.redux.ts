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
import { TeamspaceAndProjectId, ProjectId, ProjectAndDrawingId, TeamspaceProjectAndDrawingId, SuccessAndErrorCallbacks } from '../store.types';
import { IDrawing, DrawingStats, NewDrawing, MinimumDrawing, Calibration } from './drawings.types';
import { produceAll } from '@/v5/helpers/reducers.helper';
import { statsToDrawing } from './drawings.helpers';

export const { Types: DrawingsTypes, Creators: DrawingsActions } = createActions({
	addFavourite: ['teamspace', 'projectId', 'drawingId'],
	removeFavourite: ['teamspace', 'projectId', 'drawingId'],
	setFavouriteSuccess: ['projectId', 'drawingId', 'isFavourite'],
	fetchDrawings: ['teamspace', 'projectId'],
	fetchDrawingsSuccess: ['projectId', 'drawings'],
	fetchDrawingSettings: ['teamspace', 'projectId', 'drawingId'],
	fetchDrawingStats: ['teamspace', 'projectId', 'drawingId'],
	fetchDrawingStatsSuccess: ['projectId', 'drawingId', 'stats'],
	fetchCalibration: ['teamspace', 'projectId', 'drawingId'],
	updateCalibration: ['teamspace', 'projectId', 'drawingId', 'calibration'],
	approveCalibration: ['teamspace', 'projectId', 'drawingId'],
	deleteDrawing: ['teamspace', 'projectId', 'drawingId', 'onSuccess', 'onError'],
	deleteDrawingSuccess: ['projectId', 'drawingId'],
	fetchTypes: ['teamspace', 'projectId'],
	fetchTypesSuccess: ['projectId', 'types'],
	createDrawing: ['teamspace', 'projectId', 'drawing', 'onSuccess', 'onError'],
	createDrawingSuccess: ['projectId', 'drawing'],
	updateDrawing: ['teamspace', 'projectId', 'drawingId', 'drawing', 'onSuccess', 'onError'],
	updateDrawingSuccess: ['projectId', 'drawingId', 'drawing'],
	resetDrawingStatsQueue: [],
}, { prefix: 'DRAWINGS/' }) as { Types: Constants<IDrawingsActionCreators>; Creators: IDrawingsActionCreators };

const getDrawingFromState = (state: DrawingsState, projectId, drawingId) => (
	state.drawingsByProject[projectId].find((drawing) => drawing._id === drawingId)
);

export const setFavouriteSuccess = (state: DrawingsState, {
	projectId,
	drawingId,
	isFavourite,
}) => {
	getDrawingFromState(state, projectId, drawingId).isFavourite = isFavourite;
};

export const fetchDrawingsSuccess = (state: DrawingsState, { projectId, drawings } : FetchDrawingsSuccessAction) => {
	state.drawingsByProject[projectId] = drawings;
};

export const fetchDrawingStatsSuccess = (state: DrawingsState, { drawingId, projectId, stats }:FetchDrawingStatsSuccessAction ) => {
	const drawing = getDrawingFromState(state, projectId, drawingId);
	Object.assign(drawing, statsToDrawing(stats));
};

export const fetchTypesSuccess = (state: DrawingsState, { projectId, types }:FetchTypesSuccessAction ) => {
	state.typesByProject[projectId] = types;
};

export const createDrawingSuccess = (state: DrawingsState, { projectId, drawing }:CreateDrawingSuccessAction ) => {
	// a drawing with that id already exists in the store
	if (getDrawingFromState(state, projectId, drawing._id)) return;

	state.drawingsByProject[projectId] = (state.drawingsByProject[projectId] || []).concat([drawing]);
};

export const updateDrawingSuccess = (state: DrawingsState, { projectId, drawingId, drawing: { calibration, ...drawing } }:UpdateDrawingSuccessAction ) => {
	const oldDrawing = getDrawingFromState(state, projectId, drawingId);
	Object.assign(oldDrawing, drawing);
	oldDrawing.calibration = { ...oldDrawing.calibration, ...calibration };
};

export const deleteDrawingSuccess = (state: DrawingsState, {
	projectId,
	drawingId,
}) => {
	state.drawingsByProject[projectId] = state.drawingsByProject[projectId].filter(
		(drawing) => drawingId !== drawing._id,
	);
};
export interface DrawingsState {
	drawingsByProject: Record<string, Partial<IDrawing>[]>;
	typesByProject: Record<string, string[]>;
}

const INITIAL_STATE: DrawingsState = {
	drawingsByProject: {},
	typesByProject: {},
};

export const drawingsReducer = createReducer<DrawingsState>(INITIAL_STATE, produceAll({
	[DrawingsTypes.SET_FAVOURITE_SUCCESS]: setFavouriteSuccess,
	[DrawingsTypes.FETCH_DRAWINGS_SUCCESS]: fetchDrawingsSuccess,
	[DrawingsTypes.FETCH_DRAWING_STATS_SUCCESS]: fetchDrawingStatsSuccess,
	[DrawingsTypes.DELETE_DRAWING_SUCCESS]: deleteDrawingSuccess,
	[DrawingsTypes.FETCH_TYPES_SUCCESS]: fetchTypesSuccess,
	[DrawingsTypes.CREATE_DRAWING_SUCCESS]: createDrawingSuccess,
	[DrawingsTypes.UPDATE_DRAWING_SUCCESS]: updateDrawingSuccess,
})) as (state: DrawingsState, action: any) => DrawingsState;


export type AddFavouriteAction = Action<'ADD_FAVOURITE'> & TeamspaceProjectAndDrawingId;
export type RemoveFavouriteAction = Action<'REMOVE_FAVOURITE'> & TeamspaceProjectAndDrawingId;
export type SetFavouriteSuccessAction = Action<'SET_FAVOURITE_SUCCESS'> & ProjectAndDrawingId & { isFavourite: boolean };
export type FetchDrawingsAction = Action<'FETCH_DRAWINGS'> & TeamspaceAndProjectId;
export type FetchDrawingsSuccessAction = Action<'FETCH_DRAWINGS_SUCCESS'> & ProjectId & { drawings: IDrawing[] };
export type FetchDrawingSettingsAction = Action<'FETCH_DRAWING_SETTINGS'> & TeamspaceProjectAndDrawingId;
export type FetchDrawingStatsAction = Action<'FETCH_DRAWING_STATS'> & TeamspaceProjectAndDrawingId;
export type FetchDrawingStatsSuccessAction = Action<'FETCH_DRAWING_STATS_SUCCESS'> & ProjectAndDrawingId & { stats: DrawingStats };
export type FetchCalibrationAction = Action<'FETCH_CALIBRATION'> & TeamspaceProjectAndDrawingId;
export type UpdateCalibrationAction = Action<'UPDATE_CALIBRATION'> & TeamspaceProjectAndDrawingId & { calibration: Calibration };
export type ApproveCalibrationAction = Action<'APPROVE_CALIBRATION'> & TeamspaceProjectAndDrawingId;
export type DeleteDrawingAction = Action<'DELETE'> & TeamspaceProjectAndDrawingId & SuccessAndErrorCallbacks;
export type DeleteDrawingSuccessAction = Action<'DELETE_SUCCESS'> & ProjectAndDrawingId;
export type FetchTypesAction = Action<'FETCH_DRAWINGS_TYPES'> & TeamspaceAndProjectId;
export type FetchTypesSuccessAction = Action<'FETCH_DRAWINGS_TYPES_SUCCESS'> & ProjectId & { types: string[] };
export type CreateDrawingAction = Action<'CREATE_DRAWING'> & TeamspaceAndProjectId & SuccessAndErrorCallbacks & { drawing: NewDrawing };
export type CreateDrawingSuccessAction = Action<'CREATE_DRAWING_SUCCESS'> &  ProjectId & { drawing: NewDrawing };
export type UpdateDrawingAction = Action<'UPDATE_DRAWING'> & TeamspaceProjectAndDrawingId & SuccessAndErrorCallbacks & { drawing: Partial<MinimumDrawing> };
export type UpdateDrawingSuccessAction = Action<'UPDATE_DRAWING_SUCCESS'> &  TeamspaceProjectAndDrawingId & { drawing: Partial<IDrawing> };
export type ResetDrawingStatsQueueAction = Action<'RESET_CONTAINER_STATS_QUEUE'>;

export interface IDrawingsActionCreators {
	addFavourite: (teamspace: string, projectId: string, drawingId: string) => AddFavouriteAction;
	removeFavourite: (teamspace: string, projectId: string, drawingId: string) => RemoveFavouriteAction;
	setFavouriteSuccess: (projectId: string, drawingId: string, isFavourite: boolean) => SetFavouriteSuccessAction;
	fetchDrawings: (teamspace: string, projectId: string) => FetchDrawingsAction;
	fetchDrawingsSuccess: (projectId: string, drawings: Partial<IDrawing>[]) => FetchDrawingsSuccessAction;
	fetchDrawingSettings: (teamspace: string, projectId: string, drawingId: string) => FetchDrawingSettingsAction;
	fetchDrawingStats: (teamspace: string, projectId: string, drawingId: string) => FetchDrawingStatsAction;
	fetchDrawingStatsSuccess: (projectId: string, drawingId: string, stats: DrawingStats) => FetchDrawingStatsSuccessAction;
	fetchCalibration: (teamspace: string, projectId: string, drawingId: string) => FetchCalibrationAction;
	updateCalibration: (teamspace: string, projectId: string, drawingId: string, calibration: Calibration) => UpdateCalibrationAction;
	approveCalibration: (teamspace: string, projectId: string, drawingId: string) => ApproveCalibrationAction;
	deleteDrawing: (teamspace: string,
		projectId: string,
		drawingId: string,
		onSuccess: () => void,
		onError: (error) => void,
	) => DeleteDrawingAction;
	deleteDrawingSuccess: (projectId: string, drawingId: string) => DeleteDrawingSuccessAction;
	fetchTypes: (teamspace: string, projectId: string) => FetchTypesAction;
	fetchTypesSuccess: (projectId: string, types: string[]) => FetchTypesSuccessAction;
	createDrawing: (teamspace: string, projectId: string, drawing: NewDrawing, onSuccess: () => void, onError: (e:Error) => void) => CreateDrawingAction;
	createDrawingSuccess: (projectId: string, drawing: NewDrawing) => CreateDrawingSuccessAction;
	updateDrawing: (
		teamspace: string, 
		projectId: string, 
		drawingId: string, 
		drawing: Partial<IDrawing>, 
		onSuccess?: () => void, 
		onError?: (e:Error) => void
	) => UpdateDrawingAction;
	updateDrawingSuccess: (projectId: string, drawingId: string, drawing: Partial<IDrawing>) => UpdateDrawingSuccessAction;
	resetDrawingStatsQueue: () => ResetDrawingStatsQueueAction;
}
