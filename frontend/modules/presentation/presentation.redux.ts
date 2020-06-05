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

const generateCode = () => {
	let code = '';
	for (let i = 0; i < 5; i++) {
		let val = Math.round(Math.random() * 51);

		if (val > 25) {
			val += 6;
		}

		code += String.fromCharCode(val + 65);
	}

	return code;
};

export const { Types: PresentationTypes, Creators: PresentationActions } = createActions({
	startPresenting: [],
	stopPresenting: [],
	setPresenting: ['isPresenting'],
}, { prefix: 'PRESENTATION/' });

export const INITIAL_STATE = {
	sessionCode: '',
	isPresenting: false,
	joinedPresentation: false
};

export const setPresenting = (state = INITIAL_STATE, { isPresenting }) => {
	if (state.isPresenting === isPresenting) {
		return state;
	}

	const sessionCode = isPresenting ? generateCode() : '';
	return { ...state, isPresenting, sessionCode };
};

export const reducer = createReducer(INITIAL_STATE, {
	[PresentationTypes.SET_PRESENTING]: setPresenting,
});
