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
import { keyBy, cloneDeep } from 'lodash';

export const { Types: IssuesTypes, Creators: IssuesActions } = createActions({
	fetchIssues: ['teamspace', 'modelId', 'revision'],
	fetchIssuesSuccess: ['issues'],
	fetchIssue: ['teamspace', 'modelId', 'issueId'],
	fetchIssueSuccess: ['issue'],
	fetchIssueFailure: [],
	setComponentState: ['componentState'],
	saveIssue: ['teamspace', 'model', 'issueData', 'revision'],
	updateIssue: ['teamspace', 'modelId', 'issueData'],
	postComment: ['teamspace', 'modelId', 'issueData'],
	removeComment: ['teamspace', 'modelId', 'issueData'],
	saveIssueSuccess: ['issue'],
	setNewIssue: [],
	renderPins: [],
	printIssues: ['teamspace', 'modelId'],
	downloadIssues: ['teamspace', 'modelId'],
	showDetails: ['teamspace', 'model', 'revision', 'issue'],
	closeDetails: ['teamspace', 'model', 'revision'],
	setActiveIssue: ['issue', 'revision'],
	showNewPin: ['issue', 'pinData'],
	togglePendingState: ['isPending'],
	toggleDetailsPendingState: ['isPending'],
	subscribeOnIssueChanges: ['teamspace', 'modelId'],
	unsubscribeOnIssueChanges: ['teamspace', 'modelId'],
	focusOnIssue: ['issue', 'revision'],
	toggleIsImportingBcf: ['isImporting'],
	toggleSubmodelsIssues: ['showSubmodelIssues'],
	importBcf: ['teamspace', 'modelId', 'file', 'revision'],
	exportBcf: ['teamspace', 'modelId'],
	subscribeOnIssueCommentsChanges: ['teamspace', 'modelId', 'issueId'],
	unsubscribeOnIssueCommentsChanges: ['teamspace', 'modelId', 'issueId'],
	createCommentSuccess: ['comment'],
	deleteCommentSuccess: ['commentGuid'],
	updateCommentSuccess: ['comment'],
	toggleSortOrder: ['sortOrder'],
	updateNewIssue: ['newIssue'],
	setFilters: ['filters'],
	showCloseInfo: ['issueId'],
	resetComponentState: []
}, { prefix: 'ISSUES_' });

export const INITIAL_STATE = {
	issuesMap: {},
	isPending: true,
	componentState: {
		activeIssue: null,
		showDetails: false,
		expandDetails: true,
		newIssue: {},
		newComment: {},
		selectedFilters: [],
		filteredRisks: [],
		showPins: true,
		logs: [],
		fetchingDetailsIsPending: false,
		isImportingBCF: false,
		showSubmodelIssues: false,
		sortOrder: 'desc',
		failedToLoad: false
	}
};

export const togglePendingState = (state = INITIAL_STATE, { isPending }) => ({ ...state, isPending });

export const toggleDetailsPendingState = (state = INITIAL_STATE, { isPending }) => {
	return setComponentState(state, { componentState: { fetchingDetailsIsPending: isPending } });
};

export const toggleIsImportingBcf = (state = INITIAL_STATE, { isImporting }) => {
	return setComponentState(state, { componentState: { isImportingBCF: isImporting }});
};

export const fetchIssuesSuccess = (state = INITIAL_STATE, { issues = [] }) => {
	const issuesMap = keyBy(issues, '_id');
	return {
		...state, issuesMap, componentState: { ...cloneDeep(INITIAL_STATE.componentState) }
	};
};

export const fetchIssueSuccess = (state = INITIAL_STATE, { issue }) => {
	const issuesMap = cloneDeep(state.issuesMap);
	issuesMap[issue._id].comments = issue.comments;
	return {...state, issuesMap, componentState: { ...state.componentState, logs: issue.comments, failedToLoad: false }};
};

export const fetchIssueFailure = (state = INITIAL_STATE) => {
	return {...state, componentState: { ...state.componentState, logs: [], failedToLoad: true }};
};

export const saveIssueSuccess = (state = INITIAL_STATE, { issue }) => {
	const issuesMap = cloneDeep(state.issuesMap);
	issuesMap[issue._id] = issue;

	return {
		...state,
		issuesMap,
		componentState: { ...state.componentState, newIssue: {} }
	};
};

const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: { ...state.componentState, ...componentState } };
};

export const createCommentSuccess = (state = INITIAL_STATE, { comment }) => {
	const clonedLogs = cloneDeep(state.componentState.logs);
	const updatedLogs = clonedLogs.map((log) => {
		log.sealed = true;
		return log;
	});
	const logs = [comment, ...updatedLogs];
	return {...state, componentState: { ...state.componentState, logs }};
};

export const updateCommentSuccess = (state = INITIAL_STATE, { comment }) => {
	const logs = cloneDeep(state.componentState.logs);
	const commentIndex = state.componentState.logs.findIndex((log) => log.guid === comment.guid);
	logs[commentIndex] = comment;
	return {...state, componentState: { ...state.componentState, logs }};
};

export const deleteCommentSuccess = (state = INITIAL_STATE, { commentGuid }) => {
	const logs = cloneDeep(state.componentState.logs);
	const updatedLogs = logs.filter((log) => log.guid !== commentGuid );
	return {...state, componentState: { ...state.componentState, logs: updatedLogs }};
};

export const toggleSortOrder = (state = INITIAL_STATE) => {
	return {...state, componentState: {
		...state.componentState,
		sortOrder: state.componentState.sortOrder === 'asc' ? 'desc' : 'asc'
	}};
};

const showCloseInfo = (state = INITIAL_STATE, { issueId }) => {
	const issuesMap = cloneDeep(state.issuesMap);
	issuesMap[issueId].willBeClosed = true;

	return { ...state, issuesMap };
};

const resetComponentState = (state = INITIAL_STATE) => {
	return { ...state, componentState: INITIAL_STATE.componentState };
};

export const reducer = createReducer(INITIAL_STATE, {
	[IssuesTypes.FETCH_ISSUES_SUCCESS]: fetchIssuesSuccess,
	[IssuesTypes.FETCH_ISSUE_SUCCESS]: fetchIssueSuccess,
	[IssuesTypes.FETCH_ISSUE_FAILURE]: fetchIssueFailure,
	[IssuesTypes.SET_COMPONENT_STATE]: setComponentState,
	[IssuesTypes.SAVE_ISSUE_SUCCESS]: saveIssueSuccess,
	[IssuesTypes.TOGGLE_PENDING_STATE]: togglePendingState,
	[IssuesTypes.TOGGLE_DETAILS_PENDING_STATE]: toggleDetailsPendingState,
	[IssuesTypes.TOGGLE_IS_IMPORTING_BCF]: toggleIsImportingBcf,
	[IssuesTypes.CREATE_COMMENT_SUCCESS]: createCommentSuccess,
	[IssuesTypes.UPDATE_COMMENT_SUCCESS]: updateCommentSuccess,
	[IssuesTypes.DELETE_COMMENT_SUCCESS]: deleteCommentSuccess,
	[IssuesTypes.TOGGLE_SORT_ORDER]: toggleSortOrder,
	[IssuesTypes.SHOW_CLOSE_INFO]: showCloseInfo,
	[IssuesTypes.RESET_COMPONENT_STATE]: resetComponentState
});
