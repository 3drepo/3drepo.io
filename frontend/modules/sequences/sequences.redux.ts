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
import { sortByField } from '../../helpers/sorting';

export const { Types: SequencesTypes, Creators: SequencesActions } = createActions({
	fetchSequences: [],
	setSequencesPending: ['isPending'],
	fetchSequencesSuccess: ['sequences'],
	setSelectedSequence: ['sequenceId'],
	setSelectedDate: ['date']
}, { prefix: 'SEQUENCES/' });

export const INITIAL_STATE = {
	sequences: [],
	sequencesPending: true,
	selectedSequence: null,
	selectedDate: null
};

export const fetchSequencesSuccess = (state = INITIAL_STATE, { sequences }) => {
	sequences = sortByField([...sequences], { order: 'asc', config: { field: '_id' } });
	return { ...state, sequences };
};

export const setSequencesPending = (state = INITIAL_STATE, { isPending }) => {
	return {...state, sequencesPending: isPending };
};

export const setSelectedSequence = (state = INITIAL_STATE, { sequenceId }) => {
	return {...state, selectedSequence: sequenceId };
};

export const setSelectedDate =  (state = INITIAL_STATE, { selectedDate }) => {
	return {...state, selectedDate };
};

export const reducer = createReducer(INITIAL_STATE, {
	[SequencesTypes.FETCH_SEQUENCES_SUCCESS]: fetchSequencesSuccess,
	[SequencesTypes.SET_SEQUENCES_PENDING]: setSequencesPending,
	[SequencesTypes.SET_SELECTED_DATE]: setSelectedDate,
	[SequencesTypes.SET_SELECTED_SEQUENCE]: setSelectedSequence
});
