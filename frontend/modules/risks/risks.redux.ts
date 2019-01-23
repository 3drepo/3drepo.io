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
import { keyBy, cloneDeep, values } from 'lodash';

export const { Types: RisksTypes, Creators: RisksActions } = createActions({
	fetchRisks: ['teamspace', 'modelId', 'revision'],
	fetchRisksSuccess: ['risks'],
	setComponentState: ['componentState'],
	saveRisk: ['teamspace', 'model', 'riskData'],
	updateRisk: ['teamspace', 'modelId', 'riskData'],
	saveRiskSuccess: ['risk'],
	setNewRisk: [],
	renderPins: ['filteredRisks'],
	printRisks: ['teamspace', 'modelId', 'risksIds'],
	downloadRisks: ['teamspace', 'modelId'],
	showDetails: ['risk', 'filteredRisks', 'revision'],
	closeDetails: [],
	setActiveRisk: ['risk', 'filteredRisks', 'revision'],
	showNewPin: ['risk', 'pinData'],
	togglePendingState: ['isPending'],
	toggleShowPins: ['showPins', 'filteredRisks'],
	subscribeOnRiskChanges: ['teamspace', 'modelId'],
	unsubscribeOnRiskChanges: ['teamspace', 'modelId'],
	focusOnRisk: ['risk', 'filteredRisks', 'revision']
}, { prefix: 'RISKS_' });

export const INITIAL_STATE = {
	risksMap: {},
	isPending: true,
	componentState: {
		showPins: true,
		activeRisk: null,
		showDetails: false,
		expandDetails: true,
		newRisk: {},
		newComment: {},
		selectedFilters: [],
		associatedActivities: []
	}
};

export const togglePendingState = (state = INITIAL_STATE, { isPending }) => ({ ...state, isPending });

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

export const reducer = createReducer(INITIAL_STATE, {
	[RisksTypes.FETCH_RISKS_SUCCESS]: fetchRisksSuccess,
	[RisksTypes.SET_COMPONENT_STATE]: setComponentState,
	[RisksTypes.SAVE_RISK_SUCCESS]: saveRiskSuccess,
	[RisksTypes.TOGGLE_PENDING_STATE]: togglePendingState
});
