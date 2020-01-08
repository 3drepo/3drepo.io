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

export const selectSequencesDomain = (state) => ({...state.sequences});

export const selectSequences = createSelector(
	selectSequencesDomain, (state) => state.sequences
);

const selectSelectedSequenceId = createSelector(
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

			if (!dict[date.valueOf()]) {
				dict[date.valueOf()] = [];
			}

			Array.prototype.push.apply(dict[date.valueOf()], currFrame.tasks);
			return dict;
		}, {});

		return sortBy(Object.keys(frames).map((key) => ({date: new Date(parseInt(key, 10)), tasks: frames[key]})), 'date');
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
				if ( frames[i].date < date && frames[i + 1].date > date) {
					frame = frames[i];
				}
			} else {
				frame = frames[lastIndex];
			}
		}

		return frame;
	}
);
