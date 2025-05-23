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
import { errorNeedsRedirecting, getErrorCode, isNotAuthed, isRequestAborted } from '@/v5/validation/errors.helpers';
import { Action } from 'redux';
import { createActions, createReducer } from 'reduxsauce';
import uuid from 'uuidv4';

import { Constants } from '../../helpers/actions.helper';
import { AuthenticatingModal } from '@components/shared/modalsDispatcher/templates/infoModal/authenticatingModal/authenticatingModal.component';
import { ExtractModalProps, FunctionComponent, IDialogState, ModalType } from './dialogs.types';

export const INITIAL_STATE: IDialogState = {
	dialogs: [],
};

export const { Types: DialogsTypes, Creators: DialogsActions } = createActions({
	open: ['modalType', 'props', 'syncProps'],
	close: ['dialogId'],
	closeAll: [],
}, { prefix: 'MODALS/' }) as { Types: Constants<IDialogsActionCreators>; Creators: IDialogsActionCreators };

export const openHandler = (state, { modalType, props, syncProps }: OpenAction) => {
	const errorCode = getErrorCode(props?.error);
	if (errorCode || isRequestAborted(props?.error)) {
		// avoid other modals when authenticating
		const authModalIsAlreadyOpen = state.dialogs.find((dialog) => (
			dialog.modalType === AuthenticatingModal || isNotAuthed(dialog.props?.error)
		));
		if (authModalIsAlreadyOpen) return;
	}
	if (errorCode) {
		// avoid opening 2+ redirect modals
		const needsRedirecting = errorNeedsRedirecting(props?.error);
		const redirectModalIsAlreadyOpen = state.dialogs.find((dialog) => errorNeedsRedirecting(dialog.props?.error));
		if (needsRedirecting && redirectModalIsAlreadyOpen) return;
	}

	const dialog = {
		id: uuid(),
		modalType,
		props,
		syncProps,
	};

	state.dialogs = [...state.dialogs, dialog];
};

const closeHandler = (state, { dialogId }: CloseAction) => {
	state.dialogs = state.dialogs.filter(({ id }) => (id !== dialogId));
};

const closeAll = (state) => {
	state.dialogs = [];
};

export const dialogsReducer = createReducer(INITIAL_STATE, produceAll({
	[DialogsTypes.OPEN]: openHandler,
	[DialogsTypes.CLOSE]: closeHandler,
	[DialogsTypes.CLOSE_ALL]: closeAll,
}));

/**
 * Types
 */
type OpenAction = Action<'OPEN'> & { modalType: string | ((any) => JSX.Element), props: any, syncProps: any };
type CloseAction = Action<'CLOSE'> & { dialogId: string };
type CloseAllAction = Action<'CLOSE_ALL'>;

export interface IDialogsActionCreators {
	open: <T extends ModalType | FunctionComponent>
	(modalType?: T, props?: ExtractModalProps<T> | undefined, syncProps?: any | undefined) => OpenAction;
	close: (id: string) => CloseAction;
	closeAll: () => CloseAllAction;
}
