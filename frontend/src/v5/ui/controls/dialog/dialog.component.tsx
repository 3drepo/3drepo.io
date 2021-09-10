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
import { Button, Dialog as DialogContainer, DialogContent, DialogContentText, DialogTitle, DialogActions as DialogActionsContainer } from '@material-ui/core';
import { useDispatch } from 'react-redux';

import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import CloseIcon from '@assets/icons/close.svg';
import { CloseButton } from './dialog.styles';

interface IDialog {
	id: string;
	type?: string;
}

export const Dialog: React.FC<IDialog> = ({ id }) => {
	const dispatch = useDispatch();

	const handleClose = () => {
		dispatch(DialogsActions.close(id));
	};

	return (
		<DialogContainer open onClose={handleClose}>
			<CloseButton aria-label="Close dialog" onClick={handleClose}>
				<CloseIcon />
			</CloseButton>
			<DialogTitle>
				Sample dialog
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					This is only a sample dialog content.
				</DialogContentText>
			</DialogContent>
			<DialogActionsContainer>
				<Button autoFocus onClick={handleClose} variant="outlined" color="secondary">
					Cancel
				</Button>
				<Button onClick={handleClose} variant="contained" color="primary">
					OK
				</Button>
			</DialogActionsContainer>
		</DialogContainer>
	);
};
