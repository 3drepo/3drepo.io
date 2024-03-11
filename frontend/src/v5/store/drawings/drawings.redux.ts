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
	addFavourite: ['teamspace', 'projectId', 'drawingId'],
	removeFavourite: ['teamspace', 'projectId', 'drawingId'],
	setFavouriteSuccess: ['projectId', 'drawingId', 'isFavourite'],
	fetchDrawings: ['teamspace', 'projectId'],
	fetchDrawingsSuccess: ['projectId', 'drawings'],
	fetchDrawingStats: ['teamspace', 'projectId', 'drawingId'],
	fetchDrawingStatsSuccess: ['projectId', 'drawingId', 'stats'],
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
	Object.assign(drawing,  { ... stats.revisions });
};

const INITIAL_STATE: DrawingsState = {
	drawingsByProject: {},
};

export interface DrawingsState {
	drawingsByProject: Record<string, Drawing[]>;
}

export const drawingsReducer = createReducer<DrawingsState>(INITIAL_STATE, produceAll({
	[DrawingsTypes.SET_FAVOURITE_SUCCESS]: setFavouriteSuccess,
	[DrawingsTypes.FETCH_DRAWINGS_SUCCESS]: fetchDrawingsSuccess,
	[DrawingsTypes.FETCH_DRAWING_STATS_SUCCESS]: fetchDrawingStatsSuccess,
})) as (state: DrawingsState, action: any) => DrawingsState;


export type AddFavouriteAction = Action<'ADD_FAVOURITE'> & TeamspaceProjectAndDrawingId;
export type RemoveFavouriteAction = Action<'REMOVE_FAVOURITE'> & TeamspaceProjectAndDrawingId;
export type SetFavouriteSuccessAction = Action<'SET_FAVOURITE_SUCCESS'> & ProjectAndDrawingId & { isFavourite: boolean };
export type FetchDrawingsAction = Action<'FETCH_DRAWINGS'> & TeamspaceAndProjectId;
export type FetchDrawingsSuccessAction = Action<'FETCH_DRAWINGS_SUCCESS'> & ProjectId & { drawings: Drawing[] };
export type FetchDrawingStatsAction = Action<'FETCH_DRAWING_STATS'> & TeamspaceProjectAndDrawingId;
export type FetchDrawingStatsSuccessAction = Action<'FETCH_DRAWING_STATS_SUCCESS'> & ProjectAndDrawingId & { stats: DrawingStats };

export interface IDrawingsActionCreators {
	addFavourite: (teamspace: string, projectId: string, drawingId: string) => AddFavouriteAction;
	removeFavourite: (teamspace: string, projectId: string, drawingId: string) => RemoveFavouriteAction;
	setFavouriteSuccess: (projectId: string, drawingId: string, isFavourite: boolean) => SetFavouriteSuccessAction;
	fetchDrawings: (teamspace: string, projectId: string) => FetchDrawingsAction;
	fetchDrawingsSuccess: (projectId: string, drawings: Drawing[]) => FetchDrawingsSuccessAction;
	fetchDrawingStats: (teamspace: string, projectId: string, drawingId: string) => FetchDrawingStatsAction;
	fetchDrawingStatsSuccess: ( projectId: string, drawingId: string, stats: DrawingStats ) => FetchDrawingStatsSuccessAction;
}
