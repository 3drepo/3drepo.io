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
	addLayer: ['layer'],
	removeLayer: ['layer'],
	resetLayers: [],
}, { prefix: 'GIS/' });

interface IGisState {
	layers: string[];
}

export const INITIAL_STATE: IGisState = {
	layers: []
};

export const addLayer = (state = INITIAL_STATE, { layer }): IGisState => {
	const layers =  state.layers.includes(layer) ? [...state.layers] : [...state.layers, layer];
	return { ...state, layers };
};

export const removeLayer = (state = INITIAL_STATE, { layer }): IGisState  => {
	const layers = state.layers.filter( (visibleLayer) => visibleLayer !== layer);
	return { ...state, layers };
};

export const resetLayers = (state = INITIAL_STATE, {}): IGisState  => {
	return { ...state, layers: [] };
};

export const reducer = createReducer(INITIAL_STATE, {
	[GisTypes.ADD_LAYER]: addLayer,
	[GisTypes.REMOVE_LAYER]: removeLayer,
	[GisTypes.RESET_LAYERS]: resetLayers
});
