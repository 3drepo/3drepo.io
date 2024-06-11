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

import { cloneDeep } from 'lodash';
import { createActions, createReducer } from 'reduxsauce';
import { DEFAULT_SETTINGS } from '../../constants/viewer';

export const { Types: ViewerTypes, Creators: ViewerActions } = createActions({
	updateSettings: ['username', 'settings'],
	updateSettingsSuccess: ['settings'],
	fetchSettings: [],
}, { prefix: 'VIEWER_CANVAS/' });

export const INITIAL_STATE = {
	settings: {},
};

const updateSettingsSuccess = (state = INITIAL_STATE, {username,  settings }) => {
	return { ...state, settings };
};

export const reducer = createReducer(INITIAL_STATE, {
	[ViewerTypes.UPDATE_SETTINGS_SUCCESS] : updateSettingsSuccess,
});
