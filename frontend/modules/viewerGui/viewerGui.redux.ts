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

export const { Types: ViewerGuiTypes, Creators: ViewerGuiActions } = createActions({
	fetchData: ['teamspace', 'model', 'revision'],
	resetPanelsStates: [],
	setPanelVisibility: ['panelName', 'visibility'],
	setMeasureVisibility: ['visible']
}, { prefix: 'VIEWER_GUI/' });

export interface IViewerGuiState {
	visiblePanels: any;
}

export const INITIAL_STATE: IViewerGuiState = {
	visiblePanels: {}
};

export const setPanelVisibility = (state = INITIAL_STATE, { panelName, visibility }) => {
	const visiblePanels = { ...state.visiblePanels };
	return { ...state,  visiblePanels: {...visiblePanels, [panelName]: visibility} };
};

export const reducer = createReducer(INITIAL_STATE, {
	[ViewerGuiTypes.SET_PANEL_VISIBILITY]: setPanelVisibility
});
