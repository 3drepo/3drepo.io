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
import { BOARD_TYPES, ISSUE_FILTER_PROPS } from './board.constants';

export const { Types: BoardTypes, Creators: BoardActions } = createActions({
	fetchData: ['teamspace', 'project', 'modelId'],
	fetchCardData: ['teamspace', 'modelId', 'cardId'],
	resetCardData: [],
	openCardDialog: ['cardId', 'onNavigationChange', 'disableReset'],
	setIsPending: ['isPending'],
	setFilterProp: ['filterProp'],
	fetchDataSuccess: ['teamspace'],
	toggleSearchEnabled: [],
	setFilters: ['filters'],
	printItems: ['teamspace', 'modelId'],
	downloadItems: ['teamspace', 'modelId'],
	toggleClosedIssues: [],
	toggleSortOrder: [],
	setSortBy: ['field'],
}, { prefix: 'BOARD/' });

export const INITIAL_STATE = {
	isPending: true,
	filterProp: ISSUE_FILTER_PROPS.status.value,
	lanes: [],
	teamspace: null,
	searchEnabled: false,
	showClosedIssues: false,
};

const setIsPending = (state = INITIAL_STATE, { isPending }) => {
	return { ...state, isPending };
};

const setFilterProp = (state = INITIAL_STATE, { filterProp }) => {
	return { ...state, filterProp };
};

const fetchDataSuccess = (state = INITIAL_STATE, { teamspace }) => {
	return { ...state, teamspace };
};

const toggleSearchEnabled = (state = INITIAL_STATE) => {
	return { ...state, searchEnabled: !state.searchEnabled };
};

const toggleClosedIssues = (state = INITIAL_STATE) => {
	return { ...state, showClosedIssues: !state.showClosedIssues };
};

export const reducer = createReducer({...INITIAL_STATE}, {
	[BoardTypes.SET_IS_PENDING]: setIsPending,
	[BoardTypes.SET_FILTER_PROP]: setFilterProp,
	[BoardTypes.FETCH_DATA_SUCCESS]: fetchDataSuccess,
	[BoardTypes.TOGGLE_SEARCH_ENABLED]: toggleSearchEnabled,
	[BoardTypes.TOGGLE_CLOSED_ISSUES]: toggleClosedIssues
});
