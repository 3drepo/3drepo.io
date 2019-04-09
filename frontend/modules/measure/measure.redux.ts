/**
 *  Copyright (C) 2017 3D Repo Ltd
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

export const { Types: MeasureTypes, Creators: MeasureActions } = createActions({
	activateMeasure: [],
	deactivateMeasure: [],
	setMeasureActive: ['isActive'],
	setDisabled: ['isDisabled'],
	setActiveSuccess: ['isActive'],
	setDisabledSuccess: ['isDisabled']
}, { prefix: 'MEASURE/' });

export const INITIAL_STATE = {
	isDisabled: false,
	isActive: false
};

export const setActiveSuccess = (state = INITIAL_STATE, { isActive }) => ({ ...state, isActive });

export const setDisabledSuccess = (state = INITIAL_STATE, { isDisabled }) => ({ ...state, isDisabled });

export const reducer = createReducer(INITIAL_STATE, {
	[MeasureTypes.SET_ACTIVE_SUCCESS]: setActiveSuccess,
	[MeasureTypes.SET_DISABLED_SUCCESS]: setDisabledSuccess
});
