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

export const { Types: RisksTypes, Creators: RisksActions } = createActions({
	fetchRisks: ['teamspace', 'modelId', 'revision'],
	fetchRisksSuccess: ['risks'],
	setActiveRisk: ['riskId'],
	toggleDetails: ['showDetails']
}, { prefix: 'RISKS_' });

export const INITIAL_STATE = {
	risks: [],
	isPending: true,
	activeRisk: null,
	showDetails: false
};

export const fetchRisksSuccess = (state = INITIAL_STATE, { risks }) => {
	return {...state, risks, activeRisk: null, showDetails: false};
};

export const setActiveRisk = (state = INITIAL_STATE, { riskId }) => ({ ...state, activeRisk: riskId });

export const toggleDetails = (state = INITIAL_STATE, { showDetails }) => {
	return {...state, showDetails, activeRisk: null};
};

export const reducer = createReducer(INITIAL_STATE, {
	[RisksTypes.FETCH_RISKS_SUCCESS]: fetchRisksSuccess,
	[RisksTypes.SET_ACTIVE_RISK]: setActiveRisk,
	[RisksTypes.TOGGLE_DETAILS]: toggleDetails
});
