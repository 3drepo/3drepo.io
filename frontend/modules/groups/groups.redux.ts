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
import { keyBy } from 'lodash';

export const { Types: GroupsTypes, Creators: GroupsActions } = createActions({
	fetchGroups: ['teamspace', 'modelId', 'revision'],
	fetchGroupsSuccess: ['groups'],
	togglePendingState: ['isPending'],
	setComponentState: ['componentState'],
	setActiveGroup: ['group', 'revision'],
	showDetails: ['group', 'revision'],
	closeDetails: [],
	setNewGroup: [],
	updateNewGroup: ['newGroup'],
	selectGroup: ['group'],
	addToHighlighted: ['groupId'],
	removeFromHighlighted: ['groupId'],
	highlightGroup: ['group'],
	dehighlightGroup: ['group'],
	clearSelectionHighlights: [],
	addColorOverride: ['group'],
	removeColorOverride: ['groupId', 'overridedGroup'],
	toggleColorOverride: ['group'],
	addToOverrided: ['groupId', 'override'],
	removeFromOverrided: ['groupId'],
	toggleColorOverrideAll: [],
	deleteGroups: ['teamspace', 'modelId', 'groups'],
	deleteGroupSuccess: ['groupId'],
	isolateGroup: ['group'],
	downloadGroups: ['teamspace', 'modelId'],
	createGroup: ['teamspace', 'modelId', 'group'],
	updateGroup: ['teamspace', 'modelId', 'groupId'],
	updateGroupSuccess: ['group'],
	subscribeOnChanges: ['teamspace', 'modelId'],
	unsubscribeFromChanges: ['teamspace', 'modelId'],
	getFieldNames: ['teamspace', 'modelId'],
	getFieldNamesSuccess: ['fieldNames']
}, { prefix: 'GROUPS/' });

export interface IGroupComponentState {
	activeGroup: any;
	showDetails: boolean;
	expandDetails: boolean;
	newGroup: any;
	updatedGroup: any;
	selectedFilters: any[];
	highlightedGroups: any;
	colorOverrides: any;
	overrideAll: boolean;
	totalMeshes: number;
}

export interface IGroupState {
	groupsMap: any;
	isPending: boolean;
	componentState: IGroupComponentState;
	fieldNames: any[];
}

export const INITIAL_STATE: IGroupState = {
	groupsMap: {},
	isPending: true,
	componentState: {
		activeGroup: null,
		highlightedGroups: {},
		showDetails: false,
		expandDetails: true,
		newGroup: {},
		updatedGroup: {},
		selectedFilters: [],
		colorOverrides: {},
		overrideAll: false,
		totalMeshes: 0
	},
	fieldNames: []
};

export const togglePendingState = (state = INITIAL_STATE, { isPending }) => ({ ...state, isPending });

export const fetchGroupsSuccess = (state = INITIAL_STATE, { groups = [] }) => {
	const groupsMap = keyBy(groups, '_id');
	return { ...state, groupsMap };
};

export const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: { ...state.componentState, ...componentState } };
};

export const addToHighlighted = (state = INITIAL_STATE, { groupId }) => {
	const highlightedGroups = { ...state.componentState.highlightedGroups };
	highlightedGroups[groupId] = true;
	return { ...state, componentState: { ...state.componentState, highlightedGroups } };
};

export const removeFromHighlighted = (state = INITIAL_STATE, { groupId }) => {
	const highlightedGroups = { ...state.componentState.highlightedGroups };
	highlightedGroups[groupId] = false;
	return { ...state, componentState: { ...state.componentState, highlightedGroups } };
};

export const addToOverrided = (state = INITIAL_STATE, { groupId, override }) => {
	const colorOverrides = { ...state.componentState.colorOverrides };
	colorOverrides[groupId] = override;
	return { ...state, componentState: { ...state.componentState, colorOverrides } };
};

export const removeFromOverrided = (state = INITIAL_STATE, { groupId }) => {
	const colorOverrides = { ...state.componentState.colorOverrides };
	colorOverrides[groupId] = undefined;
	return { ...state, componentState: { ...state.componentState, colorOverrides } };
};

export const updateGroupSuccess = (state = INITIAL_STATE, { group }) => {
	const groupsMap = { ...state.groupsMap };
	groupsMap[group._id] = group;
	return { ...state, groupsMap };
};

export const deleteGroupSuccess = (state = INITIAL_STATE, { groupId }) => {
	const groupsMap = { ...state.groupsMap };
	delete groupsMap[groupId];
	return { ...state, groupsMap };
};

export const getFieldNamesSuccess = (state = INITIAL_STATE, { fieldNames }) => {
	return { ...state, fieldNames };
};

export const reducer = createReducer(INITIAL_STATE, {
	[GroupsTypes.FETCH_GROUPS_SUCCESS]: fetchGroupsSuccess,
	[GroupsTypes.TOGGLE_PENDING_STATE]: togglePendingState,
	[GroupsTypes.SET_COMPONENT_STATE]: setComponentState,
	[GroupsTypes.ADD_TO_HIGHLIGHTED]: addToHighlighted,
	[GroupsTypes.REMOVE_FROM_HIGHLIGHTED]: removeFromHighlighted,
	[GroupsTypes.ADD_TO_OVERRIDED]: addToOverrided,
	[GroupsTypes.REMOVE_FROM_OVERRIDED]: removeFromOverrided,
	[GroupsTypes.UPDATE_GROUP_SUCCESS]: updateGroupSuccess,
	[GroupsTypes.DELETE_GROUP_SUCCESS]: deleteGroupSuccess,
	[GroupsTypes.GET_FIELD_NAMES_SUCCESS]: getFieldNamesSuccess
});
