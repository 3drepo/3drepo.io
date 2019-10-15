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
	setIsPending: ['isPending']
}, { prefix: 'BOARD/' });

export const INITIAL_STATE = {
	isPending: true,
	boardType: BOARD_TYPES.ISSUES,
	filterProp: FILTER_PROPS.STATUS,
	lanes: []
};

const setIsPending = (state = INITIAL_STATE, { isPending }) => {
	return { ...state, isPending };
};

export const reducer = createReducer({...INITIAL_STATE}, {
	[BoardTypes.SET_IS_PENDING]: setIsPending
});
