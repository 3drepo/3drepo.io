/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { cloneDeep } from 'lodash';
import { createActions, createReducer } from 'reduxsauce';
import { INITIAL_HELICOPTER_SPEED, VIEWER_NAV_MODES } from '../../constants/viewer';
import { VIEWER_DRAGGABLE_PANELS, VIEWER_LEFT_PANELS, VIEWER_RIGHT_PANELS } from '../../constants/viewerGui';

export const { Types: ViewerGuiTypes, Creators: ViewerGuiActions } = createActions({
	fetchData: ['teamspace', 'model'],
	resetPanelsStates: [],
	setPanelVisibility: ['panelName', 'visibility'],
	setPanelLock: ['panelName'],
	setMeasureVisibility: ['visible'],
	setCoordView: ['visible'],
	setCoordViewSuccess: ['coordViewActive'],
	startListenOnModelLoaded: [],
	stopListenOnModelLoaded: [],
	startListenOnClickPin: [],
	stopListenOnClickPin: [],
	handlePinClick: ['id'],
	setIsModelLoaded: ['isModelLoaded'],
	loadModel: [],
	initialiseToolbar: [],
	goToExtent: [],
	setNavigationMode: ['mode'],
	setNavigationModeSuccess: ['mode'],
	setHelicopterSpeed: ['speed'],
	resetHelicopterSpeed: ['teamspace', 'modelId', 'updateDefaultSpeed'],
	getHelicopterSpeed: ['teamspace', 'modelId'],
	increaseHelicopterSpeed: ['teamspace', 'modelId'],
	decreaseHelicopterSpeed: ['teamspace', 'modelId'],
	setIsFocusMode: ['isFocusMode'],
	setClippingMode: ['mode'],
	setClippingModeSuccess: ['mode'],
	setClipEdit: ['isClipEdit'],
	setClipEditSuccess: ['isClipEdit'],
	setClipNumber: ['clipNumber'],
	updateClipState: ['clipNumber'],
	startListenOnNumClip: [],
	stopListenOnNumClip: [],
	setIsPinDropMode: ['mode'],
	setIsPinDropModeSuccess: ['isPinDropMode'],
	setPinData: ['pinData'],
	deactivateMeasure: [],
	clearHighlights: [],
	setCamera: ['params'],
	setProjectionMode: ['mode'],
	setProjectionModeSuccess: ['mode'],
	resetPanels: [],
	reset: [],
}, { prefix: 'VIEWER_GUI/' });

export interface IViewerGuiState {
	leftPanels: string[];
	rightPanels: string[];
	lockedPanels: string[];
	draggablePanels: string[];
	coordViewActive: boolean;
	isModelLoaded: boolean;
	navigationMode: string;
	clippingMode: string;
	helicopterSpeed: number;
	isFocusMode: boolean;
	isClipEdit: boolean;
	clipNumber: number;
	isPinDropMode: boolean;
	pinData: any;
}

export const INITIAL_STATE: IViewerGuiState = {
	leftPanels: [],
	rightPanels: [],
	lockedPanels: [],
	draggablePanels: [],
	isModelLoaded: false,
	coordViewActive: false,
	navigationMode: VIEWER_NAV_MODES.TURNTABLE,
	clippingMode: null,
	helicopterSpeed: INITIAL_HELICOPTER_SPEED,
	isFocusMode: false,
	isClipEdit: false,
	clipNumber: 0,
	isPinDropMode: false,
	pinData: null,
};

const updatePanelsList = (panels, lockedPanels, panelName, visibility) => {
	const currentVisibility = panels.includes(panelName);
	if (currentVisibility === visibility) {
		return [...panels];
	}

	if (currentVisibility) {
		return panels.filter((panel) => (panel !== panelName));
	}

	if (panels.length > 1) {
		if (lockedPanels.length) {
			return [...panels.filter((panel) => (panel === lockedPanels[0])), panelName];
		}
		panels.shift();
	}

	return [...panels, panelName];
};

export const setPanelVisibility = (state = INITIAL_STATE, { panelName, visibility }) => {
	const locked = [...state.lockedPanels];
	const leftPanels = VIEWER_LEFT_PANELS.map(({type}) => type).includes(panelName) ?
			updatePanelsList([...state.leftPanels], locked, panelName, visibility) : [...state.leftPanels];
	const rightPanels = VIEWER_RIGHT_PANELS.map(({type}) => type).includes(panelName) ?
			updatePanelsList([...state.rightPanels], locked, panelName, visibility) : [...state.rightPanels];
	const lockedPanels = locked.includes(panelName) ? [] : locked;

	const draggablePanels = VIEWER_DRAGGABLE_PANELS.includes(panelName) ?
			updatePanelsList([...state.draggablePanels], locked, panelName, visibility) : [...state.draggablePanels];

	return { ...state, leftPanels, rightPanels, lockedPanels, draggablePanels };
};

export const setPanelLock = (state = INITIAL_STATE, { panelName }) => {
	if (state.lockedPanels.includes(panelName)) {
		return { ...state, lockedPanels: [] };
	}

	const leftPanels = [...state.leftPanels].filter((panel) => (panel !== panelName));

	return { ...state, lockedPanels: [panelName], leftPanels: [panelName, ...leftPanels] };
};

const setProjectionModeSuccess = (state = INITIAL_STATE, { mode }) => {
	return { ...state, projectionMode: mode };
};

const setNavigationModeSuccess = (state = INITIAL_STATE, { mode }) => {
	return { ...state, navigationMode: mode };
};

const setClippingModeSuccess = (state = INITIAL_STATE, { mode }) => {
	return { ...state, clippingMode: mode, isClipEdit: true };
};

const setHelicopterSpeed = (state = INITIAL_STATE, { speed }) => {
	return { ...state, helicopterSpeed: speed };
};

const setIsFocusMode = (state = INITIAL_STATE, { isFocusMode }) => {
	return { ...state, isFocusMode };
};

const setIsModelLoaded = (state = INITIAL_STATE, { isModelLoaded }) => {
	return { ...state, isModelLoaded };
};

const setClipEditSuccess = (state = INITIAL_STATE, { isClipEdit }) => {
	return { ...state, isClipEdit };
};

const setClipNumber = (state = INITIAL_STATE, { clipNumber }) => {
	return { ...state, clipNumber };
};

const setIsPinDropModeSuccess = (state = INITIAL_STATE, { isPinDropMode }) => {
	return { ...state, isPinDropMode };
};

const setPinData = (state = INITIAL_STATE, { pinData }) => {
	return { ...state, pinData };
};

const resetPanels = (state = INITIAL_STATE) => {
	return { ...state, leftPanels: INITIAL_STATE.leftPanels, lockedPanels: INITIAL_STATE.lockedPanels };
};

const setCoordViewSuccess = (state = INITIAL_STATE, { coordViewActive }) => {
	return { ...state, coordViewActive };
};

const reset = () => cloneDeep(INITIAL_STATE);

export const reducer = createReducer(INITIAL_STATE, {
	[ViewerGuiTypes.SET_PANEL_VISIBILITY]: setPanelVisibility,
	[ViewerGuiTypes.SET_PANEL_LOCK]: setPanelLock,
	[ViewerGuiTypes.SET_IS_MODEL_LOADED] : setIsModelLoaded,
	[ViewerGuiTypes.SET_NAVIGATION_MODE_SUCCESS] : setNavigationModeSuccess,
	[ViewerGuiTypes.SET_PROJECTION_MODE_SUCCESS] : setProjectionModeSuccess,
	[ViewerGuiTypes.SET_CLIPPING_MODE_SUCCESS] : setClippingModeSuccess,
	[ViewerGuiTypes.SET_HELICOPTER_SPEED] : setHelicopterSpeed,
	[ViewerGuiTypes.SET_IS_FOCUS_MODE] : setIsFocusMode,
	[ViewerGuiTypes.SET_CLIP_EDIT_SUCCESS] : setClipEditSuccess,
	[ViewerGuiTypes.SET_CLIP_NUMBER] : setClipNumber,
	[ViewerGuiTypes.SET_COORD_VIEW_SUCCESS] : setCoordViewSuccess,
	[ViewerGuiTypes.SET_IS_PIN_DROP_MODE_SUCCESS]: setIsPinDropModeSuccess,
	[ViewerGuiTypes.SET_PIN_DATA]: setPinData,
	[ViewerGuiTypes.RESET_PANELS]: resetPanels,
	[ViewerGuiTypes.RESET]: reset
});
