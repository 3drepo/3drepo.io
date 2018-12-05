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
import { cloneDeep } from 'lodash';

export const { Types: ViewpointsTypes, Creators: ViewpointsActions } = createActions({
	setPendingState: ['pendingState'],
	fetchViewpoints: ['teamspace', 'modelId'],
	fetchViewpointsSuccess: ['viewpoints'],
	createViewpoint: ['teamspace', 'modelId', 'viewpointName'],
	createViewpointSuccess: ['viewpoint'],
	updateViewpoint: ['teamspace', 'modelId', 'viewpointId', 'newName'],
	updateViewpointSuccess: ['viewpoint'],
	deleteViewpoint: ['teamspace', 'modelId', 'viewpointId'],
	deleteViewpointSuccess: ['viewpointId'],
	subscribeOnViewpointChanges: ['teamspace', 'modelId'],
	unsubscribeOnViewpointChanges: ['teamspace', 'modelId'],
	showViewpoint: ['teamspace', 'modelId', 'view']
}, { prefix: 'VIEWPOINTS_' });

export const INITIAL_STATE = {
	items: [],
	isPending: true
};

const setPendingState = (state = INITIAL_STATE, { pendingState }) => {
	return { ...state, isPending: pendingState };
};

const fetchViewpointsSuccess = (state = INITIAL_STATE, {viewpoints}) => {
	return { ...state, items: viewpoints };
};

const createViewpointSuccess = (state = INITIAL_STATE, {viewpoint}) => {
	const items = cloneDeep(state.items);
	const viewpoints = [...items, viewpoint ];

	return { ...state, items: viewpoints };
};

const updateViewpointSuccess = (state = INITIAL_STATE, {viewpoint}) => {
	const items = cloneDeep(state.items);
	const updatedViewpointIndex = items.findIndex((item) => item._id === viewpoint._id);
	const updatedItems = items;

	updatedItems[updatedViewpointIndex].name = viewpoint.name;
	return { ...state, items: updatedItems };
};

const deleteViewpointSuccess = (state = INITIAL_STATE, {viewpointId}) => {
	const items = cloneDeep(state.items);
	const updatedItems = items.filter((item) => item._id !== viewpointId);

	return { ...state, items: updatedItems };
};

export const reducer = createReducer(INITIAL_STATE, {
	[ViewpointsTypes.SET_PENDING_STATE]: setPendingState,
	[ViewpointsTypes.FETCH_VIEWPOINTS_SUCCESS]: fetchViewpointsSuccess,
	[ViewpointsTypes.CREATE_VIEWPOINT_SUCCESS]: createViewpointSuccess,
	[ViewpointsTypes.UPDATE_VIEWPOINT_SUCCESS]: updateViewpointSuccess,
	[ViewpointsTypes.DELETE_VIEWPOINT_SUCCESS]: deleteViewpointSuccess
});
