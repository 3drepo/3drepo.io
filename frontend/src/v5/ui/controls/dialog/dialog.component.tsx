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

import React from 'react';
import { Dialog as DialogContainer } from '@material-ui/core';
import { useDispatch } from 'react-redux';

import { InfoDialog } from '@/v5/ui/controls/dialog/infoDialog';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import CloseIcon from '@assets/icons/close.svg';
import { CloseButton } from './dialog.styles';

const DIALOG_TEMPLATES = {
	info: InfoDialog,
};

interface IDialog {
	id: string;
	type?: string;
}

export const Dialog: React.FC<IDialog> = ({ id, type = 'info' }) => {
	const dispatch = useDispatch();

	const handleClose = () => {
		dispatch(DialogsActions.close(id));
	};

	const DialogTemplate = DIALOG_TEMPLATES[type];

	return (
		<DialogContainer open onClose={handleClose}>
			<CloseButton aria-label="Close dialog" onClick={handleClose}>
				<CloseIcon />
			</CloseButton>
			<DialogTemplate onClose={handleClose} />
		</DialogContainer>
	);
};
