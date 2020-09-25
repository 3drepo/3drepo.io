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

import { merge, omit } from 'lodash';
import { createSelector } from 'reselect';
import { STEP_SCALE } from '../../constants/sequences';
import { GLToHexColor } from '../../helpers/colors';
import { MILLI_PER_DAY } from '../../helpers/dateTime';
import { selectSettings } from '../model';
import { getSelectedEndingDate, getSelectedFrame } from './sequences.helper';

export const selectSequencesDomain = (state) => (state.sequences);

const getMinMaxDates = ({frames}) => ({
	minDate: (frames[0] || {}).dateTime,
	maxDate: (frames[frames.length - 1] || {}).dateTime
});

const getModelName = (sequence, settings) => {
	let modelName = '';

	if (settings._id === sequence.model) {
		modelName = settings.name;
	} else if (settings.subModels) {
		const submodel = settings.subModels.find((model) => model.model === sequence.model);
		modelName = (submodel || {}).name || '';
	}

	return { modelName };
};

export const selectIfcSpacesHiddenSaved = createSelector(
	selectSequencesDomain, (state) => state.ifcSpacesHidden
);

export const selectSequences = createSelector(
	selectSequencesDomain, selectSettings,
		(state, settings) => !state.sequences ? null :
			state.sequences.map((sequence) =>  ({...sequence, ...getModelName(sequence, settings), ...getMinMaxDates(sequence)}))
);

export const selectInitialised = createSelector(
	selectSequences, (sequences) => sequences !== null
);

export const selectHasSequences = createSelector(
	selectSequences, (sequences) => (sequences || []).length > 0
);

export const selectStateDefinitions = createSelector(
	selectSequencesDomain, (state) => state.stateDefinitions
);

export const selectSelectedSequenceId = createSelector(
	selectSequencesDomain, (state) => state.selectedSequence
);

export const selectTasksDefinitions = createSelector(
	selectSequencesDomain, selectSelectedSequenceId, (state, sequenceId) => (state.tasks || {}) [sequenceId]
);

export const selectSelectedSequence = createSelector(
	selectSequences, selectSelectedSequenceId,
		(sequences, id) => !sequences ? null :
			sequences.find((s) => s._id === id )
);

export const selectSequenceModel = createSelector(
	selectSelectedSequence, (sequence) => (sequence || {}).model
);

export const selectFrames = createSelector(
	selectSelectedSequence, (sequence) => {
		if (!sequence) {
			return [];
		}

		return sequence.frames;
	}
);

export const selectDefaultSequence = createSelector(
	selectSequences, selectSelectedSequence, (allSequences, selectedSequence) =>
		selectedSequence || (allSequences || [])[0]
);

export const selectMinDate = createSelector(
	selectDefaultSequence, (sequence) => (sequence || {}).minDate
);

export const selectMaxDate = createSelector(
	selectDefaultSequence, (sequence) => (sequence || {}).maxDate
);

export const selectStepInterval = createSelector(
	selectSequencesDomain, (state) => state.stepInterval
);

export const selectStepScale = createSelector(
	selectSequencesDomain, (state) => state.stepScale
);

export const selectSelectedStartingDate = createSelector(
	selectSequencesDomain, selectMinDate, (state, minDate) => {
		let date = state.selectedDate || minDate;

		if (!date) {
			return null;
		}

		date = new Date(date);
		return date;
	}
);

export const selectSelectedEndingDate = createSelector(
	selectSelectedStartingDate, selectStepScale, selectStepInterval , selectMaxDate,
		(startingDate, scale, interval, maxDate) => {
			const endingDate = getSelectedEndingDate(startingDate, scale, interval);
			return  +endingDate > +maxDate ? new Date(maxDate) : endingDate;
		}
);

export const selectSelectedFrame = createSelector(
	selectFrames, selectSelectedEndingDate, getSelectedFrame
);

export const selectLastSuccessfulStateId = createSelector(
	selectSequencesDomain, (state) => state.lastSuccesfulStateId
);

export const selectSelectedStateId = createSelector(
	selectSelectedFrame, (frame) =>  (frame || {}).state
);

export const selectIsLoadingFrame = createSelector(
	selectSelectedStateId, selectStateDefinitions,
		(stateId, stateDefinitions) => !(stateDefinitions || {}).hasOwnProperty(stateId)
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

export const selectSelectedFrameTransformations = createSelector(
	selectSelectedState, (state) => {
		if (!state) {
			return {};
		}

		try {
			return  convertToDictionary(state.transformation);
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

		if (task.subTasks && !dict[task._id].subTasks) {
			dict[task._id].subTasks =  tasksArrToDict(task.subTasks);
		} else if (task.subTasks && dict[task._id].subTasks) {
			dict[task._id].subTasks = merge(dict[task._id].subTasks, tasksArrToDict(task.subTasks));
		}

		return dict;
	}, {});
};

const tasksDictToArr = (taskDict) => {
	return Object.keys(taskDict).map((id) => {
		const task = taskDict[id];
		if (task.subTasks) {
			task.subTasks = tasksDictToArr(task.subTasks);
		}
		return task;
	});
};

const mergeTasks = (tasks) => {
	return tasksDictToArr(tasksArrToDict(tasks));
};

// Filters the tasks by range as well as it's subtasks
const getTasksByRange = (tasks, minDate, maxDate) => {
	return tasks.reduce((filteredTasks, task) => {
			if (! (task.startDate > maxDate || task.endDate < minDate)) {
				task = {...task};
				if ( task.subTasks ) {
					task.subTasks = getTasksByRange(task.subTasks, minDate, maxDate);
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
		if (t.subTasks) {
			t.subTasks = replaceDates(t.subTasks);
		}

		return t;
	});
};

export const selectSelectedMinDate = createSelector(
	selectSelectedStartingDate, selectMinDate, selectStepInterval, selectStepScale,
		(date: Date, minDate: Date, stepInterval: number, stepScale: STEP_SCALE) => {
			if (!date) {
				return null;
			}
			date = new Date(date);

			if (stepScale === STEP_SCALE.DAY) {
				date = new Date(date.valueOf()  - MILLI_PER_DAY * (stepInterval - 1));
			}

			if (stepScale === STEP_SCALE.MONTH) {
				date.setMonth(date.getMonth() - stepInterval);
			}

			if (stepScale === STEP_SCALE.YEAR) {
				date.setFullYear(date.getFullYear() - stepInterval);
			}

			return date < minDate ? new Date(minDate) : date;
		}
);

export const selectCurrentActivities = createSelector(
	selectSelectedMinDate, selectSelectedStartingDate, selectSelectedSequence, selectTasksDefinitions,
		(minSelectedDate: Date, maxSelectedDate: Date, selectedSequence: any, tasks: any) => {
			if (!selectedSequence || !selectedSequence.frames) {
				return [];
			}

			const foundTasks = getTasksByRange(tasks || [], minSelectedDate, maxSelectedDate);
			return replaceDates(foundTasks);
		}
);
