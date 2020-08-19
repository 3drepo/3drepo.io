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

import { keyBy } from 'lodash';
import { createActions, createReducer } from 'reduxsauce';

export const { Types: GroupsTypes, Creators: GroupsActions } = createActions({
	fetchGroups: ['teamspace', 'modelId', 'revision'],
	fetchGroupsSuccess: ['groups'],
	togglePendingState: ['isPending'],
	toggleDetailsPendingState: ['isPending'],
	setComponentState: ['componentState'],
	setActiveGroup: ['group', 'revision'],
	resetActiveGroup: ['group'],
	showDetails: ['group', 'revision'],
	closeDetails: [],
	setNewGroup: [],
	selectGroup: ['group'],
	addToHighlighted: ['groupId'],
	removeFromHighlighted: ['groupId'],
	highlightGroup: ['group'],
	dehighlightGroup: ['group'],
	clearSelectionHighlights: ['shouldClearTree'],
	addColorOverride: ['groupId'],
	removeColorOverride: ['groupId'],
	clearColorOverrides: [],
	clearColorOverridesSuccess: [],
	setColorOverrides: ['groupIds'],
	toggleColorOverride: ['groupId'],
	setOverrideAll: ['overrideAll'],
	setOverrideAllSuccess: [],
	deleteGroups: ['teamspace', 'modelId', 'groups'],
	showDeleteInfo: ['groupIds'],
	deleteGroupsSuccess: ['groupIds'],
	isolateGroup: ['group'],
	downloadGroups: ['teamspace', 'modelId'],
	createGroup: ['teamspace', 'modelId', 'revision', 'group'],
	updateGroup: ['teamspace', 'modelId', 'revision', 'groupId'],
	showUpdateInfo: [],
	updateGroupSuccess: ['group'],
	subscribeOnChanges: ['teamspace', 'modelId'],
	unsubscribeFromChanges: ['teamspace', 'modelId'],
	setCriteriaFieldState: ['criteriaFieldState'],
	resetToSavedSelection: ['groupId'],
	resetComponentState: [],
}, { prefix: 'GROUPS/' });

export interface ICriteriaFieldState {
	pastedCriteria: string;
	isPasteEnabled: boolean;
	selectedCriterion: string;
	criterionForm: {
		field: string;
		operator: string;
		values: string[] | number[];
	};
}

export interface IGroupComponentState {
	activeGroup: any;
	showDetails: boolean;
	expandDetails: boolean;
	newGroup: any;
	updatedGroup: any;
	selectedFilters: any[];
	highlightedGroups: any;
	totalMeshes: number;
	criteriaFieldState: ICriteriaFieldState;
	allOverridden: boolean;
	searchEnabled: boolean;
	fetchingDetailsIsPending: boolean;
}

export interface IGroupState {
	groupsMap: any;
	isPending: boolean;
	componentState: IGroupComponentState;
	fieldNames: any[];
	colorOverrides: any;
}

export const INITIAL_CRITERIA_FIELD_STATE = {
	pastedCriteria: '',
	isPasteEnabled: false,
	selectedCriterion: '',
	criterionForm: {
		field: '',
		operator: '',
		values: []
	}
};

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
		totalMeshes: 0,
		criteriaFieldState: INITIAL_CRITERIA_FIELD_STATE,
		allOverridden: false,
		searchEnabled: false,
		fetchingDetailsIsPending: false,
	},
	colorOverrides: [],
	fieldNames: []
};

export const togglePendingState = (state = INITIAL_STATE, { isPending }) => ({ ...state, isPending });

export const toggleDetailsPendingState = (state = INITIAL_STATE, { isPending }) => {
	return setComponentState(state, { componentState: { fetchingDetailsIsPending: isPending } });
};

export const fetchGroupsSuccess = (state = INITIAL_STATE, { groups = [] }) => {
	const groupsMap = keyBy(groups, '_id');
	return { ...state, colorOverrides: [], groupsMap };
};

export const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: { ...state.componentState, ...componentState } };
};

export const setCriteriaFieldState = (state = INITIAL_STATE, { criteriaFieldState = {} }) => {
	return setComponentState(state, { componentState: {
		...state.componentState,
		criteriaFieldState: {
			...state.componentState.criteriaFieldState,
			...criteriaFieldState
		}
	}});
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

export const addColorOverride = (state = INITIAL_STATE, { groupId }) => {
	if (state.colorOverrides.includes(groupId)) {
		return state;
	}

	return {...state, colorOverrides: state.colorOverrides.concat(groupId)};
};

export const removeColorOverride = (state = INITIAL_STATE, { groupId }) => {
	const componentState = { ...state.componentState, allOverridden: false };
	return {...state, componentState, colorOverrides: state.colorOverrides.filter((id) => groupId !== id)};
};

export const setColorOverrides = (state = INITIAL_STATE, { groupIds }) => {
	// This is done to keep the relative override order
	const overridesLeft = state.colorOverrides.filter((groupId) => groupIds.includes(groupId));
	const newOverrides = groupIds.filter((groupId) =>  !state.colorOverrides.includes(groupId));

	return {...state, colorOverrides: newOverrides.concat(overridesLeft)};
};

export const updateGroupSuccess = (state = INITIAL_STATE, { group }) => {
	const groupsMap = { ...state.groupsMap };
	const newGroup = { ...state.componentState.newGroup };

	groupsMap[group._id] = group;

	if (newGroup) {
		newGroup.willBeUpdated = false;
		newGroup.objects = group.objects;
		newGroup.totalSavedMeshes = group.totalSavedMeshes;
	}

	if (state.componentState.allOverridden) {
		state = addColorOverride(state, { groupId: group._id});
	}

	return { ...state, groupsMap, componentState: { ...state.componentState, newGroup } };
};

export const deleteGroupsSuccess = (state = INITIAL_STATE, { groupIds }) => {
	const groupsMap = { ...state.groupsMap };
	const newGroup = { ...state.componentState.newGroup };

	if (newGroup) {
		newGroup.willBeRemoved = false;
	}

	groupIds.forEach((groupId) => {
		groupsMap[groupId].willBeRemoved = false;
		delete groupsMap[groupId];
	});

	return { ...state, groupsMap, componentState: { ...state.componentState, newGroup } };
};

export const showUpdateInfo = (state = INITIAL_STATE, {}) => {
	const newGroup = { ...state.componentState.newGroup };

	if (newGroup) {
		newGroup.willBeUpdated = true;
	}
	return { ...state, componentState: { ...state.componentState, newGroup } };
};

export const showDeleteInfo = (state = INITIAL_STATE, { groupIds }) => {
	const groupsMap = { ...state.groupsMap };
	const newGroup = { ...state.componentState.newGroup };
	if (newGroup) {
		newGroup.willBeRemoved = true;
	}

	groupIds.forEach((groupId) => {
		groupsMap[groupId].willBeRemoved = true;
	});

	return { ...state, groupsMap, componentState: { ...state.componentState, newGroup } };
};

const resetComponentState = (state = INITIAL_STATE) => {
	return { ...state, componentState: INITIAL_STATE.componentState };
};

export const setOverrideAllSuccess = (state = INITIAL_STATE) => {
	let groupIds = [];
	groupIds = Object.keys(state.groupsMap);

	const componentState = { ...state.componentState, allOverridden: true };
	return setColorOverrides({...state, componentState}, { groupIds });
};

const clearColorOverridesSuccess = (state = INITIAL_STATE) => {
	const componentState = { ...state.componentState, allOverridden: false };
	return { ...state, colorOverrides: [], componentState};
};

export const reducer = createReducer(INITIAL_STATE, {
	[GroupsTypes.FETCH_GROUPS_SUCCESS]: fetchGroupsSuccess,
	[GroupsTypes.TOGGLE_PENDING_STATE]: togglePendingState,
	[GroupsTypes.TOGGLE_DETAILS_PENDING_STATE]: toggleDetailsPendingState,
	[GroupsTypes.SET_COMPONENT_STATE]: setComponentState,
	[GroupsTypes.ADD_TO_HIGHLIGHTED]: addToHighlighted,
	[GroupsTypes.REMOVE_FROM_HIGHLIGHTED]: removeFromHighlighted,
	[GroupsTypes.ADD_COLOR_OVERRIDE]: addColorOverride,
	[GroupsTypes.REMOVE_COLOR_OVERRIDE]: removeColorOverride,
	[GroupsTypes.SET_COLOR_OVERRIDES]: setColorOverrides,
	[GroupsTypes.UPDATE_GROUP_SUCCESS]: updateGroupSuccess,
	[GroupsTypes.DELETE_GROUPS_SUCCESS]: deleteGroupsSuccess,
	[GroupsTypes.SET_CRITERIA_FIELD_STATE]: setCriteriaFieldState,
	[GroupsTypes.SHOW_UPDATE_INFO]: showUpdateInfo,
	[GroupsTypes.RESET_COMPONENT_STATE]: resetComponentState,
	[GroupsTypes.CLEAR_COLOR_OVERRIDES_SUCCESS]: clearColorOverridesSuccess,
	[GroupsTypes.SET_OVERRIDE_ALL_SUCCESS]: setOverrideAllSuccess
});
