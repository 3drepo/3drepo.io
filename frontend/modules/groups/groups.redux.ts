/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import { keyBy, omit } from 'lodash';

export const { Types: GroupsTypes, Creators: GroupsActions } = createActions({
	fetchGroups: ['teamspace', 'modelId', 'revision'],
	fetchGroupsSuccess: ['groups'],
	togglePendingState: ['isPending'],
	setComponentState: ['componentState'],
	setActiveGroup: ['group', 'revision'],
	resetActiveGroup: ['group'],
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
	addColorOverride: ['groups', 'renderOnly'],
	removeColorOverride: ['groups', 'renderOnly'],
	toggleColorOverride: ['group'],
	addToOverrided: ['groupsMap'],
	removeFromOverrided: ['groupsIds'],
	toggleColorOverrideAll: ['overrideAll'],
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
	getFieldNames: ['teamspace', 'modelId'],
	getFieldNamesSuccess: ['fieldNames'],
	setCriteriaFieldState: ['criteriaFieldState'],
	resetToSavedSelection: ['groupId'],
	resetComponentState: []
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
	colorOverrides: any;
	totalMeshes: number;
	criteriaFieldState: ICriteriaFieldState;
}

export interface IGroupState {
	groupsMap: any;
	isPending: boolean;
	componentState: IGroupComponentState;
	fieldNames: any[];
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
		colorOverrides: {},
		totalMeshes: 0,
		criteriaFieldState: INITIAL_CRITERIA_FIELD_STATE
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

export const addToOverrided = (state = INITIAL_STATE, { groupsMap }) => {
	const colorOverrides = {
		...state.componentState.colorOverrides,
		...groupsMap
	};
	return { ...state, componentState: { ...state.componentState, colorOverrides } };
};

export const removeFromOverrided = (state = INITIAL_STATE, { groupsIds }) => {
	const colorOverrides = omit({ ...state.componentState.colorOverrides }, groupsIds);
	return { ...state, componentState: { ...state.componentState, colorOverrides } };
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

export const getFieldNamesSuccess = (state = INITIAL_STATE, { fieldNames }) => {
	return { ...state, fieldNames };
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

export const reducer = createReducer(INITIAL_STATE, {
	[GroupsTypes.FETCH_GROUPS_SUCCESS]: fetchGroupsSuccess,
	[GroupsTypes.TOGGLE_PENDING_STATE]: togglePendingState,
	[GroupsTypes.SET_COMPONENT_STATE]: setComponentState,
	[GroupsTypes.ADD_TO_HIGHLIGHTED]: addToHighlighted,
	[GroupsTypes.REMOVE_FROM_HIGHLIGHTED]: removeFromHighlighted,
	[GroupsTypes.ADD_TO_OVERRIDED]: addToOverrided,
	[GroupsTypes.REMOVE_FROM_OVERRIDED]: removeFromOverrided,
	[GroupsTypes.UPDATE_GROUP_SUCCESS]: updateGroupSuccess,
	[GroupsTypes.DELETE_GROUPS_SUCCESS]: deleteGroupsSuccess,
	[GroupsTypes.GET_FIELD_NAMES_SUCCESS]: getFieldNamesSuccess,
	[GroupsTypes.SET_CRITERIA_FIELD_STATE]: setCriteriaFieldState,
	[GroupsTypes.SHOW_UPDATE_INFO]: showUpdateInfo,
	[GroupsTypes.RESET_COMPONENT_STATE]: resetComponentState
});
