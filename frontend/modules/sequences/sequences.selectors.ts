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

import { sortBy, uniq } from 'lodash';
import { createSelector } from 'reselect';

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

		let frames =  sortBy(sequence.frames, 'dateTime');

		frames = frames.reduce((dict, currFrame) => {
			const date = new Date(currFrame.dateTime);
			date.setHours(0, 0, 0, 0);
			const timeStamp = date.valueOf();

			if (!dict[timeStamp]) {
				dict[timeStamp] = {tasks: [], states: []};
			}

			Array.prototype.push.apply(dict[timeStamp].tasks, currFrame.tasks);
			dict[timeStamp].states.push({dateTime: currFrame.dateTime, state: currFrame.state});

			return dict;
		}, {});

		frames = Object.keys(frames).map((key) => {
			const tasks = frames[key].tasks;
			const states = frames[key].states;
			const date = new Date(parseInt(key, 10));

			return { date, tasks, states };
		});

		return sortBy( frames, 'date');
	}
);

export const selectSelectedMinDate = createSelector(
	selectSelectedFrames, (frames) => frames.length ? frames[0].date : null
);

export const selectSelectedMaxDate = createSelector(
	selectSelectedFrames, (frames) => frames.length ? frames[frames.length - 1].date : null
);

export const selectSelectedDate = createSelector(
	selectSequencesDomain, selectSelectedMinDate, (state, minDate) => state.selectedDate || minDate
);

export const selectSelectedFrame = createSelector(
	selectSelectedFrames, selectSelectedDate, (frames, date) => {
		let frame = null;
		const lastIndex = frames.length - 1;

		for (let i = 0; i < lastIndex && !frame ; i++ ) {
			if (i !== lastIndex) {
				if ( frames[i].date <= date && frames[i + 1].date > date) {
					frame = frames[i];
				}
			} else {
				frame = frames[lastIndex];
			}
		}

		return frame;
	}
);

export const selectSelectedStatesIds = createSelector(
	selectSelectedFrame, (frame) => uniq(((frame || {}).states || []).map((f) => f.state))
);

export const selectStatesDefinitionsPending =  createSelector(
	selectSelectedStatesIds, selectStateDefinitions, (ids: string[], definitions) => ids.some((id) => !definitions[id])
);

const convertToDictionary = (stateChanges) => {
	return stateChanges.reduce((dict, actual) => {
		actual.shared_ids.forEach((id) => {
			dict[id] = actual.value;
		});

		return dict;
	}, {});
};

const groupByValues = (dict, equals = (a, b) => a === b ) => {
	return Object.keys(dict).reduce((values, key) => {
		const value = dict[key];

		let valuesEntry = values.find((entry) => equals(entry.value, value));

		if (!valuesEntry) {
			valuesEntry = {value, shared_ids: []};
			values.push(valuesEntry);
		}

		valuesEntry.shared_ids.push(key);

		return values;
	}, []);
};

const selectFrameStates = createSelector(
	selectSelectedFrame, selectStateDefinitions, selectStatesDefinitionsPending, (frame, stateDefinitions, pending) => {
		if (pending) {
			return [];
		}

		let statesIds = sortBy((frame || {}).states, 'dateTime');

		if (statesIds.length === 0) {
			return [];
		}

		statesIds.reverse(); // for getting the uniq to get rid of the firsts matches ins.
		statesIds = uniq(statesIds.map((f) => f.state));
		statesIds.reverse();

		return statesIds.map((id) => stateDefinitions[id]);
});

export const selectSelectedFrameTransparencies = createSelector(
	selectFrameStates, (frameStates) => {
		if (frameStates.length === 0) {
			return [];
		}

		let transparenciesDict = convertToDictionary(frameStates[0].transparency);

		frameStates.forEach(({ transparency }, index) => {
			if (index === 0 ) {
				return;
			}

			transparenciesDict = {...transparenciesDict, ...convertToDictionary(transparency)};
		});

		return groupByValues(transparenciesDict);
	}
);

export const selectSelectedFrameColors = createSelector(
	selectFrameStates, (frameStates) => {
		if (frameStates.length === 0) {
			return [];
		}

		let colorDict = convertToDictionary(frameStates[0].color);

		frameStates.forEach(({ color }, index) => {
			if (index === 0 ) {
				return;
			}

			colorDict = {...colorDict, ...convertToDictionary(color)};
		});

		return groupByValues(colorDict, (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]);
	}
);
