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
import { isString } from 'lodash';
import { SnackbarProps } from '@material-ui/core/Snackbar';

export const { Types: SnackbarTypes, Creators: SnackbarActions } = createActions({
	show: ['config']
}, { prefix: 'SNACKBAR_' });

export const INITIAL_STATE = {
	snackConfig: {} as SnackbarProps,
	isOpen: false
};

export const show = (state = INITIAL_STATE, action) => {
	const parsedConfig = isString(action.config) ? {message: action.config} : action.config;
	const config = {
		...parsedConfig,
		key: (new Date()).valueOf()
	};
	return { ...state, snackConfig: config, isOpen: true };
};

export const reducer = createReducer(INITIAL_STATE, {
	[SnackbarTypes.SHOW]: show
});
