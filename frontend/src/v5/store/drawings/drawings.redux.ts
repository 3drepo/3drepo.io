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
import { Drawing, DrawingStats } from './drawings.types';
import { produceAll } from '@/v5/helpers/reducers.helper';

export const { Types: DrawingsTypes, Creators: DrawingsActions } = createActions({
	fetchDrawings: ['teamspace', 'projectId'],
	fetchDrawingsSuccess: ['projectId', 'drawings'],
	fetchDrawingStats: ['teamspace', 'projectId', 'drawingId'],
	fetchDrawingStatsSuccess: ['projectId', 'drawingId', 'stats'],
	fetchCategories: ['teamspace', 'projectId'],
	fetchCategoriesSuccess: ['projectId', 'categories'],
}, { prefix: 'DRAWINGS/' }) as { Types: Constants<DrawingsActionCreators>; Creators: DrawingsActionCreators };


const getDrawingFromState = (state: DrawingsState, projectId, drawingId) => (
	state.drawingsByProject[projectId].find((drawing) => drawing._id === drawingId)
);

export const fetchDrawingsSuccess = (state: DrawingsState, { projectId, drawings } : FetchDrawingsSuccessAction) => {
	state.drawingsByProject[projectId] = drawings;
};

export const fetchDrawingStatsSuccess = (state: DrawingsState, { drawingId, projectId, stats }:FetchDrawingStatsSuccessAction ) => {
	const drawing = getDrawingFromState(state, projectId, drawingId);
	Object.assign(drawing,  { ... stats.revisions });
};

export const fetchCategoriesSuccess = (state: DrawingsState, { projectId, categories }:FetchCategoriesSuccessAction ) => {
	state.categoriesByProject[projectId] = categories;
};

const INITIAL_STATE: DrawingsState = {
	drawingsByProject: {},
	categoriesByProject: {},
};

export interface DrawingsState {
	drawingsByProject: Record<string, Drawing[]>;
	categoriesByProject: Record<string, string[]>;
}

export const drawingsReducer = createReducer<DrawingsState>(INITIAL_STATE, produceAll({
	[DrawingsTypes.FETCH_DRAWINGS_SUCCESS]: fetchDrawingsSuccess,
	[DrawingsTypes.FETCH_DRAWING_STATS_SUCCESS]: fetchDrawingStatsSuccess,
	[DrawingsTypes.FETCH_CATEGORIES_SUCCESS]: fetchCategoriesSuccess,
})) as (state: DrawingsState, action: any) => DrawingsState;


export type FetchDrawingsAction = Action<'FETCH_DRAWINGS'> & TeamspaceAndProjectId;
export type FetchDrawingsSuccessAction = Action<'FETCH_DRAWINGS_SUCCESS'> & ProjectId & { drawings: Drawing[] };
export type FetchDrawingStatsAction = Action<'FETCH_DRAWING_STATS'> & TeamspaceProjectAndDrawingId;
export type FetchDrawingStatsSuccessAction = Action<'FETCH_DRAWING_STATS_SUCCESS'> & ProjectAndDrawingId & { stats: DrawingStats };
export type FetchCategoriesAction = Action<'FETCH_DRAWINGS_CATEGORIES'> & TeamspaceAndProjectId;
export type FetchCategoriesSuccessAction = Action<'FETCH_DRAWINGS_CATEGORIES_SUCCESS'> & ProjectId & { categories: string[] };


export interface DrawingsActionCreators {
	fetchDrawings: (teamspace: string, projectId: string) => FetchDrawingsAction;
	fetchDrawingsSuccess: (projectId: string, drawings: Drawing[]) => FetchDrawingsSuccessAction;
	fetchDrawingStats: (teamspace: string, projectId: string, drawingId: string) => FetchDrawingStatsAction;
	fetchDrawingStatsSuccess: ( projectId: string, drawingId: string, stats: DrawingStats ) => FetchDrawingStatsSuccessAction;
	fetchCategories: (teamspace: string, projectId: string) => FetchCategoriesAction;
	fetchCategoriesSuccess: (projectId: string, categories: string[]) => FetchCategoriesSuccessAction;
}
