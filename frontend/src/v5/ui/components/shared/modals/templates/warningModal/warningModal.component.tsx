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
import WarningIcon from '@assets/icons/warning.svg';
import { FormattedMessage } from 'react-intl';
import { Container, Actions } from '@/v5/ui/components/shared/modals/modals.styles';

interface IWarningModal {
	message: string;
	onClickClose: () =>void;
}

export const WarningModal = ({ message, onClickClose }: IWarningModal) => (
	<Container>
		<WarningIcon />
		<DialogTitle>
			<FormattedMessage
				id="warningModal.header"
				defaultMessage="Warning!"
			/>
		</DialogTitle>
		<DialogContent>
			<DialogContentText>
				{ message }
			</DialogContentText>
		</DialogContent>
		<Actions>
			<Button autoFocus variant="contained" color="primary" onClick={onClickClose}>
				<FormattedMessage
					id="alertModal.action.ok"
					defaultMessage="Ok, close window"
				/>
			</Button>
		</Actions>
	</Container>
);
