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

import { createActions, createReducer } from 'reduxsauce';
import { STEP_SCALE } from '../../constants/sequences';
import { sortByField } from '../../helpers/sorting';

export const { Types: SequencesTypes, Creators: SequencesActions } = createActions({
	fetchSequence: ['sequenceId'],
	fetchSequenceList: [],
	initializeSequences: [],
	fetchSequenceSuccess: ['sequence'],
	fetchSequenceListSuccess: ['sequences'],
	setSelectedSequence: ['sequenceId'],
	setSelectedSequenceSuccess: ['sequenceId'],
	setSelectedDate: ['date'],
	setSelectedDateSuccess: ['date'],
	setLastSelectedDateSuccess: ['date'],
	fetchFrame: ['date'],
	fetchSelectedFrame: [],
	setStateDefinition: ['stateId', 'stateDefinition'],
	setStepInterval: ['stepInterval'],
	setStepScale: ['stepScale'],
	fetchActivitiesDefinitions: ['sequenceId'],
	fetchActivitiesDefinitionsSuccess: ['sequenceId', 'activities'],
	showSequenceDate: ['date'],
	handleTransparenciesVisibility: ['transparencies'],
	restoreModelDefaultVisibility: [],

	reset: []
}, { prefix: 'SEQUENCES/' });

export const INITIAL_STATE = {
	sequences: null,
	selectedSequence: null,
	lastSelectedSequence: null,
	selectedDate: null,
	lastSelectedDate: null,
	stateDefinitions: {},
	statesPending: false,
	stepInterval: 1,
	stepScale: STEP_SCALE.DAY,
	hiddenGeometryVisible: true,
	activities: {}
};

export const fetchSequenceSuccess = (state = INITIAL_STATE, { sequence }) => {
	if (state.sequences && state.sequences.length > 0) {
		const sequenceIndex = state.sequences.findIndex(s => s._id === sequence._id);

		if (sequenceIndex >= 0) {
			state.sequences[sequenceIndex] = sequence;
		}
	} else {
		state.sequences = [ sequence ];
	}

	return { ...state };
};

export const fetchSequenceListSuccess = (state = INITIAL_STATE, { sequences }) => {
	sequences = sortByField([...sequences], { order: 'asc', config: { field: '_id' } });
	return { ...state, sequences };
};

export const fetchActivitiesDefinitionsSuccess = (state = INITIAL_STATE, { sequenceId, activities }) => {
	return { ...state, activities: {...state.activities, [sequenceId]: activities } };
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

export const setSelectedDateSuccess =  (state = INITIAL_STATE, { date }) => {
	return {...state, selectedDate: date };
};

export const setLastSelectedDateSuccess =  (state = INITIAL_STATE, { date }) => {
	return {...state, lastSelectedDate: date};
};

export const setStateDefinition = (state = INITIAL_STATE, { stateId, stateDefinition}) => {
	return {...state, stateDefinitions: {...state.stateDefinitions, [stateId]: stateDefinition}};
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
	[SequencesTypes.FETCH_ACTIVITIES_DEFINITIONS_SUCCESS]: fetchActivitiesDefinitionsSuccess,
	[SequencesTypes.SET_SELECTED_DATE_SUCCESS]: setSelectedDateSuccess,
	[SequencesTypes.SET_LAST_SELECTED_DATE_SUCCESS]: setLastSelectedDateSuccess,
	[SequencesTypes.SET_STATE_DEFINITION]: setStateDefinition,
	[SequencesTypes.SET_SELECTED_SEQUENCE_SUCCESS]: setSelectedSequenceSuccess,
	[SequencesTypes.SET_STEP_INTERVAL]: setStepInterval,
	[SequencesTypes.SET_STEP_SCALE]: setStepScale,
	[SequencesTypes.RESET]: reset
});
