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

import { cloneDeep, keyBy } from 'lodash';
import { createActions, createReducer } from 'reduxsauce';

export const { Types: GroupsTypes, Creators: GroupsActions } = createActions({
	fetchGroups: ['teamspace', 'modelId', 'revision'],
	fetchGroupsSuccess: ['groups'],
	togglePendingState: ['isPending'],
	toggleDetailsPendingState: ['isPending'],
	setComponentState: ['componentState'],
	setActiveGroup: ['group'],
	resetActiveGroup: ['group'],
	showDetails: ['group'],
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
	clearColorOverridesSuccess: [],
	replaceColorOverrides: ['groupIds'],
	setColorOverrides: ['groupIds', 'on'],
	setOverrideAll: ['overrideAll'],
	setOverrideAllSuccess: [],
	setShowSmartGroups: ['enabled'],
	setShowStandardGroups: ['enabled'],
	setShowSmartGroupsSuccess: [],
	setShowStandardGroupsSuccess: [],
	clearShowSmartGroupsSuccess: [],
	clearShowStandardGroupsSuccess: [],
	deleteGroups: ['teamspace', 'modelId', 'groups'],
	showDeleteInfo: ['groupIds'],
	deleteGroupsSuccess: ['groupIds'],
	isolateGroups: ['groupIds'],
	downloadGroups: ['teamspace', 'modelId'],
	exportGroups: ['teamspace', 'modelId'],
	importGroups: ['teamspace', 'modelId', 'file'],
	createGroup: ['teamspace', 'modelId', 'revision', 'group'],
	updateGroup: ['teamspace', 'modelId', 'revision', 'groupId'],
	showUpdateInfo: [],
	updateGroupSuccess: ['group'],
	subscribeOnChanges: ['teamspace', 'modelId'],
	unsubscribeFromChanges: ['teamspace', 'modelId'],
	setCriteriaFieldState: ['criteriaFieldState'],
	setSelectedCriterionId: ['selectedCriterionId'],
	resetToSavedSelection: ['groupId'],
	resetComponentState: [],
	updateEditingGroup: ['properties'],
	updateGroupFromChatService: ['group'],
}, { prefix: 'GROUPS/' });

export interface ICriteriaFieldState {
	pastedCriteria: string;
	isPasteEnabled: boolean;
	selectedCriterionId: string;
	criterionForm: {
		field: {
			operator: string;
			values: string[] | number[];
		};
		operator: string;
		values: string[] | number[];
	};
}

export interface IGroupComponentState {
	activeGroup: any;
	showDetails: boolean;
	expandDetails: boolean;
	editingGroup: any;
	updatedGroup: any;
	selectedFilters: any[];
	highlightedGroups: Set<string>;
	criteriaFieldState: ICriteriaFieldState;
	allOverridden: boolean;
	showSmart: boolean;
	showStandard: boolean;
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
	selectedCriterionId: '',
	criterionForm: null
};

export const INITIAL_STATE: IGroupState = {
	groupsMap: {},
	isPending: true,
	componentState: {
		activeGroup: null,
		highlightedGroups: new Set(),
		showDetails: false,
		expandDetails: true,
		editingGroup: {},
		updatedGroup: {},
		selectedFilters: [],
		criteriaFieldState: INITIAL_CRITERIA_FIELD_STATE,
		allOverridden: false,
		showSmart: true,
		showStandard: true,
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
	const highlightedGroups = new Set(state.componentState.highlightedGroups);
	highlightedGroups.add(groupId);
	return { ...state, componentState: { ...state.componentState, highlightedGroups } };
};

export const removeFromHighlighted = (state = INITIAL_STATE, { groupId }) => {
	const highlightedGroups = new Set(state.componentState.highlightedGroups);
	highlightedGroups.delete(groupId);
	return { ...state, componentState: { ...state.componentState, highlightedGroups } };
};

export const addColorOverride = (state = INITIAL_STATE, { groupId }) => {
	return setColorOverrides(state, { groupIds: [groupId], on: true});
};

export const removeColorOverride = (state = INITIAL_STATE, { groupId }) => {
	const componentState = { ...state.componentState, allOverridden: false };
	return {...state, componentState, colorOverrides: state.colorOverrides.filter((id) => groupId !== id)};
};

export const setColorOverrides = (state = INITIAL_STATE, { groupIds, on }) => {
	const overridesLeft = state.colorOverrides.filter((groupId) => !groupIds.includes(groupId));
	const colorOverrides = on ? overridesLeft.concat(groupIds) : overridesLeft;
	return {...state, colorOverrides };
};

export const replaceColorOverrides = (state = INITIAL_STATE, { groupIds }) => {
	// This is done to keep the relative override order
	const overridesFound = state.colorOverrides.filter((groupId) => groupIds.includes(groupId));
	const newOverrides = groupIds.filter((groupId) =>  !state.colorOverrides.includes(groupId));

	return {...state, colorOverrides: newOverrides.concat(overridesFound)};
};

export const updateGroupSuccess = (state = INITIAL_STATE, { group }) => {
	const groupsMap = { ...state.groupsMap };
	let editingGroup = { ...state.componentState.editingGroup };

	groupsMap[group._id] = group;

	if (editingGroup && editingGroup._id === group._id) {
		editingGroup.willBeUpdated = false;
		editingGroup = cloneDeep(group);
	}

	if (state.componentState.allOverridden) {
		state = addColorOverride(state, { groupId: group._id});
	}

	return { ...state, groupsMap, componentState: { ...state.componentState, editingGroup } };
};

export const deleteGroupsSuccess = (state = INITIAL_STATE, { groupIds }) => {
	const groupsMap = { ...state.groupsMap };
	const editingGroup = { ...state.componentState.editingGroup };

	if (editingGroup) {
		editingGroup.willBeRemoved = false;
	}

	groupIds.forEach((groupId) => {
		if (groupsMap[groupId]) {
			groupsMap[groupId].willBeRemoved = false;
			delete groupsMap[groupId];
		}
	});

	return { ...state, groupsMap, componentState: { ...state.componentState, editingGroup } };
};

export const showUpdateInfo = (state = INITIAL_STATE, {}) => {
	const editingGroup = { ...state.componentState.editingGroup };

	if (editingGroup) {
		editingGroup.willBeUpdated = true;
	}
	return { ...state, componentState: { ...state.componentState, editingGroup } };
};

export const showDeleteInfo = (state = INITIAL_STATE, { groupIds }) => {
	const groupsMap = { ...state.groupsMap };
	const editingGroup = { ...state.componentState.editingGroup };
	if (editingGroup) {
		editingGroup.willBeRemoved = true;
	}

	groupIds.forEach((groupId) => {
		if (groupsMap[groupId]) {
			groupsMap[groupId].willBeRemoved = true;
		}
	});

	return { ...state, groupsMap, componentState: { ...state.componentState, editingGroup } };
};

const resetComponentState = () => cloneDeep(INITIAL_STATE);

export const setOverrideAllSuccess = (state = INITIAL_STATE) => {
	let groupIds = [];
	groupIds = Object.keys(state.groupsMap);

	const componentState = { ...state.componentState, allOverridden: true };
	return replaceColorOverrides({...state, componentState}, { groupIds });
};

const clearColorOverridesSuccess = (state = INITIAL_STATE) => {
	const componentState = { ...state.componentState, allOverridden: false };
	return { ...state, colorOverrides: [], componentState};
};

export const setShowSmartGroupsSuccess = (state = INITIAL_STATE) => {
	const componentState = { ...state.componentState, showSmart: true };
	return {...state, componentState};
};

export const setShowStandardGroupsSuccess = (state = INITIAL_STATE) => {
	const componentState = { ...state.componentState, showStandard: true };
	return {...state, componentState};
};

export const clearShowSmartGroupsSuccess = (state = INITIAL_STATE) => {
	const componentState = { ...state.componentState, showSmart: false };
	return {...state, componentState};
};

export const clearShowStandardGroupsSuccess = (state = INITIAL_STATE) => {
	const componentState = { ...state.componentState, showStandard: false };
	return {...state, componentState};
};


const updateEditingGroup = (state = INITIAL_STATE, {properties}) => {
	let { editingGroup } = state.componentState;
	editingGroup = {...editingGroup, ...properties};
	const componentState = { ...state.componentState, editingGroup };

	return { ...state, componentState};
};
export const reducer = createReducer(INITIAL_STATE, {
	[GroupsTypes.SET_COLOR_OVERRIDES]: setColorOverrides,
	[GroupsTypes.FETCH_GROUPS_SUCCESS]: fetchGroupsSuccess,
	[GroupsTypes.TOGGLE_PENDING_STATE]: togglePendingState,
	[GroupsTypes.TOGGLE_DETAILS_PENDING_STATE]: toggleDetailsPendingState,
	[GroupsTypes.SET_COMPONENT_STATE]: setComponentState,
	[GroupsTypes.ADD_TO_HIGHLIGHTED]: addToHighlighted,
	[GroupsTypes.REMOVE_FROM_HIGHLIGHTED]: removeFromHighlighted,
	[GroupsTypes.ADD_COLOR_OVERRIDE]: addColorOverride,
	[GroupsTypes.REMOVE_COLOR_OVERRIDE]: removeColorOverride,
	[GroupsTypes.REPLACE_COLOR_OVERRIDES]: replaceColorOverrides,
	[GroupsTypes.UPDATE_GROUP_SUCCESS]: updateGroupSuccess,
	[GroupsTypes.DELETE_GROUPS_SUCCESS]: deleteGroupsSuccess,
	[GroupsTypes.SET_CRITERIA_FIELD_STATE]: setCriteriaFieldState,
	[GroupsTypes.SHOW_UPDATE_INFO]: showUpdateInfo,
	[GroupsTypes.RESET_COMPONENT_STATE]: resetComponentState,
	[GroupsTypes.CLEAR_COLOR_OVERRIDES_SUCCESS]: clearColorOverridesSuccess,
	[GroupsTypes.CLEAR_SHOW_SMART_GROUPS_SUCCESS]: clearShowSmartGroupsSuccess,
	[GroupsTypes.CLEAR_SHOW_STANDARD_GROUPS_SUCCESS]: clearShowStandardGroupsSuccess,
	[GroupsTypes.CLEAR_COLOR_OVERRIDES_SUCCESS]: clearColorOverridesSuccess,
	[GroupsTypes.SET_OVERRIDE_ALL_SUCCESS]: setOverrideAllSuccess,
	[GroupsTypes.SET_SHOW_SMART_GROUPS_SUCCESS]: setShowSmartGroupsSuccess,
	[GroupsTypes.SET_SHOW_STANDARD_GROUPS_SUCCESS]: setShowStandardGroupsSuccess,
	[GroupsTypes.UPDATE_EDITING_GROUP]: updateEditingGroup,
});
