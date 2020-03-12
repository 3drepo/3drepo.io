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
	fetchSequences: [],
	initializeSequences: [],
	fetchSequencesSuccess: ['sequences'],
	setSelectedSequence: ['sequenceId'],
	setSelectedFrame: ['date'],
	setSelectedDate: ['date'],
	fetchFrame: ['date'],
	setStateDefinition: ['stateId', 'stateDefinition'],
	setLastLoadedSuccesfullState: ['stateId'],
	setStepInterval: ['stepInterval'],
	setStepScale: ['stepScale'],
	setIfcSpacesHidden: ['ifcSpacesHidden'],
	restoreIfcSpacesHidden: [],
	reset: []
}, { prefix: 'SEQUENCES/' });

export const INITIAL_STATE = {
	sequences: null,
	selectedSequence: null,
	lastSelectedSequence: null,
	selectedDate: null,
	lastSuccesfulStateId: null,
	stateDefinitions: {},
	statesPending: false,
	stepInterval: 1,
	stepScale: STEP_SCALE.DAY,
	ifcSpacesHidden: true
};

export const fetchSequencesSuccess = (state = INITIAL_STATE, { sequences }) => {
	sequences = sortByField([...sequences], { order: 'asc', config: { field: '_id' } });
	return { ...state, sequences };
};

export const setSelectedSequence = (state = INITIAL_STATE, { sequenceId }) => {
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

export const setSelectedDate =  (state = INITIAL_STATE, { date }) => {
	return {...state, selectedDate: date};
};

export const setStateDefinition = (state = INITIAL_STATE, { stateId, stateDefinition}) => {
	return {...state, stateDefinitions: {...state.stateDefinitions, [stateId]: stateDefinition}};
};

export const setLastLoadedSuccesfullState =  (state = INITIAL_STATE, { stateId }) => {
	return {...state, lastSuccesfulStateId: stateId};
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

export const setIfcSpacesHidden = (state = INITIAL_STATE, { ifcSpacesHidden }) => {
	return {...state, ifcSpacesHidden};
};

export const reducer = createReducer(INITIAL_STATE, {
	[SequencesTypes.FETCH_SEQUENCES_SUCCESS]: fetchSequencesSuccess,
	[SequencesTypes.SET_SELECTED_DATE]: setSelectedDate,
	[SequencesTypes.SET_STATE_DEFINITION]: setStateDefinition,
	[SequencesTypes.SET_SELECTED_SEQUENCE]: setSelectedSequence,
	[SequencesTypes.SET_LAST_LOADED_SUCCESFULL_STATE]: setLastLoadedSuccesfullState,
	[SequencesTypes.SET_STEP_INTERVAL]: setStepInterval,
	[SequencesTypes.SET_IFC_SPACES_HIDDEN]: setIfcSpacesHidden,
	[SequencesTypes.SET_STEP_SCALE]: setStepScale,
	[SequencesTypes.RESET]: reset
});
