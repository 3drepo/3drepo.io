/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { produceAll } from '@/v5/helpers/reducers.helper';
import { getErrorCode, isPathNotFound } from '@/v5/validation/errors.helpers';
import { Action } from 'redux';
import { createActions, createReducer } from 'reduxsauce';
import uuid from 'uuidv4';

import { Constants } from '../../helpers/actions.helper';

export const INITIAL_STATE: IDialogState = {
	dialogs: [],
};

export const { Types: DialogsTypes, Creators: DialogsActions } = createActions({
	open: ['modalType', 'props'],
	close: ['dialogId'],
}, { prefix: 'MODALS/' }) as { Types: Constants<IDialogsActionCreators>; Creators: IDialogsActionCreators };

export const openHandler = (state, { modalType, props }: OpenAction) => {
	// avoid opening 2+ redirect modals
	if (getErrorCode(props?.error)) {
		const currentErrorIsPathNotFound = isPathNotFound(props?.error);
		const pathNotFoundErrorAlreadyExists = state.dialogs.find((dialog) => isPathNotFound(dialog.props?.error));
		if (currentErrorIsPathNotFound && pathNotFoundErrorAlreadyExists) return;
	}

	const dialog = {
		id: uuid(),
		modalType,
		props,
	};

	state.dialogs = [...state.dialogs, dialog];
};

const closeHandler = (state, { dialogId }: CloseAction) => {
	state.dialogs = state.dialogs.filter(({ id }) => (id !== dialogId));
};

export const dialogsReducer = createReducer(INITIAL_STATE, produceAll({
	[DialogsTypes.OPEN]: openHandler,
	[DialogsTypes.CLOSE]: closeHandler,
}));

/**
 * Types
 */
type OpenAction = Action<'OPEN'> & { modalType: string | ((any) => JSX.Element), props: any };
type CloseAction = Action<'CLOSE'> & { dialogId: string };

export interface IDialogsActionCreators {
	open: (type?: string | ((any) => JSX.Element), props?: any) => OpenAction;
	close: (id: string) => CloseAction;
}

export interface IDialogConfig {
	id: string;
	modalType?: 'delete' | 'warning' | 'alert' | 'info' | ((any) => JSX.Element);
	props: any;
}

export interface IDialogState {
	dialogs: IDialogConfig[];
}
