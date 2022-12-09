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
import { FC } from 'react';
import { Button, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import WarningIcon from '@assets/icons/outlined/warning-outlined.svg';
import { FormattedMessage } from 'react-intl';
import { DialogContainer, Actions, Details, Status } from '@/v5/ui/components/shared/modals/modals.styles';
import { AxiosError } from 'axios';
import { getErrorCode, getErrorMessage, getErrorStatus } from '@/v5/validation/errors.helpers';

interface IAlertModal {
	onClickClose?: () => void,
	currentActions?: string
	error: AxiosError;
	details?: string
}

export const AlertModal: FC<IAlertModal> = ({ onClickClose, currentActions = '', error, details }) => {
	const message = getErrorMessage(error);
	const code = getErrorCode(error);
	const status = getErrorStatus(error);
	const errorStatus = status && code ? `${status} - ${code}` : '';

	return (
		<DialogContainer>
			<WarningIcon />
			<DialogTitle>
				<FormattedMessage
					id="alertModal.header"
					defaultMessage="Something went wrong when {currentActions}"
					values={{ currentActions }}
				/>
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{message}
				</DialogContentText>
				{!!status && <Status>{errorStatus}</Status>}
			</DialogContent>
			<Actions>
				<Button autoFocus type="submit" onClick={onClickClose} variant="contained" color="primary">
					<FormattedMessage
						id="alertModal.action.ok"
						defaultMessage="Ok, close window"
					/>
				</Button>
				<Button href="https://3drepo.com/contact/" variant="outlined" color="secondary">
					<FormattedMessage
						id="alertModal.action.contactSupport"
						defaultMessage="Contact support"
					/>
				</Button>
			</Actions>
			{details && <Details>{details}</Details>}
		</DialogContainer>
	);
};
