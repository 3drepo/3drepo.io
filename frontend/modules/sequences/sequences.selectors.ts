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

import { merge, omit, sortBy } from 'lodash';
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

		return sequence.frames;
	}
);

export const selectMinDate = createSelector(
	selectSelectedFrames, (frames) => frames.length ? frames[0].dateTime : null
);

export const selectMaxDate = createSelector(
	selectSelectedFrames, (frames) => frames.length ? frames[frames.length - 1].dateTime : null
);

export const selectSelectedDate = createSelector(
	selectSequencesDomain, selectMinDate, (state, minDate) => {
		let date = state.selectedDate || minDate;

		if (!date) {
			return null;
		}

		date = new Date(date);
		date.setHours(23, 59, 29, 999);

		return date;
	}
);

export const selectStepInterval = createSelector(
	selectSequencesDomain, (state) => state.stepInterval
);

export const selectStepScale = createSelector(
	selectSequencesDomain, (state) => state.stepScale
);

const getFrameIndexByDate = (frames, date) => {
	let index = 0;

	for (let i = frames.length - 1 ; i >= 0 && index === 0; i--) {
		if (frames[i].dateTime <= date) {
			index = i;
		}
	}

	return index;
};

export const selectSelectedFrame = createSelector(
	selectSelectedFrames, selectSelectedDate, (frames, date) => {
		date = new Date(date);
		date.setHours(23, 59, 59, 999);

		const index = getFrameIndexByDate(frames, date);
		return frames[index];
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

const tasksArrToDict = (tasks) => {
	return tasks.reduce((dict , task) => {
		if (!dict[task._id]) {
			dict[task._id] = omit(task, 'tasks');
		}

		if (task.tasks && !dict[task._id].tasks) {
			dict[task._id].tasks =  tasksArrToDict(task.tasks);
		} else if (task.tasks && dict[task._id].tasks) {
			dict[task._id].tasks = merge(dict[task._id].tasks, tasksArrToDict(task.tasks));
		}

		return dict;
	}, {});
};

const tasksDictToArr = (taskDict) => {
	return Object.keys(taskDict).map((id) => {
		const task = taskDict[id];
		if (task.tasks) {
			task.tasks = tasksDictToArr(task.tasks);
		}
		return task;
	});
};

const mergeTasks = (tasks) => {
	return tasksDictToArr(tasksArrToDict(tasks));
};

// Filters the tasks by range as well as it subtasks
const getTasksByRange = (tasks, minDate, maxDate) => {
	return tasks.reduce((filteredTasks, task) => {
			if (! (task.startDate > maxDate || task.endDate < minDate)) {
				task = {...task};
				if ( task.tasks ) {
					task.tasks = getTasksByRange(task.tasks, minDate, maxDate);
				}

				filteredTasks.push(task);
			}

			return filteredTasks;
		}, []);
};

const replaceDates = (tasks) => {
	return tasks.map((t) => {
		t.startDate = new Date(t.startDate);
		t.endDate = new Date(t.endDate);
		if (t.tasks) {
			t.tasks = replaceDates(t.tasks);
		}

		return t;
	});
};

export const selectSelectedMinDate = createSelector(
	selectSelectedDate, selectStepInterval, selectStepScale,
		(date: Date, stepInterval: number, stepScale: STEP_SCALE) => {
			if (!date) {
				return null;
			}
			date = new Date(date);
			date.setHours(0, 0, 0, 0);

			if (stepScale === STEP_SCALE.DAY) {
				date = new Date(date.valueOf()  - MILLI_PER_DAY * (stepInterval - 1));
			}

			if (stepScale === STEP_SCALE.MONTH) {
				date.setMonth(date.getMonth() - stepInterval);
			}

			if (stepScale === STEP_SCALE.MONTH) {
				date.setMonth(date.getMonth() - stepInterval);
			}

			if (stepScale === STEP_SCALE.YEAR) {
				date.setFullYear(date.getFullYear() - stepInterval);
			}

			return date;
		}
);

export const selectCurrentActivities = createSelector(
	selectSelectedMinDate, selectSelectedDate, selectSelectedSequence,
		(minSelectedDate: Date, maxSelectedDate: Date, selectedSequence: any) => {
			if (!selectedSequence || !selectedSequence.frames) {
				return [];
			}

			const frames = selectedSequence.frames;
			const minIndex = getFrameIndexByDate(frames, minSelectedDate);
			const maxIndex = getFrameIndexByDate(frames, maxSelectedDate);
			const candidatesTasks = [];

			for (let i = minIndex; i <= maxIndex ; i++) {
				let foundTasks =  frames[i].tasks;
				if (minIndex === i) { // this means is the first tasks I found so they might need to be trimmed
					foundTasks =  getTasksByRange(foundTasks, minSelectedDate, maxSelectedDate);
				}

				Array.prototype.push.apply(candidatesTasks, foundTasks);
			}

			if (maxIndex < frames.length - 1 ) {
				const nextTasks = getTasksByRange(frames[maxIndex + 1].tasks, minSelectedDate, maxSelectedDate);
				Array.prototype.push.apply(candidatesTasks, nextTasks);
			}

			return replaceDates(mergeTasks(candidatesTasks));
		}
);
