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

export const { Types: ModelTypes, Creators: ModelActions } = createActions({
	fetchSettings: ['teamspace', 'modelId'],
	fetchSettingsSuccess: ['settings'],
	updateSettings: ['modelData', 'settings'],
	fetchRevisions: ['teamspace', 'modelId'],
	fetchRevisionsSuccess: ['revisions'],
	downloadModel: ['teamspace', 'modelId'],
	uploadModelFile: ['teamspace', 'project', 'modelData', 'fileData'],
	setPendingState: ['pendingState'],
	onModelStatusChanged: ['modelData', 'teamspace', 'project', 'modelId', 'modelName'],
	subscribeOnStatusChange: ['teamspace', 'project', 'modelData'],
	unsubscribeOnStatusChange: ['teamspace', 'project', 'modelData'],
	fetchMaps: ['teamspace', 'modelId'],
	fetchMapsSuccess: ['maps'],
	updateSettingsSuccess: ['settings']
}, { prefix: 'MODEL_' });

export const INITIAL_STATE = {
	settings: {},
	revisions: [],
	isPending: true,
	maps: []
};

const setPendingState = (state = INITIAL_STATE, { pendingState }) => {
	return { ...state, isPending: pendingState };
};

const fetchSettingsSuccess = (state = INITIAL_STATE, { settings }) => {
	return { ...state, settings };
};

const fetchRevisionsSuccess = (state = INITIAL_STATE, { revisions }) => {
	return { ...state, revisions };
};

const fetchMapsSuccess = (state = INITIAL_STATE, { maps }) => {
	return { ...state, maps };
};

const updateSettingsSuccess = (state = INITIAL_STATE, { settings }) => {
	return { ...state, settings: { ...state.settings, ...settings} };
};

export const reducer = createReducer(INITIAL_STATE, {
	[ModelTypes.FETCH_SETTINGS_SUCCESS]: fetchSettingsSuccess,
	[ModelTypes.FETCH_REVISIONS_SUCCESS]: fetchRevisionsSuccess,
	[ModelTypes.SET_PENDING_STATE]: setPendingState,
	[ModelTypes.FETCH_MAPS_SUCCESS]: fetchMapsSuccess,
	[ModelTypes.UPDATE_SETTINGS_SUCCESS]: updateSettingsSuccess
});
