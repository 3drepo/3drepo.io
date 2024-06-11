/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { findIndex } from 'lodash';
import { createActions, createReducer } from 'reduxsauce';
import { STEP_SCALE } from '../../constants/sequences';
import { sortByField } from '../../helpers/sorting';

export const { Types: SequencesTypes, Creators: SequencesActions } = createActions({
	fetchSequence: ['sequenceId'],
	fetchSequenceList: [],
	initializeSequences: [],
	fetchSequenceSuccess: ['sequence'],
	fetchSequenceListSuccess: ['sequences'],
	updateSequence: ['sequenceId', 'newName'],
	updateSequenceSuccess: ['sequenceId', 'newName'],
	setSelectedSequence: ['sequenceId'],
	setSelectedSequenceSuccess: ['sequenceId'],
	setSelectedDate: ['date'],
	setSelectedDateSuccess: ['date'],
	setLastSelectedDateSuccess: ['date'],
	setOpenOnTodaySuccess: ['openOnToday'],
	fetchFrame: ['date'],
	prefetchFrames: [],
	setStateDefinition: ['stateId', 'stateDefinition'],
	setSelectedStateDefinition: ['stateDefinition'],
	setStepInterval: ['stepInterval'],
	setStepScale: ['stepScale'],
	fetchActivitiesDefinitions: ['sequenceId'],
	fetchActivitiesDefinitionsSuccess: ['sequenceId', 'activities'],
	setActivitiesPending: ['isPending'],
	showSequenceDate: ['date'],
	handleTransparenciesVisibility: ['transparencies'],
	restoreModelDefaultVisibility: [],
	updateSelectedStateDefinition: [],
	clearColorOverrides: [],
	clearTransformations: [],
	reset: []
}, { prefix: 'SEQUENCES/' });

export interface ISequance {
	_id: string;
	rev_id: string;
	name: string;
	frames: any[];
	teamspace: string;
	model: string;
}

type IColorDefinition = {
	value: number[],
	shared_ids: string[],
};
type ITransparencyDefinition = {
	value: number,
	shared_ids: string[],
};

export type IStateDefinitions = {
	transformation: IColorDefinition[],
	color: IColorDefinition[],
	transparency: ITransparencyDefinition[],
};

export interface ISequencesState {
	sequences: null | ISequance[];
	selectedSequence: null | string;
	lastSelectedSequence: null | string;
	selectedDate: null | Date;
	lastSelectedDate: null | Date;
	stateDefinitions: Record<string, IStateDefinitions>;
	selectedStateDefinition: Record<string, IStateDefinitions>;
	statesPending: boolean;
	stepInterval: number;
	stepScale: STEP_SCALE;
	hiddenGeometryVisible: boolean;
	activities: any;
	activitiesPending: any;
	openOnToday: boolean;
}

export const INITIAL_STATE: ISequencesState = {
	sequences: null,
	selectedSequence: null,
	lastSelectedSequence: null,
	selectedDate: null,
	lastSelectedDate: null,
	stateDefinitions: {},
	selectedStateDefinition: {},
	statesPending: false,
	stepInterval: 1,
	stepScale: STEP_SCALE.DAY,
	hiddenGeometryVisible: true,
	activities: {},
	activitiesPending: true,
	openOnToday: true,
};

export const fetchSequenceSuccess = (state = INITIAL_STATE, { sequence }) => {
	let sequences = state.sequences;
	if (sequences && sequences.length > 0) {
		const sequenceIndex = sequences.findIndex((s) => s._id === sequence._id);

		if (sequenceIndex >= 0) {
			sequences[sequenceIndex] = sequence;
		}
	} else {
		sequences = [sequence];
	}

	return { ...state, sequences };
};

export const fetchSequenceListSuccess = (state = INITIAL_STATE, { sequences }) => {
	sequences = sortByField([...sequences], { order: 'asc', config: { field: '_id' } });
	return { ...state, sequences };
};

export const updateSequenceSuccess = (state = INITIAL_STATE, { sequenceId, newName }) => {
	const sequencesList = [...state.sequences];
	const index = findIndex(state.sequences, (sequence) => sequence._id === sequenceId);
	sequencesList[index].name = newName;

	return {
		...state,
		sequences: sequencesList
	};
};

export const fetchActivitiesDefinitionsSuccess = (state = INITIAL_STATE, { sequenceId, activities }) => {
	return { ...state, activities: {...state.activities, [sequenceId]: activities } };
};

export const setActivitiesPending = (state = INITIAL_STATE, { isPending }) => {
	return {...state, activitiesPending: isPending };
};

export const setSelectedSequenceSuccess = (state = INITIAL_STATE, { sequenceId }) => {
	let lastSelectedSequence = state.lastSelectedSequence;

	if (sequenceId !== null && state.lastSelectedSequence !== sequenceId) {
		state = {...state,
			selectedDate: null,
			stepInterval: INITIAL_STATE.stepInterval,
			stepScale: INITIAL_STATE.stepScale
		};

		lastSelectedSequence = sequenceId;
	}

	return {...state, selectedSequence: sequenceId, lastSelectedSequence };
};

export const setOpenOnTodaySuccess =  (state = INITIAL_STATE, { openOnToday }) => {
	return {...state, openOnToday };
};

export const setSelectedDateSuccess =  (state = INITIAL_STATE, { date }) => {
	return {...state, selectedDate: date };
};

export const setLastSelectedDateSuccess =  (state = INITIAL_STATE, { date }) => {
	return {...state, lastSelectedDate: date};
};

export const setStateDefinition = (state = INITIAL_STATE, { stateId, stateDefinition}) => {
	return {...state, stateDefinitions: {...state.stateDefinitions, [stateId]: stateDefinition}};
};

export const setSelectedStateDefinition = (state = INITIAL_STATE, { stateDefinition }) => {
	return { ...state, selectedStateDefinition: stateDefinition };
};

export const setStepInterval = (state = INITIAL_STATE, { stepInterval }) => {
	return {...state, stepInterval};
};

export const setStepScale = (state = INITIAL_STATE, { stepScale }) => {
	return {...state, stepScale};
};

export const reset = () => {
	return {...INITIAL_STATE};
};

export const reducer = createReducer(INITIAL_STATE, {
	[SequencesTypes.FETCH_SEQUENCE_SUCCESS]: fetchSequenceSuccess,
	[SequencesTypes.FETCH_SEQUENCE_LIST_SUCCESS]: fetchSequenceListSuccess,
	[SequencesTypes.UPDATE_SEQUENCE_SUCCESS]: updateSequenceSuccess,
	[SequencesTypes.FETCH_ACTIVITIES_DEFINITIONS_SUCCESS]: fetchActivitiesDefinitionsSuccess,
	[SequencesTypes.SET_ACTIVITIES_PENDING]: setActivitiesPending,
	[SequencesTypes.SET_OPEN_ON_TODAY_SUCCESS]: setOpenOnTodaySuccess,
	[SequencesTypes.SET_SELECTED_DATE_SUCCESS]: setSelectedDateSuccess,
	[SequencesTypes.SET_LAST_SELECTED_DATE_SUCCESS]: setLastSelectedDateSuccess,
	[SequencesTypes.SET_STATE_DEFINITION]: setStateDefinition,
	[SequencesTypes.SET_SELECTED_STATE_DEFINITION]: setSelectedStateDefinition,
	[SequencesTypes.SET_SELECTED_SEQUENCE_SUCCESS]: setSelectedSequenceSuccess,
	[SequencesTypes.SET_STEP_INTERVAL]: setStepInterval,
	[SequencesTypes.SET_STEP_SCALE]: setStepScale,
	[SequencesTypes.RESET]: reset
});
