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
import { IDrawing, DrawingStats, DrawingUploadStatus, NewDrawing, CalibrationState } from './drawings.types';
import { produceAll } from '@/v5/helpers/reducers.helper';
import { getNullableDate } from '@/v5/helpers/getNullableDate';
import { IDrawingRevision } from './revisions/drawingRevisions.types';
import { prepareSingleDrawingData } from './drawings.helpers';

export const { Types: DrawingsTypes, Creators: DrawingsActions } = createActions({
	addFavourite: ['teamspace', 'projectId', 'drawingId'],
	removeFavourite: ['teamspace', 'projectId', 'drawingId'],
	setFavouriteSuccess: ['projectId', 'drawingId', 'isFavourite'],
	fetchDrawings: ['teamspace', 'projectId'],
	fetchDrawingsSuccess: ['projectId', 'drawings'],
	fetchDrawingStats: ['teamspace', 'projectId', 'drawingId'],
	fetchDrawingStatsSuccess: ['projectId', 'drawingId', 'stats'],
	deleteDrawing: ['teamspace', 'projectId', 'drawingId', 'onSuccess', 'onError'],
	deleteDrawingSuccess: ['projectId', 'drawingId'],
	fetchCategories: ['teamspace', 'projectId'],
	fetchCategoriesSuccess: ['projectId', 'categories'],
	createDrawing: ['teamspace', 'projectId', 'drawing', 'onSuccess', 'onError'],
	createDrawingSuccess: ['projectId', 'drawing'],
	updateDrawing: ['teamspace', 'projectId', 'drawingId', 'drawing', 'onSuccess', 'onError'],
	updateDrawingSuccess: ['projectId', 'drawingId', 'drawing'],
	setDrawingStatus: ['projectId', 'drawingId', 'status'],
	drawingProcessingSuccess: ['projectId', 'drawingId', 'revision'],
}, { prefix: 'DRAWINGS/' }) as { Types: Constants<IDrawingsActionCreators>; Creators: IDrawingsActionCreators };

const getDrawingFromState = (state: DrawingsState, projectId, drawingId) => (
	state.drawingsByProject[projectId].find((drawing) => drawing._id === drawingId)
);

export const setFavouriteSuccess = (state, {
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
	Object.assign(drawing, prepareSingleDrawingData(drawing, stats));
};

export const fetchCategoriesSuccess = (state: DrawingsState, { projectId, categories }:FetchCategoriesSuccessAction ) => {
	state.categoriesByProject[projectId] = categories;
};

export const createDrawingSuccess = (state: DrawingsState, { projectId, drawing }:CreateDrawingSuccessAction ) => {
	state.drawingsByProject[projectId] = (state.drawingsByProject[projectId] || []).concat([{
		...drawing,
		revisionsCount: 0,
		calibration: CalibrationState.EMPTY,
		status: DrawingUploadStatus.OK,
	}]);
};

export const updateDrawingSuccess = (state: DrawingsState, { projectId, drawingId, drawing }:UpdateDrawingSuccessAction ) => {
	const oldDrawing = getDrawingFromState(state, projectId, drawingId);
	Object.assign(oldDrawing,  drawing);
};

export const setDrawingStatus = (state, {
	projectId,
	drawingId,
	status,
}) => {
	getDrawingFromState(state, projectId, drawingId).status = status;
};

export const drawingProcessingSuccess = (state, {
	projectId,
	drawingId,
	revision,
}) => {
	const drawing = getDrawingFromState(state, projectId, drawingId);
	const newRevisionProperties = {
		revisionsCount: drawing.revisionsCount + 1,
		lastUpdated: getNullableDate(revision.timestamp),
		latestRevision: revision.tag,
	};
	Object.assign(drawing, newRevisionProperties);
};

export const deleteDrawingSuccess = (state, {
	projectId,
	drawingId,
}) => {
	state.drawingsByProject[projectId] = state.drawingsByProject[projectId].filter(
		(drawing) => drawingId !== drawing._id,
	);
};

const INITIAL_STATE: DrawingsState = {
	drawingsByProject: {},
	categoriesByProject: {},
};

export interface DrawingsState {
	drawingsByProject: Record<string, IDrawing[]>;
	categoriesByProject: Record<string, string[]>;
}

export const drawingsReducer = createReducer<DrawingsState>(INITIAL_STATE, produceAll({
	[DrawingsTypes.SET_FAVOURITE_SUCCESS]: setFavouriteSuccess,
	[DrawingsTypes.FETCH_DRAWINGS_SUCCESS]: fetchDrawingsSuccess,
	[DrawingsTypes.FETCH_DRAWING_STATS_SUCCESS]: fetchDrawingStatsSuccess,
	[DrawingsTypes.DELETE_DRAWING_SUCCESS]: deleteDrawingSuccess,
	[DrawingsTypes.FETCH_CATEGORIES_SUCCESS]: fetchCategoriesSuccess,
	[DrawingsTypes.CREATE_DRAWING_SUCCESS]: createDrawingSuccess,
	[DrawingsTypes.UPDATE_DRAWING_SUCCESS]: updateDrawingSuccess,
	[DrawingsTypes.SET_DRAWING_STATUS]: setDrawingStatus,
	[DrawingsTypes.DRAWING_PROCESSING_SUCCESS]: drawingProcessingSuccess,
})) as (state: DrawingsState, action: any) => DrawingsState;


export type AddFavouriteAction = Action<'ADD_FAVOURITE'> & TeamspaceProjectAndDrawingId;
export type RemoveFavouriteAction = Action<'REMOVE_FAVOURITE'> & TeamspaceProjectAndDrawingId;
export type SetFavouriteSuccessAction = Action<'SET_FAVOURITE_SUCCESS'> & ProjectAndDrawingId & { isFavourite: boolean };
export type FetchDrawingsAction = Action<'FETCH_DRAWINGS'> & TeamspaceAndProjectId;
export type FetchDrawingsSuccessAction = Action<'FETCH_DRAWINGS_SUCCESS'> & ProjectId & { drawings: IDrawing[] };
export type FetchDrawingStatsAction = Action<'FETCH_DRAWING_STATS'> & TeamspaceProjectAndDrawingId;
export type FetchDrawingStatsSuccessAction = Action<'FETCH_DRAWING_STATS_SUCCESS'> & ProjectAndDrawingId & { stats: DrawingStats };
export type DeleteDrawingAction = Action<'DELETE'> & TeamspaceProjectAndDrawingId & SuccessAndErrorCallbacks;
export type DeleteDrawingSuccessAction = Action<'DELETE_SUCCESS'> & ProjectAndDrawingId;
export type FetchCategoriesAction = Action<'FETCH_DRAWINGS_CATEGORIES'> & TeamspaceAndProjectId;
export type FetchCategoriesSuccessAction = Action<'FETCH_DRAWINGS_CATEGORIES_SUCCESS'> & ProjectId & { categories: string[] };
export type CreateDrawingAction = Action<'CREATE_DRAWING'> & TeamspaceAndProjectId & SuccessAndErrorCallbacks & { drawing: IDrawing };
export type CreateDrawingSuccessAction = Action<'CREATE_DRAWING_SUCCESS'> &  ProjectId & { drawing: IDrawing };
export type UpdateDrawingAction = Action<'UPDATE_DRAWING'> & TeamspaceProjectAndDrawingId & SuccessAndErrorCallbacks & { drawing: Partial<IDrawing> };
export type UpdateDrawingSuccessAction = Action<'UPDATE_DRAWING_SUCCESS'> &  TeamspaceProjectAndDrawingId & { drawing: Partial<IDrawing> };
export type SetDrawingStatusAction = Action<'SET_DRAWING_STATUS'> & ProjectAndDrawingId & { status: DrawingUploadStatus };
export type DrawingProcessingSuccessAction = Action<'DRAWING_PROCESSING_SUCCESS'> & ProjectAndDrawingId & { revision: IDrawingRevision };

export interface IDrawingsActionCreators {
	addFavourite: (teamspace: string, projectId: string, drawingId: string) => AddFavouriteAction;
	removeFavourite: (teamspace: string, projectId: string, drawingId: string) => RemoveFavouriteAction;
	setFavouriteSuccess: (projectId: string, drawingId: string, isFavourite: boolean) => SetFavouriteSuccessAction;
	fetchDrawings: (teamspace: string, projectId: string) => FetchDrawingsAction;
	fetchDrawingsSuccess: (projectId: string, drawings: IDrawing[]) => FetchDrawingsSuccessAction;
	fetchDrawingStats: (teamspace: string, projectId: string, drawingId: string) => FetchDrawingStatsAction;
	fetchDrawingStatsSuccess: (projectId: string, drawingId: string, stats: DrawingStats) => FetchDrawingStatsSuccessAction;
	deleteDrawing: (teamspace: string,
		projectId: string,
		drawingId: string,
		onSuccess: () => void,
		onError: (error) => void,
	) => DeleteDrawingAction;
	deleteDrawingSuccess: (projectId: string, drawingId: string) => DeleteDrawingSuccessAction;
	fetchCategories: (teamspace: string, projectId: string) => FetchCategoriesAction;
	fetchCategoriesSuccess: (projectId: string, categories: string[]) => FetchCategoriesSuccessAction;
	createDrawing: (teamspace: string, projectId: string, drawing: IDrawing, onSuccess: () => void, onError: (e:Error) => void) => CreateDrawingAction;
	createDrawingSuccess: (projecId: string, drawing: NewDrawing) => CreateDrawingSuccessAction;
	setDrawingStatus: (projectId: string, drawingId: string, status: DrawingUploadStatus) => SetDrawingStatusAction;
	updateDrawing: (
		teamspace: string, 
		projectId: string, 
		drawingId: string, 
		drawing: Partial<IDrawing>, 
		onSuccess?: () => void, 
		onError?: (e:Error) => void
	) => UpdateDrawingAction;
	updateDrawingSuccess: (projecId: string, drawingId: string, drawing: Partial<IDrawing>) => UpdateDrawingSuccessAction;
	drawingProcessingSuccess: (
		projectId: string,
		drawingId: string,
		revision: IDrawingRevision
	) => DrawingProcessingSuccessAction;
}
