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
import { omit } from 'lodash';

export const { Types: StarredMetaTypes, Creators: StarredMetaActions } = createActions({
	fetchStarredMeta: [],
	setStarredMeta: ['starredMeta'],
	addToStarredMeta: ['metaRecordKey'],
	removeFromStarredMeta: ['metaRecordKey'],
	addToStarredMetaSuccess: ['metaRecord'],
	removeFromStarredMetaSuccess: ['metaRecord'],
	clearStarredMeta: []
}, { prefix: 'STARRED_META/' });

export interface IStarredMetaState {
	starredMetaMap: any;
}

export const INITIAL_STATE: IStarredMetaState = {
	starredMetaMap: {}
};

const setStarredMeta = (state = INITIAL_STATE, { starredMeta }) => {
	const starredMetaMap =  starredMeta.reduce((metaMap, tag) => {
		metaMap[tag] = true;
		return metaMap;
	}, {});

	return { ...state, starredMetaMap };
};

const addToStarredMetaSuccess = (state = INITIAL_STATE, { metaRecord }) => {
	return {
		...state,
		starredMetaMap: {
			...state.starredMetaMap,
			[metaRecord]: true
		}
	};
};

const removeFromStarredMetaSuccess = (state = INITIAL_STATE, { metaRecord }) => {
	return {
		...state,
		starredMetaMap: omit(state.starredMetaMap, metaRecord)
	};
};

export const reducer = createReducer(INITIAL_STATE, {
	[StarredMetaTypes.SET_STARRED_META]: setStarredMeta,
	[StarredMetaTypes.ADD_TO_STARRED_META_SUCCESS]: addToStarredMetaSuccess,
	[StarredMetaTypes.REMOVE_FROM_STARRED_META_SUCCESS]: removeFromStarredMetaSuccess
});
