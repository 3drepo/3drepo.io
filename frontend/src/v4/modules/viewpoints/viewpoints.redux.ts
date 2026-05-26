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

import { cloneDeep, keyBy, orderBy } from 'lodash';
import { createActions, createReducer } from 'reduxsauce';
import { SORT_ORDER_TYPES } from '../../constants/sorting';
import { prepareGroup } from '../../helpers/groups';

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
	setCameraOnViewpoint: ['teamspace', 'modelId', 'view'],
	prepareNewViewpoint: ['teamspace', 'modelId', 'viewpointName'],
	setNewViewpoint: ['newViewpoint'],
	setActiveViewpoint: ['teamspace', 'modelId', 'view'],
	setSearchQuery: ['searchQuery'],
	showDeleteInfo: ['viewpointId'],
	setComponentState: ['componentState'],
	shareViewpointLink: ['teamspace', 'modelId', 'viewpointId', 'project', 'revision'],
	setDefaultViewpoint: ['teamspace', 'modelId', 'view'],
	clearDefaultViewpoint: ['teamspace', 'modelId'],
	setSelectedViewpoint: ['selectedViewpoint'],
	showViewpoint: ['teamspace', 'modelId', 'view', 'ignoreCamera'],
	fetchGroupSuccess: ['group'],
	cacheGroupsFromViewpoint: ['viewpoint', 'groupsData'],
	showPreset: ['preset'],
	toggleSortOrder: [],
	fetchViewpointGroups: ['teamspace', 'modelId', 'view'],
	addViewpointGroupsBeingLoaded: ['ids'],
	viewpointReady: [],
	clearColorOverrides: [],
	clearTransformations: [],
	reset: [],
}, { prefix: 'VIEWPOINTS/' });

export interface IViewpointsComponentState {
	sortOrder?: string;
	activeViewpoint?: number;
	editMode?: boolean;
	newViewpoint?: any;
	searchEnabled?: boolean;
	searchQuery?: string;
}

export interface IViewpointsState {
	isPending: boolean;
	viewpointsMap: any[];
	viewpointsGroups: any;
	viewpointsGroupsBeingLoaded: Set<string>;
	componentState: IViewpointsComponentState;
	selectedViewpoint: any;
}

export const INITIAL_STATE: IViewpointsState = {
	isPending: true,
	viewpointsMap: [],
	viewpointsGroups: {},
	viewpointsGroupsBeingLoaded: new Set(),
	componentState: {
		sortOrder: SORT_ORDER_TYPES.ASCENDING,
	},
	selectedViewpoint: null
};

const setPendingState = (state = INITIAL_STATE, { pendingState }) => {
	return { ...state, isPending: pendingState };
};

const prepareViewpointGroups = (viewpoint) => {
	if (Boolean(viewpoint.viewpoint.override_groups?.length)) {
		viewpoint.viewpoint.override_groups = viewpoint.viewpoint.override_groups.map(prepareGroup);
	}
	return viewpoint;
};

const addViewpointGroupsBeingLoaded = (state = INITIAL_STATE, { ids }) => {
	const viewpointsGroupsBeingLoaded = new Set([...state.viewpointsGroupsBeingLoaded, ...ids]);
	return { ...state, viewpointsGroupsBeingLoaded };
};

const fetchViewpointsSuccess = (state = INITIAL_STATE, { viewpoints = [] }) => {
	const viewpointsMap = keyBy(viewpoints.map(prepareViewpointGroups), '_id');
	return { ...state, viewpointsMap };
};

const createViewpointSuccess = (state = INITIAL_STATE, {viewpoint}) => {
	const viewpointsMap = cloneDeep(state.viewpointsMap);
	viewpointsMap[viewpoint._id] = prepareViewpointGroups(viewpoint) ;

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

const showDeleteInfo = (state = INITIAL_STATE, { viewpointId }) => {
	const viewpointsMap = cloneDeep(state.viewpointsMap);
	viewpointsMap[viewpointId].willBeRemoved = true;

	return { ...state, viewpointsMap };
};

const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: {...state.componentState, ...componentState} };
};

const setSelectedViewpoint = (state = INITIAL_STATE, { selectedViewpoint }) => {
	return { ...state, selectedViewpoint };
};

const fetchGroupSuccess = (state = INITIAL_STATE, { group }) => {
	const viewpointsGroupsBeingLoaded = new Set([...state.viewpointsGroupsBeingLoaded]);
	viewpointsGroupsBeingLoaded.delete(group._id);

	return { ...state, viewpointsGroups: { ...state.viewpointsGroups, [group._id]: group }, viewpointsGroupsBeingLoaded };
};

const toggleSortOrder = (state = INITIAL_STATE) => {
	const currentSortOrder = state.componentState.sortOrder;
	const isAsc = currentSortOrder === SORT_ORDER_TYPES.ASCENDING;
	const sortOrder = isAsc ? SORT_ORDER_TYPES.DESCENDING : SORT_ORDER_TYPES.ASCENDING;

	const viewpoints =  orderBy(state.viewpointsMap, ({ name }) => name.trim().toLowerCase(), [sortOrder as ('asc' | 'desc')]);

	state = setComponentState(state, {componentState: { sortOrder }});
	return fetchViewpointsSuccess(state,  {viewpoints});
};

export const reset = () => ({...INITIAL_STATE});

export const reducer = createReducer(INITIAL_STATE, {
	[ViewpointsTypes.SET_PENDING_STATE]: setPendingState,
	[ViewpointsTypes.FETCH_VIEWPOINTS_SUCCESS]: fetchViewpointsSuccess,
	[ViewpointsTypes.CREATE_VIEWPOINT_SUCCESS]: createViewpointSuccess,
	[ViewpointsTypes.UPDATE_VIEWPOINT_SUCCESS]: updateViewpointSuccess,
	[ViewpointsTypes.DELETE_VIEWPOINT_SUCCESS]: deleteViewpointSuccess,
	[ViewpointsTypes.SHOW_DELETE_INFO]: showDeleteInfo,
	[ViewpointsTypes.SET_COMPONENT_STATE]: setComponentState,
	[ViewpointsTypes.SET_SELECTED_VIEWPOINT]: setSelectedViewpoint,
	[ViewpointsTypes.FETCH_GROUP_SUCCESS]: fetchGroupSuccess,
	[ViewpointsTypes.TOGGLE_SORT_ORDER]: toggleSortOrder,
	[ViewpointsTypes.ADD_VIEWPOINT_GROUPS_BEING_LOADED]: addViewpointGroupsBeingLoaded,
	[ViewpointsTypes.RESET]: reset,
});
