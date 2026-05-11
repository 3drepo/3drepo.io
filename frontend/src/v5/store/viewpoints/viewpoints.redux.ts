/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { keyBy, orderBy, values } from 'lodash';
import { createActions, createReducer } from 'reduxsauce';
import { Action } from 'redux';
import { prepareGroup } from '@/v4/helpers/groups';
import { produceAll } from '@/v5/helpers/reducers.helper';
import { Constants } from '@/v5/helpers/actions.helper';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';
import { IViewpoint } from './viewpoints.types';

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
}, { prefix: 'VIEWPOINTS/' }) as { Types: Constants<IViewpointsActionCreators>; Creators: IViewpointsActionCreators };

export interface IViewpointsState {
	isPending: boolean;
	viewpointsMap: Record<string, IViewpoint>;
	viewpointsGroups: Record<string, any>;
	viewpointsGroupsBeingLoaded: Set<string>;
	sortOrder: string;
	selectedViewpoint: IViewpoint | null;
	newViewpoint: IViewpoint | null; // TODO type
}

export const INITIAL_STATE: IViewpointsState = {
	isPending: true,
	viewpointsMap: {},
	viewpointsGroups: {},
	viewpointsGroupsBeingLoaded: new Set(),
	sortOrder: SortingDirection.ASCENDING,
	selectedViewpoint: null,
	newViewpoint: null,
};

const prepareViewpointGroups = (viewpoint: IViewpoint): IViewpoint => {
	if (viewpoint.viewpoint?.override_groups?.length) {
		viewpoint.viewpoint.override_groups = viewpoint.viewpoint.override_groups.map(prepareGroup);
	}
	return viewpoint;
};

const setPendingState = (state: IViewpointsState, { pendingState }: SetPendingStateAction) => {
	state.isPending = pendingState;
};

const setNewViewpoint = (state: IViewpointsState, { newViewpoint }: SetNewViewpointAction) => {
	state.newViewpoint = newViewpoint;
};

const fetchViewpointsSuccess = (state: IViewpointsState, { viewpoints = [] }: FetchViewpointsSuccessAction) => {
	state.viewpointsMap = keyBy(viewpoints.map(prepareViewpointGroups), '_id');
};

const createViewpointSuccess = (state: IViewpointsState, { viewpoint }: CreateViewpointSuccessAction) => {
	state.viewpointsMap[viewpoint._id] = prepareViewpointGroups(viewpoint);
	state.newViewpoint = null;
};

const updateViewpointSuccess = (state: IViewpointsState, { viewpoint }: UpdateViewpointSuccessAction) => {
	state.viewpointsMap[viewpoint._id].name = viewpoint.name;
};

const deleteViewpointSuccess = (state: IViewpointsState, { viewpointId }: DeleteViewpointSuccessAction) => {
	delete state.viewpointsMap[viewpointId];
};

const setSelectedViewpoint = (state: IViewpointsState, { selectedViewpoint }: SetSelectedViewpointAction) => {
	state.selectedViewpoint = selectedViewpoint;
};

const fetchGroupSuccess = (state: IViewpointsState, { group }: FetchGroupSuccessAction) => {
	state.viewpointsGroupsBeingLoaded.delete(group._id);
	state.viewpointsGroups[group._id] = group;
};

const addViewpointGroupsBeingLoaded = (state: IViewpointsState, { ids }: AddViewpointGroupsBeingLoadedAction) => {
	ids.forEach((id) => state.viewpointsGroupsBeingLoaded.add(id));
};

const toggleSortOrder = (state: IViewpointsState) => {
	const isAsc = state.sortOrder === SortingDirection.ASCENDING;
	const newSortOrder = isAsc ? SortingDirection.DESCENDING : SortingDirection.ASCENDING;
	state.sortOrder = newSortOrder;
	const sorted = orderBy(values(state.viewpointsMap), ({ name }) => name.trim().toLowerCase(), [newSortOrder]);
	state.viewpointsMap = keyBy(sorted, '_id');
};

const reset = () => ({ ...INITIAL_STATE, viewpointsGroupsBeingLoaded: new Set<string>() });

export const viewpointsReducer = createReducer(INITIAL_STATE, produceAll({
	[ViewpointsTypes.SET_PENDING_STATE]: setPendingState,
	[ViewpointsTypes.FETCH_VIEWPOINTS_SUCCESS]: fetchViewpointsSuccess,
	[ViewpointsTypes.CREATE_VIEWPOINT_SUCCESS]: createViewpointSuccess,
	[ViewpointsTypes.UPDATE_VIEWPOINT_SUCCESS]: updateViewpointSuccess,
	[ViewpointsTypes.DELETE_VIEWPOINT_SUCCESS]: deleteViewpointSuccess,
	[ViewpointsTypes.SET_SELECTED_VIEWPOINT]: setSelectedViewpoint,
	[ViewpointsTypes.SET_NEW_VIEWPOINT]: setNewViewpoint,
	[ViewpointsTypes.FETCH_GROUP_SUCCESS]: fetchGroupSuccess,
	[ViewpointsTypes.TOGGLE_SORT_ORDER]: toggleSortOrder,
	[ViewpointsTypes.ADD_VIEWPOINT_GROUPS_BEING_LOADED]: addViewpointGroupsBeingLoaded,
	[ViewpointsTypes.RESET]: reset,
}));

// Action Types
export type SetPendingStateAction = Action<'SET_PENDING_STATE'> & { pendingState: boolean };
export type FetchViewpointsAction = Action<'FETCH_VIEWPOINTS'> & { teamspace: string; modelId: string };
export type FetchViewpointsSuccessAction = Action<'FETCH_VIEWPOINTS_SUCCESS'> & { viewpoints: IViewpoint[] };
export type CreateViewpointAction = Action<'CREATE_VIEWPOINT'> & { teamspace: string; modelId: string; viewpoint: any };
export type CreateViewpointSuccessAction = Action<'CREATE_VIEWPOINT_SUCCESS'> & { viewpoint: IViewpoint };
export type UpdateViewpointAction = Action<'UPDATE_VIEWPOINT'> & { teamspace: string; modelId: string; viewpointId: string; newName: string };
export type UpdateViewpointSuccessAction = Action<'UPDATE_VIEWPOINT_SUCCESS'> & { viewpoint: Partial<IViewpoint> };
export type DeleteViewpointAction = Action<'DELETE_VIEWPOINT'> & { teamspace: string; modelId: string; viewpointId: string };
export type DeleteViewpointSuccessAction = Action<'DELETE_VIEWPOINT_SUCCESS'> & { viewpointId: string };
export type SubscribeOnViewpointChangesAction = Action<'SUBSCRIBE_ON_VIEWPOINT_CHANGES'> & { teamspace: string; modelId: string };
export type UnsubscribeOnViewpointChangesAction = Action<'UNSUBSCRIBE_ON_VIEWPOINT_CHANGES'> & { teamspace: string; modelId: string };
export type SetCameraOnViewpointAction = Action<'SET_CAMERA_ON_VIEWPOINT'> & { teamspace: string; modelId: string; view: any };
export type PrepareNewViewpointAction = Action<'PREPARE_NEW_VIEWPOINT'> & { teamspace: string; modelId: string; viewpointName: string };
export type SetNewViewpointAction = Action<'SET_NEW_VIEWPOINT'> & { newViewpoint: any };
export type SetActiveViewpointAction = Action<'SET_ACTIVE_VIEWPOINT'> & { teamspace: string; modelId: string; view: any };
export type ShowDeleteInfoAction = Action<'SHOW_DELETE_INFO'> & { viewpointId: string };
export type ShareViewpointLinkAction = Action<'SHARE_VIEWPOINT_LINK'> & { teamspace: string; modelId: string; viewpointId: string; project?: string; revision?: string };
export type SetDefaultViewpointAction = Action<'SET_DEFAULT_VIEWPOINT'> & { teamspace: string; modelId: string; view: any };
export type ClearDefaultViewpointAction = Action<'CLEAR_DEFAULT_VIEWPOINT'> & { teamspace: string; modelId: string };
export type SetSelectedViewpointAction = Action<'SET_SELECTED_VIEWPOINT'> & { selectedViewpoint: any };
export type ShowViewpointAction = Action<'SHOW_VIEWPOINT'> & { teamspace: string; modelId: string; view: any; ignoreCamera?: boolean };
export type FetchGroupSuccessAction = Action<'FETCH_GROUP_SUCCESS'> & { group: any };
export type CacheGroupsFromViewpointAction = Action<'CACHE_GROUPS_FROM_VIEWPOINT'> & { viewpoint: any; groupsData: any };
export type ShowPresetAction = Action<'SHOW_PRESET'> & { preset: string };
export type FetchViewpointGroupsAction = Action<'FETCH_VIEWPOINT_GROUPS'> & { teamspace: string; modelId: string; view: any };
export type AddViewpointGroupsBeingLoadedAction = Action<'ADD_VIEWPOINT_GROUPS_BEING_LOADED'> & { ids: string[] };

export interface IViewpointsActionCreators {
	setPendingState: (pendingState: boolean) => SetPendingStateAction;
	fetchViewpoints: (teamspace: string, modelId: string) => FetchViewpointsAction;
	fetchViewpointsSuccess: (viewpoints: IViewpoint[]) => FetchViewpointsSuccessAction;
	createViewpoint: (teamspace: string, modelId: string, viewpoint: any) => CreateViewpointAction;
	createViewpointSuccess: (viewpoint: IViewpoint) => CreateViewpointSuccessAction;
	updateViewpoint: (teamspace: string, modelId: string, viewpointId: string, newName: string) => UpdateViewpointAction;
	updateViewpointSuccess: (viewpoint: Partial<IViewpoint>) => UpdateViewpointSuccessAction;
	deleteViewpoint: (teamspace: string, modelId: string, viewpointId: string) => DeleteViewpointAction;
	deleteViewpointSuccess: (viewpointId: string) => DeleteViewpointSuccessAction;
	subscribeOnViewpointChanges: (teamspace: string, modelId: string) => SubscribeOnViewpointChangesAction;
	unsubscribeOnViewpointChanges: (teamspace: string, modelId: string) => UnsubscribeOnViewpointChangesAction;
	setCameraOnViewpoint: (teamspace: string, modelId: string, view: any) => SetCameraOnViewpointAction;
	prepareNewViewpoint: (teamspace: string, modelId: string, viewpointName: string) => PrepareNewViewpointAction;
	setNewViewpoint: (newViewpoint: any) => SetNewViewpointAction;
	shareViewpointLink: (teamspace: string, modelId: string, viewpointId: string, project?: string, revision?: string) => ShareViewpointLinkAction;
	setDefaultViewpoint: (teamspace: string, modelId: string, view: any) => SetDefaultViewpointAction;
	clearDefaultViewpoint: (teamspace: string, modelId: string) => ClearDefaultViewpointAction;
	setSelectedViewpoint: (selectedViewpoint: any) => SetSelectedViewpointAction;
	showViewpoint: (teamspace: string, modelId: string, view: any, ignoreCamera?: boolean) => ShowViewpointAction;
	fetchGroupSuccess: (group: any) => FetchGroupSuccessAction;
	cacheGroupsFromViewpoint: (viewpoint: any, groupsData: any) => CacheGroupsFromViewpointAction;
	showPreset: (preset: string) => ShowPresetAction;
	toggleSortOrder: () => Action;
	fetchViewpointGroups: (teamspace: string, modelId: string, view: any) => FetchViewpointGroupsAction;
	addViewpointGroupsBeingLoaded: (ids: string[]) => AddViewpointGroupsBeingLoadedAction;
	viewpointReady: () => Action;
	clearColorOverrides: () => Action;
	clearTransformations: () => Action;
	reset: () => Action;
}
