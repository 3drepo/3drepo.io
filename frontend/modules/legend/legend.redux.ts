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

import { createActions, createReducer } from 'reduxsauce';

export const { Types: LegendTypes, Creators: LegendActions } = createActions({
	togglePanel: [],
	togglePendingState: ['isPending'],
	toggleUpdatePendingState: ['isUpdatePending'],
	fetch: [],
	fetchSuccess: ['legend'],
	update: ['legend'],
	updateLegendItem: ['legendItem'],
	deleteLegendItem: ['legendItem'],
	prepareNewLegendItem: ['legendItem'],
	setDefault: [],
	setComponentState: ['componentState'],
	resetComponentState: [],
	reset: [],
	resetPanel: [],
}, { prefix: 'LEGEND/' });

export interface ILegend {
	name: string;
	color: string;
}

export interface ILegendComponentState extends ILegend {
	editMode?: boolean;
}

export interface ILegendState {
	isPending?: boolean;
	legend: ILegend[];
	isUpdatePending?: boolean;
	componentState?: ILegendComponentState;
}

export const INITIAL_STATE: ILegendState = {
	isPending: true,
	legend: [],
	isUpdatePending: false,
};

export const togglePendingState = (state = INITIAL_STATE, { isPending }) => ({ ...state, isPending });

export const toggleUpdatePendingState = (state = INITIAL_STATE, { isUpdatePending }) => ({ ...state, isUpdatePending });

export const fetchSuccess = (state = INITIAL_STATE, { legend }) => ({ ...state, legend });

const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: {...state.componentState, ...componentState} };
};

const resetComponentState = (state = INITIAL_STATE) => ({ ...state, componentState: {} });

const resetPanel = (state = INITIAL_STATE) => ({ ...INITIAL_STATE });

export const reducer = createReducer(INITIAL_STATE, {
	[LegendTypes.TOGGLE_PENDING_STATE]: togglePendingState,
	[LegendTypes.TOGGLE_UPDATE_PENDING_STATE]: toggleUpdatePendingState,
	[LegendTypes.FETCH_SUCCESS]: fetchSuccess,
	[LegendTypes.SET_COMPONENT_STATE]: setComponentState,
	[LegendTypes.RESET_COMPONENT_STATE]: resetComponentState,
	[LegendTypes.RESET_PANEL]: resetPanel,
});
