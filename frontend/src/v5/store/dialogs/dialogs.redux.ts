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

export const openHandler = (state = INITIAL_STATE, { modalType, props }): IDialogState => {
	const dialog = {
		id: uuid(),
		modalType,
		props,
	};

	const dialogs = [...state.dialogs, dialog];
	return { ...state, dialogs };
};

export const closeHandler = (state = INITIAL_STATE, { dialogId }): IDialogState => {
	const dialogs = dialogId ? state.dialogs.filter(({ id }) => (id !== dialogId)) : [];
	return { ...state, dialogs };
};

export const dialogsReducer = createReducer(INITIAL_STATE, {
	[DialogsTypes.OPEN]: openHandler,
	[DialogsTypes.CLOSE]: closeHandler,
});

/**
 * Types
 */
type OpenAction<T> = Action<'OPEN'> & { modalType: string, props: T };
type CloseAction = Action<'CLOSE'> & { dialogId: string };

interface IDialogsActionCreators {
	open: <T>(type?: string, props?: T) => OpenAction<T>;
	close: (id: string) => CloseAction;
}

export interface IDialogConfig {
	id: string;
	modalType?: 'error' | 'info' | 'alert';
	props: any;
}

export interface IDialogState {
	dialogs: IDialogConfig[];
}
