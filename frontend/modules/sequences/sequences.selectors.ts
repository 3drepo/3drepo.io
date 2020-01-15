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

import { sortBy } from 'lodash';
import { createSelector } from 'reselect';
import { STEP_SCALE } from '../../constants/sequences';
import { GLToHexColor } from '../../helpers/colors';
import { MILLI_PER_DAY } from '../../helpers/dateTime';

export const selectSequencesDomain = (state) => ({...state.sequences});

export const selectSequences = createSelector(
	selectSequencesDomain, (state) => state.sequences
);

export const selectStateDefinitions = createSelector(
	selectSequencesDomain, (state) => state.stateDefinitions
);

export const selectSelectedSequenceId = createSelector(
	selectSequencesDomain, (state) => state.selectedSequence
);

export const selectSelectedSequence = createSelector(
	selectSequences, selectSelectedSequenceId, (sequences, id) => {
		const selectedSeq = sequences.filter((s) => s._id === id );
		if (selectedSeq.length === 0) {
			return null;
		}

		return selectedSeq[0];
	}
);

const selectSelectedFrames = createSelector(
	selectSelectedSequence, (sequence) => {
		if (!sequence) {
			return [];
		}

		return sortBy(sequence.frames, 'dateTime');
	}
);

export const selectSelectedMinDate = createSelector(
	selectSelectedFrames, (frames) => frames.length ? frames[0].dateTime : null
);

export const selectSelectedMaxDate = createSelector(
	selectSelectedFrames, (frames) => frames.length ? frames[frames.length - 1].dateTime : null
);

export const selectSelectedDate = createSelector(
	selectSequencesDomain, selectSelectedMinDate, (state, minDate) => state.selectedDate || minDate
);

export const selectStepInterval = createSelector(
	selectSequencesDomain, (state) => state.stepInterval
);

export const selectStepScale = createSelector(
	selectSequencesDomain, (state) => state.stepScale
);

export const selectSelectedFrame = createSelector(
	selectSelectedFrames, selectSelectedDate, (frames, date) => {
		let frame = null;
		date = new Date(date);
		date.setHours(23, 59, 59, 999);

		for (let i = frames.length - 1 ; i >= 0 && !frame; i--) {
			if (frames[i].dateTime <= date) {
				frame  = frames[i];
			}
		}

		return frame;
	}
);

export const selectLastSuccessfulStateId = createSelector(
	selectSequencesDomain, (state) => state.lastSuccesfulStateId
);

export const selectSelectedStateId = createSelector(
	selectSelectedFrame, (frame) =>  (frame || {}).state
);

export const selectSelectedState = createSelector(
	selectLastSuccessfulStateId, selectSelectedStateId, selectStateDefinitions,
		(lastStateId, stateId, stateDefinitions) => stateDefinitions[stateId] || stateDefinitions[lastStateId]
);

const convertToDictionary = (stateChanges) => {
	return stateChanges.reduce((dict, actual) => {
		actual.shared_ids.forEach((id) => {
			dict[id] = actual.value;
		});

		return dict;
	}, {});
};

export const selectSelectedFrameColors = createSelector(
	selectSelectedState, (state) => {
		if (!state) {
			return {};
		}

		try {
			const colors = state.color.map((c) => ({...c, value: GLToHexColor(c.value)}));
			return  convertToDictionary(colors);
		} catch (e) {
			return {};
		}
	}
);

export const selectSelectedFrameTransparencies = createSelector(
	selectSelectedState, (state) => {
		if (!state) {
			return {};
		}

		try {
			return  convertToDictionary(state.transparency);
		} catch (e) {
			return {};
		}
	}
);

export const selectCurrentActivities = createSelector(
	selectSelectedDate, selectStepInterval, selectStepScale, selectSelectedSequence,
		(selectedDate: Date, stepInterval: number, stepScale: STEP_SCALE, selectedSequence: any) => {
			if (!selectedSequence || !selectedSequence.frames) {
				return [];
			}

			let minSelectedDate: any = new Date(selectedDate);
			const maxSelectedDate: any = new Date(selectedDate);
			maxSelectedDate.setHours(23, 59, 29, 999);

			if (stepScale === STEP_SCALE.DAY) {
				minSelectedDate = new Date(minSelectedDate.valueOf() - MILLI_PER_DAY * stepInterval );
			}

			if (stepScale === STEP_SCALE.MONTH) {
				minSelectedDate.setMonth(minSelectedDate.getMonth() - stepInterval);
			}

			if (stepScale === STEP_SCALE.MONTH) {
				minSelectedDate.setMonth(minSelectedDate.getMonth() - stepInterval);
			}

			if (stepScale === STEP_SCALE.YEAR) {
				minSelectedDate.setFullYear(minSelectedDate.getFullYear() - stepInterval);
			}

			return selectedSequence.frames.reduce((tasks, frame) => {
				Array.prototype.push.apply(tasks, (frame.tasks.filter(
					(task) => ! (task.startDate > maxSelectedDate || task.endDate < minSelectedDate)
				)));

				return tasks;
			}, [])  ;
		}
);
