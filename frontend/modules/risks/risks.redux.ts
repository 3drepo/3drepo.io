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
	saveRisk: ['teamspace', 'model', 'riskData', 'revision'],
	updateRisk: ['teamspace', 'modelId', 'riskData'],
	postComment: ['teamspace', 'modelId', 'riskData'],
	removeComment: ['teamspace', 'modelId', 'riskData'],
	saveRiskSuccess: ['risk'],
	setNewRisk: [],
	renderPins: [],
	printRisks: ['teamspace', 'modelId'],
	downloadRisks: ['teamspace', 'modelId'],
	showDetails: ['teamspace', 'model', 'revision', 'risk'],
	closeDetails: ['teamspace', 'model', 'revision'],
	setActiveRisk: ['risk', 'revision'],
	showNewPin: ['risk', 'pinData'],
	togglePendingState: ['isPending'],
	toggleDetailsPendingState: ['isPending'],
	subscribeOnRiskChanges: ['teamspace', 'modelId'],
	unsubscribeOnRiskChanges: ['teamspace', 'modelId'],
	focusOnRisk: ['risk', 'revision'],
	toggleShowPins: ['showPins'],
	subscribeOnRiskCommentsChanges: ['teamspace', 'modelId', 'riskId'],
	unsubscribeOnRiskCommentsChanges: ['teamspace', 'modelId', 'riskId'],
	createCommentSuccess: ['comment', 'riskId'],
	deleteCommentSuccess: ['commentGuid', 'riskId'],
	updateCommentSuccess: ['comment', 'riskId'],
	updateNewRisk: ['newRisk'],
	setFilters: ['filters'],
	showCloseInfo: ['riskId'],
	resetComponentState: []
}, { prefix: 'RISKS/' });

export interface IRisksComponentState {
	showPins: boolean;
	activeRisk: any;
	showDetails: boolean;
	expandDetails: boolean;
	newRisk: any;
	newComment: any;
	selectedFilters: any[];
	associatedActivities: any[];
}

export interface IRisksState {
	risksMap: any;
	isPending: boolean;
	componentState: IRisksComponentState;
}

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
		filteredRisks: [],
		showPins: true,
		fetchingDetailsIsPending: false,
		associatedActivities: [],
		failedToLoad: false
	}
};

const updateRiskProps = (risksMap, riskId, props = {}) => {
	return {
		...risksMap,
		[riskId]: {
			...risksMap[riskId],
			...props
		}
	};
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
		...state, risksMap, associatedActivities, componentState: { ...INITIAL_STATE.componentState }
	};
};

export const fetchRiskSuccess = (state = INITIAL_STATE, { risk }) => {
	const risksMap = updateRiskProps(state.risksMap, risk._id, { comments: risk.comments });

	return { ...state, risksMap, componentState: { ...state.componentState, failedToLoad: false } };
};

export const fetchRiskFailure = (state = INITIAL_STATE) => {
	return { ...state, componentState: { ...state.componentState, failedToLoad: true } };
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

export const createCommentSuccess = (state = INITIAL_STATE, { comment, riskId }) => {
	let comments;

	if (comment.action || comment.viewpoint) {
		comments = [comment, ...state.issuesMap[issueId].comments.map((log) => ({ ...log, sealed: true, new: true }))];
	} else {
		comments = [...state.issuesMap[issueId].comments.map((log) => ({ ...log, sealed: true, new: true }))];
	}

	const risksMap = updateRiskProps(state.risksMap, riskId, { comments });

	return { ...state, risksMap };
};

export const updateCommentSuccess = (state = INITIAL_STATE, { comment, riskId }) => {
	const risksMap = cloneDeep(state.risksMap);
	const commentIndex = risksMap[riskId].comments.findIndex((log) => log.guid === comment.guid);
	risksMap[riskId].comments[commentIndex] = comment;

	return { ...state, risksMap };
};

export const deleteCommentSuccess = (state = INITIAL_STATE, { commentGuid, riskId }) => {
	const comments = state.risksMap[riskId].comments.filter((log) => log.guid !== commentGuid);
	const risksMap = updateRiskProps(state.risksMap, riskId, { comments });

	return { ...state, risksMap };
};

const showCloseInfo = (state = INITIAL_STATE, { riskId }) => {
	const risksMap = updateRiskProps(state.risksMap, riskId, { willBeClosed: true });
	return { ...state, risksMap };
};

export const resetComponentState = (state = INITIAL_STATE) => {
	return { ...state, componentState: INITIAL_STATE.componentState };
};

export const reducer = createReducer(INITIAL_STATE, {
	[RisksTypes.FETCH_RISKS_SUCCESS]: fetchRisksSuccess,
	[RisksTypes.FETCH_RISK_SUCCESS]: fetchRiskSuccess,
	[RisksTypes.FETCH_RISK_FAILURE]: fetchRiskFailure,
	[RisksTypes.SET_COMPONENT_STATE]: setComponentState,
	[RisksTypes.SAVE_RISK_SUCCESS]: saveRiskSuccess,
	[RisksTypes.TOGGLE_PENDING_STATE]: togglePendingState,
	[RisksTypes.RESET_COMPONENT_STATE]: resetComponentState,
	[RisksTypes.TOGGLE_DETAILS_PENDING_STATE]: toggleDetailsPendingState,
	[RisksTypes.CREATE_COMMENT_SUCCESS]: createCommentSuccess,
	[RisksTypes.UPDATE_COMMENT_SUCCESS]: updateCommentSuccess,
	[RisksTypes.DELETE_COMMENT_SUCCESS]: deleteCommentSuccess
});
