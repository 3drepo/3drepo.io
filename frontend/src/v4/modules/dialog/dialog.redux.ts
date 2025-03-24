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

import { DialogProps as IDialogProps } from '@mui/material/Dialog';
import { push } from 'connected-react-router';
import { generatePath } from 'react-router';
import { get, omit } from 'lodash';
import { createActions, createReducer } from 'reduxsauce';
import uuid from 'uuidv4';
import { ErrorDialog } from '@/v4/routes/components/dialogContainer/components/errorDialog/errorDialog.component';
import { ConfirmDialog } from '@/v4/routes/components/dialogContainer/components/confirmDialog/confirmDialog.component';
import { RevisionsDialog } from '@/v4/routes/components/dialogContainer/components/revisionsDialog/revisionsDialog.component';
import { NewUpdateDialog } from '@/v4/routes/components/dialogContainer/components/newUpdateDialog/newUpdateDialog.component';
import { RedirectToTeamspaceDialog } from '@/v4/routes/components/dialogContainer/components/redirectToTeamspaceDialog/redirectToTeamspaceDialog.component';
import { ROUTES } from '../../constants/routes';

export interface IDialogConfig {
	id: number;
	title: JSX.Element | string;
	template?: () => JSX.Element;
	content?: string;
	data?: any;
	logError?: string;
	DialogProps?: IDialogProps;
	buttonVariant?: 'text' | 'outlined' | 'contained';
	closeText?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
	search?: {
		enabled?: boolean;
		onOpen?: () => void;
		onClose?: () => void;
	};
}

interface IDialogState {
	dialogs: IDialogConfig[];
}

export const { Types: DialogTypes, Creators: DialogActions } = createActions({
	showDialog: ['config'],
	showEndpointErrorDialog: ['method', 'dataType', 'error'],
	showEndpointErrorDialogSuccess: ['method', 'dataType', 'error'],
	showErrorDialog: ['method', 'dataType', 'message', 'status'],
	showConfirmDialog: ['config'],
	showRevisionsDialog: ['config'],
	hideDialog: ['dialogId'],
	setPendingState: ['isPending'],
	showScreenshotDialog: ['config'],
	showNewUpdateDialog: ['config'],
	showLoggedOutDialog: [],
	showRedirectToTeamspaceDialog: ['error', 'teamspace'],
}, { prefix: 'DIALOG/' });

export const INITIAL_STATE = {
	dialogs: []
} as IDialogState;

const showDialog = (state = INITIAL_STATE, action) => {
	const config = omit(action.config, 'data') as IDialogConfig;
	const dialog = {
		id: uuid(),
		config,
		data: action.config.data,
	};

	const dialogs = [...state.dialogs, dialog];
	return { ...state, dialogs };
};

const showErrorDialog = (state = INITIAL_STATE, action) => {
	const { method, dataType, message, status } = action;
	const messageText = typeof message === 'object' && message.message ? message.message : message;

	console.debug(message);
	const config = {
		title: 'Error',
		template: ErrorDialog,
		data: {
			method,
			dataType,
			status,
			message: messageText
		}
	};

	return showDialog(state, {config});
};

const showEndpointErrorDialogSuccess = (state = INITIAL_STATE, { method, dataType, error }) => {
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
	const config = { ...action.config, template: ConfirmDialog } as IDialogConfig;
	return showDialog(state, { config });
};

const showRevisionsDialog = (state = INITIAL_STATE, action) => {
	const config = { ...action.config, template: RevisionsDialog } as IDialogConfig;
	return showDialog(state, { config });
};

const showScreenshotDialog = (state = INITIAL_STATE, action) => {
	const config = {
		title: action.config.title || 'Screenshot',
		template: action.config.template,
		onConfirm: action.config.onSave,
		onCancel: action.config.onCancel,
		data: {
			disabled: action.config.disabled,
			sourceImage: action.config.sourceImage || ''
		},
		DialogProps: {
			fullScreen: !action.config.notFullScreen,
			maxWidth: action.config.notFullScreen ? false : null,
		}
	};

	return showDialog(state, {config});
};

const showNewUpdateDialog = (state = INITIAL_STATE, action) => {
	const config = {
		title: 'Update Available',
		template: NewUpdateDialog,
		onConfirm: action.config.onConfirm
	};

	return showDialog(state, { config });
};

const hideDialog = (state = INITIAL_STATE, { dialogId }) => {
	const dialogs = dialogId ? state.dialogs.filter(({ id }) => (id !== dialogId)) : [];
	return { ...state, dialogs };
};

const showLoggedOutDialog = (state = INITIAL_STATE, action) => {
	const config = {
		title: 'Notice',
		content: 'You have been logged out because your account has signed in elsewhere',
		buttonVariant: 'raised',
		onCancel: () => {}
	};

	return showDialog(state, { config });
};

const showRedirectToTeamspaceDialog = (state = INITIAL_STATE, action) => {
	const { method, dataType, error, teamspace } = action;
	const status = get(error.response, 'status', 'Implementation error');
	const message = get(error.response, 'data.message', error.message);
	const teamspaceRoute = generatePath(ROUTES.V5_TEAMSPACE, { teamspace });
	const config = {
		title: 'Error',
		content: 'We cannot load the model due to the following:',
		template: RedirectToTeamspaceDialog,
		onCancel: () => push(teamspaceRoute),
		onConfirm: () => push(teamspaceRoute),
		data: {
			status,
			message,
		}
	};

	return showDialog(state, { config });
};

export const reducer = createReducer({...INITIAL_STATE}, {
	[DialogTypes.HIDE_DIALOG]: hideDialog,
	[DialogTypes.SHOW_DIALOG]: showDialog,
	[DialogTypes.SHOW_ERROR_DIALOG]: showErrorDialog,
	[DialogTypes.SHOW_ENDPOINT_ERROR_DIALOG_SUCCESS]: showEndpointErrorDialogSuccess,
	[DialogTypes.SHOW_CONFIRM_DIALOG]: showConfirmDialog,
	[DialogTypes.SHOW_REVISIONS_DIALOG]: showRevisionsDialog,
	[DialogTypes.SHOW_SCREENSHOT_DIALOG]: showScreenshotDialog,
	[DialogTypes.SHOW_NEW_UPDATE_DIALOG]: showNewUpdateDialog,
	[DialogTypes.SHOW_LOGGED_OUT_DIALOG]: showLoggedOutDialog,
	[DialogTypes.SHOW_REDIRECT_TO_TEAMSPACE_DIALOG]: showRedirectToTeamspaceDialog,
});
