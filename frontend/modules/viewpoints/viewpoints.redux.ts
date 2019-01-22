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
import { cloneDeep, keyBy } from 'lodash';

export const { Types: ViewpointsTypes, Creators: ViewpointsActions } = createActions({
	setPendingState: ['pendingState'],
	fetchViewpoints: ['teamspace', 'modelId'],
	fetchViewpointsSuccess: ['viewpoints'],
	createViewpoint: ['teamspace', 'modelId', 'viewpoint'],
	createViewpointSuccess: ['viewpoint'],
	updateViewpoint: ['teamspace', 'modelId', 'viewpointId', 'newName'],
	updateViewpointSuccess: ['viewpoint'],
	deleteViewpoint: ['teamspace', 'modelId', 'viewpointId'],
	deleteViewpointSuccess: ['viewpointId'],
	subscribeOnViewpointChanges: ['teamspace', 'modelId'],
	unsubscribeOnViewpointChanges: ['teamspace', 'modelId'],
	showViewpoint: ['teamspace', 'modelId', 'view'],
	prepareNewViewpoint: ['teamspace', 'modelId', 'viewpointName'],
	setNewViewpoint: ['newViewpoint'],
	setActiveViewpoint: ['activeViewpointId'],
	setSearchQuery: ['searchQuery'],
	setComponentState: ['componentState']
}, { prefix: 'VIEWPOINTS_' });

export const INITIAL_STATE = {
	isPending: true,
	viewpointsMap: [],
	componentState: {}
};

const setPendingState = (state = INITIAL_STATE, { pendingState }) => {
	return { ...state, isPending: pendingState };
};

const fetchViewpointsSuccess = (state = INITIAL_STATE, { viewpoints = [] }) => {
	const viewpointsMap = keyBy(viewpoints, '_id');
	return { ...state, viewpointsMap };
};

const createViewpointSuccess = (state = INITIAL_STATE, { viewpoint }) => {
	const viewpointsMap = cloneDeep(state.viewpointsMap);
	viewpointsMap[viewpoint._id] = viewpoint;

	const componentState = {
		...state.componentState,
		newViewpoint: null
	};

	return { ...state, viewpointsMap, componentState };
};

const updateViewpointSuccess = (state = INITIAL_STATE, { viewpoint }) => {
	const viewpointsMap = cloneDeep(state.viewpointsMap);
	viewpointsMap[viewpoint._id].name = viewpoint.name;

	return { ...state, viewpointsMap };
};

const deleteViewpointSuccess = (state = INITIAL_STATE, { viewpointId }) => {
	const viewpointsMap = cloneDeep(state.viewpointsMap);
	delete viewpointsMap[viewpointId];

	return { ...state, viewpointsMap };
};

const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: {...state.componentState, ...componentState} };
};

export const reducer = createReducer(INITIAL_STATE, {
	[ViewpointsTypes.SET_PENDING_STATE]: setPendingState,
	[ViewpointsTypes.FETCH_VIEWPOINTS_SUCCESS]: fetchViewpointsSuccess,
	[ViewpointsTypes.CREATE_VIEWPOINT_SUCCESS]: createViewpointSuccess,
	[ViewpointsTypes.UPDATE_VIEWPOINT_SUCCESS]: updateViewpointSuccess,
	[ViewpointsTypes.DELETE_VIEWPOINT_SUCCESS]: deleteViewpointSuccess,
	[ViewpointsTypes.SET_COMPONENT_STATE]: setComponentState
});
