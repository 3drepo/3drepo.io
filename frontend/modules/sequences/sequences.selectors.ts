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

import { createSelector } from 'reselect';
import { GLToHexColor } from '../../helpers/colors';
import { selectSettings } from '../model';
import { getDateByStep, getSelectedFrame } from './sequences.helper';

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

export const selectActivitiesDefinitions = createSelector(
	selectSequencesDomain, selectSelectedSequenceId, (state, sequenceId) => (state.activities || {}) [sequenceId]
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

const selectSelectedDate = createSelector(
	selectSequencesDomain, (state) => state.selectedDate
);

export const selectSelectedStartingDate = createSelector(
	selectSelectedDate, selectMinDate, (selectedDate, minDate) => {
		let date = selectedDate || minDate;

		if (!date) {
			return null;
		}

		date = new Date(date);
		return date;
	}
);

export const selectNextKeyFramesDates =  createSelector(
	selectSelectedStartingDate, selectStepScale, selectStepInterval , selectMaxDate,
		(startingDate, scale, interval, maxDate) => {
			const keyFrames = [];
			keyFrames[0] = new Date(Math.min(maxDate, (startingDate || new Date(0)).valueOf()));
			let date = getDateByStep(startingDate, scale, interval);
			maxDate = new Date(maxDate);

			for (let i = 0; i < 3 ; i++) {
				date = getDateByStep(date, scale, interval);
				keyFrames.push(date);
			}

			return keyFrames.filter((d) => d <= maxDate);
		}
);

export const selectSelectedEndingDate = createSelector(
	selectNextKeyFramesDates,
		(keyFrames) => {
			return  keyFrames[0];
		}
);

export const selectSelectedFrame = createSelector(
	selectFrames, selectSelectedStartingDate, getSelectedFrame
);

export const selectSelectedStateId = createSelector(
	selectSelectedFrame, (frame) =>  (frame || {}).state
);

export const selectIsLoadingFrame = createSelector(
	selectSelectedStateId, selectStateDefinitions,
		(stateId, stateDefinitions) => !(stateDefinitions || {}).hasOwnProperty(stateId)
);

export const selectSelectedState = createSelector(
	selectSelectedStateId, selectStateDefinitions,
		(stateId, stateDefinitions) => stateDefinitions[stateId]
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
	selectSelectedState, selectSelectedStartingDate, (state) => {
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

// Filters the activities by range as well as it's subtasks
const getActivitiesByRange = (activities, minDate, maxDate) => {
	return activities.reduce((filteredActivities, activity) => {
			if (! (activity.startDate > maxDate || activity.endDate < minDate)) {
				activity = {...activity};
				if ( activity.subTasks ) {
					activity.subTasks = getActivitiesByRange(activity.subTasks, minDate, maxDate);
				}

				filteredActivities.push(activity);
			}

			return filteredActivities;
		}, []);
};

const replaceDates = (activities) => {
	return activities.map((t) => {
		t.startDate = new Date(t.startDate);
		t.endDate = new Date(t.endDate);
		if (t.subTasks) {
			t.subTasks = replaceDates(t.subTasks);
		}

		return t;
	});
};

export const selectCurrentActivities = createSelector(
	selectSelectedStartingDate, selectSelectedEndingDate, selectSelectedSequence, selectActivitiesDefinitions,
		(minSelectedDate: Date, maxSelectedDate: Date, selectedSequence: any, activities: any) => {
			if (!selectedSequence || !selectedSequence.frames) {
				return [];
			}

			const foundActivities = getActivitiesByRange(activities || [], minSelectedDate, maxSelectedDate);
			return replaceDates(foundActivities);
		}
);

export const selectSelectedHiddenNodes = createSelector(
	selectSelectedFrameTransparencies, (transparencies) =>
		Object.keys(transparencies).filter((nodeId) => transparencies[nodeId] === 0 )
);
