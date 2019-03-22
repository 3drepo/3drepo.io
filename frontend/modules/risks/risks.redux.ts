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
import { keyBy, cloneDeep } from 'lodash';

export const { Types: RisksTypes, Creators: RisksActions } = createActions({
	fetchRisks: ['teamspace', 'modelId', 'revision'],
	fetchRisksSuccess: ['risks'],
	fetchRisk: ['teamspace', 'modelId', 'riskId'],
	fetchRiskSuccess: ['risk'],
	fetchRiskFailure: [],
	setComponentState: ['componentState'],
	saveRisk: ['teamspace', 'model', 'riskData', 'filteredRisks'],
	updateRisk: ['teamspace', 'modelId', 'riskData'],
	postComment: ['teamspace', 'modelId', 'riskData'],
	removeComment: ['teamspace', 'modelId', 'riskData'],
	saveRiskSuccess: ['risk'],
	setNewRisk: [],
	renderPins: ['filteredRisks'],
	printRisks: ['teamspace', 'modelId', 'risksIds'],
	downloadRisks: ['teamspace', 'modelId', 'risksIds'],
	showDetails: ['risk', 'filteredRisks', 'revision'],
	closeDetails: [],
	setActiveRisk: ['risk', 'filteredRisks', 'revision'],
	showNewPin: ['risk', 'pinData'],
	togglePendingState: ['isPending'],
	toggleDetailsPendingState: ['isPending'],
	toggleShowPins: ['showPins', 'filteredRisks'],
	subscribeOnRiskChanges: ['teamspace', 'modelId'],
	unsubscribeOnRiskChanges: ['teamspace', 'modelId'],
	focusOnRisk: ['risk', 'filteredRisks', 'revision'],
	subscribeOnRiskCommentsChanges: ['teamspace', 'modelId', 'riskId'],
	unsubscribeOnRiskCommentsChanges: ['teamspace', 'modelId', 'riskId'],
	createCommentSuccess: ['comment'],
	deleteCommentSuccess: ['commentGuid'],
	updateCommentSuccess: ['comment'],
	updateLogs: ['logs'],
	updateNewRisk: ['newRisk'],
	onFiltersChange: ['selectedFilters']
}, { prefix: 'RISKS/' });

export const INITIAL_STATE = {
	risksMap: {},
	isPending: true,
	componentState: {
		activeRisk: null,
		showDetails: false,
		expandDetails: true,
		newRisk: {},
		newComment: {},
		selectedFilters: [],
		showPins: true,
		logs: [],
		fetchingDetailsIsPending: false,
		associatedActivities: [],
		failedToLoad: false
	}
};

export const togglePendingState = (state = INITIAL_STATE, { isPending }) => ({ ...state, isPending });

export const toggleDetailsPendingState = (state = INITIAL_STATE, { isPending }) => {
	return setComponentState(state, { componentState: { fetchingDetailsIsPending: isPending } });
};

export const fetchRisksSuccess = (state = INITIAL_STATE, { risks = [] }) => {
	const risksMap = keyBy(risks, '_id');

	const associatedActivities = risks.reduce((activities, risk) => {
		if (risk.associated_activity && !activities.includes(risk.associated_activity)) {
			activities.push(risk.associated_activity);
		}
		return activities;
	}, []);

	return {
		...state, risksMap,
		componentState: { ...state.componentState, activeRisk: null, showDetails: false, associatedActivities }
	};
};

export const fetchRiskSuccess = (state = INITIAL_STATE, { risk }) => {
	const risksMap = cloneDeep(state.risksMap);
	risksMap[risk._id].comments = risk.comments;
	return {...state, risksMap, componentState: { ...state.componentState, logs: risk.comments, failedToLoad: false }};
};

export const fetchRiskFailure = (state = INITIAL_STATE) => {
	return {...state, componentState: { ...state.componentState, logs: [], failedToLoad: true }};
};

export const saveRiskSuccess = (state = INITIAL_STATE, { risk }) => {
	const risksMap = cloneDeep(state.risksMap);
	risksMap[risk._id] = risk;

	return {
		...state,
		risksMap,
		componentState: { ...state.componentState, newRisk: {}}
	};
};

export const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: { ...state.componentState, ...componentState } };
};

export const createCommentSuccess = (state = INITIAL_STATE, { comment }) => {
	const clonedLogs = cloneDeep(state.componentState.logs);
	const updatedLogs = clonedLogs.map((log) => {
		log.sealed = true;
		return log;
	});

	let logs;

	if (comment.action || comment.viewpoint) {
		logs = [comment, ...updatedLogs];
	} else {
		logs = updatedLogs;
	}

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

export const updateLogs = (state = INITIAL_STATE, { logs }) => {
	return {...state, componentState: { ...state.componentState, logs }};
};

export const reducer = createReducer(INITIAL_STATE, {
	[RisksTypes.FETCH_RISKS_SUCCESS]: fetchRisksSuccess,
	[RisksTypes.FETCH_RISK_SUCCESS]: fetchRiskSuccess,
	[RisksTypes.FETCH_RISK_FAILURE]: fetchRiskFailure,
	[RisksTypes.SET_COMPONENT_STATE]: setComponentState,
	[RisksTypes.SAVE_RISK_SUCCESS]: saveRiskSuccess,
	[RisksTypes.TOGGLE_PENDING_STATE]: togglePendingState,
	[RisksTypes.TOGGLE_DETAILS_PENDING_STATE]: toggleDetailsPendingState,
	[RisksTypes.CREATE_COMMENT_SUCCESS]: createCommentSuccess,
	[RisksTypes.UPDATE_COMMENT_SUCCESS]: updateCommentSuccess,
	[RisksTypes.DELETE_COMMENT_SUCCESS]: deleteCommentSuccess,
	[RisksTypes.UPDATE_LOGS]: updateLogs
});
