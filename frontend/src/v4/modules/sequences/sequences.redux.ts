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

import { isEmpty } from 'lodash';
import { createActions, createReducer } from 'reduxsauce';
import { produceAll } from '@/v5/helpers/reducers.helper';
import { STEP_SCALE } from '../../constants/sequences';
import { sortByField } from '../../helpers/sorting';

export const { Types: SequencesTypes, Creators: SequencesActions } = createActions({
	fetchSequence: ['sequenceId'],
	fetchSequenceList: [],
	fetchSequenceSuccess: ['sequence'],
	fetchSequenceListSuccess: ['sequences'],
	updateSequence: ['sequenceId', 'newName'],
	updateSequenceSuccess: ['sequenceId', 'newName'],
	setSelectedSequence: ['sequenceId'],
	setSelectedSequenceSuccess: ['sequenceId'],
	setSelectedDate: ['date'],
	setSelectedDateSuccess: ['date'],
	setOpenOnTodaySuccess: ['openOnToday'],
	fetchFrame: ['date'],
	prefetchFrames: [],
	updateFrameWithViewpoint: ['sequenceId', 'stateId', 'dateTime', 'viewpoint'],
	setStepInterval: ['stepInterval'],
	setStepScale: ['stepScale'],
	fetchActivitiesDefinitions: ['sequenceId'],
	fetchActivitiesDefinitionsSuccess: ['sequenceId', 'activities'],
	setActivitiesPending: ['isPending'],
	showSequenceDate: ['date'],
	restoreModelDefaultVisibility: [],
	reset: []
}, { prefix: 'SEQUENCES/' });

interface ISequence {
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
	sequences: null | ISequence[];
	selectedSequence: null | string;
	lastSelectedSequence: null | string;
	selectedDate: null | Date;
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
	stepInterval: 1,
	stepScale: STEP_SCALE.DAY,
	hiddenGeometryVisible: true,
	activities: {},
	activitiesPending: true,
	openOnToday: true,
};

export const fetchSequenceSuccess = (state, { sequence }) => {
	let sequences = state.sequences;
	if (sequences && sequences.length > 0) {
		const sequenceIndex = sequences.findIndex((s) => s._id === sequence._id);

		if (sequenceIndex >= 0) {
			sequences[sequenceIndex] = sequence;
		}
	} else {
		sequences = [sequence];
	}

	state.sequences = sequences;
};

export const fetchSequenceListSuccess = (state, { sequences }) => {
	state.sequences = sortByField([...sequences], { order: 'asc', config: { field: '_id' } });
};

export const updateSequenceSuccess = (state, { sequenceId, newName }) => {
	const sequenceToUpdate = state.sequences.find((sequence) => sequence._id === sequenceId);
	sequenceToUpdate.name = newName;
};

export const fetchActivitiesDefinitionsSuccess = (state, { sequenceId, activities }) => {
	state.activities[sequenceId] = activities;
};

export const setActivitiesPending = (state, { isPending }) => {
	state.activitiesPending = isPending;
};

export const setSelectedSequenceSuccess = (state, { sequenceId }) => {
	let lastSelectedSequence = state.lastSelectedSequence;

	if (sequenceId !== null && state.lastSelectedSequence !== sequenceId) {
		state.selectedDate = null;
		state.stepInterval = 1;
		state.stepScale = STEP_SCALE.DAY;
		lastSelectedSequence = sequenceId;
	}

	state.selectedSequence =  sequenceId;
	state.lastSelectedSequence =  lastSelectedSequence;
};

export const setOpenOnTodaySuccess =  (state, { openOnToday }) => {
	state.openOnToday = openOnToday;
};

export const setSelectedDateSuccess =  (state, { date }) => {
	state.selectedDate = date;
};

export const updateFrameWithViewpoint = (state, { sequenceId, stateId, dateTime, viewpoint }) => {
	if (isEmpty(viewpoint)) {
		return;
	}
	const sequenceToUpdate = state.sequences.find(({ _id }) => _id === sequenceId);
	const frameToUpdate = sequenceToUpdate.frames.find((frame) =>
		frame.state === stateId || (!stateId && frame.dateTime === dateTime)
	);

	if (!frameToUpdate) {
		// If two successive dates correspond to the same frame updateFrameViewpoint can get called for a frame that has already been converted
		return;
	}
	Object.assign(frameToUpdate, viewpoint);
	delete frameToUpdate.state;
};

export const setStepInterval = (state, { stepInterval }) => {
	state.stepInterval = stepInterval;
};

export const setStepScale = (state, { stepScale }) => {
	state.stepScale = stepScale;
};

export const reset = () => ({...INITIAL_STATE});

export const reducer = createReducer(INITIAL_STATE, produceAll({
	[SequencesTypes.FETCH_SEQUENCE_SUCCESS]: fetchSequenceSuccess,
	[SequencesTypes.FETCH_SEQUENCE_LIST_SUCCESS]: fetchSequenceListSuccess,
	[SequencesTypes.UPDATE_SEQUENCE_SUCCESS]: updateSequenceSuccess,
	[SequencesTypes.FETCH_ACTIVITIES_DEFINITIONS_SUCCESS]: fetchActivitiesDefinitionsSuccess,
	[SequencesTypes.SET_ACTIVITIES_PENDING]: setActivitiesPending,
	[SequencesTypes.SET_OPEN_ON_TODAY_SUCCESS]: setOpenOnTodaySuccess,
	[SequencesTypes.SET_SELECTED_DATE_SUCCESS]: setSelectedDateSuccess,
	[SequencesTypes.UPDATE_FRAME_WITH_VIEWPOINT]: updateFrameWithViewpoint,
	[SequencesTypes.SET_SELECTED_SEQUENCE_SUCCESS]: setSelectedSequenceSuccess,
	[SequencesTypes.SET_STEP_INTERVAL]: setStepInterval,
	[SequencesTypes.SET_STEP_SCALE]: setStepScale,
	[SequencesTypes.RESET]: reset
}));