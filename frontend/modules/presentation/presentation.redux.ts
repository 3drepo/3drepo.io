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

export const { Types: PresentationTypes, Creators: PresentationActions } = createActions({
	startPresenting: [],
	stopPresenting: [],
	setPresenting: ['isPresenting', 'code'],
	setJoinPresentation: ['joinedPresentation', 'sessionCode'],
	joinPresentation: ['sessionCode'],
	leavePresentation: [],
	togglePause: [],
	setPaused: ['isPaused'],
	setLoading: ['loading'],
	streamViewpoint: [],
	reset: [],
}, { prefix: 'PRESENTATION/' });

export const INITIAL_STATE = {
	sessionCode: '',
	isPresenting: false,
	joinedPresentation: false,
	isPaused: false,
	loading: false
};

export const setPresenting = (state = INITIAL_STATE, { isPresenting, code }) => {
	if (state.isPresenting === isPresenting) {
		return state;
	}

	const sessionCode = isPresenting ? code : '';
	return { ...state, isPresenting, sessionCode };
};

export const setJoinPresentation = (state = INITIAL_STATE, { joinedPresentation, sessionCode }) => {
	if (state.joinedPresentation === joinedPresentation) {
		return state;
	}

	sessionCode = sessionCode || '';

	return { ...state, joinedPresentation, sessionCode, isPaused: false };
};

export const setPaused = (state = INITIAL_STATE, { isPaused }) => {
	if (state.isPaused === isPaused) {
		return state;
	}

	return { ...state, isPaused };
};

export const setLoading = (state = INITIAL_STATE, { loading }) => {
	return { ...state, loading };
};

export const reducer = createReducer(INITIAL_STATE, {
	[PresentationTypes.SET_PRESENTING]: setPresenting,
	[PresentationTypes.SET_JOIN_PRESENTATION]: setJoinPresentation,
	[PresentationTypes.SET_PAUSED]: setPaused,
	[PresentationTypes.SET_LOADING]: setLoading
});
