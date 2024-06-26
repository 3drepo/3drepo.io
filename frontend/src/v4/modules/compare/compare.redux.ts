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

import { COMPARE_SORT_TYPES, DIFF_COMPARE_TYPE, RENDERING_TYPES } from '../../constants/compare';
import { SORT_ORDER_TYPES } from '../../constants/sorting';
import { ISelectedFilter } from '../../routes/components/filterPanel/filterPanel';

export const { Types: CompareTypes, Creators: CompareActions } = createActions({
	toggleCompare: [],
	setIsActive: ['isActive'],
	setCompareType: ['compareType'],
	setModelType: ['modelType'],
	setCompareProcessed: ['isCompareProcessed'],
	setModelVisibility: ['isModelVisible'],
	getCompareModels: ['revision'],
	setComponentState: ['componentState'],
	setComponentStateSuccess: ['componentState'],
	onRenderingTypeChange: ['renderingType'],
	getCompareModelData: ['isFederation', 'revision'],
	setSortType: ['sortType'],
	setActiveTab: ['activeTab'],
	setIsPending: ['isPending'],
	setTargetModel: ['modelId', 'isTarget', 'isTypeChange'],
	setTargetRevision: ['modelId', 'targetRevision', 'isDiff'],
	resetComponentState: [],
	resetComponentStateSuccess: [],
	stopCompare: [],
}, { prefix: 'COMPARE/' });

export interface ICompareComponentState {
	sortType: string;
	sortOrder: string;
	activeTab: string;
	selectedFilters: ISelectedFilter[];
	selectedDiffModelsMap: {};
	selectedClashModelsMap: {};
	compareModels: any[];
	renderingType: number;
	isPending: boolean;
	targetClashModels: {};
	targetDiffModels: {};
}

export interface ICompareState {
	isComparePending: boolean;
	isCompareActive: boolean;
	isCompareProcessed: boolean;
	isModelVisible: boolean;
	componentState: ICompareComponentState;
}

export const INITIAL_STATE: ICompareState = {
	isComparePending: false,
	isCompareActive: false,
	isCompareProcessed: false,
	isModelVisible: false,
	componentState: {
		sortType: COMPARE_SORT_TYPES.NAME,
		sortOrder: SORT_ORDER_TYPES.ASCENDING,
		activeTab: DIFF_COMPARE_TYPE,
		selectedFilters: [],
		renderingType: RENDERING_TYPES.COMPARE,
		selectedDiffModelsMap: {},
		selectedClashModelsMap: {},
		compareModels: [],
		isPending: true,
		targetClashModels: {},
		targetDiffModels: {}
	}
};

const setCompareType = (state = INITIAL_STATE, {compareType}) => {
	return { ...state, compareType };
};

const setModelType = (state = INITIAL_STATE, {modelType}) => {
	return { ...state, modelType };
};

const setIsActive = (state = INITIAL_STATE, { isActive }) => {
	return { ...state, isCompareActive: isActive };
};

const setIsPending = (state = INITIAL_STATE, { isPending }) => {
	return { ...state, isComparePending: isPending };
};

const setCompareProcessed = (state = INITIAL_STATE, {isCompareProcessed}) => {
	return { ...state, isCompareProcessed };
};

const setModelVisibility = (state = INITIAL_STATE, {isModelVisible}) => {
	return { ...state, isModelVisible };
};

export const setComponentStateSuccess = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: { ...state.componentState, ...componentState } };
};

export const resetComponentStateSuccess = () => INITIAL_STATE;

export const reducer = createReducer(INITIAL_STATE, {
	[CompareTypes.SET_COMPARE_TYPE] : setCompareType,
	[CompareTypes.SET_MODEL_TYPE] : setModelType,
	[CompareTypes.SET_COMPARE_PROCESSED] : setCompareProcessed,
	[CompareTypes.SET_MODEL_VISIBILITY] : setModelVisibility,
	[CompareTypes.SET_COMPONENT_STATE_SUCCESS]: setComponentStateSuccess,
	[CompareTypes.SET_IS_ACTIVE]: setIsActive,
	[CompareTypes.SET_IS_PENDING]: setIsPending,
	[CompareTypes.RESET_COMPONENT_STATE_SUCCESS]: resetComponentStateSuccess
});
