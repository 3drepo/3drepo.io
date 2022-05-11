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
import { V5ModalContainer } from '../dialog.styles';

interface V5RedirectToTeamspaceDialogProps {
	content?: string;
	message: string;
	status: string;
	handleResolve: () => void;
}

export const V5RedirectToTeamspaceDialog = ({
	content,
	message,
	status,
	handleResolve,
}: V5RedirectToTeamspaceDialogProps) => (
	<V5ModalContainer>
		<WarningIcon />
		<CloseButton type="submit" onClick={handleResolve}>
			<CloseIcon />
		</CloseButton>
		<DialogTitle>{content}</DialogTitle>
		<DialogContent>
			<DialogContentText>{message}</DialogContentText>
			{!!status && <Status>{status}</Status>}
		</DialogContent>
		<Actions bottomMargin>
			<Button autoFocus type="submit" onClick={handleResolve} variant="contained" color="primary">
				<FormattedMessage
					id="backToTeamspaceDialog.action.ok"
					defaultMessage="Back to teamspace"
				/>
			</Button>
			<Button href="https://3drepo.com/contact/" variant="outlined" color="secondary">
				<FormattedMessage
					id="backToTeamspaceDialog.action.contactSupport"
					defaultMessage="Contact support"
				/>
			</Button>
		</Actions>
	</V5ModalContainer>
);
