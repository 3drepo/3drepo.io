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
import { IDrawing, DrawingStats, DrawingUploadStatus } from './drawings.types';
import { produceAll } from '@/v5/helpers/reducers.helper';

export const { Types: DrawingsTypes, Creators: DrawingsActions } = createActions({
	fetchDrawings: ['teamspace', 'projectId'],
	fetchDrawingsSuccess: ['projectId', 'drawings'],
	fetchDrawingStats: ['teamspace', 'projectId', 'drawingId'],
	fetchDrawingStatsSuccess: ['projectId', 'drawingId', 'stats'],
	fetchCategories: ['teamspace', 'projectId'],
	fetchCategoriesSuccess: ['projectId', 'categories'],
	createDrawing: ['teamspace', 'projectId', 'drawing', 'onSuccess', 'onError'],
	createDrawingSuccess: ['projectId', 'drawing'],
	updateDrawing: ['teamspace', 'projectId', 'drawingId', 'drawing', 'onSuccess', 'onError'],
	updateDrawingSuccess: ['projectId', 'drawingId', 'drawing'],
}, { prefix: 'DRAWINGS/' }) as { Types: Constants<IDrawingsActionCreators>; Creators: IDrawingsActionCreators };

const getDrawingFromState = (state: DrawingsState, projectId, drawingId) => (
	state.drawingsByProject[projectId].find((drawing) => drawing._id === drawingId)
);

export const fetchDrawingsSuccess = (state: DrawingsState, { projectId, drawings } : FetchDrawingsSuccessAction) => {
	state.drawingsByProject[projectId] = drawings;
};

export const fetchDrawingStatsSuccess = (state: DrawingsState, { drawingId, projectId, stats }:FetchDrawingStatsSuccessAction ) => {
	const drawing = getDrawingFromState(state, projectId, drawingId);
	Object.assign(drawing,  { ...stats.revisions });
};

export const fetchCategoriesSuccess = (state: DrawingsState, { projectId, categories }:FetchCategoriesSuccessAction ) => {
	state.categoriesByProject[projectId] = categories;
};

export const createDrawingSuccess = (state: DrawingsState, { projectId, drawing }:CreateDrawingSuccessAction ) => {
	state.drawingsByProject[projectId] = (state.drawingsByProject[projectId] || []).concat([drawing]);
};

export const updateDrawingSuccess = (state: DrawingsState, { projectId, drawingId, drawing }:UpdateDrawingSuccessAction ) => {
	const oldDrawing = getDrawingFromState(state, projectId, drawingId);
	Object.assign(oldDrawing,  drawing);
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
	[DrawingsTypes.FETCH_DRAWINGS_SUCCESS]: fetchDrawingsSuccess,
	[DrawingsTypes.FETCH_DRAWING_STATS_SUCCESS]: fetchDrawingStatsSuccess,
	[DrawingsTypes.FETCH_CATEGORIES_SUCCESS]: fetchCategoriesSuccess,
	[DrawingsTypes.CREATE_DRAWING_SUCCESS]: createDrawingSuccess,
	[DrawingsTypes.UPDATE_DRAWING_SUCCESS]: updateDrawingSuccess,
})) as (state: DrawingsState, action: any) => DrawingsState;


export type FetchDrawingsAction = Action<'FETCH_DRAWINGS'> & TeamspaceAndProjectId;
export type FetchDrawingsSuccessAction = Action<'FETCH_DRAWINGS_SUCCESS'> & ProjectId & { drawings: IDrawing[] };
export type FetchDrawingStatsAction = Action<'FETCH_DRAWING_STATS'> & TeamspaceProjectAndDrawingId;
export type FetchDrawingStatsSuccessAction = Action<'FETCH_DRAWING_STATS_SUCCESS'> & ProjectAndDrawingId & { stats: DrawingStats };
export type FetchCategoriesAction = Action<'FETCH_DRAWINGS_CATEGORIES'> & TeamspaceAndProjectId;
export type FetchCategoriesSuccessAction = Action<'FETCH_DRAWINGS_CATEGORIES_SUCCESS'> & ProjectId & { categories: string[] };
export type CreateDrawingAction = Action<'CREATE_DRAWING'> & TeamspaceAndProjectId & SuccessAndErrorCallbacks & { drawing: IDrawing };
export type CreateDrawingSuccessAction = Action<'CREATE_DRAWING_SUCCESS'> &  ProjectId & { drawing: IDrawing };
export type UpdateDrawingAction = Action<'UPDATE_DRAWING'> & TeamspaceProjectAndDrawingId & SuccessAndErrorCallbacks & { drawing: Partial<IDrawing> };
export type UpdateDrawingSuccessAction = Action<'UPDATE_DRAWING_SUCCESS'> &  TeamspaceProjectAndDrawingId & { drawing: Partial<IDrawing> };

export interface IDrawingsActionCreators {
	fetchDrawings: (teamspace: string, projectId: string) => FetchDrawingsAction;
	fetchDrawingsSuccess: (projectId: string, drawings: IDrawing[]) => FetchDrawingsSuccessAction;
	fetchDrawingStats: (teamspace: string, projectId: string, drawingId: string) => FetchDrawingStatsAction;
	fetchDrawingStatsSuccess: ( projectId: string, drawingId: string, stats: DrawingStats ) => FetchDrawingStatsSuccessAction;
	fetchCategories: (teamspace: string, projectId: string) => FetchCategoriesAction;
	fetchCategoriesSuccess: (projectId: string, categories: string[]) => FetchCategoriesSuccessAction;
	createDrawing: (teamspace: string, projectId: string, drawing: IDrawing, onSuccess: () => void, onError: (e:Error) => void) => CreateDrawingAction;
	createDrawingSuccess: (projecId: string, drawing: IDrawing) => CreateDrawingSuccessAction;
	updateDrawing: (
		teamspace: string, 
		projectId: string, 
		drawingId: string, 
		drawing: Partial<IDrawing>, 
		onSuccess: () => void, 
		onError: (e:Error) => void
	) => UpdateDrawingAction;
	updateDrawingSuccess: (projecId: string, drawingId: string, drawing: Partial<IDrawing>) => UpdateDrawingSuccessAction;
}
