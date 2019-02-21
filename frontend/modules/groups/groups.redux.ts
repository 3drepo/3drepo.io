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

export const { Types: GroupsTypes, Creators: GroupsActions } = createActions({
	fetchGroups: ['teamspace', 'modelId', 'revision'],
	fetchGroupsSuccess: ['groups'],
	togglePendingState: ['isPending']
}, { prefix: 'GROUPS_' });

export interface IObjectObjectState {}

export const INITIAL_STATE: IObjectObjectState = {
	groupsMap: {},
	isPending: true,
};

export const togglePendingState = (state = INITIAL_STATE, { isPending }) => ({ ...state, isPending });

export const fetchGroupsSuccess = (state = INITIAL_STATE, { groups = [] }) => {
	const groupsMap = keyBy(groups, '_id');

	return { ...state, groupsMap };
};

export const reducer = createReducer(INITIAL_STATE, {
	[GroupsTypes.FETCH_GROUPS_SUCCESS]: fetchGroupsSuccess,
	[GroupsTypes.TOGGLE_PENDING_STATE]: togglePendingState
});
