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
import { VIEWER_PANELS } from '../../constants/viewerGui';
import { VIEWER_NAV_MODES, INITIAL_HELICOPTER_SPEED } from '../../constants/viewer';

export const { Types: ViewerGuiTypes, Creators: ViewerGuiActions } = createActions({
	fetchData: ['teamspace', 'model', 'revision'],
	resetPanelsStates: [],
	setPanelVisibility: ['panelName', 'visibility'],
	setMeasureVisibility: ['visible'],
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
	changePinColor: ['params'],
	removeUnsavedPin: [],
	resetMapSources: ['source'],
	addMapSource: ['source'],
	removeMapSource: ['source'],
	mapStart: [],
	mapStop: [],
	getScreenshot: [],
	waitForViewer: []
}, { prefix: 'VIEWER_GUI/' });

export interface IViewerGuiState {
	visiblePanels: any;
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
	visiblePanels: {
		[VIEWER_PANELS.ISSUES]: true
	},
	isModelLoaded: false,
	navigationMode: VIEWER_NAV_MODES.TURNTABLE,
	clippingMode: null,
	helicopterSpeed: INITIAL_HELICOPTER_SPEED,
	isFocusMode: false,
	isClipEdit: false,
	clipNumber: 0,
	isPinDropMode: false,
	pinData: null
};

export const setPanelVisibility = (state = INITIAL_STATE, { panelName, visibility }) => {
	const visiblePanels = { ...state.visiblePanels };
	return { ...state,  visiblePanels: {...visiblePanels, [panelName]: visibility} };
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

export const reducer = createReducer(INITIAL_STATE, {
	[ViewerGuiTypes.SET_PANEL_VISIBILITY]: setPanelVisibility,
	[ViewerGuiTypes.SET_IS_MODEL_LOADED] : setIsModelLoaded,
	[ViewerGuiTypes.SET_NAVIGATION_MODE_SUCCESS] : setNavigationModeSuccess,
	[ViewerGuiTypes.SET_CLIPPING_MODE_SUCCESS] : setClippingModeSuccess,
	[ViewerGuiTypes.SET_HELICOPTER_SPEED] : setHelicopterSpeed,
	[ViewerGuiTypes.SET_IS_FOCUS_MODE] : setIsFocusMode,
	[ViewerGuiTypes.SET_CLIP_EDIT_SUCCESS] : setClipEditSuccess,
	[ViewerGuiTypes.SET_CLIP_NUMBER] : setClipNumber,
	[ViewerGuiTypes.SET_IS_PIN_DROP_MODE_SUCCESS]: setIsPinDropModeSuccess,
	[ViewerGuiTypes.SET_PIN_DATA]: setPinData
});
