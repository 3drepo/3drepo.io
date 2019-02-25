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
import { dispatch } from '../../helpers/migration';

export const { Types: GroupsTypes, Creators: GroupsActions } = createActions({
	fetchGroups: ['teamspace', 'modelId', 'revision'],
	fetchGroupsSuccess: ['groups'],
	togglePendingState: ['isPending'],
	setComponentState: ['componentState'],
	setActiveGroup: ['group', 'filteredGroups', 'revision'],
	showDetails: ['group', 'filteredGroups', 'revision'],
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
	downloadGroups: ['teamspace', 'modelId']
}, { prefix: 'GROUPS_' });

export const INITIAL_STATE = {
	groupsMap: {},
	isPending: true,
	componentState: {
		activeGroup: null,
		highlightedGroups: {},
		showDetails: false,
		expandDetails: true,
		newGroup: {},
		selectedFilters: [],
		colorOverrides: {},
		overrideAll: false
	}
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

export const deleteGroupSuccess = (state = INITIAL_STATE, { groupId }) => {
	const groupsMap = { ...state.groupsMap };
	delete groupsMap[groupId];
	return { ...state, groupsMap };
};

export const reducer = createReducer(INITIAL_STATE, {
	[GroupsTypes.FETCH_GROUPS_SUCCESS]: fetchGroupsSuccess,
	[GroupsTypes.TOGGLE_PENDING_STATE]: togglePendingState,
	[GroupsTypes.SET_COMPONENT_STATE]: setComponentState,
	[GroupsTypes.ADD_TO_HIGHLIGHTED]: addToHighlighted,
	[GroupsTypes.REMOVE_FROM_HIGHLIGHTED]: removeFromHighlighted,
	[GroupsTypes.ADD_TO_OVERRIDED]: addToOverrided,
	[GroupsTypes.REMOVE_FROM_OVERRIDED]: removeFromOverrided,
	[GroupsTypes.DELETE_GROUP_SUCCESS]: deleteGroupSuccess
});
