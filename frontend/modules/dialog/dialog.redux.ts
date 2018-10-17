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
import { get, omit } from 'lodash';
import { ErrorDialog } from '../../routes/components/dialogContainer/components/errorDialog/errorDialog.component';
import { ConfirmDialog } from '../../routes/components/dialogContainer/components/confirmDialog/confirmDialog.component';

export const DIALOG_TYPES = {
	ERROR: 1,
	CONFIRM_USER_REMOVE: 2,
	FEDERATION_REMINDER_DIALOG: 3,
	LOADING: 4,
	CONFIRM: 4,
	CONFIRM_DELETE_ALL_NOTIFICATIONS: 5
};

interface IDialogConfig {
	title: string;
	template?: JSX.Element;
	content?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
	data?: any;
}

export const { Types: DialogTypes, Creators: DialogActions } = createActions({
	showDialog: ['config'],
	showErrorDialog: ['method', 'dataType', 'error'],
	showConfirmDialog: ['config'],
	hideDialog: [],
	setPendingState: ['isPending']
}, { prefix: 'DIALOG_' });

export const INITIAL_STATE = {
	isOpen: false,
	isPending: false,
	config: {},
	data: null
};

export const showDialog = (state = INITIAL_STATE, action) => {
	const config = omit(action.config, 'data') as IDialogConfig;
	return { ...state, config, data: action.config.data, isOpen: true };
};

export const showErrorDialog = (state = INITIAL_STATE, { method, dataType, error } ) => {
	const config = {
		title: 'Error',
		template: ErrorDialog,
		data: {
			method,
			dataType,
			status: error.status,
			message: get(error, 'data.message', '')
		}
	};

	return showDialog(state, {config});
};

export const showConfirmDialog = (state = INITIAL_STATE, action) => {
	const config = { ...action.config, template: ConfirmDialog } as IDialogConfig;
	return showDialog(state, { config });
};

export const hideDialog = (state = INITIAL_STATE) => {
	return { ...state, isOpen: false, isPending: false };
};

export const setPendingState = (state = INITIAL_STATE, {isPending}) => {
	return { ...state, isPending };
};

export const reducer = createReducer({...INITIAL_STATE}, {
	[DialogTypes.HIDE_DIALOG]: hideDialog,
	[DialogTypes.SHOW_DIALOG]: showDialog,
	[DialogTypes.SHOW_ERROR_DIALOG]: showErrorDialog,
	[DialogTypes.SHOW_CONFIRM_DIALOG]: showConfirmDialog,
	[DialogTypes.SET_PENDING_STATE]: setPendingState
});
