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
import { ScreenshotDialog } from '../../routes/components/screenshotDialog/screenshotDialog.component';
import * as Dialogs from '../../routes/components/dialogContainer/components';

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
	showEndpointErrorDialog: ['method', 'dataType', 'error'],
	showErrorDialog: ['method', 'dataType', 'message', 'status'],
	showConfirmDialog: ['config'],
	showRevisionsDialog: ['config'],
	hideDialog: [],
	setPendingState: ['isPending'],
	showScreenshotDialog: ['config'],
	setMuteNotifications: ['muteNotifications'],
	showNewUpdateDialog: ['config']
}, { prefix: 'DIALOG/' });

export const INITIAL_STATE = {
	isOpen: false,
	isPending: false,
	config: {},
	data: null,
	muteNotifications: false
};

const showDialog = (state = INITIAL_STATE, action) => {
	const config = omit(action.config, 'data') as IDialogConfig;
	return { ...state, config, data: action.config.data, isOpen: true };
};

const showErrorDialog = (state = INITIAL_STATE, { method, dataType, message, status }) => {
	const config = {
		title: 'Error',
		template: Dialogs.ErrorDialog,
		data: {
			method,
			dataType,
			status,
			message
		}
	};

	return showDialog(state, {config});
};

const showEndpointErrorDialog = (state = INITIAL_STATE, { method, dataType, error }) => {
	const isImplementationError = !error.response;
	if (isImplementationError) {
		console.error(error);
	}

	if (error.handled) {
		return state;
	}

	const status = get(error.response, 'status', 'Implementation error');
	const message = get(error.response, 'data.message', error.message);

	return showErrorDialog(state, { method, dataType, message, status});
};

const showConfirmDialog = (state = INITIAL_STATE, action) => {
	const config = { ...action.config, template: Dialogs.ConfirmDialog } as IDialogConfig;
	return showDialog(state, { config });
};

const showRevisionsDialog = (state = INITIAL_STATE, action) => {
	const config = { ...action.config, template: Dialogs.RevisionsDialog } as IDialogConfig;
	return showDialog(state, { config });
};

const showScreenshotDialog = (state = INITIAL_STATE, action) => {
	const config = {
		title: action.config.title || 'Screenshot',
		template: ScreenshotDialog,
		onConfirm: action.config.onSave,
		data: {
			disabled: action.config.disabled,
			sourceImage: action.config.sourceImage || ''
		},
		DialogProps: {
			fullScreen: true
		}
	};

	return showDialog(state, {config});
};

const showNewUpdateDialog = (state = INITIAL_STATE, action) => {
	const config = {
		title: 'Update Available',
		template: Dialogs.NewUpdateDialogDialog,
		onConfirm: action.config.onConfirm
	};

	return showDialog(state, { config });
};

const hideDialog = (state = INITIAL_STATE) => {
	return { ...state, isOpen: false, isPending: false };
};

const setPendingState = (state = INITIAL_STATE, {isPending}) => {
	return { ...state, isPending };
};

const setMuteNotifications = (state = INITIAL_STATE, { muteNotifications }) => {
	return { ...state, muteNotifications };
};

export const reducer = createReducer({...INITIAL_STATE}, {
	[DialogTypes.HIDE_DIALOG]: hideDialog,
	[DialogTypes.SHOW_DIALOG]: showDialog,
	[DialogTypes.SHOW_ERROR_DIALOG]: showErrorDialog,
	[DialogTypes.SHOW_ENDPOINT_ERROR_DIALOG]: showEndpointErrorDialog,
	[DialogTypes.SHOW_CONFIRM_DIALOG]: showConfirmDialog,
	[DialogTypes.SHOW_REVISIONS_DIALOG]: showRevisionsDialog,
	[DialogTypes.SET_PENDING_STATE]: setPendingState,
	[DialogTypes.SET_MUTE_NOTIFICATIONS]: setMuteNotifications,
	[DialogTypes.SHOW_SCREENSHOT_DIALOG]: showScreenshotDialog,
	[DialogTypes.SHOW_NEW_UPDATE_DIALOG]: showNewUpdateDialog
});
