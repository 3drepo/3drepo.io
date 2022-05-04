/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { Button, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import WarningIcon from '@assets/icons/warning.svg';
import CloseIcon from '@assets/icons/close.svg';
import { CloseButton } from '@controls/modal/modal.styles';
import { Actions, Status } from '@/v5/ui/components/shared/modals/modals.styles';
import { Container } from './alertModal.styles';

interface AlertModalProps {
	method: string;
	dataType: string;
	message: string;
	content: string;
	status: string;
	handleResolve: () => string;
}
export const AlertModal = (props: AlertModalProps) => {
	const { method, dataType, content, message, status, handleResolve } = props;

	return (
		<Container>
			<WarningIcon />
			<CloseButton type="submit" onClick={handleResolve}>
				<CloseIcon />
			</CloseButton>
			<DialogTitle>
				{method && dataType ? (
					<FormattedMessage
						id="alertModal.header"
						defaultMessage="Something went wrong trying to {method} the {dataType}"
						values={{
							method,
							dataType,
						}}
					/>
				) : (
					<FormattedMessage
						id="alertModal.header.default"
						defaultMessage="Something went wrong"
					/>
				)}
			</DialogTitle>
			<DialogContent>
				<DialogContentText>{content}</DialogContentText>
				{!!status && <Status>{status}{message && ' - ' + message}</Status>}
				
			</DialogContent>
			<Actions bottomMargin>
				<Button autoFocus type="submit" onClick={handleResolve} variant="contained" color="primary">
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
		</Container>
	);
};
