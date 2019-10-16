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
import { BOARD_TYPES, FILTER_PROPS } from './board.constants';

export const { Types: BoardTypes, Creators: BoardActions } = createActions({
	fetchData: ['boardType', 'teamspace', 'project', 'modelId'],
	fetchCardData: ['boardType', 'teamspace', 'modelId', 'cardId'],
	setIsPending: ['isPending'],
	setFilterProp: ['filterProp'],
	setBoardType: ['boardType'],
	fetchDataSuccess: ['teamspace']
}, { prefix: 'BOARD/' });

export const INITIAL_STATE = {
	isPending: true,
	boardType: BOARD_TYPES.ISSUES,
	filterProp: FILTER_PROPS.status.value,
	lanes: [],
	teamspace: null
};

const setIsPending = (state = INITIAL_STATE, { isPending }) => {
	return { ...state, isPending };
};

const setFilterProp = (state = INITIAL_STATE, { filterProp }) => {
	return { ...state, filterProp };
};

const setBoardType = (state = INITIAL_STATE, { boardType }) => {
	return { ...state, boardType };
};

const fetchDataSuccess = (state = INITIAL_STATE, { teamspace }) => {
	return { ...state, teamspace };
};

export const reducer = createReducer({...INITIAL_STATE}, {
	[BoardTypes.SET_IS_PENDING]: setIsPending,
	[BoardTypes.SET_FILTER_PROP]: setFilterProp,
	[BoardTypes.SET_BOARD_TYPE]: setBoardType,
	[BoardTypes.FETCH_DATA_SUCCESS]: fetchDataSuccess
});
