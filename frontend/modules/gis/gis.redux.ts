/**
 *  Copyright (C) 2017 3D Repo Ltd
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

export const { Types: GisTypes, Creators: GisActions } = createActions({
	initialiseMap: ['params'],
	initialiseMapSuccess: ['initialised'],
	addSource: ['source'],
	addSourceSuccess: ['source'],
	removeSource: ['source'],
	removeSourceSuccess: ['source'],
	resetSources: [],
	resetSourcesSuccess: [],
	resetMap: []
}, { prefix: 'GIS_' });

export const INITIAL_STATE = {
	initialised: false,
	visibleSources: []
};

export const initialiseMapSuccess = (state = INITIAL_STATE, { initialised }) => {
	return { ...state, initialised };
};

export const addSourceSuccess = (state = INITIAL_STATE, { source }) => {
	const visibleSources = [...state.visibleSources, source];
	return { ...state, visibleSources };
};

export const removeSourceSuccess = (state = INITIAL_STATE, { source }) => {
	const visibleSources = state.visibleSources.filter(
		(visibleSource) => visibleSource !== source);

	return { ...state, visibleSources };
};

export const resetSourcesSuccess = (state = INITIAL_STATE, {}) => {
	return { ...state, visibleSources: [] };
};

export const reducer = createReducer(INITIAL_STATE, {
	[GisTypes.INITIALISE_MAP_SUCCESS]: initialiseMapSuccess,
	[GisTypes.ADD_SOURCE_SUCCESS]: addSourceSuccess,
	[GisTypes.REMOVE_SOURCE_SUCCESS]: removeSourceSuccess,
	[GisTypes.RESET_SOURCES_SUCCESS]: resetSourcesSuccess
});
