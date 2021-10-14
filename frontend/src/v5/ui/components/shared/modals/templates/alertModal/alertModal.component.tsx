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
import { Button, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import WarningIcon from '@assets/icons/warning.svg';
import { Container, Line, Actions, Details } from './alertModal.styles';

interface IAlertModal {
	onClickClose?: () => void,
	currentActions?: string
	errorMessage?: {
		message: string;
	};
	details?: string
}

export const AlertModal: React.FC<IAlertModal> = ({ onClickClose, currentActions = '', errorMessage, details }) => (
	<Container>
		<WarningIcon />
		<DialogTitle>
			Something went wrong {currentActions}
		</DialogTitle>
		<DialogContent>
			<DialogContentText>
				{errorMessage.message || errorMessage}
			</DialogContentText>
		</DialogContent>
		<Line />
		<Actions>
			<Button autoFocus type="submit" onClick={onClickClose} variant="contained" color="primary" size="small">
				Ok, close window
			</Button>
			<Button href="https://3drepo.com/contact/" variant="outlined" color="secondary" size="small">
				Contact support
			</Button>
		</Actions>
		{details && <Details>{details}</Details>}
	</Container>
);
