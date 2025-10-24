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

import { DEFAULT_ISSUES_FILTERS } from '@/v4/constants/issues';
import { cloneDeep, get, isEmpty, keyBy } from 'lodash';
import { createActions, createReducer } from 'reduxsauce';

export const { Types: IssuesTypes, Creators: IssuesActions } = createActions({
	fetchIssues: ['teamspace', 'modelId', 'revision'],
	fetchIssuesSuccess: ['issues'],
	fetchIssue: ['teamspace', 'modelId', 'issueId'],
	fetchIssueSuccess: ['issue'],
	fetchIssueFailure: [],
	setComponentState: ['componentState'],
	saveIssue: ['teamspace', 'model', 'issueData', 'revision', 'finishSubmitting', 'ignoreViewer'],
	updateActiveIssue: ['issueData'],
	updateBoardIssue: ['teamspace', 'modelId', 'issueData'],
	cloneIssue: ['dialogId'],
	postComment: ['teamspace', 'modelId', 'issueData', 'ignoreViewer', 'finishSubmitting'],
	removeComment: ['teamspace', 'modelId', 'issueData'],
	saveIssueSuccess: ['issue', 'resetComponentState'],
	setNewIssue: [],
	printIssues: ['teamspace', 'modelId'],
	downloadIssues: ['teamspace', 'modelId'],
	showDetails: ['revision', 'issueId'],
	closeDetails: [],
	setActiveIssue: ['issue', 'revision', 'ignoreViewer'],
	togglePendingState: ['isPending'],
	toggleDetailsPendingState: ['isPending'],
	togglePostCommentPendingState: ['isPending'],
	subscribeOnIssueChanges: ['teamspace', 'modelId'],
	unsubscribeOnIssueChanges: ['teamspace', 'modelId'],
	toggleIsImportingBcf: ['isImporting'],
	toggleSubmodelsIssues: ['showSubmodelIssues'],
	importBcf: ['teamspace', 'modelId', 'file', 'revision'],
	exportBcf: ['teamspace', 'modelId'],
	subscribeOnIssueCommentsChanges: ['teamspace', 'modelId', 'issueId'],
	unsubscribeOnIssueCommentsChanges: ['teamspace', 'modelId', 'issueId'],
	createCommentSuccess: ['comment', 'issueId'],
	createCommentsSuccess: ['comments', 'issueId'],
	deleteCommentSuccess: ['commentGuid', 'issueId'],
	updateCommentSuccess: ['comment', 'issueId'],
	toggleSortOrder: [],
	setSortBy: ['field'],
	updateNewIssue: ['newIssue'],
	setFilters: ['filters'],
	showCloseInfo: ['issueId'],
	hideCloseInfo: ['issueId'],
	removeResource: ['resource'],
	removeResourceSuccess: ['resource', 'issueId'],
	attachFileResources: ['files'],
	attachLinkResources: ['links'],
	attachResourcesSuccess: ['resources', 'issueId'],
	updateResourcesSuccess: ['resourcesIds', 'updates', 'issueId'],
	reset: [],
	goToIssue: ['issue'],
	setNewComment: ['newComment'],
	saveNewScreenshot: ['teamspace', 'model', 'isNewIssue'],
	updateSelectedIssuePin: ['position'],
	toggleShowPins: ['showPins'],
	updateActiveIssueViewpoint: ['screenshot'],
	setMeasureMode: ['measureMode'],
	setMeasureModeSuccess: ['measureMode'],
	addMeasurement: ['measurement'],
	removeMeasurement: ['uuid'],
	setMeasurementColor: ['uuid', 'color'],
	setMeasurementName: ['uuid', 'name'],
}, { prefix: 'ISSUES/' });

export const INITIAL_STATE = {
	issuesMap: {},
	isPending: true,
	componentState: {
		activeIssue: null,
		showDetails: false,
		expandDetails: true,
		newIssue: {},
		newComment: {},
		selectedFilters: DEFAULT_ISSUES_FILTERS,
		filteredRisks: [],
		showPins: true,
		fetchingDetailsIsPending: false,
		postCommentIsPending: false,
		isImportingBCF: false,
		showSubmodelIssues: false,
		sortOrder: 'desc',
		sortBy: 'created',
		failedToLoad: false,
		savedPin: null,
		measureMode: '',
		searchEnabled: true,
	},
};

const updateIssueProps = (issuesMap, issueId, props = {}) => {
	return {
		...issuesMap,
		[issueId]: {
			...issuesMap[issueId],
			...props
		}
	};
};

export const togglePendingState = (state = INITIAL_STATE, { isPending }) => ({ ...state, isPending });

export const toggleDetailsPendingState = (state = INITIAL_STATE, { isPending }) => {
	return setComponentState(state, { componentState: { fetchingDetailsIsPending: isPending } });
};

export const togglePostCommentPendingState = (state = INITIAL_STATE, { isPending }) => {
	return setComponentState(state, { componentState: { postCommentIsPending: isPending } });
};

export const toggleIsImportingBcf = (state = INITIAL_STATE, { isImporting }) => {
	return setComponentState(state, { componentState: { isImportingBCF: isImporting }});
};

export const fetchIssuesSuccess = (state = INITIAL_STATE, { issues = [] }) => {
	const issuesMap = keyBy(issues, '_id');
	return {
		...state, issuesMap, componentState: { ...INITIAL_STATE.componentState }
	};
};

export const fetchIssueSuccess = (state = INITIAL_STATE, { issue: {_id, comments, resources, shapes} }) => {
	const issuesMap = updateIssueProps(state.issuesMap, _id, { comments, resources, shapes });

	return { ...state, issuesMap, componentState: { ...state.componentState, failedToLoad: false } };
};

export const fetchIssueFailure = (state = INITIAL_STATE) => {
	return { ...state, componentState: { ...state.componentState, failedToLoad: true } };
};

export const saveIssueSuccess = (state = INITIAL_STATE, { issue, resetComponentState = true }) => {
	const issuesMap = updateIssueProps(state.issuesMap, issue._id, issue);

	const newComponentState = { ...state.componentState };

	if (resetComponentState) {
		newComponentState.newIssue = {};
	}

	return {
		...state,
		issuesMap,
		componentState: newComponentState
	};
};

export const updateSelectedIssuePin =  (state = INITIAL_STATE, { position }) => {
	if (state.componentState.activeIssue) {
		const issue = { _id: state.componentState.activeIssue, position };
		const issuesMap = updateIssueProps(state.issuesMap, issue._id, issue);

		return {
			...state,
			issuesMap,
			componentState: { ...state.componentState, newIssue: {} }
		};
	}

	if (!isEmpty(state.componentState.newIssue)) {
		const componentState = state.componentState;

		return {...state,
			componentState: { ...componentState , newIssue: { ...componentState.newIssue, position } }
		};
	}

	return state;
};

const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: { ...state.componentState, ...componentState } };
};

export const createCommentsSuccess = (state = INITIAL_STATE, { comments, issueId }) => {
	comments = comments.concat(state.issuesMap[issueId].comments);
	comments = comments.map((log, i) => ({ ...log, sealed: (i !== 0) ? true : log.sealed}));

	const issuesMap = updateIssueProps(state.issuesMap, issueId, { comments });
	return { ...state, issuesMap };
};

export const createCommentSuccess = (state = INITIAL_STATE, { comment, issueId }) => {
	const alreadyInComments = state.issuesMap[issueId].comments.find(({ guid }) => guid === comment.guid);

	if (!alreadyInComments) {
		return createCommentsSuccess(state, {comments: [comment], issueId } );
	}

	return { ...state };
};

export const updateCommentSuccess = (state = INITIAL_STATE, { comment, issueId }) => {
	const issuesMap = cloneDeep(state.issuesMap);
	const commentIndex = issuesMap[issueId].comments.findIndex((log) => log.guid === comment.guid);
	issuesMap[issueId].comments[commentIndex] = comment;

	return { ...state, issuesMap };
};

export const deleteCommentSuccess = (state = INITIAL_STATE, { commentGuid, issueId }) => {
	const comments = state.issuesMap[issueId].comments.filter((log) => log.guid !== commentGuid);
	const issuesMap = updateIssueProps(state.issuesMap, issueId, { comments });

	return { ...state, issuesMap };
};

export const toggleSortOrder = (state = INITIAL_STATE) => {
	return {
		...state, componentState: {
			...state.componentState,
			sortOrder: state.componentState.sortOrder === 'asc' ? 'desc' : 'asc'
		}
	};
};

export const setSortBy = (state = INITIAL_STATE, {field}) => {
	return {
		...state, componentState: {
			...state.componentState,
			sortBy: field
		}
	};
};

const showCloseInfo = (state = INITIAL_STATE, { issueId }) => {
	const issuesMap = updateIssueProps(state.issuesMap, issueId, { willBeClosed: true });
	return { ...state, issuesMap };
};

const hideCloseInfo = (state = INITIAL_STATE, { issueId }) => {
	const issuesMap = updateIssueProps(state.issuesMap, issueId, { willBeClosed: false });
	return { ...state, issuesMap };
};

const reset = () => cloneDeep(INITIAL_STATE);

const removeResourceSuccess =  (state = INITIAL_STATE, { resource, issueId }) => {
	const resources = get(state.issuesMap, [issueId, 'resources']) ?? [];
	const updatedResources = resources.filter((r) => r._id !== resource._id);
	const issuesMap = updateIssueProps(state.issuesMap, issueId, { resources: updatedResources });

	return { ...state, issuesMap };
};

const attachResourcesSuccess = (state = INITIAL_STATE, { resources, issueId }) => {
	const issue: any = get(state.issuesMap, issueId);
	if (!issue) {
		return state;
	}

	resources = resources.concat(issue.resources || []);
	const issuesMap = updateIssueProps(state.issuesMap, issueId, { resources });
	return { ...state, issuesMap};
};

const updateResourcesSuccess = (state = INITIAL_STATE, { resourcesIds, updates, issueId }) => {
	const resources = get(state.issuesMap, [issueId, 'resources']) ?? [];
	const updatedResources = resources.map((resource) => {
		const updateIndex = resourcesIds.indexOf(resource._id);

		if (updateIndex >= 0) {
			return {...resource, ...updates[updateIndex]};
		} else {
			return resource;
		}
	});

	const issuesMap = updateIssueProps(state.issuesMap, issueId, { resources: updatedResources });
	return { ...state, issuesMap};
};

const toggleShowPins = (state = INITIAL_STATE, { showPins }) => {
	return setComponentState(state, { componentState: { showPins } });
};

const setMeasureModeSuccess = (state = INITIAL_STATE, { measureMode }) => {
	return setComponentState(state, { componentState: { measureMode } });
};

export const reducer = createReducer(INITIAL_STATE, {
	[IssuesTypes.FETCH_ISSUES_SUCCESS]: fetchIssuesSuccess,
	[IssuesTypes.FETCH_ISSUE_SUCCESS]: fetchIssueSuccess,
	[IssuesTypes.FETCH_ISSUE_FAILURE]: fetchIssueFailure,
	[IssuesTypes.SET_COMPONENT_STATE]: setComponentState,
	[IssuesTypes.SAVE_ISSUE_SUCCESS]: saveIssueSuccess,
	[IssuesTypes.TOGGLE_PENDING_STATE]: togglePendingState,
	[IssuesTypes.TOGGLE_DETAILS_PENDING_STATE]: toggleDetailsPendingState,
	[IssuesTypes.TOGGLE_POST_COMMENT_PENDING_STATE]: togglePostCommentPendingState,
	[IssuesTypes.TOGGLE_IS_IMPORTING_BCF]: toggleIsImportingBcf,
	[IssuesTypes.CREATE_COMMENT_SUCCESS]: createCommentSuccess,
	[IssuesTypes.CREATE_COMMENTS_SUCCESS]: createCommentsSuccess,
	[IssuesTypes.UPDATE_COMMENT_SUCCESS]: updateCommentSuccess,
	[IssuesTypes.DELETE_COMMENT_SUCCESS]: deleteCommentSuccess,
	[IssuesTypes.TOGGLE_SORT_ORDER]: toggleSortOrder,
	[IssuesTypes.SET_SORT_BY]: setSortBy,
	[IssuesTypes.SHOW_CLOSE_INFO]: showCloseInfo,
	[IssuesTypes.HIDE_CLOSE_INFO]: hideCloseInfo,
	[IssuesTypes.RESET]: reset,
	[IssuesTypes.REMOVE_RESOURCE_SUCCESS]: removeResourceSuccess,
	[IssuesTypes.ATTACH_RESOURCES_SUCCESS]: attachResourcesSuccess,
	[IssuesTypes.UPDATE_RESOURCES_SUCCESS]: updateResourcesSuccess,
	[IssuesTypes.UPDATE_SELECTED_ISSUE_PIN]: updateSelectedIssuePin,
	[IssuesTypes.TOGGLE_SHOW_PINS]: toggleShowPins,
	[IssuesTypes.SET_MEASURE_MODE_SUCCESS]: setMeasureModeSuccess
});
