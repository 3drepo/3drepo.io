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

import { omit } from 'lodash';
import { createActions, createReducer } from 'reduxsauce';

export const { Types: StarredTypes, Creators: StarredActions } = createActions({
	fetchStarredMeta: [],
	setStarredMeta: ['records'],
	addToStarredMeta: ['recordKey'],
	removeFromStarredMeta: ['recordKey'],
	addToStarredMetaSuccess: ['recordKey'],
	removeFromStarredMetaSuccess: ['recordKey'],
	clearStarredMeta: [],

	fetchStarredModels: [],
	setStarredModels: ['records'],
	addToStarredModels: ['modelData'],
	removeFromStarredModels: ['modelData'],
	addToStarredModelsSuccess: ['recordKey'],
	removeFromStarredModelsSuccess: ['recordKey']
}, { prefix: 'STARRED/' });

export interface IStarredState {
	starredMetaMap: any;
	starredModelsMap: any;
}

export const INITIAL_STATE: IStarredState = {
	starredMetaMap: {},
	starredModelsMap: {}
};

const addToStarred = (type) => (state = INITIAL_STATE, { recordKey }) => {
	return {
		...state,
		[type]: {
			...state[type],
			[recordKey]: true
		}
	};
};

const setStarred = (type) => (state = INITIAL_STATE, { records }) => {
	const starredRecords = records.reduce((metaMap, tag) => {
		metaMap[tag] = true;
		return metaMap;
	}, {});

	return { ...state, [type]: starredRecords };
};

const removeFromStarred = (type) => (state = INITIAL_STATE, { recordKey }) => {
	return {
		...state,
		[type]: omit(state[type], recordKey)
	};
};

const setStarredMeta = setStarred('starredMetaMap');
const addToStarredMetaSuccess = addToStarred('starredMetaMap');
const removeFromStarredMetaSuccess = removeFromStarred('starredMetaMap');

const setStarredModels = setStarred('starredModelsMap');
const addToStarredModelsSuccess = addToStarred('starredModelsMap');
const removeFromStarredModelsSuccess = removeFromStarred('starredModelsMap');

export const reducer = createReducer(INITIAL_STATE, {
	[StarredTypes.SET_STARRED_META]: setStarredMeta,
	[StarredTypes.ADD_TO_STARRED_META_SUCCESS]: addToStarredMetaSuccess,
	[StarredTypes.REMOVE_FROM_STARRED_META_SUCCESS]: removeFromStarredMetaSuccess,
	[StarredTypes.SET_STARRED_MODELS]: setStarredModels,
	[StarredTypes.ADD_TO_STARRED_MODELS_SUCCESS]: addToStarredModelsSuccess,
	[StarredTypes.REMOVE_FROM_STARRED_MODELS_SUCCESS]: removeFromStarredModelsSuccess
});
