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
import { ISelectedFilter } from '../../routes/components/filterPanel/filterPanel.component';

export const { Types: BimTypes, Creators: BimActions } = createActions({
	fetchMetadata: ['teamspace', 'model', 'metadataId'],
	fetchMetadataSuccess: ['metadata'],
	setIsPending: ['isPending'],
	setIsActive: ['isActive'],
	setComponentState: ['componentState'],
	setActiveMeta: ['activeMeta'],
	resetBimState: [],
	selectAllSimilar: ['rules'],
	copyRules: ['rules'],
}, { prefix: 'BIM/' });

export interface IMetaRecord {
	key: string;
	value: string | number | boolean;
}

export interface IBimComponentState {
	selectedFilters: ISelectedFilter[];
	showStarred?: boolean;
}

export interface IBimState {
	metadata: IMetaRecord[];
	activeMeta: string;
	isPending: boolean;
	isActive: boolean;
	componentState: IBimComponentState;
}

export const INITIAL_STATE: IBimState = {
	metadata: [],
	activeMeta: null,
	isActive: false,
	isPending: false,
	componentState: {
		showStarred: false,
		selectedFilters: []
	}
};

const fetchMetadataSuccess = (state = INITIAL_STATE, { metadata}) => ({ ...state, metadata });

const setIsPending = (state = INITIAL_STATE, { isPending }) => ({ ...state, isPending });

const setActiveMeta = (state = INITIAL_STATE, { activeMeta }) => {
	const updatedState =  { ...state, activeMeta };
	if (!activeMeta) {
		updatedState.metadata = [];
	}
	return updatedState;
};

const setIsActive = (state = INITIAL_STATE, { isActive }) => ({ ...state, isActive });

const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: { ...state.componentState, ...componentState } };
};

const resetBimState = () => INITIAL_STATE;

export const reducer = createReducer(INITIAL_STATE, {
	[BimTypes.FETCH_METADATA_SUCCESS]: fetchMetadataSuccess,
	[BimTypes.SET_COMPONENT_STATE]: setComponentState,
	[BimTypes.SET_IS_PENDING]: setIsPending,
	[BimTypes.SET_IS_ACTIVE]: setIsActive,
	[BimTypes.SET_ACTIVE_META]: setActiveMeta,
	[BimTypes.RESET_BIM_STATE]: resetBimState
});
