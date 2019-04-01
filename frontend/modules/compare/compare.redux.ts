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
import { COMPARE_TYPES, MODEL_TYPES, DIFF_COMPARE_TYPE, BASE_MODEL_TYPE } from '../../constants/compare';

export const { Types: CompareTypes, Creators: CompareActions } = createActions({
	setCompareType: ['compareType'],
	setModelType: ['modelType'],
	setCompareDisabled: ['isCompareDisabled'],
	setModelVisibility: ['isModelVisible'],
	getCompareModels: ['settings', 'revision'],
	setComponentState: ['componentState']
}, { prefix: 'COMPARE/' });

export interface ICompareComponentState {
	activeTab: string;
	selectedFilters: ISelectedFilter[];
	diffSelected: {};
	clashSelected: {};
}

export interface ICompareState {
	baseModels: any[];
	targetModels: any[];
	compareType: string;
	modelType: string;
	isFederation: boolean;
	isComparePending: boolean;
	isCompareDisabled: boolean;
	isModelVisible: boolean;
	componentState: ICompareComponentState;
}

export const INITIAL_STATE: ICompareState = {
	baseModels: [],
	targetModels: [],
	compareType: COMPARE_TYPES[DIFF_COMPARE_TYPE].type,
	modelType: MODEL_TYPES[BASE_MODEL_TYPE],
	isFederation: false,
	isComparePending: false,
	isCompareDisabled: false,
	isModelVisible: false,
	componentState: {
		activeTab: DIFF_COMPARE_TYPE,
		selectedFilters: [],
		diffSelected: {},
		clashSelected: {}
	}
};

const setCompareType = (state = INITIAL_STATE, {compareType}) => {
	return {...state, compareType};
};

const setModelType = (state = INITIAL_STATE, {modelType}) => {
	return {...state, modelType};
};

const setCompareDisabled = (state = INITIAL_STATE, {isCompareDisabled}) => {
	return {...state, isCompareDisabled};
};

const setModelVisibility = (state = INITIAL_STATE, {isModelVisible}) => {
	return {...state, isModelVisible};
};

export const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: { ...state.componentState, ...componentState } };
};

export const reducer = createReducer(INITIAL_STATE, {
	[CompareTypes.SET_COMPARE_TYPE] : setCompareType,
	[CompareTypes.SET_MODEL_TYPE] : setModelType,
	[CompareTypes.SET_COMPARE_DISABLED] : setCompareDisabled,
	[CompareTypes.SET_MODEL_VISIBILITY] : setModelVisibility,
	[CompareTypes.SET_COMPONENT_STATE]: setComponentState
});
