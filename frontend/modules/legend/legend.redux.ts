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
	fetch: [],
	fetchSuccess: ['legend'],
	update: ['legend'],
	updateLegendItem: ['legendItem'],
	deleteLegendItem: ['legendItem'],
	setDefault: [],
	reset: [],
}, { prefix: 'LEGEND/' });

export interface ILegend {
	name: string;
	color: string;
}

export interface ILegendState {
	isPending?: boolean;
	legend: ILegend[];
}

export const INITIAL_STATE: ILegendState = {
	isPending: true,
	legend: [],
};

export const togglePendingState = (state = INITIAL_STATE, { isPending }) => ({ ...state, isPending });

export const fetchSuccess = (state = INITIAL_STATE, { legend }) => ({ ...state, legend });

export const reducer = createReducer(INITIAL_STATE, {
	[LegendTypes.TOGGLE_PENDING_STATE]: togglePendingState,
	[LegendTypes.FETCH_SUCCESS]: fetchSuccess,
});
