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

import { createActions, createReducer } from 'reduxsauce';
import uuid from 'uuidv4';

import { Constants } from '../common/actions.helper';

interface IDialogActions {
	open: (type?: string) => void;
	close: (id: string) => void;
}

interface IDialogConfig {
	id: string;
	type?: 'error' | 'info';
}

interface IDialogState {
	dialogs: IDialogConfig[];
}

export const INITIAL_STATE: IDialogState = {
	dialogs: [],
};

export const { Types: DialogsTypes, Creators: DialogsActions } = createActions({
	open: ['config'],
	close: ['id'],
}, { prefix: 'DIALOGS/' }) as { Types: Constants<IDialogActions>; Creators: IDialogActions };

export const openHandler = (state = INITIAL_STATE, { config }): IDialogState => {
	const dialog = {
		id: uuid(),
		...config,
	};

	const dialogs = [...state.dialogs, dialog];
	return { ...state, dialogs };
};

export const closeHandler = (state = INITIAL_STATE, { dialogId }): IDialogState => {
	const dialogs = dialogId ? state.dialogs.filter(({ id }) => (id !== dialogId)) : [];
	return { ...state, dialogs };
};

export const reducer = createReducer(INITIAL_STATE, {
	[DialogsTypes.OPEN]: openHandler,
	[DialogsTypes.CLOSE]: closeHandler,
});
